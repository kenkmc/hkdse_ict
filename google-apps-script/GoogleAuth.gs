/** Explicit Google OAuth authorization-code login. Secrets stay in Script Properties. */
function googleLoginEnabled_() {
  return PropertiesService.getScriptProperties().getProperty('STUDENT_AUTH_MODE') === 'GOOGLE';
}

/** Inspect independent setup steps; never return the secret in public status. */
function googleAuthInspection_() {
  const properties = PropertiesService.getScriptProperties();
  const clientId = String(properties.getProperty('GOOGLE_LOGIN_CLIENT_ID') || '').trim();
  const clientSecret = String(properties.getProperty('GOOGLE_LOGIN_CLIENT_SECRET') || '').trim();
  let redirectUri = '', redirectAvailable = true;
  try { redirectUri = String(ScriptApp.getService().getUrl() || ''); } catch (error) { redirectAvailable = false; }
  const clientIdValid = /^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(clientId);
  const credentialsSaved = Boolean(clientId && clientSecret);
  // Workspace's runtime URL can put the domain before "macros", unlike the deployment API URL.
  // Preserve the exact URL for OAuth; aliases must not silently replace a registered redirect URI.
  const redirectValid = /^https:\/\/script\.google\.com\/(?:a\/jcmkec\.edu\.hk\/macros\/s|a\/macros\/jcmkec\.edu\.hk\/s|macros\/s)\/[A-Za-z0-9_-]+\/exec$/.test(redirectUri)
    && redirectUri === redirectUri.trim();
  const issues = [];
  if (!clientId) issues.push(['MISSING_CLIENT_ID', '尚未儲存 Client ID。']);
  else if (!clientIdValid) issues.push(['INVALID_CLIENT_ID', '已儲存的 Client ID 格式不正確。']);
  if (!clientSecret) issues.push(['MISSING_CLIENT_SECRET', '尚未儲存 Client secret。']);
  if (!redirectAvailable) issues.push(['REDIRECT_UNAVAILABLE', 'Google 未能提供 Web App 回跳網址；這不代表憑證未儲存。']);
  else if (!redirectValid) issues.push(['INVALID_REDIRECT_URI', 'Web App 回跳網址未通過正式 /exec 網址檢查；這不代表憑證未儲存。']);
  return { config: { clientId, clientSecret, redirectUri }, credentialsSaved, clientIdValid,
    clientSecretSaved: Boolean(clientSecret), redirectValid, issues };
}

function googleAuthConfig_() {
  const inspection = googleAuthInspection_();
  if (inspection.issues.length) throw new Error(inspection.issues.map(issue => issue[1]).join(' '));
  return inspection.config;
}

function googleAuthFingerprint_(config) {
  return googleHash_(config.clientId + '\n' + config.clientSecret + '\n' + config.redirectUri);
}

function googleAuthPublicStatus_() {
  const properties = PropertiesService.getScriptProperties();
  const inspection = googleAuthInspection_();
  const configured = inspection.issues.length === 0;
  const enabled = googleLoginEnabled_();
  const tested = configured && properties.getProperty('GOOGLE_LOGIN_TESTED') === googleAuthFingerprint_(inspection.config);
  const statusMessage = !configured ? (inspection.credentialsSaved ? 'OAuth 憑證已儲存，但設定檢查未通過。' : 'OAuth 憑證尚未完整儲存。')
    : enabled ? 'Google 登入已啟用。登入本身不會上傳學習紀錄。'
    : tested ? 'Google 登入測試通過，但尚未啟用；學生登入及同步暫未開放。'
    : 'OAuth 設定已儲存，尚未測試／啟用；學生登入及同步暫未開放。';
  const diagnosticText = [
    '設定介面：9', '讀取時間（香港）：' + new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    '學生入口模式：' + (enabled ? 'GOOGLE（電郵登入）' : 'NOT_ENABLED（等待 Google 登入啟用，不提供啟用碼）'),
    'Client ID：' + (inspection.clientIdValid ? '已儲存，格式有效' : '未儲存或格式無效'),
    'Client secret：' + (inspection.clientSecretSaved ? '已儲存（不顯示內容）' : '未儲存'),
    '回跳網址檢查：' + (inspection.redirectValid ? '通過' : '未通過'),
    '回跳網址：' + (inspection.config.redirectUri || '未提供'),
    'Google 登入測試：' + (tested ? '通過' : '尚未通過／設定已改變'),
    '錯誤代碼：' + (inspection.issues.map(issue => issue[0]).join(', ') || '無')
  ].join('\n');
  return { enabled, configured, credentialsSaved: inspection.credentialsSaved,
    clientId: inspection.config.clientId, tested, redirectUri: inspection.config.redirectUri,
    statusMessage, diagnosticText, configError: inspection.issues.map(issue => issue[1]).join(' '),
    backupSheet: properties.getProperty('GOOGLE_LOGIN_BACKUP_SHEET') || '' };
}

