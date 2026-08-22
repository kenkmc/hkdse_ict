const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/index.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "question_data.js"), "utf8"), context, { filename: "question_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "learning_data.js"), "utf8"), context, { filename: "learning_data.js" });

const platform = browser.HKDSE_ICT;
const learning = browser.HKDSE_ICT_LEARNING;
const questions = browser.HKDSE_ICT_QUESTIONS || [];
const errors = [];

if (!learning?.pages) {
    errors.push("learning_data.js 沒有公開有效的學習提示資料。");
} else {
    const catalogIds = new Set(platform.getItems().map(item => item.id));
    const catalogById = new Map(platform.getItems().map(item => [item.id, item]));
    const questionById = new Map(questions.map(question => [question.id, question]));
    const learningIds = new Set(Object.keys(learning.pages));

    catalogIds.forEach(id => {
        if (!learningIds.has(id)) errors.push(`目錄項目缺少學習提示：${id}`);
    });
    learningIds.forEach(id => {
        if (!catalogIds.has(id)) errors.push(`學習提示引用不存在的目錄項目：${id}`);
    });

    Object.entries(learning.pages).forEach(([id, page]) => {
        if (!Array.isArray(page.objectives) || page.objectives.length < 2) errors.push(`${id} 至少需要兩個學習目標。`);
        if (!Array.isArray(page.concepts) || page.concepts.length < 3) errors.push(`${id} 至少需要三個概念節點。`);
        if (!Array.isArray(page.misconceptions) || !page.misconceptions.length) errors.push(`${id} 缺少常見誤解。`);
        if (!page.examTip) errors.push(`${id} 缺少 DSE 提示。`);

        if (catalogById.get(id)?.type === "lesson") {
            if (!page.scopeNote) errors.push(`${id} 缺少課程界線提示。`);
            if (!page.featuredQuestionId && !page.embeddedExamPractice) {
                errors.push(`${id} 缺少頁內 DSE 題型或嵌入式練習標記。`);
            }
            if (page.featuredQuestionId) {
                const featured = questionById.get(page.featuredQuestionId);
                if (!featured) errors.push(`${id} 引用不存在的精選題目：${page.featuredQuestionId}`);
                if (featured && featured.topicId !== id) errors.push(`${id} 的精選題目屬於其他課題：${featured.topicId}`);
            }
        }

        const check = page.quickCheck;
        if (!check?.question || !check.explanation || !Array.isArray(check.options)) errors.push(`${id} 的快速檢查不完整。`);
        if (!Number.isInteger(check?.answerIndex) || check.answerIndex < 0 || check.answerIndex >= check.options.length) {
            errors.push(`${id} 的快速檢查答案索引無效。`);
        }
    });
}

if (errors.length) {
    console.error(`學習提示驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`學習提示驗證通過：${Object.keys(learning.pages).length} 個頁面均有目標、概念圖、常見誤解及快速檢查；所有課程頁亦有課程界線及 DSE 題型。`);
}
