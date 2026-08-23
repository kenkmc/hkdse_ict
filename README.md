# 高中 ICT 學習資源網

專為 HKDSE 資訊及通訊科技科學生及教師設計的互動學習平台。項目以課程內容、動畫、模擬器、程式碼執行及題型練習，把抽象概念轉化成可操作的學習體驗。

## 目前功能

- 必修 A「資訊處理」：資訊處理簡介、數據組織及數據控制、數據表示、試算表和數據庫。
- 必修 B「電腦系統基礎」：基本機器組織、CPU 機器周期、記憶及儲存、系統軟件和五種操作模式。
- 必修 C「互聯網及其應用」：建網與協定、互聯網服務、基礎網頁編寫，以及網上威脅與保安。
- 必修 D「運算思維與程式編寫」：問題分析、算法設計、程式開發，以及測試與除錯。
- DSE 題型練習：中央題庫、課題／難度篩選、自動評分、評分準則和解釋。
- SQL 互動學習平台：瀏覽器內執行 SQLite、檢視資料表、關係及 ER 圖。
- Python／偽代碼／流程圖工具：雙向轉換、語法檢查及程式執行。
- PKI 實驗室：公開／私人密碼匙加密及數碼簽署概念模型。
- 網絡及多媒體互動示範，以及部分章節的即時回饋測驗。
- 共用學習助手：課程頁提供學習目標、課程界線、互動概念圖、常見誤解、快速檢查，以及由中央題庫載入的原創 DSE 題型與逐分準則。

## 課程依據

內容範圍以教育局 2021《資訊及通訊科技課程及評估指引（中四至中六）》為基準，並參考考評局最新 HKDSE ICT 評核大綱。本站的題目及教材均為原創內容，並非官方歷屆試題或評分參考。

## 內容與程式結構

- `course_data.js`：課程、工具、路徑及穩定內容 ID 的唯一資料來源。
- `question_data.js`：DSE 題型中央題庫；每題以 `topicId` 連結一項課程或工具。
- `learning_data.js`：每頁學習目標、課程界線、概念節點、常見誤解、快速檢查及精選題目連結的中央資料。
- `assets/css/platform.css`：所有頁面的共用視覺系統。
- `assets/css/learning.css`：共用學習助手及互動概念圖樣式。
- `assets/css/core-lesson-refresh.css`：必修課題的共用背景、導覽和內容卡片視覺修飾。
- `assets/css/system-lesson.css`：必修 B 課頁的共用版面、機器周期及操作模式互動樣式。
- `assets/css/internet-lesson.css`：必修 C(b)–C(d) 的搜尋、串流、網頁設計及保安互動樣式。
- `assets/css/algorithm-lesson.css`：必修 D 的 IPO、追蹤表、列表執行和邊界測試互動樣式。
- `assets/js/site_navigation.js`：共用全站導覽、頁面識別及課程來源頁尾。
- `assets/js/lesson_companion.js`：學習助手的展開、概念探索、即時檢查及頁內 DSE 題型互動。
- `assets/js/system-lessons.js`：機器周期、裝置選擇、操作模式判斷及嵌入式題目互動。
- `assets/js/internet-lessons.js`：搜尋組合、串流緩衝、HTML 結構、受眾設計及威脅配對互動。
- `assets/js/algorithm-lessons.js`：IPO 分析、算法追蹤、列表執行、邊界值及錯誤分類互動。
- `assets/js/catalog.js`：首頁目錄及搜尋。
- `assets/js/question_engine.js`：題目篩選、作答、評分及回饋流程。

內容的永久 `id` 會供下一階段的學習進度記錄使用。即使標題或檔名改變，也不應重用或隨意修改既有 ID。

## 新增課程或工具

1. 建立 HTML 頁面，載入共用平台及學習助手的 CSS／JavaScript。
2. 在 `course_data.js` 的合適章節加入項目。
3. 在 `learning_data.js` 加入該頁的學習提示。
4. 執行目錄及學習提示驗證。

## 新增練習題

1. 在 `question_data.js` 加入題目，提供 `id`、`topicId`、`difficulty`、`marks`、`answer`、`markingScheme` 及 `explanation`。
2. 確保 `topicId` 對應 `course_data.js` 的內容 ID。
3. 執行 `node scripts/validate_questions.js`。

## 驗證

```text
node scripts/validate_catalog.js
node scripts/validate_questions.js
node scripts/validate_learning_data.js
```

目錄驗證會檢查重複識別碼、實際頁面、未列入目錄的 HTML，以及本機 `href`／`src`。題庫驗證會檢查題型、難度、課題連結、答案及評分準則分數；學習提示驗證則確保每個目錄項目都有完整的教學輔助資料。

## 技術

HTML5、JavaScript、Tailwind CSS、React、SQLite WebAssembly、Pyodide、Mermaid 及 Lucide Icons。網站可直接透過 GitHub Pages 使用，毋須後端服務。

線上版本：https://kenkmc.github.io/hkdse_ict/
