# 必修 D、選修 C 與 Python 工具：逐頁逐節檢視

本檔記錄本次負責的 22 頁：主站 7 頁、獨立教材 15 頁。已讀取各節正文、原示範步驟、程式碼、理解題、練習及主站評分準則；不是按頁名批量套用動畫。

動畫的位置由 `assets/js/lesson-plan-algorithms.js` 指定。每項機制放在對應概念的正文後、理解題前；不再在頁首集中陳列全部機制。不同課題使用流程圖、陣列、記憶體、訊號線、指標、呼叫框架或檔案，不以一套換文字的卡片當作所有動畫。

## 共通保留與刪併決定

- 主站各頁的課程範圍、導覽、導言、原創題目、答題框、評分準則及離頁自檢全部保留。這些文字本身已清楚，不加無關動效或照片。
- 獨立教材各頁的學習目標、正文、範圍說明、動手做、來源及理解題保留。舊的逐卡文字示範由共用 renderer 移除，理解題獨立保留；必需的程式碼及理解題使用的特定數據由本檔列明的位置補回。
- 同一機制若已完整解釋，不在相鄰小節再建立第二套按鈕；改用有內容的對照程式碼、SVG 圖或節內連結。練習不因動畫而預填答案。
- 本範圍以程式狀態、位值及圖形關係為主，DOM/SVG 比裝飾性照片更準確；沒有為湊數而加圖片。靜態 SVG 有可讀標題／說明，動效遵從減少動態效果設定。

## 主站課頁

### `chd.1.html` 問題定義及分析

| 節 | 判斷與實作 |
|---|---|
| Hero／分析四步 | 保留課程定位及目標、輸入、處理、輸出的閱讀框架；不另播放同一摘要。 |
| `#scope` 問題範圍 | 保留四項定義及 BMI 的可驗證規格。這是規格閱讀，不需要裝飾動畫。 |
| `#ipo` | 移除只切換三組文字的舊 IPO 面板；改為 `spec-contract`。實際輸入數量與單價，驗證成功才計算，最後格式化，並保留被拒絕的輸入。 |
| `#thinking` | 保留分解、模式辨認、抽象化的不同例子；把 `problem-workbench` 放在本節，用目標改變所需欄位及結果。 |
| `#dse-practice` | 校園活動報名題及全部 8 分評分準則保留。 |
| 自檢／下一課 | 保留三項檢查及既有連結。 |

### `chd.2.html` 算法設計

| 節 | 判斷與實作 |
|---|---|
| Hero／dry run 提示 | 保留；不插入頁首展示區。 |
| `#represent` | 移除重複的靜態迷你流程圖，保留同一規則的偽代碼；旁接 `decision-flow`，使用真實菱形、輸入／輸出符號及兩條有標籤的分支。 |
| `#types` | 保留類型定義及 Boolean 判斷題；加入 `python-input-types`，實際比較 str 重複與 int 乘法、非法轉換。 |
| `#control` | 保留順序、選擇、迭代的概念；`boolean-wires` 展示 NOT 後的結果流入 AND／OR，不再只靠文字說明條件。 |
| `#trace` | 移除固定 1–4 的舊追蹤按鈕與已填答案表；`python-registers` 逐行連接程式與變數記憶體，n 可改變。 |
| `#modules` | 保留模組化的責任、測試、重用及修改好處；`recursive-frames` 已改為預設一般 discount 呼叫，展示參數框架及 return，遞歸只是可選延伸。 |
| `#dse-practice`／自檢 | 保留 8 分題目、答案框、評分及下一課。 |

### `chd.3.html` 程式開發

