高中 ICT 學習資源網 (ICT Learning Resources Portal)

這是一個專為高中資訊及通訊科技科 (ICT) 學生及教師設計的互動式門戶網站。本項目將課程中的抽象概念（如網絡拓撲、CSMA/CD、數據庫設計等）轉化為直觀的網頁互動體驗，旨在提高學習動機與理解深度。

🚀 項目特色

互動式模擬器：內置網絡拓撲（匯流排、環狀、星狀）視覺化工具，讓學生即時切換並觀察結構差異。

動態動畫演示：透過 HTML5 Canvas/JavaScript 模擬 CSMA/CD 碰撞偵測過程，具體化網絡通訊協定。

自適應設計 (Responsive Design)：採用 Tailwind CSS 構建，支援電腦、平板及手機瀏覽，方便隨時隨地複習。

即時回饋測驗：每個章節末尾設有小測驗，幫助學生鞏固所學知識點。

多媒體整合：結合高品質圖像與 Lucide 圖標，清晰展示網絡硬件（NIC, Router, Modem）及傳輸媒介。

📂 目前收錄內容
單元 A：資訊處理

單元 C：互聯網及其應用

第 1 章：建網及互聯網基本知識（網絡架構、硬件、通訊協定）

互動工具：SQL 學習平台、Python／偽代碼／流程圖工具、PKI 實驗室



🛠️ 技術棧

Frontend: HTML5, Tailwind CSS, JavaScript (ES6+)

Icons: Lucide Icons

Animation: CSS3 Keyframes & JavaScript DOM Manipulation

🌐 在線預覽

你可以透過 GitHub Pages 直接訪問本項目：
https://kenkmc.github.io/hkdse_ict/

本資源僅供教育用途參考。

## 內容目錄與擴充方式

`course_data.js` 是全站課程及工具的唯一資料來源。首頁、隨機學習及共用導覽都從這個檔案讀取內容；請勿在個別 HTML 頁面另外建立課程清單。

每項內容都有不可重用的穩定 `id`、實際頁面路徑、內容類型、課程參照及搜尋標籤。這些欄位預留給日後的 DSE 題目引擎及學習進度記錄使用。新增頁面的流程如下：

1. 建立 HTML 頁面。
2. 在 `course_data.js` 的合適章節加入一個項目。
3. 在提交前執行 `node scripts/validate_catalog.js`。

驗證程式會檢查重複識別碼、目錄所列檔案、未列入目錄的 HTML 頁面，以及所有本機 `href`／`src` 連結。
