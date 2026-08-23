# 高中 ICT 學習資源網

專為 HKDSE 資訊及通訊科技科學生及教師設計的互動學習平台。項目以課程內容、動畫、模擬器、程式碼執行及題型練習，把抽象概念轉化成可操作的學習體驗。

## 目前功能

- 必修 A「資訊處理」：資訊處理簡介、數據組織及數據控制、數據表示、試算表和數據庫。
- 必修 B「電腦系統基礎」：基本機器組織、CPU 機器周期、記憶及儲存、系統軟件和五種操作模式。
- 必修 C「互聯網及其應用」：建網與協定、互聯網服務、基礎網頁編寫，以及網上威脅與保安。
- 必修 D「運算思維與程式編寫」：問題分析、算法設計、程式開發，以及測試與除錯。
- 必修 E「資訊及通訊科技的社會影響」：科技創新、健康與道德議題，以及知識產權。
- 選修 A「數據庫」：關聯數據庫概念、SQL、ER 圖、正規化至 3NF、反正規化及存取權。
- 選修 B「網頁開發」：客戶端—伺服器、網絡服務與實施、HTML／CSS、表單驗證、cookie 及單表數據操作。
- 選修 C「程式編寫」：搜尋與排序、數據結構、文字檔、測試除錯、感應器、事件處理及實體裝置應用。
- DSE 題型練習：463 題原創中央題庫，包括必修選擇題 180 題、必修短答／結構題 100 題，以及選修 A、B、C 各 60 題；支援圖像、資料回應及相連分題。
- 正式模擬考模式：3 份兩小時卷一（甲部 40 分、乙部 60 分）及每個選修 2 組卷二題組；具倒數、標記、未答導覽、自動交卷、正式比例換算、課題分析及列印版。
- 錯題簿與弱項重練：在目前瀏覽器保存錯題、遺漏評分點、錯誤類型、第一次／最近得分，並安排 1、3、7、14 日重練。
- 歷屆問法索引：以年份、課題、問法及官方來源整理公開考生表現示例，不重製受版權保護的原題或評分準則。
- SBA 準備室：通用證據清單、可測需求示例、需求追蹤表、測試表產生器、成效指標及以證據為本的評估提示。
- SQL 互動學習平台：瀏覽器內執行 SQLite、檢視資料表、關係及 ER 圖。
- Python／偽代碼／流程圖工具：雙向轉換、語法檢查及程式執行。
- PKI 實驗室：公開／私人密碼匙加密及數碼簽署概念模型。
- 網絡及多媒體互動示範，以及部分章節的即時回饋測驗。
- 共用學習助手：26 個課程頁均提供配合課題的圖像導讀、學習目標、課程界線、互動概念圖、常見誤解、快速檢查，以及由中央題庫載入的原創 DSE 題型與逐分準則。

## 課程依據

內容範圍以教育局 2021《資訊及通訊科技課程及評估指引（中四至中六）》為基準，並參考考評局最新 HKDSE ICT 評核大綱。本站的題目及教材均為原創內容，並非官方歷屆試題或評分參考。

## 內容與程式結構

