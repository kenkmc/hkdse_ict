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
let serviceUrl = 'https://script.google.com/a/jcmkec.edu.hk/macros/s/TEST/exec';
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
  ScriptApp:{getService:()=>({getUrl:()=> serviceUrl})},
  HtmlService:{createHtmlOutput:html=>({html,setTitle(){return this;}})},
  UrlFetchApp:{fetch(url,options){fetched++;assert.equal(options.followRedirects,false);let result;
    if(url.endsWith('/token')){assert.equal(options.payload.grant_type,'authorization_code');assert.equal(options.payload.redirect_uri,serviceUrl,'Token exchange must retain the exact runtime redirect URI');assert(options.payload.client_secret);assert(options.payload.code_verifier);result={access_token:'private-access-token',token_type:'Bearer'};}
    else{assert.equal(url,'https://openidconnect.googleapis.com/v1/userinfo');assert.equal(options.headers.Authorization,'Bearer private-access-token');result={email:googleEmail,email_verified:verified,hd:googleDomain,sub:'google-subject'};}
    return {getResponseCode:()=>responseStatus,getContentText:()=>JSON.stringify(result)};
  }}
};
vm.createContext(context);
vm.runInContext(['Code.gs','GoogleAuth.gs','TeacherResources.gs','TeacherAdmin.gs'].map(file=>read('google-apps-script/'+file)).join('\n')+'\nthis.defs=SCHOOL_SYNC_SHEETS;',context);
Object.values(context.defs).forEach(def=>sheets.set(def.name,new Sheet(def.name,def.headers)));
sheets.get('TeacherDashboard').rows.unshift([],[],[],[]);
const students=sheets.get('Students');
const add=object=>students.appendRow(context.defs.students.headers.map(field=>object[field]??''));
add({StudentId:'STU-1',Class:'4A',ClassNo:'01',ChineseName:'甲',EnglishName:'TEST A',AccountKey:'legacy-key',Status:'ACTIVE',FirstLinkedAt:'legacy-date',LastLoginAt:'keep-last-date'});
add({StudentId:'STU-2',Class:'5B',ClassNo:'02',ChineseName:'乙',EnglishName:'TEST B',Status:'ACTIVE'});
add({StudentId:'STU-3',Class:'6C',ClassNo:'03',ChineseName:'丙',EnglishName:'TEST C',Status:'INACTIVE'});
sheets.get('GroupMembers').appendRow(['STU-1|GROUP','STU-1','GROUP',true]);
sheets.get('ExerciseAttempts').appendRow(['ATTEMPT','A','SESSION','STU-1','practice','Q','chc-1',1,2,'date','date']);
const histories=JSON.stringify([...sheets].filter(([name])=>name!=='Students').map(([name,sheet])=>[name,sheet.rows]));
let adminToken=context.teacherAdminBootstrap().token;
const admin=(name,payload={})=>context[name](Object.assign({token:adminToken},payload));
const row=id=>context.teacherAdminPublicRow_('students',context.objects_(students).find(item=>item.StudentId===id));
const correct=(id,email)=>{const r=row(id);return admin('teacherGoogleAuthCorrect',{key:r._key,revision:r._revision,email});};

