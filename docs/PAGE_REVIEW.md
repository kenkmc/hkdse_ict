# 逐頁、逐節教材檢視索引

檢視及修訂日期：2026-10-16 至 2026-10-17。這是現行版本的總索引；早期整合記錄中的 43 個模型、129 組逐步講解及 4 個可調模型均屬歷史版本。

## 範圍及現行結構

公開網站的 **85 個 HTML 頁面**均有原始碼與內容檢視記錄：資訊處理／電腦系統／數據庫 25 頁、網絡／網頁／保安 20 頁、運算思維／程式／Python 工具 22 頁，以及社會影響／SBA／網站服務 18 頁。檢視包括各節正文、示範、圖片、理解題、實作及原有工具，逐項決定保留、合併、刪除重複或補充機制。

現行註冊表共有 **88 個教學元件**：數據與系統 22、網絡與網頁 22、算法與程式 30、社會影響及相關主題 14。這個數字包含可操作模型及部件外形圖等教學元件，並非 88 段動畫影片。原有 SQL、PKI 等完整工具另按其用途保留。

**75 個教材／工具頁有明確段落計畫**；其中 71 頁合共有 **194 個安放位置**，另外 4 頁以空計畫保留原 SQL／PKI 工具。其餘 10 頁是目錄、題庫、評核、進度或資訊服務，不加入會重複課文或洩漏題目推理的教學模型。

- [資訊處理、系統及數據庫逐節記錄](REVIEW_DATA.md)：25 頁。
- [網絡、網頁及保安逐節記錄](REVIEW_NETWORK.md)：20 頁。
- [運算思維、程式及 Python 工具逐節記錄](REVIEW_ALGORITHMS.md)：22 頁。
- [社會影響、SBA 及網站服務逐節記錄](REVIEW_CONTEXT_AND_SITE.md)：18 頁。
- [元件設計及模型界線](../TOPIC_ANIMATIONS.md)、[整合歷史](../ANIMATION_INTEGRATION.md)、[網站更新紀錄](../updates/index.html)。

## 段落整合及去重

`assets/js/lesson-plan-*.js` 指定每個元件的實際課節；`topic-runtime.js` 把它放在相關解說內，生成教材的理解題之前。同頁同一機制只安放一次，沒有頁首動畫合集或新增項目宣傳。學習助手預設收合，原課文、作答欄、理解題及評分準則保留。

奇偶檢查、補碼、TCP／DNS、串流、HTML、CPU 及通用程式流程等重複示範已按四份逐節記錄合併。分課教材移除重複的通用逐卡講稿，必要程式碼、數據與理解題保留。完整 SQL／PKI 工具不再附加另一個固定資料的同類示範；原 PKI 工具另加入竄改後驗證失敗的路徑。

精確位元、公式、資料表、流程及操作狀態以 HTML／SVG 呈現；硬件外形使用本地部件圖及已有授權的實物照片。圖片有替代文字與來源記錄，沒有為每節加裝飾圖片或無意義的移動效果。

## 驗證與證據

| 層次 | 可核對的範圍 |
|---|---|
| 原始碼與教材閱讀 | 下方 85 頁清單及四份逐節記錄；原始碼閱讀不等於所有操作路徑均已實測。 |
| 模型及元件測試 | 四個 `tests/topic-*.cjs` 測試實際運算、狀態、輸入改變、完成／重設及清理；各份逐節記錄列出重要邊界案例。 |
| 實際 router 回歸 | `tests/topic-coverage.cjs` 執行 75 個路徑，核對註冊 ID、真實段落選擇器、資源及載入次序、理解題前位置、去重、空計畫、深層連結及清理。它使用 DOM fixture，不冒稱瀏覽器視覺測試。 |
| 保留工具及平台檢查 | `animations/tests/` 及 `scripts/validate_*.js` 檢查保留的課頁／工具行為與平台資料；可重跑命令見下方。 |
| 瀏覽器載入及版面 | 全部 85 頁均以瀏覽器桌面預設 1280 × 720，以及真實 390 × 844 手機尺寸檢查；結果保存在 [瀏覽器檢查資料](qa/browser-audit-20261017.json)，代表性操作及範圍見頁末。 |



在儲存庫根目錄可重跑：

```text
node tests/topic-data.cjs
node tests/topic-network.cjs
node tests/topic-algorithms.cjs
node tests/topic-context.cjs
node tests/topic-coverage.cjs
node animations/tests/verify.cjs
node animations/tests/core-a.cjs
node animations/tests/network-tools.cjs
node animations/tests/interactive-models.cjs
```

