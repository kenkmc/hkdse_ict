/**
 * 全站課程與工具目錄（唯一資料來源）
 *
 * 新增、修改或移除可瀏覽內容時，只需更新此檔案。首頁、隨機學習、
 * 共用導覽及目錄驗證都會讀取同一份資料。
 *
 * `id` 是內容的永久識別碼。題目引擎、本機錯題重練及日後的完整學習進度會以此欄位連結，
 * 因此即使標題或檔名改變，也不應重用或隨意更改既有 id。
 */

const siteConfig = {
    schemaVersion: 3,
    siteName: "ICT 學習資源網",
    tagline: "高中資訊及通訊科技科",
    canonicalUrl: "https://kenkmc.github.io/hkdse_ict/",
    searchSite: "kenkmc.github.io/hkdse_ict",
    repositoryUrl: "https://github.com/kenkmc/hkdse_ict",
    curriculumUrl: "https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/technology-edu/curriculum-doc/ICT_C%26A%20Guide_c_final.pdf",
    assessmentUrl: "https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/ict/2027hkdse-e-ict.pdf",
    features: {
        questionEngine: true,
        layeredLearning: true,
        tieredAssignments: 78,
        multimediaLessons: true,
        progressTracking: true,
        progressStorage: "local-only"
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
        id: "core-d",
        sectionTitle: "必修部分 D - 運算思維與程式編寫",
        sectionCode: "Core D",
        kind: "course",
        color: "bg-violet-50 text-violet-700",
        icon: "code-2",
        items: [
            {
                id: "chd-1",
                title: "i. 問題定義及分析",
                file: "chd.1.html",
                desc: "問題範圍、輸入處理輸出、分解、模式辨認及抽象化",
                type: "lesson",
                syllabusRef: "D(a)",
                tags: ["運算思維", "問題定義", "IPO", "分解", "模式辨認", "抽象化"]
            },
            {
                id: "chd-2",
                title: "ii. 算法設計",
                file: "chd.2.html",
                desc: "偽代碼、流程圖、數據類型、控制結構、陣列、追蹤表及模組化",
                type: "lesson",
                syllabusRef: "D(b)",
                tags: ["算法", "偽代碼", "流程圖", "追蹤表", "數據類型", "陣列", "模組化"]
            },
            {
                id: "chd-3",
                title: "iii. 程式開發",
                file: "chd.3.html",
                desc: "變數、常數、運算子、輸入輸出、選擇、迭代、字串及一維列表",
                type: "lesson",
                syllabusRef: "D(c)",
                tags: ["程式開發", "變數", "運算子", "if", "for", "while", "string", "list"]
            },
            {
                id: "chd-4",
                title: "iv. 程式測試及除錯",
                file: "chd.4.html",
                desc: "正常、邊界及異常數據、語法／邏輯／執行錯誤、除錯與方案比較",
                type: "lesson",
                syllabusRef: "D(d)",
                tags: ["測試數據", "邊界值", "語法錯誤", "邏輯錯誤", "執行錯誤", "除錯"]
            }
        ]
    },
    {
        id: "core-e",
        sectionTitle: "必修部分 E - 資訊及通訊科技的社會影響",
        sectionCode: "Core E",
        kind: "course",
        color: "bg-rose-50 text-rose-700",
        icon: "scale",
        items: [
            {
                id: "che-1",
                title: "i. 科技創新",
                file: "che.1.html",
                desc: "人工智能與數據科學、模式辨認、3D 打印、擴增實境及虛擬實境",
                type: "lesson",
                syllabusRef: "E(a)",
                tags: ["人工智能", "數據科學", "模式辨認", "3D 打印", "AR", "VR"]
            },
            {
                id: "che-2",
                title: "ii. 健康與道德議題",
                file: "che.2.html",
                desc: "健康風險、人體工學、數碼鴻溝、無障礙使用、資訊自由及道德考慮",
                type: "lesson",
                syllabusRef: "E(b)",
                tags: ["RSI", "人體工學", "數碼鴻溝", "無障礙", "資訊自由", "資訊道德"]
            },
            {
                id: "che-3",
                title: "iii. 知識產權",
                file: "che.3.html",
                desc: "版權、軟件授權、侵權與盜版、數碼水印及數碼簽署",
                type: "lesson",
                syllabusRef: "E(c)",
                tags: ["知識產權", "版權", "freeware", "shareware", "open source", "盜版", "數碼水印"]
            }
        ]
    },
    {
        id: "elective-a",
        sectionTitle: "選修部分 A - 數據庫",
        sectionCode: "Paper 2A",
        recommendedHours: 38,
        selectionNote: "三選二",
        kind: "course",
        color: "bg-emerald-50 text-emerald-700",
        icon: "database",
        items: [
            { id: "ea-1", title: "i. 關聯數據庫概念", file: "ea.1.html", desc: "實體、屬性、關係、鍵、完整性、索引及 rollback", type: "lesson", syllabusRef: "Elective A(a)", tags: ["關聯數據庫", "主鍵", "外鍵", "候選鍵", "完整性", "rollback"] },
            { id: "ea-2", title: "ii. SQL", file: "ea.2.html", desc: "建表、增刪改、篩選、函數、連接、子查詢及檢視表", type: "lesson", syllabusRef: "Elective A(b)", tags: ["SQL", "JOIN", "subquery", "view", "aggregate", "DML", "DDL"] },
            { id: "ea-3", title: "iii. 數據庫設計方法", file: "ea.3.html", desc: "ER 圖、關係轉換、數據冗餘、正規化至 3NF、反正規化及存取權", type: "lesson", syllabusRef: "Elective A(c)", tags: ["ERD", "1NF", "2NF", "3NF", "正規化", "反正規化", "存取權"] }
        ]
    },
    {
        id: "elective-b",
        sectionTitle: "選修部分 B - 網頁應用程式開發",
        sectionCode: "Paper 2B",
        recommendedHours: 38,
        selectionNote: "三選二",
        kind: "course",
        color: "bg-sky-50 text-sky-700",
        icon: "panel-top",
        items: [
            { id: "eb-1", title: "i. 網絡服務及實作", file: "eb.1.html", desc: "客戶端—伺服器、HTTP GET／POST、連接埠、常用伺服器及資源權限", type: "lesson", syllabusRef: "Elective B(a)", tags: ["client-server", "HTTP", "GET", "POST", "port", "DHCP", "proxy", "file server"] },
            { id: "eb-2", title: "ii. 網頁程式編寫及應用", file: "eb.2.html", desc: "HTML／CSS、發布、客戶端與伺服器端腳本、表單驗證、cookies 及數據庫", type: "lesson", syllabusRef: "Elective B(b)", tags: ["JavaScript", "PHP", "HTML", "CSS", "form", "validation", "cookies", "web app"] }
        ]
    },
    {
        id: "elective-c",
        sectionTitle: "選修部分 C - 算法與程式編寫",
        sectionCode: "Paper 2C",
        recommendedHours: 38,
        selectionNote: "三選二",
        kind: "course",
        color: "bg-fuchsia-50 text-fuchsia-700",
        icon: "braces",
        items: [
            { id: "ec-1", title: "i. 程式編寫", file: "ec.1.html", desc: "搜尋、排序、合併、巢狀迴圈、鏈結串列、堆疊、佇列、檔案及除錯", type: "lesson", syllabusRef: "Elective C(a)", tags: ["search", "sort", "merge", "stack", "queue", "linked list", "file handling", "debugging"] },
            { id: "ec-2", title: "ii. 程式在真實情境的應用", file: "ec.2.html", desc: "感應器、馬達、擴充模組、事件處理及實體裝置程式", type: "lesson", syllabusRef: "Elective C(b)", tags: ["sensor", "motor", "event-driven", "physical device", "accelerometer"] }
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
                id: "tool-mock-exam",
                title: "DSE 模擬考訓練",
                file: "mock.html",
                desc: "3 份卷一及每個選修 2 組卷二原創模擬：正式分部、限時、標記、列印及課題分析",
                type: "tool",
                syllabusRef: "Paper 1 / Paper 2",
                tags: ["模擬考", "計時", "Paper 1", "Paper 2", "標記", "列印", "原創題目"]
            },
            {
                id: "tool-mistake-book",
                title: "錯題簿與弱項重練",
                file: "mistakes.html",
                desc: "在目前瀏覽器記錄錯題、遺漏評分點、第一次／最近得分及 1、3、7、14 日重練",
                type: "tool",
                syllabusRef: "Paper 1 / Paper 2",
                tags: ["錯題簿", "弱項", "重練", "spaced practice", "本機儲存"]
            },
            {
                id: "tool-past-paper-index",
                title: "歷屆問法與官方來源索引",
                file: "past-paper-index.html",
                desc: "按年份、課題及問法整理官方來源連結，不複製歷屆試題或評分參考",
                type: "tool",
                syllabusRef: "Past paper metadata",
                tags: ["歷屆試題", "問法索引", "年份", "課題", "官方來源", "版權"]
            },
            {
                id: "tool-sba-prep",
                title: "SBA 準備工作室",
                file: "sba.html",
                desc: "一般性的設計、實作、測試及評估框架；不代答受監管校本評核",
                type: "tool",
                syllabusRef: "SBA",
                tags: ["SBA", "Design", "Implementation", "Testing", "Evaluation"]
            },
            {
                id: "tool-dse-practice",
                title: "DSE 題型練習",
                file: "practice.html",
                desc: "463 題原創題庫，包含圖像、數據回應及相連分題，並按評分準則檢討答案",
                type: "tool",
                syllabusRef: "Paper 1 / Paper 2",
                tags: ["DSE", "題庫", "評分準則", "圖像題", "資料回應", "練習"]
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