| 節 | 判斷與實作 |
|---|---|
| Hero／變數初值提示 | 保留。 |
| `#building` | `assignment-writeback` 對應賦值：讀舊 x、運算、寫回，再作不改變 x 的比較；保留變數、常數及 I/O 正文。 |
| `#operators` | 保留算術、關係、Boolean 定義及 AND 理解題；`python-input-types` 解釋文字 `"10"` 與整數 10 的不同。 |
| `#control` | 保留多向選擇與 while 的原碼；`grade-and-modulus` 可把 50 放在 80 前，實際觀察 85 的錯誤分類；`sentinel-reader` 展示哨兵不被累加及漏更新時停滯。 |
| `#lists` | 移除固定五個分數的舊計數 demo；`filtered-statistics` 同步更新符合條件的 total、count，並處理沒有達標資料和空表。 |
| `#patterns` | 拆成靠近各概念的小區，保留全部任務的必要正文，避免把所有動畫放在節尾。 |
| `#pattern-extrema` | `extrema-order` 以全負數測試極值初值，亦可切換相鄰次序檢查。 |
| `#pattern-search` | `array-search` 顯示逐項指標或二分候選範圍；明示二分需要排序。 |
| `#pattern-string` | `string-positions` 顯示 ASCII 字符索引、負索引與不包含終點的切片。 |
| `#pattern-array` | `array-shifting` 顯示插入由右至左、刪除向左補位和有效長度。 |
| 數學公式文字／練習／自檢 | 保留單位、括號、除數提醒，以及 8 分題目、評分及下一課。 |

### `chd.4.html` 程式測試及除錯

| 節 | 判斷與實作 |
|---|---|
| Hero／測試表三欄 | 保留測試目的、預期與實際的閱讀框架。 |
| `#strategy` | 四類測試及有限測試的限制保留，不以動畫代替文字定義。 |
| `#boundary` | 移除只切換固定案例文字的舊面板；`boundary-line` 在數線上逐例比較預期與實際，改 `>`／`>=` 後重測。文字另明示 abc、12.5、空白均須拒絕。 |
| `#errors` | 把舊三按鈕文字分類改為一張 SVG：剖析 → 執行 → 核對結果。保留原錯誤分類理解題。 |
| `#debug` | 保留重現、定位、原因、最小修正與回歸的五步；不以第二套年齡 demo 重複邊界節。 |
| `#debug-precision` | `decimal-precision` 在解釋先訂精度規則的短文後展示截斷、捨入及連續進位；明示這是十進制模型，不能代替浮點誤差處理。 |
| `#compare` | 保留逐項／範圍減半的前提及成本比較表，`array-search` 用可改資料驗證比較次數。 |
| 練習／自檢 | 保留兩端均有錯的年齡條件題及所有 8 分評分準則。動畫只示範其中一端的差一錯誤，不改寫原題。 |

### `ec.1.html` 選修程式編寫

| 節 | 判斷與實作 |
|---|---|
| Hero／trace 四步 | 保留。 |
| `#algorithms` | 移除只切換定義的舊選項面板，保留排序比較表及 merge／quick 的課程認識範圍。 |
| `#search-algorithm` | `array-search` 對照兩種搜尋的前提、指標及步數。 |
| `#sort-algorithm` | `sorting-bars` 接在三種排序動作比較表，實際移動同一編號的資料柱。 |
| `#structures`／`#stack-operations` | 移除裝飾性的 A、B、C 方塊；`stack-queue-slots` 顯示實際槽位、size、top／head／tail、空滿及循環重用。 |
| `#linked-operations` | `linked-array` 分開物理索引與邏輯次序，逐步修改 next，再回收刪除節點。 |
| `#quality`／`#file-handling` | 保留檔案工作流程；`sequential-file` 展示原檔與暫存檔、讀頭、略過／修改／附加及關閉替換時機。 |
| `#call-frame` | `recursive-frames` 的一般函數模式顯示參數與局部框架的生命週期。 |
| `#parameter-sharing` | `parameter-bindings` 預設列表例子，用指向同一物件的箭頭區分 append 與重新綁定，避免與上一節重複數字呼叫。 |
| `#nested-control` | `nested-grid` 在內外迴圈正文後，支援矩形與三角形範圍。 |
| `#numeric-errors` | `decimal-precision` 對應捨入／截斷；保留 overflow、underflow 及浮點限制文字。 |
| `#debug-tools` | 保留 breakpoint、trace、flag、stub、風格及結構化程式的用途；不再用卡片切換相同定義。 |
| 原創練習／自檢 | 保留搜尋、stack 及除錯的 9 分題目與評分。 |

### `ec.2.html` 實際應用

