const fs = require("node:fs");
const path = require("node:path");

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

if (!config.includes("enabled: false") || !config.includes('webAppUrl: ""')) {
    errors.push("未部署前的設定不應自動啟用或包含未知端點。");
}
if (!progress.includes("getSyncSnapshot") || !progress.includes('format: "hkdse-ict-school-sync"')) {
    errors.push("統一進度儲存缺少最少化的校園同步摘要。");
}
[
    "sessions:", "pageActivity:", "exerciseAttempts:", "startPageActivity", "120000"
].forEach(marker => {
    if (!progress.includes(marker)) errors.push(`有效學習時間記錄缺少 ${marker}。`);
});
if (!navigation.includes("school_sync_config.js?v=2") || !navigation.includes("assets/js/school_sync.js?v=2")) {
    errors.push("內容頁面的全站導覽沒有載入校園同步模組。");
}
if (!indexHtml.includes("school_sync_config.js?v=2") || !indexHtml.includes("assets/js/school_sync.js?v=2")) {
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

if (errors.length) {
    console.error(`校園同步驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log("校園同步驗證通過：短期連接碼、網域身份、資料最少化、同步回執、離開提醒、Sheet寫入及安全預設齊備。");
}
