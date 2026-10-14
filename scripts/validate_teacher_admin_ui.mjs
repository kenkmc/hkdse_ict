// Local synthetic-data browser tests. Never opens the live school app or reads a real roster.
// PLAYWRIGHT_MODULE can point to an installed playwright-core entry; BROWSER_EXE is optional.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const repo = path.resolve(import.meta.dirname, '..');
let html = await fs.readFile(path.join(repo, 'google-apps-script/TeacherAdminUI.html'), 'utf8');
html = html.replace('initialise();', `const measuredRpc=rpc;window.testCalls=[];rpc=function(name,payload){window.testCalls.push({name,payload});return measuredRpc(name,payload);};initialise();`);
const output = path.join(repo, '.local-school-sync/teacher-admin-v11-ui');
await fs.mkdir(output, { recursive: true });
const server = http.createServer((request,response)=>{response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});response.end(html);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser = await chromium.launch({headless:true,...(process.env.BROWSER_EXE?{executablePath:process.env.BROWSER_EXE}:{})});
const geometry=[];
try {
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.locator('#status').filter({hasText:'資料已更新'}).waitFor();
  assert.deepEqual(await page.evaluate(()=>testCalls.map(call=>call.name)),['teacherAdminBootstrap'],'First view needs one RPC');
  const navigate=async table=>{await page.locator(`[data-table="${table}"]`).click();await page.waitForFunction(()=>!state.busy);};
  for(const viewport of [{width:1920,height:1080},{width:1280,height:720},{width:390,height:844}]) {
    await page.setViewportSize(viewport);
    for(const table of ['dashboard','students','groups','groupMembers','assignments','assignmentTargets','assignmentItems','assignmentProgress','latest','topics','sessions','pages','attempts']) {
      await navigate(table);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Body overflow ${table} at ${viewport.width}`);
    }
    await navigate('groups');
    assert((await page.locator('#table-body').innerText()).includes('1 人'),'Group count displayed');
    await page.getByRole('button',{name:'加入成員',exact:true}).click();
    assert(await page.locator('#save-record').isDisabled());
    assert(await page.locator('[name=studentIds][value="DEMO-01"]').isDisabled(),'Existing member cannot be reselected');
    await page.locator('#all-member-classes').uncheck();
    await page.locator('[name=memberClass][value="4A"]').check();
    await page.locator('[name=memberClass][value="4B"]').check();
    await page.locator('#select-members').click();
    const selected=await page.evaluate(()=>state.editor.selected.size);
    assert.equal(selected,24,'Multi-class select-all excludes existing member');
    assert.equal(await page.locator('#members-existing').innerText(),'1 人');
    assert.equal(await page.locator('#members-selected').innerText(),'24 人');
    assert.equal(await page.locator('#members-total').innerText(),'25 人');
    await page.locator('#member-search').fill('STUDENT 3');
    assert((await page.locator('#member-selection').innerText()).includes('被篩選隱藏'));
    assert.equal(await page.evaluate(()=>state.editor.selected.size),24,'Search preserves hidden selections');
    await page.locator('#clear-visible-members').click();
    assert((await page.evaluate(()=>state.editor.selected.size))<24);
    await page.locator('#member-search').fill('');await page.locator('#select-members').click();
    const rect=await page.evaluate(()=>{
      const box=id=>{const r=document.getElementById(id).getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,bottom:r.bottom,right:r.right};};
      return {viewport:innerWidth,dialog:box('editor'),list:box('member-list'),save:box('save-record'),height:innerHeight};
    });
    assert(rect.dialog.top>=0&&rect.dialog.bottom<=rect.height+1&&rect.dialog.width<=viewport.width,'Dialog fits viewport');
    assert(rect.save.bottom<=rect.height&&rect.save.top>=0,'Save button always visible');
    assert(rect.list.height>=(viewport.width>700?230:120),'Student list has usable height');
    geometry.push(rect);
    await page.screenshot({path:path.join(output,`members-${viewport.width}.png`)});
    await page.locator('#clear-members').click();assert(await page.locator('#save-record').isDisabled());
    await page.locator('#cancel-dialog').click();
    await navigate('students');await page.getByRole('button',{name:'＋ 新增',exact:true}).click();
    assert(await page.locator('#save-record').isEnabled(),'Member state does not disable other forms');
    await page.locator('#cancel-dialog').click();
  }
  await page.setViewportSize({width:1920,height:1080});
  await navigate('groups');await page.getByRole('button',{name:'重新整理',exact:true}).click();await page.waitForFunction(()=>!state.busy);
  const calls=await page.evaluate(()=>testCalls.length);
  await navigate('students');await navigate('groups');
  assert.equal(await page.evaluate(()=>testCalls.length),calls+1,'Second visit uses short-lived memory cache');
  await page.getByRole('button',{name:'重新整理',exact:true}).click();await page.waitForFunction(()=>!state.busy);
  assert.equal(await page.evaluate(()=>testCalls.length),calls+2,'Explicit refresh bypasses cached page');
  await page.evaluate(()=>pageCache.forEach(item=>item.at=Date.now()-31000));
  await navigate('groups');assert.equal(await page.evaluate(()=>testCalls.length),calls+3,'Expired cache fetches again');
  await page.getByRole('button',{name:'查看成員',exact:true}).click();await page.waitForFunction(()=>!state.busy);
  assert((await page.locator('#group-summary').innerText()).includes('有效成員 1 人'));
  assert((await page.locator('#row-count').innerText()).includes('1 位學生'));
  await page.getByRole('button',{name:'批量加入成員',exact:true}).click();
  await page.locator('#select-members').click();await page.locator('#member-search').fill('DEMO STUDENT 3');
  await page.locator('#save-record').click();await page.locator('#form-error').filter({hasText:'唯讀示範'}).waitFor();
  const submitted=await page.evaluate(()=>testCalls.findLast(call=>call.name==='teacherAdminAddMembers').payload.studentIds);
  assert.equal(submitted.length,47,'Submit includes hidden selections, excludes existing member');assert(!submitted.includes('DEMO-01'));
  assert.equal(await page.locator('[name=studentIds][value="DEMO-03"]').isDisabled(),false,'Failure unlocks controls');
  assert.equal(await page.evaluate(()=>state.editor.selected.size),47,'Failed save keeps selection for retry');
  // Simulate a successful local response to verify write cache invalidation, without calling Google.
  await page.evaluate(()=>{const original=rpc;rpc=(name,payload)=>name==='teacherAdminAddMembers'?Promise.resolve({message:'Synthetic save completed',lookups:state.lookups}):original(name,payload);});
  const readsBefore=await page.evaluate(()=>testCalls.filter(call=>call.name==='teacherAdminRead').length);
  await page.locator('#save-record').click();await page.locator('#status').filter({hasText:'Synthetic save completed'}).waitFor();
  assert.equal(await page.evaluate(()=>testCalls.filter(call=>call.name==='teacherAdminRead').length),readsBefore+1,'Successful write always refreshes server data');
  // Keyboard/multi-group reset and 300-person selection boundary with entirely synthetic students.
  await page.evaluate(()=>{state.lookups.groups.push({id:'DEMO-OTHER',name:'另一示範組',active:true,memberCount:0});for(let i=0;i<301;i++)state.lookups.students.push({id:'LIMIT-'+i,className:'6D',classNo:String(i+1),name:'容量測試 '+i,englishName:'LIMIT '+i,status:'ACTIVE'});openMembers('DEMO-GRP');});
  await page.locator('#all-member-classes').uncheck();await page.locator('[name=memberClass][value="6D"]').check();await page.locator('#select-members').click();
  assert.equal(await page.evaluate(()=>state.editor.selected.size),0,'Over-limit bulk selection is atomic');
  assert((await page.locator('#form-error').innerText()).includes('300'));
  await page.locator('#member-search').fill('容量測試 30');await page.locator('#select-members').click();
  assert((await page.evaluate(()=>state.editor.selected.size))>0);
  await page.locator('[name=groupId]').selectOption('DEMO-OTHER');
  assert.equal(await page.evaluate(()=>state.editor.selected.size),0,'Changing group clears the pending selection');
  await page.locator('#cancel-dialog').click();
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,tables:13,geometry,checks:['single-bootstrap-RPC','multi-class','selection-counts','hidden-selection-preserved','existing-member-protection','failure-retry','cache-TTL-refresh-invalidation','300-limit','group-switch','no-overflow','read-only-preview'],screenshots:output}));
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
