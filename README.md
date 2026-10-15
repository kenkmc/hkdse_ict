# 高中 ICT 學習資源網

以繁體中文提供 HKDSE 資訊及通訊科技科的課程重點、逐步動畫、互動模型與練習。

## 課程依據與範圍

依據教育局[《資訊及通訊科技課程及評估指引》（2021）](https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/technology-edu/curriculum-doc/ICT_C%26A%20Guide_c_final.pdf)，適用於2025年及以後的文憑試。現行架構為五個必修單元及三個選修（學生選其中兩項）。

- 42個課題：7個原有課頁增強、35個新建重點課頁（含SBA）。
- 129組可播放、暫停、逐步、回看、重設、調速的講解，共392個步驟，附文字及理解題。
- 4個可自行輸入數據的模型：4/8位元補碼相加與溢出、音訊取樣與量化、氣泡/選擇/插入排序、堆疊/隊列。
- 保留及改良 SQL、PKI、Python／偽代碼／流程圖工具。
- 首頁與隨機跳轉共用 `course_data.js`，只連到存在的課頁。

新課明示「課程重點與互動示例」。頁數及動畫數不代表已完全覆蓋每項學習成果；試算表、DBMS、組網、網上應用整合及實物編程仍須實作。

[網站課程對照](curriculum.html) · [逐課檢視全文](docs/CURRICULUM_REVIEW.md) · [互動模型說明](docs/INTERACTIVE_MODELS.md)

## 本機預覽

在此資料夾執行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打開 `http://127.0.0.1:8000/`。網站為靜態 HTML/JS/CSS，無需建置。新增首頁、課頁及模型不依賴外部套件；原有課頁與工具仍使用 CDN（Tailwind、Lucide、React、sql.js、Mermaid、Pyodide 等），使用這些部分須可連網。原有遠端圖像也須連線。

GitHub Pages 網址：[kenkmc.github.io/hkdse_ict](https://kenkmc.github.io/hkdse_ict/)。實際內容以已合併及已部署的分支為準。

## 驗證

使用 Node.js，從儲存庫根目錄執行：

```sh
node tests/verify.cjs
node tests/core-a.cjs
node tests/network-tools.cjs
node tests/interactive-models.cjs
```

驗證包括全部課頁及本地連結、講解資料、JavaScript語法、有效性檢驗、Unicode、SQL結果、TCP暫停及重設、DNS重複查詢、PKI情境切換，以及65,792組補碼運算、321條排序軌跡、FIFO/LIFO及48組取樣設定。

瀏覽器檢查與仍需教師覆核的範圍記錄於 [驗證報告](docs/VALIDATION.md)。測試在記憶體或本機執行，不讀取學生資料。

## 維護

- `course_data.js`：統一目錄及隨機跳轉。
- `assets/new-lessons.js`、`programming-lessons.js`、`programming-supplements.js`：新課文字與逐步數據。
- `assets/core-a-labs.js`、`network-labs.js`：既有課頁及工具的補充講解。
- `assets/learning-lab.js/.css`：共用播放器及新課渲染。
- `assets/interactive-models.js/.css`：可調參數的計算與視覺模型。

此網站為教育輔助資源，並非考評局官方教材；評核安排以當屆考評局文件與學校指示為準。