頁面載入與版面檢查不等於完整的跨瀏覽器、輔助科技、學生成效或全部互動路徑測試。模型亦不取代真實網絡裝設、試算表、DBMS、伺服器整合、實物編程及教師回饋。

## 85 頁清單

清單由目前公開 HTML 檔案與四份段落計畫核對整理。「安放」是本頁的註冊元件位置數；`0（原工具）` 代表有意保留完整工具，`—（服務頁）` 代表不屬於教材模型掛載計畫，兩者均已完成內容檢視。


### 資訊處理、系統與數據庫（25 頁）

[逐節記錄](REVIEW_DATA.md)

| 頁面 | 頁名 | 安放 |
|---|---|---|
| [animations/cha.1.html](../animations/cha.1.html) | 1. 資訊處理簡介 - ICT 學習資源網 | 1 |
| [animations/cha.2.html](../animations/cha.2.html) | 2. 數據控制及數據組織 - ICT 學習資源網 | 4 |
| [animations/cha.3.html](../animations/cha.3.html) | 3. 數據表示 - ICT 學習資源網 | 5 |
| [animations/cha.4.html](../animations/cha.4.html) | 4. 試算表 - ICT 學習資源網 | 1 |
| [animations/cha.5.html](../animations/cha.5.html) | 5. 數據庫 - ICT 學習資源網 | 1 |
| [animations/chb.1.html](../animations/chb.1.html) | 輸入及輸出設備 · ICT | 1 |
| [animations/chb.2.html](../animations/chb.2.html) | 電腦硬件 · ICT | 3 |
| [animations/chb.3.html](../animations/chb.3.html) | 電腦軟件 · ICT | 3 |
| [animations/db_simulator.html](../animations/db_simulator.html) | HKDSE ICT SQL 學習平台 | 0（原工具） |
| [animations/eleca.1.html](../animations/eleca.1.html) | 運用SQL管理數據 · ICT | 2 |
| [animations/eleca.2.html](../animations/eleca.2.html) | SQL運算符與函數 · ICT | 2 |
| [animations/eleca.3.html](../animations/eleca.3.html) | 多表SQL操作 · ICT | 2 |
| [animations/eleca.4.html](../animations/eleca.4.html) | 關聯式數據庫 · ICT | 2 |
| [animations/eleca.5.html](../animations/eleca.5.html) | 數據庫設計與ER圖 · ICT | 3 |
| [cha.1.html](../cha.1.html) | 1. 資訊處理簡介 - ICT 學習資源網 | 1 |
| [cha.2.html](../cha.2.html) | 2. 數據組織及數據控制 - ICT 學習資源網 | 4 |
| [cha.3.html](../cha.3.html) | 3. 數據表示 - ICT 學習資源網 | 5 |
| [cha.4.html](../cha.4.html) | 4. 試算表 - ICT 學習資源網 | 1 |
| [cha.5.html](../cha.5.html) | 5. 數據庫 - ICT 學習資源網 | 1 |
| [chb.1.html](../chb.1.html) | B1 基本機器組織 - ICT 學習資源網 | 4 |
| [chb.2.html](../chb.2.html) | B2 系統軟件 - ICT 學習資源網 | 3 |
| [db_simulator.html](../db_simulator.html) | HKDSE ICT SQL 學習平台 | 0（原工具） |
| [ea.1.html](../ea.1.html) | 選修 A1 關聯數據庫概念 - ICT 學習資源網 | 2 |
| [ea.2.html](../ea.2.html) | 選修 A2 SQL - ICT 學習資源網 | 3 |
| [ea.3.html](../ea.3.html) | 選修 A3 數據庫設計方法 - ICT 學習資源網 | 3 |

### 網絡、網頁與保安（20 頁）

[逐節記錄](REVIEW_NETWORK.md)

