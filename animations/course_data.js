/* Single source for the catalogue and random navigation. Only real pages. */
const siteConfig={siteName:'ICT 學習資源網',domain:'kenkmc.github.io/hkdse_ict'};
function courseGroup(id,category,entries){return {id,category,items:entries.map(([key,title,desc])=>({id:key,title,desc,link:key+'.html',status:/^(cha\.|chc\.[12]$)/.test(key)?'原課增強':'課程重點與互動示例'}))};}
const courseData=[
courseGroup('core_a','必修 A · 資訊處理',[
['cha.1','資訊處理簡介','資訊系統、數據與資訊、資訊處理及素養'],['cha.2','數據組織及數據控制','數據分級、有效性檢驗、驗證、奇偶檢測、存取'],['cha.3','數據表示','進制、補碼、字符編碼、多媒體、取樣及大小'],['cha.4','試算表','公式、函數、參照、篩選、情境與樞紐分析'],['cha.5','數據庫','資料表、關鍵碼、表單、報告及單表SQL']]),
courseGroup('core_b','必修 B · 電腦系統基礎',[
['chb.1','輸入及輸出設備','感測、數碼化、輸入輸出選擇與限制'],['chb.2','電腦硬件','CPU、GPU、寄存器、機器周期、記憶體及儲存'],['chb.3','電腦軟件','操作系統、實用程式、運作方式與虛擬化']]),
courseGroup('core_c','必修 C · 互聯網及其應用',[
['chc.1','建網及互聯網基本知識','LAN/WAN、客戶機伺服器、硬件及組網'],['chc.2','互聯網協定','TCP/IP、IP位址、DNS、HTTP、電郵'],['chc.3','互聯網服務及應用','搜尋、串流、雲端、IoT與服務選擇'],['chc.4','初級網頁創作','HTML結構、連結、無障礙與出版'],['chc.5','網上威脅','惡意軟件、釣魚、攔截、未授權存取及DoS'],['chc.6','網絡保安措施','認證、授權、防火牆、加密、PKI與證書']]),
courseGroup('core_d','必修 D · 計算思維與程式編寫',[
['chd.1','問題建構和分析','規格、分解、抽象化與模式識別'],['chd.2','算法設計（一）','流程圖、偽代碼、空運行、布爾邏輯'],['chd.3','算法設計（二）','序列、選擇、迭代、陣列及模組化'],['chd.4','Python編程入門','變量、類型、賦值、運算及輸入輸出'],['chd.5','Python綜合解難','列表、字串、累積、檢索與算法比較'],['chd.6','程式測試和除錯','正常、邊界、無效數據與錯誤類型']]),
courseGroup('core_e','必修 E · 資訊及通訊科技對社會的影響',[
['che.1','科技創新','AI、數據科學、三維打印、AR及VR'],['che.2','健康及道德議題','人機工程、公平存取、數碼隔閡與道德'],['che.3','知識產權','版權、軟件授權、署名與數碼作品']]),
courseGroup('elective_a','選修 A · 數據庫',[
['eleca.1','運用SQL管理數據','DDL、INSERT、UPDATE、DELETE與交易'],['eleca.2','SQL運算符與函數','條件、聚合、字串、分組'],['eleca.3','多表SQL操作','連接、外連接、一層子查詢'],['eleca.4','關聯式數據庫','候選鍵、主外鍵、完整性、索引與權限'],['eleca.5','數據庫設計與ER圖','基數、參與、ER轉表、3NF與非規範化']]),
courseGroup('elective_b','選修 B · 網絡應用程式開發',[
['elecb.1','客戶機與伺服器通訊','請求回應、TCP通訊埠、GET與POST'],['elecb.2','網絡服務與裝設','DHCP、共享權限、有線及無線裝設'],['elecb.3','網頁編寫與出版','HTML、共用CSS、網站與CMS'],['elecb.4','客戶端與伺服器端編程','驗證、單表檢索更新與cookie'],['elecb.5','綜合網上應用程式','界面、伺服器、數據庫整合及評估']]),
courseGroup('elective_c','選修 C · 算法與程式編寫',[
['elecc.1','算法設計及程式基本知識','類型、交換、累積與算法取捨'],['elecc.2','程式測試和除錯（二）','數值誤差、斷點、存根及追蹤'],['elecc.3','進階控制結構','嵌套循環及執行次數'],['elecc.4','子程式','參數、回傳、作用域與結構化設計'],['elecc.5','數據結構','陣列表示的鏈表、堆疊與隊列'],['elecc.6','檢索及排序','線性/對分、冒泡/插入/選擇及合併'],['elecc.7','文字檔案處理','讀寫、添加、刪除、插入及更新'],['elecc.8','現實生活的程式應用','傳感器、馬達、事件、語音及加速度計']]),
courseGroup('sba','校本評核 · 專題研習',[
['sba.1','由問題到可評估的方案','分析、設計、實作、測試、評估與工作紀錄']])
];
function randomStudy(){const current=location.pathname.split('/').pop();const links=courseData.flatMap(s=>s.items.map(x=>x.link)).filter(x=>x!==current);if(links.length)location.href=links[Math.floor(Math.random()*links.length)];}
if(typeof module!=='undefined')module.exports={siteConfig,courseData};
