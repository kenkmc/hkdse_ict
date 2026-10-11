const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const errors = [];
const client = read("assets/js/school_sync.js");
const config = read("school_sync_config.js");
const progress = read("assets/js/progress_store.js");
const navigation = read("assets/js/site_navigation.js");
const progressHtml = read("progress.html");
const indexHtml = read("index.html");
const server = read("google-apps-script/Code.gs");
const manifest = JSON.parse(read("google-apps-script/appsscript.json"));
const setup = read("google-apps-script/README.md");

[
    ["sessionStorage", "連接碼沒有使用工作階段儲存。"],
    ["school-connect", "客戶端沒有接收網址片段內的連接碼。"],
    ["beforeunload", "客戶端缺少離開網站提醒。"],
    ["hkdse-progress-change", "客戶端沒有監察統一進度變更。"],
    ["BroadcastChannel", "跨分頁連接碼輪替缺少通知機制。"],
    ["pendingFingerprint", "同步成功前沒有保留提交版本。"],
    ["clientNonce", "同步回執缺少一次性確認碼。"],
    ["method=\"post\"", "同步表單沒有使用 POST。"]
].forEach(([marker, message]) => {
    if (!client.includes(marker) && !progressHtml.includes(marker)) errors.push(message);
});

const configContext = { window: {} };
vm.runInNewContext(config, configContext, { filename: "school_sync_config.js" });
const settings = configContext.window.HKDSE_SCHOOL_SYNC_CONFIG;
const webAppPattern = /^https:\/\/script\.google\.com\/(?:a\/macros\/[a-z0-9.-]+\/|macros\/)s\/[A-Za-z0-9_-]+\/exec$/;
if (settings.enabled && !webAppPattern.test(settings.webAppUrl)) {
    errors.push("已啟用的設定必須使用 Google 的正式 /exec 端點。");
}
if (!settings.enabled && settings.webAppUrl) {
    errors.push("未啟用的設定不應保留端點。");
}
if (!progress.includes("getSyncSnapshot") || !progress.includes('format: "hkdse-ict-school-sync"')) {
    errors.push("統一進度儲存缺少最少化的校園同步摘要。");
}
[
    "sessions:", "pageActivity:", "exerciseAttempts:", "startPageActivity", "120000"
].forEach(marker => {
    if (!progress.includes(marker)) errors.push(`有效學習時間記錄缺少 ${marker}。`);
});
if (!navigation.includes("school_sync_config.js?v=3") || !navigation.includes("assets/js/school_sync.js?v=3")) {
    errors.push("內容頁面的全站導覽沒有載入校園同步模組。");
}
if (!indexHtml.includes("school_sync_config.js?v=3") || !indexHtml.includes("assets/js/school_sync.js?v=3")) {
    errors.push("首頁沒有載入校園同步模組。");
}
[
    "school-sync-panel", "school-sync-form", "school-sync-payload",
    "school-sync-token", "school-sync-output", "progress-storage-badge"
].forEach(marker => {
    if (!progressHtml.includes(marker)) errors.push(`進度頁缺少 ${marker}。`);
});

[
    "Session.getActiveUser().getEmail()",
    "SCHOOL_DOMAIN",
    "SITE_PROGRESS_URL",
    "CacheService.getScriptCache()",
    "LockService.getScriptLock()",
    "computeHmacSha256Signature",
    "ACCOUNT_KEY_SECRET",
    "connectionToken",
    "clientNonce",
    "TeacherDashboard",
    "Students",
    "Groups",
    "GroupMembers",
    "Assignments",
    "AssignmentTargets",
    "AssignmentItems",
    "AssignmentProgress",
    "LearningSessions",
    "PageActivity",
    "ExerciseAttempts",
    "ProgressLatest",
    "TopicProgress",
    "initialiseSchoolSync",
    "generateActivationCodes",
    "ActivationCode",
    "AccountKey"
].forEach(marker => {
    if (!server.includes(marker)) errors.push(`Apps Script 後端缺少 ${marker}。`);
});
if (server.includes("SchoolEmail")) errors.push("Students 不應保存校園電郵地址。");
if (!client.includes("school-assignment-list") || !client.includes("evaluateAssignments")) {
    errors.push("學生畫面缺少指定課業及完成度計算。");
}
if (server.includes("ANYONE_ANONYMOUS")) errors.push("Apps Script 不應容許匿名存取。");
if (manifest.webapp?.access !== "DOMAIN" || manifest.webapp?.executeAs !== "USER_DEPLOYING") {
    errors.push("Apps Script manifest 未限制校園網域或未以部署者身分執行。");
}
if (!setup.includes("SCHOOL_DOMAIN") || !setup.includes("/exec") || !setup.includes("私人 Gmail")) {
    errors.push("部署說明缺少必要屬性、正式網址或帳戶隔離測試。");
}