function googleHash_(value) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)).replace(/=+$/g, '');
}

function googleRandom_() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''); }

/** Bind state/tickets to the native Workspace session without using its email as the OAuth identity. */
function googleCallerKey_() {
  const key = String(Session.getTemporaryActiveUserKey() || '');
  if (!key) throw new Error('無法確認本次 Google 工作階段，請使用只登入校園帳戶的瀏覽器再試。');
  return googleHash_(key);
}

function googleLoginPage_(test) {
  if (test) assertDeploymentOwner_();
  else if (!googleLoginEnabled_()) throw new Error('Google 登入尚未啟用，請由老師完成設定。');
  const config = googleAuthConfig_();
  const state = googleRandom_();
  const verifier = googleRandom_();
  const record = { callerKey: googleCallerKey_(), verifier, test: Boolean(test), config: googleAuthFingerprint_(config) };
  CacheService.getScriptCache().put('google-state-' + googleHash_(state), JSON.stringify(record), 600);
  const parameters = { client_id: config.clientId, redirect_uri: config.redirectUri, response_type: 'code',
    scope: 'openid email', state, prompt: 'select_account', hd: settings_().schoolDomain,
    access_type: 'online', code_challenge: googleHash_(verifier), code_challenge_method: 'S256' };
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + Object.keys(parameters).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key])).join('&');
  return page_(test ? '測試 Google 登入' : '使用 Google 登入',
    '按下方按鈕選擇你的校園 Google 帳戶。首次登入只需選擇班別和學號；之後在其他設備使用同一帳戶即可。網站只索取電郵身份，不索取學生的 Drive 或試算表權限。<br>如 Google Web App 因多帳戶而無法開啟，請用只登入校園帳戶的瀏覽器或無痕視窗。', url, '選擇 Google 帳戶');
}

function googleOAuthCallback_(event) {
  const parameters = event && event.parameter || {};
  const state = String(parameters.state || '');
  if (!/^[a-f0-9]{64}$/i.test(state)) throw new Error('Google 登入狀態無效，請由登入頁重新開始。');
  const cache = CacheService.getScriptCache();
  const stateKey = 'google-state-' + googleHash_(state);
  const record = teacherAdminLocked_(() => {
    const stored = cache.get(stateKey);
    if (!stored) throw new Error('Google 登入已逾時或已使用，請重新開始。');
    const value = JSON.parse(stored);
    if (value.callerKey !== googleCallerKey_()) throw new Error('登入工作階段不相符，請在原本的瀏覽器重新開始登入。');
    cache.remove(stateKey); // One-use state, including cancellation and failed exchanges.
    return value;
  });
  if (parameters.error) throw new Error('Google 登入已取消。沒有修改名冊或綁定。');
  const code = String(parameters.code || '');
  if (!code || code.length > 4096) throw new Error('Google 授權碼無效。');
  const config = googleAuthConfig_();
  if (record.config !== googleAuthFingerprint_(config)) throw new Error('登入設定已更改，請重新開始。');
  const tokens = googleFetchJson_('https://oauth2.googleapis.com/token', { method: 'post', payload: {
    code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri,
    grant_type: 'authorization_code', code_verifier: record.verifier
  }, muteHttpExceptions: true });
  if (!tokens.access_token || String(tokens.token_type || '').toLowerCase() !== 'bearer') throw new Error('Google 未回傳有效登入憑證。');
  // UserInfo is obtained server-to-server using Google's code-exchange access token, not a browser-supplied email/JWT.
  const info = googleFetchJson_('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: 'Bearer ' + tokens.access_token }, muteHttpExceptions: true
  });
  const email = googleVerifiedEmail_(info);
  if (record.test) {
    assertDeploymentOwner_();
    if (email !== String(Session.getEffectiveUser().getEmail()).toLowerCase()) throw new Error('測試時請選擇部署老師的校園帳戶。');
    PropertiesService.getScriptProperties().setProperty('GOOGLE_LOGIN_TESTED', googleAuthFingerprint_(config));
    return page_('Google 登入測試成功', '已透過 Google 驗證帳戶：' + escapeHtml_(email) + '。<br><strong>這只是老師登入測試，不是學生進度同步；沒有寫入學生學習紀錄。</strong><br>尚未清除學生綁定；返回設定頁後才可啟用新流程。', config.redirectUri + '?auth-settings=1', '返回登入設定');
  }
  if (!googleLoginEnabled_()) throw new Error('新登入流程尚未啟用，請先由老師完成設定。');
  return teacherAdminLocked_(() => {
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const accountKey = accountKey_(email, settings_().accountKeySecret);
    const students = objects_(ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students));
    const matches = students.filter(row => String(row.GoogleEmail || '').trim().toLowerCase() === email);
    if (matches.length > 1) throw new Error('此電郵在名冊重複，請通知老師修正。');
    const identity = { email, accountKey, callerKey: record.callerKey, authEpoch: PropertiesService.getScriptProperties().getProperty('GOOGLE_LOGIN_EPOCH') };
    if (matches.length === 1) {
      assertActiveStudent_(matches[0]);
      if (matches[0].AccountKey && matches[0].AccountKey !== accountKey) throw new Error('名冊綁定不一致，請通知老師在後台修正電郵。');
      writeStudentFields_(spreadsheet.getSheetByName('Students'), matches[0].rowNumber, { AccountKey: accountKey });
      return googleConnectedPage_(spreadsheet, matches[0], identity);
    }
    const ticket = googleRandom_();
    cache.put('google-register-' + googleHash_(ticket), JSON.stringify(identity), 600);
    return googleRegistrationPage_(students, identity, ticket);
  });
}

