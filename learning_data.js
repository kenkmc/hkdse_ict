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
