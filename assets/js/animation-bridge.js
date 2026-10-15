/* Add the reviewed animation collection to the existing published platform.
   Permanent course IDs, question data and progress storage stay in the host. */
(function(){'use strict';
window.ICT_LAB_CURRICULUM_URL='animations/curriculum.html';
const id=location.pathname.split('/').pop().replace(/\.html$/,'');
const mapping={
 'chb.1':['chb.1','chb.2'],'chb.2':['chb.3'],
 'chc.3':['chc.3'],'chc.4':['chc.4'],'chc.5':['chc.5','chc.6'],
 'chd.1':['chd.1'],'chd.2':['chd.2','chd.3'],'chd.3':['chd.4','chd.5'],'chd.4':['chd.6'],
 'che.1':['che.1'],'che.2':['che.2'],'che.3':['che.3'],
 'ea.1':['eleca.4'],'ea.2':['eleca.1','eleca.2','eleca.3'],'ea.3':['eleca.5'],
 'eb.1':['elecb.1','elecb.2'],'eb.2':['elecb.3','elecb.4','elecb.5'],
 'ec.1':['elecc.1','elecc.2','elecc.3','elecc.4','elecc.5','elecc.6','elecc.7'],'ec.2':['elecc.8'],'sba':['sba.1']
};
const sourceIds=mapping[id]||[];
const existing=(window.ICT_TOPIC_LABS||{})[id]||[];
if(!sourceIds.length&&!existing.length)return;
const main=document.querySelector('main')||document.body;
const host=document.createElement('section');host.id='live-animation-labs';host.className='live-animation-labs';host.setAttribute('aria-labelledby','live-animation-heading');
const heading=document.createElement('h2');heading.id='live-animation-heading';heading.textContent='逐步動畫講解';
const intro=document.createElement('p');intro.textContent='先預測，再逐步觀察。可暫停、回看、重設及調速；展開課題後用理解題檢查想法。';
const all=document.createElement('a');all.href='animations/index.html';all.textContent='瀏覽全部42個動畫課題 →';
host.append(heading,intro,all);main.append(host);
const labs=[...existing];
if(id==='chc.1')labs.forEach(l=>{l.target='#live-animation-labs';});
if(id==='db_simulator'||id==='python_converter'){const targetId=id==='db_simulator'?'sql-topic-labs':'python-topic-labs';if(!document.getElementById(targetId)){const section=document.createElement('div');section.id=targetId;host.append(section);}}
let counter=0;
sourceIds.forEach(sourceId=>{const data=window.ICT_NEW_LESSONS?.[sourceId];if(!data)return;const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent=data.title;detail.append(summary);const p=document.createElement('p');p.textContent=data.intro;detail.append(p);data.sections.forEach(section=>{const part=document.createElement('div');part.id='live-animation-topic-'+(++counter);detail.append(part);labs.push({...section.lab,target:'#'+part.id});});const link=document.createElement('a');link.href='animations/'+sourceId+'.html';link.textContent='開啟本課完整解說與實作任務 →';detail.append(link);host.append(detail);});
window.ICT_TOPIC_LABS={...window.ICT_TOPIC_LABS,[id]:labs};
if(id==='ec.1')window.ICT_MODEL_PAGE_IDS=['elecc.5','elecc.6'];
})();
