# 課題教學元件：設計與界線（2026-10-17）

本文說明既有88個元件的機制。2026-10-19的課文手冊、192節教材及整合驗證另見[課文與教學記錄](docs/COMPLETE_COURSE.md)。

本次逐節檢視涵蓋 2026-10-16 至 2026-10-17。[85 頁總索引](docs/PAGE_REVIEW.md) 列出全部頁面、四份逐節決定、目前資源與驗證證據。現有 88 個註冊教學元件，包含互動模型、操作圖解及硬件外形圖；不把所有元件稱為動畫。

## 按內容表達機制

二補碼使用位元、負權值、全加器進位與溢出訊號；網絡使用設備、線路、請求及回應封包；SQL 使用資料列、條件及關聯；程式使用可變記憶體、指標、迴圈位置及呼叫框架。字體、播放及輸入的共用操作不決定各課的圖解形態。

元件直接接在相應解說內，生成教材的理解題之前。四份段落計畫涵蓋 75 個教材／工具頁，共 194 處安放；原 SQL／PKI 工具的 4 頁計畫明確為空。其餘服務頁依各自用途保留題目、紀錄及資訊。頁首不再集中展示元件，原來重複的逐卡講稿與示範按逐節記錄合併；題目與必要例碼保留。

- [二補碼](cha.3.html#sim-twos-complement-workbench)：改字長與加減法，分辨有號溢出及無號進位。
- [客戶端／伺服器](chc.1.html#sim-network-request-topology)：加入多部電腦的請求、追蹤回程，切換中央伺服器故障與 P2P。
- [TCP](chc.2.html#sim-dns-tcp-packets) 與 [DNS 快取](chc.2.html#sim-dns-cache-resolution)：分別在相關課節追蹤握手／ACK／重傳，以及快取命中／TTL 到期。
- [硬件外形](chb.1.html#sim-hardware-component-map)：部件圖配合可讀圖例；機器周期另以暫存器及匯流排說明。
- [搜尋與排序](ec.1.html#sim-sorting-bars)：資料、比較、位置與確定區實際改變；不是把算法名稱逐張顯示。

## 模型的適用範圍

| 主題 | 界線 |
|---|---|
| 位元及多媒體 | 補碼採指定固定字長，不代表 Python 一般 int 自動環回；奇偶檢查不能偵測所有錯誤。聲音／圖像大小可只計未壓縮有效載荷，容器、標頭及實際編碼另依課文說明。 |
| 系統及硬件 | CPU、快取、地址及排程採課題所需的簡化狀態，不是完整指令集、管線或真實效能模擬；部件外形圖與照片不按品牌規格或實物比例判讀。 |
| SQL 及資料設計 | 元件示範所列條件、JOIN、分組、交易及依賴；未示範的 SQL 方言、NULL、外連接或約束情況仍按課文及 DBMS 核對。原 SQL 工具可實際執行 SQLite，與固定教學資料模型的用途分開。 |
| 網絡及網頁 | DNS、HTTP、DHCP、cookie、資料庫及封包圖不向外發出請求或設定真 cookie；TCP 使用簡化時序，單工作佇列不代表所有伺服器都逐個處理。無線覆蓋、路由及漫遊須配合真實裝設驗證。 |
| 密碼學及證書 | 加密、短摘要及簽章符號只解釋角色，不能保護實際資料。證書檢查只包含明示項目，不涵蓋完整撤銷、鏈建構與實作安全。簽署不自動隱藏原文。 |
| 程式及工具 | 記憶體、排序、檔案及參數模型只執行所示子集，並非任意程式解譯器。Python 轉換器的規則與 Pyodide 實際執行是不同功能；課文中的型別、字串及檔案格式界線須保留。 |
| AI、3D、AR／VR 及感測 | 分類器只學單一門檻；打印以格子／層代表路徑；AR／VR 是視野與配準示意；感測及雲端模型不接真實硬件。 |
| 社會、授權、SBA 及可用性 | 授權模型採簡化條件，完整條款及例外須按來源閱讀；主觀社會議題不壓成單一分數。介面及人體工學預覽、需求證據鏈不代表完成使用者研究、輔助科技稽核或個人 SBA 證據。 |

原生表單控制、可見焦點、文字說明與減少動態效果設定支援操作；手機、不同瀏覽器及實際互動的完成範圍以 [最新驗證記錄](docs/PAGE_REVIEW.md#驗證與證據) 為準。Node 運算／DOM 測試與瀏覽器版面檢查分開記錄，兩者都不取代教師覆核與學生實作。

## 現行 88 個註冊元件

以下清單直接核對四個現行註冊檔。實際安放章節及保留／刪併理由見 [逐頁索引](docs/PAGE_REVIEW.md)。

### 資訊處理、系統與數據庫（22）

| 元件 | ID |
|---|---|
| 二補碼：逐位反轉、進位與有號溢出 | `twos-complement-workbench` |
| 進位制：每個數碼如何貢獻數值 | `radix-place-machine` |
| 數據變資訊：用真實紀錄完成分組統計 | `data-information-pipeline` |
| 數據檢查：合理的輸入也可能抄錯 | `validation-verification-gates` |
| 奇偶檢查：翻動傳輸中的實際位元 | `parity-transmission` |
| 儲存存取：磁帶讀頭與直接定址 | `storage-access-head` |
| 試算表：搬動公式，追蹤參照與鎖定 | `spreadsheet-reference-copy` |
| 數據庫：逐列執行 WHERE，再投影與排序 | `database-query-execution` |
| 輸入到輸出：感應器、ADC 與控制訊號 | `input-adc-controller` |
| CPU：資料沿暫存器與匯流排移動 | `cpu-register-bus` |
| 作業系統：CPU 時間如何分給工作 | `os-job-scheduler` |
| 圖像：像素內的 RGB 位元與檔案大小 | `image-rgb-bitdepth` |
| 聲音：取樣位置與量化級別分開觀察 | `audio-sampling-quantization` |
| 由資料庫一路放大至位元 | `data-hierarchy-explorer` |
| 地址、字長與斷電後的內容 | `memory-address-power` |
| 打印要求如何經過操作系統與驅動程式 | `os-print-service` |
| 無損壓縮：把連續相同值編成次數 | `lossless-run-length` |
| 多對多：每條關係成為一筆選科記錄 | `entity-relationship-bridge` |
| 子查詢：先算一個平均值，再逐列比較 | `sql-scalar-subquery` |
| INSERT、UPDATE、DELETE：先預覽哪些列受影響 | `sql-row-mutation` |
| 3NF：沿非鍵欄位找出傳遞依賴 | `transitive-dependency` |
| 從實物辨認硬件部件 | `hardware-component-map` |

### 網絡、網頁與保安（22）

| 元件 | ID |
|---|---|
| 客戶端與伺服器：封包真的走到哪裡？ | `network-request-topology` |
| TCP：序號、確認及逾時重傳 | `dns-tcp-packets` |
| 串流緩衝槽：網速下降多久才停頓？ | `stream-buffer-tank` |
| HTML 如何長成 DOM 樹及網頁？ | `html-dom-tree` |
| 封包過了防火牆，就能改成績嗎？ | `security-firewall-gates` |
| 加密與數碼簽署：鑰匙的方向不同 | `crypto-signature-workbench` |
| GET 和 POST：資料放進哪一部分？ | `http-wire-inspector` |
| DHCP 租約：未有 IP 如何先開口？ | `dhcp-lease-and-sharing` |
| CSS 級聯：同一段文字，哪條規則勝出？ | `css-cascade-live` |
| 網頁應用程式：從表單到資料庫再回來 | `webapp-request-lifecycle` |
| 同一 LAN，還是經閘道跨網絡？ | `lan-switch-router` |
| IPv4：四組十進數怎樣佔 32 個位元？ | `ip-address-bits` |
| 平板移動：覆蓋、干擾與 AP 轉接 | `wifi-roaming-floor` |
| DNS：快取未命中與 TTL 到期 | `dns-cache-resolution` |
| 網址拆解：哪部分會送給伺服器？ | `url-component-inspector` |
| 上載後圖片 404：跟著相對路徑找檔案 | `publish-resource-paths` |
| 病毒與蠕蟲：傳播觸發點不同 | `malware-spread-map` |
| 數碼證書：公匙屬誰，為何可信？ | `certificate-trust-check` |
| 共享權限 × 檔案權限：兩關都要允許 | `sharing-permission-matrix` |
| Cookie 在瀏覽器，會話在伺服器 | `cookie-session-store` |
| 搜尋條件收窄的是結果，不是可信程度 | `search-evidence-filter` |
| IoT 數據送上雲端後，誰作決定？ | `cloud-sensor-pipeline` |

### 運算思維、程式與 Python 工具（30）

| 元件 | ID |
|---|---|
| 沿着流程圖作決定 | `decision-flow` |
| 程式行與變數記憶體 | `python-registers` |
| 搜尋器走過陣列 | `array-search` |
| 用邊界測試找出差一錯誤 | `boundary-line` |
| 銀行轉帳的提交與回滾 | `atomic-transfer` |
| 資料列怎樣 JOIN 和 GROUP BY | `join-and-group` |
| 由更新異常到主鍵、外鍵 | `key-decomposition` |
| 雙重迴圈逐格走訪 | `nested-grid` |
| 呼叫框架、局部狀態與回傳 | `recursive-frames` |
| 堆疊與循環隊列的儲存格 | `stack-queue-slots` |
| 排序時資料怎樣移動 | `sorting-bars` |
| 順序檔案更新輸送帶 | `sequential-file` |
| 保留位數、截斷和進位 | `decimal-precision` |
| 規格如何約束輸入、計算與顯示 | `spec-contract` |
| NOT、AND、OR 如何組合條件 | `boolean-wires` |
| 哨兵值與下一次輸入 | `sentinel-reader` |
| 插入與刪除時搬移哪些元素 | `array-shifting` |
| 文字輸入、型別轉換與運算 | `python-input-types` |
| 同一批資料的累積與平均 | `list-statistics` |
| 只累計符合相同條件的分數 | `filtered-statistics` |
| 全負數初值與相鄰次序檢查 | `extrema-order` |
| 在條件處停下來比較預期與實際 | `count-breakpoint` |
| 字串長度、索引與切片 | `string-positions` |
| 兩個有序列表如何合併 | `merge-pointers` |
| 參數、局部框架與共同列表物件 | `parameter-bindings` |
| 鏈表的物理位置與邏輯次序 | `linked-array` |
| r、w、a 在開啟時已經不同 | `file-open-modes` |
| 第一個真分支與商、餘數 | `grade-and-modulus` |
| 先計算右方，再寫回左方 | `assignment-writeback` |
| 正規化搜尋詞，再逐項比較 | `normalized-string-search` |

### 社會影響、SBA 與網站服務（14）

| 元件 | ID |
|---|---|
| 把問題拆成可測試的規格 | `problem-workbench` |
| 訓練一條分類界線 | `classifier-training` |
| 三維打印：讓噴頭逐格、逐層建造 | `layer-printer` |
| 無障礙介面：直接改變閱讀與操作條件 | `accessibility-lens` |
| 數碼作品：沿許可條款檢查使用方式 | `license-routing` |
| 感測器事件如何令設備動作 | `sensor-greenhouse` |
| 從需求到測試：在時間軸找出預約衝突 | `booking-testbench` |
| 從觀看者角度分辨 AR 與 VR | `ar-vr-view` |
| 工作站：調整位置，觀察改變了甚麼 | `ergonomic-adjustment` |
| 數碼鴻溝：逐一移除參與障礙 | `access-barriers` |
| 分享之後：刪除原帖能收回所有副本嗎？ | `sharing-data-trail` |
| 可見水印：標記存在，複製仍可發生 | `watermark-copy` |
| 需求、設計與測試如何連成證據 | `evidence-chain` |
| 版本與重測：保存修正前後的證據 | `revision-diff` |

## 歷史版本

2026-10-16 早期版本共有 43 個模型；2026-10-15 的 129 組文字講解及 4 個可調模型為更早階段。現行版本已逐節去重及重排，舊數字與下列舊驗證狀態不作目前完成證據。

<details>
<summary>2026-10-16 早期設計與驗證原文（歷史）</summary>

# 課題專用動畫（2026-10-16）

本次以43個可操作的概念模型回應「按課題內容設計」的要求。二補碼的畫面是位元、負權值與進位，網絡的畫面是設備、線路與移動封包，SQL的畫面是資料列與關聯配對。共用的標題、輸入與播放控制只負責操作一致性，各模型分別實作自身的概念機制。

模型已接入30個主站課頁／工具、獨立目錄42課及3個工具。舊有129組文字步驟保留作補充說明，新模型是課頁主要示範；原本的題庫、進度及學校功能繼續使用現行介面。

## 直接例子

- [二補碼](cha.3.html#sim-twos-complement-workbench)：改整數、位元數與加減法；逐位反轉及進位；比較7+1的有號溢出與−1+1的無號進位；亦可點位元按負權值解碼。
- [客戶端／伺服器](chc.1.html#sim-network-request-topology)：三部客戶端可同時加入請求；封包經交換器送往伺服器並沿路回傳；切換伺服器故障與P2P觀察不同結果。
- [TCP／DNS](chc.2.html#sim-dns-tcp-packets)：名稱解析、握手、序號、ACK、遺失與逾時重傳。
- [搜尋與排序](ec.1.html#sim-sorting-bars)：修改陣列，觀察指標、比較與元素位置；呼叫堆疊、隊列及檔案寫入亦各有模型。

## 驗證

本次已執行模型結果、互動掛載、單步、重設與清理測試，以及全部12個平台檢查和4個先前教材行為／結構檢查。`topic-coverage.cjs` 實際執行75個路徑的掛載程序，檢查標籤、資源次序、內容插入、錨點及離頁清理；它不把瀏覽器排版當作已驗證。

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

新增的主要邊界測試包括：全部4／8位元補碼加減法組合、−128、進位與溢出分離；奇偶檢查漏檢偶數位錯誤；NULL分數排除；交易失敗回復與總額守恆；JOIN孤立列；90組含重複／負數排序及每步元素守恆；循環隊列回繞；十進制1.005的精確四捨五入；預約相接時段12–14的邊界；設備輸出保持到新事件處理完成。

瀏覽器自動化服務本次啟動時持續回報 `failed to write kernel assets`，故未能完成新增模型的瀏覽器畫面及手機實測。CSS包含窄畫面重排、圖表內部捲動、鍵盤焦點及減少動態設定；這些規則與程式測試不能代替實機視覺檢查。先前2026-10-15的瀏覽器記錄只適用於先前版本。

## 教學模型的界線

- 網絡模型不發出真實網絡請求；封包符號可代表完整回應，TCP使用簡化時序，伺服器以單工作佇列解釋排隊，並非描述所有並行實作。
- 密碼學使用明確標示的教學轉換／摘要，不適合保護實際資料；簽署與加密的角色分開呈現。
- CPU只計算示例的資料快取，略去指令快取、管線與真實時脈；儲存定址不代表零延遲。
- 分類器只學單一門檻，不能代表一般AI模型；三維打印以格子／層代表材料路徑；感測器不連接真實硬件。
- 許可條款是簡化決策練習，未涵蓋所有授權細節或法定例外；無障礙預覽仍須配合實際使用者、螢幕閱讀器和鍵盤測試。
- 動畫輔助理解；網絡配置、軟件操作、編程及SBA仍需實作與教師回饋。

## 模型清單

| 模型 | 掛載標籤 |
| --- | --- |
| 二補碼：逐位反轉、進位與有號溢出 | twos |
| 進位制：每個數碼如何貢獻數值 | binary-place |
| 數據變資訊：用真實紀錄完成分組統計 | information |
| 數據檢查：合理的輸入也可能抄錯 | validation |
| 奇偶檢查：翻動傳輸中的實際位元 | parity |
| 儲存存取：磁帶讀頭與直接定址 | access |
| 試算表：搬動公式，追蹤參照與鎖定 | spreadsheet |
| 數據庫：逐列執行 WHERE，再投影與排序 | databasequery |
| 輸入到輸出：感應器、ADC 與控制訊號 | hardwareinput |
| CPU：資料沿暫存器與匯流排移動 | cpu-memory |
| 作業系統：CPU 時間如何分給工作 | os-scheduler |
| 圖像：像素內的 RGB 位元與檔案大小 | media |
| 聲音：取樣位置與量化級別分開觀察 | media |
| 客戶端與伺服器：封包真的走到哪裡？ | client-server |
| 由域名到可靠傳送：DNS、序號與 ACK | tcp-dns |
| 串流緩衝槽：網速下降多久才停頓？ | streaming |
| HTML 如何長成 DOM 樹及網頁？ | web-dom |
| 封包過了防火牆，就能改成績嗎？ | security-flow |
| 加密與數碼簽署：鑰匙的方向不同 | crypto-pki |
| GET 和 POST：資料放進哪一部分？ | http-request |
| DHCP 租約：未有 IP 如何先開口？ | dhcp-permissions |
| CSS 級聯：同一段文字，哪條規則勝出？ | css-cascade |
| 網頁應用程式：從表單到資料庫再回來 | webapp |
| 沿着流程圖作決定 | flowchart |
| 程式行與變數記憶體 | trace-machine、python-memory |
| 搜尋器走過陣列 | linearsearch |
| 用邊界測試找出差一錯誤 | boundary-debugger |
| 銀行轉帳的提交與回滾 | transaction |
| 資料列怎樣 JOIN 和 GROUP BY | sql-group、join |
| 由更新異常到主鍵、外鍵 | keys-index、normalization |
| 雙重迴圈逐格走訪 | nestedloops |
| 遞歸呼叫堆疊 | callstack |
| 堆疊與循環隊列的儲存格 | datastruct |
| 排序時資料怎樣移動 | sorting |
| 順序檔案更新輸送帶 | filewrite |
| 保留位數、截斷和進位 | numericprecision |
| 把問題拆成可測試的規格 | problem-decompose |
| 訓練一條分類界線 | ai-classifier |
| 三維打印：讓噴頭逐格、逐層建造 | 3dprinter |
| 無障礙介面：直接改變閱讀與操作條件 | accessibility |
| 數碼作品：沿許可條款檢查使用方式 | license-flow |
| 感測器事件如何令設備動作 | sensor |
| 從需求到測試：在時間軸找出預約衝突 | testcycle |

</details>