function googleFetchJson_(url, options) {
  const response = UrlFetchApp.fetch(url, Object.assign({ followRedirects: false }, options));
  // Never expose Google's raw errors, authorization codes, client secrets or tokens in the UI/log.
  if (response.getResponseCode() !== 200) throw new Error('Google 未能確認登入，請重新開始或請老師檢查 OAuth 設定。');
  try { return JSON.parse(response.getContentText()); } catch (error) { throw new Error('Google 登入回應格式不正確。'); }
}

function googleVerifiedEmail_(info) {
  const domain = settings_().schoolDomain;
  const email = String(info && info.email || '').trim().toLowerCase();
  if (!info || info.email_verified !== true || info.hd !== domain || !info.sub || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/i.test(email) || !email.endsWith('@' + domain)) throw new Error('只接受已驗證的本校 Google Workspace 帳戶。請重新選擇校園帳戶。');
  return email;
}

function googleRegistrationPage_(students, identity, ticket) {
  const classes = Array.from(new Set(students.filter(row => row.StudentId && row.Status === 'ACTIVE').map(row => String(row.Class).trim().toUpperCase()))).sort();
  // No roster names, emails or binding states are disclosed before pairing.
  const options = classes.map(name => '<option value="' + escapeHtml_(name) + '">' + escapeHtml_(name) + '</option>').join('');
  const seats = classes.map(name => [name, Array.from(new Set(students.filter(row => row.StudentId && row.Status === 'ACTIVE' && String(row.Class).trim().toUpperCase() === name).map(row => Number(row.ClassNo)).filter(number => Number.isInteger(number) && number > 0 && number <= 999))).sort((a, b) => a - b)]);
  const seatScript = '<script>const seats=new Map(' + JSON.stringify(seats).replace(/</g, '\\u003c') + ');const form=document.querySelector("form");form.elements.className.onchange=()=>{const select=form.elements.classNo;select.replaceChildren(new Option("請選擇學號",""));for(const number of seats.get(form.elements.className.value)||[])select.add(new Option(String(number),String(number)));};</script>';
  const action = escapeHtml_(ScriptApp.getService().getUrl());
  const message = 'Google 已驗證：<strong>' + escapeHtml_(identity.email) + '</strong>。請只配對自己的名冊。如班別或學號不正確，先通知老師，不要選擇其他人。';
  const form = '<form method="post" action="' + action + '"><input type="hidden" name="action" value="google-register"><input type="hidden" name="identityTicket" value="' + ticket + '"><label>班別<select name="className" required><option value="">請選擇班別</option>' + options + '</select></label><label>學號<select name="classNo" required><option value="">請選擇學號</option>' + Array.from({ length: 999 }, (_, index) => '<option value="' + (index + 1) + '">' + (index + 1) + '</option>').join('') + '</select></label><label class="confirm"><input type="checkbox" name="confirmOwnRoster" value="yes" required>我確認這是我自己的班別及學號</label><button class="button" type="submit">確認並登入</button></form><p><a href="' + action + '">換另一個 Google 帳戶</a></p>';
  return HtmlService.createHtmlOutput('<!doctype html><html lang="zh-Hant"><head><base target="_top"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><title>首次 Google 登入</title><style>' + pageStyles_() + 'h1{font-size:clamp(22px,6vw,28px)}label{display:grid;gap:7px;text-align:left;margin:14px 0}select{width:100%;padding:12px;font:inherit;border:1px solid #cbd5e1;border-radius:9px}.confirm{display:flex;align-items:center;font-size:14px}button{border:0}</style></head><body><main><h1>首次登入：配對名冊</h1><p>' + message + '</p>' + form + '</main>' + seatScript + '</body></html>').setTitle('首次 Google 登入');
}

