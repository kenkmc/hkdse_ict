(function initialiseSbaPrep(){
"use strict";
const checklist=document.querySelector("[data-sba-checklist]"),progress=document.querySelector("[data-sba-progress]");
if(checklist&&progress){const update=()=>{const boxes=[...checklist.querySelectorAll('input[type="checkbox"]')];progress.textContent=`${boxes.filter(box=>box.checked).length} / ${boxes.length} 已檢查`;};checklist.addEventListener("change",update);update();}
const form=document.querySelector("[data-sba-test-form]"),rows=document.querySelector("[data-sba-test-rows]");let testNumber=0;
if(form&&rows){form.addEventListener("submit",event=>{event.preventDefault();const data=new FormData(form),input=String(data.get("input")||"").trim(),expected=String(data.get("expected")||"").trim();if(!input||!expected)return;rows.querySelector(".sba-placeholder")?.remove();testNumber+=1;const row=document.createElement("tr");[testNumber,data.get("type"),input,expected,"________________","________"].forEach(value=>{const cell=document.createElement("td");cell.textContent=String(value);row.appendChild(cell);});rows.appendChild(row);form.reset();form.elements.input.focus();});}
document.querySelector("[data-sba-clear]")?.addEventListener("click",()=>{rows.replaceChildren();testNumber=0;const row=document.createElement("tr"),cell=document.createElement("td");row.className="sba-placeholder";cell.colSpan=6;cell.textContent="加入測試後會在這裏建立可列印的測試表。";row.appendChild(cell);rows.appendChild(row);});
document.querySelector("[data-sba-print]")?.addEventListener("click",()=>window.print());
const metricInputs=[...document.querySelectorAll("[data-sba-metric]")],metricOutput=document.querySelector("[data-sba-metric-output]");
if(metricInputs.length&&metricOutput){const calculate=()=>{const value=name=>Math.max(0,Number(document.querySelector(`[data-sba-metric="${name}"]`)?.value)||0),percent=(part,total)=>total>0?Math.min(100,Math.round(part/total*100)):0;metricOutput.textContent=`測試通過率 ${percent(value("testsPassed"),value("testsTotal"))}% · 任務完成率 ${percent(value("usersPassed"),value("usersTotal"))}%`;};metricInputs.forEach(input=>input.addEventListener("input",calculate));calculate();}
})();
