const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const catalogSource = fs.readFileSync(path.join(root, "course_data.js"), "utf8");
const browser = {
    location: { pathname: "/index.html", href: "" },
    alert() {}
};
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(catalogSource, context, { filename: "course_data.js" });

const platform = browser.HKDSE_ICT;
const errors = [];

if (!platform || !Array.isArray(platform.sections)) {
    errors.push("course_data.js 沒有公開有效的 HKDSE_ICT 目錄。");
} else {
    const items = platform.getItems();
    const ids = new Set();
    const files = new Set();

    items.forEach(item => {
        if (!item.id || !item.file || !item.title || !item.type) {
            errors.push(`目錄項目缺少必要欄位：${JSON.stringify(item)}`);
        }
        if (ids.has(item.id)) errors.push(`重複內容 id：${item.id}`);
        if (files.has(item.file)) errors.push(`重複內容路徑：${item.file}`);
        ids.add(item.id);
        files.add(item.file);

        if (!fs.existsSync(path.join(root, item.file))) {
            errors.push(`目錄連結不存在：${item.file}`);
        }
    });

    const publishedPages = fs.readdirSync(root)
        .filter(file => file.endsWith(".html") && file !== "index.html")
        .sort();
    publishedPages.forEach(file => {
        if (!files.has(file)) errors.push(`現有頁面未列入中央目錄：${file}`);
    });

    const localReferencePattern = /(?:href|src)\s*=\s*["']([^"']+)["']/g;
    ["index.html", ...publishedPages].forEach(htmlFile => {
        const html = fs.readFileSync(path.join(root, htmlFile), "utf8");
        for (const match of html.matchAll(localReferencePattern)) {
            const reference = match[1];
            if (/^(?:https?:|#|data:|mailto:|javascript:)/.test(reference) || reference.includes("${")) continue;
            const target = reference.split(/[?#]/)[0];
            if (target && !fs.existsSync(path.resolve(root, target))) {
                errors.push(`${htmlFile} 引用了不存在的本機檔案：${reference}`);
            }
        }
    });
}

if (errors.length) {
    console.error(`目錄驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`目錄驗證通過：${platform.getItems().length} 個內容頁面及所有本機連結均有效。`);
}