// Exercise the real browser module with isolated storage and a small DOM stub.
function runClient(webAppUrl, enabled = true, connectedStudentId = "", incomingStudentId = "") {
    const localValues = new Map();
    const sessionValues = new Map();
    const storage = values => ({
        getItem(key) { return values.get(key) || null; },
        setItem(key, value) { values.set(key, String(value)); },
        removeItem(key) { values.delete(key); }
    });
    if (connectedStudentId) localValues.set("hkdse-ict-school-sync-state-v1", JSON.stringify({ linkedStudentId: connectedStudentId }));
    const snapshot = {
        summary: { visitedLessons: 1 },
        topics: [], recentMocks: [], exerciseAttempts: [],
        pageActivity: [{ pageId: "cha-1", viewCount: 1, activeSeconds: 0 }]
    };
    sessionValues.set("hkdse-ict-school-profile-v1", JSON.stringify({
        student: { studentId: "TEST-STUDENT" },
        assignments: [{ assignmentId: "TEST-TASK", items: [{
            itemId: "TEST-ITEM", requirementType: "VISIT_PAGE", resourceId: "cha-1", targetValue: 1, required: true
        }] }]
    }));
    let testNow = Date.parse("2026-10-11T00:00:00Z");
    class TestDate extends Date {
        constructor(...args) { super(...(args.length ? args : [testNow])); }
        static now() { return testNow; }
    }
    const windowEvents = {};
    const documentEvents = {};
    let reminder;
    const document = {
        body: { append(node) { reminder = node; } },
        head: { append() {} },
        querySelector(selector) { return selector.includes("reminder") ? reminder : null; },
        getElementById() { return null; },
        createElement() { return { dataset: {}, setAttribute() {}, querySelector() { return { addEventListener() {} }; } }; },
        addEventListener(type, handler) { documentEvents[type] = handler; }
    };
    const browser = {
        localStorage: storage(localValues), sessionStorage: storage(sessionValues),
        location: { href: "https://kenkmc.github.io/hkdse_ict/progress.html", hash: incomingStudentId ? `#school-connect=${"a".repeat(64)}&school-data=${Buffer.from(JSON.stringify({ student: { studentId: incomingStudentId }, assignments: [] })).toString("base64url")}` : "", search: "", pathname: "/hkdse_ict/progress.html", origin: "https://kenkmc.github.io" },
        history: { replaceState() {} },
        alert() {},
        atob: value => Buffer.from(value, "base64").toString("binary"),
        HKDSEProgress: { getSyncSnapshot() { return JSON.parse(JSON.stringify(snapshot)); } },
        HKDSE_SCHOOL_SYNC_CONFIG: { enabled, webAppUrl },
        addEventListener(type, handler) { windowEvents[type] = handler; }
    };
    vm.runInNewContext(client, { window: browser, document, URL, URLSearchParams, Date: TestDate, TextDecoder, Uint8Array, console });
    return { api: browser.HKDSESchoolSync, browser, snapshot, windowEvents, documentEvents, advanceTime() { testNow += 60000; } };
}

const canonical = "https://script.google.com/macros/s/TEST_DEPLOYMENT/exec";
const domainUrl = "https://script.google.com/a/macros/jcmkec.edu.hk/s/TEST_DEPLOYMENT/exec";
if (!runClient(canonical).api.configured || !runClient(domainUrl).api.configured) {
    errors.push("客戶端未同時接受一般及校園網域的正式 Web App 網址。");
}
[canonical.replace("/exec", "/dev"), canonical.replace("https:", "http:"), canonical.replace("script.google.com", "script.google.com.example.org")].forEach(url => {
    if (runClient(url).api.configured) errors.push("客戶端接受了不安全或測試用端點。");
});
if (runClient(canonical, false).api.configured) errors.push("停用設定仍啟用了同步。");
const blockedAccount = runClient(domainUrl, true, "STUDENT-A", "STUDENT-B");
if (blockedAccount.browser.sessionStorage.getItem("hkdse-ict-school-sync-token-v1")) errors.push("共用瀏覽器錯誤地把原有紀錄連接到另一名學生。");
const sameAccount = runClient(domainUrl, true, "STUDENT-A", "STUDENT-A");
if (!sameAccount.browser.sessionStorage.getItem("hkdse-ict-school-sync-token-v1")) errors.push("同一學生無法重新連接。");
sameAccount.windowEvents["hkdse-progress-clear"]();
if (sameAccount.browser.sessionStorage.getItem("hkdse-ict-school-sync-token-v1") || sameAccount.browser.sessionStorage.getItem("hkdse-ict-school-profile-v1")) {
    errors.push("清除本機紀錄後仍保留校園連接或學生資料。");
}

