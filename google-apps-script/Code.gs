const SCHOOL_SYNC_SHEETS = Object.freeze({
  dashboard: {
    name: 'TeacherDashboard',
    headers: ['StudentId', 'Class', 'ClassNo', 'ChineseName', 'EnglishName', 'LastLoginAt', 'ActiveMinutes', 'PagesVisited', 'ExerciseAttempts', 'AssignmentsCompleted', 'AssignmentsTotal', 'OverdueAssignments']
  },
  students: {
    name: 'Students',
    headers: ['StudentId', 'Class', 'ClassNo', 'ChineseName', 'EnglishName', 'AccountKey', 'Status', 'ActivationCode', 'FirstLinkedAt', 'LastLoginAt', 'GoogleEmail']
  },
  groups: {
    name: 'Groups',
    headers: ['GroupId', 'GroupName', 'GroupType', 'AcademicYear', 'Active']
  },
  groupMembers: {
    name: 'GroupMembers',
    headers: ['RecordKey', 'StudentId', 'GroupId', 'Active']
  },
  assignments: {
    name: 'Assignments',
    headers: ['AssignmentId', 'Title', 'Instructions', 'StartAt', 'DueAt', 'Status']
  },
  assignmentTargets: {
    name: 'AssignmentTargets',
    headers: ['RecordKey', 'AssignmentId', 'TargetType', 'TargetId', 'Active']
  },
  assignmentItems: {
    name: 'AssignmentItems',
    headers: ['ItemId', 'AssignmentId', 'ItemOrder', 'RequirementType', 'ResourceId', 'TargetValue', 'MinimumPercentage', 'Required', 'DirectUrl']
  },
  assignmentProgress: {
    name: 'AssignmentProgress',
    headers: ['RecordKey', 'StudentId', 'AssignmentId', 'CompletedItems', 'TotalItems', 'Percentage', 'Status', 'LastSyncedAt', 'CompletedAt']
  },
  latest: {
    name: 'ProgressLatest',
    headers: ['StudentId', 'SyncedAt', 'LastActivityAt', 'VisitedLessons', 'QuestionAttempts', 'Accuracy', 'DueReviews', 'CompletedLayers', 'CompletedGames', 'MockAttempts', 'LatestTopicId', 'WeakestTopicId', 'WeakestTopicPercentage', 'ClientSchemaVersion', 'RecentMocksJson']
  },
  topics: {
    name: 'TopicProgress',
    headers: ['RecordKey', 'StudentId', 'TopicId', 'Attempts', 'Score', 'MaxScore', 'Correct', 'Percentage', 'LastSyncedAt']
  },
  sessions: {
    name: 'LearningSessions',
    headers: ['SessionId', 'StudentId', 'StartedAt', 'LastActiveAt', 'ActiveSeconds', 'PageCount', 'LastSyncedAt']
  },
  pages: {
    name: 'PageActivity',
    headers: ['RecordKey', 'SessionId', 'StudentId', 'PageId', 'FirstOpenedAt', 'LastActiveAt', 'ActiveSeconds', 'ViewCount', 'LastSyncedAt']
  },
  attempts: {
    name: 'ExerciseAttempts',
    headers: ['RecordKey', 'AttemptId', 'SessionId', 'StudentId', 'ActivityType', 'ExerciseId', 'TopicId', 'Score', 'MaxScore', 'AttemptedAt', 'LastSyncedAt']
  }
});

const REQUIREMENT_TYPES = Object.freeze([
  'VISIT_PAGE', 'ACTIVE_MINUTES', 'PRACTICE_ATTEMPTS', 'MIN_ACCURACY',
  'COMPLETE_LAYER', 'COMPLETE_GAME', 'MOCK_ATTEMPT'
]);

const SCHOOL_SYNC_DEFAULTS = Object.freeze({
  schoolDomain: 'jcmkec.edu.hk',
  siteProgressUrl: 'https://kenkmc.github.io/hkdse_ict/progress.html'
});

/** Run once after the script is bound to the teacher-owned Google Sheet. */
function initialiseSchoolSync() {
  assertDeploymentOwner_();
  const configuredId = PropertiesService.getScriptProperties().getProperty('SHEET_ID')
    || (typeof SCHOOL_SYNC_BOUND_SHEET_ID === 'string' ? SCHOOL_SYNC_BOUND_SHEET_ID : '');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    || (configuredId ? SpreadsheetApp.openById(configuredId) : null);
  if (!spreadsheet) throw new Error('請由目標 Google Sheet 的「擴充功能 → Apps Script」建立及執行此專案。');
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SHEET_ID', spreadsheet.getId());
  if (!properties.getProperty('SCHOOL_DOMAIN')) properties.setProperty('SCHOOL_DOMAIN', SCHOOL_SYNC_DEFAULTS.schoolDomain);
  if (!properties.getProperty('SITE_PROGRESS_URL')) properties.setProperty('SITE_PROGRESS_URL', SCHOOL_SYNC_DEFAULTS.siteProgressUrl);
  if (!properties.getProperty('TOKEN_TTL_SECONDS')) properties.setProperty('TOKEN_TTL_SECONDS', '18000');
  if (!properties.getProperty('ACCOUNT_KEY_SECRET')) properties.setProperty('ACCOUNT_KEY_SECRET', `${Utilities.getUuid()}${Utilities.getUuid()}`);
  Object.values(SCHOOL_SYNC_SHEETS).forEach(definition => ensureSheet_(spreadsheet, definition));
  configureSheets_(spreadsheet);
  refreshTeacherDashboard_(spreadsheet);
  return googleLoginEnabled_() ? '工作表已核對，Google 登入已啟用。名冊及歷史進度保留。' : '工作表已建立並套用校方網域及正式 progress.html 網址。可在老師管理頁設定 Google 登入；設定完成前保留舊啟用碼流程。';
}

