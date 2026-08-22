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
