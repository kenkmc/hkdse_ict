(function(){'use strict';
Object.assign(window.ICT_LESSON_PLANS ||= {},{
 'che.1':[{sim:'classifier-training',target:'#ai'},{sim:'layer-printer',target:'#printing-explainer'},{sim:'ar-vr-view',target:'#immersive-view'}],
 'che.2':[{sim:'ergonomic-adjustment',target:'#health'},{sim:'accessibility-lens',target:'#usability'},{sim:'access-barriers',target:'#equity'},{sim:'sharing-data-trail',target:'#ethics'}],
 'che.3':[{sim:'license-routing',target:'#copyright'},{sim:'watermark-copy',target:'#protection'}],
 'sba':[{sim:'evidence-chain',target:'#example'},{sim:'booking-testbench',target:'#testing'}],
 'animations/che.1':[{sim:'classifier-training',target:'#topic-0'},{sim:'layer-printer',target:'#topic-1'},{sim:'ar-vr-view',target:'#topic-1'}],
 'animations/che.2':[{sim:'ergonomic-adjustment',target:'#topic-0'},{sim:'accessibility-lens',target:'#topic-0'},{sim:'access-barriers',target:'#topic-1'},{sim:'sharing-data-trail',target:'#topic-1'}],
 'animations/che.3':[{sim:'license-routing',target:'#topic-1'},{sim:'watermark-copy',target:'#topic-1'}],
 'animations/sba.1':[{sim:'evidence-chain',target:'#topic-0'},{sim:'booking-testbench',target:'#topic-0'},{sim:'revision-diff',target:'#topic-1'}]
});
Object.assign(window.ICT_LESSON_SETUP ||= {},{
 'animations/che.3':function(){const part=document.getElementById('topic-0');if(!part||part.querySelector('.tc-license-matrix'))return;const table=document.createElement('table');table.className='tc-license-matrix';const caption=document.createElement('caption');caption.textContent='常見授權特徵；實際使用仍按授權原文。';table.append(caption);const rows=[['類型','價格','源代碼／修改與分發'],['免費軟件','通常免費使用','不一定提供源代碼，修改與分發須看條款'],['共享／試用軟件','可能限時或限制功能','試用不等於永久完整免費'],['開放源碼','可以免費或收費','按授權提供源代碼，准許相應研究、修改與分發'],['專有軟件','免費或收費皆可能','通常保留源代碼及修改／分發限制']];rows.forEach((values,i)=>{const row=document.createElement('tr');values.forEach(value=>{const cell=document.createElement(i?'td':'th');cell.textContent=value;row.append(cell);});table.append(row);});const quiz=part.querySelector('.ict-section-check');if(quiz)part.insertBefore(table,quiz);else part.append(table);}
});
})();
