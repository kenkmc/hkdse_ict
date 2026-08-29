const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/answer-lab.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "past_paper_data.js"), "utf8"), context, { filename: "past_paper_data.js" });

const platform = browser.HKDSE_ICT;
const study = browser.HKDSE_ICT_PAST_PAPER_INDEX?.performanceStudy;
const errors = [];
const expectedLayers = ["foundation", "exam", "challenge"];

if (!study) {
    errors.push("past_paper_data.js 缺少 performanceStudy。 ");
} else {
    if (study.year !== 2025 || !study.officialPage?.includes("hkeaa.edu.hk")) errors.push("官方示例年份或來源頁無效。");
    if (!Array.isArray(study.sourceFiles) || study.sourceFiles.length !== 6) errors.push("應提供前言及第 1 至第 5 級共 6 個官方 PDF 連結。");
    study.sourceFiles?.forEach(source => {
        if (!source.id || !source.label || !/^https:\/\/www\.hkeaa\.edu\.hk\//.test(source.href || "")) errors.push(`官方 PDF 資料不完整：${source.id || "未命名"}`);
    });
    if (!Array.isArray(study.observedLevels) || study.observedLevels.length !== 5) errors.push("等級觀察必須包含第 1 至第 5 級。");
    if (!Array.isArray(study.answerFramework) || study.answerFramework.length !== 5) errors.push("作答框架必須包含 5 個核對步驟。");

    const ids = new Set();
    study.practiceSets?.forEach(pack => {
        if (ids.has(pack.id)) errors.push(`重複練習組 id：${pack.id}`);
        ids.add(pack.id);
        if (!platform.getItemById(pack.topicId)) errors.push(`${pack.id} 引用不存在的課題：${pack.topicId}`);
        if (!pack.label || !pack.paperStyle || !Number.isInteger(pack.minutes) || !pack.visual?.type || !pack.scenario) errors.push(`${pack.id} 的題組資料不完整。`);
        expectedLayers.forEach(layerId => {
            if (!pack.layers?.[layerId]) errors.push(`${pack.id} 缺少 ${layerId} 練習層。`);
        });

        const foundation = pack.layers?.foundation;
        const optionIds = new Set(foundation?.options?.map(option => option.id));
        if (!foundation?.prompt || !foundation?.response || foundation.options?.length < 4 || foundation.correctIds?.length < 2) errors.push(`${pack.id} 的基礎診斷不完整。`);
        foundation?.correctIds?.forEach(id => { if (!optionIds.has(id)) errors.push(`${pack.id} 的基礎答案引用不存在的選項：${id}`); });

        const exam = pack.layers?.exam;
        const blockIds = new Set(exam?.blocks?.map(block => block.id));
        if (!exam?.prompt || exam.blocks?.length < 4 || exam.targetIds?.length < 3 || !exam.model) errors.push(`${pack.id} 的應試改寫不完整。`);
        exam?.targetIds?.forEach(id => { if (!blockIds.has(id)) errors.push(`${pack.id} 的重組答案引用不存在的積木：${id}`); });

        const challenge = pack.layers?.challenge;
        if (!challenge?.question || !Number.isInteger(challenge.marks) || challenge.checklist?.length !== challenge.marks || !challenge.model) errors.push(`${pack.id} 的高階整合題分數與評分點不一致。`);
        if (!challenge?.route || !fs.existsSync(path.join(root, challenge.route))) errors.push(`${pack.id} 的重溫連結不存在：${challenge?.route || "未填寫"}`);
    });
    if (study.practiceSets?.length !== 5) errors.push("作答實驗室應包含 5 組題材。");
}

if (!platform.getItemById("tool-answer-lab") || !fs.existsSync(path.join(root, "answer-lab.html"))) errors.push("中央目錄或作答實驗室頁面缺失。");

if (errors.length) {
    console.error(`作答實驗室驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    const taskCount = study.practiceSets.length * expectedLayers.length;
    console.log(`作答實驗室驗證通過：${study.observedLevels.length} 個等級觀察、${study.practiceSets.length} 組題材及 ${taskCount} 項分層任務均完整。`);
}
