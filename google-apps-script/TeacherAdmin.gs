/** Private teacher console. Every public RPC checks the deployment owner first. */
const TEACHER_ADMIN_FIELDS = Object.freeze({
  students: ['Class', 'ClassNo', 'ChineseName', 'EnglishName', 'Status'],
  groups: ['GroupName', 'GroupType', 'AcademicYear', 'Active'],
  groupMembers: ['StudentId', 'GroupId', 'Active'],
  assignments: ['Title', 'Instructions', 'StartAt', 'DueAt', 'Status'],
  assignmentTargets: ['AssignmentId', 'TargetType', 'TargetId', 'Active'],
  assignmentItems: ['AssignmentId', 'ItemOrder', 'RequirementType', 'ResourceId', 'TargetValue', 'MinimumPercentage', 'Required', 'DirectUrl']
});

function teacherAdminPage_() {
  const authorization = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authorization.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    return page_('老師執行授權', '請由部署老師確認 Google 試算表權限，再重新開啟管理頁。', authorization.getAuthorizationUrl(), '確認 Google 權限');
  }
  assertDeploymentOwner_();
  return HtmlService.createHtmlOutputFromFile('TeacherAdminUI').setTitle('HKDSE ICT 老師管理').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function teacherAdminBootstrap() {
  assertDeploymentOwner_();
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put('teacher-console-' + token, Session.getActiveUser().getEmail().toLowerCase(), 1800);
  const spreadsheet = activeOrConfiguredSpreadsheet_();
  return {
    token, spreadsheetUrl: spreadsheet.getUrl(), studentUrl: ScriptApp.getService().getUrl(),
    tables: Object.keys(SCHOOL_SYNC_SHEETS).map(key => ({ key, name: SCHOOL_SYNC_SHEETS[key].name,
      columns: SCHOOL_SYNC_SHEETS[key].headers.filter(column => column !== 'AccountKey' && column !== 'RecentMocksJson'),
      editable: TEACHER_ADMIN_FIELDS[key] || [] })),
    lookups: teacherAdminLookups_(spreadsheet), resources: TEACHER_ADMIN_RESOURCES
  };
}

function teacherAdminRead(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  const definition = teacherAdminDefinition_(request.table);
  const spreadsheet = activeOrConfiguredSpreadsheet_();
  const rows = teacherAdminRows_(spreadsheet, request.table);
  const query = String(request.search || '').trim().toLowerCase().slice(0, 100);
  const students = teacherAdminRows_(spreadsheet, 'students');
  const studentMap = new Map(students.map(row => [String(row.StudentId), row]));
  const filtered = rows.filter(row => {
    const student = request.table === 'students' ? row : studentMap.get(String(row.StudentId));
    if (request.className && (!student || String(student.Class) !== String(request.className))) return false;
    if (request.studentId && String(row.StudentId) !== String(request.studentId)) return false;
    if (request.groupId && String(row.GroupId) !== String(request.groupId)) return false;
    if (request.assignmentId && String(row.AssignmentId) !== String(request.assignmentId)) return false;
    const allowed = definition.headers.filter(field => !['AccountKey', 'RecentMocksJson'].includes(field));
    return !query || allowed.some(field => String(row[field] || '').toLowerCase().includes(query))
      || Boolean(student && [student.ChineseName, student.EnglishName, student.Class].some(value => String(value || '').toLowerCase().includes(query)));
  });
  const size = Math.max(10, Math.min(100, Math.floor(Number(request.pageSize) || 50)));
  const page = Math.max(1, Math.min(Math.ceil(filtered.length / size) || 1, Math.floor(Number(request.page) || 1)));
  const result = filtered.slice((page - 1) * size, page * size).map(row => teacherAdminPublicRow_(request.table, row));
  return { rows: result, total: filtered.length, page, pageSize: size,
    counts: { students: students.length, activeStudents: students.filter(row => row.Status === 'ACTIVE').length,
      linkedStudents: students.filter(row => Boolean(row.AccountKey)).length,
      groups: teacherAdminRows_(spreadsheet, 'groups').filter(row => truthy_(row.Active)).length,
      assignments: teacherAdminRows_(spreadsheet, 'assignments').filter(row => ['PUBLISHED', 'ACTIVE'].includes(row.Status)).length } };
}

