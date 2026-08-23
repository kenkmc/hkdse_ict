const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const values = new Map();
const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); }
};
const browser = {
    location: { pathname: "/practice.html", href: "" },
    localStorage,
    alert() {},
    dispatchEvent() {}
};
const context = { window: browser, console, Date, CustomEvent: function CustomEvent() {} };
vm.createContext(context);
["course_data.js", "question_data.js", "assets/js/study_records.js"].forEach(file => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
});

const store = browser.HKDSEStudyRecords;
const question = browser.HKDSE_ICT_QUESTIONS.find(item => item.type === "mcq");
const errors = [];
function attempt(response) {
    const grade = store.grade(question, response);
    return store.recordAttempt(question, response, grade.awarded, grade.missedCriteria);
}

const wrong = attempt("Z");
if (wrong.intervalIndex !== 0 || wrong.status !== "scheduled") errors.push("首次錯誤沒有安排 1 日後重練。");
const afterDay1 = attempt(question.answer);
if (afterDay1.intervalIndex !== 1 || afterDay1.status !== "scheduled") errors.push("1 日階段後沒有安排 3 日重練。");
const afterDay3 = attempt(question.answer);
if (afterDay3.intervalIndex !== 2 || afterDay3.status !== "scheduled") errors.push("3 日階段後沒有安排 7 日重練。");
const afterDay7 = attempt(question.answer);
if (afterDay7.intervalIndex !== 3 || afterDay7.status !== "scheduled") errors.push("7 日階段後沒有安排 14 日重練。");
const afterDay14 = attempt(question.answer);
if (afterDay14.status !== "mastered" || store.isDue(afterDay14)) errors.push("14 日階段完成後沒有正確標記為已鞏固。");
if (!afterDay14.originalMissedCriteria.length || !afterDay14.originalErrorType) errors.push("答對後遺失了原始錯誤類型或評分點。");
const relapse = attempt("Z");
if (relapse.intervalIndex !== 0 || relapse.status !== "scheduled") errors.push("再次失分後沒有回到 1 日重練階段。");

if (errors.length) {
    console.error(`錯題重練驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log("錯題重練驗證通過：1、3、7、14 日階段、已鞏固狀態、再次失分重設及原始錯誤保留均有效。");
}
