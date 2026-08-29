(function exposeExamPractice() {
    "use strict";
    const examPractice = Object.freeze({
        commandWords: [
            { verb: "指出／列出", demand: "直接寫出指定數量的名稱或特點；不要用背景資料取代答案。" },
            { verb: "描述", demand: "按先後次序或資料流寫出發生甚麼，清楚標示角色及動作。" },
            { verb: "解釋", demand: "寫出技術機制，並連到題目情境中的原因或結果。" },
            { verb: "比較", demand: "以同一準則成對比較兩者，再連回題目需要。" },
            { verb: "計算／追蹤", demand: "保留代入、單位及中間值；追蹤變數、索引或資料結構的每次更新。" },
            { verb: "設計／完成", demand: "遵守指定表示法，處理正常流程、條件、邊界及必要驗證。" },
            { verb: "評估／建議", demand: "先作判斷或提出方案，以題目限制、效益和風險支持結論。" }
        ],
        answerFramework: [
            { id: "demand", label: "指令", prompt: "圈出指出、解釋、比較、計算、追蹤或設計，決定答案形式。" },
            { id: "evidence", label: "證據", prompt: "引用題目中的數值、欄位、硬件、使用者或限制，不只寫一般常識。" },
            { id: "mechanism", label: "機制", prompt: "寫清楚公式、SQL 子句、資料流、算法步驟或技術如何運作。" },
            { id: "effect", label: "結果", prompt: "把機制連回題目目標、風險、效能或使用者需要。" },
            { id: "check", label: "核對", prompt: "按分數檢查答案點數量，並核對單位、範圍、條件及輸出。" }
        ],
        practiceSets: [
            {
                id: "spreadsheet-media",
                topicId: "cha-4",
                label: "試算表與檔案大小",
                icon: "fx",
                paperStyle: "卷一乙 · 計算及公式",
                minutes: 9,
                visual: {
                    type: "spreadsheet",
                    title: "影音工作表",
                    columns: ["列", "A：組別", "B：片長／秒", "C：聲道", "D：取樣頻率"],
                    rows: [["2", "紅", "180", "2", "48000"], ["3", "藍", "150", "2", "44100"], ["4", "紅", "210", "1", "48000"], ["5", "綠", "120", "2", "44100"]]
                },
                scenario: "校內媒體隊用工作表記錄各組未壓縮音訊。每個樣本為 16 bit，平台上載上限為 40 MiB。",
                layers: {
                    foundation: {
                        title: "找出弱答案欠缺甚麼",
                        prompt: "題目要求計算紅組的平均片長。模擬弱答案只寫「=AVERAGE(B2:B5)」。選出它欠缺的兩個關鍵點。",
                        response: "=AVERAGE(B2:B5)",
                        options: [
                            { id: "conditional", label: "使用能按組別篩選的條件平均函數" },
                            { id: "ranges", label: "分開條件範圍 A2:A5 與平均範圍 B2:B5" },
                            { id: "chart", label: "插入圓形圖" },
                            { id: "password", label: "為工作表加入密碼" }
                        ],
                        correctIds: ["conditional", "ranges"],
                        feedback: "這題不是求全部列的平均值；答案必須同時表達條件「紅」及要平均的片長範圍。"
                    },
                    exam: {
                        title: "用答案積木完成公式",
                        prompt: "按合理次序選取所有需要的積木，建立可輸入 E2 的公式。",
                        blocks: [
                            { id: "function", text: "=AVERAGEIF(" },
                            { id: "criteria-range", text: "A2:A5," },
                            { id: "criteria", text: "\"紅\"," },
                            { id: "average-range", text: "B2:B5)" },
                            { id: "distractor", text: "COUNT," }
                        ],
                        targetIds: ["function", "criteria-range", "criteria", "average-range"],
                        model: "=AVERAGEIF(A2:A5,\"紅\",B2:B5)"
                    },
                    challenge: {
                        title: "計算、判斷並保留單位",
                        question: "紅組一段 180 秒、48 000 Hz、16 bit、雙聲道的未壓縮音訊，壓縮後為原大小的 60%。計算壓縮後檔案大小（MiB），並判斷能否上載。列出步驟。",
                        marks: 4,
                        checklist: ["先以 bit 計算總數據量", "除以 8 轉成 byte，再除以 1024² 轉成 MiB", "套用 60% 壓縮後比例", "把結果與 40 MiB 上限比較並下結論"],
                        model: "未壓縮大小 = 48 000 × 16 × 2 × 180 ÷ 8 ÷ 1024² ≈ 32.96 MiB。壓縮後 = 32.96 × 60% ≈ 19.78 MiB，小於 40 MiB，因此可以上載。",
                        route: "cha.4.html"
                    }
                }
            },
            {
                id: "network-hardware",
                topicId: "chc-1",
                label: "硬件、網絡與解釋題",
                icon: "LAN",
                paperStyle: "卷一乙 · 建議並解釋",
                minutes: 10,
                visual: {
                    type: "network",
                    title: "校內直播網絡",
                    nodes: ["攝錄電腦", "剪接電腦", "交換器", "路由器", "互聯網"]
                },
                scenario: "學校禮堂以有線 LAN 把攝錄及剪接電腦連接到直播平台；兩部電腦需要交換大型片段，直播亦要連往互聯網。",
                layers: {
                    foundation: {
                        title: "把結論補成解釋",
                        prompt: "模擬弱答案只寫「用交換器，因為較快」。選出最需要補上的兩點。",
                        response: "用交換器，因為較快。",
                        options: [
                            { id: "role", label: "交換器在同一 LAN 內按目的位址轉發幀" },
                            { id: "context", label: "把大型片段只送往需要的連接埠，減少不必要流量" },
                            { id: "colour", label: "交換器通常有黑色外殼" },
                            { id: "wifi", label: "改寫成所有裝置都使用流動數據" }
                        ],
                        correctIds: ["role", "context"],
                        feedback: "「較快」只是結論；高質素解釋要指出硬件角色，再連回大型檔案傳送的情境。"
                    },
                    exam: {
                        title: "建立完整因果句",
                        prompt: "依「裝置 → 機制 → 情境效果」次序建立 3 分答案。",
                        blocks: [
                            { id: "device", text: "使用網絡交換器連接禮堂內的電腦；" },
                            { id: "mechanism", text: "它根據目的 MAC 位址把幀轉發到相應連接埠，" },
                            { id: "effect", text: "可減少其他連接埠的不必要流量，讓大型片段在 LAN 內有效傳送。" },
                            { id: "distractor", text: "它會替互聯網上的網站註冊域名。" }
                        ],
                        targetIds: ["device", "mechanism", "effect"],
                        model: "使用網絡交換器連接禮堂內的電腦；它根據目的 MAC 位址把幀轉發到相應連接埠，可減少其他連接埠的不必要流量，讓大型片段在 LAN 內有效傳送。"
                    },
                    challenge: {
                        title: "比較交換器與路由器的角色",
                        question: "解釋直播資料由剪接電腦送往互聯網時，交換器和路由器各自負責甚麼。答案須連回圖中資料流。",
                        marks: 4,
                        checklist: ["指出交換器處理同一 LAN 內的傳送", "指出交換器按目的 MAC 位址轉發幀", "指出路由器連接不同網絡／通往互聯網", "指出路由器按目的 IP 位址選擇下一跳或路徑"],
                        model: "剪接電腦先把幀交給交換器；交換器按目的 MAC 位址把幀送到連接路由器的埠。路由器連接校內 LAN 和互聯網，按目的 IP 位址把封包轉發至合適的下一個網絡。",
                        route: "chc.1.html"
                    }
                }
            },
            {
                id: "database-query",
                topicId: "ea-2",
                label: "關聯數據庫與 SQL",
                icon: "SQL",
                paperStyle: "卷二 · 多表查詢",
                minutes: 12,
                visual: {
                    type: "database",
                    title: "借閱數據表",
                    tables: [
                        { name: "MEMBER", fields: ["MemberID (PK)", "Class", "Name"] },
                        { name: "LOAN", fields: ["LoanID (PK)", "MemberID (FK)", "BookID (FK)", "DueDate", "ReturnDate"] },
                        { name: "BOOK", fields: ["BookID (PK)", "Title", "Category"] }
                    ]
                },
                scenario: "圖書館要列出 4A 班逾期歸還的書名及學生姓名，並按歸還日期由新至舊排列。",
                layers: {
                    foundation: {
                        title: "診斷可執行但答非所問的查詢",
                        prompt: "模擬弱答案是「SELECT * FROM BOOK;」。選出它欠缺的三個要求。",
                        response: "SELECT * FROM BOOK;",
                        options: [
                            { id: "join", label: "連接 MEMBER、LOAN 和 BOOK" },
                            { id: "filter", label: "篩選 4A 及 ReturnDate > DueDate" },
                            { id: "order", label: "按 ReturnDate 降序排列" },
                            { id: "delete", label: "刪除所有已歸還記錄" }
                        ],
                        correctIds: ["join", "filter", "order"],
                        feedback: "SQL 可以執行不代表符合題意；先圈出輸出欄、來源關係、條件和排列四部分。"
                    },
                    exam: {
                        title: "逐段建立多表 SQL",
                        prompt: "依 SELECT → FROM／JOIN → WHERE → ORDER BY 的次序選取積木。",
                        blocks: [
                            { id: "select", text: "SELECT B.Title, M.Name" },
                            { id: "from", text: "FROM (MEMBER AS M INNER JOIN LOAN AS L ON M.MemberID = L.MemberID) INNER JOIN BOOK AS B ON L.BookID = B.BookID" },
                            { id: "where", text: "WHERE M.Class = '4A' AND L.ReturnDate > L.DueDate" },
                            { id: "order", text: "ORDER BY L.ReturnDate DESC;" },
                            { id: "distractor", text: "DROP TABLE LOAN;" }
                        ],
                        targetIds: ["select", "from", "where", "order"],
                        model: "SELECT B.Title, M.Name FROM (MEMBER AS M INNER JOIN LOAN AS L ON M.MemberID = L.MemberID) INNER JOIN BOOK AS B ON L.BookID = B.BookID WHERE M.Class = '4A' AND L.ReturnDate > L.DueDate ORDER BY L.ReturnDate DESC;"
                    },
                    challenge: {
                        title: "由要求反推子句",
                        question: "寫出 SQL，顯示每班的逾期記錄數目 LateCount；只顯示至少 2 次逾期的班別，並按 LateCount 由大至小排列。",
                        marks: 6,
                        checklist: ["連接 MEMBER 與 LOAN", "以 ReturnDate > DueDate 篩選逾期", "以 Class 分組", "使用 COUNT 並命名為 LateCount", "以 HAVING 篩選組別", "以 LateCount 降序排列"],
                        model: "SELECT M.Class, COUNT(*) AS LateCount FROM MEMBER AS M INNER JOIN LOAN AS L ON M.MemberID = L.MemberID WHERE L.ReturnDate > L.DueDate GROUP BY M.Class HAVING COUNT(*) >= 2 ORDER BY LateCount DESC;",
                        route: "ea.2.html"
                    }
                }
            },
            {
                id: "algorithm-trace",
                topicId: "chd-2",
                label: "算法追蹤與程式完成",
                icon: "{ }",
                paperStyle: "卷一乙／卷二 · 追蹤",
                minutes: 11,
                visual: {
                    type: "algorithm",
                    title: "合格分數算法",
                    code: ["scores ← [12, 7, 18, 4, 15]", "total ← 0 ; count ← 0", "FOR EACH score IN scores", "  IF score >= 10 THEN", "    total ← total + score", "    count ← count + 1", "  ENDIF", "ENDFOR", "OUTPUT total / count"]
                },
                scenario: "算法只計算達到 10 分的成績平均值。",
                layers: {
                    foundation: {
                        title: "找出只寫最後答案的風險",
                        prompt: "模擬弱答案只寫「15」。選出最有助爭取方法分及避免追蹤錯誤的兩項證據。",
                        response: "15",
                        options: [
                            { id: "trace", label: "列出每次符合條件後的 total 和 count" },
                            { id: "condition", label: "顯示只有 score >= 10 才更新" },
                            { id: "colour", label: "把答案寫成藍色" },
                            { id: "sort", label: "先把列表改成降序" }
                        ],
                        correctIds: ["trace", "condition"],
                        feedback: "追蹤題的中間值可展示方法，也可及早發現條件或索引出錯。"
                    },
                    exam: {
                        title: "重組一次正確追蹤",
                        prompt: "依輸入次序建立所有會更新累計值的追蹤列。",
                        blocks: [
                            { id: "row-12", text: "score=12 → total=12, count=1" },
                            { id: "row-18", text: "score=18 → total=30, count=2" },
                            { id: "row-15", text: "score=15 → total=45, count=3" },
                            { id: "distractor", text: "score=7 → total=19, count=2" }
                        ],
                        targetIds: ["row-12", "row-18", "row-15"],
                        model: "12 → (12,1)；18 → (30,2)；15 → (45,3)；輸出 45 ÷ 3 = 15。"
                    },
                    challenge: {
                        title: "處理零除邊界",
                        question: "若所有 scores 都小於 10，原算法會出現甚麼問題？以偽代碼修改輸出部分，使算法能安全處理這個情況。",
                        marks: 4,
                        checklist: ["指出 count 會保持 0", "指出 total / count 會引致除以零", "在除法前測試 count > 0", "count = 0 時輸出合適訊息或預設結果"],
                        model: "若沒有合格分數，count = 0，計算 total / count 會產生除以零錯誤。可改為：IF count > 0 THEN OUTPUT total / count ELSE OUTPUT '沒有合格分數' ENDIF。",
                        route: "chd.2.html"
                    }
                }
            },
            {
                id: "web-security",
                topicId: "eb-2",
                label: "網頁表單與保安",
                icon: "WEB",
                paperStyle: "情境資料回應 · 評估",
                minutes: 12,
                visual: {
                    type: "form",
                    title: "學生作品上載表格",
                    fields: ["學生編號", "班別", "作品檔案", "聯絡電郵"],
                    issues: ["沒有檔案類型提示", "只在瀏覽器檢查", "錯誤訊息寫『Invalid』"]
                },
                scenario: "學校建立作品上載網站。現時表格只用 JavaScript 檢查，伺服器收到檔案後直接儲存原檔名。",
                layers: {
                    foundation: {
                        title: "分辨介面與保安評分點",
                        prompt: "模擬弱答案是「加密網站便安全」。選出最需要補上的三項措施。",
                        response: "加密網站便安全。",
                        options: [
                            { id: "server-validation", label: "伺服器端重新驗證檔案類型、大小和欄位" },
                            { id: "safe-name", label: "重新命名檔案並避免把上載目錄當作可執行程式位置" },
                            { id: "feedback", label: "提供具體錯誤訊息及允許格式提示" },
                            { id: "client-only", label: "只保留 JavaScript 檢查即可" }
                        ],
                        correctIds: ["server-validation", "safe-name", "feedback"],
                        feedback: "HTTPS 保護傳輸，但不能取代伺服器驗證、檔案處理和可用性設計。"
                    },
                    exam: {
                        title: "建立完整請求流程",
                        prompt: "依資料流次序建立安全上載的四個步驟。",
                        blocks: [
                            { id: "client", text: "瀏覽器先提示必填欄及允許的檔案類型；" },
                            { id: "request", text: "表格經 HTTPS 以 POST 傳送到伺服器；" },
                            { id: "server", text: "伺服器重新驗證大小、類型和使用者權限，並產生安全檔名；" },
                            { id: "response", text: "成功後才保存記錄並回傳清楚結果，失敗則不寫入。" },
                            { id: "distractor", text: "把學生密碼寫入 Cookie 方便下次讀取。" }
                        ],
                        targetIds: ["client", "request", "server", "response"],
                        model: "瀏覽器先提示必填欄及允許的檔案類型；表格經 HTTPS 以 POST 傳送到伺服器；伺服器重新驗證大小、類型和使用者權限，並產生安全檔名；成功後才保存記錄並回傳清楚結果，失敗則不寫入。"
                    },
                    challenge: {
                        title: "以準則評估方案",
                        question: "評估「只加入 HTTPS 便可安全上載作品」這個建議。提出判斷、兩項理由及兩項改善。",
                        marks: 6,
                        checklist: ["明確判斷建議不足", "說明 HTTPS 只保護傳輸機密性／完整性", "指出惡意或不合規檔案仍可被上載", "提出伺服器端驗證", "提出安全檔名／隔離儲存／權限控制其中一項", "把改善連回防止的風險"],
                        model: "建議不足。HTTPS 可加密瀏覽器與伺服器之間的傳輸，減少途中被竊聽或竄改，但不會判斷檔案內容是否安全，攻擊者仍可提交超大或惡意檔案。伺服器應重新檢查類型及大小，並以新檔名把檔案存於不可執行的隔離位置，只有獲授權使用者可存取。",
                        route: "eb.2.html"
                    }
                }
            }
        ]
    });

    window.HKDSE_ICT_EXAM_PRACTICE = examPractice;
})();