function registerGoogleStudent_(event) {
  if (!googleLoginEnabled_()) throw new Error('新登入流程尚未啟用。');
  const input = event && event.parameter || {};
  const ticket = String(input.identityTicket || '');
  if (!/^[a-f0-9]{64}$/i.test(ticket)) throw new Error('登入確認已失效。');
  return teacherAdminLocked_(() => {
    const cache = CacheService.getScriptCache();
    const key = 'google-register-' + googleHash_(ticket);
    const stored = cache.get(key);
    if (!stored) throw new Error('首次配對已逾時或已使用，請重新登入。');
    const identity = JSON.parse(stored);
    if (identity.callerKey !== googleCallerKey_() || identity.authEpoch !== PropertiesService.getScriptProperties().getProperty('GOOGLE_LOGIN_EPOCH')) throw new Error('登入工作階段已更改，請重新登入。');
    if (input.confirmOwnRoster !== 'yes') throw new Error('請先確認這是自己的名冊。');
    const className = String(input.className || '').trim().toUpperCase();
    const classNo = String(input.classNo || '').trim();
    if (!/^[456][A-Z0-9 -]{0,19}$/.test(className) || !/^\d{1,3}$/.test(classNo) || Number(classNo) < 1) throw new Error('班別或學號不正確。');
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students);
    const students = objects_(sheet);
    if (students.some(row => row.AccountKey === identity.accountKey || String(row.GoogleEmail || '').toLowerCase() === identity.email)) throw new Error('這個 Google 帳戶已配對，請重新登入。');
    const matches = students.filter(row => String(row.Class || '').trim().toUpperCase() === className && Number(row.ClassNo) === Number(classNo));
    if (matches.length !== 1 || !matches[0].StudentId) throw new Error('找不到唯一相符的名冊，請核對班別、學號或通知老師。');
    const student = matches[0];
    assertActiveStudent_(student);
    if (student.AccountKey || student.GoogleEmail) throw new Error('這名學生已配對另一個 Google 帳戶，請由老師修正；不會覆蓋原有綁定。');
    cache.remove(key);
    writeStudentFields_(sheet, student.rowNumber, { AccountKey: identity.accountKey, FirstLinkedAt: new Date(), GoogleEmail: identity.email });
    return googleConnectedPage_(spreadsheet, student, identity);
  });
}

function googleConnectedPage_(spreadsheet, student, identity) {
  assertActiveStudent_(student);
  touchStudentLogin_(spreadsheet, student.rowNumber);
  const settings = settings_();
  const token = createConnectionToken_(identity.accountKey, student.StudentId, settings.tokenTtlSeconds, identity);
  const schoolData = buildSchoolData_(spreadsheet, student.StudentId);
  return page_('Google 登入成功', escapeHtml_(student.Class) + '（' + escapeHtml_(student.ClassNo) + '）' + escapeHtml_(student.ChineseName) + '<br>已驗證 ' + escapeHtml_(identity.email) + '。只有按「同步至學校」才會傳送學習紀錄。', returnUrl_(settings.siteProgressUrl, token, schoolData, {}), '前往 ICT 學習網站');
}

function verifyGoogleConnection_(token) {
  if (!/^[a-f0-9]{64}$/i.test(String(token))) throw new Error('Google 登入連接已失效，請重新登入。');
  const cacheKey = tokenCacheKey_(token);
  const stored = CacheService.getScriptCache().get(cacheKey);
  if (!stored) throw new Error('Google 登入連接已過期，請重新登入。');
  const identity = JSON.parse(stored);
  if (identity.authMode !== 'google' || identity.authEpoch !== PropertiesService.getScriptProperties().getProperty('GOOGLE_LOGIN_EPOCH') || identity.callerKey !== googleCallerKey_()) throw new Error('Google 登入工作階段已更改，請重新登入。');
  return Object.assign(identity, { cacheKey });
}

