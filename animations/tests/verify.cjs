/* Run from repository root: node tests/verify.cjs */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
const context={window:{},document:{addEventListener(){}},module:{exports:{}}};vm.createContext(context);
for(const file of ['course_data.js','assets/new-lessons.js','assets/programming-lessons.js','assets/programming-supplements.js','assets/core-a-labs.js','assets/network-labs.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const catalogue=context.module.exports.courseData.flatMap(g=>g.items);
assert.equal(catalogue.length,42);assert.equal(new Set(catalogue.map(x=>x.id)).size,42);
const content=context.window.ICT_NEW_LESSONS;assert.equal(Object.keys(content).length,35);
let labs=0,steps=0;
function checkLab(lab,where){assert(lab.title&&lab.steps.length>=2,where);const q=lab.question;assert(q&&q.text&&q.explanation,where+' quiz');assert(q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length,where+' answer');for(const step of lab.steps){assert(step.title&&step.detail,where+' step');assert((step.nodes&&step.nodes.length)||step.code||step.table,where+' visual');}labs++;steps+=lab.steps.length;}
for(const item of catalogue){assert(fs.existsSync(item.link),'Missing '+item.link);if(content[item.id]){const data=content[item.id];assert(data.intro&&data.objectives.length&&data.sourcePages&&data.exercise,item.id+' metadata');assert(data.sections.length>=2,item.id+' sections');for(const section of data.sections){assert(section.paragraphs.length,item.id+' paragraphs');checkLab(section.lab,item.id);}}else{const data=context.window.ICT_TOPIC_LABS[item.id];assert(data&&data.length,item.id+' labs');data.forEach(l=>checkLab(l,item.id));}}
for(const id of ['db_simulator','pki_animation','python_converter'])context.window.ICT_TOPIC_LABS[id].forEach(l=>checkLab(l,id));
let links=0;
for(const file of fs.readdirSync('.').filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)){let ref=match[1];if(/^(https?:|data:|mailto:|#|javascript:)/.test(ref)||ref.includes('${'))continue;ref=decodeURIComponent(ref.split(/[?#]/)[0]);if(!ref)continue;assert(fs.existsSync(path.resolve(path.dirname(file),ref)),file+' broken link '+ref);links++;}for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src=|text\/babel/.test(match[1]))continue;new vm.Script(match[2],{filename:file});}}
for(const file of fs.readdirSync('assets').filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync(path.join('assets',file),'utf8'),{filename:file});
console.log(JSON.stringify({status:'PASS',catalogueLessons:catalogue.length,newLessons:Object.keys(content).length,animatedLabs:labs,workedSteps:steps,localReferences:links},null,2));