function teacherAdminSave(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  if (!TEACHER_ADMIN_FIELDS[request.table]) throw new Error('學習紀錄只供檢視，不可修改。');
  return teacherAdminLocked_(() => {
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const definition = teacherAdminDefinition_(request.table);
    const sheet = teacherAdminSheet_(spreadsheet, request.table);
    const rows = teacherAdminRows_(spreadsheet, request.table);
    const current = request.key ? teacherAdminCurrent_(request, rows) : null;
    const next = teacherAdminValidate_(spreadsheet, request.table, request.values || {}, current, rows);
    const keyField = definition.headers[0];
    if (!current) {
      if (request.table === 'groupMembers') next.RecordKey = next.StudentId + '|' + next.GroupId;
      else if (request.table === 'assignmentTargets') next.RecordKey = next.AssignmentId + '|' + next.TargetType + '|' + next.TargetId;
      else next[keyField] = ({ students: 'STU', groups: 'GRP', assignments: 'TASK', assignmentItems: 'ITEM' }[request.table]) + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
      if (rows.some(row => String(row[keyField]) === String(next[keyField]))) throw new Error('這個成員或對象已存在，請編輯原有紀錄。');
      if (request.table === 'students') sheet.getRange(sheet.getLastRow() + 1, 3).setNumberFormat('@');
      sheet.appendRow(definition.headers.map(field => next[field] === undefined ? '' : next[field]));
    } else {
      if (request.table === 'students') sheet.getRange(current.rowNumber, 3).setNumberFormat('@');
      TEACHER_ADMIN_FIELDS[request.table].forEach(field => sheet.getRange(current.rowNumber, definition.headers.indexOf(field) + 1).setValue(next[field]));
    }
    SpreadsheetApp.flush();
    return { message: current ? '修改已儲存。' : '新紀錄已建立。', lookups: teacherAdminLookups_(spreadsheet) };
  });
}

/** Add/reactivate members in one validated batch; never delete their learning records. */
function teacherAdminAddMembers(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const group = teacherAdminRows_(spreadsheet, 'groups').find(row => row.GroupId === request.groupId && truthy_(row.Active));
    if (!group) throw new Error('請先選擇有效群組。');
    const ids = Array.from(new Set(Array.isArray(request.studentIds) ? request.studentIds.map(String) : []));
    if (!ids.length || ids.length > 300) throw new Error('每次請選擇 1–300 名學生。');
    const students = teacherAdminRows_(spreadsheet, 'students');
    if (ids.some(id => !students.some(row => row.StudentId === id && row.Status === 'ACTIVE'))) throw new Error('所選學生不存在或已停用，請重新整理。');
    const sheet = teacherAdminSheet_(spreadsheet, 'groupMembers');
    const rows = teacherAdminRows_(spreadsheet, 'groupMembers');
    ids.forEach(id => {
      const existing = rows.find(row => row.StudentId === id && row.GroupId === request.groupId);
      if (existing) sheet.getRange(existing.rowNumber, 4).setValue(true);
      else sheet.appendRow([id + '|' + request.groupId, id, request.groupId, true]);
    });
    return { message: '已加入／重新啟用 ' + ids.length + ' 名成員。', lookups: teacherAdminLookups_(spreadsheet) };
  });
}

