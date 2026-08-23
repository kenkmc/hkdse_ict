(function exposePastPaperMetadata() {
    "use strict";

    const sourcePages = Object.freeze([
        { year: 2025, label: "2025 考生表現示例", href: "https://www.hkeaa.edu.hk/tc/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2025.html" },
        { year: 2024, label: "2024 考生表現示例", href: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2024.html" },
        { year: 2023, label: "2023 考生表現示例", href: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2023.html" },
        { year: 2022, label: "2022 考生表現示例", href: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2022.html" }
    ]);

    // 只記錄可在考評局公開「考生表現示例」核對的題目元資料；不重製原題或評分準則。
    const entries = Object.freeze([
        {
            id: "pp-2025-1b-spreadsheet",
            year: 2025,
            paper: "卷一乙",
            topicId: "cha-4",
            topic: "試算表公式與複製",
            askType: "寫出／修正公式",
            context: "從表格資料選擇合適函數，處理相對及絕對參照。",
            curriculum: "現行必修可直接參考",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2025.html"
        },
        {
            id: "pp-2025-1b-security",
            year: 2025,
            paper: "卷一乙",
            topicId: "chc-4",
            topic: "身分驗證與 PKI",
            askType: "指出特點／描述程序",
            context: "把保安技術放入檔案傳送及使用者驗證情境。",
            curriculum: "現行必修可直接參考",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2025.html"
        },
        {
            id: "pp-2025-1b-interface",
            year: 2025,
            paper: "卷一乙",
            topicId: "chb-3",
            topic: "網上表格與硬件選擇",
            askType: "建議並解釋／比較",
            context: "按輸入資料特性改善表單，並評估不同流動裝置。",
            curriculum: "現行必修可直接參考",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2025.html"
        },
        {
            id: "pp-2024-1b-spreadsheet",
            year: 2024,
            paper: "卷一乙",
            topicId: "cha-4",
            topic: "試算表邏輯與驗證",
            askType: "完成公式／描述驗證",
            context: "根據出勤表完成 IF／條件統計公式，並提出合適驗證。",
            curriculum: "現行必修可直接參考",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2024.html"
        },
        {
            id: "pp-2023-1b-network",
            year: 2023,
            paper: "卷一乙",
            topicId: "chc-1",
            topic: "網絡存取與伺服器",
            askType: "判斷並解釋",
            context: "閱讀網絡設定，判斷電腦能否存取指定伺服器並交代理由。",
            curriculum: "現行必修需重新對照課程字眼",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2023.html"
        },
        {
            id: "pp-2023-2d-array",
            year: 2023,
            paper: "舊制卷二 D",
            topicId: "ec-1",
            topic: "二維陣列與子程序",
            askType: "追蹤／計算／完成算法",
            context: "以二維陣列表示真實資料，追蹤有參數子程序及邊界。",
            curriculum: "轉制前選修；只作技能映射",
            sourceUrl: "https://www.hkeaa.edu.hk/en/HKDSE/assessment/subject_information/category_a_subjects/ict/sp/2023.html"
        }
    ]);

    const askGuides = Object.freeze([
        { verb: "指出／列出", demand: "直接寫出指定數量的名稱或特點；不要以長篇背景取代答案。", route: "practice.html?type=mcq" },
        { verb: "描述", demand: "按先後或資料流說明發生甚麼，使用準確的系統角色與動作。", route: "practice.html?type=short-answer" },
        { verb: "解釋", demand: "寫出原因、機制或因果關係；通常要包含「如何／為何」。", route: "practice.html?difficulty=standard" },
        { verb: "比較", demand: "使用同一準則成對比較兩者，並連回題目情境。", route: "practice.html?difficulty=standard" },
        { verb: "建議並論證", demand: "先提出可行方案，再以題目限制、優點或風險支持選擇。", route: "practice.html?difficulty=advanced" },
        { verb: "追蹤／計算", demand: "逐步更新變數、索引或資料結構，保留中間值以便檢查。", route: "practice.html?topic=ec-1" },
        { verb: "設計／完成", demand: "遵守題目指定表示法，處理正常流程、邊界及必要驗證。", route: "practice.html?difficulty=advanced" },
        { verb: "評估", demand: "以明確準則權衡成效及限制，最後作有條件的判斷。", route: "practice.html?difficulty=advanced" }
    ]);

    window.HKDSE_ICT_PAST_PAPER_INDEX = Object.freeze({ sourcePages, entries, askGuides });
})();