| 節 | 判斷與實作 |
|---|---|
| Hero／情境四格 | 保留。 |
| `#loop` | 保留感測、函式庫、輸出的流程與定義；`sensor-greenhouse` 放在這裡，展示事件到達後才更新設備。 |
| `#simulator` | 保留原有有狀態的雙閾值溫控器，因它教遲滯而不是事件傳輸，與上一節不同；補上按真實 fanOn 狀態轉動的 SVG 風扇。30／28°C、保持舊狀態及原偽代碼保留。 |
| `#events` | Range check、debounce、timeout、manual override 及語音／加速度例子保留；其短文已足夠，不加與實物無關的裝飾動效。 |
| 原創練習／自檢 | 保留智能溫室的 8 分題目、評分及下一步連結。 |

### `python_converter.html` 與 `animations/python_converter.html`

| 區域 | 判斷與實作 |
|---|---|
| 標題／語言切換 | 保留兩語及功能定位。 |
| 左側模式、範例及輸入 | 保留 Python、偽代碼、流程圖三種模式，範例選擇、文字編輯、Tab、最大化、節點新增刪除與連線。沒有替換真正的編輯器。 |
| 轉換、語法及執行按鈕 | 保留原程式、Mermaid 與 Pyodide。語法檢查與程式執行仍是工具原有功能。 |
| 右側結果／狀態 | 保留原 DOM IDs 及輸出區，不把課題動畫插入工具的工作區或覆蓋輸出。 |
| `#python-decision-guide` | 在工具之後的解說區加入 `decision-flow`，練習實際走哪條分支，與編輯器的建圖工作有別。 |
| `#python-trace-guide` | `python-registers` 把同一路徑中的變數更新具體呈現；保留轉換範圍限制說明。 |

## 獨立教材逐節決定

以下各頁共同保留導言、學習目標、理解題、動手做及來源；表內逐節列出刪併和視覺化實作。

