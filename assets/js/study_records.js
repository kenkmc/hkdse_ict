(function initialiseStudyRecords(){
    "use strict";
    const storageKey="hkdse-ict-study-records-v1";
    const intervals=[1,3,7,14];
    const normalise=value=>String(value||"").toUpperCase().replace(/[；;]/g,"").replace(/\s+/g,"").replace(/[，。！？、]/g,"");
    function read(){try{return JSON.parse(window.localStorage.getItem(storageKey)||"[]");}catch(error){return [];}}
    function write(records){try{window.localStorage.setItem(storageKey,JSON.stringify(records));return true;}catch(error){return false;}}
    function addDays(days){const date=new Date();date.setDate(date.getDate()+days);return date.toISOString();}
    function grade(question,response){
        const value=normalise(response),accepted=[question.answer,...(question.acceptedAnswers||[])].map(normalise);
        if(accepted.includes(value))return{awarded:question.marks,missedCriteria:[]};
        if(question.type==="mcq"||!value)return{awarded:0,missedCriteria:question.markingScheme.map(point=>point.criterion)};
        let awarded=0;const missedCriteria=[];
        question.markingScheme.forEach(point=>{const matched=point.anyOf?.some(keyword=>value.includes(normalise(keyword)));if(matched)awarded+=point.marks;else missedCriteria.push(point.criterion);});
        return{awarded:Math.min(question.marks,awarded),missedCriteria};
    }
    function inferErrorType(question,response,awarded){if(!String(response||"").trim())return"未作答";if(question.errorType)return question.errorType;if(question.type==="sql")return"SQL 結構或語法";if(question.type==="mcq")return"概念混淆";return awarded>0?"遺漏評分點":"概念或表達錯誤";}
    function recordAttempt(question,response,awarded,missedCriteria){
        const records=read(),index=records.findIndex(record=>record.questionId===question.id),existing=index>=0?records[index]:null;
        if(awarded===question.marks&&!existing)return null;
        const now=new Date().toISOString(),correct=awarded===question.marks,previousInterval=existing?.intervalIndex??0;
        let intervalIndex=correct?Math.min(previousInterval+1,intervals.length-1):0;
        const mastered=correct&&Boolean(existing)&&previousInterval===intervals.length-1;
        const originalMissedCriteria=existing?.originalMissedCriteria||existing?.missedCriteria||missedCriteria;
        const originalErrorType=existing?.originalErrorType||existing?.errorType||inferErrorType(question,response,awarded);
        const record={questionId:question.id,topicId:question.topicId,question:question.question,marks:question.marks,firstScore:existing?.firstScore??awarded,latestScore:awarded,attempts:(existing?.attempts||0)+1,firstAttemptAt:existing?.firstAttemptAt||now,lastAttemptAt:now,missedCriteria:correct?[]:missedCriteria,originalMissedCriteria,errorType:correct?"已答對，等待鞏固":inferErrorType(question,response,awarded),originalErrorType,intervalIndex,dueAt:mastered?now:addDays(intervals[intervalIndex]),status:mastered?"mastered":"scheduled",reviewUrl:window.HKDSE_ICT?.getItemById(question.topicId)?.file||"practice.html"};
        if(index>=0)records[index]=record;else records.push(record);write(records);window.dispatchEvent(new CustomEvent("hkdse-study-records-change"));return record;
    }
    function remove(questionId){write(read().filter(record=>record.questionId!==questionId));}
    function clear(){write([]);window.dispatchEvent(new CustomEvent("hkdse-study-records-change"));}
    function isDue(record){return record.status!=="mastered"&&new Date(record.dueAt).getTime()<=Date.now();}
    window.HKDSEStudyRecords={storageKey,intervals,read,write,grade,recordAttempt,remove,clear,isDue};
})();