const runtime = runClient(domainUrl);
const firstCompletion = runtime.api.evaluateAssignments(runtime.snapshot)[0];
runtime.advanceTime();
const secondCompletion = runtime.api.evaluateAssignments(runtime.snapshot)[0];
if (firstCompletion.status !== "COMPLETED" || firstCompletion.completedAt !== secondCompletion.completedAt) {
    errors.push("已完成課業的時間戳不穩定，會產生虛假的待同步變更。");
}
runtime.snapshot.pageActivity[0].viewCount = 0;
if (runtime.api.evaluateAssignments(runtime.snapshot)[0].completedAt) {
    errors.push("課業變為未完成後仍保留完成時間。");
}
runtime.snapshot.pageActivity[0].viewCount = 1;
function clickLink(target, href, extra = {}) {
    runtime.documentEvents.click({ button: 0, target: { closest() { return { target, href, hasAttribute() { return false; } }; } }, ...extra });
    let reminded = false;
    runtime.windowEvents.beforeunload({ preventDefault() { reminded = true; } });
    return reminded;
}
if (!clickLink("_blank", "https://kenkmc.github.io/hkdse_ict/cha.1.html")) errors.push("開新分頁錯誤地停用了離開提醒。");
if (!clickLink("", "https://kenkmc.github.io/hkdse_ict/progress.html#school-sync-panel")) errors.push("頁內連結錯誤地停用了離開提醒。");
if (clickLink("", "https://kenkmc.github.io/hkdse_ict/cha.1.html")) errors.push("正常站內跳頁不應顯示關閉網站提醒。");
if (!clickLink("", "https://kenkmc.github.io/hkdse_ict/cha.1.html", { ctrlKey: true })) errors.push("Ctrl 開啟新分頁錯誤地停用了離開提醒。");

// The owner-only setup must work from a Web App, where no active container is available.
const serverContext = { console };
vm.runInNewContext(server, serverContext, { filename: "Code.gs" });
const originalInitialise = serverContext.initialiseSchoolSync;
let initialised = 0;
let activeEmail = "teacher@example.edu.hk";
const ownerEmail = "teacher@example.edu.hk";
serverContext.authorisedEmail_ = () => activeEmail;
serverContext.Session = { getEffectiveUser() { return { getEmail() { return ownerEmail; } }; } };
serverContext.initialiseSchoolSync = () => { initialised += 1; };
const cache = new Map();
serverContext.CacheService = { getScriptCache() { return { put(key, value) { cache.set(key, value); }, get(key) { return cache.get(key); }, remove(key) { cache.delete(key); } }; } };
serverContext.Utilities = { getUuid() { return "12345678-1234-1234-1234-123456789abc"; } };
let needsAuthorization = false;
serverContext.ScriptApp = {
    AuthMode: { FULL: "FULL" }, AuthorizationStatus: { REQUIRED: "REQUIRED" },
    getAuthorizationInfo() { return { getAuthorizationStatus() { return needsAuthorization ? "REQUIRED" : "NOT_REQUIRED"; }, getAuthorizationUrl() { return "https://accounts.google.com/test-authorization"; } }; },
    getService() { return { getUrl() { return domainUrl; } }; }
};
serverContext.settings_ = () => ({ sheetId: "TEST-SHEET" });
serverContext.page_ = (title, message) => ({ title, message });
const ownerResult = serverContext.teacherSetupPage_();
if (initialised !== 1 || !ownerResult.message.includes("generate-codes")) errors.push("老師設定頁未執行初始化或缺少產生啟用碼按鈕。");
needsAuthorization = true;
if (serverContext.teacherSetupPage_().title !== "老師執行授權" || initialised !== 1) errors.push("未獲 Google 執行授權時仍嘗試寫入試算表。");
needsAuthorization = false;
activeEmail = "student@example.edu.hk";
let deniedStudent = false;
try { serverContext.teacherSetupPage_(); } catch (error) { deniedStudent = true; }
if (!deniedStudent || initialised !== 1) errors.push("學生能執行老師初始設定。");
for (const adminFunction of [originalInitialise, serverContext.generateActivationCodes, serverContext.refreshTeacherDashboard]) {
    let deniedDirectCall = false;
    try { adminFunction(); } catch (error) { deniedDirectCall = error.message.includes("只有部署"); }
    if (!deniedDirectCall) errors.push("學生能直接呼叫公開的管理函數，繞過老師設定頁。");
}
activeEmail = ownerEmail;
let deniedInvalidToken = false;
try { serverContext.teacherGenerateCodes_({ parameter: { adminToken: "invalid" } }); } catch (error) { deniedInvalidToken = true; }
if (!deniedInvalidToken) errors.push("老師管理表單接受了無效操作確認碼。");

const properties = new Map();
serverContext.PropertiesService = { getScriptProperties() { return { getProperty(key) { return properties.get(key); }, setProperty(key, value) { properties.set(key, value); } }; } };
serverContext.SCHOOL_SYNC_BOUND_SHEET_ID = "TEST-SHEET";
let openedId = "";
serverContext.SpreadsheetApp = { getActiveSpreadsheet() { return null; }, openById(id) { openedId = id; return { getId() { return id; } }; } };
serverContext.ensureSheet_ = () => {};
serverContext.configureSheets_ = () => {};
serverContext.refreshTeacherDashboard_ = () => {};
originalInitialise();
if (openedId !== "TEST-SHEET" || properties.get("SHEET_ID") !== "TEST-SHEET") errors.push("Web App 沒有正確使用伺服器端的綁定試算表設定。");
if (server.includes("insertCheckboxes()")) errors.push("重複初始化會重設已有組別或課業核取方塊。");

if (errors.length) {
    console.error(`校園同步驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log("校園同步驗證通過：網域端點、安全設定、穩定課業時間戳、離開提醒、最少化資料及 Sheet 寫入齊備。");
}
