/**
 * 各課程／工具的共用學習提示。
 *
 * 這些資料只負責「如何學習本頁」：目標、概念關係、常見誤解及快速檢查。
 * 詳細教學內容仍保留在各 HTML 頁面，題型練習則由 question_data.js 管理。
 */
const learningData = {
    schemaVersion: 1,
    pages: {
        "cha-1": {
            objectives: [
                "分辨原始數據與經處理後的資訊",
                "辨認資訊系統的輸入、處理、輸出及儲存",
                "從生活例子分析資訊科技帶來的影響"
            ],
            concepts: [
                { icon: "⌨️", label: "輸入", detail: "收集原始數據，例如掃描條碼、填寫表格或感應溫度。" },
                { icon: "⚙️", label: "處理", detail: "按規則計算、分類、比較或整理數據，使其產生意義。" },
                { icon: "📊", label: "輸出", detail: "以屏幕、報告、聲音或其他形式呈現處理結果。" },
                { icon: "💾", label: "儲存", detail: "保留數據及資訊，供日後檢索、更新或再次處理。" }
            ],
            misconceptions: [
                { claim: "所有數據都是資訊。", correction: "數據要經處理、整理並能在特定情境中產生意義，才可視為資訊。" },
                { claim: "資訊系統只包括電腦硬件。", correction: "完整資訊系統還包括軟件、數據、程序及使用者。" }
            ],
            quickCheck: {
                question: "收銀系統把交易記錄整理成每週銷售報告，『每週銷售報告』屬於哪一項？",
                options: ["輸入裝置", "原始數據", "資訊", "數據驗證"],
                answerIndex: 2,
                explanation: "報告是交易數據經整理後得到、可支援決策的資訊。"
            },
            examTip: "題目要求辨認資訊時，應說明數據經過甚麼處理，以及結果如何支援某個目的。"
        },
        "cha-2": {
            objectives: [
                "說明欄、記錄、檔案及數據庫的層級關係",
                "分辨有效性檢驗、驗證及錯誤檢測",
                "為指定輸入選擇合適的檢查方法"
            ],
            concepts: [
                { icon: "🔤", label: "字符", detail: "數據表示的基本符號，例如字母、數字或標點。" },
                { icon: "🏷️", label: "欄", detail: "描述一項屬性，例如姓名、出生日期或班別。" },
                { icon: "🧾", label: "記錄", detail: "一組互相關聯的欄，描述一個人、物件或事件。" },
                { icon: "🗂️", label: "檔案／數據庫", detail: "有組織地保存多筆記錄，方便檢索、更新及分析。" }
            ],
            misconceptions: [
                { claim: "通過有效性檢驗的資料一定正確。", correction: "檢驗只證明輸入符合規則；一個合理的年齡仍可能與原始資料不符。" },
                { claim: "校驗位屬於數據驗證。", correction: "校驗位用於偵測傳輸或儲存錯誤，並非把輸入與原始文件比較。" }
            ],
            quickCheck: {
                question: "把輸入的身份證號碼與申請表原件逐字比較，屬於甚麼？",
                options: ["範圍檢查", "數據驗證", "格式檢查", "校驗位檢查"],
                answerIndex: 1,
                explanation: "與原始文件比較輸入是否準確，屬於數據驗證（verification）。"
            },
            examTip: "回答檢查方法時，要同時寫出方法名稱、檢查規則及適用的欄位。"
        },
        "cha-3": {
            objectives: [
                "在二、十及十六進制之間轉換整數",
                "解釋文字、圖像、聲音及視像如何數碼化",
                "利用位元數、解像度及取樣參數估算檔案大小"
            ],
            concepts: [
                { icon: "01", label: "位元模式", detail: "電腦以 0 和 1 表示數值、字符及其他數碼資料。" },
                { icon: "🔡", label: "字符編碼", detail: "編碼標準把字符對應至碼位；UTF-8 再以不同位元組序列儲存 Unicode 字符。" },
                { icon: "🟪", label: "圖像", detail: "點陣圖由像素組成；解像度及色彩深度共同影響未壓縮大小。" },
                { icon: "〰️", label: "聲音", detail: "取樣頻率、取樣解像度、聲道數及時間共同影響未壓縮大小。" }
            ],
            misconceptions: [
                { claim: "Unicode 和 UTF-8 是完全相同的東西。", correction: "Unicode 定義字符及碼位；UTF-8 是把 Unicode 碼位編碼成位元組的其中一種方式。" },
                { claim: "放大點陣圖會自動增加細節。", correction: "單純放大只會放大原有像素，並不會產生原本不存在的影像資料。" }
            ],
            quickCheck: {
                question: "一幅未壓縮點陣圖增加色彩深度，但寬度和高度不變，檔案大小通常會怎樣？",
                options: ["減少", "增加", "保持不變", "必定變成零"],
                answerIndex: 1,
                explanation: "每個像素需要更多位元表示顏色，所以未壓縮檔案大小會增加。"
            },
            examTip: "計算檔案大小時先寫公式和單位，再決定答案要用 bit、byte、KB 或 MB。"
        },
        "cha-4": {
            objectives: [
                "正確輸入公式並使用常見試算表函數",
                "預測相對、絕對及混合參照複製後的變化",
                "選擇合適工具整理、分析及演示數據"
            ],
            concepts: [
                { icon: "🧮", label: "公式", detail: "以等號開始，利用運算子、常數及儲存格參照進行計算。" },
                { icon: "ƒ", label: "函數", detail: "預先定義的運算，例如 SUM、AVERAGE、MAX、MIN 及 COUNT。" },
                { icon: "$", label: "參照", detail: "相對參照會隨複製改變；美元符號可鎖定欄或列。" },
                { icon: "📈", label: "分析與演示", detail: "排序、篩選、情境分析及圖表分別支援不同的分析目的。" }
            ],
            misconceptions: [
                { claim: "公式和函數是同一個概念。", correction: "公式是完整的計算表達式；函數是可以放進公式內使用的預設運算。" },
                { claim: "所有圖表都適合比較同一組資料。", correction: "柱形圖適合分類比較、折線圖適合趨勢、圓形圖適合顯示整體中的比例。" }
            ],
            quickCheck: {
                question: "把公式 =B2*$F$1 向下複製一列，哪個部分保持不變？",
                options: ["B2", "$F$1", "兩者都改變", "兩者都不變"],
                answerIndex: 1,
                explanation: "$F$1 的欄和列均被鎖定；B2 則會變成 B3。"
            },
            examTip: "解釋參照變化時，應逐一指出欄和列是否被鎖定，而不是只寫『絕對參照不變』。"
        },
        "cha-5": {
            objectives: [
                "辨認數據表、欄、記錄及不同數據庫物件",
                "解釋主關鍵碼與外關鍵碼的用途",
                "追蹤及解釋簡單單一數據表 SQL 查詢"
            ],
            concepts: [
                { icon: "▦", label: "數據表", detail: "以欄定義屬性、以記錄保存每個實體的資料。" },
                { icon: "🔑", label: "主關鍵碼", detail: "以唯一而且非空的值辨認每筆記錄。" },
                { icon: "🔗", label: "外關鍵碼", detail: "引用另一數據表的主關鍵碼，建立數據表之間的關係。" },
                { icon: "🔎", label: "查詢", detail: "按指定欄、來源、條件及排序方式擷取所需資料。" }
            ],
            misconceptions: [
                { claim: "主關鍵碼只可使用自動編號。", correction: "任何能穩定、唯一而且不為空的合適欄位，都可能成為主關鍵碼。" },
                { claim: "表單和數據表會保存兩份不同資料。", correction: "表單通常只是輸入或顯示數據表資料的介面，並非另一份獨立記錄。" }
            ],
            quickCheck: {
                question: "哪項最能解釋數據表需要主關鍵碼的原因？",
                options: ["令所有欄位變成文字", "唯一識別每筆記錄", "自動產生所有報告", "防止使用查詢"],
                answerIndex: 1,
                explanation: "主關鍵碼的核心作用是唯一識別每筆記錄。"
            },
            examTip: "必修部分集中追蹤和解釋簡單單表查詢；多表 JOIN 等較深入 SQL 屬選修範圍。"
        },
        "chc-1": {
            objectives: [
                "按覆蓋範圍比較 LAN 與 WAN",
                "解釋數據機、NIC、通訊鏈路、交換器、路由器及無線接達點的功能",
                "按速度、成本、安全性及可用性比較通訊及互聯網連接方法"
            ],
            concepts: [
                { icon: "💻", label: "NIC 與鏈路", detail: "NIC 提供網絡介面；UTP、光纖或無線鏈路負責承載訊號。" },
                { icon: "🔀", label: "交換器", detail: "連接同一 LAN 內多部有線裝置，並把訊框轉送至合適連接埠。" },
                { icon: "📡", label: "接達點", detail: "利用無線電訊號，讓 Wi-Fi 裝置接入有線 LAN。" },
                { icon: "🌐", label: "路由器", detail: "連接不同網絡，並按目的地 IP 位址轉送封包。" }
            ],
            misconceptions: [
                { claim: "交換器和路由器的功能完全相同。", correction: "交換器主要連接同一 LAN 內的裝置；路由器則連接不同網絡。" },
                { claim: "家用 Wi-Fi 路由器的外觀代表路由器、交換器和 AP 是同一種裝置。", correction: "家用產品可整合多項功能；考試仍要按題目指定的個別網絡功能作答。" }
            ],
            quickCheck: {
                question: "學校要把校內 LAN 連接到互聯網，主要需要哪種設備？",
                options: ["路由器", "掃描器", "顯示器", "鍵盤"],
                answerIndex: 0,
                explanation: "路由器負責在校內 LAN 與外部網絡之間轉送封包。"
            },
            examTip: "回答硬件功能時，寫清楚它連接甚麼、如何處理數據或訊號，以及為何符合題目情境。"
        },
        "chc-2": {
            objectives: [
                "描述 TCP 與 IP 在數據傳輸中的不同角色",
                "解釋 IP 位址、網域名稱、DNS 及 URL 的關係",
                "按服務用途配對常見互聯網協定"
            ],
            concepts: [
                { icon: "🧩", label: "TCP", detail: "把資料分段、標上序號，並在接收端檢查和重組。" },
                { icon: "📍", label: "IP", detail: "使用來源及目的地 IP 位址協助封包在網絡間傳送。" },
                { icon: "📖", label: "DNS", detail: "把易讀的網域名稱解析成連線所需的 IP 位址。" },
                { icon: "🔒", label: "HTTPS", detail: "透過 TLS 保護傳輸，並可驗證伺服器身分；不保證網頁內容一定真確。" }
            ],
            misconceptions: [
                { claim: "DNS 負責把整個網頁傳送到瀏覽器。", correction: "DNS 主要進行名稱解析；網頁內容由 HTTP／HTTPS 等協定傳送。" },
                { claim: "IPv6 位址數量是無限的。", correction: "IPv6 提供 2^128 個組合，數量極大但仍然有限。" }
            ],
            quickCheck: {
                question: "使用者輸入網域名稱後，DNS 首先協助取得甚麼？",
                options: ["打印密碼", "相應 IP 位址", "電腦序號", "檔案壓縮率"],
                answerIndex: 1,
                explanation: "DNS 把網域名稱解析成相應 IP 位址，讓裝置尋找目標伺服器。"
            },
            examTip: "回答協定題時，要寫清楚協定處理的對象及功能，例如 DNS 是『網域名稱 → IP 位址』。"
        },
        "tool-dse-practice": {
            objectives: ["按課題和難度選擇題目", "提交後逐點閱讀評分準則", "把錯誤連回相關課程及互動工具"],
            concepts: [
                { icon: "✍️", label: "先作答", detail: "先獨立完成答案，避免直接抄寫參考答案。" },
                { icon: "✅", label: "按點檢查", detail: "把答案逐項對照評分準則，而不只看總分。" },
                { icon: "🔁", label: "修正重試", detail: "找出遺漏概念後返回課程頁，再用另一題檢查理解。" }
            ],
            misconceptions: [{ claim: "自動評分等同正式公開考試評分。", correction: "短答自動評分只提供學習提示；完整答案仍須按語意及正式評分要求判斷。" }],
            quickCheck: {
                question: "短答題取得部分分數後，最合適的下一步是甚麼？",
                options: ["只記住分數", "逐點比較評分準則和參考答案", "立即關閉頁面", "把題目視為無效"],
                answerIndex: 1,
                explanation: "逐點檢查能找出答題中遺漏的概念或關鍵字。"
            },
            examTip: "先回答題目使用的動詞：『指出』通常較短；『解釋』則要交代原因或關係。"
        },
        "tool-sql-simulator": {
            objectives: ["執行查詢並閱讀結果表", "把 SELECT、FROM、WHERE 等子句連回用途", "利用錯誤訊息修正語法"],
            concepts: [
                { icon: "SELECT", label: "選擇欄", detail: "SELECT 決定結果要顯示哪些欄位。" },
                { icon: "FROM", label: "指定來源", detail: "FROM 指出查詢使用的數據表。" },
                { icon: "WHERE", label: "篩選記錄", detail: "WHERE 只保留符合條件的記錄。" },
                { icon: "ORDER", label: "排列結果", detail: "ORDER BY 按指定欄位以升序或降序排列輸出。" }
            ],
            misconceptions: [{ claim: "SQL 執行成功就代表查詢一定符合題目要求。", correction: "語法正確只代表可以執行；仍須核對輸出欄、條件和結果是否符合要求。" }],
            quickCheck: {
                question: "在 SELECT 查詢中，哪個子句用來篩選符合條件的記錄？",
                options: ["WHERE", "FROM", "SELECT", "CREATE"],
                answerIndex: 0,
                explanation: "WHERE 後面寫篩選條件；SELECT 決定輸出欄，FROM 指定來源表。"
            },
            examTip: "先以自然語言圈出『顯示甚麼、來自哪個表、符合甚麼條件、如何排序』，再逐段寫 SQL。"
        },
        "tool-python-converter": {
            objectives: ["在流程圖、偽代碼與 Python 之間對照算法", "逐步追蹤變數及控制流程", "以測試數據檢查邊界和分支"],
            concepts: [
                { icon: "→", label: "順序", detail: "指令按既定次序逐步執行。" },
                { icon: "◇", label: "選擇", detail: "if／else 按條件結果選擇其中一條路徑。" },
                { icon: "↻", label: "迭代", detail: "for 或 while 重複一組步驟，直至次數完成或條件改變。" },
                { icon: "▱", label: "輸入輸出", detail: "輸入提供算法所需數據，輸出呈現處理結果。" }
            ],
            misconceptions: [{ claim: "只要程式沒有語法錯誤，算法就一定正確。", correction: "程式仍可能有邏輯錯誤；必須用正常、邊界及異常數據測試。" }],
            quickCheck: {
                question: "range(1, 4) 會依次產生哪些整數？",
                options: ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "只產生 4"],
                answerIndex: 0,
                explanation: "Python 的 range 不包括終止值，所以 4 不會出現在序列中。"
            },
            examTip: "追蹤程式時建立變數表，每執行一行才更新一次數值，並記錄條件結果。"
        },
        "tool-pki-lab": {
            objectives: ["分辨傳輸加密與數碼簽署的目的", "正確配對公開及私人密碼匙", "說明保密性、完整性及來源驗證的分別"],
            concepts: [
                { icon: "🔐", label: "傳輸加密", detail: "寄件者以收件者的公開密碼匙加密，只有收件者的私人密碼匙能解密。" },
                { icon: "#", label: "摘要", detail: "實際數碼簽署通常先為文件計算雜湊摘要。" },
                { icon: "✍️", label: "簽署", detail: "簽署者以自己的私人密碼匙處理摘要，產生數碼簽署。" },
                { icon: "✅", label: "驗證", detail: "接收者以簽署者的公開密碼匙檢查來源及文件完整性。" }
            ],
            misconceptions: [
                { claim: "數碼簽署會自動把文件內容保密。", correction: "簽署主要保障來源及完整性；如要保密，仍須另外加密內容。" },
                { claim: "公開密碼匙必須保密。", correction: "公開密碼匙可以公開取得；需要嚴格保護的是私人密碼匙。" }
            ],
            quickCheck: {
                question: "Bob 要驗證 Alice 的數碼簽署，應使用哪條密碼匙？",
                options: ["Bob 的私人密碼匙", "Bob 的公開密碼匙", "Alice 的私人密碼匙", "Alice 的公開密碼匙"],
                answerIndex: 3,
                explanation: "Alice 用自己的私人密碼匙簽署；其他人以 Alice 的公開密碼匙驗證。"
            },
            examTip: "先判斷題目要求保密、簽署還是驗證，再寫清楚密碼匙的擁有者和公開／私人種類。"
        }
    }
};

function freezeLearningData(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freezeLearningData);
    return Object.freeze(value);
}

window.HKDSE_ICT_LEARNING = freezeLearningData(learningData);