/** Four-column roster import: new students only. Validation finishes before any write. */
function teacherAdminImportStudents(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    if (!Array.isArray(request.rows) || !request.rows.length || request.rows.length > 300) throw new Error('每次可匯入 1–300 名學生。');
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const existing = teacherAdminRows_(spreadsheet, 'students');
    const prepared = [];
    request.rows.forEach(values => {
      const next = teacherAdminValidate_(spreadsheet, 'students', Object.assign({}, values, { Status: 'ACTIVE' }), null, existing.concat(prepared));
      next.StudentId = 'STU-' + Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase();
      prepared.push(next);
    });
    const sheet = teacherAdminSheet_(spreadsheet, 'students');
    sheet.getRange(sheet.getLastRow() + 1, 3, prepared.length, 1).setNumberFormat('@');
    sheet.getRange(sheet.getLastRow() + 1, 1, prepared.length, SCHOOL_SYNC_SHEETS.students.headers.length)
      .setValues(prepared.map(row => SCHOOL_SYNC_SHEETS.students.headers.map(field => row[field] === undefined ? '' : row[field])));
    return { message: '已匯入 ' + prepared.length + ' 名學生；啟用碼請另按「產生啟用碼」。', lookups: teacherAdminLookups_(spreadsheet) };
  });
}

function teacherAdminGenerateCodes(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => ({ message: generateActivationCodes(), lookups: teacherAdminLookups_(activeOrConfiguredSpreadsheet_()) }));
}

function teacherAdminRefresh(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => ({ message: refreshTeacherDashboard() }));
}

/** Only assignment requirements can be removed; provide short-lived, conflict-safe undo. */
function teacherAdminDeleteItem(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const row = teacherAdminCurrent_(Object.assign({}, request, { table: 'assignmentItems' }), teacherAdminRows_(spreadsheet, 'assignmentItems'));
    const assignment = teacherAdminRows_(spreadsheet, 'assignments').find(item => item.AssignmentId === row.AssignmentId);
    if (assignment && ['PUBLISHED', 'ACTIVE'].includes(assignment.Status)) throw new Error('請先將課業轉成草稿，再移除要求，避免學生完成度突然改變。');
    const undo = Utilities.getUuid().replace(/-/g, '');
    CacheService.getScriptCache().put('teacher-undo-' + undo, JSON.stringify({ token: request.token,
      values: SCHOOL_SYNC_SHEETS.assignmentItems.headers.map(field => teacherAdminScalar_(row[field])) }), 300);
    teacherAdminSheet_(spreadsheet, 'assignmentItems').deleteRow(row.rowNumber);
    return { message: '要求已移除，可在 5 分鐘內復原。', undo };
  });
}

function teacherAdminUndo(request) {
  assertDeploymentOwner_();
  teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    if (!/^[a-f0-9]{32}$/i.test(String(request.undo || ''))) throw new Error('復原代碼無效。');
    const cache = CacheService.getScriptCache();
    const stored = cache.get('teacher-undo-' + request.undo);
    if (!stored) throw new Error('復原時限已過。請以試算表版本紀錄回復。');
    const record = JSON.parse(stored);
    if (record.token !== request.token) throw new Error('只可復原本次管理連線的操作。');
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    if (teacherAdminRows_(spreadsheet, 'assignmentItems').some(row => row.ItemId === record.values[0])) throw new Error('紀錄已存在，不能重複復原。');
    const assignment = teacherAdminRows_(spreadsheet, 'assignments').find(row => row.AssignmentId === record.values[1]);
    if (!assignment) throw new Error('原課業已不存在，請先恢復課業。');
    if (['PUBLISHED', 'ACTIVE'].includes(assignment.Status)) throw new Error('請先將課業轉成草稿再復原要求。');
    teacherAdminSheet_(spreadsheet, 'assignmentItems').appendRow(record.values);
    cache.remove('teacher-undo-' + request.undo);
    return { message: '要求已復原。' };
  });
}

function teacherAdminAuthorize_(request) {
  const token = String(request && request.token || '');
  const email = Session.getActiveUser().getEmail().toLowerCase();
  if (!/^[a-f0-9]{64}$/i.test(token) || CacheService.getScriptCache().get('teacher-console-' + token) !== email) throw new Error('管理連線已過期，請重新載入此頁。');
  CacheService.getScriptCache().put('teacher-console-' + token, email, 1800);
}

