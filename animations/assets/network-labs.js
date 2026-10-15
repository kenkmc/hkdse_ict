/* Topic-specific teaching traces. All addresses, keys and records are examples. */
(() => {
'use strict';
const node = (label, value, active = false, tone) => ({label, value, active, ...(tone ? {tone} : {})});
const step = (title, detail, nodes, extra = {}) => ({title, detail, nodes, ...extra});
const quiz = (text, options, answer, explanation) => ({text, options, answer, explanation});
const lab = (target, title, steps, question) => ({target, title, steps, question});
window.ICT_TOPIC_LABS = {...window.ICT_TOPIC_LABS,
'chc.1': [
lab('#s1', 'LAN 與 WAN：一份功課的旅程', [
step('同一校舍共享', '電腦與校內檔案伺服器經交換器連接，屬局部區域網絡。LAN 由地理範圍及管理方式界定，並非由電腦數目決定。', [node('電腦室', 'LAN', true),node('交換器','校內轉送'),node('檔案伺服器','校內資源')]),
step('前往另一校舍', '路由器把不同網絡連接。跨地區連接通常使用電訊服務供應商提供的鏈路；WAN 也可使用租用專線。', [node('校舍 A','LAN'),node('路由器與電訊鏈路','WAN',true),node('校舍 B','LAN')]),
step('比較選擇', '範圍、成本、管理及實際鏈路容量共同影響設計；不能一概說所有 LAN 都比所有 WAN 快。', [node('LAN','小範圍／本地管理'),node('WAN','跨地區連接',true)])
], quiz('連接香港及海外兩間分校的網絡主要屬於？',['LAN','WAN','因電腦少所以不是網絡'],1,'WAN 連接較大地理範圍內的網絡。')),
lab('#s2', '客戶端／伺服器與對等網絡的資源請求', [
step('集中提供服務','客戶端發出檔案請求；伺服器核對帳戶與權限後提供資源。',[node('客戶端','請求 report.pdf',true),node('伺服器','核對權限'),node('備份','集中管理')]),
step('伺服器故障','若只有一台伺服器而沒有備援，依賴該伺服器的服務會受影響；客戶端本機工作仍可能繼續。',[node('客戶端','等候服務'),node('伺服器','故障',true,'warn'),node('備份／備援','降低影響')]),
step('對等共享','PC A 向 PC B 取得檔案時 A 是客戶端、B 是服務提供者；角色可在下一次請求互換。資源與保安設定分散管理。',[node('PC A','這次要求檔案'),node('PC B','這次提供檔案',true),node('PC C','可提供其他資源')])
], quiz('在對等網絡中，每部電腦是否永遠同時提供和索取資料？',['是，角色永不改變','不是；它可以擔當兩種角色，視乎當次通訊'],1,'對等描述電腦可直接共享資源，並非每部電腦每刻都必須提供服務。')),
lab('#s3', '交換器、路由器及 AP 如何分工', [
step('無線接入','手機的無線網絡介面透過 AP 接入 LAN。AP 把無線與有線網段橋接；它本身不必提供互聯網路由。',[node('手機 NIC','無線訊框',true),node('AP','橋接 LAN'),node('交換器','有線連接')]),
step('同一 LAN 轉送','交換器依據學習到的 MAC 位址表，把已知單播訊框送往適當連接埠。未知目的地及廣播可能向多個埠轉送。',[node('交換器','查 MAC 位址表',true),node('埠 2','目的裝置'),node('其他埠','已知單播時不必全送')]),
step('跨網絡轉送','路由器根據目的 IP 及路由表選擇下一跳。數據機／光纖終端處理接入鏈路；家用設備常把多種功能結合。',[node('路由器','查 IP 路由表',true),node('數據機／ONT','接入供應商鏈路'),node('互聯網','其他網絡')])
], quiz('哪個設備主要根據目的 IP 選擇跨網絡路徑？',['交換器','路由器','網絡介面卡'],1,'交換器一般依 MAC 轉送 LAN 訊框；路由器依 IP 路由。')),
lab('#game', '從裝置到互聯網：按功能選設備', [
step('先建立 LAN','電腦經 NIC 連到交換器；手機經 AP 接入同一 LAN。',[node('電腦 → NIC','有線'),node('手機 → AP','無線',true),node('交換器','校內 LAN')]),
step('加入閘道','路由器連接 LAN 與供應商網絡，成為裝置前往其他網絡的預設閘道。',[node('LAN','本地網絡'),node('路由器','預設閘道',true),node('接入設備','數據機／ONT')]),
step('實體與邏輯分開','圖中的排列是一種可行設計；家用路由器可能內建交換器、AP 及數據機功能，不代表一定要四個分開的盒子。',[node('四種功能','可獨立實作'),node('家用設備','常整合多種功能',true)])
], quiz('家中只有一個 Wi-Fi 路由器盒子，是否表示沒有交換器或 AP 功能？',['是','否，功能可能整合在同一設備'],1,'須按設備功能判斷，不能只數盒子。'))
],
'chc.2': [
lab('#tcpip', 'TCP：失序、遺失與重傳', [
step('傳送資料','這裡用資料段 A、B、C 作示意。TCP 序號實際標示位元組位置；IP 負責盡力而為傳送資料報。',[node('發送端','A → B → C',true),node('網絡','可能失序／遺失'),node('接收端','等待串流')]),
step('B 遺失','A、C 到達，B 未到。接收端可暫存失序的資料；確認與逾時計時協助發送端偵測未確認資料。',[node('A','已收到'),node('B','遺失',true,'warn'),node('C','暫存等待')]),
step('重傳並排序','發送端重傳未確認資料 B；接收端依序把 A、B、C 交給應用程式。TCP 提供可靠的有序串流，但不保證永遠能連通或固定延遲。',[node('重傳 B','抵達',true,'good'),node('接收端','A → B → C'),node('應用程式','原有資料順序')])
], quiz('只有 IP 已傳送資料報，是否保證資料必定到達並保持次序？',['是','否；IP 本身不提供此保證'],1,'TCP 利用序號、確認及重傳等機制提供可靠的有序串流。')),
lab('#ip', 'IPv4、子網路與預設閘道', [
step('讀取設定','裝置 IP 為 192.168.1.10，子網路遮罩為 255.255.255.0（/24），同網段目的地可在 LAN 內直接通訊。',[node('本機','192.168.1.10/24',true),node('同網段','192.168.1.20'),node('閘道','192.168.1.1')]),
step('本地目的地','192.168.1.20 與本機在此 /24 子網路中。裝置使用 LAN 上的位址解析機制取得對方 MAC，毋須把 IP 封包交給閘道轉送。',[node('本機','→ LAN',true),node('目的地','192.168.1.20'),node('閘道','這次不負責路由')]),
step('外部目的地','203.0.113.80 是文件示例位址，不在本機子網路；本機把封包交給 192.168.1.1，再由路由器選下一跳。IPv6 位址長 128 位元，IPv4 為 32 位元。',[node('本機','192.168.1.10'),node('閘道','192.168.1.1',true),node('外部示例','203.0.113.80')])
], quiz('判斷兩個 IPv4 位址是否同一子網路，還需要甚麼？',['只看第一個數字','子網路遮罩／前綴長度','檔案副檔名'],1,'遮罩／前綴長度界定網絡部分。')),
lab('#dns', 'DNS 查詢：快取、遞迴解析與 TTL', [
step('先檢查快取','輸入 www.example.com。瀏覽器、作業系統或解析器可能已有尚未過期的記錄，並非每次都從根伺服器開始。',[node('使用者','www.example.com',true),node('快取','未命中'),node('解析器','開始查詢')]),
step('逐層尋找','在快取未命中的簡化情況，解析器循根 → .com → example.com 權威伺服器的轉介尋找答案。根伺服器通常給轉介，並非儲存每個網站的 IP。',[node('根','轉介 .com'),node('.com','轉介權威伺服器'),node('權威伺服器','回答記錄',true)]),
step('回覆及快取','示例 A 記錄為 192.0.2.80、TTL 300 秒（教學數據，非實際查詢結果）。DNS 只完成名稱解析；之後才建立網絡連線。',[node('解析器','快取至 TTL 屆滿'),node('本機','收到 192.0.2.80',true),node('下一步','連線至伺服器')])
], quiz('DNS 的主要工作是？',['下載整個網站','把域名解析為相關 DNS 記錄，例如 IP 位址','替所有訊息加密'],1,'DNS 解析與下載網頁是不同階段。')),
lab('#url', '逐段拆解 URL', [
step('協定與主機','https://www.example.com:443/ict/ch2.html?lang=zh#dns 中，https 指方案，www.example.com 是主機名稱，443 是明確指定的連接埠。',[node('方案','https',true),node('主機','www.example.com'),node('連接埠','443')]),
step('路徑與查詢','/ict/ch2.html 是路徑；?lang=zh 是查詢部分，可向伺服器提供參數。URL 路徑不一定對應實體檔案。',[node('路徑','/ict/ch2.html',true),node('查詢','lang=zh'),node('伺服器','依請求產生回應')]),
step('片段識別碼','#dns 是片段，通常由瀏覽器定位頁內元素，不會作為 HTTP 請求目標的一部分傳給伺服器。',[node('HTTP 請求','/ict/ch2.html?lang=zh'),node('瀏覽器片段','#dns',true),node('頁內位置','DNS 段落')])
], quiz('通常不會隨 HTTP 請求目標傳到伺服器的是？',['路徑','查詢字串','#dns 片段'],2,'片段通常供用戶端定位資源內的位置。')),
lab('#protocols', 'HTTPS 與電郵協定：安全及用途', [
step('HTTPS 建立安全通道','HTTPS 是 HTTP 配合 TLS。瀏覽器驗證網站憑證及主機名稱，建立加密連線；鎖頭不代表網站內容必定誠實或安全。',[node('瀏覽器','驗證憑證',true),node('TLS','機密性及完整性'),node('網站','持有相應私鑰')]),
step('寄出電郵','寄件客戶端用 SMTP 交郵件給伺服器，郵件伺服器之間也使用 SMTP 轉送。SMTP 本身與加密是兩個概念，可配合 TLS。',[node('寄件客戶端','SMTP'),node('寄件伺服器','SMTP',true),node('收件伺服器','儲存郵件')]),
step('讀取與同步','POP3 以下載郵件為主，設定可保留伺服器副本；IMAP 管理伺服器信箱及同步資料夾／已讀狀態，適合多裝置。兩者均不負責寄出郵件。',[node('POP3','下載為主'),node('IMAP','同步伺服器信箱',true),node('SMTP','寄出／轉送')])
], quiz('手機及電腦要同步資料夾與已讀狀態，應優先選哪個？',['SMTP','IMAP','DNS'],1,'IMAP 讓多個客戶端管理及同步伺服器上的信箱。'))
],
'pki_animation': [
lab('body', '加密：收件人公鑰 → 收件人私鑰', [
step('確定收件人','Alice 先取得並驗證 Bob 的公鑰與身份綁定；若使用攻擊者替換的公鑰，單靠加密仍可能把訊息交給錯的人。',[node('Alice','明文'),node('Bob 公鑰','已驗證身份',true),node('Eve','可看公鑰')]),
step('公鑰加密','概念模型：Alice 用 Bob 公鑰加密，Eve 能攔截密文但沒有 Bob 私鑰。真實系統常用混合加密：對稱金鑰加密資料，非對稱機制保護／協商金鑰。',[node('Bob 公鑰','加密',true),node('傳輸內容','密文'),node('Eve','不能用自己私鑰解開')]),
step('私鑰解密','Bob 用與公鑰配對的私鑰解密。私鑰必須保密；本頁展示各角色私鑰只是教學安排。此流程本身不驗證寄件人身份。',[node('Bob 私鑰','解密',true),node('Bob','明文'),node('寄件人驗證','需其他機制')])
], quiz('Alice 要只讓 Bob 閱讀，概念上使用哪把公鑰？',['Alice 公鑰','Bob 公鑰','Eve 公鑰'],1,'以收件人的公鑰加密，由相應私鑰解密。')),
lab('body', '數碼簽署：摘要、簽章及驗證', [
step('先計算摘要','Alice 對訊息計算雜湊摘要。摘要不是加密；改動訊息通常會產生不同摘要。這裡以 H(M) 示意，不執行真正密碼運算。',[node('訊息 M','明文'),node('雜湊','H(M)',true),node('私鑰','只由 Alice 保管')]),
step('簽署並傳送','簽署演算法使用 Alice 私鑰及訊息摘要產生簽章；傳送明文 M 與簽章。不要把此過程理解成「私鑰加密整封信」。',[node('Alice 私鑰','產生簽章',true),node('傳輸','M + 簽章'),node('Eve','可直接閱讀 M')]),
step('公鑰驗證','Bob 重新計算收到訊息的摘要，用可信的 Alice 公鑰驗證簽章。內容更改或公鑰錯誤會使驗證失敗；有效簽章仍以私鑰未洩漏及公鑰可信為前提。',[node('Bob','重新計算 H(M)'),node('Alice 公鑰','驗證簽章',true),node('結果','完整性及來源證據')])
], quiz('只有簽署而未加密的明文，Eve 能否閱讀？',['能','不能，簽章等於加密'],0,'簽署本身不提供保密性，任何人也可用公鑰驗證。')),
lab('body', 'PKI：公鑰如何連繫網站身份', [
step('憑證綁定','數碼憑證包含主體名稱、公鑰、有效期等資料，並由發證機構 CA 簽署。憑證不是私鑰。',[node('憑證','名稱 + 公鑰 + 有效期'),node('CA','簽署憑證',true),node('網站私鑰','不公開')]),
step('驗證憑證','客戶端檢查信任鏈、憑證有效期、主機名稱及適用的撤銷狀態；只檢查「有憑證」並不足夠。',[node('信任鏈','可信 CA'),node('名稱及有效期','需要匹配',true),node('撤銷狀態','按機制檢查')]),
step('區分安全承諾','通過憑證驗證及相應握手，可建立受保護通道。這不保證商家可信、內容無詐騙，亦不能防止使用者裝置已被入侵。',[node('TLS','保護通訊',true),node('內容真確性','仍須判斷'),node('使用者裝置','仍須保安')])
], quiz('數碼憑證通常不會包含哪項？',['網站公鑰','CA 簽章','網站私鑰'],2,'私鑰由擁有人保密；憑證用於公開公鑰與身份的綁定。'))
],
'db_simulator': [
lab('#sql-topic-labs', 'SELECT 與 WHERE：逐列篩選再投影', [
step('FROM 取得資料','固定教學數據，先從 STUDENT 資料表取出資料列。這是理解查詢的邏輯順序；引擎實際執行計劃可以不同。',[node('FROM','STUDENT',true)],{table:{headers:['SID','SName','SGender'],rows:[['S001','陳大文','M'],['S002','李嘉欣','F'],['S004','黃小玲','F']]}}),
step('WHERE 篩選','條件 SGender = \'F\' 保留兩筆符合的記錄。SQL 的文字常值以單引號包住。',[node('S001','不符合'),node('S002','符合',true),node('S004','符合',true)],{code:"WHERE SGender = 'F'"}),
step('SELECT 選欄','只顯示 SName。沒有 ORDER BY 時，結果次序不應視為有保證。',[node('SELECT','SName',true)],{table:{headers:['SName'],rows:[['李嘉欣'],['黃小玲']]},code:"SELECT SName FROM STUDENT WHERE SGender = 'F';"})
], quiz('WHERE 主要用來選擇甚麼？',['資料列','顯示字體','欄位名稱'],0,'WHERE 以條件篩選資料列；SELECT 決定顯示的運算式及欄位。')),
lab('#sql-topic-labs', 'GROUP BY 與 HAVING：先分組再比較', [
step('分組','EXAM 按 SubCode 分組：ICT 的 85、92 為一組，ENG 的 70、88、78 為另一組。',[node('ICT','85, 92',true),node('ENG','70, 88, 78')]),
step('聚合','ICT 平均 (85+92)/2 = 88.5；ENG 平均 (70+88+78)/3 ≈ 78.67。COUNT(*) 計算列數；AVG(Mark) 忽略 NULL。',[node('ICT AVG','88.5',true),node('ENG AVG','78.67')]),
step('HAVING 篩選組別','HAVING AVG(Mark) > 80 只保留 ICT。WHERE 在分組前篩選個別記錄，HAVING 在分組後篩選組別。',[node('ICT','保留',true,'good'),node('ENG','排除')],{code:'SELECT SubCode, AVG(Mark) AS AvgMark\nFROM EXAM GROUP BY SubCode\nHAVING AVG(Mark) > 80;'})
], quiz('篩選平均分大於 80 的科目，應用哪項？',['WHERE AVG(Mark) > 80','HAVING AVG(Mark) > 80'],1,'聚合後的組別條件放在 HAVING。')),
lab('#sql-topic-labs', 'INNER JOIN、LEFT JOIN 與 NULL', [
step('以鍵值配對','STUDENT.SID 連至 EXAM.SID。S001 有兩個考試記錄；S005 沒有。JOIN 條件不可省略，否則可能產生笛卡兒積。',[node('STUDENT','S001, S005'),node('EXAM','S001/ICT/85；S001/ENG/70',true)]),
step('INNER JOIN','內部連接只保留匹配記錄，S001 會因兩次配對而出現兩列；S005 不出現。',[node('INNER JOIN','只保留匹配',true)],{table:{headers:['SID','SubCode','Mark'],rows:[['S001','ICT','85'],['S001','ENG','70']]}}),
step('LEFT JOIN','左連接另保留 S005，右表欄位以 NULL 填充。NULL 表示未知／缺少資料，不等於 0 或空字串；用 IS NULL 判斷。',[node('S005','保留',true),node('右表欄位','NULL')],{table:{headers:['SID','SubCode','Mark'],rows:[['S001','ICT','85'],['S001','ENG','70'],['S005','NULL','NULL']]}})
], quiz('要找完全沒有考試記錄的學生，LEFT JOIN 後應測試哪個？',['E.Mark = NULL','E.SID IS NULL','E.Mark = 0'],1,'檢查右表鍵欄位 IS NULL 可判斷沒有匹配記錄，避免把有記錄但成績未知的學生誤選。')),
lab('#sql-topic-labs', '主鍵、外鍵及實體關係', [
step('識別實體','STUDENT 的 SID 唯一識別學生；SUBJECT 的 SubCode 唯一識別科目。主鍵須唯一並不可為 NULL。',[node('STUDENT','PK: SID',true),node('SUBJECT','PK: SubCode')]),
step('交接實體','EXAM 用 (SID, SubCode) 作複合主鍵；單獨 SID 可重複，整個組合不能重複。兩個外鍵分別參照學生與科目。',[node('EXAM','PK: (SID, SubCode)',true),node('SID','FK → STUDENT'),node('SubCode','FK → SUBJECT')]),
step('參照完整性','在開啟外鍵約束時，新增不存在學生 S999 的考試記錄會被拒絕。學生可有 0 至多個考試記錄；實際基數與參與約束仍取決於題目及資料庫約束。',[node('INSERT S999/ICT','拒絕',true,'warn'),node('STUDENT','必須先有 S999'),node('EXAM','參照有效學生')])
], quiz('學生同時應考 ICT 及 ENG，EXAM 的 SID 能否重複？',['能，只要 (SID, SubCode) 組合唯一','不能，SID 是整個主鍵'],0,'複合主鍵的唯一性適用於整組欄位。')),
lab('#sql-topic-labs', 'UPDATE 的條件與 SQL 方言', [
step('先預覽範圍','更新英文成績前先 SELECT ... WHERE SubCode = \'ENG\'，核實將影響哪些記錄。',[node('ICT','85, 92'),node('ENG','70, 88, 78',true)],{code:"SELECT * FROM EXAM WHERE SubCode = 'ENG';"}),
step('按條件更新','SET Mark = Mark + 5 逐列使用原有成績計算新值，只有符合 WHERE 的記錄受影響。',[node('ENG 原分','70, 88, 78'),node('ENG 新分','75, 93, 83',true)],{code:"UPDATE EXAM SET Mark = Mark + 5 WHERE SubCode = 'ENG';"}),
step('辨認環境差異','本工具使用 SQLite，差集使用 EXCEPT。其他系統可能使用 MINUS，資料類型及函數亦有差異；考試應依題目指定語法。',[node('本工具','SQLite / EXCEPT',true),node('其他系統','可能 MINUS'),node('考試','以題目要求為準')])
], quiz('漏寫 UPDATE 的 WHERE，通常會怎樣？',['只更新第一列','更新整個資料表所有符合其他約束的列','自動取消'],1,'沒有 WHERE 時 UPDATE 會作用於所有列；應先預覽及檢查條件。'))
],
'python_converter': [
lab('#python-topic-labs', '輸入型別、賦值及運算追蹤', [
step('input 回傳文字','輸入 12 時，input() 回傳字串 "12"。若要數字運算，需要適當轉換及錯誤處理。',[node('鍵盤','12'),node('text','"12"（str）',true)],{code:'text = input("輸入整數：")'}),
step('轉換後才相加','int(text) 得到整數 12，再計算 12+3=15。字串 "12"+"3" 則是串接，結果為 "123"。',[node('n','12（int）',true),node('n + 3','15'),node('"12" + "3"','"123"')],{code:'n = int(text)\nanswer = n + 3'}),
step('驗證輸入','輸入 abc 無法轉換為整數，會觸發 ValueError。語法正確不代表所有輸入都可成功執行。',[node('輸入','abc',true,'warn'),node('int("abc")','ValueError'),node('改良','驗證／例外處理')])
], quiz('Python 的 input() 回傳甚麼型別？',['int','str','自動按內容選型別'],1,'input() 回傳字串；數值運算前要明確轉換。')),
lab('#python-topic-labs', '選擇結構：邊界值測試', [
step('條件','例題自行訂定 50 分及格，與 DSE 等級界線無關。if score >= 50 判斷是否走及格分支。',[node('score','49',true),node('score >= 50','False'),node('輸出','不及格')],{code:'if score >= 50:\n    print("及格")\nelse:\n    print("不及格")'}),
step('測試邊界','score=50 時條件為 True；若誤寫 >50，會錯誤排除剛好 50 的情況。',[node('score','50',true),node('score >= 50','True'),node('輸出','及格')]),
step('比較測試資料','49、50、51 是邊界附近測試；另需正常、異常及極端輸入，才能較完整評估程式。',[node('49','False'),node('50','True',true),node('51','True')])
], quiz('要包括剛好 50，應寫哪個？',['score > 50','score >= 50'],1,'>= 同時包括大於及等於。')),
lab('#python-topic-labs', '迭代與累加：range 不包括終點', [
step('初始化','total=0；range(1,4) 依次產生 1、2、3，不包括 4。',[node('total','0',true),node('range(1,4)','1, 2, 3')],{code:'total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)'}),
step('前兩輪','i=1 時 total 由 0 變 1；i=2 時由 1 變 3。賦值右邊使用更新前的值。',[node('第 1 輪','0 + 1 = 1'),node('第 2 輪','1 + 2 = 3',true)]),
step('最後一輪並退出','i=3 時 total=6；range 已沒有下一個值，因此輸出 6。若每輪把 total 重設為 0，便不是累加。',[node('第 3 輪','3 + 3 = 6',true),node('輸出','6')],{table:{headers:['i','執行前 total','執行後 total'],rows:[['1','0','1'],['2','1','3'],['3','3','6']]}})
], quiz('range(1,4) 會產生哪組值？',['1,2,3','1,2,3,4','0,1,2,3'],0,'range 的 stop 值不包括在序列內。')),
lab('#python-topic-labs', '流程圖：判斷、分支與迴圈', [
step('使用正確圖形','開始／結束用終端圖形，處理用長方形，輸入／輸出用平行四邊形，條件判斷用菱形。',[node('終端','開始／結束'),node('處理','total = 0'),node('菱形','n > 0 ?',true)]),
step('明確標示分支','n>0 的 True 路徑執行輸出及 n=n-1，再回條件；False 路徑離開迴圈。箭頭方向及分支標籤不能省略。',[node('判斷','n > 0 ?',true),node('True','輸出 n → n=n-1 → 回判斷'),node('False','結束')]),
step('檢查可終止性','若初始 n=3，每輪減 1，最後 n=0 離開。若遺漏更新，條件可能一直為 True。文字轉換只是輔助，須逐路徑檢查邏輯。',[node('n 變化','3 → 2 → 1 → 0',true),node('退出條件','n > 0 為 False'),node('缺少更新','可能無限迴圈',false,'warn')])
], quiz('while n>0 的迴圈每輪都不改動 n，n 初始為 3，會怎樣？',['一定只執行 3 次','可能永遠無法離開迴圈'],1,'必須確保狀態更新或其他退出方式會令迴圈終止。')),
lab('#python-topic-labs', '語法、執行期及邏輯錯誤', [
step('語法錯誤','if x > 0 缺少冒號，Python 解析時會報 SyntaxError。此工具的文字轉換按鈕不代表已完成真正語法分析。',[node('語句','if x > 0',true,'warn'),node('修正','加入 :')]),
step('執行期錯誤','10/0 語法有效，但執行時會發生 ZeroDivisionError。必須測試實際輸入及執行路徑。',[node('語句','10 / 0',true,'warn'),node('分類','執行期錯誤')]),
step('邏輯錯誤','計算長方形面積卻用 width+height，程式可正常執行但答案錯誤。以已知答案的測試資料核對，例如 3×4 應為 12。',[node('錯誤公式','3 + 4 = 7'),node('正確結果','3 × 4 = 12',true,'good'),node('分類','邏輯錯誤')])
], quiz('成功執行是否代表程式答案正確？',['是','否，仍可能有邏輯錯誤'],1,'要用預期結果及多組測試資料檢查邏輯。'))
]
};
})();