| 頁面 | 頁名 | 安放 |
|---|---|---|
| [animations/chc.1.html](../animations/chc.1.html) | C1 建網及互聯網基本知識 - ICT 學習資源網 | 3 |
| [animations/chc.2.html](../animations/chc.2.html) | C1-2 互聯網協定 - ICT 學習資源網 | 4 |
| [animations/chc.3.html](../animations/chc.3.html) | 互聯網服務及應用 · ICT | 3 |
| [animations/chc.4.html](../animations/chc.4.html) | 初級網頁創作 · ICT | 2 |
| [animations/chc.5.html](../animations/chc.5.html) | 網上威脅 · ICT | 2 |
| [animations/chc.6.html](../animations/chc.6.html) | 網絡保安措施 · ICT | 3 |
| [animations/elecb.1.html](../animations/elecb.1.html) | 客戶機與伺服器通訊 · ICT | 2 |
| [animations/elecb.2.html](../animations/elecb.2.html) | 網絡服務與裝設 · ICT | 3 |
| [animations/elecb.3.html](../animations/elecb.3.html) | 網頁編寫與出版 · ICT | 2 |
| [animations/elecb.4.html](../animations/elecb.4.html) | 客戶端與伺服器端編程 · ICT | 2 |
| [animations/elecb.5.html](../animations/elecb.5.html) | 綜合網上應用程式 · ICT | 2 |
| [animations/pki_animation.html](../animations/pki_animation.html) | PKI 多場景互動教學 | 0（原工具） |
| [chc.1.html](../chc.1.html) | C1 建網及互聯網基本知識 - ICT 學習資源網 | 3 |
| [chc.2.html](../chc.2.html) | C(a)-2 互聯網協定 - ICT 學習資源網 | 4 |
| [chc.3.html](../chc.3.html) | C3 互聯網服務及應用 - ICT 學習資源網 | 2 |
| [chc.4.html](../chc.4.html) | C4 基礎網頁編寫 - ICT 學習資源網 | 2 |
| [chc.5.html](../chc.5.html) | C5 網上威脅與保安 - ICT 學習資源網 | 4 |
| [eb.1.html](../eb.1.html) | 選修 B1 網絡服務與實施 - ICT 學習資源網 | 4 |
| [eb.2.html](../eb.2.html) | 選修 B2 網頁程式編寫與應用 - ICT 學習資源網 | 4 |
| [pki_animation.html](../pki_animation.html) | PKI 多場景互動教學 | 0（原工具） |

### 運算思維、程式與 Python 工具（22 頁）

[逐節記錄](REVIEW_ALGORITHMS.md)

| 頁面 | 頁名 | 安放 |
|---|---|---|
| [animations/chd.1.html](../animations/chd.1.html) | 問題建構和分析 · ICT | 3 |
| [animations/chd.2.html](../animations/chd.2.html) | 算法設計（一） · ICT | 2 |
| [animations/chd.3.html](../animations/chd.3.html) | 算法設計（二） · ICT | 3 |
| [animations/chd.4.html](../animations/chd.4.html) | Python編程入門 · ICT | 3 |
| [animations/chd.5.html](../animations/chd.5.html) | Python綜合解難 · ICT | 4 |
| [animations/chd.6.html](../animations/chd.6.html) | 程式測試和除錯 · ICT | 1 |
| [animations/elecc.1.html](../animations/elecc.1.html) | 算法設計及程式基本知識 · ICT | 2 |
| [animations/elecc.2.html](../animations/elecc.2.html) | 程式測試和除錯（二） · ICT | 2 |
| [animations/elecc.3.html](../animations/elecc.3.html) | 進階控制結構 · ICT | 1 |
| [animations/elecc.4.html](../animations/elecc.4.html) | 子程式 · ICT | 2 |
| [animations/elecc.5.html](../animations/elecc.5.html) | 數據結構 · ICT | 2 |
| [animations/elecc.6.html](../animations/elecc.6.html) | 檢索及排序 · ICT | 2 |
| [animations/elecc.7.html](../animations/elecc.7.html) | 文字檔案處理 · ICT | 2 |
| [animations/elecc.8.html](../animations/elecc.8.html) | 現實生活的程式應用 · ICT | 1 |
| [animations/python_converter.html](../animations/python_converter.html) | Python Converter / 互動流程圖編輯器 | 2 |
| [chd.1.html](../chd.1.html) | D1 問題定義及分析 - ICT 學習資源網 | 2 |
| [chd.2.html](../chd.2.html) | D2 算法設計 - ICT 學習資源網 | 5 |
| [chd.3.html](../chd.3.html) | D3 程式開發 - ICT 學習資源網 | 9 |
| [chd.4.html](../chd.4.html) | D4 程式測試及除錯 - ICT 學習資源網 | 3 |
| [ec.1.html](../ec.1.html) | 選修 C1 程式編寫 - ICT 學習資源網 | 9 |
| [ec.2.html](../ec.2.html) | 選修 C2 實際應用 - ICT 學習資源網 | 1 |
| [python_converter.html](../python_converter.html) | Python Converter / 互動流程圖編輯器 | 2 |