function teacherAdminLocked_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function teacherAdminDefinition_(key) {
  if (!Object.prototype.hasOwnProperty.call(SCHOOL_SYNC_SHEETS, key)) throw new Error('不支援的工作表。');
  return SCHOOL_SYNC_SHEETS[key];
}

function teacherAdminSheet_(spreadsheet, key) {
  const definition = teacherAdminDefinition_(key);
  const sheet = spreadsheet.getSheetByName(definition.name);
  if (!sheet) throw new Error('工作表未初始化，請先開啟老師設定頁。');
  const headerRow = key === 'dashboard' ? 5 : 1;
  if (sheet.getRange(headerRow, 1, 1, definition.headers.length).getValues()[0].map(String).join('|') !== definition.headers.join('|')) throw new Error(definition.name + ' 欄位結構已變更，請先核對試算表。');
  return sheet;
}

function teacherAdminRows_(spreadsheet, key) {
  const sheet = teacherAdminSheet_(spreadsheet, key);
  const definition = teacherAdminDefinition_(key);
  const first = key === 'dashboard' ? 6 : 2;
  if (sheet.getLastRow() < first) return [];
  return sheet.getRange(first, 1, sheet.getLastRow() - first + 1, definition.headers.length).getValues()
    .map((values, index) => {
      const row = { rowNumber: first + index };
      definition.headers.forEach((field, column) => { row[field] = values[column]; });
      return row;
    }).filter(row => definition.headers.some(field => row[field] !== '' && row[field] !== null));
}

function teacherAdminRevision_(key, row) {
  const values = teacherAdminDefinition_(key).headers.map(field => teacherAdminScalar_(row[field]));
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify(values))).replace(/=+$/g, '');
}

function teacherAdminScalar_(value) { return value instanceof Date ? value.toISOString() : value === undefined || value === null ? '' : value; }

function teacherAdminPublicRow_(key, row) {
  const result = {};
  teacherAdminDefinition_(key).headers.forEach(field => {
    if (field !== 'AccountKey' && field !== 'RecentMocksJson') result[field] = teacherAdminScalar_(row[field]);
  });
  result._key = String(row[teacherAdminDefinition_(key).headers[0]] || '@row:' + row.rowNumber);
  if (TEACHER_ADMIN_FIELDS[key]) result._revision = teacherAdminRevision_(key, row);
  if (key === 'students') result._linked = Boolean(row.AccountKey);
  return result;
}

function teacherAdminCurrent_(request, rows) {
  const key = request.table || 'assignmentItems';
  const keyField = teacherAdminDefinition_(key).headers[0];
  const matches = rows.filter(row => String(row[keyField] || '@row:' + row.rowNumber) === String(request.key));
  if (matches.length !== 1 || teacherAdminRevision_(key, matches[0]) !== request.revision) throw new Error('紀錄已被另一個頁面修改。請重新整理後再編輯。');
  return matches[0];
}

function teacherAdminLookups_(spreadsheet) {
  return {
    students: teacherAdminRows_(spreadsheet, 'students').map(row => ({ id: String(row.StudentId), className: String(row.Class), classNo: String(row.ClassNo),
      name: String(row.ChineseName || row.EnglishName), status: row.Status, linked: Boolean(row.AccountKey) })).filter(row => row.id),
    groups: teacherAdminRows_(spreadsheet, 'groups').map(row => ({ id: String(row.GroupId), name: String(row.GroupName), active: truthy_(row.Active), year: String(row.AcademicYear) })),
    assignments: teacherAdminRows_(spreadsheet, 'assignments').map(row => ({ id: String(row.AssignmentId), name: String(row.Title), status: String(row.Status) }))
  };
}