| 頁 | 節 | 實作及避免重複的決定 |
|---|---|---|
| `animations/chd.1.html` | `#topic-0` 情境到規格 | `list-statistics` 對應有效資料、總和、人數與空表。 |
| 同頁 | `#topic-1` 分解與抽象 | `problem-workbench` 實際移除無關欄位並保持結果。 |
| 同頁 | `#topic-2` 規格到介面 | `spec-contract` 對應原數量 1–99、單價、驗證及 HK$ 顯示；保留拒絕 3.5 的理解題。 |
| `animations/chd.2.html` | `#topic-0` 選擇與流程圖 | `decision-flow`；修正文中「以文字節點表達」為真正流程符號。 |
| 同頁 | `#topic-1` 偽代碼 | 補回完整 IF／ELSE 偽代碼及 Python 縮排對照，連回上一節同一張圖，不再建一套重複分支動畫。 |
| 同頁 | `#topic-2` Boolean／空運行 | `boolean-wires` 與真值表對應 member AND NOT overdue。 |
| `animations/chd.3.html` | `#topic-0` 累積迴圈 | `python-registers` 預設 n=3，與 range(1,4) 的三次迭代一致。 |
| 同頁 | `#topic-1` 哨兵 | `sentinel-reader` 預設 4,6,-1，終值 10；支援立即哨兵及漏讀新輸入。 |
| 同頁 | `#topic-2` 插入刪除 | `array-shifting` 使用與正文相同容量 5，顯示右移／左移與有效長度。 |
| `animations/chd.4.html` | `#topic-0` input／類型 | `python-input-types`，保留 input 回傳 str、常數約定及 Python 沒有獨立 char 的文字。 |
| 同頁 | `#topic-1` 賦值比較 | `assignment-writeback` 預設 x=3、增量 1，得到 4；區分賦值與比較。 |
| 同頁 | `#topic-2` 多向及模數 | `grade-and-modulus` 支援錯誤條件次序與分組商／餘數；不把兩者混成同一種運算。 |
| `animations/chd.5.html` | `#topic-0` 條件累計 | `filtered-statistics` 預設 40,60,80／界線 50，與理解題平均 70 一致。 |
| 同頁 | `#topic-1` 線性文字檢索 | `normalized-string-search` 預設 BIO,ICT,MATH 及空白小寫搜尋詞；原記錄不被改寫，首個匹配為索引 1。 |
| 同頁 | `#topic-2` 極值及效率 | `extrema-order` 預設全負數 -8,-3,-5，以首項初始化。 |
| 同頁 | `#topic-3` 字符提取 | `string-positions` 使用 HK0123，展示索引、負索引、len 及 end 不包括在內，限制 ASCII 的說明保留。 |
| 同頁 | `#topic-4` 次序及改規格 | 補回相鄰比較／break 的程式、三對比較的 SVG，連回上一個掃描器的次序模式，不重複一套相同控制。 |
| `animations/chd.6.html` | `#topic-0` 三類錯誤 | 以剖析、執行、核對結果的 SVG 及三段實際錯誤碼取代逐卡文字。 |
| 同頁 | `#topic-1` 邊界追蹤 | `boundary-line`、異常輸入及回歸的正文／題目保留。 |
| `animations/elecc.1.html` | `#types` 表示與累積 | `list-statistics` 展示總和、人數及空表；電話／學號作字串及浮點限制文字保留。 |
| 同頁 | `#merge` 交換與合併 | `merge-pointers` 追蹤兩個未處理首項及輸出；補回 temp 暫存交換碼，避免把資料覆寫。 |
| `animations/elecc.2.html` | `#numbers` 精度與範圍 | `decimal-precision` 加固定 8 位元 127→128→−128 範圍圖；補回 math.isclose，明確不把固定字長套到 Python int。 |
| 同頁 | `#debug` 定位錯誤 | `count-breakpoint` 用 49,50,51 的預期／實際計數定位 >／>=；補回斷點位置與回歸例碼，保留黑箱／白箱／stub 正文。 |
| `animations/elecc.3.html` | `#nested` 二維資料 | `nested-grid` 展示 i、j 及重設內層；補回每列 row_sum 重設的位置。 |
| 同頁 | `#counts` 次數及條件 | 用 1+2+3 的 SVG 取代重複逐卡步驟，連回矩陣的三角模式；break 只離開最近一層的文字保留。 |
| `animations/elecc.4.html` | `#calls` 呼叫回傳 | `recursive-frames` 預設一般 discount，與實際參數／局部框架／return 的課題一致。 |
| 同頁 | `#scope` 作用域及列表 | `parameter-bindings` 預設共享列表，切換 append／重新綁定，箭頭顯示 data 和 items 是否仍指同一物件。 |
| `animations/elecc.5.html` | `#stackqueue` | `stack-queue-slots`；額外保留題目所用容量 3、陣列 [D,B,C]、front=1、rear=1、count=3 的精確例碼，不能只留下題目而刪除其依據。 |
| 同頁 | `#linked` | `linked-array` 預設 head=2，順序 2→0；先保存 next[1]，再接 next[2]，最後示範刪除回收。 |
| `animations/elecc.6.html` | `#search` | `array-search`，空表、重複值、找不到及排序成本的正文保留。 |
| 同頁 | `#sort` | `sorting-bars` 三種排序，保留資料編號及已確定區；原文對 merge／quick 及算法成本的提示保留。 |
| `animations/elecc.7.html` | `#readwrite` | `file-open-modes` 明示 w 在開啟時截斷、a 不按鍵修改、r 不可寫；補回 csv.reader 範例，保留 UTF-8 與 with 說明。 |
| 同頁 | `#update` | `sequential-file` 顯示 temp 檔與原檔分開；修正舊模型把不存在索引靜默夾到有效範圍的行為，改為保留原資料。 |
| `animations/elecc.8.html` | `#sensor` | 使用雙閾值遲滯 SVG 及精確程式；不以單閾值事件模型替代本節的 30／40 保持狀態規格。 |
| 同頁 | `#events` | `sensor-greenhouse` 在事件驅動小節，與上一節的遲滯形成清楚分工；保留實物、函式庫、誤差及噪音驗證限制。 |

## 驗證

`node tests/topic-algorithms.cjs` 驗證 30 個實際 mount 的完整單步、完成、重設、輸入改變及 cleanup，另檢查搜尋、排序不變量、交易、矩形／三角迭代、回傳、位值、哨兵、陣列搬移、型別、Boolean、篩選計數、字串、合併、參數綁定、鏈表及檔案模式。重要新增案例包括：立即哨兵、漏讀新輸入、滿陣列、非法插入位置、全負數、空表、第一個次序反例、w 在 write 之前截斷、目標記錄不存在、共享列表與重新綁定的差別，以及 > 的計數 1 與規格 >= 的預期 2。

共用 runtime 的全頁資源、目標選擇及實際頁面載入由整合測試與瀏覽器驗證另行核對；本檔不把純函數測試說成已驗證視覺版面。
