/**
 * 原創 DSE 題型題庫。
 *
 * 題目均為自行編寫。`topicId` 必須對應 course_data.js 的永久內容 id，
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
        id: "q-d-a-ipo-001",
        topicId: "chd-1", syllabusRef: "D(a)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "程式輸入五個分數，計算平均值並顯示『Pass／Fail』。以下哪項屬於處理（process）？",
        options: [{ value: "A", label: "五個分數" }, { value: "B", label: "計算平均值並與及格線比較" }, { value: "C", label: "顯示 Pass／Fail" }, { value: "D", label: "鍵盤" }], answer: "B",
        markingScheme: [{ marks: 1, criterion: "指出計算及比較規則屬處理。" }], explanation: "分數是輸入，計算和比較是處理，Pass／Fail 是輸出。"
    },
    {
        id: "q-d-a-analysis-002",
        topicId: "chd-1", syllabusRef: "D(a)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "學校要建立程式，輸入學生身高（m）和體重（kg），計算 BMI，並顯示 BMI 值和健康分類。分別指出輸入、兩項處理及輸出。",
        answer: "輸入是身高和體重。處理包括以體重除以身高平方計算 BMI，以及按指定範圍把 BMI 分類。輸出是 BMI 值和健康分類。",
        markingScheme: [
            { marks: 1, criterion: "輸入：身高和體重。", anyOf: ["身高", "體重"] },
            { marks: 1, criterion: "處理：BMI = 體重 ÷ 身高²。", anyOf: ["體重", "身高平方", "BMI", "除"] },
            { marks: 1, criterion: "處理：按範圍／條件判斷健康分類。", anyOf: ["範圍", "條件", "分類", "比較"] },
            { marks: 1, criterion: "輸出：BMI 值和健康分類。", anyOf: ["BMI 值", "BMI值", "健康分類"] }
        ], explanation: "IPO 分析要把輸入資料、計算／判斷規則及結果分開。"
    },
    {
        id: "q-d-a-decompose-001",
        topicId: "chd-1", syllabusRef: "D(a)", difficulty: "standard", marks: 3, type: "short-answer",
        question: "把『網上活動報名系統』分解成三個合理子問題，並說明分解的一項好處。",
        answer: "可分為收集及驗證報名資料、檢查名額／重複報名、儲存記錄及發送確認等子問題。分解令各部分責任清楚，可獨立設計、測試、修改或重用。",
        markingScheme: [
            { marks: 2, criterion: "提出最少兩個合理而職責不同的子問題。", anyOf: ["輸入", "驗證", "名額", "重複", "儲存", "確認", "電郵"] },
            { marks: 1, criterion: "說明較易理解／獨立開發、測試、修改或重用。", anyOf: ["理解", "測試", "修改", "重用", "分工", "獨立"] }
        ], explanation: "子問題應各有清晰輸入和責任，而不是任意把同一步驟切成幾句。"
    },
    {
        id: "q-d-b-type-001",
        topicId: "chd-2", syllabusRef: "D(b)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "要保存『學生是否已繳交功課』，最合適的簡單數據類型是甚麼？",
        options: [{ value: "A", label: "Boolean" }, { value: "B", label: "Real" }, { value: "C", label: "Character array of 1000 items" }, { value: "D", label: "只可使用 Integer" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "已繳／未繳只有兩種狀態，適合 Boolean。" }], explanation: "Boolean 保存 true／false 兩種邏輯狀態。"
    },
    {
        id: "q-d-b-trace-002",
        topicId: "chd-2", syllabusRef: "D(b)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "追蹤以下偽代碼，依次寫出每次迭代後 i 和 total 的值，並指出最終輸出。",
        questionCode: "total ← 0\nfor i from 1 to 4\n    total ← total + i\noutput total",
        answer: "每次迭代後：(i,total) 為 (1,1)、(2,3)、(3,6)、(4,10)；最終輸出 10。",
        markingScheme: [
            { marks: 1, criterion: "i=1 後 total=1。", anyOf: ["1,1", "1，1", "i=1", "total=1"] },
            { marks: 1, criterion: "i=2 後 total=3。", anyOf: ["2,3", "2，3", "total=3"] },
            { marks: 1, criterion: "i=3、4 後 total 分別為 6、10。", anyOf: ["3,6", "4,10", "6", "10"] },
            { marks: 1, criterion: "最終輸出 10。", anyOf: ["輸出 10", "output 10", "最終 10"] }
        ], explanation: "每次執行 total ← total + i 後才更新 total；追蹤表應顯示累積過程。"
    },
    {
        id: "q-d-b-module-001",
        topicId: "chd-2", syllabusRef: "D(b)", difficulty: "standard", marks: 2, type: "short-answer",
        question: "說明把大型算法分成多個模組的兩項好處。",
        answer: "每個模組責任較小，較容易理解和獨立測試／除錯；通用模組亦可在其他方案重用，修改一項功能時影響範圍較清楚。",
        markingScheme: [
            { marks: 1, criterion: "較易理解、獨立測試／除錯或維護。", anyOf: ["理解", "測試", "除錯", "維護", "修改"] },
            { marks: 1, criterion: "可重用／支援分工，或限制修改影響。", anyOf: ["重用", "重複使用", "分工", "影響", "獨立"] }
        ], explanation: "模組化的價值在清晰責任、可測試性和重用，而不是令所有程式自動更快。"
    },
    {
        id: "q-d-c-boolean-001",
        topicId: "chd-3", syllabusRef: "D(c)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "要判斷 score 介乎 50 至 100（包括端點），哪個條件概念正確？",
        options: [{ value: "A", label: "score ≥ 50 AND score ≤ 100" }, { value: "B", label: "score ≥ 50 OR score ≤ 100" }, { value: "C", label: "NOT score" }, { value: "D", label: "score + 50" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "上下限必須同時成立，因此使用 AND。" }], explanation: "使用 OR 會令幾乎所有數值至少符合其中一項條件。"
    },
    {
        id: "q-d-c-list-002",
        topicId: "chd-3", syllabusRef: "D(c)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "列表 score 保存 5 個分數。寫出偽代碼，計算並輸出不少於 50 分的分數數目。",
        answer: "count ← 0；for i from 1 to 5；若 score[i] >= 50，count ← count + 1；迴圈後 output count。",
        markingScheme: [
            { marks: 1, criterion: "把 count 初始化為 0。", anyOf: ["count ← 0", "count=0", "count = 0"] },
            { marks: 1, criterion: "以迴圈處理 score 的 5 個元素。", anyOf: ["for", "1 to 5", "1 至 5", "score[i]"] },
            { marks: 1, criterion: "條件 score[i] >= 50 成立時 count 增加 1。", anyOf: [">= 50", "≥ 50", "count + 1", "count←count+1"] },
            { marks: 1, criterion: "在迴圈完成後輸出 count。", anyOf: ["output count", "輸出 count", "print(count)"] }
        ], explanation: "計數器只在條件成立時增加，並應在迴圈前初始化、迴圈後輸出。"
    },
    {
        id: "q-d-c-while-001",
        topicId: "chd-3", syllabusRef: "D(c)", difficulty: "standard", marks: 3, type: "short-answer",
        question: "以下偽代碼原意是不斷輸入正整數，輸入 0 時停止，但可能永不停止。指出原因並修正。",
        questionCode: "input n\nwhile n ≠ 0\n    total ← total + n\noutput total",
        answer: "迴圈內沒有再次輸入／更新 n，所以若首個 n 不等於 0，條件永遠不變。應在 total 更新後、迴圈結束前加入 input n，並在之前把 total 初始化為 0。",
        markingScheme: [
            { marks: 1, criterion: "指出 n 在迴圈內沒有更新。", anyOf: ["n 沒有更新", "沒有再次輸入", "n不變", "n 不變"] },
            { marks: 1, criterion: "在迴圈內加入 input n／更新 n。", anyOf: ["input n", "輸入 n", "再次輸入"] },
            { marks: 1, criterion: "把 total 在使用前初始化為 0。", anyOf: ["total ← 0", "total=0", "total = 0"] }
        ], explanation: "while 迴圈必須讓控制條件有機會改變；累積變數亦要有明確初值。"
    },
    {
        id: "q-d-d-error-001",
        topicId: "chd-4", syllabusRef: "D(d)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "程式能執行完畢，但把平均值錯算成 total / (n - 1)。這屬哪類錯誤？",
        options: [{ value: "A", label: "語法錯誤" }, { value: "B", label: "邏輯錯誤" }, { value: "C", label: "硬件輸入裝置" }, { value: "D", label: "數據壓縮" }], answer: "B",
        markingScheme: [{ marks: 1, criterion: "程式可執行但結果不正確，屬邏輯錯誤。" }], explanation: "語法錯誤通常令程式不能按語言規則開始／繼續執行；錯誤公式屬邏輯問題。"
    },
    {
        id: "q-d-d-test-002",
        topicId: "chd-4", syllabusRef: "D(d)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "輸入欄 age 只接受 12 至 18 的整數（包括端點）。提出一個正常值、三個用來測試下邊界的值，並提出一個異常／無效輸入。",
        answer: "正常值例如 15；下邊界使用 11、12、13，分別測試剛低於、等於和剛高於下限；異常／無效輸入例如文字 abc 或非整數 12.5。",
        markingScheme: [
            { marks: 1, criterion: "正常值：12 至 18 之間而非邊界，例如 15。", anyOf: ["15", "14", "16", "17"] },
            { marks: 1, criterion: "剛低於下限：11。", anyOf: ["11"] },
            { marks: 1, criterion: "等於和剛高於下限：12、13。", anyOf: ["12", "13"] },
            { marks: 1, criterion: "異常／無效：非整數或錯誤類型，例如 abc、12.5。", anyOf: ["abc", "文字", "12.5", "小數", "非整數"] }
        ], explanation: "完整邊界組合是 limit−1、limit、limit+1；異常數據要違反類型或格式等規則。"
    },
    {
        id: "q-d-d-compare-001",
        topicId: "chd-4", syllabusRef: "D(d)", difficulty: "advanced", marks: 3, type: "short-answer",
        question: "算法 A 逐一搜尋 1000 個已排序項目；算法 B 每次把搜尋範圍減半。比較兩者的操作步驟和一項資源／使用限制。",
        answer: "A 最差可能比較所有 1000 個項目；B 每次排除一半範圍，所需比較次數遠少。B 的限制是資料必須保持排序，亦可能需要額外排序成本；A 可直接用於未排序資料。",
        markingScheme: [
            { marks: 1, criterion: "指出 A 逐項比較，最差可檢查所有項目。", anyOf: ["逐一", "逐項", "1000", "所有項目", "線性"] },
            { marks: 1, criterion: "指出 B 每次把範圍減半，步驟／比較次數較少。", anyOf: ["減半", "一半", "較少", "二分"] },
            { marks: 1, criterion: "指出 B 需要已排序資料／排序成本，而 A 可用於未排序資料。", anyOf: ["已排序", "排序", "未排序", "限制"] }
        ], explanation: "方案比較要使用相同輸入規模和準則；除了速度，也可討論記憶體、前置條件和可維護性。"
    },
    {
        id: "q-e-a-tech-001",
        topicId: "che-1", syllabusRef: "E(a)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "博物館應用程式透過手機相機顯示真實展品，並在畫面疊加互動標籤。這主要使用哪項科技？",
        options: [{ value: "A", label: "擴增實境（AR）" }, { value: "B", label: "虛擬實境（VR）" }, { value: "C", label: "3D 打印" }, { value: "D", label: "批次處理" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "真實景象上疊加數碼內容，屬擴增實境。" }], explanation: "AR 保留真實環境並疊加數碼資料；VR 通常以虛擬環境取代主要視野。"
    },
    {
        id: "q-e-a-innovation-002",
        topicId: "che-1", syllabusRef: "E(a)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "回收中心以大量已標註物件相片訓練系統，讓鏡頭自動把新物件分成紙張、金屬和塑膠。指出這項人工智能工作的基本過程，並說明一項效益及兩項可能令分類不可靠或不公平的數據問題。",
        answer: "系統從已標註相片學習不同物料的特徵／模式，再把新影像的特徵與所學模式比較並作分類。自動分類可提高處理速度或一致性。若訓練相片數量不足、類別比例不平衡、標註錯誤，或拍攝環境與實際鏡頭不同，輸出便可能不準確或偏向某類物件。",
        markingScheme: [
            { marks: 1, criterion: "從已標註訓練數據找出特徵／模式。", anyOf: ["已標註", "訓練數據", "特徵", "模式", "學習"] },
            { marks: 1, criterion: "把新輸入與所學模式比較／分類。", anyOf: ["新影像", "新物件", "比較", "分類", "預測"] },
            { marks: 1, criterion: "效益：速度、一致性、處理量或減少重複人工作業。", anyOf: ["速度", "一致", "處理量", "自動", "人手"] },
            { marks: 2, criterion: "兩項不同數據問題，例如不足、不平衡、錯誤標註、欠代表性或環境差異。", anyOf: ["不足", "不平衡", "標註錯誤", "偏差", "欠代表", "拍攝環境", "光線", "角度"] }
        ], explanation: "模式辨認的高分答案要交代訓練資料、特徵／模式和新輸入，並把可靠性問題連回數據品質與代表性。"
    },
    {
        id: "q-e-a-immersive-003",
        topicId: "che-1", syllabusRef: "E(a)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "醫院要（i）製作少量度身訂造的骨骼模型供醫生準備手術，及（ii）讓學生在不進入手術室下沉浸式練習手術步驟。分別建議一項合適科技，並各解釋一項特點如何符合需要。",
        answer: "（i）3D 打印：按病人的數碼三維模型逐層加入材料，可小量製作形狀不同的實體模型。（ii）虛擬實境：以電腦產生的沉浸環境模擬手術室，學生可安全重複練習而不影響真實病人。",
        markingScheme: [
            { marks: 1, criterion: "為度身訂造實體模型建議 3D 打印。", anyOf: ["3D 打印", "3D打印", "三維打印"] },
            { marks: 1, criterion: "解釋按數碼模型逐層製作／適合小量訂造。", anyOf: ["逐層", "數碼模型", "度身", "訂造", "小量"] },
            { marks: 1, criterion: "為沉浸式練習建議虛擬實境。", anyOf: ["虛擬實境", "VR"] },
            { marks: 1, criterion: "解釋沉浸模擬可安全／重複練習。", anyOf: ["沉浸", "模擬", "安全", "重複", "不影響病人"] }
        ], explanation: "選擇科技後必須使用題目需要的特點作解釋；只寫 3D printing 和 VR 通常只足以取得指出分。"
    },
    {
        id: "q-e-b-health-001",
        topicId: "che-2", syllabusRef: "E(b)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "哪項安排最能減低長時間使用滑鼠引致手腕重複性勞損的風險？",
        options: [{ value: "A", label: "手腕保持自然位置，交替工作並定時休息" }, { value: "B", label: "把屏幕亮度調至最高" }, { value: "C", label: "使用較大的喇叭" }, { value: "D", label: "關閉防火牆" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "自然手腕姿勢及休息能針對重複動作與持續受力。" }], explanation: "人體工學措施要對應風險來源；屏幕亮度不會減少手腕重複動作。"
    },
    {
        id: "q-e-b-ergonomics-002",
        topicId: "che-2", syllabusRef: "E(b)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "一名職員每天使用桌面電腦六小時。屏幕放在側面並高於視線，椅子沒有背部承托，窗戶在屏幕後造成反光。建議三項改善，並說明每項如何減低一項健康風險。",
        answer: "把屏幕移至正前方並讓頂部約在眼睛水平，可減少扭頸／抬頭造成的頸肩不適；使用可調校並支撐腰背的椅子，讓雙腳穩定承托，可改善姿勢和減少背痛；調整屏幕或使用窗簾／合適照明消除反光，可減低眼睛疲勞。亦應定時休息、伸展和轉換工作。",
        markingScheme: [
            { marks: 2, criterion: "改善屏幕位置並連結頸肩／姿勢風險。", anyOf: ["正前方", "視線", "眼睛水平", "頸", "肩", "抬頭", "扭"] },
            { marks: 2, criterion: "使用合適椅背／調校高度並連結腰背或姿勢風險。", anyOf: ["椅背", "承托", "腰", "背", "調校", "雙腳", "姿勢"] },
            { marks: 1, criterion: "減少反光／調整照明並連結眼睛疲勞；或定時休息並說明作用。", anyOf: ["反光", "窗簾", "照明", "眼睛", "疲勞", "休息", "伸展"] }
        ], explanation: "建議必須具體且與相應風險建立因果關係；同一項泛泛建議不能重複取得多個分點。"
    },
    {
        id: "q-e-b-equity-003",
        topicId: "che-2", syllabusRef: "E(b)", difficulty: "advanced", marks: 4, type: "short-answer",
        question: "政府把一項重要公共服務改為只可使用流動應用程式辦理。指出兩類可能受到不利影響的使用者，並為每類提出一項能改善公平使用的措施。",
        answer: "例如沒有智能手機／穩定網絡的低收入或偏遠地區居民，可保留電話、櫃位服務或提供公共設備；視障人士可提供支援屏幕閱讀器、文字替代和鍵盤操作的無障礙介面；數碼技能不足的長者可獲面對面協助或簡化一致的介面。",
        markingScheme: [
            { marks: 1, criterion: "第一類合理受影響使用者。", anyOf: ["低收入", "偏遠", "沒有智能手機", "沒有網絡", "長者", "視障", "殘疾"] },
            { marks: 1, criterion: "對應第一類的可行措施。", anyOf: ["櫃位", "電話", "公共設備", "資助", "培訓", "無障礙", "屏幕閱讀器"] },
            { marks: 1, criterion: "第二類不同的合理受影響使用者。", anyOf: ["低收入", "偏遠", "長者", "視障", "聽障", "殘疾", "語言"] },
            { marks: 1, criterion: "對應第二類的可行措施。", anyOf: ["櫃位", "電話", "協助", "培訓", "簡化", "無障礙", "文字替代", "鍵盤"] }
        ], explanation: "公平使用題要把障礙和措施配對，而不是只列出『數碼鴻溝』或『提供協助』。"
    },
    {
        id: "q-e-c-licence-001",
        topicId: "che-3", syllabusRef: "E(c)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "以下哪項最能分辨 open source software 和 freeware？",
        options: [{ value: "A", label: "開放源碼軟件按授權提供源代碼；免費軟件不一定提供源代碼" }, { value: "B", label: "兩者都一定沒有版權" }, { value: "C", label: "免費軟件一定容許修改和分發" }, { value: "D", label: "開放源碼軟件只可試用 30 日" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "以源代碼及授權權利分辨兩者。" }], explanation: "Freeware 主要表示可免費使用；open source 是否免費以外，更重要是源代碼和授權准許的使用、修改及分發。"
    },
    {
        id: "q-e-c-licence-002",
        topicId: "che-3", syllabusRef: "E(c)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "學校準備安裝一款免費下載的文字處理軟件。說明為何『免費下載』不代表可隨意安裝在全校電腦，並提出閱讀授權／使用條款時應檢查的四項內容。",
        answer: "免費價格不等於放棄版權或授權限制。學校應檢查是否准許教育／機構用途、可安裝的裝置或使用者數目、可否修改／複製／分發、是否只屬試用或部分功能需付費，以及會否收集文件內容或其他個人資料、顯示廣告或限制服務。",
        markingScheme: [
            { marks: 1, criterion: "說明免費不等於沒有版權／沒有授權限制。", anyOf: ["版權", "授權", "限制", "條款", "免費不等於"] },
            { marks: 1, criterion: "檢查是否准許教育、學校、機構或商業用途。", anyOf: ["教育", "學校", "機構", "商業", "個人用途"] },
            { marks: 1, criterion: "檢查裝置／使用者／安裝數量限制。", anyOf: ["裝置", "電腦數目", "安裝數量", "使用者", "帳戶"] },
            { marks: 1, criterion: "檢查修改、複製、分發、期限或付費功能限制。", anyOf: ["修改", "複製", "分發", "試用", "期限", "付費", "功能"] },
            { marks: 1, criterion: "檢查個人資料／文件內容收集、廣告或其他私隱風險。", anyOf: ["個人資料", "文件內容", "收集數據", "私隱", "廣告"] }
        ], explanation: "公開評核常把軟件類型放進安裝情境；答案要以實際條款和風險解釋，而不是假設『免費』代表完全自由。"
    },
    {
        id: "q-e-c-protection-003",
        topicId: "che-3", syllabusRef: "E(c)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "攝影師把相片放到網站展示。說明數碼水印和數碼簽署各可提供的一項保障，並指出使用網上相片時應採取的兩項合適做法。",
        answer: "數碼水印在相片嵌入擁有者或追蹤標記，協助顯示版權／辨認未授權副本；數碼簽署可驗證來源和相片自簽署後是否被修改。使用者應查閱並遵守授權／取得版權持有人許可，以及承認作者和列出資料來源；必要時使用獲准的素材版本。",
        markingScheme: [
            { marks: 1, criterion: "水印顯示擁有者／版權或追蹤未授權副本。", anyOf: ["水印", "擁有者", "版權", "追蹤", "未授權"] },
            { marks: 1, criterion: "數碼簽署驗證來源及／或完整性。", anyOf: ["數碼簽署", "來源", "身分", "完整性", "修改"] },
            { marks: 1, criterion: "查閱授權／取得許可／只使用獲准素材。", anyOf: ["授權", "許可", "批准", "獲准", "條款"] },
            { marks: 1, criterion: "承認作者並列出資料來源。", anyOf: ["作者", "承認", "資料來源", "引用", "出處"] }
        ], explanation: "水印和簽署功能不同；列出來源亦不一定取代取得授權，兩項做法應同時考慮。"
    },
    {
        id: "q-ea-rel-001", topicId: "ea-1", syllabusRef: "Elective A(a)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "一個表有 StudentID 和不重複的 Email，兩者都能唯一識別學生。在選定主鍵前，兩者均屬於甚麼？",
        options: [{ value: "A", label: "候選鍵" }, { value: "B", label: "外鍵" }, { value: "C", label: "交易" }, { value: "D", label: "重複欄位" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "能唯一識別記錄的最小欄位組合是候選鍵。" }], explanation: "表可有多個候選鍵，再選其中一個作主鍵。"
    },
    {
        id: "q-ea-rel-002", topicId: "ea-1", syllabusRef: "Elective A(a)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "數據庫有 CLASS(ClassID, ClassName) 和 STUDENT(StudentID, Name, ClassID)。指出兩個主鍵和一個外鍵，並分別說明實體完整性及參照完整性如何限制 STUDENT 的數據。",
        answer: "CLASS 的主鍵是 ClassID；STUDENT 的主鍵是 StudentID；STUDENT.ClassID 是外鍵，參照 CLASS.ClassID。實體完整性要求 StudentID 不可為空且每筆記錄唯一；參照完整性要求非空的 STUDENT.ClassID 必須在 CLASS 中存在。",
        markingScheme: [{ marks: 1, criterion: "CLASS.ClassID 是主鍵。", anyOf: ["CLASS.ClassID", "CLASS 的 ClassID", "CLASS主鍵"] }, { marks: 1, criterion: "STUDENT.StudentID 是主鍵。", anyOf: ["STUDENT.StudentID", "STUDENT 的 StudentID", "STUDENT主鍵"] }, { marks: 1, criterion: "STUDENT.ClassID 是參照 CLASS.ClassID 的外鍵。", anyOf: ["STUDENT.ClassID", "外鍵", "參照 CLASS"] }, { marks: 1, criterion: "實體完整性：主鍵不可為空且唯一。", anyOf: ["不可為空", "不能空", "唯一", "實體完整性"] }, { marks: 1, criterion: "參照完整性：外鍵值必須在父表存在或為允許的空值。", anyOf: ["必須存在", "CLASS 中存在", "父表", "參照完整性"] }],
        explanation: "回答完整性時要寫出受限制的欄位和不合法值，而不是只背定義。"
    },
    {
        id: "q-ea-rel-003", topicId: "ea-1", syllabusRef: "Elective A(a)", difficulty: "standard", marks: 3, type: "short-answer",
        question: "網上付款同時扣減存貨和新增訂單。新增訂單失敗後系統執行 rollback。說明 rollback 的目的，並指出為 ProductID 建立 index 的一項效益及一項成本。",
        answer: "Rollback 撤銷同一交易中已完成的扣庫存變更，使數據庫返回一致狀態。ProductID index 可加快搜尋／連接，但會佔用額外儲存空間，而且新增或更新時要維護索引。",
        markingScheme: [{ marks: 1, criterion: "撤銷未完整交易並回復一致狀態。", anyOf: ["撤銷", "還原", "一致", "rollback"] }, { marks: 1, criterion: "索引加快搜尋／排序／連接。", anyOf: ["加快", "搜尋", "查詢", "連接"] }, { marks: 1, criterion: "索引佔空間或增加寫入／維護成本。", anyOf: ["空間", "儲存", "維護", "更新", "新增"] }], explanation: "索引不是免費加速：讀取通常變快，但儲存和寫入成本增加。"
    },
    {
        id: "q-ea-sql-concept-001", topicId: "ea-2", syllabusRef: "Elective A(b)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "要篩選 GROUP BY 後平均分高於 70 的班別，應使用哪個子句？",
        options: [{ value: "A", label: "HAVING" }, { value: "B", label: "ALTER" }, { value: "C", label: "DROP" }, { value: "D", label: "VALUES" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "HAVING 用於篩選群組聚合結果。" }], explanation: "WHERE 在分組前篩選記錄；HAVING 在分組後篩選群組。"
    },
    {
        id: "q-ea-sql-002", topicId: "ea-2", syllabusRef: "Elective A(b)", difficulty: "standard", marks: 5, type: "sql",
        question: "有 STUDENT(SID, SName, ClassID) 和 CLASS(ClassID, ClassName)。寫出 SQL，顯示所有班名為 '5A' 的學生姓名，按姓名升序排列。",
        answer: "SELECT S.SName FROM STUDENT S INNER JOIN CLASS C ON S.ClassID = C.ClassID WHERE C.ClassName = '5A' ORDER BY S.SName ASC;",
        markingScheme: [{ marks: 1, criterion: "SELECT SName。", anyOf: ["SELECTS.SNAME", "SELECTSNAME"] }, { marks: 1, criterion: "FROM STUDENT 並使用 CLASS。", anyOf: ["FROMSTUDENT", "JOINCLASS"] }, { marks: 1, criterion: "以 ClassID 正確連接兩表。", anyOf: ["S.CLASSID=C.CLASSID", "STUDENT.CLASSID=CLASS.CLASSID"] }, { marks: 1, criterion: "篩選 ClassName='5A'。", anyOf: ["CLASSNAME='5A'", "CLASSNAME=\"5A\""] }, { marks: 1, criterion: "按 SName 升序排列。", anyOf: ["ORDERBYS.SNAME", "ORDERBYSNAME", "ASC"] }], explanation: "先以 ClassID 連接學生和班別，再按班名篩選及排序。"
    },
    {
        id: "q-ea-sql-003", topicId: "ea-2", syllabusRef: "Elective A(b)", difficulty: "advanced", marks: 4, type: "sql",
        question: "有 RESULT(SID, Score)。寫出 SQL，把所有低於全表平均分的記錄 Score 增加 5。只需一層子查詢。",
        answer: "UPDATE RESULT SET Score = Score + 5 WHERE Score < (SELECT AVG(Score) FROM RESULT);",
        markingScheme: [{ marks: 1, criterion: "UPDATE RESULT。", anyOf: ["UPDATERESULT"] }, { marks: 1, criterion: "SET Score = Score + 5。", anyOf: ["SETSCORE=SCORE+5"] }, { marks: 1, criterion: "以 WHERE Score < 子查詢結果篩選。", anyOf: ["WHERESCORE<", "SCORE<("] }, { marks: 1, criterion: "子查詢正確計算 RESULT 的 AVG(Score)。", anyOf: ["SELECTAVG(SCORE)FROMRESULT"] }], explanation: "子查詢先取得單一平均值，外層 UPDATE 只修改低於該值的記錄。"
    },
    {
        id: "q-ea-design-001", topicId: "ea-3", syllabusRef: "Elective A(c)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "把 M:N 關係轉成關聯表時，最常見做法是甚麼？",
        options: [{ value: "A", label: "加入橋接表，把關係拆成兩個 1:M" }, { value: "B", label: "刪除其中一個實體" }, { value: "C", label: "把所有資料放進一個文字欄" }, { value: "D", label: "取消所有主鍵" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "以橋接表解拆多對多關係。" }], explanation: "橋接表通常以兩邊外鍵組成複合主鍵，亦可保存關係本身的屬性。"
    },
    {
        id: "q-ea-design-002", topicId: "ea-3", syllabusRef: "Elective A(c)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "學生可選修多個課程，每個課程亦有多名學生；系統還要保存每次選修的 EnrolDate。說明 ER 關係和解拆方法，並列出三個關聯表的主鍵及外鍵。",
        answer: "STUDENT 與 COURSE 是 M:N。加入 ENROLMENT，把關係解成 STUDENT 1:M ENROLMENT 和 COURSE 1:M ENROLMENT。STUDENT(StudentID PK)、COURSE(CourseID PK)、ENROLMENT(StudentID PK/FK, CourseID PK/FK, EnrolDate)，其中兩個外鍵組成複合主鍵。",
        markingScheme: [{ marks: 1, criterion: "指出 STUDENT 與 COURSE 是 M:N。", anyOf: ["M:N", "多對多"] }, { marks: 1, criterion: "加入 ENROLMENT／橋接實體。", anyOf: ["ENROLMENT", "橋接", "選修表"] }, { marks: 1, criterion: "把關係拆成兩個 1:M。", anyOf: ["1:M", "一對多"] }, { marks: 1, criterion: "正確列出 STUDENT、COURSE 主鍵。", anyOf: ["StudentID", "CourseID", "主鍵"] }, { marks: 1, criterion: "ENROLMENT 以兩外鍵作複合主鍵並保存 EnrolDate。", anyOf: ["複合主鍵", "PK/FK", "EnrolDate", "兩個外鍵"] }], explanation: "EnrolDate 屬於學生與課程之間的選修關係，因此放在橋接表。"
    },
    {
        id: "q-ea-design-003", topicId: "ea-3", syllabusRef: "Elective A(c)", difficulty: "advanced", marks: 6, type: "short-answer",
        question: "表 ORDER(OrderID, OrderDate, CustomerID, CustomerName, ProductID, ProductName, Qty) 以 (OrderID, ProductID) 為複合主鍵。指出一項冗餘問題，並把它正規化至 3NF，列出新表及鍵。",
        answer: "同一顧客／產品名稱在多張訂單重複，容易產生更新異常。可分為 CUSTOMER(CustomerID PK, CustomerName)、PRODUCT(ProductID PK, ProductName)、ORDERS(OrderID PK, OrderDate, CustomerID FK)、ORDER_LINE(OrderID PK/FK, ProductID PK/FK, Qty)。顧客資料只依賴 CustomerID，產品資料只依賴 ProductID，非鍵屬性依賴其表的鍵。",
        markingScheme: [{ marks: 1, criterion: "指出名稱重複或更新／新增／刪除異常。", anyOf: ["重複", "冗餘", "更新異常", "刪除異常", "新增異常"] }, { marks: 1, criterion: "建立 CUSTOMER 並以 CustomerID 為主鍵。", anyOf: ["CUSTOMER", "CustomerID PK", "CustomerID主鍵"] }, { marks: 1, criterion: "建立 PRODUCT 並以 ProductID 為主鍵。", anyOf: ["PRODUCT", "ProductID PK", "ProductID主鍵"] }, { marks: 1, criterion: "建立 ORDERS，含 CustomerID 外鍵。", anyOf: ["ORDERS", "OrderID", "CustomerID FK", "CustomerID外鍵"] }, { marks: 1, criterion: "建立 ORDER_LINE，以 OrderID、ProductID 作複合鍵。", anyOf: ["ORDER_LINE", "複合", "OrderID", "ProductID"] }, { marks: 1, criterion: "說明移除 partial／transitive dependency 或非鍵只依賴鍵。", anyOf: ["部分依賴", "傳遞依賴", "非鍵", "依賴主鍵", "3NF"] }], explanation: "先把依賴顧客和產品識別碼的描述資料分開，再保留訂單表和訂單明細橋接表。"
    },
    {
        id: "q-eb-network-001", topicId: "eb-1", syllabusRef: "Elective B(a)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "哪類伺服器主要為新加入網絡的裝置自動配發 IP 位址？",
        options: [{ value: "A", label: "DHCP server" }, { value: "B", label: "Web server" }, { value: "C", label: "File server" }, { value: "D", label: "Database server" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "DHCP 自動租用 IP 位址及網絡參數。" }], explanation: "DNS 負責名稱解析；DHCP 負責位址和相關設定。"
    },
    {
        id: "q-eb-network-002", topicId: "eb-1", syllabusRef: "Elective B(a)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "瀏覽器把登入表單送到 HTTPS 網站。說明 client、server、request、response 和 TCP port 在這次通訊中的角色，並解釋為何使用 POST 仍需要 HTTPS。",
        answer: "瀏覽器是 client，向 web server 發出包含表單資料的 HTTP POST request；server 接收和處理後回傳 response。TCP port 用來把連線交給正確的網絡服務，例如 HTTPS 常用 443。POST 只把資料放在請求內容而不是 URL，並不自動加密，所以仍需 HTTPS 保護傳輸。",
        markingScheme: [{ marks: 1, criterion: "瀏覽器是 client、網站程式是 server。", anyOf: ["瀏覽器", "client", "server", "伺服器"] }, { marks: 1, criterion: "client 發出 POST request。", anyOf: ["POST", "request", "請求"] }, { marks: 1, criterion: "server 處理並回傳 response。", anyOf: ["response", "回應", "處理"] }, { marks: 1, criterion: "port 把連線交給指定服務／HTTPS 常用 443。", anyOf: ["port", "連接埠", "443", "服務"] }, { marks: 1, criterion: "POST 不等於加密，HTTPS 才保護傳輸。", anyOf: ["不會加密", "不是加密", "HTTPS", "保護傳輸"] }], explanation: "GET／POST 是請求方法；HTTPS 是安全傳輸機制，不能混為一談。"
    },
    {
        id: "q-eb-network-003", topicId: "eb-1", syllabusRef: "Elective B(a)", difficulty: "standard", marks: 4, type: "short-answer",
        question: "展覽攤位有共用資料夾。學生只可閱讀宣傳檔，設計員可新增及修改檔案，只有管理員可執行部署腳本。分配 read、write、execute 權限，並說明最小權限的一項好處。",
        answer: "學生：read；設計員：read、write；管理員：按工作需要擁有 read、write、execute。最小權限只給完成工作所需權限，可減少誤刪、惡意修改或執行未授權程式的風險。",
        markingScheme: [{ marks: 1, criterion: "學生只有 read。", anyOf: ["學生", "read", "只讀"] }, { marks: 1, criterion: "設計員有 read、write。", anyOf: ["設計員", "read", "write", "讀寫"] }, { marks: 1, criterion: "管理員才有 execute。", anyOf: ["管理員", "execute", "執行"] }, { marks: 1, criterion: "說明最小權限減少未授權操作／事故。", anyOf: ["最小權限", "未授權", "誤刪", "風險", "攻擊"] }], explanation: "權限要按角色和工作配對，而不是讓所有登入者都有完整控制。"
    },
    {
        id: "q-eb-web-001", topicId: "eb-2", syllabusRef: "Elective B(b)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "為何伺服器必須再次驗證已由 JavaScript 檢查的表單輸入？",
        options: [{ value: "A", label: "客戶端驗證可被停用或繞過" }, { value: "B", label: "CSS 不能設定顏色" }, { value: "C", label: "POST 一定會刪除資料" }, { value: "D", label: "伺服器看不到任何請求" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "客戶端程式不可信，伺服器須重新驗證。" }], explanation: "使用者可修改或直接建立請求，不能以瀏覽器檢查作唯一防線。"
    },
    {
        id: "q-eb-web-002", topicId: "eb-2", syllabusRef: "Elective B(b)", difficulty: "standard", marks: 6, type: "short-answer",
        question: "網頁讓學生輸入 0–100 的分數，再把有效資料加入 RESULTS 表。按次序說明 HTML、CSS、client-side script、HTTP POST、server-side script 和 database 的作用。",
        answer: "HTML 建立有標籤的表單欄位；CSS 提供一致和清楚的呈現；客戶端腳本即時檢查範圍並提示；瀏覽器以 POST request 送出資料；伺服器端腳本不信任客戶端而再次驗證及處理；驗證成功後才以安全查詢新增至 RESULTS，最後回傳成功或錯誤 response。",
        markingScheme: [{ marks: 1, criterion: "HTML 建立表單結構和欄位。", anyOf: ["HTML", "表單", "欄位"] }, { marks: 1, criterion: "CSS 提供一致呈現。", anyOf: ["CSS", "一致", "樣式"] }, { marks: 1, criterion: "客戶端腳本即時檢查／提示。", anyOf: ["client", "JavaScript", "即時", "範圍"] }, { marks: 1, criterion: "以 HTTP POST request 送出。", anyOf: ["POST", "request", "請求"] }, { marks: 1, criterion: "伺服器端再次驗證和處理。", anyOf: ["server", "伺服器端", "再次驗證"] }, { marks: 1, criterion: "有效資料才寫入 database 並回傳 response。", anyOf: ["database", "數據庫", "RESULTS", "response", "回應"] }], explanation: "高分流程答案要清楚區分瀏覽器顯示、客戶端程式、網絡請求、伺服器處理和數據庫。"
    },
    {
        id: "q-eb-web-003", topicId: "eb-2", syllabusRef: "Elective B(b)", difficulty: "advanced", marks: 4, type: "short-answer",
        question: "網站以 cookie 保存登入狀態。指出 cookie 的兩項合適安全設定／做法，並解釋為何不應在 cookie 保存明文密碼。",
        answer: "可設定 Secure 令 cookie 只經 HTTPS 傳送、HttpOnly 減少客戶端腳本讀取、SameSite 減低跨站請求風險，並設合理期限。明文密碼若被裝置使用者、惡意程式或截取者讀取便會直接洩漏帳戶憑證；應只保存不可猜測的短期 session identifier。",
        markingScheme: [{ marks: 2, criterion: "兩項合理做法：Secure、HttpOnly、SameSite、合理期限或只保存 session ID。", anyOf: ["Secure", "HttpOnly", "SameSite", "期限", "session", "HTTPS"] }, { marks: 1, criterion: "指出明文密碼一旦被讀取便直接洩漏憑證。", anyOf: ["明文", "洩漏", "讀取", "密碼"] }, { marks: 1, criterion: "建議保存短期／不可猜測 session identifier 而非密碼。", anyOf: ["session", "識別碼", "短期", "不可猜"] }], explanation: "Cookie 可保存狀態，但內容和屬性必須按風險設計；它不是安全保險箱。"
    },
    {
        id: "q-ec-program-001", topicId: "ec-1", syllabusRef: "Elective C(a)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "列印工作按加入先後次序處理，最合適使用哪種數據結構？",
        options: [{ value: "A", label: "Queue" }, { value: "B", label: "Stack" }, { value: "C", label: "只有 Boolean" }, { value: "D", label: "無序常數" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "Queue 以 FIFO 處理先加入的工作。" }], explanation: "打印佇列是典型 FIFO；stack 則是 LIFO。"
    },
    {
        id: "q-ec-program-002", topicId: "ec-1", syllabusRef: "Elective C(a)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "系統要在 1024 個已排序學生編號中重複搜尋。比較 linear search 和 binary search 的步驟，建議較合適算法並說明一項限制。",
        answer: "Linear search 由首項逐一比較，最差可能檢查 1024 項；binary search 比較中間項並每次排除一半，約十次比較便可縮至一項。資料已排序且重複搜尋，binary search 較合適。限制是必須維持排序，插入後可能需要重新排序或調整。",
        markingScheme: [{ marks: 1, criterion: "Linear search 逐項比較。", anyOf: ["逐一", "逐項", "linear"] }, { marks: 1, criterion: "最差可比較 1024 項。", anyOf: ["1024", "所有項"] }, { marks: 1, criterion: "Binary search 每次把範圍減半。", anyOf: ["減半", "一半", "binary"] }, { marks: 1, criterion: "建議 binary search，因資料已排序／重複搜尋。", anyOf: ["binary search", "二分", "已排序", "重複搜尋"] }, { marks: 1, criterion: "限制：必須排序或維持排序有成本。", anyOf: ["必須排序", "維持排序", "重新排序", "限制"] }], explanation: "算法建議要把資料特徵、操作次數和前置條件連起來。"
    },
    {
        id: "q-ec-program-003", topicId: "ec-1", syllabusRef: "Elective C(a)", difficulty: "advanced", marks: 5, type: "short-answer",
        question: "Stack 最初由底至頂為 [A, B]。依次執行 push(C)、pop()、push(D)、push(E)、pop()。寫出兩次 pop 的值和最終 stack，並說明 underflow 何時發生。",
        answer: "push(C) 後頂為 C，第一次 pop 得 C，剩 [A,B]；再 push D、E，第二次 pop 得 E，最終 [A,B,D]。在空 stack 上執行 pop／讀取頂端時發生 underflow。",
        markingScheme: [{ marks: 1, criterion: "第一次 pop 得 C。", anyOf: ["C"] }, { marks: 1, criterion: "第二次 pop 得 E。", anyOf: ["E"] }, { marks: 2, criterion: "最終由底至頂為 A、B、D。", anyOf: ["A,B,D", "[A,B,D]", "A B D"] }, { marks: 1, criterion: "空 stack 上 pop／peek 造成 underflow。", anyOf: ["空", "pop", "underflow", "頂端"] }], explanation: "Stack 只在頂端 push／pop，最後加入的 E 先被移除。"
    },
    {
        id: "q-ec-device-001", topicId: "ec-2", syllabusRef: "Elective C(b)", difficulty: "foundation", marks: 1, type: "mcq",
        question: "程式在光線讀數低於 20 時執行開燈 handler。數值 20 主要是甚麼？",
        options: [{ value: "A", label: "事件觸發閾值" }, { value: "B", label: "資料庫外鍵" }, { value: "C", label: "HTML 元素" }, { value: "D", label: "軟件授權" }], answer: "A",
        markingScheme: [{ marks: 1, criterion: "感應器值越過閾值便觸發事件處理。" }], explanation: "事件可由按鍵或感應器狀態觸發。"
    },
    {
        id: "q-ec-device-002", topicId: "ec-2", syllabusRef: "Elective C(b)", difficulty: "standard", marks: 5, type: "short-answer",
        question: "溫室控制器讀取溫度感應器；高於 30°C 開風扇，低於 28°C 關風扇。以 input、event／condition、processing、output 及 hysteresis 解釋方案。",
        answer: "Input 是溫度感應器讀數。讀數高於 30 或低於 28 觸發相應條件／事件；handler 比較閾值並更新風扇狀態；output 是馬達控制訊號。使用兩個不同開關閾值形成 hysteresis，可避免溫度在 30 附近波動時風扇頻繁開關。",
        markingScheme: [{ marks: 1, criterion: "Input 是溫度感應器讀數。", anyOf: ["溫度", "感應器", "input"] }, { marks: 1, criterion: "高於 30／低於 28 是觸發條件。", anyOf: ["30", "28", "觸發", "condition", "event"] }, { marks: 1, criterion: "處理是比較閾值及更新狀態。", anyOf: ["比較", "閾值", "狀態", "processing"] }, { marks: 1, criterion: "Output 是風扇／馬達控制訊號。", anyOf: ["風扇", "馬達", "output", "控制訊號"] }, { marks: 1, criterion: "兩閾值避免臨界值附近頻繁開關。", anyOf: ["hysteresis", "頻繁", "波動", "兩個閾值"] }], explanation: "兩個閾值保留中間狀態，可處理感應器噪聲和環境波動。"
    },
    {
        id: "q-ec-device-003", topicId: "ec-2", syllabusRef: "Elective C(b)", difficulty: "advanced", marks: 4, type: "short-answer",
        question: "自動門偶爾收到異常距離讀數而突然開啟。提出兩項程式措施處理讀數，並指出感應器失效時的一項安全預設。",
        answer: "可拒絕有效範圍外讀數、要求連續多次符合才觸發、使用短期平均／去抖動，或設定最短狀態時間。感應器失效時應進入經風險評估的安全狀態，例如停止自動關門、發出警報並要求人工控制。",
        markingScheme: [{ marks: 2, criterion: "兩項不同讀數處理，例如範圍檢查、連續確認、平均或去抖動。", anyOf: ["範圍", "連續", "多次", "平均", "去抖", "最短時間"] }, { marks: 1, criterion: "指出偵測感應器失效／超時。", anyOf: ["失效", "超時", "沒有讀數", "異常"] }, { marks: 1, criterion: "合理安全預設，如停止關門、警報或人工控制。", anyOf: ["停止", "警報", "人工", "安全狀態"] }], explanation: "實體裝置程式要處理噪聲、異常和故障，不能把單次讀數當作絕對真實。"
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
