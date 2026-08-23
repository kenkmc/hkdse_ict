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
        id: "core-b",
        sectionTitle: "必修部分 B - 電腦系統基礎",
        sectionCode: "Core B",
        kind: "course",
        color: "bg-amber-50 text-amber-800",
        icon: "microchip",
        items: [
            {
                id: "chb-1",
                title: "i. 基本機器組織",
                file: "chb.1.html",
                desc: "硬件功能、CPU、機器周期、記憶體、輸入輸出及儲存裝置",
                type: "lesson",
                syllabusRef: "B(a)",
                tags: ["CPU", "GPU", "機器周期", "RAM", "ROM", "記憶體", "輸入輸出", "儲存裝置"]
            },
            {
                id: "chb-2",
                title: "ii. 系統軟件",
                file: "chb.2.html",
                desc: "操作系統、實用程式、驅動程式及五種操作模式",
                type: "lesson",
                syllabusRef: "B(b)",
                tags: ["操作系統", "實用程式", "驅動程式", "批次處理", "實時處理", "虛擬化"]
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
                desc: "LAN／WAN、網絡服務、硬件實物、通訊鏈路及情境題",
                type: "lesson",
                syllabusRef: "C(a) · 網絡",
                tags: ["LAN", "WAN", "網絡硬件", "光纖", "無線網絡", "DSE 情境題"]
            },
            {
                id: "chc-2",
                title: "ii. 互聯網協定",
                file: "chc.2.html",
                desc: "TCP/IP、IP 位址、DNS、URL 及常用網絡協定",
                type: "lesson",
                syllabusRef: "C(a) · 協定",
                tags: ["TCP/IP", "IP Address", "DNS", "URL", "網絡協定"]
            },
            {
                id: "chc-3",
                title: "iii. 互聯網服務及應用",
                file: "chc.3.html",
                desc: "搜尋策略、資訊可信性、多媒體格式、互聯網服務及串流技術",
                type: "lesson",
                syllabusRef: "C(b)",
                tags: ["搜尋引擎", "資訊可信性", "串流", "電郵", "遠端登入", "IoT", "雲端服務"]
            },
            {
                id: "chc-4",
                title: "iv. 基礎網頁編寫",
                file: "chc.4.html",
                desc: "HTML 基本結構、跨平台、目標受眾、導覽、版面及網站上載",
                type: "lesson",
                syllabusRef: "C(c)",
                tags: ["HTML", "網頁設計", "超連結", "多媒體", "可用性", "上載網站"]
            },
            {
                id: "chc-5",
                title: "v. 網上威脅與保安",
                file: "chc.5.html",
                desc: "惡意程式、網絡攻擊、私隱、加密、認證、授權及電子交易保安",
                type: "lesson",
                syllabusRef: "C(d)",
                tags: ["病毒", "蠕蟲", "木馬", "勒索軟件", "防火牆", "VPN", "加密", "數碼證書", "網絡保安"]
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
