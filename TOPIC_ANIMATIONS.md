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
