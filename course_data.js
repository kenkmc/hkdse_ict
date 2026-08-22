/**
 * 全站課程與工具目錄（唯一資料來源）
 *
 * 新增、修改或移除可瀏覽內容時，只需更新此檔案。首頁、隨機學習、
 * 共用導覽及目錄驗證都會讀取同一份資料。
 *
 * `id` 是內容的永久識別碼。日後題目引擎及學習進度會以此欄位連結，
 * 因此即使標題或檔名改變，也不應重用或隨意更改既有 id。
 */

const siteConfig = {
    schemaVersion: 1,
    siteName: "ICT 學習資源網",
    tagline: "高中資訊及通訊科技科",
    canonicalUrl: "https://kenkmc.github.io/hkdse_ict/",
    searchSite: "kenkmc.github.io/hkdse_ict",
    repositoryUrl: "https://github.com/kenkmc/hkdse_ict",
    curriculumUrl: "https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/technology-edu/curriculum-doc/ICT_C%26A%20Guide_c_final.pdf",
    assessmentUrl: "https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/ict/2027hkdse-e-ict.pdf",
    features: {
        questionEngine: true,
        progressTracking: false
    }
};

const courseData = [
    {
        id: "core-a",
        sectionTitle: "必修部分 A - 資訊處理",
        sectionCode: "Core A",
        kind: "course",
        color: "bg-blue-50 text-blue-700",
        icon: "cpu",
        items: [
            {
                id: "cha-1",
                title: "i. 資訊處理簡介",
                file: "cha.1.html",
                desc: "資訊系統、數據與資訊、資訊處理及資訊時代",
                type: "lesson",
                syllabusRef: "A(a)",
                tags: ["IPO", "資訊系統", "數據", "資訊"]
            },
            {
                id: "cha-2",
                title: "ii. 數據組織及數據控制",
                file: "cha.2.html",
                desc: "數據分級、驗證與校驗、數據庫功能及檔案存取",
                type: "lesson",
                syllabusRef: "A(b)",
                tags: ["數據控制", "校驗", "數據庫", "檔案存取"]
            },
            {
                id: "cha-3",
                title: "iii. 數據表示",
                file: "cha.3.html",
                desc: "數值系統、有符號數，以及文字、圖像、聲音和視像",
                type: "lesson",
                syllabusRef: "A(c)",
                tags: ["二進制", "十六進制", "多媒體", "字符編碼"]
            },
            {
                id: "cha-4",
                title: "iv. 數據操縱和分析：試算表",
                file: "cha.4.html",
                desc: "公式、函數、儲存格參照、數據分析及圖表",
                type: "lesson",
                syllabusRef: "A(d) · 試算表",
                tags: ["試算表", "Excel", "公式", "函數", "圖表"]
            },
            {
                id: "cha-5",
                title: "v. 數據操縱和分析：數據庫",
                file: "cha.5.html",
                desc: "數據庫結構、關鍵碼、數據庫物件及 SQL 基礎",
                type: "lesson",
                syllabusRef: "A(d) · 數據庫",
                tags: ["數據庫", "Access", "SQL", "關鍵碼"]
            }
        ]
    },
    {
        id: "core-c",
        sectionTitle: "必修部分 C - 互聯網及其應用",
        sectionCode: "Core C",
        kind: "course",
        color: "bg-cyan-50 text-cyan-700",
        icon: "globe",
        items: [
            {
                id: "chc-1",
                title: "i. 建網及互聯網基本知識",
                file: "chc.1.html",
                desc: "網絡規模、服務模式、網絡硬件及互動組網",
                type: "lesson",
                syllabusRef: "C(a) · 網絡",
                tags: ["網絡", "拓撲", "LAN", "網絡硬件"]
            },
            {
                id: "chc-2",
                title: "ii. 互聯網協定",
                file: "chc.2.html",
                desc: "TCP/IP、IP 位址、DNS、URL 及常用網絡協定",
                type: "lesson",
                syllabusRef: "C(a) · 協定",
                tags: ["TCP/IP", "IP Address", "DNS", "URL", "網絡協定"]
            }
        ]
    },
    {
        id: "learning-tools",
        sectionTitle: "互動學習工具",
        sectionCode: "Tools",
        kind: "tool",
        color: "bg-violet-50 text-violet-700",
        icon: "wrench",
        items: [
            {
                id: "tool-dse-practice",
                title: "DSE 題型練習",
                file: "practice.html",
                desc: "按課題及難度練習原創 DSE 題型，並按評分準則檢討答案",
                type: "tool",
                syllabusRef: "Paper 1 / Paper 2",
                tags: ["DSE", "題庫", "評分準則", "練習"]
            },
            {
                id: "tool-sql-simulator",
                title: "SQL 互動學習平台",
                file: "db_simulator.html",
                desc: "在瀏覽器執行 SQL、檢視數據表、關聯及 ER 圖",
                type: "tool",
                syllabusRef: "Elective A",
                tags: ["SQL", "SQLite", "數據庫", "ER Diagram"]
            },
            {
                id: "tool-python-converter",
                title: "Python、偽代碼與流程圖工具",
                file: "python_converter.html",
                desc: "轉換、檢查及執行 Python、偽代碼和互動流程圖",
                type: "tool",
                syllabusRef: "Core D / Elective C",
                tags: ["Python", "偽代碼", "流程圖", "算法"]
            },
            {
                id: "tool-pki-lab",
                title: "PKI 加密與數碼簽署實驗室",
                file: "pki_animation.html",
                desc: "以互動情境理解公開密碼匙加密及數碼簽署",
                type: "tool",
                syllabusRef: "C(d) · 網上保安",
                tags: ["PKI", "加密", "數碼簽署", "網絡保安"]
            }
        ]
    }
];

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
}

function getCatalogItems() {
    return courseData.flatMap(section =>
        section.items.map(item => ({ ...item, sectionId: section.id, sectionTitle: section.sectionTitle }))
    );
}

function normalisePagePath(path) {
    return String(path || "")
        .split("#")[0]
        .split("?")[0]
        .replace(/\\/g, "/")
        .split("/")
        .pop();
}

function getCatalogItemById(id) {
    return getCatalogItems().find(item => item.id === id) || null;
}

function getCatalogItemByPath(path) {
    const page = normalisePagePath(path);
    return getCatalogItems().find(item => item.file === page) || null;
}

/** 隨機前往另一個已發佈的課程或工具。 */
function randomStudy() {
    const currentPage = normalisePagePath(window.location.pathname);
    const candidates = getCatalogItems().filter(item => item.file !== currentPage);

    if (candidates.length === 0) {
        window.alert("目前沒有其他可瀏覽內容。");
        return;
    }

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    window.location.href = target.file;
}

deepFreeze(siteConfig);
deepFreeze(courseData);

// 為現有的傳統 script 頁面及日後的模組提供同一個穩定入口。
window.HKDSE_ICT = Object.freeze({
    config: siteConfig,
    sections: courseData,
    getItems: getCatalogItems,
    getItemById: getCatalogItemById,
    getItemByPath: getCatalogItemByPath,
    randomStudy
});
