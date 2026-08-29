/**
 * 各課程／工具的共用學習提示。
 *
 * 這些資料只負責「如何學習本頁」：目標、概念關係、常見誤解及快速檢查。
 * 詳細教學內容仍保留在各 HTML 頁面，題型練習則由 question_data.js 管理。
 */
const learningData = {
    schemaVersion: 3,
    pages: {
        "cha-1": {
            objectives: [
                "分辨原始數據與經處理後的資訊",
                "辨認資訊系統的輸入、處理、輸出及儲存",
                "從生活例子分析資訊科技帶來的影響"
            ],
            scopeNote: "本課集中資訊系統、數據與資訊、資訊處理及資訊時代影響；字符和多媒體的編碼及檔案大小會在 A(c) 深入處理。",
            featuredQuestionId: "q-a-a-002",
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
            scopeNote: "必修重點包括數據分級、有效性檢驗、驗證、錯誤檢測、數據庫功能，以及順序與直接檔案存取。",
            featuredQuestionId: "q-a-b-002",
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
            scopeNote: "計算題須分清 bit 和 byte；壓縮率、檔案格式或編碼標準的答案亦要按題目給定資料作判斷。",
            featuredQuestionId: "q-a-c-003",
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
            scopeNote: "試算表題通常把公式、函數、參照、排序／篩選及圖表放在同一工作表情境中，需留意公式複製方向。",
            featuredQuestionId: "q-a-d-sheet-003",
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
            scopeNote: "必修部分集中基本數據庫結構、關鍵碼、數據庫物件及簡單單表 SQL；多表 JOIN 和較深入設計屬選修延伸。",
            featuredQuestionId: "q-a-d-db-002",
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
        "chb-1": {
            objectives: [
                "說明輸入、輸出、處理、匯流排及儲存硬件如何合作",
                "追蹤擷取—解碼—執行周期中 CPU 部件、暫存器和匯流排的角色",
                "按容量、速度、存取方式及揮發性選擇合適記憶體或儲存裝置"
            ],
            scopeNote: "本課依 B(a) 涵蓋 CPU／GPU、CPU 結構、機器周期、RAM／ROM／快取、輸入輸出及儲存裝置；個別裝置的內部工程細節毋須掌握。",
            featuredQuestionId: "q-b-a-cycle-001",
            concepts: [
                { icon: "⌨", label: "輸入／輸出", detail: "輸入裝置收集數據；輸出裝置把處理結果轉化成使用者可理解的形式。" },
                { icon: "CPU", label: "處理單元", detail: "CPU 執行一般指令；GPU 擅長大量可並行的圖像及矩陣運算。" },
                { icon: "⇄", label: "匯流排", detail: "地址、數據及控制匯流排在 CPU、記憶體與裝置之間傳送位置、內容及控制訊號。" },
                { icon: "▤", label: "記憶／儲存", detail: "快取和 RAM 供處理器快速使用；非揮發性儲存裝置則長期保存程式與數據。" }
            ],
            misconceptions: [
                { claim: "CPU 頻率較高，任何情況下一定較快。", correction: "整體效能亦受核心數目、架構、快取、記憶體及工作類型等因素影響。" },
                { claim: "RAM 和 SSD 都是永久儲存裝置。", correction: "一般 RAM 是揮發性主記憶體；SSD 是非揮發性次級儲存裝置。" }
            ],
            quickCheck: {
                question: "在機器周期中，哪個 CPU 部件負責解釋目前指令並發出控制訊號？",
                options: ["算術邏輯單元", "控制單元", "輸出單元", "固態硬碟"],
                answerIndex: 1,
                explanation: "控制單元解碼指令並協調其他部件；ALU 則主要進行算術和邏輯運算。"
            },
            examTip: "硬件選擇題要先指出裝置，再用題目需要的同一準則解釋，例如速度、容量、流動性或輸入數據類型。"
        },
        "chb-2": {
            objectives: [
                "解釋硬件、系統軟件、應用軟件和使用者之間的關係",
                "說明操作系統、實用程式及驅動程式的主要功能",
                "按情境分辨批次、實時、並行、分布式處理及虛擬化"
            ],
            scopeNote: "本課依 B(b) 集中系統與應用軟件、操作系統、實用／驅動程式，以及五種操作模式；不要求實用程式的技術實作細節。",
            featuredQuestionId: "q-b-b-mode-002",
            concepts: [
                { icon: "OS", label: "操作系統", detail: "管理處理器、記憶體、檔案及裝置等資源，並為應用程式和使用者提供介面。" },
                { icon: "🧰", label: "實用程式", detail: "執行壓縮、防毒、檔案管理、重組及系統監察等維護工作。" },
                { icon: "↔", label: "驅動程式", detail: "把操作系統的通用要求轉化成指定硬件可理解的控制方式。" },
                { icon: "⏱", label: "操作模式", detail: "按回應時限、工作分組及運算資源分配選擇合適的處理方式。" }
            ],
            misconceptions: [
                { claim: "實時處理就是運算速度非常快。", correction: "關鍵是系統必須在規定時限內回應事件；純粹『較快』不足以證明屬實時處理。" },
                { claim: "驅動程式是用來建立文件的應用軟件。", correction: "驅動程式屬系統軟件，讓操作系統控制特定硬件。" }
            ],
            quickCheck: {
                question: "防毒軟件在檔案開啟前立即檢查並封鎖病毒，最符合哪種操作模式？",
                options: ["批次處理", "實時處理", "分布式處理", "虛擬化"],
                answerIndex: 1,
                explanation: "系統在檔案執行前必須即時回應偵測事件，符合實時處理；排程一次掃描多個檔案才較接近批次處理。"
            },
            examTip: "判斷操作模式時要引用情境字眼，例如『累積後一次處理』或『事件發生後必須立即回應』，不要只寫模式名稱。"
        },
        "chc-1": {
            objectives: [
                "按覆蓋範圍比較 LAN 與 WAN",
                "解釋數據機、NIC、通訊鏈路、交換器、路由器及無線接達點的功能",
                "按速度、成本、安全性及可用性比較通訊及互聯網連接方法"
            ],
            scopeNote: "本頁依核心 C(a) 處理 LAN／WAN、網絡服務、硬件、通訊鏈路及無線概念；詳細網絡設計屬選修延伸。",
            embeddedExamPractice: true,
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
            scopeNote: "本課集中 TCP／IP、IPv4／IPv6、網域名稱、DNS、URL 及常見互聯網協定之間的功能關係。",
            featuredQuestionId: "q-c-a-url-001",
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
        "chc-3": {
            objectives: [
                "制定有效搜尋策略並按權威、時效、證據及目的評估來源",
                "按網頁用途選擇合適圖像、聲音及視像格式",
                "解釋電郵、檔案傳送、遠端登入、網上討論及串流的特點和應用"
            ],
            scopeNote: "本課依 C(b) 涵蓋網上搜尋與來源分析、網頁多媒體格式、常見互聯網服務、串流，以及 IoT／雲端服務的社會應用；串流技術細節毋須掌握。",
            featuredQuestionId: "q-c-b-search-002",
            concepts: [
                { icon: "⌕", label: "搜尋策略", detail: "以具體關鍵字、詞組和篩選條件逐步收窄結果，再按需要修訂查詢。" },
                { icon: "✓", label: "來源評估", detail: "檢查作者／機構、發布日期、證據、交叉印證及內容目的，而不只看搜尋排名。" },
                { icon: "▶", label: "串流", detail: "媒體數據一邊傳送一邊播放；緩衝可應付短暫速度波動，但網絡過慢仍會停頓。" },
                { icon: "☁", label: "網上應用", detail: "電郵、遠端登入、雲端服務和 IoT 以不同方式支援通訊、共享與遙距控制。" }
            ],
            misconceptions: [
                { claim: "搜尋結果排第一代表內容一定最可信。", correction: "排名可能受相關性、廣告或優化影響；仍須評估來源、日期、證據及目的。" },
                { claim: "串流必須先下載完整檔案才可播放。", correction: "串流通常在接收部分數據並建立緩衝後便開始播放，毋須等待完整檔案。" }
            ],
            quickCheck: {
                question: "以下哪項最能提高網上健康資料的可信程度？",
                options: ["只有大量分享次數", "由具名專業機構發布並附可核實證據", "標題使用很多感嘆號", "搜尋結果排在廣告首位"],
                answerIndex: 1,
                explanation: "具名權威來源和可核實證據能支援內容；仍應同時檢查日期及與其他可靠來源交叉印證。"
            },
            examTip: "可信性題要引用題目中的具體線索，例如作者資格、更新日期、證據來源或商業目的，不能只寫『我認為可信』。"
        },
        "chc-4": {
            objectives: [
                "辨認 HTML 文件的基本結構及常見元素功能",
                "按目標受眾改善導覽、連結、表格、多媒體、顏色和文字設計",
                "解釋 HTML 的跨平台特點及把網站上載至 Web 的基本流程"
            ],
            scopeNote: "本課依 C(c) 集中辨認 HTML 基本結構及為目標受眾組織網頁；課程明確不要求背誦 HTML 程式碼。",
            featuredQuestionId: "q-c-c-design-002",
            concepts: [
                { icon: "<> ", label: "HTML 結構", detail: "HTML 以標記描述標題、段落、連結、表格和多媒體等內容結構。" },
                { icon: "⇥", label: "導覽", detail: "一致而清楚的選單、描述性連結和合理資訊層次，協助受眾找到內容。" },
                { icon: "Aa", label: "可讀設計", detail: "字體大小、顏色對比、留白和一致版面須符合目標受眾及裝置。" },
                { icon: "↑", label: "發布", detail: "整理相對路徑和資源後，把網站檔案上載至 Web 伺服器，再測試公開網址和連結。" }
            ],
            misconceptions: [
                { claim: "HTML 的主要作用是控制所有視覺效果。", correction: "HTML 主要描述內容結構；視覺樣式通常由 CSS 控制，互動行為可由 JavaScript 提供。" },
                { claim: "圖片本身可見，所以毋須替代文字。", correction: "合適的 alt 文字可讓屏幕閱讀器傳達圖片用途，亦在圖片載入失敗時提供資訊。" }
            ],
            quickCheck: {
                question: "為長者設計健康資訊網頁，以下哪項最合適？",
                options: ["使用細小淺灰文字", "只用顏色表示錯誤", "使用清楚標題、足夠字體及高對比", "把所有內容放進一個沒有標題的長段落"],
                answerIndex: 2,
                explanation: "清楚層次、足夠字體和高對比能改善可讀性，並回應長者受眾的需要。"
            },
            examTip: "設計建議要寫成『改動 → 對目標受眾的效果』，例如增加字體大小令長者較易閱讀，而不只寫『更美觀』。"
        },
        "chc-5": {
            objectives: [
                "分辨常見惡意程式、未授權存取、截取、網絡釣魚及 DoS 等威脅",
                "按風險選擇防毒、防火牆、WPA、VPN、瀏覽器及權限控制等措施",
                "解釋加密、認證、授權、數碼證書及電子交易保安的不同作用"
            ],
            scopeNote: "本課依 C(d) 涵蓋網絡威脅、保安措施、私隱、加密、認證／授權、數碼證書及電子交易保安；深入密碼學算法不在要求內。",
            featuredQuestionId: "q-c-d-security-003",
            concepts: [
                { icon: "!", label: "威脅", detail: "先辨認攻擊如何發生及會破壞保密性、完整性或可用性，再選擇措施。" },
                { icon: "▰", label: "防護", detail: "防火牆、更新、防毒、WPA、VPN 和最小權限處理不同攻擊面，沒有單一措施可阻擋所有威脅。" },
                { icon: "🔐", label: "加密", detail: "把明文轉成密文以減低截取後被閱讀的風險；密碼匙管理同樣重要。" },
                { icon: "ID", label: "存取控制", detail: "認證確認身分；授權決定已確認身分的使用者可存取甚麼資源。" }
            ],
            misconceptions: [
                { claim: "防火牆可以偵測和刪除所有電腦病毒。", correction: "防火牆按規則控制網絡流量；防毒軟件才主要掃描惡意程式，但兩者都不能保證攔截所有威脅。" },
                { claim: "HTTPS 代表網站內容一定真確。", correction: "HTTPS 保護傳輸並可驗證證書所代表的伺服器身分，但不保證頁面聲稱或商品一定可信。" }
            ],
            quickCheck: {
                question: "使用者登入後，只可讀取自己班別的檔案。『只可讀取自己班別』主要屬於甚麼？",
                options: ["認證", "授權", "壓縮", "串流"],
                answerIndex: 1,
                explanation: "登入核實使用者身分屬認證；決定該使用者可讀取哪些檔案則屬授權。"
            },
            examTip: "保安建議題要使用『威脅 → 措施 → 如何減低風險』句式；只列出防火牆、VPN 等名稱通常不足以取得解釋分。"
        },
        "chd-1": {
            objectives: ["界定問題目標和範圍並辨認輸入、處理及輸出", "把複雜問題分解成較小而可管理的子問題", "辨認相似問題的模式並保留解題所需的關鍵資料"],
            scopeNote: "本課依 D(a) 集中問題定義、IPO、分解、模式辨認及抽象化；具體算法表示與控制結構會在 D(b) 處理。",
            featuredQuestionId: "q-d-a-analysis-002",
            concepts: [
                { icon: "◎", label: "定義", detail: "寫清楚目標、使用者、限制和成功條件，避免解決錯誤或過大的問題。" },
                { icon: "IPO", label: "分析", detail: "辨認所需輸入、處理規則和輸出，建立問題與方案之間的清楚界線。" },
                { icon: "▦", label: "分解", detail: "把複雜工作拆成輸入、計算、驗證、儲存和輸出等較小子問題。" },
                { icon: "⌁", label: "模式與抽象", detail: "找出可重用的共同方法，忽略不影響解答的細節，只保留必要特徵。" }
            ],
            misconceptions: [
                { claim: "分解就是把程式每一行分開。", correction: "分解在設計前把問題拆成有清晰責任的子問題，並不等於把現有程式逐行切開。" },
                { claim: "抽象化代表把所有細節刪除。", correction: "抽象化只忽略與目前目標無關的細節，必須保留解題所需的資料和規則。" }
            ],
            quickCheck: { question: "計算 BMI 的問題中，哪組最合適作輸入？", options: ["姓名和班別", "身高和體重", "BMI 和健康分類", "打印機和顯示器"], answerIndex: 1, explanation: "BMI 的計算需要身高和體重；BMI 值和分類是處理後的輸出。" },
            examTip: "分析題先逐項寫出 input、process、output；處理要用動詞和規則，例如『以體重除以身高平方』。"
        },
        "chd-2": {
            objectives: ["以偽代碼或流程圖表示順序、選擇和迭代算法", "選擇合適數據類型、字串及一維陣列並運用 Boolean 邏輯", "以追蹤表檢查變數值、找出邏輯錯誤並解釋模組化好處"],
            scopeNote: "本課依 D(b) 涵蓋 dry run、偽代碼／流程圖、介面、簡單數據類型、字串、一維陣列、Boolean、控制結構、追蹤表和模組化；不要求巢狀迴圈。",
            featuredQuestionId: "q-d-b-trace-002",
            concepts: [
                { icon: "→", label: "順序", detail: "步驟按指定次序執行；次序改變可令結果不同。" },
                { icon: "◇", label: "選擇", detail: "binary 或 multi-way selection 按條件結果選擇一條執行路徑。" },
                { icon: "↻", label: "迭代", detail: "按次數或條件重複步驟；要確保終止條件可達成。" },
                { icon: "▤", label: "追蹤與模組", detail: "追蹤表記錄每步狀態；模組把複雜方案分成可理解、測試和重用的部分。" }
            ],
            misconceptions: [
                { claim: "流程圖和偽代碼會被電腦直接執行。", correction: "兩者主要用來表示和溝通算法；需轉成程式語言才由電腦執行。" },
                { claim: "追蹤表只需寫最終答案。", correction: "追蹤表應在指定語句每次執行後更新相關變數和條件，顯示過程。" }
            ],
            quickCheck: { question: "要保存 30 名學生的分數並以索引逐一處理，最合適使用甚麼？", options: ["一個 Boolean", "一個 character", "一維陣列／列表", "只用常數"], answerIndex: 2, explanation: "一維陣列／列表可用同一名稱和索引保存多個同類數值。" },
            examTip: "dry run 時按執行次序逐行更新追蹤表；不要以心算跳到答案，尤其要記錄迴圈索引和條件真假。"
        },
        "chd-3": {
            objectives: ["正確使用變數、常數、運算子、表達式及輸入輸出", "以順序、選擇及非巢狀迭代建立程式方案", "對字串及一維列表進行搜尋、計數、最大／最小和次序檢查"],
            scopeNote: "本課依 D(c) 集中變數、常數、簡單列表、運算子、輸入輸出及基本控制結構；公開試指定語言及語法以最新考評資料為準。",
            featuredQuestionId: "q-d-c-list-002",
            concepts: [
                { icon: "x", label: "變數與常數", detail: "變數保存會改變的值；常數代表運行期間不應改變的命名資料。" },
                { icon: "+−", label: "運算與表達式", detail: "算術、關係和 Boolean 運算把值組合成新值或條件結果。" },
                { icon: "◇↻", label: "控制流程", detail: "if／else 作選擇，for／while 作迭代；順序決定狀態何時更新。" },
                { icon: "[ ]", label: "字串與列表", detail: "以索引存取元素，配合迴圈搜尋、計數、比較或擷取。" }
            ],
            misconceptions: [
                { claim: "= 在所有情況都表示數學相等。", correction: "在多數程式語言中 = 用於賦值，而相等比較使用另一運算子；應按指定語言規則判斷。" },
                { claim: "while 迴圈至少會執行一次。", correction: "一般 while 先檢查條件；若開始時已為 false，迴圈本體可一次也不執行。" }
            ],
            quickCheck: { question: "要判斷 age 介乎 12 至 18（包括端點），概念上應使用哪個 Boolean 關係？", options: ["age ≥ 12 AND age ≤ 18", "age ≥ 12 OR age ≤ 18", "NOT age", "age + 12"], answerIndex: 0, explanation: "兩個限制必須同時成立，所以使用 AND。" },
            examTip: "程式題先列出變數用途和初值，再處理控制結構；計數、總和、最大值等累積變數的初值尤其重要。"
        },
        "chd-4": {
            objectives: ["按驗證規則設計正常、邊界、異常及無效測試數據", "分辨語法、邏輯及執行時錯誤並提出修正", "比較解決同一問題的方案步驟和資源使用"],
            scopeNote: "本課依 D(d) 涵蓋測試數據、邊界情況、三類程式錯誤、除錯及方案比較；測試不能證明程式在所有輸入下絕對沒有錯誤。",
            featuredQuestionId: "q-d-d-test-002",
            concepts: [
                { icon: "✓", label: "正常數據", detail: "符合所有規則而且不在邊界的典型輸入，用來檢查一般功能。" },
                { icon: "| |", label: "邊界數據", detail: "選擇剛好在、剛低於和剛高於限制的值，找出 < 與 ≤ 等錯誤。" },
                { icon: "!", label: "異常／無效", detail: "不符合類型、格式或範圍的輸入，用來檢查驗證和錯誤處理。" },
                { icon: "🐞", label: "除錯", detail: "根據錯誤訊息、追蹤表和最小測試案例定位原因，修正後再執行回歸測試。" }
            ],
            misconceptions: [
                { claim: "程式可以執行，就代表沒有錯誤。", correction: "語法正確的程式仍可能有邏輯錯誤，或只在特定輸入發生執行時錯誤。" },
                { claim: "測試一個正常數據便足夠。", correction: "還要覆蓋邊界、異常和不同分支；一個測試不能證明所有情況正確。" }
            ],
            quickCheck: { question: "有效年齡範圍是 12 至 18（包括端點）。以下哪組最適合測試下邊界？", options: ["12, 13, 14", "11, 12, 13", "0, 50, 100", "只測 15"], answerIndex: 1, explanation: "11、12、13 分別是剛低於、等於和剛高於下邊界。" },
            examTip: "邊界測試要寫出具體數值及預期結果；指出錯誤類型後，還要解釋發生時機或不正確輸出。"
        },
        "che-1": {
            objectives: ["說明人工智能、數據科學及模式辨認的基本概念和應用", "比較 3D 打印、擴增實境及虛擬實境的特點和合適情境", "分析科技創新帶來的效益、限制、數據風險及偏差"],
            scopeNote: "本課依 E(a) 集中人工智能／數據科學的模式辨認、3D 打印、擴增實境及虛擬實境的基本概念與應用；不要求推導機器學習算法或操作專業建模軟件。",
            featuredQuestionId: "q-e-a-innovation-002",
            concepts: [
                { icon: "AI", label: "模式辨認", detail: "系統從已標註例子找出數據特徵和規律，再為新輸入作分類或預測。" },
                { icon: "▤", label: "數據科學", detail: "收集、整理、分析及呈現數據，支援發現模式和作出有理據的決定。" },
                { icon: "3D", label: "增材製造", detail: "3D 打印按數碼模型逐層加入材料，適合原型和小量度身訂造製品。" },
                { icon: "AR", label: "AR 與 VR", detail: "AR 在真實景象疊加數碼內容；VR 以電腦產生的沉浸環境取代主要視野。" }
            ],
            misconceptions: [
                { claim: "人工智能的答案一定客觀而正確。", correction: "模型輸出受訓練數據、標註、特徵和規則影響；不完整或有偏差的數據可產生不公平或錯誤結果。" },
                { claim: "AR 和 VR 都必須完全遮蔽真實世界。", correction: "VR 通常讓使用者進入虛擬環境；AR 則保留真實景象並在其上加入數碼資料。" }
            ],
            quickCheck: { question: "維修員透過手機鏡頭觀看真實機器，畫面同時標示零件名稱。這最符合哪項科技？", options: ["擴增實境（AR）", "虛擬實境（VR）", "批次處理", "數碼水印"], answerIndex: 0, explanation: "真實景象仍然可見，數碼標示疊加其上，屬擴增實境。" },
            examTip: "科技應用題不要只寫名稱；以『情境需要 → 科技特點 → 實際效益／限制』完成解釋。"
        },
        "che-2": {
            objectives: ["辨認長時間使用 ICT 的健康風險並提出具體人體工學措施", "分析數碼鴻溝、性別平等、殘疾人士使用及資訊自由的利弊", "按持份者、權利、影響及責任評估 ICT 使用的道德問題"],
            scopeNote: "本課依 E(b) 涵蓋健康危害、家具和工作環境、軟件易用性、公平使用、資訊自由及 ICT 道德考慮；健康內容屬一般教育資訊，如有不適應尋求合資格專業意見。",
            featuredQuestionId: "q-e-b-ergonomics-002",
            concepts: [
                { icon: "⌁", label: "健康風險", detail: "重複動作、不良姿勢、眩光和長時間近距離觀看可引致手腕、背頸或眼睛不適。" },
                { icon: "▱", label: "人體工學", detail: "調整椅背、屏幕、鍵盤、光線和休息安排，使設備配合使用者和工作。" },
                { icon: "=", label: "公平使用", detail: "設備、連線、能力、語言和無障礙設計都會影響不同群體獲得 ICT 的機會。" },
                { icon: "⚖", label: "道德判斷", detail: "除問『能否做到』，還要衡量知情同意、私隱、公平、傷害、透明度和問責。" }
            ],
            misconceptions: [
                { claim: "購買最快的電腦便可消除健康風險。", correction: "風險主要與姿勢、重複動作、設備位置、環境和使用時間有關，需配合具體人體工學措施。" },
                { claim: "把服務放上網便代表所有人都可公平使用。", correction: "使用者仍可能缺乏設備、寬頻、數碼技能、合適語言或無障礙介面。" }
            ],
            quickCheck: { question: "哪項最直接減低長時間使用滑鼠造成的重複性勞損風險？", options: ["把屏幕亮度調至最高", "手腕保持自然位置並定時休息伸展", "增加喇叭音量", "每天更改桌面背景"], answerIndex: 1, explanation: "自然手腕姿勢和休息可減少重複動作及持續受力；其餘選項不能針對 RSI。" },
            examTip: "健康建議要寫『危害 → 身體部位／原因 → 具體改善』；道德題則要點出受影響的持份者和後果。"
        },
        "che-3": {
            objectives: ["解釋知識產權、版權和承認資料來源的重要性", "分辨 freeware、shareware、open source 及受版權保護的商業軟件授權", "分析侵權和網絡盜版的影響，並說明數碼水印與數碼簽署的作用"],
            scopeNote: "本課依 E(c) 說明知識產權、常見軟件授權、侵權／盜版及保護技術，屬課程層面的通識內容；實際權利、例外和法律後果應查閱香港官方資料或尋求法律意見。",
            featuredQuestionId: "q-e-c-licence-002",
            concepts: [
                { icon: "©", label: "版權", detail: "原創作品通常受版權保護；取得檔案或在網上找到內容，不等於取得複製和發布權。" },
                { icon: "⌘", label: "軟件授權", detail: "授權條款決定可否安裝、修改、分發、商業或教育使用；免費價格不等於沒有限制。" },
                { icon: "WM", label: "數碼水印", detail: "在數碼內容嵌入可見或隱藏標記，協助顯示擁有者或追查未授權複製來源。" },
                { icon: "✓", label: "數碼簽署", detail: "協助驗證簽署者來源和內容完整性；它與把所有內容保密的加密目的不同。" }
            ],
            misconceptions: [
                { claim: "Freeware 一定會提供源代碼並容許修改。", correction: "Freeware 強調可免費使用；是否提供源代碼及准許修改要看授權。Open source 才以可取得源代碼和相應授權為核心。" },
                { claim: "在作品列出作者姓名後，就一定可以任意複製。", correction: "承認來源很重要，但通常不能取代所需的許可或授權；使用者仍須遵守適用條款。" }
            ],
            quickCheck: { question: "哪項最準確描述 open source software？", options: ["只可免費試用 30 日", "按授權提供源代碼，容許使用者在條款下查看、修改或分發", "一定沒有版權", "只可由原作者閱讀程式碼"], answerIndex: 1, explanation: "開放源碼軟件仍受版權及授權條款約束，但授權會提供源代碼及相應使用權。" },
            examTip: "授權題要分開回答價格、源代碼和准許行為；不要把『免費』、『可修改』和『沒有版權』混為一談。"
        },
        "ea-1": {
            objectives: ["辨認實體、屬性、關係、domain、index 及不同種類的鍵", "以實體、參照及 domain 完整性檢查數據", "建立合理的關聯表並解釋 rollback 的目的"],
            scopeNote: "本課依 Elective A(a) 涵蓋關聯數據庫基本概念、簡單關聯數據庫及 rollback；SQL 操作與設計方法分別在 A(b)、A(c) 處理。",
            featuredQuestionId: "q-ea-rel-002",
            concepts: [{ icon: "▦", label: "實體與屬性", detail: "實體是要保存資料的對象，屬性描述該對象；domain 限制屬性的有效值。" }, { icon: "PK", label: "鍵", detail: "候選鍵可唯一識別記錄；選定一個作主鍵，外鍵則連結另一表的鍵。" }, { icon: "✓", label: "完整性", detail: "實體、參照及 domain 完整性分別保護識別、關係和有效值。" }, { icon: "↶", label: "Rollback", detail: "交易失敗時撤銷未完成變更，把數據庫還原至一致狀態。" }],
            misconceptions: [{ claim: "每個表只可以有一個候選鍵。", correction: "一個表可有多個候選鍵，但只選其中一個作主鍵。" }, { claim: "外鍵每個值都必須不同。", correction: "外鍵可以重複；它通常用來表示多筆記錄指向同一筆父表記錄。" }],
            quickCheck: { question: "STUDENT 表的 StudentID 可唯一識別每名學生，而 Email 亦不重複。兩者在選定主鍵前都屬於甚麼？", options: ["候選鍵", "外鍵", "索引一定不是鍵", "交易"], answerIndex: 0, explanation: "任何能唯一識別記錄的最小屬性組合均可成為候選鍵，再從中選一個作主鍵。" },
            examTip: "鍵與完整性題要寫明『哪一個表、哪一個欄位、限制甚麼不合法數據』。"
        },
        "ea-2": {
            objectives: ["使用 SQL 建立／修改表並新增、更新及刪除數據", "以運算子、函數、排序和分組從最多三表擷取資料", "正確使用各類 JOIN、一層子查詢及 view"],
            scopeNote: "本課依 Elective A(b) 涵蓋最多三表的維護與查詢、運算式、aggregate／string functions、equi／natural／outer join 及一層子查詢。",
            featuredQuestionId: "q-ea-sql-002",
            concepts: [{ icon: "DDL", label: "表結構", detail: "CREATE、ALTER、DROP 等語句處理表的定義和結構。" }, { icon: "DML", label: "數據維護", detail: "INSERT、UPDATE、DELETE 改變記錄；WHERE 遺漏可影響多筆資料。" }, { icon: "JOIN", label: "多表查詢", detail: "按相關鍵連接表，選擇 join 類型決定是否保留沒有配對的記錄。" }, { icon: "Σ", label: "分析", detail: "aggregate、GROUP BY、HAVING 和子查詢把問題分層處理。" }],
            misconceptions: [{ claim: "WHERE 和 HAVING 可以在所有情況互換。", correction: "WHERE 在分組前篩選記錄；HAVING 在 GROUP BY 後篩選群組。" }, { claim: "LEFT JOIN 只顯示兩表都有配對的記錄。", correction: "LEFT JOIN 保留左表所有記錄，右表沒有配對時相應欄位為空值。" }],
            quickCheck: { question: "要找出平均分高於 70 的班別，哪個子句用來篩選計算後的群組？", options: ["HAVING", "WHERE", "ORDER BY", "ALTER TABLE"], answerIndex: 0, explanation: "平均分是群組聚合結果，因此以 HAVING 篩選。" },
            examTip: "SQL 題先逐段圈出輸出欄、來源表、連接條件、記錄條件、分組條件和排序，再組成語句。"
        },
        "ea-3": {
            objectives: ["由情境建立只含二元關係的 ER 圖並處理 1:1、1:M、M:N", "把 ER 圖轉成關聯表並把 M:N 拆成兩個 1:M", "以 1NF、2NF、3NF 減少冗餘並說明反正規化及存取權"],
            scopeNote: "本課依 Elective A(c) 涵蓋簡單 ER 圖、M:N resolution、正規化至 3NF、反正規化、ER-to-table 及以 access rights 保護私隱。",
            featuredQuestionId: "q-ea-design-002",
            concepts: [{ icon: "ER", label: "ER 模型", detail: "先辨認實體、鍵屬性和二元關係，再標示基數及 mandatory／optional participation。" }, { icon: "M:N", label: "解拆多對多", detail: "建立橋接實體，把 M:N 關係改成兩個 1:M，並保存兩邊外鍵。" }, { icon: "3NF", label: "正規化", detail: "逐步移除 repeating group、partial dependency 和 transitive dependency。" }, { icon: "ACL", label: "存取權", detail: "按職責授予讀、寫或修改權，減少不必要的個人資料存取。" }],
            misconceptions: [{ claim: "表越多，數據庫一定越好。", correction: "設計要減少異常和冗餘，同時符合查詢需要；過度拆分也會增加複雜度。" }, { claim: "正規化完成後永遠不能反正規化。", correction: "在有理據的效能需要下可反正規化，但要接受冗餘和一致性管理成本。" }],
            quickCheck: { question: "ENROLMENT(StudentID, CourseID, Grade) 最適合用來解拆哪類關係？", options: ["學生與課程的多對多關係", "學生與姓名的一對一關係", "主鍵與 domain", "一次 rollback"], answerIndex: 0, explanation: "橋接表保存兩邊外鍵和關係本身的屬性 Grade，把 M:N 解成兩個 1:M。" },
            examTip: "正規化題每一步都要指出依賴關係和新表的主鍵／外鍵，不要只寫最後表名。"
        },
        "eb-1": {
            objectives: ["解釋 request／response、TCP port 及客戶端與伺服器角色", "配對 DHCP、domain controller、file／proxy／web／database server 和 gateway", "設計簡單有線／無線網絡、分享資源並設定 read／write／execute 權限"],
            scopeNote: "本課依 Elective B(a) 涵蓋客戶端—伺服器通訊、HTTP GET／POST、TCP port、常用伺服器、簡單網絡實作、資源分享及檔案權限。",
            featuredQuestionId: "q-eb-network-002",
            concepts: [{ icon: "→", label: "Request", detail: "客戶端向指定伺服器和服務連接埠發出請求；伺服器處理後回應。" }, { icon: "GET", label: "GET／POST", detail: "GET 常把查詢參數放入 URL；POST 把提交資料放在請求內容，兩者都不等於自動加密。" }, { icon: "Srv", label: "伺服器角色", detail: "不同伺服器集中提供位址、身分、檔案、代理、網頁或數據庫服務。" }, { icon: "rwx", label: "權限", detail: "read、write、execute 要按使用者工作需要分配，遵守最小權限。" }],
            misconceptions: [{ claim: "POST 比 GET 安全，所以不需要 HTTPS。", correction: "POST 只改變資料放置方式；傳輸保密仍需要 HTTPS 等加密連線。" }, { claim: "DHCP 伺服器把域名轉成 IP 位址。", correction: "DHCP 配發網絡設定；DNS 才把域名解析成 IP 位址。" }],
            quickCheck: { question: "新連接的電腦自動取得 IP 位址、預設閘道和 DNS 設定，主要由哪類伺服器提供？", options: ["DHCP server", "Web server", "File server", "Database server"], answerIndex: 0, explanation: "DHCP 自動租用 IP 位址及相關網絡參數。" },
            examTip: "網絡服務題先寫服務名稱，再以『誰向誰發出甚麼請求／取得甚麼資源』解釋。"
        },
        "eb-2": {
            objectives: ["以 HTML 和 CSS 建立一致的網頁介面並說明發布方法", "分辨客戶端和伺服器端腳本的執行位置與工作", "建立表單驗證、單表查詢／更新、cookies 及簡單整合式網頁應用"],
            scopeNote: "本課依 Elective B(b) 涵蓋 HTML／CSS、網頁發布、client／server-side scripting、輸入處理與驗證、單一數據表存取、cookies 及簡單網頁應用整合。",
            featuredQuestionId: "q-eb-web-002",
            concepts: [{ icon: "HTML", label: "結構", detail: "HTML 表達標題、段落、表單和內容語意；CSS 統一呈現。" }, { icon: "JS", label: "客戶端", detail: "在瀏覽器提供即時介面和初步驗證，但不能成為唯一安全防線。" }, { icon: "PHP", label: "伺服器端", detail: "接收請求、再次驗證、執行商業規則和安全地讀寫數據庫。" }, { icon: "Cookie", label: "狀態", detail: "cookies 可在請求之間保存識別或偏好；不應存放明文密碼和敏感資料。" }],
            misconceptions: [{ claim: "有 JavaScript 驗證後，伺服器不必再驗證。", correction: "客戶端程式可被繞過；伺服器必須重新驗證所有不可信輸入。" }, { claim: "Cookie 是伺服器上的數據庫表。", correction: "Cookie 由瀏覽器保存並隨合適請求傳送；伺服器可另用資料庫保存正式記錄。" }],
            quickCheck: { question: "使用者停用 JavaScript 後仍要阻止非法分數寫入數據庫。最重要的措施是甚麼？", options: ["伺服器端再次驗證", "只更改 CSS 顏色", "把密碼放入 Cookie", "刪除 POST"] , answerIndex: 0, explanation: "客戶端驗證改善使用體驗；只有伺服器端驗證能處理被修改或直接送出的請求。" },
            examTip: "網頁流程題逐步寫 browser → request → server validation／processing → database → response。"
        },
        "ec-1": {
            objectives: ["選擇並追蹤 linear／binary search、bubble／insertion／selection sort 和 merge", "使用巢狀迴圈、sub-program、參數、局部／全域變數及良好程式風格", "以陣列實作 linked list、stack、queue，操作文字檔並使用進階除錯方法"],
            scopeNote: "本課依 Elective C(a) 涵蓋指定搜尋／排序／合併算法、巢狀迴圈、線性鏈結串列／堆疊／佇列、文字檔、參數傳遞、結構化程式及數值與一般程式錯誤。",
            featuredQuestionId: "q-ec-program-002",
            concepts: [{ icon: "⌕", label: "搜尋排序", detail: "按資料是否排序、規模、穩定性和操作成本選擇算法，而不是只背名稱。" }, { icon: "LIFO", label: "Stack", detail: "最後加入的項目最先移除；push／pop 只在頂端進行。" }, { icon: "FIFO", label: "Queue", detail: "最先加入的項目最先移除；enqueue 在尾，dequeue 在首。" }, { icon: "🐞", label: "除錯", detail: "使用 stub、flag、breakpoint、trace 和測試數據定位錯誤，包括 overflow／underflow。" }],
            misconceptions: [{ claim: "Binary search 可直接用於任何未排序列表。", correction: "Binary search 依賴有序資料；未排序時必須先排序或改用其他搜尋。" }, { claim: "Stack 和 queue 只是兩個不同名稱的陣列。", correction: "兩者可用陣列實作，但允許加入和移除的位置不同，形成 LIFO 與 FIFO 行為。" }],
            quickCheck: { question: "打印工作的先到先處理最適合使用哪種結構？", options: ["Queue", "Stack", "只有 Boolean", "Binary tree（本課必須）"], answerIndex: 0, explanation: "打印佇列按 FIFO 處理；較早 enqueue 的工作較早 dequeue。" },
            examTip: "算法比較題要同時交代前置條件、步驟數趨勢和資料結構；追蹤時標示索引及每次交換。"
        },
        "ec-2": {
            objectives: ["使用擴充模組或函式庫讀取感應器及控制輸出裝置", "以使用者操作或感應器閾值觸發事件處理程序", "把輸入、處理、輸出、邊界安全和失效狀況整合成實體裝置方案"],
            scopeNote: "本課依 Elective C(b) 涵蓋感應器、馬達等實體裝置、擴充函式庫及 event-driven programs；不要求擴充模組或事件處理器的內部實作細節。",
            featuredQuestionId: "q-ec-device-002",
            concepts: [{ icon: "◉", label: "Sensor", detail: "光線、加速度等感應器把環境狀態轉成程式可讀數值。" }, { icon: "◇", label: "Event", detail: "按鍵或數值越過閾值時觸發 handler，主程式不必不斷執行同一動作。" }, { icon: "⚙", label: "Actuator", detail: "馬達、顯示器或聲音裝置把程式輸出轉成物理效果。" }, { icon: "!", label: "安全狀態", detail: "設定有效範圍、去抖動、超時和失效預設，避免錯誤讀數造成危險動作。" }],
            misconceptions: [{ claim: "事件驅動程式的步驟一定按固定次序發生。", correction: "事件由使用者或環境觸發，次序和時間未必可預測。" }, { claim: "感應器每次讀數都完全準確。", correction: "讀數可受噪聲、校準和環境影響，方案應考慮範圍、平均、閾值和異常處理。" }],
            quickCheck: { question: "當光線讀數低於 20 時自動開燈，『低於 20』在事件方案中主要是甚麼？", options: ["觸發條件／閾值", "資料庫主鍵", "HTML 標籤", "排序結果"], answerIndex: 0, explanation: "感應器數值越過指定閾值時觸發開燈處理程序。" },
            examTip: "實體裝置題使用 sensor input → condition／event → processing → actuator output，再補充錯誤讀數與安全狀態。"
        },
        "tool-mock-exam": {
            objectives: ["在正式限時和完成前不顯示答案的情況完成原創題組", "練習卷一甲乙分部或卷二任選兩個選修單元的作答安排", "使用標記、未答導覽、答題紙及交卷後課題分析"],
            concepts: [{ icon: "⏱", label: "正式限時", detail: "卷一 2 小時；卷二 1 小時 30 分鐘，時間到會自動交卷。" }, { icon: "1", label: "Paper 1", detail: "甲部 40 分選擇題、乙部 60 分短答／結構題，共有三套穩定組卷。" }, { icon: "2", label: "Paper 2", detail: "從 A、B、C 選取兩個 38 小時選修單元，每個選修有兩套題組。" }, { icon: "✓", label: "交卷檢討", detail: "交卷後按正式成績比重換算，並按課題列出失分和遺漏評分點。" }],
            misconceptions: [{ claim: "本站模擬卷的分數可直接換算正式等級。", correction: "題目是自行編寫，未經考評局等級設定，只能用作診斷與時間管理練習。" }],
            quickCheck: { question: "模擬考途中遇到不肯定的題目，較合適做法是甚麼？", options: ["先標記並按時間安排繼續", "立即查看答案", "退出並重開直至抽到熟悉題目", "只做選擇題"], answerIndex: 0, explanation: "先控制時間並完成可取得的分數，最後才返回較困難題目。" },
            examTip: "第一次以準確為先，第二次才比較用時；交卷後按評分點重寫失分答案。"
        },
        "tool-mistake-book": {
            objectives: ["找出錯題所屬課題、錯誤類型及遺漏評分點", "比較第一次與最近一次得分", "按 1、3、7、14 日節奏完成弱項重練"],
            concepts: [{ icon: "!", label: "錯誤記錄", detail: "只有未取得滿分的題目才加入錯題簿，資料只存在目前瀏覽器。" }, { icon: "•", label: "評分點", detail: "短答題逐點顯示遺漏內容，讓重溫有明確目標。" }, { icon: "↻", label: "間隔重練", detail: "答對後依次延長至 3、7、14 日；再次失分會回到較短間隔。" }, { icon: "⌂", label: "課題重溫", detail: "每項記錄可返回所屬課程頁或直接重做原題。" }],
            misconceptions: [{ claim: "錯題簿會把學生資料上載到網站管理員。", correction: "目前版本只用瀏覽器 localStorage；清除網站資料或轉用裝置後不會自動同步。" }],
            quickCheck: { question: "短答題失分後，哪項記錄最有助下一次改善？", options: ["遺漏的具體評分點", "只記錄總分", "只保存作答日期", "只保存題目顏色"], answerIndex: 0, explanation: "具體評分點能指出答案欠缺的概念或因果關係。" },
            examTip: "重做前先遮住答案，用一句話重述每個遺漏評分點，再完整作答。"
        },
        "tool-past-paper-index": {
            objectives: ["按年份、課題及問法查找考評局公開示例", "辨認指出、描述、解釋、比較、追蹤和評估等動詞要求", "在不複製歷屆原題的情況建立操卷索引"],
            concepts: [{ icon: "年", label: "年份", detail: "連到考評局公開考生表現示例及出版資料。" }, { icon: "題", label: "課題", detail: "把公開示例映射到現行課程內容；舊制卷二會清楚標示。" }, { icon: "問", label: "問法", detail: "摘要題目動詞和所需證據，不重製原題。" }, { icon: "©", label: "版權", detail: "歷屆題目和評卷參考受保護，使用及複製須依考評局授權。" }],
            misconceptions: [{ claim: "網上找到的歷屆試題可以直接大量複製到題庫。", correction: "公開可搜尋不代表可重製；本站只保存元資料、官方連結及自行編寫的練習題。" }],
            quickCheck: { question: "題目要求『解釋』時，答案通常要包含甚麼？", options: ["原因、機制或因果關係", "只有一個名詞", "只抄題目", "只寫個人喜好"], answerIndex: 0, explanation: "解釋題要交代如何或為何，而不是只列出答案名稱。" },
            examTip: "先圈起命令詞，再估計每分需要一個可獨立辨認的答案點。"
        },
        "tool-answer-lab": {
            objectives: ["從不同等級公開示例辨認作答完整度及常見缺口", "以情境證據、技術機制和直接結果組織答案", "完成基礎診斷、應試改寫及高階整合三層原創練習"],
            concepts: [{ icon: "眼", label: "診斷", detail: "辨認留白、籠統術語、欠條件公式及不完整 SQL 等可見缺口。" }, { icon: "鏈", label: "因果鏈", detail: "解釋題由題目證據連到技術機制，再寫出對情境的直接結果。" }, { icon: "分", label: "評分點", detail: "按分數和命令詞檢查答案點數量、單位、條件、輸出及步驟。" }, { icon: "改", label: "重寫", detail: "先診斷，再把答案重組；最後在新情境中獨立作答和自評。" }],
            misconceptions: [{ claim: "只要背熟第 5 級考生的句子，就能應付相同題型。", correction: "公開示例用來觀察答案品質；真正能力是把原理移植到新的數據、欄位、硬件和限制。" }, { claim: "答案越長便越高分。", correction: "每句應回應命令詞或形成可辨認的評分點；無關背景不會取代準確的機制與結果。" }],
            quickCheck: { question: "解釋某硬件適合題目情境時，哪種結構最完整？", options: ["硬件名稱 → 運作機制 → 情境效果", "只寫『較快』", "只抄產品規格", "列出所有認識的硬件"], answerIndex: 0, explanation: "由選擇、機制到情境效果能形成可辨認的因果鏈，也較容易逐點核對。" },
            examTip: "答案完成後逐項問：有沒有回應命令詞、引用情境、寫出機制、交代結果，以及核對分數與單位？"
        },
        "tool-sba-prep": {
            objectives: ["把問題、使用者需要和成功準則轉成可驗證規格", "用設計和實作證據說明方案決定", "建立測試計劃並以結果、限制和改善作評估"],
            concepts: [{ icon: "D", label: "Design", detail: "用需求、數據、介面和算法設計說明方案如何符合問題。" }, { icon: "I", label: "Implementation", detail: "保留版本和自己完成工作的證據，解釋關鍵技術決定。" }, { icon: "T", label: "Testing", detail: "測試正常、邊界、異常及主要功能，記錄預期與實際結果。" }, { icon: "E", label: "Evaluation", detail: "按原定準則判斷成效，引用測試證據並提出具體改善。" }],
            misconceptions: [{ claim: "SBA 報告越長便一定越高分。", correction: "重點是證據是否直接回應要求、設計決定和評估準則，而不是頁數。" }],
            quickCheck: { question: "哪項最能支持『輸入驗證有效』的評估？", options: ["正常、邊界及異常測試的預期與實際結果", "只放首頁截圖", "寫『程式很好用』", "複製網上說明"], answerIndex: 0, explanation: "可重現的測試數據和結果能直接證明驗證規則是否正確。" },
            examTip: "只使用一般框架準備技能；實際受監管題目必須按教師指示在課堂完成並保留真實工作證據。"
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

const lessonVisualAssets = {
    coreA: {
        src: "assets/images/lesson-visuals/core-a-data-information.webp",
        alt: "由條碼、鍵盤和感應器輸入數據，經電腦處理後形成圖表、數據表及支援決策的資訊",
        width: 1672,
        height: 941
    },
    representation: {
        src: "assets/images/lesson-visuals/core-a-data-representation.webp",
        alt: "二進制數據分別表示像素與色彩、字符、聲音取樣及視像畫面",
        width: 1672,
        height: 941
    },
    coreB: {
        src: "assets/images/lesson-visuals/core-b-computer-system.webp",
        alt: "打開的桌面電腦機箱，以及 CPU、暫存器、主記憶體和儲存裝置之間的關係",
        width: 1672,
        height: 941
    },
    coreC: {
        src: "assets/images/lesson-visuals/core-c-internet-security.webp",
        alt: "電腦和手機經無線接達點、路由器及互聯網連接多種伺服器，防火牆阻擋惡意請求",
        width: 1672,
        height: 941
    },
    coreD: {
        src: "assets/images/lesson-visuals/core-d-program-development.webp",
        alt: "現實問題經分析、流程圖、程式編寫、追蹤測試及除錯成為可用程式",
        width: 1672,
        height: 941
    },
    coreE: {
        src: "assets/images/lesson-visuals/core-e-responsible-ict.webp",
        alt: "學生使用擴增實境、3D 打印及人工智能，並注意人體工學、私隱同意和知識產權",
        width: 1672,
        height: 941
    },
    electiveA: {
        src: "assets/images/lesson-visuals/elective-a-database-design.webp",
        alt: "重複資料拆分成以鍵連接的關聯表，再按條件產生查詢結果",
        width: 1672,
        height: 941
    },
    electiveB: {
        src: "assets/images/lesson-visuals/elective-b-web-application.webp",
        alt: "瀏覽器表單經安全請求傳送到網頁伺服器，驗證後讀寫數據庫並回傳結果",
        width: 1672,
        height: 941
    },
    electiveC: {
        src: "assets/images/lesson-visuals/elective-c-algorithms-devices.webp",
        alt: "排序與二分搜尋、堆疊與佇列、鏈結資料，以及感應器控制風扇和馬達",
        width: 1672,
        height: 941
    }
};

const lessonVisualAssignments = {
    "cha-1": { asset: "coreA", title: "從數據到決策", caption: "沿箭嘴辨認輸入、處理、輸出和儲存；最後的圖表只有在能回答問題時才成為有用資訊。", points: ["原始輸入", "分類與計算", "資訊支援決策"] },
    "cha-2": { asset: "coreA", title: "數據進入系統前後都要受控", caption: "收集階段要用 validation 和 verification 控制質素；儲存後仍要以欄位結構、存取權和備份維持可靠性。", points: ["收集與核對", "結構化儲存", "可靠輸出"] },
    "cha-3": { asset: "representation", title: "同一串 bit，可以表示不同媒體", caption: "先辨認媒體類型，再把解像度、色彩深度、取樣率或畫面數量連到檔案大小及品質。", points: ["像素與色彩", "聲音取樣", "視像壓縮"] },
    "cha-4": { asset: "coreA", title: "試算表把記錄轉成趨勢", caption: "公式先處理每列數據，圖表再把比較和趨勢顯示出來；留意複製公式時哪些參照需要固定。", points: ["輸入記錄", "公式處理", "圖表比較"] },
    "cha-5": { asset: "coreA", title: "數據表支援檢索和決策", caption: "不要只看數據庫圓柱圖示；要追問每個欄位保存甚麼、如何識別記錄，以及查詢如何產生所需資訊。", points: ["欄位與記錄", "鍵與關係", "查詢結果"] },
    "chb-1": { asset: "coreB", title: "由機箱看到 CPU 與記憶體", caption: "分清主機板上的 CPU、RAM 和儲存裝置，再追蹤指令位址及內容在暫存器與主記憶體之間的流動。", points: ["CPU 與主機板", "RAM 與儲存", "機器周期"] },
    "chb-2": { asset: "coreB", title: "軟件如何控制硬件資源", caption: "操作系統和 device driver 令程式能使用處理器、記憶體、儲存和周邊設備；不同處理模式則決定工作何時執行。", points: ["硬件資源", "系統軟件", "處理模式"] },
    "chc-1": { asset: "coreC", title: "由裝置接入網絡，再連到服務", caption: "先辨認 NIC、接達點、switch、router 和 modem 的位置，再判斷它們連接同一網絡還是不同網絡。", points: ["有線與無線接入", "LAN 內轉送", "連接不同網絡"] },
    "chc-2": { asset: "coreC", title: "一次網頁請求經過多個協定", caption: "域名先解析成 IP，傳輸層建立連線，封包再經路由到伺服器；答案要把協定和任務逐一配對。", points: ["名稱解析", "可靠傳輸", "Request／response"] },
    "chc-3": { asset: "coreC", title: "互聯網服務背後仍是請求與伺服器", caption: "搜尋、串流、雲端和通訊服務的介面不同，但都要考慮伺服器角色、頻寬、延遲及資料可信性。", points: ["客戶端請求", "雲端服務", "資訊可信性"] },
    "chc-4": { asset: "electiveB", title: "網頁由介面連到後端處理", caption: "HTML 表達結構，CSS 控制呈現；表單資料若送到伺服器，仍要驗證並安全地處理。", points: ["語意結構", "一致呈現", "表單與回應"] },
    "chc-5": { asset: "coreC", title: "保安是多層控制", caption: "加密保護傳輸，認證確認身分，防火牆及更新阻擋或減少攻擊；備份則處理資料受損後的復原。", points: ["認證與加密", "阻擋威脅", "備份復原"] },
    "chd-1": { asset: "coreD", title: "先理解問題，再決定寫甚麼", caption: "把現實情境分成必要輸入、處理和輸出，忽略無關細節，再把大問題拆成可測試的子問題。", points: ["問題與使用者", "分解與抽象", "IPO 規格"] },
    "chd-2": { asset: "coreD", title: "算法把想法變成可追蹤步驟", caption: "利用流程圖或偽代碼表達 sequence、selection 和 iteration；每條分支及迴圈都要有清楚條件。", points: ["流程圖符號", "三種控制結構", "逐步追蹤"] },
    "chd-3": { asset: "coreD", title: "由算法走到可執行程式", caption: "變數、輸入輸出、條件和迴圈要逐一對應算法；程式能執行不代表邏輯必定正確。", points: ["變數與資料", "條件與迴圈", "程式輸出"] },
    "chd-4": { asset: "coreD", title: "測試用證據找出錯誤", caption: "先寫 expected result，再用正常、邊界和不合法數據執行；利用 trace 或 debugger 找出結果不同的第一步。", points: ["測試計劃", "邊界與異常", "定位及修正"] },
    "che-1": { asset: "coreE", title: "新科技仍要由問題和限制出發", caption: "AR、3D 打印和人工智能各有合適用途；評估時同時考慮所需數據、硬件、準確度和人類監督。", points: ["AR／VR", "3D 打印", "AI 與人類監督"] },
    "che-2": { asset: "coreE", title: "有效率不等於負責任", caption: "使用 ICT 時要同時處理人體工學、數碼鴻溝、個人資料、演算法偏差及不同持份者的影響。", points: ["健康與姿勢", "私隱同意", "公平與共融"] },
    "che-3": { asset: "coreE", title: "數碼作品仍受權利和授權約束", caption: "先確認作品擁有者和軟件授權，再判斷可否複製、修改或分發；保留來源和使用條款證據。", points: ["作品與版權", "軟件授權", "標示來源"] },
    "ea-1": { asset: "electiveA", title: "關聯表靠鍵維持連接", caption: "主鍵唯一識別記錄，外鍵連到另一表；完整性規則阻止不存在、重複或超出 domain 的數值。", points: ["主鍵與候選鍵", "外鍵關係", "完整性"] },
    "ea-2": { asset: "electiveA", title: "SQL 由表及關係產生結果", caption: "先找出需要的欄、表和連接條件，再處理篩選、分組和 aggregate；放大鏡代表查詢只選出所需記錄。", points: ["SELECT 欄位", "JOIN 關係", "篩選與分組"] },
    "ea-3": { asset: "electiveA", title: "由重複大表走到 3NF", caption: "按 functional dependency 拆表，為每個表選鍵，再用外鍵保留關係；M:N 則需要橋接表。", points: ["辨認依賴", "拆表與鍵", "橋接關係"] },
    "eb-1": { asset: "electiveB", title: "網絡服務各有清楚職責", caption: "客戶端可同時使用位址配置、登入、檔案、代理、網頁和數據庫服務；答案要寫清楚誰向誰請求甚麼。", points: ["Client／server", "服務與連接埠", "權限與回應"] },
    "eb-2": { asset: "electiveB", title: "完整網頁應用是往返流程", caption: "瀏覽器先提供介面和初步檢查，伺服器再驗證並讀寫數據庫，最後把結果回傳；安全決定不能只留在 client。", points: ["HTML／CSS／JS", "Server validation", "Database response"] },
    "ec-1": { asset: "electiveC", title: "演算法和資料結構要配合問題", caption: "排序及搜尋按資料狀態選擇；stack、queue 和 linked list 則以不同加入、移除及連接規則保存項目。", points: ["搜尋與排序", "LIFO／FIFO", "鏈結結構"] },
    "ec-2": { asset: "electiveC", title: "程式讀取環境，再安全地控制裝置", caption: "sensor 提供輸入，event handler 判斷閾值，actuator 產生動作；異常讀數、超時和頻繁切換都要處理。", points: ["Sensor input", "Event／threshold", "Actuator 與安全狀態"] }
};

const scenarioMediaAssets = {
    schoolData: {
        src: "assets/images/scenario-media/smart-school-data.webp",
        alt: "學生在圖書館掃描圖書、填寫平板問卷及讀取環境感應器，教師查看不含個人資料的統計圖表",
        width: 1672,
        height: 941
    },
    computerNetwork: {
        src: "assets/images/scenario-media/computer-network-lab.webp",
        alt: "學生在電腦室辨認桌面電腦內部組件，接駁交換器和無線路由器，教師檢查伺服器機櫃",
        width: 1672,
        height: 941
    },
    softwareWeb: {
        src: "assets/images/scenario-media/software-web-project.webp",
        alt: "學生由問題分析及流程圖開始，進行程式編寫、網頁介面預覽，以及正常、邊界和不合法數據測試",
        width: 1672,
        height: 941
    },
    relationalDatabase: {
        src: "assets/images/scenario-media/relational-database-project.webp",
        alt: "學生把重複的活動報名記錄整理成以關係連接的實體卡及數據表，再查看查詢結果圖表",
        width: 1672,
        height: 941
    },
    smartGreenhouse: {
        src: "assets/images/scenario-media/smart-greenhouse-iot.webp",
        alt: "學生在溫室把溫度和土壤濕度感應器接到微控制器，利用程式控制風扇、水泵和警示燈",
        width: 1672,
        height: 941
    }
};

const layeredLearningAssignments = {
    "cha-1": { asset: "schoolData", scenarioTitle: "圖書館數據如何成為決策", scenario: "圖書借閱、問卷及環境讀數只是原始數據；只有經過整理、比較和呈現，才可支援延長開放時間或調配資源等決策。", challengeTask: "為學校圖書館設計一個資訊系統 IPO：列出三項輸入、兩個處理步驟、兩項輸出和一個儲存需要，並說明其中一項輸出如何支援決策。", challengeOutput: "一張 IPO 表及 120–160 字理據。", criteria: ["輸入是可收集的原始數據", "處理和輸出有清楚因果關係", "決策用途與情境一致"] },
    "cha-2": { asset: "schoolData", scenarioTitle: "收集之前，先設計數據控制", scenario: "問卷和感應器資料可能遺漏、超出合理範圍或輸入錯誤；有效性檢驗、驗證及錯誤檢測的目的並不相同。", challengeTask: "為校外活動報名表選擇四個欄位，分別設計合適的 validation 或 verification，寫出檢查規則，並指出仍可能通過檢查的錯誤例子。", challengeOutput: "四列表格：欄位、方法、規則、限制。", criteria: ["正確分辨 validation 和 verification", "規則具體而可執行", "能指出檢查不能保證資料真確"] },
    "cha-3": { asset: "schoolData", scenarioTitle: "同一活動需要多種數碼媒體", scenario: "活動宣傳可能同時使用圖片、錄音和視像；解像度、色彩深度、取樣參數及壓縮會影響品質和傳送時間。", challengeTask: "為校園直播準備一幅圖片、一段 30 秒立體聲錄音及一段短片。自訂合理參數，列式估算未壓縮大小，再提出一項減少檔案大小的方法及代價。", challengeOutput: "完整算式、單位和一段品質取捨說明。", criteria: ["公式包含所有必要參數", "bit、byte、KB／MB 單位正確", "壓縮方法和品質代價相符"] },
    "cha-4": { asset: "schoolData", scenarioTitle: "用試算表找出借閱趨勢", scenario: "把借閱記錄輸入工作表後，可用公式計算、排序篩選及圖表比較月份或書籍類別，但公式參照必須正確。", challengeTask: "設計一個 8 列的借閱分析工作表，加入至少兩個函數、一條可向下複製的公式、一個絕對或混合參照，並選擇合適圖表回答一個管理問題。", challengeOutput: "工作表草圖、公式和圖表選擇理據。", criteria: ["公式參照可正確複製", "函數與所求結果相符", "圖表類型能回答指定問題"] },
    "cha-5": { asset: "schoolData", scenarioTitle: "以數據庫保存可檢索的記錄", scenario: "圖書館需要欄、記錄、主鍵和查詢；表單只是輸入介面，報告則把查詢結果整理成可閱讀格式。", challengeTask: "為校內器材借用設計一個單表數據庫：列出六個欄位及數據類型、選擇主鍵，再寫出兩個單表查詢要求及預期結果。", challengeOutput: "數據字典及兩條自然語言／SQL 查詢。", criteria: ["主鍵唯一、穩定且非空", "數據類型符合欄位內容", "查詢欄位和條件可由單表完成"] },
    "chb-1": { asset: "computerNetwork", scenarioTitle: "由零件到完整電腦系統", scenario: "處理器、RAM、儲存、輸入輸出裝置及匯流排共同工作；硬件選擇必須按工作需要比較速度、容量和用途。", challengeTask: "學校要購置一台剪片電腦。從 CPU／GPU、RAM、儲存和輸入輸出四方面提出規格，並以相同準則比較至少兩個選擇。", challengeOutput: "四項規格建議及 150 字選擇理據。", criteria: ["每項規格對應剪片需要", "能分辨 RAM 和非揮發性儲存", "比較使用一致而可量度的準則"] },
    "chb-2": { asset: "computerNetwork", scenarioTitle: "系統軟件協調共用資源", scenario: "操作系統、驅動程式和實用程式讓多個應用使用處理器、記憶體、儲存和周邊裝置；工作性質亦決定處理模式。", challengeTask: "把薪酬計算、網上報名、天氣站分析、影片轉碼和虛擬伺服器分配到合適處理模式，並為每項寫一個決定性情境特徵。", challengeOutput: "五行情境—模式—理據配對表。", criteria: ["模式名稱使用正確", "理據引用時限、工作量或資源特徵", "沒有把 multitasking 當成所有模式的統稱"] },
    "chc-1": { asset: "computerNetwork", scenarioTitle: "為電腦室選擇正確網絡硬件", scenario: "NIC、接達點、switch、router 和 modem／ONT 位於不同位置，各自負責接入、LAN 內轉送或連接不同網絡。", challengeTask: "為 24 台電腦、10 部平板及一台網絡打印機畫出校園電腦室網絡，標示所需硬件、傳輸媒介、LAN／WAN 邊界及一項可用性措施。", challengeOutput: "有標示的拓撲圖及 120 字設計說明。", criteria: ["硬件角色和連接位置正確", "有線與無線媒介選擇有理據", "能清楚分辨 LAN 和 WAN"] },
    "chc-2": { asset: "computerNetwork", scenarioTitle: "一次請求會經過多層協定", scenario: "裝置先取得網絡設定，再把域名解析成 IP；資料分段後經路由到伺服器，應用協定才完成登入或下載。", challengeTask: "由學生輸入校網網址開始，畫出六步時序，加入 DNS、IP、TCP、HTTP／HTTPS 及 router，並在每一步說明輸入和輸出。", challengeOutput: "六步時序圖或表格。", criteria: ["協定與任務正確配對", "次序能由名稱解析走到回應", "分清 IP 位址、域名和 URL"] },
    "chc-3": { asset: "computerNetwork", scenarioTitle: "服務體驗受網絡條件影響", scenario: "搜尋、串流、雲端及通訊服務都由客戶端向伺服器提出請求；頻寬、延遲、緩衝和資料可信性會改變體驗。", challengeTask: "比較直播課堂和下載錄影兩個情境，解釋頻寬、延遲、buffering 及壓縮的影響，並提出兩項改善直播體驗的方法。", challengeOutput: "比較表及兩項附因果說明的建議。", criteria: ["能分辨頻寬和延遲", "改善方法針對題目瓶頸", "同時考慮品質和傳送成本"] },
    "chc-4": { asset: "softwareWeb", scenarioTitle: "網頁結構、呈現與互動各有責任", scenario: "活動報名頁需要有語意的 HTML、跨頁一致 CSS、清楚表單標籤和不同裝置可用的版面。", challengeTask: "為校園活動設計一個可回應手機的報名頁 wireframe，標示 header、navigation、main、form 和 footer，再寫出三項無障礙或易用性決定。", challengeOutput: "桌面／手機 wireframe 及三項設計理據。", criteria: ["主要 HTML 結構語意正確", "手機版不依賴固定寬度", "表單標籤、焦點或錯誤訊息清楚"] },
    "chc-5": { asset: "computerNetwork", scenarioTitle: "保安依靠多層而非單一產品", scenario: "身份認證、加密、更新、防火牆、權限和備份分別處理不同風險；控制措施要配合威脅和資產。", challengeTask: "校網發現釣魚電郵、過期系統及未授權登入。為每項風險選擇預防、偵測及復原控制，並說明控制失效時的剩餘風險。", challengeOutput: "三項風險的多層控制矩陣。", criteria: ["控制與威脅有直接關係", "包含技術及使用者措施", "能指出備份不是阻止入侵的措施"] },
    "chd-1": { asset: "softwareWeb", scenarioTitle: "先把現實問題拆成可處理部分", scenario: "程式開發由使用者需要、限制及 IPO 出發；分解和抽象可把複雜情境變成可測試的子問題。", challengeTask: "分析午膳取餐排隊問題：列出使用者、三項功能要求、兩項限制、IPO，以及至少三個可獨立開發和測試的子問題。", challengeOutput: "一頁問題分析及 IPO 規格。", criteria: ["要求可測量而非空泛", "IPO 之間有資料流關係", "分解後子問題沒有重疊關鍵責任"] },
    "chd-2": { asset: "softwareWeb", scenarioTitle: "流程圖要能被逐步追蹤", scenario: "Sequence、selection 和 iteration 應由清楚條件連接；dry run 可檢查分支、更新及終止是否符合預期。", challengeTask: "設計一個重複輸入分數直至輸入 -1、拒絕不合法分數並輸出平均值的算法，再用正常、邊界和不合法數據各追蹤一次。", challengeOutput: "流程圖或偽代碼及三張追蹤表。", criteria: ["迴圈終止條件清楚", "不合法數據不會加入計算", "追蹤表顯示每次變數更新"] },
    "chd-3": { asset: "softwareWeb", scenarioTitle: "程式必須忠實實現算法", scenario: "變數、輸入輸出、條件、迴圈和函數要逐一對應設計；能執行只代表沒有立即停止，並不保證結果正確。", challengeTask: "把本課其中一個算法改寫成 Python，至少使用一個自訂函數、selection 和 iteration，並加入輸入檢查及三組測試輸出。", challengeOutput: "附註解的程式、測試數據及輸出截圖／文字。", criteria: ["程式結構對應算法", "輸入檢查不破壞正常流程", "測試包含正常、邊界和不合法數據"] },
    "chd-4": { asset: "softwareWeb", scenarioTitle: "測試要在執行前寫預期結果", scenario: "測試計劃先定義正常、邊界和不合法數據及 expected result；trace 和 debugger 再協助找出第一個偏差。", challengeTask: "為活動報名程式設計六個測試個案，最少各有兩個正常、邊界和不合法數據；加入預期結果、實際結果、通過／失敗和修正後重測欄。", challengeOutput: "完整測試表及一段除錯紀錄。", criteria: ["每組數據有具體預期結果", "邊界值正好位於規則前後", "失敗個案能連到修正和重測證據"] },
    "che-1": { asset: "schoolData", scenarioTitle: "新科技要由用途和限制評估", scenario: "感應器、AR、3D 打印和人工智能可改善學習或管理，但仍要考慮數據品質、硬件成本、準確度和人類監督。", challengeTask: "評估以 AI 分析圖書借閱並推薦書籍的方案：列出兩項效益、三項限制或風險、所需數據，以及一個必須由人決定的環節。", challengeOutput: "持份者評估表及有條件的建議結論。", criteria: ["效益和風險來自同一情境", "包括數據品質或偏差", "結論列明採用條件及人類監督"] },
    "che-2": { asset: "schoolData", scenarioTitle: "收集得到，不代表應該收集", scenario: "智能校園同時涉及人體工學、私隱同意、數碼鴻溝及演算法公平；便利性不能取代比例原則。", challengeTask: "學校計劃以平板和感應器記錄學習活動。從學生、教師和家長角度分析需要收集、可選擇及不應收集的資料，並提出四項保障。", challengeOutput: "三類數據清單、持份者分析及保障建議。", criteria: ["收集目的和資料項目相稱", "同意和拒絕機制具體", "同時處理私隱、共融或健康影響"] },
    "che-3": { asset: "schoolData", scenarioTitle: "數碼作品仍有作者和授權", scenario: "網站圖片、程式碼及軟件都有擁有者和使用條款；標示來源不一定等於已取得所需權利。", challengeTask: "為一個校園網站建立素材登記表，包含五項圖片／字款／程式庫，記錄作者、來源、授權、可否修改及署名要求，並替其中一項寫合規署名。", challengeOutput: "五項素材登記表及一個署名示例。", criteria: ["能分辨免費使用和公有領域", "授權條件與使用方式相符", "署名包含來源及授權資料"] },
    "ea-1": { asset: "relationalDatabase", scenarioTitle: "關聯表以鍵維持一致資料", scenario: "活動報名涉及學生、活動及報名三類實體；主鍵、外鍵、domain 和參照完整性阻止重複或不存在的關係。", challengeTask: "從活動報名情境找出三個實體，為每個實體列出屬性、候選鍵和主鍵，建立關係，並為 entity、domain、referential integrity 各寫一條規則。", challengeOutput: "關係綱要及三類完整性規則。", criteria: ["主鍵和候選鍵選擇合理", "外鍵方向及 cardinality 正確", "三類完整性規則沒有混淆"] },
    "ea-2": { asset: "relationalDatabase", scenarioTitle: "SQL 把關係轉成可用資訊", scenario: "查詢要先決定所需欄位、來源表、JOIN 條件和篩選，再處理排序、grouping、aggregate 或 subquery。", challengeTask: "為活動報名數據庫寫六個逐步查詢：基本 SELECT、WHERE／ORDER BY、aggregate、GROUP BY／HAVING、JOIN 及 subquery 各一，並寫出每條的預期結果。", challengeOutput: "六條 SQL、用途及結果摘要。", criteria: ["JOIN 條件對應主鍵／外鍵", "WHERE 和 HAVING 使用位置正確", "輸出欄位能回答指定問題"] },
    "ea-3": { asset: "relationalDatabase", scenarioTitle: "由重複表走到可維護設計", scenario: "把學生、活動及導師資料放在同一大表會造成更新、插入及刪除異常；functional dependency 指引拆表至 3NF。", challengeTask: "把一張含學生、活動、導師和報名資料的非正規化表逐步整理至 1NF、2NF、3NF，標示主鍵、外鍵和 functional dependency，再解釋一項反正規化取捨。", challengeOutput: "三階段關係綱要及 150 字設計解釋。", criteria: ["每次拆表有依賴理據", "最終關係仍能重建原有資料", "反正規化同時說明效能收益和一致性代價"] },
    "eb-1": { asset: "softwareWeb", scenarioTitle: "網絡服務共同支援校園網站", scenario: "客戶端會使用 DNS、DHCP、登入、檔案、代理、網頁及數據庫服務；每個服務有不同請求、回應和權限。", challengeTask: "為學校內聯網畫出 client、web、database、file、authentication、proxy／firewall 的架構，標示主要請求，並提出最小權限、備份及可用性措施。", challengeOutput: "服務架構圖及三項實施控制。", criteria: ["服務角色和資料流正確", "權限只開放工作所需", "可用性和保安措施能對應風險"] },
    "eb-2": { asset: "softwareWeb", scenarioTitle: "網頁應用是完整往返流程", scenario: "HTML／CSS 建立介面，client script 提供即時回應，server 必須重新驗證，再以受控方法讀寫數據庫及回傳結果。", challengeTask: "設計一個活動報名 web application：畫出 client—server—database 流程，列出 client 和 server 各自檢查，設計成功及錯誤回應，並說明 cookie 只保存甚麼。", challengeOutput: "流程圖、驗證表及一個介面 wireframe。", criteria: ["敏感驗證不只在 client 執行", "數據庫操作有清楚輸入和結果", "cookie 不保存密碼或不必要個人資料"] },
    "ec-1": { asset: "smartGreenhouse", scenarioTitle: "算法和資料結構按操作需要選擇", scenario: "排序狀態、資料規模及加入／移除方式會影響 linear／binary search、sorting、stack、queue 或 linked structure 的選擇。", challengeTask: "為圖書搜尋、打印工作、瀏覽返回、成績排序和動態播放清單各選一個演算法或資料結構，寫出核心操作、時間／結構優勢及一項限制。", challengeOutput: "五行情境選擇矩陣。", criteria: ["binary search 只用於已排序資料", "LIFO／FIFO 操作次序正確", "每項選擇同時包含優勢和限制"] },
    "ec-2": { asset: "smartGreenhouse", scenarioTitle: "程式由環境輸入控制實體輸出", scenario: "感應器提供輸入，事件或閾值觸發程式判斷，actuator 產生動作；異常值、超時及快速切換需要安全處理。", challengeTask: "設計溫室控制器：定義兩個 sensor input、風扇／水泵／警示燈的觸發條件、hysteresis、安全狀態和人工 override，再以四個情境追蹤輸出。", challengeOutput: "狀態／流程圖、偽代碼及四行情境追蹤表。", criteria: ["輸入—處理—輸出關係完整", "hysteresis 能避免頻繁切換", "感應器失效時進入明確安全狀態"] }
};

Object.entries(lessonVisualAssignments).forEach(([pageId, assignment]) => {
    const page = learningData.pages[pageId];
    const asset = lessonVisualAssets[assignment.asset];
    if (!page || !asset) return;
    page.visual = { ...asset, title: assignment.title, caption: assignment.caption, points: assignment.points };
});

Object.entries(layeredLearningAssignments).forEach(([pageId, assignment]) => {
    const page = learningData.pages[pageId];
    const scenarioAsset = scenarioMediaAssets[assignment.asset];
    if (!page || !scenarioAsset) return;
    const conceptNames = page.concepts.slice(0, 3).map(concept => concept.label).join("、");
    page.layeredLearning = {
        scenario: { ...scenarioAsset, title: assignment.scenarioTitle, caption: assignment.scenario },
        microLesson: {
            title: `90 秒圖像微課：${assignment.scenarioTitle}`,
            steps: page.concepts.slice(0, 4).map((concept, index) => ({
                kicker: `畫面 ${index + 1}`,
                icon: concept.icon,
                title: concept.label,
                body: concept.detail
            }))
        },
        levels: [
            {
                id: "foundation",
                label: "基礎層",
                tag: "先穩固概念",
                duration: "約 10 分鐘",
                goal: `能用自己的文字解釋 ${conceptNames}，並辨認一個生活例子。`,
                task: `觀看圖像微課後，選出三個核心概念，各用一句話解釋，再為其中一個概念寫一個與「${assignment.scenarioTitle}」有關的例子。`,
                output: "60–100 字概念筆記或三張概念卡。",
                criteria: ["至少正確解釋兩個核心概念", "例子與本課題直接相關", "沒有把本頁常見誤解寫成結論"]
            },
            {
                id: "exam",
                label: "應試層",
                tag: "把概念變成分數",
                duration: "約 20 分鐘",
                goal: "按題目指令詞，把知識寫成可逐點給分的 DSE 答案。",
                task: `先完成本頁 60 秒快速檢查及原創 DSE 題型，再按這項提示修訂答案：${page.examTip}`,
                output: "一份按分值列點的修訂答案，另寫一句說明自己改了甚麼。",
                criteria: ["首句直接回應題目指令詞", "每個獨立評分點分開表達", "答案引用情境資料或說明清楚因果"]
            },
            {
                id: "challenge",
                label: "挑戰層",
                tag: "整合真實情境",
                duration: "約 30 分鐘",
                goal: "把多個本課概念整合到一個設計、分析或評估任務。",
                task: assignment.challengeTask,
                output: assignment.challengeOutput,
                criteria: assignment.criteria
            }
        ]
    };
});

function freezeLearningData(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(freezeLearningData);
    return Object.freeze(value);
}

window.HKDSE_ICT_LEARNING = freezeLearningData(learningData);
