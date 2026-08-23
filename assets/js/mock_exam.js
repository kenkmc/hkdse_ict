(function initialiseMockExam(){
"use strict";
const bank=window.HKDSE_ICT_QUESTIONS;
const platform=window.HKDSE_ICT;
if(!Array.isArray(bank)||!platform)return;
const setup=document.getElementById("mock-setup"),exam=document.getElementById("mock-exam"),form=document.getElementById("mock-form"),resultPanel=document.getElementById("mock-result"),options=document.getElementById("mock-options"),optionError=document.getElementById("mock-option-error"),timerOutput=document.getElementById("mock-timer"),submitButton=document.getElementById("mock-submit");
let questions=[],results=[],timerId=null,remainingSeconds=0,submitted=false,confirmArmed=false;
const difficultyLabels={foundation:"基礎",standard:"標準",advanced:"進階"};
const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
const normalise=value=>String(value||"").toUpperCase().replace(/[；;]/g,"").replace(/\s+/g,"").replace(/[，。！？、]/g,"");
const shuffle=items=>{const copy=[...items];for(let index=copy.length-1;index>0;index-=1){const target=Math.floor(Math.random()*(index+1));[copy[index],copy[target]]=[copy[target],copy[index]];}return copy;};
function topicLabel(topicId){return platform.getItemById(topicId)?.title.replace(/^[ivx]+\.\s*/i,"")||topicId;}
function selectedMode(){return document.querySelector('input[name="mock-mode"]:checked').value;}
function updateMode(){const isPaper2=selectedMode()==="paper2";options.hidden=!isPaper2;document.getElementById("mock-duration").value=isPaper2?"45":"30";optionError.textContent="";}
function chooseQuestions(){
 const mode=selectedMode();
 if(mode==="paper1"){
  const core=bank.filter(question=>/^ch[abcde]-/.test(question.topicId));
  return [...shuffle(core.filter(question=>question.type==="mcq")).slice(0,6),...shuffle(core.filter(question=>question.type!=="mcq")).slice(0,4)];
 }
 const selected=[...options.querySelectorAll('input:checked')].map(input=>input.value);
 if(selected.length!==2){optionError.textContent="請剛好選擇兩個選修單元。";return null;}
 return selected.flatMap(prefix=>shuffle(bank.filter(question=>question.topicId.startsWith(`${prefix}-`))).slice(0,6));
}
function buildMeta(question){const meta=make("div","question-meta");[[question.syllabusRef,"question-chip"],[topicLabel(question.topicId),"question-chip"],[difficultyLabels[question.difficulty],"question-chip"],[`${question.marks} 分`,"question-chip question-chip-marks"]].forEach(([text,className])=>meta.appendChild(make("span",className,text)));return meta;}
function buildAnswer(question){
 if(question.type==="mcq"){
  const choices=make("div","question-options");
  question.options.forEach(option=>{const label=make("label","question-option"),input=document.createElement("input"),text=make("span","",`${option.value}. ${option.label}`);input.type="radio";input.name=`answer-${question.id}`;input.value=option.value;label.append(input,text);choices.appendChild(label);});
  return choices;
 }
 const textarea=document.createElement("textarea");textarea.className=`question-answer${question.type==="sql"?" question-answer-code":""}`;textarea.name=`answer-${question.id}`;textarea.rows=5;textarea.placeholder=question.type==="sql"?"在此輸入 SQL…":"在此輸入答案…";textarea.setAttribute("aria-label",`題目答案：${question.question}`);return textarea;
}
function renderPaper(){
 form.replaceChildren();
 questions.forEach(question=>{const card=make("section","mock-question-card");card.dataset.questionId=question.id;const heading=make("div","mock-question-heading");heading.append(make("span","mock-question-number"),buildMeta(question));const title=make("h2","",question.question);card.append(heading,title);if(question.questionCode)card.append(make("pre","question-code",question.questionCode));card.append(buildAnswer(question));form.appendChild(card);});
 document.getElementById("mock-count").textContent=`${questions.length} 題`;
}
function readAnswer(question){const controls=[...form.elements].filter(control=>control.name===`answer-${question.id}`);if(question.type==="mcq")return controls.find(control=>control.checked)?.value||"";return controls[0]?.value||"";}
function calculateMarks(question,response){const value=normalise(response);const accepted=[question.answer,...(question.acceptedAnswers||[])].map(normalise);if(accepted.includes(value))return question.marks;if(question.type==="mcq"||!value)return 0;return Math.min(question.marks,question.markingScheme.reduce((score,point)=>{if(!point.anyOf)return score;return score+(point.anyOf.some(keyword=>value.includes(normalise(keyword)))?point.marks:0);},0));}
function updateTimer(){const minutes=Math.floor(remainingSeconds/60),seconds=remainingSeconds%60;timerOutput.textContent=`${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;if(remainingSeconds<=300)timerOutput.classList.add("is-urgent");if(remainingSeconds<=0){finishExam(true);return;}remainingSeconds-=1;}
function startTimer(){updateTimer();timerId=window.setInterval(updateTimer,1000);}
function startExam(){
 const selected=chooseQuestions();if(!selected||!selected.length)return;
 questions=selected;results=[];submitted=false;confirmArmed=false;remainingSeconds=Number(document.getElementById("mock-duration").value)*60;
 document.getElementById("mock-paper-label").textContent=selectedMode()==="paper1"?"Paper 1 核心迷你卷":"Paper 2 選修組合";
 setup.hidden=true;resultPanel.hidden=true;exam.hidden=false;submitButton.disabled=false;submitButton.textContent="交卷";renderPaper();startTimer();window.scrollTo({top:0,behavior:"smooth"});
}
function finishExam(isTimeout){
 if(submitted)return;if(!isTimeout&&!confirmArmed){confirmArmed=true;submitButton.textContent="確定交卷";submitButton.classList.add("is-confirming");return;}
 submitButton.classList.remove("is-confirming");
 submitted=true;window.clearInterval(timerId);results=questions.map(question=>{const response=readAnswer(question);return{question,response,awarded:calculateMarks(question,response)};});
 form.querySelectorAll("input, textarea").forEach(control=>{control.disabled=true;});exam.hidden=true;renderResult(isTimeout);resultPanel.hidden=false;resultPanel.scrollIntoView({behavior:"smooth",block:"start"});
}
function renderResult(isTimeout){
 const earned=results.reduce((sum,item)=>sum+item.awarded,0),possible=results.reduce((sum,item)=>sum+item.question.marks,0),percentage=possible?Math.round(earned/possible*100):0;
 document.getElementById("mock-result-summary").textContent=`${isTimeout?"時間結束，已自動交卷。":"已完成交卷。"}得分 ${earned} / ${possible}。短答自動評分只供參考。`;
 const ring=document.getElementById("mock-score-ring");ring.style.setProperty("--score",`${percentage}%`);ring.replaceChildren(make("span","",`${percentage}%`));
 const topicTotals=new Map();results.forEach(item=>{const current=topicTotals.get(item.question.topicId)||{earned:0,possible:0};current.earned+=item.awarded;current.possible+=item.question.marks;topicTotals.set(item.question.topicId,current);});
 const container=document.getElementById("mock-topic-results");container.replaceChildren();topicTotals.forEach((score,topicId)=>{const row=make("div","mock-topic-row"),label=make("b","",topicLabel(topicId)),bar=make("div","mock-bar"),fill=make("i"),value=make("span","",`${score.earned} / ${score.possible}`);fill.style.width=`${score.possible?score.earned/score.possible*100:0}%`;bar.appendChild(fill);row.append(label,bar,value);container.appendChild(row);});
}
function showReview(){
 resultPanel.hidden=true;exam.hidden=false;submitButton.disabled=true;submitButton.textContent="已交卷";
 results.forEach(item=>{const card=form.querySelector(`[data-question-id="${item.question.id}"]`);if(card.querySelector(".mock-answer-feedback"))return;const feedback=make("div","mock-answer-feedback"),heading=make("h3","",`評分：${item.awarded} / ${item.question.marks}`),response=make("p",""),answer=make("p","");response.append(make("strong","","你的答案："),document.createTextNode(item.response||"（未作答）"));answer.append(make("strong","","參考答案："),document.createTextNode(item.question.answer));const scheme=make("ol");item.question.markingScheme.forEach(point=>scheme.appendChild(make("li","",`${point.criterion}（${point.marks} 分）`)));feedback.append(heading,response,answer,scheme);card.appendChild(feedback);});window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll('input[name="mock-mode"]').forEach(input=>input.addEventListener("change",updateMode));document.getElementById("mock-start").addEventListener("click",startExam);submitButton.addEventListener("click",()=>finishExam(false));document.getElementById("mock-review").addEventListener("click",showReview);document.getElementById("mock-restart").addEventListener("click",()=>window.location.reload());updateMode();
})();
