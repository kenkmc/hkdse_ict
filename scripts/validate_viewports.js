const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/index.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });

const platform = browser.HKDSE_ICT;
const errors = [];
const pages = ["index.html", ...platform.getItems().map(item => item.file)];
const uniquePages = [...new Set(pages)];

uniquePages.forEach(file => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    if (!/<meta\s+name=["']viewport["'][^>]*width=device-width/i.test(html)) {
        errors.push(`${file} 缺少裝置寬度 viewport 設定。`);
    }
    if (!html.includes("assets/js/site_navigation.js?v=5") && !html.includes("assets/css/viewport-fixes.css?v=1")) {
        errors.push(`${file} 未載入包含 viewport-safe 修正的最新全站導覽。`);
    }
    if (/style=["'][^"']*min-width\s*:\s*(?:[7-9]\d\d|\d{4,})px/i.test(html) && !/overflow-x-(?:auto|scroll)|overflow-x\s*:\s*auto/i.test(html)) {
        errors.push(`${file} 有大型 inline min-width，但沒有可見的橫向捲動容器。`);
    }
});

const navigation = fs.readFileSync(path.join(root, "assets/js/site_navigation.js"), "utf8");
const viewportCSS = fs.readFileSync(path.join(root, "assets/css/viewport-fixes.css"), "utf8");
[
    ["assets/css/viewport-fixes.css?v=1", "全站導覽未注入 viewport 修正樣式。"],
    ["data-viewport-fixes", "全站導覽缺少防止重複載入的標記。"]
].forEach(([marker, message]) => {
    if (!navigation.includes(marker)) errors.push(message);
});

[
    ['body[data-content-id="tool-sql-simulator"]', "SQL 工具缺少視窗高度修正。"],
    ['body[data-content-id="tool-python-converter"] #flow-workspace', "Python 流程圖工具缺少可捲動畫布修正。"],
    ["@media (max-height: 1080px)", "缺少 1920×1080 及較矮桌面的垂直版面規則。"],
    [".mock-navigator", "模擬考題目導覽缺少可視高度修正。"],
    [".sba-test-builder", "SBA 表格工具缺少窄畫面欄數修正。"],
    ["overscroll-behavior", "大型表格及畫布缺少捲動邊界處理。"],
    ["prefers-reduced-motion", "viewport 修正缺少 reduced-motion 支援。"]
].forEach(([marker, message]) => {
    if (!viewportCSS.includes(marker)) errors.push(message);
});

const sqlHTML = fs.readFileSync(path.join(root, "db_simulator.html"), "utf8");
if (!sqlHTML.includes("h-screen flex flex-col overflow-hidden")) errors.push("SQL 工具的已知固定高度風險模式改變，請重新審核 viewport 規則。");
const pythonHTML = fs.readFileSync(path.join(root, "python_converter.html"), "utf8");
if (!pythonHTML.includes("#flow-canvas { position: relative; width: 1200px; height: 1200px")) errors.push("Python 大畫布尺寸改變，請重新審核 viewport 規則。");
if (!pythonHTML.includes("#flow-workspace") || !pythonHTML.includes("overflow: auto")) errors.push("Python 大畫布沒有放在可捲動工作區。" );

const catalogFiles = platform.getItems().map(item => item.file);
const missingCatalogPages = catalogFiles.filter(file => !fs.existsSync(path.join(root, file)));
missingCatalogPages.forEach(file => errors.push(`無法進行版面審核：${file} 不存在。`));

if (errors.length) {
    console.error(`視窗版面驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`視窗版面驗證通過：首頁及 ${catalogFiles.length} 個內容頁均載入 viewport-safe 樣式；SQL、Python、模擬考、SBA、大型表格及 1080px 高桌面風險均有針對性規則。`);
}