// Both old and new physical layouts work during rollout; never recreate the removed code column.
const original=JSON.stringify(students.rows);
context.ensureSheet_(spreadsheet,context.defs.students);assert.equal(JSON.stringify(students.rows),original);
students.rows.forEach((r,i)=>r.splice(7,0,i===0?'ActivationCode':'OLD-CODE'));
context.ensureSheet_(spreadsheet,context.defs.students);
context.writeStudentFields_(students,2,{GoogleEmail:'layout-test@jcmkec.edu.hk'});
assert.equal(students.rows[1][10],'layout-test@jcmkec.edu.hk');assert.equal(students.rows[1][7],'OLD-CODE');
assert.equal(context.teacherAdminRows_(spreadsheet,'students')[0].GoogleEmail,'layout-test@jcmkec.edu.hk');
context.writeStudentFields_(students,2,{GoogleEmail:''});
students.rows.forEach(r=>r.splice(7,1));
context.ensureSheet_(spreadsheet,context.defs.students);assert.equal(JSON.stringify(students.rows),original);
assert.equal(students.rows[0].length,10);assert.equal(students.rows[0][9],'GoogleEmail');
assert(context.doGet({parameter:{}}).html.includes('Google 登入尚未啟用'));
assert.throws(()=>context.syncProgress_({parameter:{}}),/Google 登入尚未啟用/);
for (const action of ['activate','generate-codes']) {
  const retired=context.doPost({parameter:{action}});assert(retired.html.includes('此操作已停用'));assert(!retired.html.includes('name="activationCode"'));
}
assert.equal(typeof context.activateStudent_,'undefined');assert.equal(typeof context.generateActivationCodes,'undefined');
if (process.env.LEGACY_COLUMN_LAYOUT === '1') students.rows.forEach((r,i)=>r.splice(7,0,i===0?'ActivationCode':'RETIRED-CODE'));
const col=field=>students.rows[0].indexOf(field);
const before=JSON.stringify(students.rows);
assert.throws(()=>admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'}),/先完成/);
assert.equal(JSON.stringify(students.rows),before);
const credentials={clientId:'123456-test.apps.googleusercontent.com',clientSecret:'GOCSPX-test_secret_only'};
// Settings must load even if the roster/assignment sheets cannot be read.
const originalSpreadsheet=context.activeOrConfiguredSpreadsheet_;
context.activeOrConfiguredSpreadsheet_=()=>{throw new Error('Settings must not load the roster');};
const initial=context.teacherGoogleAuthBootstrap();
assert.equal(initial.token.length,64);assert.deepEqual(Object.keys(initial).sort(),['googleLogin','token']);
context.activeOrConfiguredSpreadsheet_=originalSpreadsheet;
adminToken=initial.token;
const originalProperties=JSON.stringify([...properties]);
let formResult=context.doPost({parameter:{action:'google-save-config',...credentials,token:'invalid'}});
assert(formResult.html.includes('未能儲存'));assert(formResult.html.includes('auth-settings=1'));
assert.equal(JSON.stringify([...properties]),originalProperties);
nativeEmail='student@jcmkec.edu.hk';
formResult=context.doPost({parameter:{action:'google-save-config',...credentials,token:adminToken}});
assert(formResult.html.includes('只有部署'));assert.equal(JSON.stringify([...properties]),originalProperties);
nativeEmail='teacher@jcmkec.edu.hk';
formResult=context.doPost({parameter:{action:'google-save-config',...credentials,token:adminToken,clientSecret:'****'}});
assert(formResult.html.includes('Client secret 格式不正確'));assert.equal(JSON.stringify([...properties]),originalProperties);
formResult=context.doPost({parameter:{action:'google-save-config',...credentials,token:adminToken}});
assert(formResult.html.includes('OAuth 設定已儲存'));assert(formResult.html.includes('google-test=1'));
assert(!formResult.html.includes(credentials.clientSecret));assert.equal(JSON.stringify(students.rows),before);
const status=admin('teacherAdminBootstrap').googleLogin;
assert.equal(status.configured,true);assert(!JSON.stringify(status).includes(credentials.clientSecret));
assert(status.credentialsSaved);assert(status.statusMessage.includes('尚未測試／啟用'));
assert(status.diagnosticText.includes('NOT_ENABLED'));assert(!status.diagnosticText.includes(adminToken));
const productionUrl=serviceUrl;
const validRedirectUrls=[productionUrl,'https://script.google.com/a/macros/jcmkec.edu.hk/s/TEST/exec','https://script.google.com/macros/s/TEST/exec'];
const propertiesBeforeUrlChecks=JSON.stringify([...properties]);
for (const validUrl of validRedirectUrls) {
  serviceUrl=validUrl;
  const validStatus=context.googleAuthPublicStatus_();
  assert(validStatus.configured);assert.equal(validStatus.configError,'');
  assert.equal(validStatus.redirectUri,validUrl,'Do not normalize Workspace URL aliases for OAuth');
  const page=context.googleLoginPage_(true);
  const authUrl=new URL(page.html.match(/href="(https:\/\/accounts[^\"]+)"/)[1].replace(/&amp;/g,'&'));
  assert.equal(authUrl.searchParams.get('redirect_uri'),validUrl);
}
assert.equal(JSON.stringify([...properties]),propertiesBeforeUrlChecks,'URL validation must not modify saved credentials or auth mode');
for (const invalidUrl of ['',...validRedirectUrls.flatMap(url=>[
  url.replace('/exec','/dev'),url+'?auth-settings=1',url+'#fragment',url+'/',url+'\n',
  url.replace('https:','http:'),url.replace('script.google.com','script.google.com.example.org'),
  url.replace('script.google.com','script.google.com@evil.example'),url.replace('/s/TEST/','/s/../'),
]),productionUrl.replace('jcmkec.edu.hk','other.edu.hk')]) {
  serviceUrl=invalidUrl;
  const badStatus=context.googleAuthPublicStatus_();
  assert(badStatus.credentialsSaved);assert.equal(badStatus.configured,false);assert.equal(badStatus.tested,false);
  assert(badStatus.statusMessage.includes('已儲存'));assert(badStatus.configError.includes('回跳網址'));
  assert(badStatus.diagnosticText.includes('INVALID_REDIRECT_URI'));assert(!JSON.stringify(badStatus).includes(credentials.clientSecret));
  assert.throws(()=>context.googleAuthConfig_(),/回跳網址/);
}
serviceUrl=productionUrl.replace('/exec','/dev');
const savedButInvalid=context.doPost({parameter:{action:'google-save-config',...credentials,token:adminToken}});
assert(savedButInvalid.html.includes('OAuth 設定已儲存'));assert(savedButInvalid.html.includes('查看設定診斷'));
assert(!savedButInvalid.html.includes('google-test=1'));
serviceUrl=productionUrl;
properties.delete('GOOGLE_LOGIN_CLIENT_SECRET');
assert.equal(context.googleAuthPublicStatus_().credentialsSaved,false);
assert(context.googleAuthPublicStatus_().diagnosticText.includes('MISSING_CLIENT_SECRET'));
properties.set('GOOGLE_LOGIN_CLIENT_SECRET',credentials.clientSecret);
const start=(test=false)=>{const page=context.googleLoginPage_(test);const url=new URL(page.html.match(/href="(https:\/\/accounts[^\"]+)"/)[1].replace(/&amp;/g,'&'));assert.equal(url.searchParams.get('redirect_uri'),serviceUrl);assert.equal(url.searchParams.get('prompt'),'select_account');assert.equal(url.searchParams.get('scope'),'openid email');assert.equal(url.searchParams.get('code_challenge_method'),'S256');return url.searchParams.get('state');};
const callback=state=>context.googleOAuthCallback_({parameter:{state,code:'google-one-use-code'}});
googleEmail='teacher@jcmkec.edu.hk';let state=start(true);const tested=callback(state);assert(tested.html.includes('測試成功'));assert(properties.get('GOOGLE_LOGIN_TESTED'));assert.equal(JSON.stringify(students.rows),before);
assert(tested.html.includes('不是學生進度同步'));
assert(context.googleAuthPublicStatus_().statusMessage.includes('尚未啟用'));
assert.throws(()=>callback(state),/逾時或已使用/);
state=start(true);caller='different-session';assert.throws(()=>callback(state),/工作階段不相符/);caller='native-browser-session';
responseStatus=400;assert.throws(()=>callback(state),/未能確認/);responseStatus=200;assert.throws(()=>callback(state),/逾時或已使用/);
state=start(true);assert.throws(()=>context.googleOAuthCallback_({parameter:{state,error:'access_denied'}}),/已取消/);
correct('STU-2','assigned@jcmkec.edu.hk');assert.equal(students.rows[1][5],'legacy-key','Prefilling email must preserve the legacy login.');
admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'});
assert.equal(properties.get('STUDENT_AUTH_MODE'),'GOOGLE');
assert.equal(students.rows[1][0],'STU-1');assert.equal(students.rows[1][5],'');assert.equal(students.rows[1][col('FirstLinkedAt')],'');assert.equal(students.rows[1][col('LastLoginAt')],'keep-last-date');
assert.equal(students.rows[2][col('GoogleEmail')],'assigned@jcmkec.edu.hk');
const backup=sheets.get(properties.get('GOOGLE_LOGIN_BACKUP_SHEET'));assert.equal(backup.rows[1][5],'legacy-key');
const afterEnable=JSON.stringify(students.rows);admin('teacherGoogleAuthEnable',{confirm:'RESET_OLD_BINDINGS'});assert.equal(JSON.stringify(students.rows),afterEnable,'Migration must be idempotent.');
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
assert.equal(students.rows[1][col('GoogleEmail')],'student@jcmkec.edu.hk');assert.equal(students.rows[1][0],'STU-1');assert.throws(()=>pair(),/已使用/);
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
const syncEvent=connectionToken=>({parameter:{connectionToken,payload:JSON.stringify({schemaVersion:2,clientNonce:'testnonce123456',snapshot:{format:'hkdse-ict-school-sync',schemaVersion:2,summary:{}}})}});
// Even a well-formed server token cannot give an unlisted account a success receipt.
const unknownToken=context.createConnectionToken_(context.accountKey_('teacher@jcmkec.edu.hk','test-secret'),'NO-STUDENT',18000,
  {callerKey:context.googleCallerKey_(),authEpoch:properties.get('GOOGLE_LOGIN_EPOCH')});
const unknownResult=context.doPost(syncEvent(unknownToken));
assert(unknownResult.html.includes('未能完成要求'));assert(!unknownResult.html.includes('sync=success'));assert.equal(writes,0);
const originalFlush=context.SpreadsheetApp.flush;
context.SpreadsheetApp.flush=()=>{throw new Error('Test write flush failure');};
const failedWrite=context.doPost(syncEvent(secondToken));
assert(failedWrite.html.includes('未能完成要求'));assert(!failedWrite.html.includes('sync=success'));
context.SpreadsheetApp.flush=originalFlush;writes=0;
nativeEmail=''; // Explicit Google OAuth, not the browser's default/native account email, authorizes this sync.
const synced=context.syncProgress_({parameter:{connectionToken:secondToken,payload:JSON.stringify({schemaVersion:2,clientNonce:'testnonce123456',snapshot:{format:'hkdse-ict-school-sync',schemaVersion:2,summary:{}}})}});
assert(synced.html.includes('同步完成'));assert.equal(writes,7);
assert(synced.html.includes('Google 電郵登入'));assert(synced.html.includes('學生：4A（01）'));
assert(synced.html.includes('本次同步時間（香港）'));assert(synced.html.includes('練習次數 0'));
assert.throws(()=>context.verifyGoogleConnection_(secondToken),/已過期/);
const replacementToken=getToken(synced);assert.equal(context.verifyGoogleConnection_(replacementToken).studentId,'STU-1');
Object.assign(context,savedSinks);
students.rows[1][col('GoogleEmail')]='manual-correction@jcmkec.edu.hk';
assert.throws(()=>context.syncProgress_({parameter:{connectionToken:replacementToken,payload:JSON.stringify({schemaVersion:2,clientNonce:'testnonce123456',snapshot:{format:'hkdse-ict-school-sync',schemaVersion:2,summary:{}}})}}),/電郵配對已更改/,'Even a direct Sheet email edit must invalidate old identity access.');
students.rows[1][col('GoogleEmail')]='student@jcmkec.edu.hk';
assert.throws(()=>context.verifyGoogleConnection_(token),/工作階段已更改/);
const legacy=context.createConnectionToken_('legacy','STU-1',18000);assert.throws(()=>context.verifyGoogleConnection_(legacy),/工作階段已更改/);
state=start();googleEmail='other@jcmkec.edu.hk';const other=callback(state);const otherTicket=other.html.match(/name="identityTicket" value="([a-f0-9]+)"/)[1];
assert.throws(()=>context.registerGoogleStudent_({parameter:{identityTicket:otherTicket,className:'4A',classNo:'01',confirmOwnRoster:'yes'}}),/另一個 Google/);

nativeEmail='teacher@jcmkec.edu.hk';adminToken=context.teacherAdminBootstrap().token;
assert.throws(()=>correct('STU-2','student@jcmkec.edu.hk'),/另一名/);
assert.throws(()=>correct('STU-1','outsider@gmail.com'),/本校/);
correct('STU-1','corrected@jcmkec.edu.hk');assert.equal(students.rows[1][col('GoogleEmail')],'corrected@jcmkec.edu.hk');assert.equal(students.rows[1][5],'');
assert.throws(()=>context.verifyGoogleConnection_(replacementToken),/工作階段已更改/);
correct('STU-1','');assert.equal(students.rows[1][col('GoogleEmail')],'');
if (process.env.LEGACY_COLUMN_LAYOUT === '1') assert.equal(students.rows[1][7],'RETIRED-CODE','Transitional layout must ignore the obsolete code column, not reuse it.');
for(const name of ['teacherGoogleAuthBootstrap','teacherGoogleAuthSave','teacherGoogleAuthEnable','teacherGoogleAuthCorrect']){nativeEmail='student@jcmkec.edu.hk';assert.throws(()=>context[name]({token:adminToken}),/只有部署/);}
assert.equal(histories,JSON.stringify([...sheets].filter(([name])=>name!=='Students'&&!name.startsWith('StudentsLoginBackup_')).map(([name,sheet])=>[name,sheet.rows])),'No history, groups or tasks may be rewritten by login migration.');
assert.equal(locks,0);assert(fetched>0);
new vm.Script(read('google-apps-script/GoogleAuthSettings.html').match(/<script>([\s\S]*?)<\/script>/)[1]);
assert(!/localStorage|sessionStorage|<script[^>]+src=/.test(read('google-apps-script/GoogleAuthSettings.html')));
assert(JSON.parse(read('google-apps-script/appsscript.json')).oauthScopes.includes('https://www.googleapis.com/auth/script.external_request'));
console.log('Google login validation passed: code exchange, PKCE/state/session binding, verified school identity, migration backup, preserved roster/history, immediate pairing, cross-device login, duplicate protection, teacher correction and token invalidation.');