- `course_data.js`：課程、工具、路徑及穩定內容 ID 的唯一資料來源。
- `question_data.js`、`question_expansion_data.js`：DSE 題型中央題庫；每題以 `topicId` 連結一項課程或工具，大容量題庫另設擴充資料檔以保持基礎題清晰。
- `past_paper_data.js`：歷屆公開示例的年份、卷別、課題、問法及官方連結元資料，不包含原題或評分準則。
- `learning_data.js`：每頁圖像導讀、學習目標、課程界線、概念節點、常見誤解、快速檢查及精選題目連結的中央資料。
- `assets/images/lesson-visuals/`：供課程頁共用的原創 WebP 教學圖像及生成提示紀錄；真實硬件照片則保留在 `assets/images/network/` 並列明來源及授權。
- `assets/css/platform.css`：所有頁面的共用視覺系統。
- `assets/css/learning.css`：共用學習助手及互動概念圖樣式。
- `assets/css/core-lesson-refresh.css`：必修課題的共用背景、導覽和內容卡片視覺修飾。
- `assets/css/system-lesson.css`：必修 B 課頁的共用版面、機器周期及操作模式互動樣式。
- `assets/css/internet-lesson.css`：必修 C(b)–C(d) 的搜尋、串流、網頁設計及保安互動樣式。
- `assets/css/algorithm-lesson.css`：必修 D 的 IPO、追蹤表、列表執行和邊界測試互動樣式。
- `assets/css/society-lesson.css`：必修 E 的科技比較、人體工學、軟件授權及社會議題互動樣式。
- `assets/css/elective-lesson.css`：選修 A、B、C 的數據庫、網絡服務、網頁流程、演算法及裝置模擬共用樣式。
- `assets/css/mock.css`、`assets/css/mistakes.css`、`assets/css/past-paper-index.css`、`assets/css/sba.css`：模擬考、錯題簿、歷屆索引及 SBA 準備室的專用版面。
- `assets/css/question-visuals.css`：題庫的網絡、CPU、ER 圖、試算表、流程圖、追蹤表及資料回應圖像元件。
- `assets/js/site_navigation.js`：共用全站導覽、頁面識別及課程來源頁尾。
- `assets/js/lesson_companion.js`：學習助手的展開、概念探索、即時檢查及頁內 DSE 題型互動。
- `assets/js/system-lessons.js`：機器周期、裝置選擇、操作模式判斷及嵌入式題目互動。
- `assets/js/internet-lessons.js`：搜尋組合、串流緩衝、HTML 結構、受眾設計及威脅配對互動。
- `assets/js/algorithm-lessons.js`：IPO 分析、算法追蹤、列表執行、邊界值及錯誤分類互動。
- `assets/js/society-lessons.js`：科技創新比較、AI 數據流程、人體工學檢查、公平使用情境及軟件授權互動。
- `assets/js/elective-lessons.js`：關鍵碼／完整性、伺服器角色、正規化、網頁流程、演算法及溫控裝置互動。
- `assets/js/catalog.js`：首頁目錄及搜尋。
- `assets/js/question_engine.js`：題目篩選、作答、逐點評分、圖像呈現及錯題記錄流程。
- `assets/js/question_visuals.js`：以可列印的 HTML／CSS 呈現網絡、數據表、圖表、CPU、流程圖等題目刺激材料。
- `assets/js/mock_exam.js`：穩定組卷、正式分部、限時、標記、交卷評分、課題分析及三種列印模式。
- `assets/js/study_records.js`、`assets/js/mistakes.js`：本機錯題資料、間隔重練日程及錯題簿介面。
- `assets/js/past-paper-index.js`：歷屆元資料篩選及問法導覽。
- `assets/js/sba.js`：只在目前頁面運作的 SBA 證據清單、測試表產生器及成效指標。

內容及題目的永久 `id` 供錯題重練和日後完整進度系統使用。即使標題或檔名改變，也不應重用或隨意修改既有 ID。

目前版本沒有學生登入、雲端資料庫或跨裝置同步。錯題資料只保存在該瀏覽器的 `localStorage`，不會上載 GitHub Pages；清除網站資料或轉用裝置便不會保留。SBA 表格仍只在目前頁面運作。

## 新增課程或工具

1. 建立 HTML 頁面，載入共用平台及學習助手的 CSS／JavaScript。
2. 在 `course_data.js` 的合適章節加入項目。
3. 在 `learning_data.js` 加入該頁的學習提示。
4. 執行目錄及學習提示驗證。

## 新增練習題

1. 在 `question_data.js` 或 `question_expansion_data.js` 加入題目，提供 `id`、`topicId`、`difficulty`、`marks`、`answer`、`markingScheme` 及 `explanation`；圖像題可另加 `visual`。
2. 確保 `topicId` 對應 `course_data.js` 的內容 ID。
3. 執行 `node scripts/validate_questions.js`。

## 驗證

```text
node scripts/validate_catalog.js
node scripts/validate_questions.js
node scripts/validate_mock_exam.js
node scripts/validate_study_records.js
node scripts/validate_learning_data.js
```

目錄驗證會檢查重複識別碼、實際頁面、未列入目錄的 HTML，以及本機 `href`／`src`。題庫驗證會檢查題型、難度、課題連結、答案、評分準則、圖片檔、文字重複及目標題量；模擬卷驗證會檢查 3 份卷一的 40 + 60 分結構、每個選修的 2 組 25 分題組，以及圖像題和相連情境；錯題驗證會走完 1、3、7、14 日重練狀態；學習提示驗證則確保每個目錄項目都有完整的教學輔助資料，並檢查每個課程頁的圖像檔、替代文字、尺寸及觀察重點。

## 技術

HTML5、JavaScript、Tailwind CSS、React、SQLite WebAssembly、Pyodide、Mermaid 及 Lucide Icons。網站可直接透過 GitHub Pages 使用，毋須後端服務。

線上版本：https://kenkmc.github.io/hkdse_ict/