function googleAuthSettingsPage_() {
  const authorization = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  if (authorization.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) return page_('老師執行授權', '新登入需要由 Script 連接 Google 身份服務，請由部署老師确认新權限後再返回。學生不會取得試算表權限。', authorization.getAuthorizationUrl(), '確認 Google 權限');
  assertDeploymentOwner_();
  const template = HtmlService.createTemplateFromFile('GoogleAuthSettings');
  template.initial = teacherGoogleAuthBootstrap();
  return template.evaluate().setTitle('Google 登入設定').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** This page needs only login settings, not the student/group/assignment lookups. */
function teacherGoogleAuthBootstrap() {
  assertDeploymentOwner_();
  const token = googleRandom_();
  CacheService.getScriptCache().put('teacher-console-' + token, Session.getActiveUser().getEmail().toLowerCase(), 1800);
  return { token, googleLogin: googleAuthPublicStatus_() };
}

/** Standard POST works even when the browser cannot run google.script.run. */
function saveGoogleAuthForm_(event) {
  const settingsUrl = ScriptApp.getService().getUrl() + '?auth-settings=1';
  try {
    const result = teacherGoogleAuthSave(event && event.parameter || {});
    const status = result.status;
    const message = escapeHtml_(status.statusMessage) + (status.configError ? '<br>' + escapeHtml_(status.configError) : '')
      + '<br>儲存 OAuth 憑證不會同步學習紀錄，也不會自動啟用新登入。<br><a href="' + escapeHtml_(settingsUrl) + '" target="_top">返回登入設定</a>';
    return page_('OAuth 設定已儲存', message, status.configured ? status.redirectUri + '?google-test=1' : settingsUrl,
      status.configured ? '測試 Google 帳戶選擇' : '查看設定診斷');
  } catch (error) {
    return page_('OAuth 設定未能儲存', safeError_(error), settingsUrl, '返回登入設定再試');
  }
}

function teacherGoogleAuthSave(request) {
  assertDeploymentOwner_(); teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    if (googleLoginEnabled_()) throw new Error('登入已啟用；如需更換 OAuth Client，請先由維護人員安排安全遷移。');
    const clientId = String(request.clientId || '').trim();
    const clientSecret = String(request.clientSecret || '').trim();
    if (!/^\d+-[a-z0-9_-]+\.apps\.googleusercontent\.com$/i.test(clientId)) throw new Error('Client ID 格式不正確：請貼上以 .apps.googleusercontent.com 結尾的識別碼，不是 Google Cloud 網址或專案編號。');
    if (!/^[A-Za-z0-9_-]{12,256}$/.test(clientSecret)) throw new Error('Client secret 格式不正確：請貼上完整密鑰，不可使用遮罩、只有末幾位或整段 JSON。');
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('GOOGLE_LOGIN_CLIENT_ID', clientId);
    properties.setProperty('GOOGLE_LOGIN_CLIENT_SECRET', clientSecret);
    properties.deleteProperty('GOOGLE_LOGIN_TESTED');
    return { message: 'OAuth 設定已安全儲存在 Script Properties；請先測試 Google 登入。', status: googleAuthPublicStatus_() };
  });
}

