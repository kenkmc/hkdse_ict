/**
 * 原創 DSE 題型題庫。
 *
 * 題目並非考評局歷屆試題。`topicId` 必須對應 course_data.js 的永久內容 id，
 * 讓下一階段的進度追蹤能以同一識別碼計算課題掌握度。
 */
const questionData = [
    {
        id: "q-a-a-001",
        topicId: "cha-1",
        syllabusRef: "A(a)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "某超級市場把每日交易記錄整理及分析後，得出『星期五晚的飲品銷量最高』。這項結果屬於甚麼？",
        options: [
            { value: "A", label: "原始數據" },
            { value: "B", label: "資訊" },
            { value: "C", label: "數據驗證" },
            { value: "D", label: "數據編碼" }
        ],
        answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出經處理並具有意義的結果是資訊。" }],
        explanation: "交易記錄是數據；經整理、分析並能支援決策的結果才是資訊。"
    },
    {
        id: "q-a-a-002",
        topicId: "cha-1",
        syllabusRef: "A(a)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "學校小食部保存每宗交易的貨品編號、數量和時間。系統其後產生『本週午膳時段最暢銷貨品』報告。解釋交易記錄與報告分別屬於數據還是資訊，並說明報告如何支援一項決策。",
        answer: "每宗未經整理的交易記錄是原始數據；報告是交易記錄經分類及統計後所得、具有意義的資訊。管理員可按最暢銷貨品增加訂貨量或安排存貨。",
        markingScheme: [
            { marks: 1, criterion: "指出個別交易記錄是尚未整理的原始數據。", anyOf: ["原始數據", "未經處理", "未經整理", "data"] },
            { marks: 1, criterion: "指出報告是數據經分類／統計後所得的有意義資訊。", anyOf: ["資訊", "分類", "統計", "處理", "information"] },
            { marks: 1, criterion: "提出一項與報告相關的合理決策，例如調整訂貨量或存貨。", anyOf: ["訂貨", "入貨", "存貨", "庫存", "供應", "補貨"] }
        ],
        explanation: "完整答案需要交代處理過程及資訊的用途，不能只把兩個名詞配對。"
    },
    {
        id: "q-a-b-001",
        topicId: "cha-2",
        syllabusRef: "A(b)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "說明數據有效性檢驗（validation）與數據驗證（verification）各自檢查甚麼。",
        answer: "有效性檢驗按預設規則檢查輸入是否合理；驗證把輸入與原始資料比較，檢查是否準確抄錄。",
        markingScheme: [
            { marks: 1, criterion: "有效性檢驗：按規則檢查數據是否合理／符合格式或範圍。", anyOf: ["規則", "合理", "格式", "範圍"] },
            { marks: 1, criterion: "驗證：把輸入與原始資料比較，檢查抄錄準確性。", anyOf: ["原始資料", "原始文件", "比對", "比較", "準確"] }
        ],
        explanation: "通過有效性檢驗不代表數據一定正確；例如合理的年齡仍可能與原始表格不符。"
    },
    {
        id: "q-a-b-002",
        topicId: "cha-2",
        syllabusRef: "A(b)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "網上活動報名表的名額欄 QUOTA 只接受 1 至 40 的整數。建議兩項合適的有效性檢驗，並指出一種可減少抄錄錯誤的數據驗證方法。",
        answer: "使用數據類型檢查，確保輸入是整數；使用範圍檢查，確保數值介乎 1 至 40；再以雙重輸入或與原始資料逐項比較來驗證輸入。",
        markingScheme: [
            { marks: 1, criterion: "數據類型檢查：QUOTA 必須是整數／數值。", anyOf: ["類型檢查", "數據類型", "整數", "數值", "type check"] },
            { marks: 1, criterion: "範圍檢查：QUOTA 必須在 1 至 40 之間。", anyOf: ["範圍檢查", "1 至 40", "1-40", "1 到 40", "range check"] },
            { marks: 1, criterion: "驗證：雙重輸入或把輸入與原始資料比較。", anyOf: ["雙重輸入", "輸入兩次", "原始資料", "原始文件", "比較", "核對"] }
        ],
        explanation: "有效性檢驗按規則拒絕不合理輸入；驗證則檢查輸入是否準確抄錄。"
    },
    {
        id: "q-a-c-001",
        topicId: "cha-3",
        syllabusRef: "A(c)",
        difficulty: "foundation",
        marks: 1,
        type: "short-answer",
        question: "把十進制整數 45 轉換成二進制。",
        answer: "101101",
        acceptedAnswers: ["101101", "00101101"],
        markingScheme: [{ marks: 1, criterion: "正確答案：101101₂。" }],
        explanation: "45 = 32 + 8 + 4 + 1，所以相應位元為 101101。"
    },
    {
        id: "q-a-c-002",
        topicId: "cha-3",
        syllabusRef: "A(c)",
        difficulty: "advanced",
        marks: 2,
        type: "short-answer",
        question: "以 8-bit 二進制補碼表示十進制整數 −18。",
        answer: "11101110",
        acceptedAnswers: ["11101110"],
        markingScheme: [
            { marks: 1, criterion: "+18 的 8-bit 表示為 00010010，反轉位元後加 1。", anyOf: ["00010010", "反轉", "取反", "加1", "加 1"] },
            { marks: 1, criterion: "最終答案為 11101110。", anyOf: ["11101110"] }
        ],
        explanation: "+18 = 00010010；位元反轉得 11101101，再加 1 得 11101110。"
    },
    {
        id: "q-a-c-003",
        topicId: "cha-3",
        syllabusRef: "A(c)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "一幅未壓縮點陣圖的解像度為 800 × 600，每像素使用 24 bit。計算圖像的檔案大小（以 byte 表示），並說明色彩深度增至 48 bit、解像度不變時，檔案大小有何變化。",
        answer: "800 × 600 × 24 ÷ 8 = 1,440,000 byte。色彩深度由 24 bit 加倍至 48 bit，所以每像素位元數加倍，未壓縮檔案大小亦加倍。",
        markingScheme: [
            { marks: 1, criterion: "使用寬 × 高 × 色彩深度計算總位元，再除以 8。", anyOf: ["800", "600", "24", "除以 8", "÷ 8", "/ 8"] },
            { marks: 1, criterion: "正確答案為 1,440,000 byte。", anyOf: ["1440000", "1,440,000"] },
            { marks: 1, criterion: "色彩深度加倍令每像素位元數及未壓縮大小加倍。", anyOf: ["加倍", "兩倍", "2 倍", "2倍", "每像素"] }
        ],
        explanation: "點陣圖未壓縮大小 = 像素數 × 每像素位元數；bit 轉 byte 要除以 8。"
    },
    {
        id: "q-a-d-sheet-001",
        topicId: "cha-4",
        syllabusRef: "A(d)",
        difficulty: "foundation",
        marks: 1,
        type: "short-answer",
        question: "寫出試算表公式，計算 B2 至 B6 的總和。",
        answer: "=SUM(B2:B6)",
        acceptedAnswers: ["=SUM(B2:B6)"],
        markingScheme: [{ marks: 1, criterion: "使用 SUM 函數及正確範圍 B2:B6。" }],
        explanation: "冒號表示由 B2 至 B6 的連續儲存格範圍。"
    },
    {
        id: "q-a-d-sheet-002",
        topicId: "cha-4",
        syllabusRef: "A(d)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "C2 的公式是 =A2*$F$1。把公式複製到 C3 後，公式會變成甚麼？",
        answer: "=A3*$F$1",
        acceptedAnswers: ["=A3*$F$1"],
        markingScheme: [
            { marks: 1, criterion: "相對參照 A2 隨列移動成 A3。", anyOf: ["A3"] },
            { marks: 1, criterion: "絕對參照 $F$1 保持不變。", anyOf: ["$F$1"] }
        ],
        explanation: "A2 是相對參照；$F$1 的欄和列都被鎖定。"
    },
    {
        id: "q-a-d-sheet-003",
        topicId: "cha-4",
        syllabusRef: "A(d)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "工作表以 B2 儲存學生分數，F1 儲存及格分數。寫出可複製至 C3:C101 的 C2 公式，及在 C102 計算『Pass』總數的公式。",
        answer: "C2：=IF(B2>=$F$1,\"Pass\",\"Fail\")；C102：=COUNTIF(C2:C101,\"Pass\")。",
        markingScheme: [
            { marks: 1, criterion: "C2 使用 IF 比較 B2 與及格分數。", anyOf: ["IF", "B2", ">="] },
            { marks: 1, criterion: "以絕對參照 $F$1 鎖定及格分數。", anyOf: ["$F$1"] },
            { marks: 1, criterion: "C102 使用 COUNTIF 計算 C2:C101 中的 Pass。", anyOf: ["COUNTIF", "C2:C101", "Pass"] }
        ],
        explanation: "B2 應隨列數改變；及格標準 F1 必須鎖定。COUNTIF 則按文字條件計算符合的儲存格。"
    },
    {
        id: "q-a-d-db-001",
        topicId: "cha-5",
        syllabusRef: "A(d)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "以下哪一項是主關鍵碼（primary key）的必要特性？",
        options: [
            { value: "A", label: "可以包含重複值" },
            { value: "B", label: "每個值必須唯一，而且不可為空值" },
            { value: "C", label: "只可使用文字數據類型" },
            { value: "D", label: "必須同時出現在另一個數據表" }
        ],
        answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出主關鍵碼須唯一且不可為 NULL。" }],
        explanation: "主關鍵碼用來唯一識別每筆記錄，因此不可重複或留空。"
    },
    {
        id: "q-a-d-db-002",
        topicId: "cha-5",
        syllabusRef: "A(d)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "圖書館以 BORROW(LoanID, StudentID, BookID, Returned) 記錄借書，每名學生可借多本書。解釋 StudentID 為何不適合作主關鍵碼，指出較合適的主關鍵碼，並寫出 SQL 顯示所有尚未還書記錄的 StudentID 和 BookID。",
        answer: "StudentID 可在同一學生借多本書時重複，因此不能唯一識別記錄；LoanID 較適合作主關鍵碼。SQL：SELECT StudentID, BookID FROM BORROW WHERE Returned = 'No';",
        markingScheme: [
            { marks: 1, criterion: "指出 StudentID 可能重複，不能唯一識別每筆借書記錄。", anyOf: ["重複", "不唯一", "不能唯一", "多本"] },
            { marks: 1, criterion: "選擇 LoanID 作主關鍵碼。", anyOf: ["LoanID", "loan id"] },
            { marks: 1, criterion: "SELECT StudentID, BookID FROM BORROW。", anyOf: ["SELECT StudentID, BookID", "SELECT StudentID,BookID", "FROM BORROW"] },
            { marks: 1, criterion: "WHERE Returned = 'No'。", anyOf: ["WHERE", "Returned", "No"] }
        ],
        explanation: "主關鍵碼必須唯一；簡單 SELECT 查詢要依次處理輸出欄、來源表及篩選條件。"
    },
    {
        id: "q-b-a-memory-001",
        topicId: "chb-1",
        syllabusRef: "B(a)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "電腦關機後，以下哪項的內容通常會消失？",
        options: [
            { value: "A", label: "RAM" },
            { value: "B", label: "ROM" },
            { value: "C", label: "SSD" },
            { value: "D", label: "光碟" }
        ],
        answer: "A",
        markingScheme: [{ marks: 1, criterion: "指出一般 RAM 是揮發性記憶體。" }],
        explanation: "一般 RAM 需要持續供電才能保存內容；ROM、SSD 和光碟均屬非揮發性。"
    },
    {
        id: "q-b-a-cycle-001",
        topicId: "chb-1",
        syllabusRef: "B(a)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "某程式正在單一處理器上運行。依次指出擷取—解碼—執行周期的三個階段，並說明控制單元和算術邏輯單元各自的一項作用。",
        answer: "處理器先從主記憶體擷取指令，然後由控制單元解碼指令，最後執行指令。控制單元解釋指令並發出控制訊號協調部件；算術邏輯單元進行所需的算術或邏輯運算。",
        markingScheme: [
            { marks: 1, criterion: "按正確次序寫出擷取、解碼、執行。", anyOf: ["擷取", "解碼", "執行", "fetch", "decode", "execute"] },
            { marks: 1, criterion: "指出擷取是從主記憶體取得指令。", anyOf: ["主記憶體", "記憶體", "RAM", "取得指令", "讀取指令"] },
            { marks: 1, criterion: "控制單元解碼／解釋指令並發出控制訊號。", anyOf: ["控制單元", "解碼", "控制訊號", "協調"] },
            { marks: 1, criterion: "算術邏輯單元進行算術或邏輯運算。", anyOf: ["算術邏輯單元", "ALU", "算術", "邏輯運算"] }
        ],
        explanation: "完整答案要同時交代三個階段的次序及兩個 CPU 部件的不同角色。"
    },
    {
        id: "q-b-a-device-001",
        topicId: "chb-1",
        syllabusRef: "B(a)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "自然保護區需要在無人值守的山坡自動收集溫度，每分鐘傳送一次讀數。建議一種合適的輸入裝置，並說明兩項選擇理由。",
        answer: "使用溫度感應器。感應器可把環境溫度自動轉成數據輸入，毋須人手量度；亦可按固定時間連續收集讀數，減少抄錄錯誤。",
        markingScheme: [
            { marks: 1, criterion: "建議溫度感應器。", anyOf: ["溫度感應器", "溫度傳感器", "temperature sensor"] },
            { marks: 1, criterion: "可自動感測／輸入環境溫度，毋須人手。", anyOf: ["自動", "感測", "無人", "毋須人手", "不用人手"] },
            { marks: 1, criterion: "可連續／定時收集，或減少人手抄錄錯誤。", anyOf: ["連續", "定時", "每分鐘", "抄錄錯誤", "準確"] }
        ],
        explanation: "輸入裝置題須把裝置特性連結到所收集的數據類型和工作環境。"
    },
    {
        id: "q-b-b-driver-001",
        topicId: "chb-2",
        syllabusRef: "B(b)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "安裝新打印機時，驅動程式的主要作用是甚麼？",
        options: [
            { value: "A", label: "替使用者撰寫文件" },
            { value: "B", label: "讓操作系統與指定打印機溝通及控制它" },
            { value: "C", label: "永久增加打印機的紙張容量" },
            { value: "D", label: "把所有檔案上載到互聯網" }
        ],
        answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出驅動程式讓操作系統與指定硬件溝通／控制硬件。" }],
        explanation: "驅動程式把操作系統的要求轉化成指定硬件可理解的控制方式。"
    },
    {
        id: "q-b-b-mode-002",
        topicId: "chb-2",
        syllabusRef: "B(b)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "防毒軟件有兩種掃描：模式 X 在程式開啟前立即檢查該檔案；模式 Y 每晚 2 時把當日新增的檔案一次掃描。分別指出 X 和 Y 的操作模式，並各以一項情境資料解釋。",
        answer: "X 是實時處理，因為它在程式開啟事件發生時必須立即檢查和回應。Y 是批次處理，因為檔案先累積，然後在預定時間一次處理。",
        markingScheme: [
            { marks: 1, criterion: "指出 X 是實時處理。", anyOf: ["X 是實時", "X為實時", "real-time", "real time"] },
            { marks: 1, criterion: "解釋 X 在程式開啟時須立即檢查／回應。", anyOf: ["立即", "即時", "開啟前", "事件", "回應"] },
            { marks: 1, criterion: "指出 Y 是批次處理。", anyOf: ["Y 是批次", "Y為批次", "batch"] },
            { marks: 1, criterion: "解釋 Y 把工作累積至預定時間才一次處理。", anyOf: ["累積", "預定", "排程", "每晚", "一次處理"] }
        ],
        explanation: "實時處理的關鍵是規定時限內回應事件；批次處理的關鍵是先累積同類工作再集中處理。"
    },
    {
        id: "q-b-b-mode-003",
        topicId: "chb-2",
        syllabusRef: "B(b)",
        difficulty: "advanced",
        marks: 3,
        type: "short-answer",
        question: "一間公司在一部實體伺服器上同時運行數個彼此隔離的虛擬伺服器。指出所用的操作模式，並說明兩項好處。",
        answer: "這是虛擬化。它可讓多個獨立虛擬環境共享同一部實體電腦的資源，提高硬件使用率；亦可隔離不同服務，方便測試、管理或復原。",
        markingScheme: [
            { marks: 1, criterion: "指出操作模式是虛擬化。", anyOf: ["虛擬化", "virtualisation", "virtualization"] },
            { marks: 1, criterion: "多個虛擬環境共享實體硬件，提高資源使用率／減少硬件數目。", anyOf: ["共享", "使用率", "硬件數目", "成本", "資源"] },
            { marks: 1, criterion: "指出隔離服務、方便測試／管理／復原等合理好處。", anyOf: ["隔離", "測試", "管理", "復原", "備份", "獨立"] }
        ],
        explanation: "虛擬化把實體資源抽象成多個隔離環境；答案要說明共享資源和隔離帶來的實際效果。"
    },
    {
        id: "q-c-a-network-001",
        topicId: "chc-1",
        syllabusRef: "C(a)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "學校需要把校內 LAN 連接到互聯網。主要應使用哪種網絡連接裝置？",
        options: [
            { value: "A", label: "路由器（router）" },
            { value: "B", label: "網絡介面卡（NIC）" },
            { value: "C", label: "打印機" },
            { value: "D", label: "掃描器" }
        ],
        answer: "A",
        markingScheme: [{ marks: 1, criterion: "路由器負責在不同網絡之間轉送封包。" }],
        explanation: "交換器通常連接同一 LAN 內的裝置；路由器連接不同網絡。"
    },
    {
        id: "q-c-a-network-002",
        topicId: "chc-1",
        syllabusRef: "C(a)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "某電腦室以網絡線把多部桌面電腦接入同一 LAN。分別說明網絡介面卡（NIC）和交換器的主要功能。",
        answer: "NIC 為每部電腦提供網絡介面以傳送及接收數據；交換器連接同一 LAN 內多部裝置，並把訊框轉送至合適連接埠。",
        markingScheme: [
            { marks: 1, criterion: "NIC：讓電腦接入網絡並傳送／接收網絡數據。", anyOf: ["網絡介面", "接入網絡", "傳送", "接收"] },
            { marks: 1, criterion: "交換器：連接同一 LAN 內的裝置並轉送訊框。", anyOf: ["同一 LAN", "同一局部區域網絡", "連接多部", "轉送", "連接埠"] }
        ],
        explanation: "硬件功能題應寫出連接對象及數據處理作用，而不只是寫『用來上網』。"
    },
    {
        id: "q-c-a-network-003",
        topicId: "chc-1",
        syllabusRef: "C(a)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "學校圖書館讓學生使用平板電腦接入校內 LAN。建議一種合適的網絡裝置，並說明一項與平板電腦使用情境相關的理由。",
        answer: "使用無線接達點（AP），讓平板透過 Wi-Fi 接入有線 LAN，學生毋須接駁固定網絡線並可在覆蓋範圍內移動。",
        markingScheme: [
            { marks: 1, criterion: "建議無線接達點（AP）。", anyOf: ["無線接達點", "無線接入點", "AP", "access point"] },
            { marks: 1, criterion: "指出以無線方式接入 LAN，讓平板毋須固定接線／可移動使用。", anyOf: ["Wi-Fi", "無線", "毋須網絡線", "不用網絡線", "移動", "流動"] }
        ],
        explanation: "答案要把 AP 的無線接入功能連結到平板裝置的流動使用需要。"
    },
    {
        id: "q-c-a-network-004",
        topicId: "chc-1",
        syllabusRef: "C(a)",
        difficulty: "advanced",
        marks: 3,
        type: "short-answer",
        question: "某學校經常進行多班同步視像會議。比較光纖和流動網絡，建議較合適的主要互聯網連接方法，並說明兩項理由。",
        answer: "建議光纖；它通常有較高頻寬，可支援多路視像傳輸，而且固定線路較少受無線覆蓋、用戶量或干擾影響，連線一般較穩定。",
        markingScheme: [
            { marks: 1, criterion: "在題目情境下建議光纖。", anyOf: ["光纖", "fibre", "fiber"] },
            { marks: 1, criterion: "比較速度／頻寬，並連結多路視像傳輸需要。", anyOf: ["頻寬", "速度", "多路", "視像", "video"] },
            { marks: 1, criterion: "比較穩定性／可用性，指出較少受覆蓋、負載或無線干擾影響。", anyOf: ["穩定", "覆蓋", "負載", "用戶量", "干擾"] }
        ],
        explanation: "建議題要先作選擇，再以相同準則比較選項，理由亦須回應題目的服務需要。"
    },
    {
        id: "q-c-a-dns-001",
        topicId: "chc-2",
        syllabusRef: "C(a)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "說明 DNS 在使用者瀏覽網站時的主要功能。",
        answer: "DNS 把人類易讀的網域名稱解析成相應的 IP 位址，讓裝置找到目標伺服器。",
        markingScheme: [
            { marks: 1, criterion: "指出輸入是網域名稱。", anyOf: ["網域名稱", "域名", "domain"] },
            { marks: 1, criterion: "指出 DNS 解析／轉換成 IP 位址。", anyOf: ["IP位址", "IP 位址", "IP地址", "解析", "轉換"] }
        ],
        explanation: "DNS 提供名稱解析；實際連線仍由網絡協定按所得 IP 位址完成。"
    },
    {
        id: "q-c-a-https-001",
        topicId: "chc-2",
        syllabusRef: "C(a)",
        difficulty: "standard",
        marks: 1,
        type: "mcq",
        question: "與 HTTP 相比，HTTPS 主要額外提供甚麼？",
        options: [
            { value: "A", label: "保證網頁內容完全正確" },
            { value: "B", label: "以 TLS 加密傳輸，並可驗證伺服器身分" },
            { value: "C", label: "令所有下載速度加倍" },
            { value: "D", label: "隱藏網站的 IP 位址" }
        ],
        answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出加密傳輸及／或伺服器身分驗證。" }],
        explanation: "HTTPS 保護傳輸中的資料，但不代表網站內容本身必然真確或安全。"
    },
    {
        id: "q-c-a-url-001",
        topicId: "chc-2",
        syllabusRef: "C(a)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "某學習網站的 URL 是 https://learn.example.edu.hk/notes/unit1.html。指出所用協定、網域名稱及路徑，並說明 DNS 在瀏覽此網站時的功能。",
        answer: "協定是 HTTPS；網域名稱是 learn.example.edu.hk；路徑是 /notes/unit1.html；DNS 把網域名稱解析成相應的 IP 位址，讓裝置找到網站伺服器。",
        markingScheme: [
            { marks: 1, criterion: "協定：HTTPS。", anyOf: ["HTTPS", "https"] },
            { marks: 1, criterion: "網域名稱：learn.example.edu.hk。", anyOf: ["learn.example.edu.hk"] },
            { marks: 1, criterion: "路徑：/notes/unit1.html。", anyOf: ["/notes/unit1.html", "notes/unit1.html"] },
            { marks: 1, criterion: "DNS 把網域名稱解析成相應 IP 位址。", anyOf: ["網域名稱", "域名", "解析", "IP 位址", "IP地址"] }
        ],
        explanation: "URL 各部分負責指出協定、主機及資源位置；DNS 只負責名稱解析，不會傳送整個網頁。"
    },
    {
        id: "q-c-b-stream-001",
        topicId: "chc-3",
        syllabusRef: "C(b)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "關於互聯網串流，以下哪項描述最合適？",
        options: [
            { value: "A", label: "必須下載完整媒體檔案後才可播放" },
            { value: "B", label: "接收部分數據並建立緩衝後可開始播放" },
            { value: "C", label: "播放後一定不需要網絡連線" },
            { value: "D", label: "串流會令原始檔案自動變成文字" }
        ],
        answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出串流可在接收部分數據並建立緩衝後開始播放。" }],
        explanation: "串流讓媒體數據一邊傳送一邊播放；若傳送速度長期低於播放所需速度，仍可能停頓。"
    },
    {
        id: "q-c-b-search-002",
        topicId: "chc-3",
        syllabusRef: "C(b)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "學生搜尋『人工智能對學習的影響』，找到一篇沒有作者、沒有發布日期而且只推銷課程的網誌。指出兩項令來源可信性成疑的資料，並建議兩個改善搜尋／核實的方法。",
        answer: "可信性問題包括沒有可核實作者或機構、沒有日期，以及內容有明顯商業推廣目的。可改用更具體關鍵字和 site: 等條件搜尋教育或研究機構資料，並以另一個可靠來源交叉核實主要論點和數據。",
        markingScheme: [
            { marks: 1, criterion: "指出沒有具名／可核實作者或機構。", anyOf: ["沒有作者", "不知作者", "作者不明", "機構不明", "權威"] },
            { marks: 1, criterion: "指出沒有日期／內容可能過時，或有明顯商業推廣目的。", anyOf: ["沒有日期", "過時", "商業", "推銷", "偏見", "利益"] },
            { marks: 1, criterion: "改善查詢，例如使用更具體關鍵字、詞組或網站／日期篩選。", anyOf: ["具體關鍵字", "引號", "詞組", "site:", "篩選", "日期"] },
            { marks: 1, criterion: "以另一個可靠來源／原始證據交叉核實。", anyOf: ["交叉", "核實", "另一來源", "其他來源", "原始資料", "證據"] }
        ],
        explanation: "來源分析應同時評估權威、時效、證據和目的；改善策略亦要說明如何收窄或核實資料。"
    },
    {
        id: "q-c-b-service-001",
        topicId: "chc-3",
        syllabusRef: "C(b)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "學校技術員在家透過互聯網控制校內伺服器，並把修正後的設定檔傳回伺服器。分別指出這兩項工作使用的互聯網服務，並說明一項保安考慮。",
        answer: "遙距控制伺服器使用遠端登入；傳回設定檔使用檔案傳送服務。連線應採用加密協定／VPN 和強身分認證，避免登入資料或設定被截取及未授權存取。",
        markingScheme: [
            { marks: 1, criterion: "控制遠端伺服器：遠端登入。", anyOf: ["遠端登入", "遙距登入", "remote login", "SSH"] },
            { marks: 1, criterion: "傳回設定檔：檔案傳送。", anyOf: ["檔案傳送", "文件傳送", "file transfer", "SFTP", "FTP"] },
            { marks: 1, criterion: "合理保安考慮，例如加密連線、VPN 或強身分認證，並連結截取／未授權風險。", anyOf: ["加密", "VPN", "認證", "密碼", "截取", "未授權", "SSH", "SFTP"] }
        ],
        explanation: "服務配對要按工作目的；涉及遠端管理時，還要保護認證資料和傳輸內容。"
    },
    {
        id: "q-c-c-html-001",
        topicId: "chc-4",
        syllabusRef: "C(c)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "HTML 在網頁中的主要作用是甚麼？",
        options: [
            { value: "A", label: "描述網頁內容的結構和元素" },
            { value: "B", label: "保證所有資料已經加密" },
            { value: "C", label: "取代互聯網服務供應商" },
            { value: "D", label: "自動判斷所有內容是否真確" }
        ],
        answer: "A",
        markingScheme: [{ marks: 1, criterion: "指出 HTML 用來描述網頁內容結構／元素。" }],
        explanation: "HTML 描述標題、段落、連結、表格和多媒體等結構；CSS 通常控制視覺樣式。"
    },
    {
        id: "q-c-c-design-002",
        topicId: "chc-4",
        syllabusRef: "C(c)",
        difficulty: "standard",
        marks: 4,
        type: "short-answer",
        question: "學校為長者製作健康資訊網站。現時頁面使用 10 px 淺灰文字、只有圖示的導覽按鈕，而且圖片沒有替代文字。建議兩項設計改善，並分別解釋如何回應目標受眾。",
        answer: "增加字體大小並提高文字與背景的顏色對比，令視力較弱的使用者較易閱讀；為導覽按鈕加入清楚文字標籤，以及為有資訊作用的圖片加入合適 alt 文字，讓受眾和屏幕閱讀器能理解功能／內容。",
        markingScheme: [
            { marks: 1, criterion: "建議增加字體大小及／或提高顏色對比。", anyOf: ["增加字體", "放大字體", "字體大小", "提高對比", "高對比", "顏色對比"] },
            { marks: 1, criterion: "解釋令長者／視力較弱使用者較易閱讀。", anyOf: ["長者", "視力", "易閱讀", "看清", "可讀"] },
            { marks: 1, criterion: "建議為圖示導覽加入文字標籤，或為圖片加入替代文字。", anyOf: ["文字標籤", "描述性", "替代文字", "alt", "導覽文字"] },
            { marks: 1, criterion: "解釋可清楚傳達連結／圖片用途，並支援屏幕閱讀器或不熟悉圖示的受眾。", anyOf: ["屏幕閱讀器", "讀屏", "理解", "用途", "不熟悉", "無障礙"] }
        ],
        explanation: "每項設計建議都要連結目標受眾的實際需要；只寫『美觀』不能完整解釋可用性。"
    },
    {
        id: "q-c-c-publish-001",
        topicId: "chc-4",
        syllabusRef: "C(c)",
        difficulty: "standard",
        marks: 3,
        type: "short-answer",
        question: "學生的首頁在自己電腦可正常顯示圖片，但上載到 Web 伺服器後圖片消失。提出一個可能原因，並寫出兩項發布前後的檢查。",
        answer: "可能原因是圖片沒有一同上載，或 HTML 使用了錯誤／只在本機有效的檔案路徑。應確認所有圖片按正確資料夾結構上載並使用相對路徑；再以公開網址在不同瀏覽器／裝置測試圖片、超連結和導覽。",
        markingScheme: [
            { marks: 1, criterion: "指出圖片未上載、大小寫不符或檔案／相對路徑錯誤等合理原因。", anyOf: ["未上載", "沒有上載", "路徑", "相對路徑", "大小寫", "檔名"] },
            { marks: 1, criterion: "核對並上載所有資源，保持正確資料夾結構／相對路徑。", anyOf: ["所有檔案", "所有圖片", "資料夾", "相對路徑", "上載"] },
            { marks: 1, criterion: "使用公開網址測試圖片、連結／導覽，並可在不同瀏覽器或裝置檢查。", anyOf: ["公開網址", "測試", "連結", "導覽", "瀏覽器", "裝置"] }
        ],
        explanation: "本機絕對路徑不會在 Web 伺服器上自動存在；網站發布必須連同資源和正確相對路徑一起測試。"
    },
    {
        id: "q-c-d-threat-001",
        topicId: "chc-5",
        syllabusRef: "C(d)",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "某惡意程式偽裝成免費遊戲，誘使用者安裝後開啟後門。它最符合哪一類？",
        options: [
            { value: "A", label: "木馬程式" },
            { value: "B", label: "防火牆" },
            { value: "C", label: "數碼證書" },
            { value: "D", label: "數據壓縮程式" }
        ],
        answer: "A",
        markingScheme: [{ marks: 1, criterion: "指出偽裝成合法／吸引程式的惡意程式是木馬。" }],
        explanation: "木馬以看似有用的軟件欺騙使用者執行；它本身不以自我複製作為必要特徵。"
    },
    {
        id: "q-c-d-access-002",
        topicId: "chc-5",
        syllabusRef: "C(d)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "網上校務系統先要求教師輸入密碼和一次性驗證碼，再只容許班主任修改自己班的成績。分別指出哪一部分屬認證和授權。",
        answer: "密碼和一次性驗證碼用來確認教師身分，屬認證；限制班主任只可修改自己班的成績，是決定已確認使用者權限，屬授權。",
        markingScheme: [
            { marks: 1, criterion: "密碼＋一次性驗證碼確認身分，屬認證。", anyOf: ["認證", "確認身分", "核實身分", "authentication"] },
            { marks: 1, criterion: "限制可修改的班別／資源屬授權。", anyOf: ["授權", "權限", "自己班", "authorization", "authorisation"] }
        ],
        explanation: "認證回答『你是誰』；授權回答『已確認身分後你可以做甚麼』。"
    },
    {
        id: "q-c-d-security-003",
        topicId: "chc-5",
        syllabusRef: "C(d)",
        difficulty: "advanced",
        marks: 5,
        type: "short-answer",
        question: "職員在公共 Wi-Fi 遙距存取公司的客戶資料庫。建議兩項不同的保安措施，分別解釋如何減低傳輸被截取及未授權存取的風險，並說明防火牆在此情境的一項作用。",
        answer: "使用 VPN 加密職員裝置與公司網絡之間的傳輸，截取者即使取得封包亦難以閱讀內容；使用多因素認證，例如密碼加保安令牌／一次性驗證碼，減低密碼外洩後被冒認登入的風險。防火牆可按來源、目的地、服務或連接狀態規則過濾流量，封鎖未獲准的連線。",
        markingScheme: [
            { marks: 1, criterion: "建議使用 VPN／加密連線。", anyOf: ["VPN", "加密", "虛擬私人網絡", "virtual private network"] },
            { marks: 1, criterion: "解釋截取者取得數據後仍難以讀取明文。", anyOf: ["截取", "密文", "不能閱讀", "難以閱讀", "竊聽", "eavesdrop"] },
            { marks: 1, criterion: "建議多因素認證，例如密碼加令牌／OTP／生物特徵。", anyOf: ["多因素", "雙重認證", "2FA", "OTP", "一次性", "令牌", "生物"] },
            { marks: 1, criterion: "解釋第二因素減低密碼外洩後被冒認登入的風險。", anyOf: ["密碼外洩", "冒認", "未授權", "第二因素", "另一因素"] },
            { marks: 1, criterion: "防火牆按規則過濾網絡流量並封鎖未獲准連線。", anyOf: ["防火牆", "過濾", "流量", "規則", "封鎖", "未獲准"] }
        ],
        explanation: "高分保安答案要讓每項措施對應一個風險；VPN 保護傳輸、MFA 加強登入、防火牆控制網絡連線。"
    },
    {
        id: "q-c-d-pki-001",
        topicId: "tool-pki-lab",
        syllabusRef: "C(d)",
        difficulty: "standard",
        marks: 2,
        type: "short-answer",
        question: "Alice 要數碼簽署一份文件。她使用哪一條密碼匙簽署？Bob 又使用哪一條密碼匙驗證？",
        answer: "Alice 使用自己的私人密碼匙簽署；Bob 使用 Alice 的公開密碼匙驗證。",
        markingScheme: [
            { marks: 1, criterion: "Alice 使用自己的私人密碼匙簽署。", anyOf: ["私人密碼匙", "私鑰", "private key"] },
            { marks: 1, criterion: "Bob 使用 Alice 的公開密碼匙驗證。", anyOf: ["公開密碼匙", "公鑰", "public key"] }
        ],
        explanation: "數碼簽署用來檢查來源及完整性，不會自動把文件內容保密。"
    },
    {
        id: "q-ea-sql-001",
        topicId: "tool-sql-simulator",
        syllabusRef: "Elective A",
        difficulty: "standard",
        marks: 3,
        type: "sql",
        question: "資料表 STUDENT(SID, SName, SClass)。寫出 SQL，顯示所有 5A 班學生的姓名。",
        answer: "SELECT SName FROM STUDENT WHERE SClass = '5A';",
        acceptedAnswers: [
            "SELECT SName FROM STUDENT WHERE SClass = '5A';",
            "SELECT SName FROM STUDENT WHERE SClass='5A'"
        ],
        markingScheme: [
            { marks: 1, criterion: "SELECT 正確欄位 SName。", anyOf: ["SELECTSNAME"] },
            { marks: 1, criterion: "FROM 正確資料表 STUDENT。", anyOf: ["FROMSTUDENT"] },
            { marks: 1, criterion: "WHERE 條件正確：SClass = '5A'。", anyOf: ["WHERESCLASS='5A'", "WHERESCLASS=\"5A\""] }
        ],
        explanation: "SELECT 決定輸出欄位，FROM 指定資料表，WHERE 篩選 5A 班記錄。"
    },
    {
        id: "q-d-python-001",
        topicId: "tool-python-converter",
        syllabusRef: "Core D / Elective C",
        difficulty: "foundation",
        marks: 1,
        type: "mcq",
        question: "以下 Python 程式輸出甚麼？",
        questionCode: "for i in range(1, 4):\n    print(i, end=' ')",
        options: [
            { value: "A", label: "1 2 3" },
            { value: "B", label: "1 2 3 4" },
            { value: "C", label: "0 1 2 3" },
            { value: "D", label: "程式不會停止" }
        ],
        answer: "A",
        markingScheme: [{ marks: 1, criterion: "指出 range 的終止值 4 不會包括在序列內。" }],
        explanation: "range(1, 4) 依次產生 1、2、3，不包括 4。"
    }
];

questionData.forEach(question => Object.freeze(question));
Object.freeze(questionData);
window.HKDSE_ICT_QUESTIONS = questionData;