function teacherAdminValidate_(spreadsheet, key, input, current, rows) {
  const next = Object.assign({}, current || {});
  const text = (field, max, required) => {
    const value = String(teacherAdminScalar_(input[field] === undefined ? current && current[field] || '' : input[field])).trim();
    if ((required && !value) || value.length > max || /^[=+\-@]/.test(value)) throw new Error(field + ' 未填妥、過長或包含試算表公式前綴。');
    return value;
  };
  const choice = (field, allowed, fallback) => {
    const value = String(input[field] === undefined ? current && current[field] || fallback : input[field]).toUpperCase();
    if (!allowed.includes(value)) throw new Error(field + ' 選項不正確。');
    return value;
  };
  const bool = (field, fallback) => {
    const value = input[field] === undefined ? current && current[field] !== undefined ? current[field] : fallback : input[field];
    if (typeof value !== 'boolean' && !['TRUE', 'FALSE'].includes(String(value).toUpperCase())) throw new Error(field + ' 必須為勾選值。');
    return truthy_(value);
  };
  const numeric = (field, min, max, fallback) => {
    const raw = input[field] === undefined || input[field] === '' ? current && current[field] !== undefined ? current[field] : fallback : input[field];
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(field + ' 必須介乎 ' + min + '–' + max + '。');
    return value;
  };
  const reference = (field, table) => {
    const value = text(field, 80, true);
    if (!teacherAdminRows_(spreadsheet, table).some(row => String(row[teacherAdminDefinition_(table).headers[0]]) === value)) throw new Error(field + ' 指向不存在的紀錄。');
    if (current && String(current[field]) !== value && ['groupMembers', 'assignmentTargets', 'assignmentItems'].includes(key)) throw new Error('關聯識別碼不可變更；請停用／移除原紀錄，再建立新紀錄。');
    return value;
  };
  if (key === 'students') {
    next.Class = text('Class', 20, true).toUpperCase();
    next.ClassNo = text('ClassNo', 12, true);
    if (!/^[456][A-Z0-9 -]{0,19}$/.test(next.Class)) throw new Error('班別應以 4、5 或 6 開頭，例如 4A。');
    if (!/^\d{1,3}$/.test(next.ClassNo) || Number(next.ClassNo) < 1) throw new Error('學號請填 1–999 的數字，可保留前導零。');
    next.ChineseName = text('ChineseName', 60, true);
    next.EnglishName = text('EnglishName', 80, true);
    next.Status = choice('Status', ['ACTIVE', 'INACTIVE'], 'ACTIVE');
    if (rows.some(row => row.rowNumber !== (current && current.rowNumber) && String(row.Class).toUpperCase() === next.Class && Number(row.ClassNo) === Number(next.ClassNo))) throw new Error('相同班別及學號已存在，請編輯原學生。');
  } else if (key === 'groups') {
    next.GroupName = text('GroupName', 80, true);
    next.GroupType = choice('GroupType', ['LEVEL', 'ELECTIVE', 'CUSTOM'], 'CUSTOM');
    next.AcademicYear = text('AcademicYear', 20, true);
    if (!/^\d{4}[-/]\d{2}(?:\d{2})?$/.test(next.AcademicYear)) throw new Error('學年格式例：2026-2027 或 2026/27。');
    next.Active = bool('Active', true);
  } else if (key === 'groupMembers') {
    next.StudentId = reference('StudentId', 'students'); next.GroupId = reference('GroupId', 'groups'); next.Active = bool('Active', true);
    if (rows.some(row => row.rowNumber !== (current && current.rowNumber) && row.StudentId === next.StudentId && row.GroupId === next.GroupId)) throw new Error('群組已有這名成員，請編輯原紀錄。');
  } else if (key === 'assignments') {
    next.Title = text('Title', 100, true); next.Instructions = text('Instructions', 500, false);
    ['StartAt', 'DueAt'].forEach(field => {
      const raw = text(field, 40, false);
      if (raw && Number.isNaN(new Date(raw).getTime())) throw new Error(field + ' 日期不正確。');
      next[field] = raw ? new Date(raw) : '';
    });
    if (next.StartAt && next.DueAt && next.DueAt < next.StartAt) throw new Error('截止日期不可早於開始日期。');
    next.Status = choice('Status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'], 'DRAFT');
    if (next.Status === 'PUBLISHED' && (!current
      || !teacherAdminRows_(spreadsheet, 'assignmentTargets').some(row => row.AssignmentId === current.AssignmentId && truthy_(row.Active))
      || !teacherAdminRows_(spreadsheet, 'assignmentItems').some(row => row.AssignmentId === current.AssignmentId))) throw new Error('先儲存草稿、加入派發對象及至少一項要求，才可發佈。');
  } else if (key === 'assignmentTargets') {
    next.AssignmentId = reference('AssignmentId', 'assignments');
    next.TargetType = choice('TargetType', ['ALL', 'GROUP', 'STUDENT'], 'GROUP');
    if (current && next.TargetType !== current.TargetType) throw new Error('對象類型不可變更；請停用原紀錄再新增。');
    next.TargetId = next.TargetType === 'ALL' ? '' : reference('TargetId', next.TargetType === 'GROUP' ? 'groups' : 'students');
    next.Active = bool('Active', true);
  } else if (key === 'assignmentItems') {
    next.AssignmentId = reference('AssignmentId', 'assignments');
    if (teacherAdminRows_(spreadsheet, 'assignments').some(row => row.AssignmentId === next.AssignmentId && ['PUBLISHED', 'ACTIVE'].includes(row.Status))) throw new Error('請先將課業轉成草稿，再修改要求。');
    next.ItemOrder = numeric('ItemOrder', 1, 1000, 1);
    if (!Number.isInteger(next.ItemOrder)) throw new Error('排序必須為整數。');
    next.RequirementType = choice('RequirementType', REQUIREMENT_TYPES, 'VISIT_PAGE');
    next.ResourceId = text('ResourceId', 100, false);
    if (next.ResourceId && !(next.RequirementType === 'MOCK_ATTEMPT' ? ['paper1', 'paper2'].includes(next.ResourceId) : TEACHER_ADMIN_RESOURCES.some(resource => resource.id === next.ResourceId))) throw new Error('教材識別碼不在網站目錄內。');
    if (['VISIT_PAGE', 'COMPLETE_LAYER', 'COMPLETE_GAME'].includes(next.RequirementType) && !next.ResourceId) throw new Error('此類要求必須選擇教材。');
    const resource = TEACHER_ADMIN_RESOURCES.find(item => item.id === next.ResourceId);
    if (['PRACTICE_ATTEMPTS', 'MIN_ACCURACY'].includes(next.RequirementType) && (!resource || resource.type !== 'lesson')) throw new Error('練習次數及正確率必須選擇一個課題。');
    if (next.RequirementType === 'COMPLETE_LAYER' && (!resource || !resource.layers)) throw new Error('此教材沒有分層課業。');
    if (next.RequirementType === 'COMPLETE_GAME' && (!resource || !resource.game)) throw new Error('此教材沒有可追蹤的課題遊戲。');
    next.TargetValue = numeric('TargetValue', 1, 100000, 1);
    next.MinimumPercentage = numeric('MinimumPercentage', 0, 100, 0);
    if (next.RequirementType !== 'MIN_ACCURACY' && next.MinimumPercentage !== 0) throw new Error('最低百分比只適用於正確率要求；其他類型請填 0。');
    if (next.RequirementType === 'MIN_ACCURACY' && next.MinimumPercentage < 1) throw new Error('正確率要求請填 1–100 的最低百分比。');
    next.Required = bool('Required', true);
    next.DirectUrl = text('DirectUrl', 240, false);
    if (next.DirectUrl && (!safeSiteUrl_(next.DirectUrl) || !TEACHER_ADMIN_RESOURCES.some(resource => resource.file === next.DirectUrl.replace(/^https:\/\/kenkmc\.github\.io\/hkdse_ict\//, '').split(/[?#]/)[0]))) throw new Error('只可連結本網站目錄內的教材頁面。');
    if (!next.DirectUrl && next.ResourceId) next.DirectUrl = (TEACHER_ADMIN_RESOURCES.find(resource => resource.id === next.ResourceId) || {}).file || 'mock.html';
  }
  return next;
}
