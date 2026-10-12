const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const properties = new Map(Object.entries({ SCHOOL_DOMAIN:'jcmkec.edu.hk', SHEET_ID:'TEST', ACCOUNT_KEY_SECRET:'test-secret',
  SITE_PROGRESS_URL:'https://kenkmc.github.io/hkdse_ict/progress.html', TOKEN_TTL_SECONDS:'18000' }));
let nativeEmail = 'teacher@jcmkec.edu.hk', caller = 'native-browser-session', locks = 0, fetched = 0;
let googleEmail = 'student@jcmkec.edu.hk', googleDomain = 'jcmkec.edu.hk', verified = true, responseStatus = 200;
const cache = new Map(), sheets = new Map();
class Sheet {
  constructor(name, headers) {this.name=name;this.rows=[Array.from(headers)];}
  getLastRow(){return this.rows.length;} getLastColumn(){return Math.max(...this.rows.map(row=>row.length));}
  getRange(row,column,height=1,width=1){const self=this;return {
    getValues:()=>Array.from({length:height},(_,r)=>Array.from({length:width},(_,c)=>self.rows[row-1+r]?.[column-1+c]??'')),
    setValues(values){values.forEach((cells,r)=>cells.forEach((value,c)=>{self.rows[row-1+r]??=[];self.rows[row-1+r][column-1+c]=value;}));return this;},
    setValue(value){return this.setValues([[value]]);},clearContent(){return this.setValues(Array.from({length:height},()=>Array(width).fill('')));},
    setFontWeight(){return this;},setBackground(){return this;},setFontColor(){return this;},setHorizontalAlignment(){return this;}
  };}
  appendRow(row){this.rows.push(Array.from(row));}
  copyTo(){const copy=new Sheet('copy-'+sheets.size,[]);copy.rows=this.rows.map(row=>row.slice());sheets.set(copy.name,copy);return copy;}
  setName(name){sheets.delete(this.name);this.name=name;sheets.set(name,this);return this;}
}
const spreadsheet={getSheetByName:name=>sheets.get(name),getUrl:()=> 'https://docs.google.com/spreadsheets/d/TEST/edit'};
const context={Date,console,
  PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key)||'',setProperty:(key,value)=>properties.set(key,value),deleteProperty:key=>properties.delete(key)})},
  CacheService:{getScriptCache:()=>({get:key=>cache.get(key),put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})},
  LockService:{getScriptLock:()=>({waitLock:()=>{assert.equal(locks++,0,'Unexpected nested lock');},releaseLock:()=>{locks--;}})},
  Session:{getActiveUser:()=>({getEmail:()=>nativeEmail}),getEffectiveUser:()=>({getEmail:()=> 'teacher@jcmkec.edu.hk'}),getTemporaryActiveUserKey:()=>caller},
  Utilities:{getUuid:()=>crypto.randomUUID(),Charset:{UTF_8:'utf8'},DigestAlgorithm:{SHA_256:'sha256'},
    computeDigest:(_,value)=>crypto.createHash('sha256').update(value).digest(),
    computeHmacSha256Signature:(value,secret)=>crypto.createHmac('sha256',secret).update(value).digest(),
    base64EncodeWebSafe:value=>Buffer.from(value).toString('base64url')},
  SpreadsheetApp:{getActiveSpreadsheet:()=>spreadsheet,openById:()=>spreadsheet,flush(){}},
  ScriptApp:{getService:()=>({getUrl:()=> 'https://script.google.com/a/macros/jcmkec.edu.hk/s/TEST/exec'})},
  HtmlService:{createHtmlOutput:html=>({html,setTitle(){return this;}})},
  UrlFetchApp:{fetch(url,options){fetched++;assert.equal(options.followRedirects,false);let result;
    if(url.endsWith('/token')){assert.equal(options.payload.grant_type,'authorization_code');assert(options.payload.client_secret);assert(options.payload.code_verifier);result={access_token:'private-access-token',token_type:'Bearer'};}
    else{assert.equal(url,'https://openidconnect.googleapis.com/v1/userinfo');assert.equal(options.headers.Authorization,'Bearer private-access-token');result={email:googleEmail,email_verified:verified,hd:googleDomain,sub:'google-subject'};}
    return {getResponseCode:()=>responseStatus,getContentText:()=>JSON.stringify(result)};
  }}
};
vm.createContext(context);
vm.runInContext(['Code.gs','GoogleAuth.gs','TeacherResources.gs','TeacherAdmin.gs'].map(file=>read('google-apps-script/'+file)).join('\n')+'\nthis.defs=SCHOOL_SYNC_SHEETS;',context);
Object.values(context.defs).forEach(def=>sheets.set(def.name,new Sheet(def.name,def.headers)));
const students=sheets.get('Students');
const add=object=>students.appendRow(context.defs.students.headers.map(field=>object[field]??''));
add({StudentId:'STU-1',Class:'4A',ClassNo:'01',ChineseName:'甲',EnglishName:'TEST A',AccountKey:'legacy-key',Status:'ACTIVE',ActivationCode:'ABCDEFGH',FirstLinkedAt:'legacy-date',LastLoginAt:'keep-last-date'});
add({StudentId:'STU-2',Class:'5B',ClassNo:'02',ChineseName:'乙',EnglishName:'TEST B',Status:'ACTIVE'});
add({StudentId:'STU-3',Class:'6C',ClassNo:'03',ChineseName:'丙',EnglishName:'TEST C',Status:'INACTIVE'});
sheets.get('GroupMembers').appendRow(['STU-1|GROUP','STU-1','GROUP',true]);
sheets.get('ExerciseAttempts').appendRow(['ATTEMPT','A','SESSION','STU-1','practice','Q','chc-1',1,2,'date','date']);
const histories=JSON.stringify([...sheets].filter(([name])=>name!=='Students').map(([name,sheet])=>[name,sheet.rows]));
let adminToken=context.teacherAdminBootstrap().token;
const admin=(name,payload={})=>context[name](Object.assign({token:adminToken},payload));
const row=id=>context.teacherAdminPublicRow_('students',context.objects_(students).find(item=>item.StudentId===id));
const correct=(id,email)=>{const r=row(id);return admin('teacherGoogleAuthCorrect',{key:r._key,revision:r._revision,email});};

