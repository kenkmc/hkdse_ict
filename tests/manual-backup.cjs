'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const values=new Map();let failKey='',changed=0;
const storage={getItem:k=>values.has(k)?values.get(k):null,removeItem:k=>values.delete(k),setItem(k,v){if(k===failKey&&v.includes('new-import'))throw Error('quota');values.set(k,String(v));}};
const w={localStorage:storage,sessionStorage:storage,dispatchEvent(){changed++;},CustomEvent:function(){}};
const context={window:w,CustomEvent:w.CustomEvent,Date,Math,console};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/js/progress_store.js'),'utf8'),context);
const p=w.HKDSEProgress,key=p.storageKey,mkey='hkdse-ict-manual-v1';
values.set(key,JSON.stringify({schemaVersion:2,events:[],visits:{old:{count:1}}}));values.set(mkey,JSON.stringify({schemaVersion:1,responses:{old:{text:'original'}}}));
const original=new Map(values),backup={format:'hkdse-ict-progress-backup',progress:{schemaVersion:2,events:[],visits:{'new-import':{count:2}}},legacy:{[mkey]:{schemaVersion:1,responses:{q:{text:'new-import'}}}}};
for(const failure of [key,mkey]){failKey=failure;assert.throws(()=>p.importData(backup),/原有紀錄已保留/);assert.deepEqual(values,original,'Failed import must roll back all replaced keys');assert.equal(changed,0,'Do not announce a failed import as changed');}
failKey='';p.importData(backup);assert.equal(changed,1);assert(values.get(key).includes('new-import'));assert(values.get(mkey).includes('new-import'));assert(p.exportData().legacy[mkey]);
const oldManual=values.get(mkey);p.importData({format:'hkdse-ict-progress-backup',progress:{events:[]},legacy:{}});assert.equal(values.get(mkey),oldManual,'Older backup without manual data does not erase current notes');
console.log('PASS manual backup: all-or-nothing restore, quota rollback at each key, legacy compatibility and successful export/restore.');
