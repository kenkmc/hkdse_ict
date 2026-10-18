# 課程手冊資料格式與內容準則（2026-10-18）

教材資料使用 UTF-8 JSON，放於 course-manual/data/{data,network,programming,context}.json。根物件 {"schemaVersion":1,"units":[...]}。全部文字為繁體中文；只寫自己的分檔，不改 renderer 或共用檔。

每個 unit：
- id：既有 course_data.js ID，例 cha-1。
- title、syllabusRef、intro（完整自學導言）、prerequisites（已有課題 ID 陣列）、readiness {question,answer}。
- outcomes：4–8 個可檢查的能力句子。
- vocabulary：[{term,english,meaning,example}]，包含本課必要中英字詞。
- sections：按知識先後排列的教學小節，涵蓋本課全部課程內容。每節 {id,title,explanation:[段落...],worked:{question,steps:[...],answer},check:{question,options:[四個純文字],correct:0至3,feedback:[四項針對該選項的解釋]},code?:{language,text},table?:{headers:[...],rows:[[...],...]},links?:[{label,href}]}。
- practice：[{id,level:"foundation"|"exam"|"transfer",question,hints:[具體提示...],answer,marking:[{point,marks:正整數}],code?:{language,text},table?:{headers,rows}}]，每層至少一題，整組至少 6 題；進階題必須有陌生情境／取捨／多步推論及真正完整範答，不能只說「參考課文」。分數是原創練習用途，不是官方等級換算。
- practical：{title,tools:[工具／準備...],steps:[可依次操作...],deliverables:[實際交出成果...],tests:[{input,expected,reason}],answerNotes:[實作核對重點...]}。必須有本頁能直接找到的材料／數據／程式，不能只叫學生自己找資料或依賴付費軟件；無工具課以可重現的情境資料分析實作。
- teacher：{periods:[{title,minutes:40或80,objective,activities:[{minutes,action,evidence}]}],diagnostic:{question,expected,ifWrong},differentiation:{support,stretch},exitTicket:{question,answer},homework,assessmentNotes:[...] }。每節課各活動時間加總等於 minutes；是可調整的建議教案，非聲稱官方課時。
- mastery：[{skill,evidence,remediation}] 具體技能／獨立表現與重學指引。

內容要求：從零定義必要術語，以完整連貫解說解釋「為何／如何／何時」，不要只列考試關鍵字；各題數據、完整演算與參考答案必須互相一致。每 unit 至少 4 個 sections，各節通常 2–4 個真正教學段落；內容大的單元需要更多小節。保留原生演示連結，不重造同類動畫。教案、課文與題目須具體且各課不同，不要批量換名模板。

安全與範圍：不承諾 5**、不把自評／已讀當成掌握；不提供真實學生資料；課程外進階內容明確寫「延伸」。SBA 提供流程及證據規準，不提供可直接提交為本人作品的完整專題。學生需兩個選修；三個選修的資源全部提供。網站維持不加入外部評核網站連結的既有偏好；可引用教育局 2021 課程文件。資料可引用本站檔案，href 以網站根目錄相對路徑（如 cha.3.html#sim-twos-complement-workbench），renderer 加 ../。