// Schema upgrade appends only K1; original roster fields remain intact.
students.rows[0].pop();const original=JSON.stringify(students.rows.slice(1));context.ensureSheet_(spreadsheet,context.defs.students);
assert.equal(students.rows[0][10],'GoogleEmail');assert.equal(JSON.stringify(students.rows.slice(1)),original);
const before=JSON.stringify(students.rows);
assert.throws(()=>admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'}),/先完成/);
assert.equal(JSON.stringify(students.rows),before);
const credentials={clientId:'123456-test.apps.googleusercontent.com',clientSecret:'GOCSPX-test_secret_only'};
admin('teacherGoogleAuthSave',credentials);
const status=admin('teacherAdminBootstrap').googleLogin;
assert.equal(status.configured,true);assert(!JSON.stringify(status).includes(credentials.clientSecret));
const start=(test=false)=>{const page=context.googleLoginPage_(test);const url=new URL(page.html.match(/href="(https:\/\/accounts[^\"]+)"/)[1].replace(/&amp;/g,'&'));assert.equal(url.searchParams.get('prompt'),'select_account');assert.equal(url.searchParams.get('scope'),'openid email');assert.equal(url.searchParams.get('code_challenge_method'),'S256');return url.searchParams.get('state');};
const callback=state=>context.googleOAuthCallback_({parameter:{state,code:'google-one-use-code'}});
googleEmail='teacher@jcmkec.edu.hk';let state=start(true);const tested=callback(state);assert(tested.html.includes('測試成功'));assert(properties.get('GOOGLE_LOGIN_TESTED'));assert.equal(JSON.stringify(students.rows),before);
assert.throws(()=>callback(state),/逾時或已使用/);
state=start(true);caller='different-session';assert.throws(()=>callback(state),/工作階段不相符/);caller='native-browser-session';
responseStatus=400;assert.throws(()=>callback(state),/未能確認/);responseStatus=200;assert.throws(()=>callback(state),/逾時或已使用/);
state=start(true);assert.throws(()=>context.googleOAuthCallback_({parameter:{state,error:'access_denied'}}),/已取消/);
correct('STU-2','assigned@jcmkec.edu.hk');assert.equal(students.rows[1][5],'legacy-key','Prefilling email must preserve the legacy login.');
admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'});
assert.equal(properties.get('STUDENT_AUTH_MODE'),'GOOGLE');
assert.equal(students.rows[1][0],'STU-1');assert.equal(students.rows[1][5],'');assert.equal(students.rows[1][7],'');assert.equal(students.rows[1][8],'');assert.equal(students.rows[1][9],'keep-last-date');
assert.equal(students.rows[2][10],'assigned@jcmkec.edu.hk');
const backup=sheets.get(properties.get('GOOGLE_LOGIN_BACKUP_SHEET'));assert.equal(backup.rows[1][5],'legacy-key');
const afterEnable=JSON.stringify(students.rows);admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'});assert.equal(JSON.stringify(students.rows),afterEnable,'Migration must be idempotent.');
assert.throws(()=>context.activateStudent_({parameter:{}}),/改用 Google/);
assert.throws(()=>admin('teacherGoogleAuthSave',credentials),/已啟用/);

nativeEmail='native-account@jcmkec.edu.hk';googleEmail='student@jcmkec.edu.hk';
state=start();googleDomain='gmail.com';assert.throws(()=>callback(state),/本校/);googleDomain='jcmkec.edu.hk';
state=start();verified=false;assert.throws(()=>callback(state),/已驗證/);verified=true;
state=start();let register=callback(state);assert(register.html.includes('student@jcmkec.edu.hk'));
assert(!register.html.includes('TEST A')&&!register.html.includes('assigned@jcmkec.edu.hk'),'Unpaired users must not see other students names or emails.');
const ticket=register.html.match(/name="identityTicket" value="([a-f0-9]+)"/)[1];
const pair=(overrides={})=>context.registerGoogleStudent_({parameter:{identityTicket:ticket,className:'4A',classNo:'1',confirmOwnRoster:'yes',...overrides}});
assert.throws(()=>pair({classNo:'999'}),/名冊/);assert.throws(()=>pair({className:'6C',classNo:'3'}),/未啟用/);
assert.throws(()=>pair({confirmOwnRoster:''}),/確認/);
register=pair({email:'spoofed@jcmkec.edu.hk',activationCode:'ignored'});assert(register.html.includes('登入成功'));
assert.equal(students.rows[1][10],'student@jcmkec.edu.hk');assert.equal(students.rows[1][0],'STU-1');assert.throws(()=>pair(),/已使用/);
const getToken=page=>page.html.match(/school-connect=([a-f0-9]+)/)[1];
const token=getToken(register), identity=context.verifyGoogleConnection_(token);
assert.equal(identity.studentId,'STU-1');assert.equal(identity.authMode,'google');
assert(!JSON.stringify(identity).includes('private-access-token'));
// A new device/native account still resolves by the explicitly selected OAuth email.
caller='second-device';nativeEmail='another-default@jcmkec.edu.hk';state=start();const repeat=callback(state);assert(repeat.html.includes('登入成功'));assert(!repeat.html.includes('配對名冊'));
const secondToken=getToken(repeat);assert.equal(context.verifyGoogleConnection_(secondToken).studentId,'STU-1');
// Run the real sync authorization/receipt path, stub only history sinks checked by other suites.
const sinks=['saveLatest_','saveTopics_','saveSessions_','savePages_','saveAttempts_','saveAssignmentProgress_','refreshTeacherDashboard_'];
const savedSinks=Object.fromEntries(sinks.map(name=>[name,context[name]]));let writes=0;
sinks.forEach(name=>context[name]=()=>{writes++;});
nativeEmail=''; // Explicit Google OAuth, not the browser's default/native account email, authorizes this sync.
const synced=context.syncProgress_({parameter:{connectionToken:secondToken,payload:JSON.stringify({schemaVersion:2,clientNonce:'testnonce123456',snapshot:{format:'hkdse-ict-school-sync',schemaVersion:2,summary:{}}})}});
assert(synced.html.includes('同步完成'));assert.equal(writes,7);
assert.throws(()=>context.verifyGoogleConnection_(secondToken),/已過期/);
const replacementToken=getToken(synced);assert.equal(context.verifyGoogleConnection_(replacementToken).studentId,'STU-1');
Object.assign(context,savedSinks);
students.rows[1][10]='manual-correction@jcmkec.edu.hk';
assert.throws(()=>context.syncProgress_({parameter:{connectionToken:replacementToken,payload:JSON.stringify({schemaVersion:2,clientNonce:'testnonce123456',snapshot:{format:'hkdse-ict-school-sync',schemaVersion:2,summary:{}}})}}),/電郵配對已更改/,'Even a direct Sheet email edit must invalidate old identity access.');
students.rows[1][10]='student@jcmkec.edu.hk';
assert.throws(()=>context.verifyGoogleConnection_(token),/工作階段已更改/);
const legacy=context.createConnectionToken_('legacy','STU-1',18000);assert.throws(()=>context.verifyGoogleConnection_(legacy),/工作階段已更改/);
state=start();googleEmail='other@jcmkec.edu.hk';const other=callback(state);const otherTicket=other.html.match(/name="identityTicket" value="([a-f0-9]+)"/)[1];
assert.throws(()=>context.registerGoogleStudent_({parameter:{identityTicket:otherTicket,className:'4A',classNo:'01',confirmOwnRoster:'yes'}}),/另一個 Google/);

nativeEmail='teacher@jcmkec.edu.hk';adminToken=context.teacherAdminBootstrap().token;
assert.throws(()=>correct('STU-2','student@jcmkec.edu.hk'),/另一名/);
assert.throws(()=>correct('STU-1','outsider@gmail.com'),/本校/);
correct('STU-1','corrected@jcmkec.edu.hk');assert.equal(students.rows[1][10],'corrected@jcmkec.edu.hk');assert.equal(students.rows[1][5],'');
assert.throws(()=>context.verifyGoogleConnection_(replacementToken),/工作階段已更改/);
correct('STU-1','');assert.equal(students.rows[1][10],'');
for(const name of ['teacherGoogleAuthSave','teacherGoogleAuthEnable','teacherGoogleAuthCorrect']){nativeEmail='student@jcmkec.edu.hk';assert.throws(()=>context[name]({token:adminToken}),/只有部署/);}
assert.equal(histories,JSON.stringify([...sheets].filter(([name])=>name!=='Students'&&!name.startsWith('StudentsLoginBackup_')).map(([name,sheet])=>[name,sheet.rows])),'No history, groups or tasks may be rewritten by login migration.');
assert.equal(locks,0);assert(fetched>0);
new vm.Script(read('google-apps-script/GoogleAuthSettings.html').match(/<script>([\s\S]*?)<\/script>/)[1]);
assert(!/localStorage|sessionStorage|<script[^>]+src=/.test(read('google-apps-script/GoogleAuthSettings.html')));
assert(JSON.parse(read('google-apps-script/appsscript.json')).oauthScopes.includes('https://www.googleapis.com/auth/script.external_request'));
console.log('Google login validation passed: code exchange, PKCE/state/session binding, verified school identity, migration backup, preserved roster/history, immediate pairing, cross-device login, duplicate protection, teacher correction and token invalidation.');
