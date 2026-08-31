const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const values = new Map();
const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
};
const browser = {
    location: { pathname: "/progress.html", href: "" },
    localStorage,
    dispatchEvent() {},
    CustomEvent: function CustomEvent() {}
};
const context = { window: browser, console, Date, Math, CustomEvent: browser.CustomEvent };
vm.createContext(context);
["course_data.js", "question_data.js", "assets/js/progress_store.js"].forEach(file => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
});

const progress = browser.HKDSEProgress;
const question = browser.HKDSE_ICT_QUESTIONS.find(item => item.type === "mcq");
const errors = [];

progress.recordVisit("cha-1");
progress.recordVisit("cha-1");
progress.recordVisit("tool-my-learning");
progress.recordQuestionAttempt(question, question.answer, question.marks, { source: "practice" });
progress.recordQuestionAttempt(question, "Z", 0, { source: "mock", section: "1A" });
progress.recordMockAttempt({ mode: "paper1", paperLabel: "測試卷", score: 55, maxScore: 100, percentage: 55, topicScores: { "cha-1": { earned: 1, possible: 2 } } });
progress.setFocusState("cha-1", { step: 3, mode: "focus" });
localStorage.setItem("hkdse-ict-study-records-v1", JSON.stringify([{ status: "scheduled", dueAt: "2000-01-01T00:00:00.000Z" }]));
localStorage.setItem("hkdse-ict-layered-learning-v1", JSON.stringify({ "cha-1": { levels: { foundation: { completed: true } } } }));

const state = progress.read();
const summary = progress.getSummary();
if (state.events.length !== 2) errors.push("題目作答事件沒有完整保存答對及答錯記錄。");
if (state.visits["cha-1"]?.count !== 2) errors.push("課題瀏覽次數記錄不正確。");
if (progress.getFocusState("cha-1").step !== 3) errors.push("課題專注步驟沒有保存。");
if (state.mockAttempts.length !== 1 || state.mockAttempts[0].percentage !== 55) errors.push("模擬考歷史沒有保存。");
if (summary.visitedLessons !== 1) errors.push("工具頁被錯誤計入已瀏覽課題。");
if (summary.questionAttempts !== 2 || summary.accuracy !== 50) errors.push("練習次數或累積得分率計算錯誤。");
if (summary.dueReviews !== 1 || summary.completedLayers !== 1) errors.push("舊有錯題或分層課業記錄未能納入摘要。");

const backup = progress.exportData();
progress.clear();
if (progress.read().events.length) errors.push("清除統一進度後仍殘留事件。");
progress.importData(backup);
if (progress.read().events.length !== 2 || progress.read().mockAttempts.length !== 1) errors.push("匯出及匯入備份未能還原資料。");

const items = browser.HKDSE_ICT.getItems();
const progressItem = items.find(item => item.id === "tool-my-learning");
if (!progressItem || progressItem.file !== "progress.html") errors.push("中央目錄缺少「我的學習」頁面。");
const progressHtml = fs.readFileSync(path.join(root, "progress.html"), "utf8");
if (!progressHtml.includes("progress_dashboard.js") || !progressHtml.includes("只存於這個瀏覽器")) errors.push("進度頁缺少儀表板或本機私隱提示。");

items.forEach(item => {
    const html = fs.readFileSync(path.join(root, item.file), "utf8");
    const courseIndex = html.indexOf("course_data.js?v=7");
    const progressIndex = html.indexOf("assets/js/progress_store.js?v=1");
    if (progressIndex < 0) errors.push(`${item.file} 未載入統一進度記錄。`);
    if (courseIndex >= 0 && progressIndex < courseIndex) errors.push(`${item.file} 在中央目錄之前載入進度記錄。`);
    ["question_engine.js", "mock_exam.js", "site_navigation.js", "lesson_companion.js"].forEach(script => {
        const actionIndex = html.indexOf(script);
        if (actionIndex >= 0 && progressIndex > actionIndex) errors.push(`${item.file} 在 ${script} 之後才載入進度記錄。`);
    });
});

const companionSource = fs.readFileSync(path.join(root, "assets/js/lesson_companion.js"), "utf8");
const learningCss = fs.readFileSync(path.join(root, "assets/css/learning.css"), "utf8");
if (!companionSource.includes("data-focus-step") || !companionSource.includes("setFocusState")) errors.push("課堂五步專注模式未接到進度記錄。");
if (!learningCss.includes(".lesson-focus-panel[hidden]")) errors.push("專注模式缺少隱藏面板樣式。");

if (errors.length) {
    console.error(`學習進度驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`學習進度驗證通過：${items.length} 個內容頁面均已接入；瀏覽、題目、模擬考、弱項摘要、舊記錄兼容、專注模式及備份流程有效。`);
}