### 社會影響、SBA 與網站服務（18 頁）

[逐節記錄](REVIEW_CONTEXT_AND_SITE.md)

| 頁面 | 頁名 | 安放 |
|---|---|---|
| [animations/che.1.html](../animations/che.1.html) | 科技創新 · ICT | 3 |
| [animations/che.2.html](../animations/che.2.html) | 健康及道德議題 · ICT | 4 |
| [animations/che.3.html](../animations/che.3.html) | 知識產權 · ICT | 2 |
| [animations/curriculum.html](../animations/curriculum.html) | 課程對照與閱讀指引 · ICT | —（服務頁） |
| [animations/index.html](../animations/index.html) | 高中 ICT 學習資源網 | —（服務頁） |
| [animations/sba.1.html](../animations/sba.1.html) | 由問題到可評估的方案 · ICT | 3 |
| [answer-lab.html](../answer-lab.html) | DSE 作答升級實驗室 - ICT 學習資源網 | —（服務頁） |
| [che.1.html](../che.1.html) | E1 科技創新 - ICT 學習資源網 | 3 |
| [che.2.html](../che.2.html) | E2 健康與道德議題 - ICT 學習資源網 | 4 |
| [che.3.html](../che.3.html) | E3 知識產權 - ICT 學習資源網 | 2 |
| [index.html](../index.html) | 高中 ICT 學習資源網 | —（服務頁） |
| [mistakes.html](../mistakes.html) | 錯題簿與弱項重練 - ICT 學習資源網 | —（服務頁） |
| [mock.html](../mock.html) | HKDSE ICT 完整模擬試 - ICT 學習資源網 | —（服務頁） |
| [past-paper-index.html](../past-paper-index.html) | DSE 課題答題重點 - ICT 學習資源網 | —（服務頁） |
| [practice.html](../practice.html) | DSE 題型練習 \| ICT 學習資源網 | —（服務頁） |
| [progress.html](../progress.html) | 我的學習 - ICT 學習資源網 | —（服務頁） |
| [sba.html](../sba.html) | HKDSE ICT SBA 準備室 - ICT 學習資源網 | 2 |
| [updates/index.html](../updates/index.html) | 更新紀錄 · ICT 學習資源網 | —（服務頁） |

## 2026-10-17 瀏覽器續查記錄

全部 85 頁已完成桌面預設 1280 × 720 及手機 390 × 844 的瀏覽器 DOM／幾何檢查：沒有元件初始化錯誤、重複 ID、失效的頁內錨點、空白教材或控制台錯誤。橫向量測採 1 px 容差；PKI 手機頁的 body scrollWidth 含右內距而高出視窗 1 px，但根元素寬 375 px 小於 390 px 視窗，未見實際水平捲動。其他頁均沒有正值溢出。已載入圖片沒有破圖；延遲載入而尚未進入畫面的圖片不作已目視檢查宣稱。完整量測見 [JSON 記錄](qa/browser-audit-20261017.json)。另外以 1366 × 900 保存 [一般課程目錄畫面](qa/catalogue-desktop-20261017.jpg)。

代表性瀏覽器操作已實測：

- A2 奇偶檢查：翻轉一位可偵測；翻轉兩位時奇偶值可恢復，文字說明不能偵測所有錯誤。主站與分課教材各只有一個該活動。
- A3 4 位元二補碼：7 + 1 逐位完成得到 1000，有號解讀 −8；C = 0、V = 1，區分進位與有號溢出。
- C1 客戶端／伺服器與 P2P：正常取檔、中央伺服器故障失敗，以及切換 P2P 後向持有檔案的同儕成功取檔。
- E2 調整支援與眩光控制；SBA 比較空白姓名輸入在修訂前後的實際測試結果。
- B1 部件圖片已實際載入，1536 × 1024，替代文字與圖例可讀。
- 原生 SQL 的 GROUP BY 查詢傳回 4A = 2、4B = 2、5A = 1；Python 原生 Pyodide 執行 1 至 5 加總輸出 15。
- Python 手機頁修正原有 5 px 溢出，重測 −3 px；最後再查 1280 px 桌面沒有溢出，教材解說位於頁尾之前。

本輪 21 組自動檢查全數通過：12 個平台驗證、5 個課題模型／位置測試，以及 4 個分課教材測試。88 個元件均有自動狀態或生命週期檢查。85 頁瀏覽器檢查是載入、DOM 與幾何層面，不等於逐一目視每個像素，亦不等於手動走過所有控制組合。
