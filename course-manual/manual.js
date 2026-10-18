(async function () {
  'use strict';
  const C = window.ICTManualCore, E = C.escape;
  const main = document.getElementById('manual-main'), list = document.getElementById('unit-list');
  let storage;
  try { storage = window.localStorage; } catch (_) { storage = {getItem:()=>null,setItem:()=>{throw new Error('storage unavailable');}}; }
  const state = C.read(storage);
  let units = [], cases = [], activeUnit = null, statusTimer;
  const labels = {foundation:'基礎鞏固',exam:'情境作答',transfer:'高階遷移'};
  const url = (id,tab='text',anchor='') => '?unit='+encodeURIComponent(id)+'&tab='+tab+(anchor?'#'+encodeURIComponent(anchor):'');
  const rootLink = href => /^(?:https?:)/.test(href) ? href : '../'+href;
  const link = l => `<a href="${E(rootLink(l.href))}">${E(l.label)}</a>`;
  const paragraphs = values => (values || []).map(p=>`<p>${E(p)}</p>`).join('');
  const bullets = values => `<ul>${(values||[]).map(p=>`<li>${E(p)}</li>`).join('')}</ul>`;
  const code = obj => obj ? `<p class="tag">${E(obj.language)}</p><pre><code>${E(obj.text)}</code></pre>` : '';
  const table = obj => obj ? `<div class="table-scroll"><table><thead><tr>${obj.headers.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${obj.rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  function notify(text) {
    document.getElementById('save-status').textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(()=>{document.getElementById('save-status').textContent='';},4500);
  }
  function persist(quiet=false) {
    const ok = C.save(storage,state);
    if (!quiet || !ok) notify(ok?'已儲存在此瀏覽器。可在「我的學習」匯出備份。':'此瀏覽器無法儲存；請先複製筆記，再離開本頁。');
  }
  function renderList(query='') {
    const filtered = units.filter(u=>(u.title+' '+u.syllabusRef+' '+u.sections.map(s=>s.title).join(' ')+' '+u.vocabulary.map(v=>v.term+' '+v.english).join(' ')).toLowerCase().includes(query.toLowerCase()));
    const groups = [['core-a','必修 A · 資訊處理',u=>u.id.startsWith('cha-')],['core-b','必修 B · 電腦系統',u=>u.id.startsWith('chb-')],['core-c','必修 C · 互聯網',u=>u.id.startsWith('chc-')],['core-d','必修 D · 運算與編程',u=>u.id.startsWith('chd-')],['core-e','必修 E · 社會影響',u=>u.id.startsWith('che-')],['elective-a','選修 A · 數據庫',u=>u.id.startsWith('ea-')],['elective-b','選修 B · 網頁開發',u=>u.id.startsWith('eb-')],['elective-c','選修 C · 程式編寫',u=>u.id.startsWith('ec-')],['sba','SBA 與證據',u=>u.id==='tool-sba-prep']];
    list.innerHTML = groups.map(([id,title,filter])=>{
      const matches=filtered.filter(filter);if(!matches.length)return '';
      return `<details open><summary>${E(title)}</summary><ul>${matches.map(u=>`<li><a href="${url(u.id)}" ${activeUnit?.id===u.id?'aria-current="page"':''}>${E(u.title)}</a></li>`).join('')}</ul></details>`;
    }).join('') || '<p>沒有符合的課題。請試另一關鍵字。</p>';
  }
  function checkHtml(unit,section) {
    const saved = C.checkRecord(unit,section,state);
    return `<div class="check" data-check="${E(section.id)}"><fieldset><legend>理解檢查：${E(section.check.question)}</legend><div class="options">${section.check.options.map((o,i)=>`<button type="button" data-choice="${i}" data-section="${E(section.id)}" aria-pressed="${saved?.answer===i}">${String.fromCharCode(65+i)}. ${E(o)}</button>`).join('')}</div></fieldset><p class="feedback ${saved?(saved.correct?'correct':'incorrect'):''}" aria-live="polite">${saved?E((saved.correct?'答對。':'再想一想。')+section.check.feedback[saved.answer]):'先選擇答案，再看針對該選項的解釋。'}</p></div>`;
  }
  function textHtml(unit) {
    return `<h2>本課能做到甚麼</h2>${bullets(unit.outcomes)}<details class="readiness"><summary>先備檢查：${E(unit.readiness.question)}</summary><p>${E(unit.readiness.answer)}</p>${unit.prerequisites.length?`<p>可先重讀：${unit.prerequisites.map(id=>`<a href="${url(id)}">${E(units.find(u=>u.id===id)?.title||id)}</a>`).join('、')}</p>`:'<p>這是起步課題；毋須先學其他課。</p>'}</details><h2>課文目錄</h2><ol class="section-toc">${unit.sections.map(s=>`<li><a href="#${E(s.id)}">${E(s.title)}</a></li>`).join('')}</ol><details class="glossary"><summary>本課中英詞彙</summary><dl>${unit.vocabulary.map(v=>`<dt>${E(v.term)} · ${E(v.english)}</dt><dd>${E(v.meaning)}<br>例：${E(v.example)}</dd>`).join('')}</dl></details>${unit.sections.map(s=>`<section class="chapter" id="${E(s.id)}"><h2>${E(s.title)}</h2>${paragraphs(s.explanation)}${table(s.table)}${code(s.code)}<div class="worked"><h3>逐步示例</h3><p>${E(s.worked.question)}</p><ol>${s.worked.steps.map(p=>`<li>${E(p)}</li>`).join('')}</ol><p><strong>結果：</strong>${E(s.worked.answer)}</p></div>${s.links?.length?`<p class="section-links">${s.links.map(link).join('')}</p>`:''}${checkHtml(unit,s)}</section>`).join('')}<p class="actions"><a href="${url(unit.id,'practice')}">完成課文後，練習及實作 →</a></p>`;
  }
  function taskHtml(task,unitId,prefix='') {
    const id = prefix+unitId+'/'+task.id, r = state.responses[id] || {}, points = Array.isArray(r.points)?r.points:[];
    const total = task.marking.reduce((a,p)=>a+p.marks,0);
    return `<article class="task" id="task-${E(task.id)}" data-task="${E(id)}"><p class="tag">${E(labels[task.level]||'綜合應用')} · ${total} 分原創練習</p><h3>${E(task.question.split('\n')[0])}</h3>${task.question.includes('\n')?`<p class="task-question">${E(task.question.slice(task.question.indexOf('\n')+1))}</p>`:''}${code(task.code)}${table(task.table)}<label for="answer-${E(task.id)}">先獨立作答／記錄演算</label><textarea id="answer-${E(task.id)}" rows="5" maxlength="30000" data-response="${E(id)}">${E(r.text||'')}</textarea><div class="print-answer-lines"></div><details class="no-print" data-hints="${E(id)}"><summary>需要時看提示</summary><ol>${task.hints.map(h=>`<li>${E(h)}</li>`).join('')}</ol></details><button class="no-print" type="button" data-reveal="${E(id)}" aria-expanded="${!!r.revealed}">核對範答與逐分點</button><div class="task-solution" ${r.revealed?'':'hidden'}><div class="solution">${E(task.answer)}</div><p>逐點自評：勾選表示你認為自己的答案已包含該證據，仍需教師或同儕核對；不作自動文字評分。</p><ul class="rubric">${task.marking.map((p,i)=>`<li><label><input type="checkbox" data-point="${i}" data-response-id="${E(id)}" ${points[i]?'checked':''}><span>${E(p.point)}（${p.marks} 分）</span></label></li>`).join('')}</ul></div></article>`;
  }
  function practicalHtml(unit) {
    const p=unit.practical, r=state.practical[unit.id]||{};
    return `<section class="chapter" id="practical"><h2>實作：${E(p.title)}</h2><h3>工具與材料</h3>${bullets(p.tools)}<h3>操作步驟</h3><ol>${p.steps.map(s=>`<li>${E(s)}</li>`).join('')}</ol><h3>交出甚麼</h3>${bullets(p.deliverables)}${table({headers:['測試輸入／情況','預期結果','為何測試'],rows:p.tests.map(t=>[t.input,t.expected,t.reason])})}<details><summary>實作核對重點</summary>${bullets(p.answerNotes)}</details><label for="practical-note">記錄成果檔名、測試結果及仍需改善之處</label><textarea id="practical-note" maxlength="30000" data-practical="${E(unit.id)}">${E(r.note||'')}</textarea><p class="muted">檔案不會自動上載；此欄保存文字索引。保留自己的實作原檔及測試證據。</p></section>`;
  }
  function teacherHtml(unit) {
    const t=unit.teacher;
    return `<h2>教學指引</h2><p>以下是可調整的課堂安排。課節時數是示例，不代表已排滿官方建議課時；請配合班情、實作課及學校評核安排。</p><h3>課前診斷</h3><p>${E(t.diagnostic.question)}</p><p><strong>預期：</strong>${E(t.diagnostic.expected)}</p><p><strong>若答錯：</strong>${E(t.diagnostic.ifWrong)}</p>${t.periods.map((p,i)=>`<section class="chapter"><h3>課堂 ${i+1}：${E(p.title)}（${p.minutes} 分鐘）</h3><p>${E(p.objective)}</p>${table({headers:['分鐘','教師／學生活動','學習證據'],rows:p.activities.map(a=>[a.minutes,a.action,a.evidence])})}</section>`).join('')}<h3>照顧學習差異</h3><p><strong>支援：</strong>${E(t.differentiation.support)}</p><p><strong>伸展：</strong>${E(t.differentiation.stretch)}</p><h3>離堂題</h3><p>${E(t.exitTicket.question)}</p><p><strong>參考：</strong>${E(t.exitTicket.answer)}</p><h3>課後實作／課業</h3><p>${E(t.homework)}</p><h3>評估留意</h3>${bullets(t.assessmentNotes)}`;
  }
  function evidenceHtml(unit) {
    const s=C.summary(unit,state);
    return `<h2>能力檢核與重學</h2><p>理解檢查答對 ${s.correct}/${s.total}；已留下練習答案 ${s.attempted}/${s.tasks}；已寫實作紀錄：${s.practical?'是':'未有'}。這些是學習活動紀錄，不是掌握認證。</p><p>用未看範答的新題或自己的原檔作證據。寫清楚「哪個作品／哪項測試」支持你的判斷，請老師或同儕追問理由。</p>${unit.mastery.map((m,i)=>`<section class="evidence-item"><h3>${E(m.skill)}</h3><p><strong>證據：</strong>${E(m.evidence)}</p><p><strong>仍未能做到：</strong>${E(m.remediation)}</p><label for="evidence-${i}">我的證據索引／待請教問題</label><textarea rows="3" id="evidence-${i}" data-evidence="${E(unit.id+'/'+i)}" maxlength="10000">${E(state.evidence[unit.id+'/'+i]?.note||'')}</textarea></section>`).join('')}<div class="notice">高階表現需要在陌生情境中選擇方法、完整解釋因果、檢查邊界及評估取捨。單次高分、看完動畫或勾選清單，都不能換算成 5**。</div><p><a href="?view=exam">用綜合任務再檢查 →</a></p>`;
  }
  function unitHtml(unit,tab) {
    const original=window.HKDSE_ICT.getItemById(unit.id);
    const tabs=[['text','課文與示例'],['practice','練習與實作'],['teacher','教學指引'],['mastery','能力檢核']];
    if(!tabs.some(t=>t[0]===tab))tab='text';
    return `<div class="unit-head"><p class="eyebrow">${E(unit.syllabusRef)} · ${E(C.group(unit.id)==='core'?'必修課題':C.group(unit.id)==='sba'?'SBA 支援':'選修課題')}</p><h1>${E(unit.title)}</h1><p>${E(unit.intro)}</p><p class="actions">${original?`<a href="../${E(original.file)}">課題圖解與動畫</a> <a href="../practice.html?topic=${E(unit.id)}">中央題庫練習</a>`:''}<button type="button" data-print="student">列印課文／工作紙</button><button type="button" data-print="teacher">列印教案與答案</button></p></div><nav class="unit-tabs" aria-label="本課內容">${tabs.map(([id,title])=>`<a href="${url(unit.id,id)}" ${tab===id?'aria-current="page"':''}>${title}</a>`).join('')}</nav>${tab==='text'?textHtml(unit):tab==='practice'?`<h2>由基礎到獨立遷移</h2><p>先獨立作答，再按需要使用提示及核對逐分點。所有題目均為本站原創，分數只描述本題評分點。</p>${unit.practice.map(p=>taskHtml(p,unit.id)).join('')}${practicalHtml(unit)}`:tab==='teacher'?teacherHtml(unit):evidenceHtml(unit)}`;
  }
  function catalogHtml(selected=units) {
    return selected.map(u=>{const s=C.summary(u,state);return `<article class="catalog-unit"><p class="tag">${E(u.syllabusRef)}</p><h3><a href="${url(u.id)}">${E(u.title)}</a></h3><p>${E(u.outcomes[0])}</p><p class="muted">理解檢查 ${s.correct}/${s.total} · 已作答 ${s.attempted}/${s.tasks} · 實作紀錄 ${s.practical?'已有':'未有'}</p></article>`;}).join('');
  }
  function startHtml() {
    return `<h1>由零起步</h1><p>把「看得懂」逐步變成「能解釋、能計算、能獨立做」。先學必修，按學校修讀兩個選修；教材、動畫及工具互相連結，老師可採用同一套內容安排課堂。</p><h2>開始前的五項小準備</h2><ol><li>在自己的資料夾建立 ICT／課文筆記、實作、測試證據三個子資料夾；用能識別日期與版本的檔名，例如 results-v1.csv。檔案名稱不是檔案內容，副檔名也不保證實際格式。</li><li>分清瀏覽器、網頁及本機檔案：瀏覽器顯示網站，本機編輯器修改自己的副本。儲存後重新開啟，確認修改沒有只留在畫面中。</li><li>準備基本四則運算、括號及單位：先把同類量換成相同單位才比較；bit 與 byte 不同，1 byte = 8 bits。每次寫公式、代數值及單位，第三課會逐步教大小計算。</li><li>遇到中英術語，先用本課詞彙表把名稱連到一個實例；不要只抄定義。能說明「輸入是甚麼、如何處理、輸出給誰」才算開始理解。</li><li>答題後先指出錯在概念、運算、遺漏條件還是用字，再修正並隔一段時間重做。這裏的筆記只保存在目前瀏覽器，可在「我的學習」備份。</li></ol><h2>每一課怎樣學</h2><ol><li>做先備檢查；不懂就沿前置課題回學，不須硬猜。</li><li>讀一節課文，自己預測示例下一步，再操作對應動畫。</li><li>回答理解檢查；答錯先讀該選項的原因，再用另一個數值重新解釋。</li><li>做基礎與情境題，先寫答案才看範答。高階題要引用情境證據、推論及限制。</li><li>完成實作、保存原檔、用正常／邊界／異常情況測試；用證據檢核能力。</li><li>用不同情境重做、請教師批改及限時作答。閱讀與自評只是準備，不能代替獨立表現。</li></ol><p class="actions"><a href="${url('cha-1')}">由第一課開始 →</a><a href="?view=path">設定我的兩個選修</a></p><h2>全課程目錄</h2>${catalogHtml()}`;
  }
  function pathHtml() {
    const next=C.next(units,state), selected=C.route(units,state);
    return `<h1>我的學習路徑</h1><p>必修課題全部學習；選修三選二。未選定前仍可學必修，所有選修教材亦可自由瀏覽。</p><fieldset><legend>我修讀的兩個選修</legend><div class="path-choice">${[['elective-a','A 數據庫'],['elective-b','B 網頁開發'],['elective-c','C 程式編寫']].map(([id,text])=>`<label><input type="checkbox" data-elective="${id}" ${state.electives.includes(id)?'checked':''}>${text}</label>`).join('')}</div></fieldset><p id="elective-status" role="status">${state.electives.length===2?'已選兩個選修。':'尚未選齊兩個選修；這份路徑未包括完整選修要求。'}</p><div class="notice"><strong>建議下一步：</strong>${E(next.reason)}<p><a href="${next.unit?url(next.unit,next.tab,next.anchor):'?view=exam'}">${next.unit?E(units.find(u=>u.id===next.unit).title):'綜合應用訓練'} →</a></p></div><h2>循序課題與活動紀錄</h2><p>按課文與先備能力排列；已作答、自評及實作筆記各自記錄，不把瀏覽次數當成掌握率。</p>${catalogHtml(selected)}<h2>SBA 持續證據</h2><p>開始實作時就建立需求、設計、版本及測試紀錄，毋須等到全部理論學完才認識證據流程。</p><a href="${url('tool-sba-prep')}">SBA 流程與證據 →</a>`;
  }
  function plannerHtml() {
    const terms=[['中四：建立資訊與運算基礎',['cha-1','cha-2','cha-3','chb-1','chd-1','chd-2','chd-3'],'交替安排數據表示、硬件及程式追蹤，避免把程式實作押後；每個單元保留課前診斷、獨立作答及補教。'],['中四後段至中五：資料處理與網絡',['cha-4','cha-5','chb-2','chc-1','chc-2','chc-3','chc-4','chc-5','chd-4'],'安排試算表原檔、SQL 查詢、可開啟的網頁與網絡路徑圖作成果；交錯重練位元計算與條件追蹤。'],['中五：社會影響、兩個選修及專題',['che-1','che-2','che-3','ea-1','ea-2','ea-3','eb-1','eb-2','ec-1','ec-2','tool-sba-prep'],'三個選修列作選項，只排學校修讀的兩個；各自按先備鏈進行。SBA 的需求、設計、實施與測試跨課題持續蒐證，時程按當屆校方規定。'],['中六：整合、補漏與限時表達',[],'由能力檢核及作品發現缺口，回到相應課節重學，再做陌生整合題與限時模擬。用同一評分準則比較改寫前後；不要把校內練習百分比換算成公開試等級。']];
    return `<h1>教學規劃與課程對照</h1><p>這套手冊按教育局 2021 課程的五個必修單元及三個選修整理。每課可取得課文、逐步示例、診斷回饋、工作紙、完整範答、實作與教學指引。下面是可調整的先後次序，並非固定校曆。</p><h2>使用前準備</h2>${bullets(['按學校的兩個選修選擇教材；檢查當屆考核及 SBA 規定，校方課時與評估安排優先。','先實做該課的示例及實作，以確認學生裝置、網絡、編輯器與工具可用。試算表需要可儲存公式的軟件；真正伺服器、網絡裝設及實物感應器活動需另備環境。','學生工作紙列印會隱藏提示、範答和自評點；教師列印另含教案及答案。此為公開教材，答案可供學生查閱，正式評核請另設未見題與教師評閱。','以課前診斷決定支援，課中問學生預測和解釋，課後收原檔與測試證據；不能只把活動完成紀錄作學習成果。'])}<div class="schedule">${terms.map(([title,ids,text])=>`<article><h2>${title}</h2><p>${text}</p><p>${ids.map(id=>`<a href="${url(id,'teacher')}">${E(units.find(u=>u.id===id)?.title||id)}</a>`).join(' · ')}</p></article>`).join('')}</div><h2>逐課對照與可教內容</h2>${table({headers:['課程參照','課題／教學指引','可教授的小節','可檢查能力'],rows:units.map(u=>[u.syllabusRef,u.title,u.sections.map(s=>s.title).join('；'),u.outcomes.join('；')])})}<p>以上是本站教材對照，並非官方逐項認證；老師應以正式課程文件及當屆安排核對校本教學計畫。</p><h2>備課與工作紙</h2>${units.map(u=>`<p><a href="${url(u.id,'teacher')}">${E(u.title)}：教學指引與列印</a></p>`).join('')}`;
  }
  function examHtml() {
    const valid=cases.filter(c=>!c.electives?.length||c.electives.every(e=>state.electives.includes(e)));
    return `<h1>綜合應用與高階作答</h1><p>高階訓練重點是把知識用在未見情境、清楚交代因果、比較可行方案、檢查限制及以測試證據評估。5** 是備試目標，這裏沒有可換算該等級的門檻。</p><ol><li>先圈出題目目標、可用資料、限制及要求的產物；不要先背一段通用優點。</li><li>寫出具體措施／方法，連接運作機制，再引用此情境說明結果；比較題採用同一準則。</li><li>計算題列公式、代值、單位及假設；程式／SQL 題處理空集合、重複值、界限、NULL 或失敗情況。</li><li>評估題提出條件與取捨，再給有理由的結論；不要只寫「更快、更安全、更方便」。</li><li>先獨立限時作答再核對評分點，隔一段時間換情境重做；請教師檢查表達、方法與實作。</li></ol><p class="actions"><a href="../answer-lab.html">作答診斷與改寫</a><a href="../mock.html">限時模擬考</a><a href="../mistakes.html">錯題重練</a></p><p>以下只顯示必修任務及符合你兩個選修的組合；先到<a href="?view=path">學習路徑</a>設定。每題都是原創練習，逐分點可作同儕／教師評閱參考。</p>${valid.map(c=>`<section class="chapter"><h2>${E(c.title)}</h2><p>${E(c.context)}</p>${table(c.table)}${c.tasks.map(t=>taskHtml(t,c.id,'case/')).join('')}</section>`).join('')}`;
  }
  function teacherSheet(unit) {
    return `<h1>${E(unit.title)} · 教師用</h1>${teacherHtml(unit)}<h2>課文與示例索引</h2>${unit.sections.map(s=>`<h3>${E(s.title)}</h3><p>${E(s.worked.question)}</p><ol>${s.worked.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol><p>${E(s.worked.answer)}</p><p>理解檢查：${E(s.check.question)}<br>答案 ${String.fromCharCode(65+s.check.correct)}：${E(s.check.feedback[s.check.correct])}</p>`).join('')}<h2>練習與參考答案</h2>${unit.practice.map(p=>`<h3>${E(p.question)}</h3>${code(p.code)}${table(p.table)}<div class="solution">${E(p.answer)}</div><ul class="rubric">${p.marking.map(m=>`<li>${E(m.point)}（${m.marks} 分）</li>`).join('')}</ul>`).join('')}<h2>實作核對</h2><h3>${E(unit.practical.title)}</h3>${bullets(unit.practical.answerNotes)}${table({headers:['測試','預期','理由'],rows:unit.practical.tests.map(t=>[t.input,t.expected,t.reason])})}`;
  }
  function studentSheet(unit) {
    return `<h1>${E(unit.title)} · 課文與工作紙</h1><p>${E(unit.intro)}</p><h2>學習目標</h2>${bullets(unit.outcomes)}${unit.sections.map(s=>`<section class="chapter"><h2>${E(s.title)}</h2>${paragraphs(s.explanation)}${code(s.code)}${table(s.table)}<div class="worked"><h3>逐步示例</h3><p>${E(s.worked.question)}</p><ol>${s.worked.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol><p>${E(s.worked.answer)}</p></div><h3>理解檢查</h3><p>${E(s.check.question)}</p><ol type="A">${s.check.options.map(x=>`<li>${E(x)}</li>`).join('')}</ol><div class="print-answer-lines"></div></section>`).join('')}<h2>獨立練習</h2>${unit.practice.map(p=>`<section class="task"><p>${E(labels[p.level])} · ${p.marking.reduce((s,m)=>s+m.marks,0)} 分</p><h3>${E(p.question)}</h3>${code(p.code)}${table(p.table)}<div class="print-answer-lines"></div></section>`).join('')}<h2>實作：${E(unit.practical.title)}</h2>${bullets(unit.practical.tools)}<ol>${unit.practical.steps.map(x=>`<li>${E(x)}</li>`).join('')}</ol>${bullets(unit.practical.deliverables)}${table({headers:['測試輸入／情況','預期結果','理由'],rows:unit.practical.tests.map(x=>[x.input,x.expected,x.reason])})}`;
  }
  function render(track=true) {
    const params=new URLSearchParams(location.search), id=params.get('unit'), view=params.get('view')||'start';
    activeUnit=units.find(u=>u.id===id)||null;
    const content=activeUnit?unitHtml(activeUnit,params.get('tab')||'text'):id?'<h1>找不到此課題</h1><p>請從目錄選擇課程。</p>':view==='path'?pathHtml():view==='teacher'?plannerHtml():view==='exam'?examHtml():startHtml();
    main.innerHTML = `<div id="screen-content">${content}</div><div class="print-sheet teacher-sheet">${activeUnit?teacherSheet(activeUnit):''}</div><div class="print-sheet student-sheet"></div>`;
    document.title=(activeUnit?.title||({path:'學習路徑',teacher:'教學規劃',exam:'綜合應用',start:'由零起步'}[view]||'課文與教學'))+' · ICT 學習資源網';
    if(activeUnit&&track){state.lastUnit=activeUnit.id;persist(true);window.HKDSEProgress?.recordVisit(activeUnit.id);window.HKDSEProgress?.startPageActivity('manual/'+activeUnit.id);}
    renderList(document.getElementById('unit-search').value);
    if(location.hash){let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch(_){hash='';}document.getElementById(hash)?.scrollIntoView();}
  }
  main.addEventListener('input',event=>{
    const el=event.target;
    if(el.dataset.response){const id=el.dataset.response,old=state.responses[id]||{},value=el.value.slice(0,30000);state.responses[id]={...old,text:value,points:value!==old.text?[]:old.points,editedAt:Date.now()};if(value!==old.text)el.closest('.task').querySelectorAll('[data-point]').forEach(box=>{box.checked=false;});persist(true);}
    if(el.dataset.practical){state.practical[el.dataset.practical]={note:el.value.slice(0,30000),editedAt:Date.now()};persist(true);}
    if(el.dataset.evidence){state.evidence[el.dataset.evidence]={note:el.value.slice(0,10000),editedAt:Date.now()};persist(true);}
  });
  main.addEventListener('change',event=>{
    const el=event.target;
    if(el.dataset.elective){
      const chosen=Array.from(main.querySelectorAll('[data-elective]:checked')).map(e=>e.dataset.elective);
      if(chosen.length>2){el.checked=false;notify('最多選兩個選修；先取消另一個選項再更換。');return;}
      state.electives=chosen;persist();render();
    }
    if(el.dataset.point!==undefined){const id=el.dataset.responseId,r=state.responses[id]||{};const points=Array.isArray(r.points)?r.points:[];points[Number(el.dataset.point)]=el.checked;state.responses[id]={...r,points};persist(true);}
  });
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.choice!==undefined&&activeUnit){
      const section=activeUnit.sections.find(s=>s.id===button.dataset.section);if(!section)return;
      const result=C.answerCheck(state,activeUnit.id,section,Number(button.dataset.choice));if(!result)return;
      persist(true);const box=button.closest('.check');box.querySelectorAll('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const feedback=box.querySelector('.feedback');feedback.className='feedback '+(result.correct?'correct':'incorrect');feedback.textContent=(result.correct?'答對。':'再想一想。')+section.check.feedback[result.answer];
      window.HKDSEProgress?.recordEvent('manual-diagnostic',{topicId:activeUnit.id,score:result.correct?1:0,maxScore:1,source:'course-manual',metadata:{questionId:activeUnit.id+'/'+section.id,firstCorrect:result.firstCorrect}});
    }
    if(button.dataset.reveal){const id=button.dataset.reveal,r=state.responses[id]||{};if(!String(r.text||'').trim()){notify('先寫下你的嘗試，再核對範答。即使未完成，也可記錄目前推論。');button.closest('.task').querySelector('textarea').focus();return;}r.revealed=true;state.responses[id]=r;button.setAttribute('aria-expanded','true');button.closest('.task').querySelector('.task-solution').hidden=false;persist(true);}
    if(button.dataset.print&&activeUnit){if(button.dataset.print==='student')main.querySelector('.student-sheet').innerHTML=studentSheet(activeUnit);document.body.dataset.print=button.dataset.print;window.print();}
  });
  main.addEventListener('toggle',event=>{const id=event.target.dataset?.hints;if(id&&event.target.open){state.responses[id]={...(state.responses[id]||{}),hintUsed:true};persist(true);}},true);
  window.addEventListener('afterprint',()=>{delete document.body.dataset.print;});
  function refreshSavedState(){Object.assign(state,C.read(storage));if(units.length){render(false);notify('學習紀錄已在另一頁更新，這裏的筆記已重新載入。');}}
  window.addEventListener('storage',event=>{if(event.key===C.storageKey||event.key===null)refreshSavedState();});
  window.addEventListener('hkdse-progress-clear',refreshSavedState);
  document.getElementById('unit-search').addEventListener('input',event=>renderList(event.target.value));
  try {
    const packs=await Promise.all(['data','network','programming','context'].map(async name=>{const response=await fetch('data/'+name+'.json?v=20261018');if(!response.ok)throw new Error('無法載入 '+name);return response.json();}));
    const raw=packs.flatMap(p=>p.units), order=window.HKDSE_ICT.getItems().map(i=>i.id);
    units=raw.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
    const response=await fetch('data/integrated.json?v=20261018');if(!response.ok)throw new Error('無法載入綜合任務');cases=(await response.json()).cases;
    render();
  } catch(error){main.innerHTML='<h1>教材暫時未能載入</h1><p>請重新整理；若仍未能載入，可先用<a href="../animations/index.html">分課教材</a>。請以網站或本機伺服器開啟，直接開啟本機 HTML 可能無法讀取教材資料。</p>';list.textContent='課程資料載入失敗。';console.error(error);}
})();
