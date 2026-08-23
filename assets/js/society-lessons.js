(function initialiseSocietyLessons(){
"use strict";

const innovations={
    ai:{title:"人工智能與模式辨認",summary:"利用數據中的特徵和規律，為新輸入作分類、預測或建議。",need:"大量合適並準確標註的數據",strength:"快速處理重複而數量大的辨認工作",risk:"偏差、欠代表性、錯誤標註及私隱風險"},
    print:{title:"3D 打印",summary:"由數碼三維模型出發，把材料逐層加入並形成實體物件。",need:"準確的三維模型、合適材料和打印設定",strength:"快速製作原型和小量度身訂造零件",risk:"打印時間、材料／尺寸限制和模型知識產權"},
    ar:{title:"擴增實境（AR）",summary:"保留真實環境，並在相機或透明顯示畫面上疊加數碼內容。",need:"相機／感應器及能配準位置的裝置",strength:"在真實工作場景即時提供標示和指引",risk:"定位誤差、注意力分散和相機私隱"},
    vr:{title:"虛擬實境（VR）",summary:"以電腦產生環境佔據主要視野，讓使用者獲得沉浸式體驗。",need:"頭戴顯示器、追蹤裝置及合適的虛擬內容",strength:"安全而可重複模擬昂貴或危險情境",risk:"暈動症、設備成本和與真實環境隔離"}
};
const innovationLab=document.querySelector("[data-innovation-lab]");
if(innovationLab){
    const render=key=>{const item=innovations[key];innovationLab.querySelectorAll("[data-innovation]").forEach(button=>button.setAttribute("aria-selected",String(button.dataset.innovation===key)));innovationLab.querySelector("[data-innovation-title]").textContent=item.title;innovationLab.querySelector("[data-innovation-summary]").textContent=item.summary;innovationLab.querySelector("[data-innovation-need]").textContent=item.need;innovationLab.querySelector("[data-innovation-strength]").textContent=item.strength;innovationLab.querySelector("[data-innovation-risk]").textContent=item.risk;};
    innovationLab.querySelectorAll("[data-innovation]").forEach(button=>button.addEventListener("click",()=>render(button.dataset.innovation)));
    render("ai");
}

const pipelineNotes={collect:"收集與問題有關、獲適當同意而且能代表實際情況的數據。",label:"以一致準則給訓練例子正確標籤；錯誤標註會把錯誤模式教給模型。",train:"系統從訓練數據找出可用特徵和模式；訓練資料不能代表所有情況。",evaluate:"使用未參與訓練的數據檢查準確度，並比較不同群體的錯誤率。",use:"把模型用於新輸入，同時監察輸出、讓人覆核高風險決定並持續更新。"};
const pipeline=document.querySelector("[data-ai-pipeline]");
if(pipeline){
    const render=key=>{pipeline.querySelectorAll("[data-pipeline-step]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.pipelineStep===key)));pipeline.querySelector("[data-pipeline-note]").textContent=pipelineNotes[key];};
    pipeline.querySelectorAll("[data-pipeline-step]").forEach(button=>button.addEventListener("click",()=>render(button.dataset.pipelineStep)));
    render("collect");
}

const workstation=document.querySelector("[data-workstation]");
if(workstation){
    const checks=Array.from(workstation.querySelectorAll("[data-workstation-check]"));
    const render=()=>{const count=checks.filter(button=>button.getAttribute("aria-pressed")==="true").length;const result=workstation.querySelector("[data-workstation-score]");result.classList.toggle("is-ready",count===checks.length);result.textContent=count===checks.length?"5 / 5：基本人體工學檢查完成。仍要因應個人需要調校，並定時休息和轉換工作。":`${count} / ${checks.length}：尚有 ${checks.length-count} 項風險未處理。按每項措施完成檢查。`;};
    checks.forEach(button=>button.addEventListener("click",()=>{button.setAttribute("aria-pressed",String(button.getAttribute("aria-pressed")!=="true"));render();}));
    render();
}

const equityCases={
    access:{title:"只有手機應用程式的公共服務",summary:"低收入、偏遠地區、沒有合適裝置或數碼技能不足的使用者可能被排除。",response:"保留電話／櫃位渠道、提供公共設備或連線支援，並安排數碼技能協助。"},
    disability:{title:"沒有文字替代的圖片式表格",summary:"視障人士使用屏幕閱讀器時無法取得圖片內的欄位和說明。",response:"提供語意清楚的文字標籤、鍵盤操作、足夠對比及通過無障礙測試的表格。"},
    freedom:{title:"平台容許任何匿名內容即時公開",summary:"資訊流通較快，但也可能增加錯誤資訊、誹謗、欺凌和私隱受損的風險。",response:"訂立透明規則、提供核實與舉報機制、適度審核，並保留申訴和問責程序。"}
};
const equityLab=document.querySelector("[data-equity-lab]");
if(equityLab){
    const render=key=>{const item=equityCases[key];equityLab.querySelectorAll("[data-equity]").forEach(button=>button.setAttribute("aria-selected",String(button.dataset.equity===key)));equityLab.querySelector("[data-equity-title]").textContent=item.title;equityLab.querySelector("[data-equity-summary]").textContent=item.summary;equityLab.querySelector("[data-equity-response]").textContent=item.response;};
    equityLab.querySelectorAll("[data-equity]").forEach(button=>button.addEventListener("click",()=>render(button.dataset.equity)));
    render("access");
}

const licences={
    freeware:{title:"Freeware · 免費軟件",badge:"價格不等於權利",summary:"通常可免費使用，但不一定提供源代碼，也不代表可任意修改、再分發或在機構使用。",price:"通常免費",source:"通常不提供",modify:"視條款而定",distribute:"視條款而定"},
    shareware:{title:"Shareware · 共享／試用軟件",badge:"先試用，再按條款付費",summary:"常提供期限、功能或使用量受限的試用版本；繼續或完整使用可能需要付款。",price:"試用免費／其後付費",source:"通常不提供",modify:"通常不准許",distribute:"只按授權"},
    open:{title:"Open source · 開放源碼軟件",badge:"源代碼與授權同行",summary:"按開放源碼授權提供源代碼，容許在條款下使用、研究、修改和分發；仍有版權和授權責任。",price:"可能免費或收費",source:"提供",modify:"按授權准許",distribute:"按授權准許"},
    proprietary:{title:"Copyrighted / proprietary software",badge:"使用權由授權界定",summary:"版權持有人保留權利，使用者購買或獲得的是授權，不一定擁有軟件本身或源代碼。",price:"常需付費",source:"通常不提供",modify:"通常不准許",distribute:"通常不准許"}
};
const licenceLab=document.querySelector("[data-licence-lab]");
if(licenceLab){
    const render=key=>{const item=licences[key];licenceLab.querySelectorAll("[data-licence]").forEach(button=>button.setAttribute("aria-selected",String(button.dataset.licence===key)));licenceLab.querySelector("[data-licence-title]").textContent=item.title;licenceLab.querySelector("[data-licence-badge]").textContent=item.badge;licenceLab.querySelector("[data-licence-summary]").textContent=item.summary;["price","source","modify","distribute"].forEach(field=>{licenceLab.querySelector(`[data-licence-${field}]`).textContent=item[field];});};
    licenceLab.querySelectorAll("[data-licence]").forEach(button=>button.addEventListener("click",()=>render(button.dataset.licence)));
    render("freeware");
}
})();
