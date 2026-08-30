const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/index.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "learning_data.js"), "utf8"), context, { filename: "learning_data.js" });

const learning = browser.HKDSE_ICT_LEARNING;
const errors = [];
const expected = new Map([
    ["cha-4", { type: "formula-detective", file: "cha.4.html" }],
    ["chc-1", { type: "network-builder", file: "chc.1.html" }],
    ["chd-2", { type: "trace-debugger", file: "chd.2.html" }],
    ["ea-2", { type: "sql-missions", file: "ea.2.html" }]
]);

const normaliseFormula = value => String(value || "")
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, "")
    .toUpperCase();
const normaliseSQL = value => String(value || "")
    .replace(/--.*$/gm, " ")
    .replace(/;/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

expected.forEach((definition, id) => {
    const game = learning?.pages?.[id]?.game;
    if (!game) {
        errors.push(`${id} 缺少遊戲資料。`);
        return;
    }
    if (game.type !== definition.type) errors.push(`${id} 遊戲類型應為 ${definition.type}。`);
    const html = fs.readFileSync(path.join(root, definition.file), "utf8");
    if (!html.includes("learning_data.js?v=12")) errors.push(`${definition.file} 未載入最新 learning_data.js。`);
    if (!html.includes("lesson_companion.js?v=6")) errors.push(`${definition.file} 未載入最新 lesson_companion.js。`);

    if (game.type === "formula-detective") {
        game.missions.forEach((mission, index) => {
            if (!mission.acceptable.some(answer => normaliseFormula(answer) === normaliseFormula(mission.answer))) {
                errors.push(`${id} 公式關卡 ${index + 1} 的標準答案無法通過檢查。`);
            }
        });
    }

    if (game.type === "network-builder") {
        const ids = game.devices.map(device => device.id);
        if (new Set(ids).size !== ids.length) errors.push(`${id} 有重複硬件識別碼。`);
        game.slots.forEach(slot => {
            if (!ids.includes(slot.answer)) errors.push(`${id} 的位置 ${slot.id} 沒有有效答案。`);
        });
    }

    if (game.type === "trace-debugger") {
        game.trace.forEach((step, index) => {
            if (index && step.expectedCount < game.trace[index - 1].expectedCount) {
                errors.push(`${id} 追蹤步驟 ${index + 1} 的 count 倒退。`);
            }
        });
        if (game.trace.at(-1)?.expectedCount !== 2) errors.push(`${id} 的錯誤示例應以 count = 2 結束。`);
    }

    if (game.type === "sql-missions") {
        game.missions.forEach((mission, index) => {
            const canonical = normaliseSQL(mission.canonical);
            const missing = mission.requiredTokens.filter(token => !canonical.includes(normaliseSQL(token)));
            if (missing.length) errors.push(`${id} SQL 任務 ${index + 1} 的參考查詢未通過自身檢查：${missing.join("、")}`);
        });
    }
});

const companion = fs.readFileSync(path.join(root, "assets/js/lesson_companion.js"), "utf8");
const gameScript = fs.readFileSync(path.join(root, "assets/js/lesson_games.js"), "utf8");
const gameStyle = fs.readFileSync(path.join(root, "assets/css/lesson-games.css"), "utf8");
[
    ["data-lesson-game-root", "學習助手缺少遊戲掛載點。"],
    ["lesson-games.css?v=1", "學習助手沒有載入遊戲樣式。"],
    ["lesson_games.js?v=1", "學習助手沒有載入遊戲程式。"]
].forEach(([needle, message]) => {
    if (!companion.includes(needle)) errors.push(message);
});
expected.forEach(definition => {
    if (!gameScript.includes(`"${definition.type}"`)) errors.push(`遊戲程式缺少 ${definition.type} renderer。`);
});
if (!gameScript.includes("hkdse-ict-lesson-games-v1")) errors.push("遊戲程式缺少本機最佳紀錄鍵。");
if (!gameStyle.includes("@media (max-width: 620px)")) errors.push("遊戲樣式缺少手機版面。");
if (!gameStyle.includes("@media (prefers-reduced-motion: reduce)")) errors.push("遊戲樣式缺少 reduced-motion 支援。");

if (errors.length) {
    console.error(`課題遊戲驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log("課題遊戲驗證通過：公式、網絡、追蹤除錯及 SQL 共 4 款活動已接入課題頁，參考答案可通過各自檢查，手機及 reduced-motion 樣式齊備。");
}
