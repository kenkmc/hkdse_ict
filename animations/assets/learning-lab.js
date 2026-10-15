/* Shared, dependency-free HKDSE ICT step player. No automatic playback. */
(function () {
  'use strict';
  const players = new Set();
  let serial = 0;
  const guide = 'https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/technology-edu/curriculum-doc/ICT_C%26A%20Guide_c_final.pdf';
  const curriculumLink=window.ICT_LAB_CURRICULUM_URL||'curriculum.html';
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function mount(target, data) {
    if (!target || !Array.isArray(data.steps) || !data.steps.length) return;
    const box = el('section', 'ict-lab');
    const heading = el('h3', '', data.title || '逐步動畫講解');
    heading.id = 'ict-lab-' + (++serial);
    box.setAttribute('aria-labelledby', heading.id);
    box.append(el('div', 'ict-tag', '互動講解 · 先預測，再逐步觀察'), heading);
    const controls = el('div', 'ict-controls');
    const buttons = {};
    [['prev','上一步'],['play','播放'],['next','下一步'],['reset','重設']].forEach(([action,label]) => {
      const button = el('button','',label);
      button.type = 'button'; button.dataset.action = action;
      buttons[action] = button; controls.append(button);
    });
    const speedLabel = el('label','','速度 ');
    const speed = el('select'); speed.setAttribute('aria-label','動畫播放速度');
    [['5000','慢'],['3000','標準'],['1500','快']].forEach(([value,label]) => {
      const option=el('option','',label); option.value=value; speed.append(option);
    }); speed.value='3000'; speedLabel.append(speed); controls.append(speedLabel); box.append(controls);
    const timeline=el('div','ict-timeline');
    const range=el('input'); range.type='range'; range.min='0'; range.max=String(data.steps.length-1); range.value='0'; range.setAttribute('aria-label','講解步驟');
    const count=el('span'); timeline.append(range,count); box.append(timeline);
    const stage=el('div','ict-stage'); stage.setAttribute('role','group'); stage.setAttribute('aria-label','目前步驟的圖解');
    const live=el('p','ict-sr-status'); live.setAttribute('role','status'); live.setAttribute('aria-live','polite');
    box.append(stage,live);
    const transcript=el('details'); transcript.append(el('summary','','閱讀全部步驟文字'));
    const list=el('ol','ict-transcript');
    data.steps.forEach(step=>{const li=el('li');li.append(el('strong','',step.title||''),el('p','',step.detail||''));list.append(li);});
    transcript.append(list);box.append(transcript);
    let index=0, timer=null;
    function stop(){if(timer!==null)clearTimeout(timer);timer=null;buttons.play.textContent='播放';buttons.play.setAttribute('aria-pressed','false');}
    function render(){
      const step=data.steps[index]; stage.replaceChildren();
      stage.append(el('h4','ict-step-title',step.title||('步驟 '+(index+1))));
      if(step.nodes){const nodes=el('div','ict-nodes');step.nodes.forEach((n,i)=>{
        if(i) {const arrow=el('span','ict-arrow','→');arrow.setAttribute('aria-hidden','true');nodes.append(arrow);}
        const card=el('div','ict-node'+(n.active?' is-active':'')+(n.tone==='good'?' is-good':n.tone==='warn'?' is-warn':''));
        card.append(el('span','ict-node-label',n.label||''),el('span','ict-node-value',n.value===undefined?'':n.value));nodes.append(card);
      });stage.append(nodes);}
      if(step.table){const wrap=el('div','ict-table-scroll'),table=el('table');
        const cap=el('caption','',step.table.caption||step.title||'步驟數據'); table.append(cap);
        if(step.table.headers){const head=el('thead'),tr=el('tr');step.table.headers.forEach(t=>{const th=el('th','',t);th.scope='col';tr.append(th);});head.append(tr);table.append(head);}
        const body=el('tbody');(step.table.rows||[]).forEach(row=>{const tr=el('tr');row.forEach(t=>tr.append(el('td','',t)));body.append(tr);});table.append(body);wrap.append(table);stage.append(wrap);
      }
      if(step.code)stage.append(el('pre','',step.code));
      stage.append(el('p','ict-detail',step.detail||''));
      count.textContent=(index+1)+' / '+data.steps.length;
      range.value=String(index);range.setAttribute('aria-valuetext',(index+1)+'：'+(step.title||''));
      buttons.prev.disabled=index===0;buttons.next.disabled=index===data.steps.length-1;
      live.textContent='目前：'+(index+1)+' / '+data.steps.length+'，'+(step.title||'');
    }
    function schedule(){timer=setTimeout(()=>{timer=null;if(index<data.steps.length-1){index++;render();}if(index<data.steps.length-1)schedule();else stop();},Number(speed.value));}
    buttons.play.addEventListener('click',()=>{if(timer!==null){stop();return;}if(index===data.steps.length-1){index=0;render();}buttons.play.textContent='暫停';buttons.play.setAttribute('aria-pressed','true');schedule();});
    buttons.prev.addEventListener('click',()=>{stop();index=Math.max(0,index-1);render();});
    buttons.next.addEventListener('click',()=>{stop();index=Math.min(data.steps.length-1,index+1);render();});
    buttons.reset.addEventListener('click',()=>{stop();index=0;render();});
    range.addEventListener('input',()=>{stop();index=Number(range.value);render();});
    speed.addEventListener('change',()=>{if(timer!==null){stop();buttons.play.textContent='暫停';buttons.play.setAttribute('aria-pressed','true');schedule();}});
    if(data.question){const q=data.question,fieldset=el('fieldset');fieldset.append(el('legend','','想一想：'+q.text));
      const answers=el('div','ict-answers'),feedback=el('p','ict-feedback');feedback.setAttribute('role','status');
      q.options.forEach((option,i)=>{const button=el('button','',option);button.type='button';button.addEventListener('click',()=>{feedback.textContent=(i===q.answer?'答對了。':'再想一想。')+' '+q.explanation;feedback.style.color=i===q.answer?'#126240':'#8c4f08';});answers.append(button);});
      fieldset.append(answers,feedback);box.append(fieldset);
    }
    render();target.append(box);players.add({stop,box});
  }
  function renderLesson(){
    const root=document.getElementById('ict-lesson'); if(!root)return;
    const id=root.dataset.lesson || new URLSearchParams(location.search).get('id');
    const data=(window.ICT_NEW_LESSONS||{})[id];
    if(!data){root.append(el('h1','ict-error','找不到課題'),el('p','','請從課程目錄選擇課題。'));return;}
    document.title=data.title+' · ICT 學習資源網';
    const nav=el('nav'); const home=el('a','','← 課程目錄');home.href='index.html';const review=el('a','','課程對照與閱讀指引');review.href=curriculumLink;nav.append(home,review);root.append(nav);
    root.append(el('p','ict-scope',data.scope||''),el('h1','',data.title));
    root.append(el('p','ict-note','課程重點與互動示例：配合實作和課堂練習使用。動畫以簡化模型解釋概念；請同時閱讀每課的限制及課程對照。'));
    root.append(el('p','',data.intro||''));
    if(data.objectives){const wrap=el('div','ict-objectives');wrap.append(el('h2','','學習目標'));const ul=el('ul');data.objectives.forEach(t=>ul.append(el('li','',t)));wrap.append(ul);root.append(wrap);}
    const toc=el('nav','ict-toc');toc.setAttribute('aria-label','本課內容');
    (data.sections||[]).forEach((section,i)=>{const a=el('a','',section.title);a.href='#'+(section.id||('topic-'+i));toc.append(a);});root.append(toc);
    (data.sections||[]).forEach((section,i)=>{const part=el('section','ict-lesson-section');part.id=section.id||('topic-'+i);part.append(el('h2','',section.title));
      (section.paragraphs||[]).forEach(t=>part.append(el('p','',t)));
      if(section.bullets){const ul=el('ul');section.bullets.forEach(t=>ul.append(el('li','',t)));part.append(ul);}
      if(section.code)part.append(el('pre','',section.code));
      if(section.lab)mount(part,section.lab);root.append(part);
    });
    if(data.exercise){const wrap=el('section','ict-lesson-section');wrap.append(el('h2','','動手做與解釋'),el('p','',data.exercise));root.append(wrap);}
    const foot=el('footer');const source=el('a','','教育局《資訊及通訊科技課程及評估指引》（2021）');source.href=guide;foot.append(source,document.createTextNode('；相關印刷頁：'+(data.sourcePages||'10–41')+'。此網站為輔助教材，並非考評局官方教材。'));root.append(foot);
  }
  function init(){renderLesson();const id=location.pathname.split('/').pop().replace(/\.html$/,'');(window.ICT_TOPIC_LABS?.[id]||[]).forEach(data=>{let target;try{target=document.querySelector(data.target||'main')||document.body;}catch(_){target=document.body;}mount(target,data);});
    if(window.ICT_TOPIC_LABS?.[id]){const note=el('aside','ict-lab');note.append(el('strong','','課程依據與閱讀提示'),el('p','','本課已按教育局2021年課程指引檢視並補充逐步講解。動畫為簡化模型；請配合實作、文字解釋及課程對照使用。'));const link=el('a','','課程對照、逐課檢視及範圍說明 →');link.href=curriculumLink;link.style.textDecoration='underline';note.append(link);const parent=document.querySelector('main')||document.body;parent.append(note);}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(p=>p.stop());});
  window.addEventListener('pagehide',()=>players.forEach(p=>p.stop()));
  window.ICTLab={mount};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
