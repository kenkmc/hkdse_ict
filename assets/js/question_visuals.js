(function initialiseQuestionVisuals(){
    "use strict";
    const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
    function renderTable(visual,spreadsheet=false){const wrap=make("div",spreadsheet?"qv-table-wrap qv-sheet-wrap":"qv-table-wrap"),table=make("table",spreadsheet?"qv-table qv-sheet":"qv-table"),head=make("thead"),headRow=make("tr");(visual.columns||[]).forEach(value=>headRow.appendChild(make("th","",value)));head.appendChild(headRow);const body=make("tbody");(visual.rows||[]).forEach((values,rowIndex)=>{const row=make("tr");values.forEach((value,columnIndex)=>row.appendChild(make(rowIndex===0&&spreadsheet?"th":"td","",value)));body.appendChild(row);});table.append(head,body);wrap.appendChild(table);return wrap;}
    function renderNetwork(visual){const wrap=make("div","qv-network");(visual.nodes||[]).forEach(node=>wrap.appendChild(make("span","qv-node",node)));const links=make("p","qv-links",(visual.links||[]).map(link=>`${link[0]} → ${link[1]}`).join("　·　"));wrap.appendChild(links);return wrap;}
    function renderChart(visual){const wrap=make("div","qv-chart");const max=Math.max(...visual.values,1);visual.values.forEach((value,index)=>{const item=make("div","qv-chart-item"),bar=make("i");bar.style.height=`${Math.max(8,value/max*100)}%`;bar.setAttribute("aria-label",`${visual.labels[index]}：${value}${visual.unit||""}`);item.append(bar,make("b","",`${value}${visual.unit||""}`),make("span","",visual.labels[index]));wrap.appendChild(item);});return wrap;}
    function renderImageGrid(visual){const grid=make("div","qv-images");visual.images.forEach(item=>{const figure=make("figure"),image=document.createElement("img");image.src=item.src;image.alt=item.label;image.loading="lazy";figure.append(image,make("figcaption","",item.label));grid.appendChild(figure);});return grid;}
    function render(visual){
        if(!visual)return null;const figure=make("figure","question-visual"),caption=make("figcaption","question-visual-title",visual.title||"資料");figure.appendChild(caption);let content;
        if(visual.type==="table")content=renderTable(visual);
        else if(visual.type==="spreadsheet")content=renderTable(visual,true);
        else if(visual.type==="network")content=renderNetwork(visual);
        else if(visual.type==="chart")content=renderChart(visual);
        else if(visual.type==="image-grid")content=renderImageGrid(visual);
        else if(visual.type==="news"){content=make("article","qv-news");content.append(make("h3","",visual.headline),make("ul"));visual.facts.forEach(fact=>content.querySelector("ul").appendChild(make("li","",fact)));}
        else if(visual.type==="cpu"){content=make("div","qv-block-flow");visual.blocks.forEach(block=>content.appendChild(make("span","",block)));content.appendChild(make("p","",visual.arrows.join("　→　")));}
        else if(visual.type==="flowchart"){content=make("div","qv-flowchart");visual.steps.forEach((step,index)=>{content.appendChild(make("span",step.includes("?")?"is-decision":"",step));if(index<visual.steps.length-1)content.appendChild(make("i","","↓"));});}
        else if(visual.type==="trace")content=renderTable(visual);
        else if(visual.type==="webpage"){content=make("div","qv-webpage");visual.regions.forEach((region,index)=>content.appendChild(make(index===0?"header":"div","",region)));}
        else if(visual.type==="erd"){content=make("div","qv-erd");visual.entities.forEach((entity,index)=>{content.appendChild(make("span","",entity));if(index<visual.entities.length-1)content.appendChild(make("b","",visual.cardinality[index]||"—"));});}
        else content=make("pre","question-code",JSON.stringify(visual,null,2));
        figure.appendChild(content);return figure;
    }
    window.HKDSEQuestionVisuals={render};
})();
