const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/mock.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
["course_data.js", "question_data.js", "question_expansion_data.js"].forEach(file => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
});

const bank = browser.HKDSE_ICT_QUESTIONS;
const errors = [];
function hash(text) {
    let value = 2166136261;
    for (const character of text) {
        value ^= character.charCodeAt(0);
        value = Math.imul(value, 16777619);
    }
    return value >>> 0;
}
function seededShuffle(items, seedText) {
    let state = hash(seedText) || 1;
    const random = () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 4294967296;
    };
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1));
        [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
}
function selectByMarks(candidates, target, seed, required = []) {
    const requiredIds = new Set(required.map(question => question.id));
    const fixed = required.filter(question => candidates.some(item => item.id === question.id));
    const remaining = target - fixed.reduce((sum, question) => sum + question.marks, 0);
    const pool = seededShuffle(candidates.filter(question => !requiredIds.has(question.id)), seed);
    const solutions = new Map([[0, []]]);
    for (const question of pool) {
        for (const [sum, picked] of [...solutions.entries()].sort((a, b) => b[0] - a[0])) {
            const next = sum + question.marks;
            if (next <= remaining && !solutions.has(next)) solutions.set(next, [...picked, question]);
        }
        if (solutions.has(remaining)) break;
    }
    return [...fixed, ...(solutions.get(remaining) || [])];
}
const marks = questions => questions.reduce((sum, question) => sum + question.marks, 0);

const caseIds = { 1: "smart-campus", 2: "clinic-system", 3: "online-shop" };
for (const setNumber of [1, 2, 3]) {
    const core = bank.filter(question => /^ch[abcde]-/.test(question.topicId));
    const partA = seededShuffle(core.filter(question => question.type === "mcq"), `paper1-${setNumber}-A`).slice(0, 40);
    const activeCase = caseIds[setNumber];
    const required = core.filter(question => question.caseId === activeCase);
    const partB = selectByMarks(core.filter(question => question.type !== "mcq" && (!question.caseId || question.caseId === activeCase)), 60, `paper1-${setNumber}-B`, required);
    if (partA.length !== 40 || marks(partA) !== 40) errors.push(`卷一模擬卷 ${setNumber} 甲部不是 40 題／40 分。`);
    if (marks(partB) !== 60) errors.push(`卷一模擬卷 ${setNumber} 乙部不是 60 分。`);
    if (!required.every(question => partB.some(item => item.id === question.id))) errors.push(`卷一模擬卷 ${setNumber} 缺少完整相連情境。`);
    if (new Set(partB.filter(question => question.caseId).map(question => question.caseId)).size !== 1) errors.push(`卷一模擬卷 ${setNumber} 混入其他相連情境。`);
}

const visualIds = { ea: "q-visual-ea-erd", eb: "q-visual-eb-network", ec: "q-visual-ec-trace" };
for (const prefix of ["ea", "eb", "ec"]) {
    const pool = bank.filter(question => question.topicId.startsWith(`${prefix}-`) && question.type !== "mcq");
    const signatures = [];
    for (const setNumber of [1, 2]) {
        const required = setNumber === 1 ? pool.filter(question => question.id === visualIds[prefix]) : [];
        const picked = selectByMarks(pool, 25, `paper2-${setNumber}-${prefix}`, required);
        if (marks(picked) !== 25) errors.push(`卷二 ${prefix.toUpperCase()} 題組 ${setNumber} 不是 25 分。`);
        if (setNumber === 1 && !picked.some(question => question.id === visualIds[prefix])) errors.push(`卷二 ${prefix.toUpperCase()} 題組 1 缺少圖像題。`);
        signatures.push(picked.map(question => question.id).sort().join("|"));
    }
    if (signatures[0] === signatures[1]) errors.push(`卷二 ${prefix.toUpperCase()} 的兩套題組完全相同。`);
}

if (errors.length) {
    console.error(`模擬卷驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log("模擬卷驗證通過：3 份卷一均為 40 + 60 分；選修 A、B、C 各 2 組不同的 25 分題組，圖像題及相連情境齊備。");
}