/** Fill stable student IDs and one-time activation codes for unlinked active students. */
function generateActivationCodes() {
  assertDeploymentOwner_();
  if (googleLoginEnabled_()) throw new Error('已改用 Google 登入，毋須產生啟用碼。');
  const spreadsheet = activeOrConfiguredSpreadsheet_();
  const sheet = ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students);
  if (sheet.getLastRow() < 2) return 'Students 尚未有學生資料。';
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SCHOOL_SYNC_SHEETS.students.headers.length).getValues();
  let generated = 0;
  values.forEach(row => {
    if (!String(row[0] || '').trim()) row[0] = `STU-${Utilities.getUuid().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    if (!String(row[6] || '').trim()) row[6] = 'ACTIVE';
    if (String(row[6]).toUpperCase() === 'ACTIVE' && !String(row[5] || '').trim() && !String(row[7] || '').trim()) {
      row[7] = activationCode_();
      generated += 1;
    }
  });
  sheet.getRange(2, 1, values.length, SCHOOL_SYNC_SHEETS.students.headers.length).setValues(values);
  return `已產生 ${generated} 個一次性啟用碼。學生完成連接後，該啟用碼會自動清除。`;
}

function refreshTeacherDashboard() {
  assertDeploymentOwner_();
  refreshTeacherDashboard_(activeOrConfiguredSpreadsheet_());
  return 'TeacherDashboard 已更新。';
}

function doGet(event) {
  try {
    if (String(event && event.parameter && event.parameter.admin || '') === '1') return teacherAdminPage_();
    if (String(event && event.parameter && event.parameter.setup || '') === '1') return teacherSetupPage_();
    if (String(event && event.parameter && event.parameter['auth-settings'] || '') === '1') return googleAuthSettingsPage_();
    if (event && event.parameter && (event.parameter.code || event.parameter.error || event.parameter.state)) return googleOAuthCallback_(event);
    if (String(event && event.parameter && event.parameter['google-test'] || '') === '1') return googleLoginPage_(true);
    if (googleLoginEnabled_()) return googleLoginPage_(false);
    const settings = settings_();
    const email = authorisedEmail_(settings.schoolDomain);
    const accountKey = accountKey_(email, settings.accountKeySecret);
    const spreadsheet = SpreadsheetApp.openById(settings.sheetId);
    Object.values(SCHOOL_SYNC_SHEETS).forEach(definition => ensureSheet_(spreadsheet, definition));
    const student = findStudentByAccountKey_(spreadsheet, accountKey);
    if (!student) return activationPage_();
    assertActiveStudent_(student);
    touchStudentLogin_(spreadsheet, student.rowNumber);
    const token = createConnectionToken_(accountKey, student.StudentId, settings.tokenTtlSeconds);
    const schoolData = buildSchoolData_(spreadsheet, student.StudentId);
    return page_('校園學習連接', '校園身份已驗證。網站只會在你按下「同步至學校」後傳送學習紀錄。', returnUrl_(settings.siteProgressUrl, token, schoolData, {}), '前往 ICT 學習網站');
  } catch (error) {
    return page_('未能連接', safeError_(error), '', '');
  }
}

/** Only the deployment owner can initialize or refresh the school backend. */
function teacherSetupPage_() {
  const authorization = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authorization.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
    return page_('老師執行授權', 'Google 尚未授權這個校方 Script 讀寫試算表。請由部署老師確認 Google 權限後，重新開啟這個老師設定頁；不用到編輯器尋找函數。', authorization.getAuthorizationUrl(), '確認 Google 權限');
  }
  assertDeploymentOwner_();
  initialiseSchoolSync();
  const token = `${Utilities.getUuid().replace(/-/g, '')}${Utilities.getUuid().replace(/-/g, '')}`;
  CacheService.getScriptCache().put(`school-admin-${token}`, 'enabled', 600);
  const action = escapeHtml_(ScriptApp.getService().getUrl() || '');
  const form = googleLoginEnabled_() ? '<p>Google 登入已啟用，學生毋須啟用碼。</p>' : `<form method="post" action="${action}"><input type="hidden" name="action" value="generate-codes"><input type="hidden" name="adminToken" value="${token}"><button class="button" type="submit" style="border:0;font:inherit">名冊填妥後：產生啟用碼</button></form>`;
  const sheetId = settings_().sheetId;
  return page_('校園同步設定完成', `13 張工作表及安全屬性已設定。可使用<a href="${action}?admin=1" target="_top">老師網頁管理介面</a>管理名冊、群組及課業，或直接填寫 Students。<a href="${action}?auth-settings=1" target="_top">設定 Google 登入</a>。學生資料及學習紀錄不會公開到 GitHub。${form}`, `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit`, '開啟老師試算表');
}

function assertDeploymentOwner_() {
  const email = authorisedEmail_(SCHOOL_SYNC_DEFAULTS.schoolDomain);
  const ownerEmail = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  if (!ownerEmail || email !== ownerEmail) throw new Error('只有部署這個 Web App 的老師可以管理校方資料。');
}

function teacherGenerateCodes_(event) {
  assertDeploymentOwner_();
  const token = String(event && event.parameter && event.parameter.adminToken || '');
  if (!/^[a-f0-9]{64}$/i.test(token) || !CacheService.getScriptCache().get(`school-admin-${token}`)) throw new Error('老師操作確認碼已失效，請重新開啟初始化頁。');
  CacheService.getScriptCache().remove(`school-admin-${token}`);
  const message = generateActivationCodes();
  refreshTeacherDashboard();
  return page_('學生啟用碼', escapeHtml_(message), `${ScriptApp.getService().getUrl()}?setup=1`, '返回老師設定');
}

function doPost(event) {
  try {
    const action = String(event && event.parameter && event.parameter.action || 'sync').toLowerCase();
    if (action === 'generate-codes') return teacherGenerateCodes_(event);
    if (action === 'google-register') return registerGoogleStudent_(event);
    return action === 'activate' ? activateStudent_(event) : syncProgress_(event);
  } catch (error) {
    return page_('未能完成要求', `${safeError_(error)} 請返回校園連接頁面再試。`, ScriptApp.getService().getUrl() || '', '重新連接');
  }
}

function activateStudent_(event) {
  if (googleLoginEnabled_()) throw new Error('請改用 Google 登入及選擇班別、學號。');
  const settings = settings_();
  const email = authorisedEmail_(settings.schoolDomain);
  const accountKey = accountKey_(email, settings.accountKeySecret);
  const className = safeText_(event && event.parameter && event.parameter.className, 20).toUpperCase();
  const classNo = safeText_(event && event.parameter && event.parameter.classNo, 12);
  const activationCode = String(event && event.parameter && event.parameter.activationCode || '').trim().toUpperCase();
  if (!className || !classNo || !/^[A-HJ-NP-Z2-9]{8}$/.test(activationCode)) throw new Error('班別、學號或一次性啟用碼不正確。');
  const spreadsheet = SpreadsheetApp.openById(settings.sheetId);
  const sheet = ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (findStudentByAccountKey_(spreadsheet, accountKey)) throw new Error('這個校園帳戶已連接學生資料。');
    const rows = objects_(sheet);
    const student = rows.find(row => String(row.Class || '').trim().toUpperCase() === className
      && String(row.ClassNo || '').trim() === classNo
      && String(row.ActivationCode || '').trim().toUpperCase() === activationCode);
    if (!student) throw new Error('找不到相符的學生資料或啟用碼已失效。');
    assertActiveStudent_(student);
    if (String(student.AccountKey || '').trim()) throw new Error('這名學生已連接另一個校園帳戶。');
    const now = new Date();
    sheet.getRange(student.rowNumber, 6).setValue(accountKey);
    sheet.getRange(student.rowNumber, 8).clearContent();
    sheet.getRange(student.rowNumber, 9, 1, 2).setValues([[now, now]]);
    student.AccountKey = accountKey;
    const token = createConnectionToken_(accountKey, student.StudentId, settings.tokenTtlSeconds);
    const schoolData = buildSchoolData_(spreadsheet, student.StudentId);
    return page_('連接完成', '你的校園帳戶已連接學生資料。電郵地址沒有寫入試算表。', returnUrl_(settings.siteProgressUrl, token, schoolData, {}), '前往 ICT 學習網站');
  } finally {
    lock.releaseLock();
  }
}

function syncProgress_(event) {
  const settings = settings_();
  const requestLength = Number(event && event.postData && event.postData.length || 0);
  if (requestLength > 500000) throw new Error('同步資料過大，請返回網站重新整理後再試。');
  const token = String(event && event.parameter && event.parameter.connectionToken || '');
  const googleIdentity = googleLoginEnabled_() ? verifyGoogleConnection_(token) : null;
  const accountKey = googleIdentity ? googleIdentity.accountKey : accountKey_(authorisedEmail_(settings.schoolDomain), settings.accountKeySecret);
  const tokenSession = googleIdentity || verifyConnectionToken_(token, accountKey);
  const body = parsePayload_(event && event.parameter && event.parameter.payload);
  const snapshot = normaliseSnapshot_(body.snapshot);
  const spreadsheet = SpreadsheetApp.openById(settings.sheetId);
  const student = findStudentByAccountKey_(spreadsheet, accountKey);
  if (!student || student.StudentId !== tokenSession.studentId) throw new Error('學生連接已失效，請重新登入。');
  assertActiveStudent_(student);
  if (googleIdentity && (!student.GoogleEmail || accountKey_(googleTeacherEmail_(student.GoogleEmail), settings.accountKeySecret) !== accountKey)) throw new Error('學生電郵配對已更改，請重新登入或聯絡老師。');
  const syncedAt = new Date();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Re-check after acquiring the same lock used by teacher binding corrections.
    const current = findStudentByAccountKey_(spreadsheet, accountKey);
    if (!current || current.StudentId !== student.StudentId) throw new Error('學生綁定已更改，請重新登入。');
    assertActiveStudent_(current);
    if (googleIdentity && (!current.GoogleEmail || accountKey_(googleTeacherEmail_(current.GoogleEmail), settings.accountKeySecret) !== accountKey)) throw new Error('學生電郵配對已更改，請重新登入或聯絡老師。');
    if (googleIdentity) verifyGoogleConnection_(token);
    Object.values(SCHOOL_SYNC_SHEETS).forEach(definition => ensureSheet_(spreadsheet, definition));
    touchStudentLogin_(spreadsheet, student.rowNumber);
    saveLatest_(spreadsheet, student.StudentId, snapshot, syncedAt);
    saveTopics_(spreadsheet, student.StudentId, snapshot.topics, syncedAt);
    saveSessions_(spreadsheet, student.StudentId, snapshot.sessions, syncedAt);
    savePages_(spreadsheet, student.StudentId, snapshot.pageActivity, syncedAt);
    saveAttempts_(spreadsheet, student.StudentId, snapshot.exerciseAttempts, syncedAt);
    saveAssignmentProgress_(spreadsheet, student.StudentId, snapshot.assignmentProgress, syncedAt);
    refreshTeacherDashboard_(spreadsheet);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  CacheService.getScriptCache().remove(tokenSession.cacheKey);
  const replacementToken = createConnectionToken_(accountKey, student.StudentId, settings.tokenTtlSeconds, googleIdentity);
  const schoolData = buildSchoolData_(spreadsheet, student.StudentId);
  return page_('同步完成', '學習紀錄已寫入校方 Google Sheet。請返回網站確認本次同步。', returnUrl_(settings.siteProgressUrl, replacementToken, schoolData, { sync: 'success', receipt: body.clientNonce }), '返回學習網站');
}

function settings_() {
  const properties = PropertiesService.getScriptProperties();
  const schoolDomain = String(properties.getProperty('SCHOOL_DOMAIN') || '').trim().toLowerCase().replace(/^@/, '');
  const siteProgressUrl = String(properties.getProperty('SITE_PROGRESS_URL') || '').trim();
  const sheetId = String(properties.getProperty('SHEET_ID') || '').trim();
  const accountKeySecret = String(properties.getProperty('ACCOUNT_KEY_SECRET') || '').trim();
  const tokenTtlSeconds = integer_(properties.getProperty('TOKEN_TTL_SECONDS'), 300, 21600);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(schoolDomain)) throw new Error('校方尚未設定 SCHOOL_DOMAIN。');
  if (!/^https:\/\/kenkmc\.github\.io\/hkdse_ict\/progress\.html$/i.test(siteProgressUrl)) throw new Error('SITE_PROGRESS_URL 必須是本學習網站的 progress.html 正式網址。');
  if (!sheetId || !accountKeySecret) throw new Error('請先執行 initialiseSchoolSync() 完成初始設定。');
  return { schoolDomain, siteProgressUrl, sheetId, accountKeySecret, tokenTtlSeconds };
}

function activeOrConfiguredSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) throw new Error('請先執行 initialiseSchoolSync()。');
  return SpreadsheetApp.openById(sheetId);
}

function authorisedEmail_(schoolDomain) {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email || !email.endsWith(`@${schoolDomain}`)) throw new Error('請使用獲校方授權的 Google Workspace 帳戶登入。');
  return email;
}

function accountKey_(email, secret) {
  const signature = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), secret);
  return Utilities.base64EncodeWebSafe(signature).replace(/=+$/g, '').slice(0, 32);
}

function createConnectionToken_(accountKey, studentId, ttlSeconds, googleIdentity) {
  const token = `${Utilities.getUuid().replace(/-/g, '')}${Utilities.getUuid().replace(/-/g, '')}`;
  const cacheKey = tokenCacheKey_(token);
  const identity = googleIdentity ? { authMode: 'google', authEpoch: googleIdentity.authEpoch, callerKey: googleIdentity.callerKey } : {};
  CacheService.getScriptCache().put(cacheKey, JSON.stringify(Object.assign({ accountKey, studentId }, identity)), ttlSeconds);
  return token;
}

function verifyConnectionToken_(token, accountKey) {
  if (!/^[A-Za-z0-9_-]{32,160}$/.test(token)) throw new Error('連接碼不正確或已失效。');
  const cacheKey = tokenCacheKey_(token);
  const stored = CacheService.getScriptCache().get(cacheKey);
  if (!stored) throw new Error('連接碼已失效。');
  const session = JSON.parse(stored);
  if (String(session.accountKey || '') !== accountKey) throw new Error('連接碼與目前登入帳戶不相符。');
  return { cacheKey, studentId: String(session.studentId || '') };
}

function tokenCacheKey_(token) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token);
  return `school-sync-${Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '')}`;
}

function parsePayload_(rawPayload) {
  let body;
  try { body = JSON.parse(String(rawPayload || '')); } catch (error) { throw new Error('同步資料格式不正確。'); }
  if (!body || Number(body.schemaVersion) !== 2) throw new Error('同步資料版本不受支援。');
  if (!/^[a-z0-9]{12,100}$/i.test(String(body.clientNonce || ''))) throw new Error('同步確認碼不正確。');
  return { clientNonce: String(body.clientNonce), snapshot: body.snapshot };
}

function normaliseSnapshot_(input) {
  if (!input || input.format !== 'hkdse-ict-school-sync' || Number(input.schemaVersion) !== 2) throw new Error('這不是有效的學習進度摘要。');
  const summary = input.summary || {};
  return {
    schemaVersion: 2,
    lastActivityAt: safeDateText_(input.lastActivityAt),
    summary: {
      visitedLessons: integer_(summary.visitedLessons, 0, 1000), questionAttempts: integer_(summary.questionAttempts, 0, 100000),
      accuracy: number_(summary.accuracy, 0, 100), dueReviews: integer_(summary.dueReviews, 0, 100000),
      completedLayers: integer_(summary.completedLayers, 0, 10000), completedGames: integer_(summary.completedGames, 0, 10000),
      latestTopicId: safeId_(summary.latestTopicId), weakestTopicId: safeId_(summary.weakestTopicId),
      weakestTopicPercentage: number_(summary.weakestTopicPercentage, 0, 100), mockAttempts: integer_(summary.mockAttempts, 0, 10000)
    },
    topics: safeArray_(input.topics, 150).map(topic => ({
      topicId: safeId_(topic.topicId), attempts: integer_(topic.attempts, 0, 100000), score: number_(topic.score, 0, 1000000),
      maxScore: number_(topic.maxScore, 0, 1000000), correct: integer_(topic.correct, 0, 100000), percentage: number_(topic.percentage, 0, 100)
    })).filter(topic => topic.topicId),
    recentMocks: safeArray_(input.recentMocks, 10).map(mock => ({
      mode: safeId_(mock.mode, 30), paperLabel: safeText_(mock.paperLabel, 100), score: number_(mock.score, 0, 100000),
      maxScore: number_(mock.maxScore, 0, 100000), percentage: number_(mock.percentage, 0, 100), unanswered: integer_(mock.unanswered, 0, 10000),
      timedOut: Boolean(mock.timedOut), completedAt: safeDateText_(mock.completedAt)
    })),
    sessions: safeArray_(input.sessions, 250).map(session => ({
      sessionId: safeKey_(session.sessionId, 100), startedAt: safeDateText_(session.startedAt), lastActiveAt: safeDateText_(session.lastActiveAt),
      activeSeconds: integer_(session.activeSeconds, 0, 8640000), pageCount: integer_(session.pageCount, 0, 10000)
    })).filter(session => session.sessionId),
    pageActivity: safeArray_(input.pageActivity, 2000).map(page => ({
      activityKey: safeKey_(page.activityKey, 220), sessionId: safeKey_(page.sessionId, 100), pageId: safeId_(page.pageId, 100),
      firstOpenedAt: safeDateText_(page.firstOpenedAt), lastActiveAt: safeDateText_(page.lastActiveAt),
      activeSeconds: integer_(page.activeSeconds, 0, 8640000), viewCount: integer_(page.viewCount, 0, 100000)
    })).filter(page => page.activityKey && page.sessionId && page.pageId),
    exerciseAttempts: safeArray_(input.exerciseAttempts, 2000).map(attempt => ({
      attemptId: safeKey_(attempt.attemptId, 100), sessionId: safeKey_(attempt.sessionId, 100), activityType: safeId_(attempt.activityType, 50),
      exerciseId: safeId_(attempt.exerciseId, 100), topicId: safeId_(attempt.topicId, 80), score: number_(attempt.score, 0, 100000),
      maxScore: number_(attempt.maxScore, 0, 100000), attemptedAt: safeDateText_(attempt.attemptedAt)
    })).filter(attempt => attempt.attemptId),
    assignmentProgress: safeArray_(input.assignmentProgress, 200).map(item => ({
      assignmentId: safeId_(item.assignmentId, 80), completedItems: integer_(item.completedItems, 0, 1000), totalItems: integer_(item.totalItems, 0, 1000),
      percentage: number_(item.percentage, 0, 100), status: safeEnum_(item.status, ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
      completedAt: safeDateText_(item.completedAt)
    })).filter(item => item.assignmentId)
  };
}

function findStudentByAccountKey_(spreadsheet, accountKey) {
  if (!accountKey) return null;
  return objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.students.name)).find(row => String(row.AccountKey || '') === accountKey) || null;
}

function assertActiveStudent_(student) {
  if (String(student.Status || '').toUpperCase() !== 'ACTIVE') throw new Error('學生帳戶目前未啟用，請聯絡老師。');
}

function touchStudentLogin_(spreadsheet, rowNumber) {
  spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.students.name).getRange(rowNumber, 10).setValue(new Date());
}

function saveLatest_(spreadsheet, studentId, snapshot, syncedAt) {
  const s = snapshot.summary;
  upsertByKey_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.latest.name), studentId, [
    studentId, syncedAt, dateOrBlank_(snapshot.lastActivityAt), s.visitedLessons, s.questionAttempts, s.accuracy, s.dueReviews,
    s.completedLayers, s.completedGames, s.mockAttempts, s.latestTopicId, s.weakestTopicId, s.weakestTopicPercentage,
    snapshot.schemaVersion, JSON.stringify(snapshot.recentMocks)
  ], 1);
}

function saveTopics_(spreadsheet, studentId, topics, syncedAt) {
  const sheet = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.topics.name);
  topics.forEach(topic => {
    const key = `${studentId}|${topic.topicId}`;
    upsertByKey_(sheet, key, [key, studentId, topic.topicId, topic.attempts, topic.score, topic.maxScore, topic.correct, topic.percentage, syncedAt], 1);
  });
}

function saveSessions_(spreadsheet, studentId, sessions, syncedAt) {
  const sheet = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.sessions.name);
  sessions.forEach(session => upsertByKey_(sheet, session.sessionId, [session.sessionId, studentId, dateOrBlank_(session.startedAt), dateOrBlank_(session.lastActiveAt), session.activeSeconds, session.pageCount, syncedAt], 1));
}

function savePages_(spreadsheet, studentId, pages, syncedAt) {
  const sheet = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.pages.name);
  pages.forEach(page => {
    const key = `${studentId}|${page.activityKey}`;
    upsertByKey_(sheet, key, [key, page.sessionId, studentId, page.pageId, dateOrBlank_(page.firstOpenedAt), dateOrBlank_(page.lastActiveAt), page.activeSeconds, page.viewCount, syncedAt], 1);
  });
}

function saveAttempts_(spreadsheet, studentId, attempts, syncedAt) {
  const sheet = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.attempts.name);
  attempts.forEach(attempt => {
    const key = `${studentId}|${attempt.attemptId}`;
    upsertByKey_(sheet, key, [key, attempt.attemptId, attempt.sessionId, studentId, attempt.activityType, attempt.exerciseId, attempt.topicId, attempt.score, attempt.maxScore, dateOrBlank_(attempt.attemptedAt), syncedAt], 1);
  });
}

function saveAssignmentProgress_(spreadsheet, studentId, items, syncedAt) {
  const sheet = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignmentProgress.name);
  items.forEach(item => {
    const key = `${studentId}|${item.assignmentId}`;
    upsertByKey_(sheet, key, [key, studentId, item.assignmentId, item.completedItems, item.totalItems, item.percentage, item.status, syncedAt, dateOrBlank_(item.completedAt)], 1);
  });
}

function buildSchoolData_(spreadsheet, studentId) {
  const student = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.students.name)).find(row => row.StudentId === studentId);
  if (!student) throw new Error('找不到學生資料。');
  const memberships = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.groupMembers.name)).filter(row => row.StudentId === studentId && truthy_(row.Active));
  const groupIds = new Set(memberships.map(row => String(row.GroupId || '')));
  const groups = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.groups.name))
    .filter(row => groupIds.has(String(row.GroupId || '')) && truthy_(row.Active))
    .map(row => ({ groupId: safeId_(row.GroupId), name: safeText_(row.GroupName, 80), type: safeId_(row.GroupType, 20) }));
  const activeGroupIds = new Set(groups.map(group => group.groupId));
  const targets = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignmentTargets.name)).filter(row => truthy_(row.Active));
  const items = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignmentItems.name));
  const now = Date.now();
  const assignments = objects_(spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignments.name))
    .filter(row => ['PUBLISHED', 'ACTIVE'].includes(String(row.Status || '').toUpperCase()))
    .filter(row => !row.StartAt || new Date(row.StartAt).getTime() <= now)
    .filter(row => targets.some(target => target.AssignmentId === row.AssignmentId && (
      String(target.TargetType || '').toUpperCase() === 'ALL'
      || (String(target.TargetType || '').toUpperCase() === 'STUDENT' && target.TargetId === studentId)
      || (String(target.TargetType || '').toUpperCase() === 'GROUP' && activeGroupIds.has(String(target.TargetId || '')))
    )))
    .map(row => ({
      assignmentId: safeId_(row.AssignmentId), title: safeText_(row.Title, 100), instructions: safeText_(row.Instructions, 500),
      startAt: safeDateText_(row.StartAt), dueAt: safeDateText_(row.DueAt),
      items: items.filter(item => item.AssignmentId === row.AssignmentId).sort((a, b) => Number(a.ItemOrder || 0) - Number(b.ItemOrder || 0)).map(item => ({
        itemId: safeId_(item.ItemId), requirementType: safeEnum_(item.RequirementType, REQUIREMENT_TYPES), resourceId: safeId_(item.ResourceId, 100),
        targetValue: number_(item.TargetValue, 0, 100000), minimumPercentage: number_(item.MinimumPercentage, 0, 100),
        required: truthy_(item.Required), directUrl: safeSiteUrl_(item.DirectUrl)
      }))
    }));
  return {
    schemaVersion: 1,
    student: { studentId, className: safeText_(student.Class, 20), classNo: safeText_(student.ClassNo, 12), chineseName: safeText_(student.ChineseName, 60), englishName: safeText_(student.EnglishName, 80) },
    groups,
    assignments,
    issuedAt: new Date().toISOString()
  };
}

function refreshTeacherDashboard_(spreadsheet) {
  const sheet = ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.dashboard);
  const students = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students)).filter(row => String(row.Status || '').toUpperCase() === 'ACTIVE');
  const sessions = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.sessions));
  const pages = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.pages));
  const attempts = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.attempts));
  const progress = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.assignmentProgress));
  const assignments = new Map(objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.assignments)).map(row => [row.AssignmentId, row]));
  const rows = students.map(student => {
    const ownSessions = sessions.filter(row => row.StudentId === student.StudentId);
    const ownPages = pages.filter(row => row.StudentId === student.StudentId);
    const ownAttempts = attempts.filter(row => row.StudentId === student.StudentId);
    const ownProgress = progress.filter(row => row.StudentId === student.StudentId);
    const completed = ownProgress.filter(row => row.Status === 'COMPLETED').length;
    const overdue = ownProgress.filter(row => row.Status !== 'COMPLETED' && assignments.get(row.AssignmentId)?.DueAt && new Date(assignments.get(row.AssignmentId).DueAt).getTime() < Date.now()).length;
    return [student.StudentId, student.Class, student.ClassNo, student.ChineseName, student.EnglishName, student.LastLoginAt || '', Math.round(ownSessions.reduce((sum, row) => sum + Number(row.ActiveSeconds || 0), 0) / 60), ownPages.length, ownAttempts.length, completed, ownProgress.length, overdue];
  }).sort((a, b) => String(a[1]).localeCompare(String(b[1])) || String(a[2]).localeCompare(String(b[2]), undefined, { numeric: true }));
  sheet.clear();
  sheet.getRange('A1').setValue('HKDSE ICT 學習進度');
  sheet.getRange('A2').setValue(`最後更新：${Utilities.formatDate(new Date(), 'Asia/Hong_Kong', 'yyyy-MM-dd HH:mm')}`);
  sheet.getRange('A3:F3').setValues([['學生人數', students.length, '登入時段', sessions.length, '累積有效分鐘', Math.round(sessions.reduce((sum, row) => sum + Number(row.ActiveSeconds || 0), 0) / 60)]]);
  sheet.getRange(5, 1, 1, SCHOOL_SYNC_SHEETS.dashboard.headers.length).setValues([SCHOOL_SYNC_SHEETS.dashboard.headers]);
  if (rows.length) sheet.getRange(6, 1, rows.length, SCHOOL_SYNC_SHEETS.dashboard.headers.length).setValues(rows);
  styleHeader_(sheet.getRange(5, 1, 1, SCHOOL_SYNC_SHEETS.dashboard.headers.length));
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  sheet.setFrozenRows(5);
  sheet.autoResizeColumns(1, SCHOOL_SYNC_SHEETS.dashboard.headers.length);
}

function ensureSheet_(spreadsheet, definition) {
  const sheet = spreadsheet.getSheetByName(definition.name) || spreadsheet.insertSheet(definition.name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, definition.headers.length).setValues([definition.headers]);
    styleHeader_(sheet.getRange(1, 1, 1, definition.headers.length));
    sheet.setFrozenRows(1);
  } else if (definition.name !== SCHOOL_SYNC_SHEETS.dashboard.name) {
    const headers = sheet.getRange(1, 1, 1, definition.headers.length).getValues()[0].map(String);
    // Add only the new trailing column; never rebuild the roster or shift existing fields.
    if (definition.name === 'Students' && headers.slice(0, 10).join('|') === definition.headers.slice(0, 10).join('|') && !headers[10]) {
      const cell = sheet.getRange(1, 11); cell.setValue('GoogleEmail'); styleHeader_(cell);
      return sheet;
    }
    if (headers.join('|') !== definition.headers.join('|')) throw new Error(`${definition.name} 欄位與目前程式版本不符，請使用新範本或先完成資料遷移。`);
  }
  return sheet;
}

function configureSheets_(spreadsheet) {
  const students = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.students.name);
  students.getRange('G2:G1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['ACTIVE', 'INACTIVE'], true).setAllowInvalid(false).build());
  const groups = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.groups.name);
  groups.getRange('C2:C1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['LEVEL', 'ELECTIVE', 'CUSTOM'], true).setAllowInvalid(false).build());
  const checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  groups.getRange('E2:E1000').setDataValidation(checkboxRule);
  spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.groupMembers.name).getRange('D2:D5000').setDataValidation(checkboxRule);
  spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignments.name).getRange('F2:F1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['DRAFT', 'PUBLISHED', 'ARCHIVED'], true).setAllowInvalid(false).build());
  const targets = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignmentTargets.name);
  targets.getRange('C2:C5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['ALL', 'GROUP', 'STUDENT'], true).setAllowInvalid(false).build());
  targets.getRange('E2:E5000').setDataValidation(checkboxRule);
  const items = spreadsheet.getSheetByName(SCHOOL_SYNC_SHEETS.assignmentItems.name);
  items.getRange('D2:D5000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(REQUIREMENT_TYPES, true).setAllowInvalid(false).build());
  items.getRange('H2:H5000').setDataValidation(checkboxRule);
  Object.values(SCHOOL_SYNC_SHEETS).forEach(definition => {
    const sheet = spreadsheet.getSheetByName(definition.name);
    if (sheet && definition.name !== SCHOOL_SYNC_SHEETS.dashboard.name) sheet.autoResizeColumns(1, definition.headers.length);
  });
}

function styleHeader_(range) {
  range.setFontWeight('bold').setBackground('#172554').setFontColor('#ffffff').setHorizontalAlignment('center');
}

function objects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const width = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, width).getValues()[0].map(String);
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, width).getValues().map((values, index) => {
    const row = { rowNumber: index + 2 };
    headers.forEach((header, column) => { row[header] = values[column]; });
    return row;
  });
}

function findRowByKey_(sheet, key, column) {
  if (sheet.getLastRow() < 2) return 0;
  const match = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).createTextFinder(key).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function upsertByKey_(sheet, key, row, keyColumn) {
  const rowNumber = findRowByKey_(sheet, key, keyColumn);
  if (rowNumber) sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function activationCode_() {
  const source = Utilities.getUuid().replace(/[^A-HJ-NP-Z2-9]/gi, '').toUpperCase();
  return `${source}ABCDEFGH23456789`.slice(0, 8);
}

function activationPage_() {
  const action = escapeHtml_(ScriptApp.getService().getUrl() || '');
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="zh-Hant"><head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>首次連接</title><style>${pageStyles_()}label{display:grid;gap:6px;text-align:left;margin:12px 0;font-weight:700;color:#334155}input{box-sizing:border-box;width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:9px;font:inherit}button{border:0}</style></head><body><main><h1>首次連接學生資料</h1><p>請輸入老師提供的資料。Google 帳戶只會轉成不可直接還原的代碼，電郵地址不會寫入試算表。</p><form method="post" action="${action}"><input type="hidden" name="action" value="activate"><label>班別<input name="className" maxlength="20" required autocomplete="organization-title"></label><label>學號<input name="classNo" maxlength="12" required inputmode="numeric"></label><label>一次性啟用碼<input name="activationCode" maxlength="8" required autocomplete="one-time-code"></label><button class="button" type="submit">連接學生資料</button></form></main></body></html>`).setTitle('首次連接');
}