/** One-time, opt-in migration. Preserve IDs and every progress/group/assignment sheet. */
function teacherGoogleAuthEnable(request) {
  assertDeploymentOwner_(); teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    if (googleLoginEnabled_()) return { message: 'Google 登入已啟用，沒有再次清除綁定。', status: googleAuthPublicStatus_() };
    const status = googleAuthPublicStatus_();
    if (!status.tested || request.confirm !== 'RESET_OLD_BINDINGS') throw new Error('請先完成 Google 登入測試及確認重設舊綁定。');
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const sheet = ensureSheet_(spreadsheet, SCHOOL_SYNC_SHEETS.students);
    const students = objects_(sheet).filter(row => row.StudentId || row.Class || row.ClassNo);
    const seenIds = new Set(), seenSeats = new Set(), seenEmails = new Set();
    students.forEach(row => {
      const seat = String(row.Class).trim().toUpperCase() + '|' + Number(row.ClassNo);
      if (!row.StudentId || seenIds.has(String(row.StudentId)) || seenSeats.has(seat) || !/^[456][A-Z0-9 -]{0,19}$/.test(String(row.Class).trim().toUpperCase()) || !/^\d{1,3}$/.test(String(row.ClassNo)) || Number(row.ClassNo) < 1) throw new Error('名冊有缺漏或重複 StudentId／班別學號，請先在後台修正。');
      const email = googleTeacherEmail_(row.GoogleEmail);
      if (email && seenEmails.has(email)) throw new Error('名冊有重複 Google 電郵，請先修正。');
      seenIds.add(String(row.StudentId)); seenSeats.add(seat); if (email) seenEmails.add(email);
    });
    const backupName = 'StudentsLoginBackup_' + new Date().getTime();
    const backup = sheet.copyTo(spreadsheet).setName(backupName);
    if (backup.getLastRow() !== sheet.getLastRow()) throw new Error('未能確認名冊備份，沒有重設綁定。');
    const count = sheet.getLastRow() - 1;
    const headers = studentHeaders_(sheet);
    const resetColumns = ['AccountKey', 'FirstLinkedAt'].map(field => headers.indexOf(field) + 1);
    const original = count > 0 ? sheet.getRange(2, 1, count, headers.length).getValues() : [];
    if (count > 0 && googleHash_(JSON.stringify(original)) !== googleHash_(JSON.stringify(backup.getRange(2, 1, count, headers.length).getValues()))) throw new Error('名冊備份內容未能核對，沒有重設綁定。');
    const properties = PropertiesService.getScriptProperties();
    try {
      if (count > 0) {
        resetColumns.forEach(column => sheet.getRange(2, column, count, 1).clearContent());
        // Teacher-prefilled new GoogleEmail values are intentionally kept.
      }
      SpreadsheetApp.flush();
      properties.setProperty('GOOGLE_LOGIN_BACKUP_SHEET', backupName);
      properties.setProperty('GOOGLE_LOGIN_EPOCH', googleRandom_());
      properties.setProperty('STUDENT_AUTH_MODE', 'GOOGLE'); // Activate last; legacy tokens now fail closed.
    } catch (error) {
      if (count > 0) resetColumns.forEach(column => sheet.getRange(2, column, count, 1).setValues(original.map(row => [row[column - 1]])));
      properties.deleteProperty('STUDENT_AUTH_MODE');
      throw new Error('啟用未完成；已保留／復原舊綁定。請核對備份 ' + backupName + '。');
    }
    return { message: 'Google 登入已啟用。名冊及歷史進度保留，舊綁定已備份後重設。學生首次重新配對，之後毋須啟用碼。', status: googleAuthPublicStatus_() };
  });
}

function googleTeacherEmail_(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email && (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+$/i.test(email) || !email.endsWith('@' + settings_().schoolDomain))) throw new Error('請填入本校 Google 電郵，或留空以解除配對。');
  return email;
}

/** Correct/unlink only login fields, with revision check. Never move/delete learning history. */
function teacherGoogleAuthCorrect(request) {
  assertDeploymentOwner_(); teacherAdminAuthorize_(request);
  return teacherAdminLocked_(() => {
    const spreadsheet = activeOrConfiguredSpreadsheet_();
    const students = teacherAdminRows_(spreadsheet, 'students');
    const row = teacherAdminCurrent_(Object.assign({}, request, { table: 'students' }), students);
    const email = googleTeacherEmail_(request.email);
    if (email && students.some(other => other.StudentId !== row.StudentId && String(other.GoogleEmail || '').toLowerCase() === email)) throw new Error('此 Google 電郵已配對另一名學生；請先解除錯誤名冊的配對。');
    const sheet = teacherAdminSheet_(spreadsheet, 'students');
    if (!googleLoginEnabled_()) {
      writeStudentFields_(sheet, row.rowNumber, { GoogleEmail: email });
      return { message: '已預填 Google 電郵；尚未啟用新登入，舊綁定沒有更改。', lookups: teacherAdminLookups_(spreadsheet) };
    }
    // Rotate epoch to invalidate previously issued tickets/tokens, including rebind to the same email.
    PropertiesService.getScriptProperties().setProperty('GOOGLE_LOGIN_EPOCH', googleRandom_());
    writeStudentFields_(sheet, row.rowNumber, { AccountKey: '', FirstLinkedAt: '', GoogleEmail: email });
    return { message: '登入配對已修改。所有學生需重新連接學校；StudentId、群組和已有學習紀錄沒有更改。', lookups: teacherAdminLookups_(spreadsheet) };
  });
}
