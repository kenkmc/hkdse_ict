const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = {
    location: { pathname: "/practice.html", href: "" },
    alert() {}
};
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "question_data.js"), "utf8"), context, { filename: "question_data.js" });

const questions = browser.HKDSE_ICT_QUESTIONS;
const platform = browser.HKDSE_ICT;
const errors = [];
const ids = new Set();
const allowedTypes = new Set(["mcq", "short-answer", "sql"]);
const allowedDifficulties = new Set(["foundation", "standard", "advanced"]);

if (!Array.isArray(questions) || !questions.length) {
    errors.push("題庫不存在或沒有題目。");
} else {
    questions.forEach(question => {
        if (ids.has(question.id)) errors.push(`重複題目 id：${question.id}`);
        ids.add(question.id);

        if (!platform.getItemById(question.topicId)) errors.push(`${question.id} 的 topicId 不存在：${question.topicId}`);
        if (!allowedTypes.has(question.type)) errors.push(`${question.id} 的題型無效：${question.type}`);
        if (!allowedDifficulties.has(question.difficulty)) errors.push(`${question.id} 的難度無效：${question.difficulty}`);
        if (!Number.isInteger(question.marks) || question.marks < 1) errors.push(`${question.id} 的分數必須為正整數。`);
        if (!question.question || !question.answer || !question.explanation) errors.push(`${question.id} 缺少題目、答案或解釋。`);
        if (!Array.isArray(question.markingScheme) || !question.markingScheme.length) errors.push(`${question.id} 缺少評分準則。`);

        const schemeMarks = question.markingScheme?.reduce((sum, point) => sum + point.marks, 0);
        if (schemeMarks !== question.marks) errors.push(`${question.id} 的評分準則合計 ${schemeMarks} 分，但題目標示 ${question.marks} 分。`);

        if (question.type === "mcq") {
            const optionValues = new Set(question.options?.map(option => option.value));
            if (!optionValues.size || !optionValues.has(question.answer)) errors.push(`${question.id} 的選項或答案無效。`);
        }
    });
}

if (errors.length) {
    console.error(`題庫驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    const marks = questions.reduce((sum, question) => sum + question.marks, 0);
    console.log(`題庫驗證通過：${questions.length} 題，共 ${marks} 分，所有課題連結及評分準則均有效。`);
}