function returnUrl_(siteUrl, token, schoolData, queryValues) {
  const query = Object.keys(queryValues || {}).length ? `?${Object.keys(queryValues).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryValues[key])}`).join('&')}` : '';
  const encodedData = Utilities.base64EncodeWebSafe(JSON.stringify(schoolData), Utilities.Charset.UTF_8).replace(/=+$/g, '');
  return `${siteUrl}${query}#school-connect=${encodeURIComponent(token)}&school-data=${encodeURIComponent(encodedData)}`;
}

function integer_(value, min, max) { return Math.round(number_(value, min, max)); }
function number_(value, min, max) { const numeric = Number(value); return Math.max(min, Math.min(max, Number.isFinite(numeric) ? numeric : 0)); }
function safeArray_(value, max) { return Array.isArray(value) ? value.slice(0, max) : []; }
function safeId_(value, maxLength) { const text = String(value || '').slice(0, maxLength || 80); return /^[a-z0-9._-]*$/i.test(text) ? text : ''; }
function safeKey_(value, maxLength) { const text = String(value || '').slice(0, maxLength || 220); return /^[a-z0-9._|:-]*$/i.test(text) ? text : ''; }
function safeText_(value, maxLength) { const text = String(value || '').trim().slice(0, maxLength || 160); return /^[=+\-@]/.test(text) ? `'${text}` : text; }
function safeEnum_(value, allowed) { const text = String(value || '').trim().toUpperCase(); return allowed.includes(text) ? text : allowed[0]; }
function safeDateText_(value) { const date = new Date(value || ''); return Number.isNaN(date.getTime()) ? '' : date.toISOString(); }
function dateOrBlank_(value) { return value ? new Date(value) : ''; }
function truthy_(value) { return value === true || ['TRUE', 'YES', 'Y', '1', 'ACTIVE'].includes(String(value || '').trim().toUpperCase()); }
function safeSiteUrl_(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^(?:[a-z0-9._-]+\.html)(?:[?#].*)?$/i.test(text)) return text;
  if (/^https:\/\/kenkmc\.github\.io\/hkdse_ict\/[a-z0-9._/?#=&%-]+$/i.test(text)) return text;
  return '';
}
function safeError_(error) { return escapeHtml_(String(error && error.message || '系統暫時未能處理要求。').slice(0, 240)); }
function escapeHtml_(value) { return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]); }
function pageStyles_() { return 'body{margin:0;min-height:100vh;display:grid;place-items:center;background:#eef2ff;color:#172554;font-family:Arial,sans-serif}main{width:min(480px,calc(100% - 40px));box-sizing:border-box;padding:32px;border-radius:20px;background:#fff;box-shadow:0 20px 60px #17255422;text-align:center}h1{margin:0 0 14px}p{color:#475569;line-height:1.7}.button{display:inline-flex;margin-top:12px;padding:12px 18px;border-radius:10px;background:#4338ca;color:#fff;font-weight:700;text-decoration:none;cursor:pointer}'; }
function page_(title, message, actionUrl, actionLabel) {
  const action = actionUrl && actionLabel ? `<a class="button" href="${escapeHtml_(actionUrl)}" target="_top">${escapeHtml_(actionLabel)}</a>` : '';
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="zh-Hant"><head><base target="_top"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml_(title)}</title><style>${pageStyles_()}</style></head><body><main><h1>${escapeHtml_(title)}</h1><p>${message}</p>${action}</main></body></html>`).setTitle(title);
}
