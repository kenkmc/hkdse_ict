'use strict';
// Run: node tests/manual-network.cjs
// Execute the actual network.json JavaScript in a minimal DOM/fetch fixture,
// plus catalogue/material/navigation URL checks. No browser engine, geometry,
// network request, LAN or real account is involved. This is not visual or
// cross-device evidence. Python handlers/SQLite are tested in manual-network.py.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const book = JSON.parse(read('course-manual/data/network.json'));

function syntaxChecks() {
  for (const unit of book.units) for (const section of unit.sections) {
    if (section.code?.language === 'javascript') new vm.Script(section.code.text);
    if (section.code?.language === 'python') {
      for (const match of section.code.text.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
        new vm.Script(match[1]);
      }
    }
  }
}

async function frontendFixture() {
  const source = book.units.find(u => u.id === 'eb-2').sections.find(s => s.id === 'javascript').code.text;
  const elements = {}, calls = [];
  for (const id of ['status', 'profile', 'age', 'bypass', 'username', 'password', 'load', 'logout', 'loginForm', 'ageForm']) {
    let value = '', text = '';
    elements[id] = {
      get value() { return value; }, set value(v) { value = String(v); },
      get textContent() { return text; }, set textContent(v) { text = String(v); },
      checked: false, listeners: {},
      addEventListener(type, fn) { this.listeners[type] = fn; }
    };
  }
  let online = true, logged = false, saved = 16;
  const fetch = async (url, options) => {
    calls.push({url, options});
    assert.equal(options.credentials, 'same-origin');
    if (!online) throw new Error('fixture offline');
    const body = options.body ? JSON.parse(options.body) : undefined;
    let status = 200, data;
    if (url === '/api/login') { logged = true; data = {message: 'ok'}; }
    else if (url === '/api/logout') { logged = false; data = {message: 'bye'}; }
    else {
      assert.equal(url, '/api/profile');
      if (!logged) { status = 401; data = {error: 'login required'}; }
      else if (options.method === 'POST' && (!Number.isInteger(body.age) || body.age < 12 || body.age > 100)) {
        status = 400; data = {error: 'invalid age'};
      } else {
        if (options.method === 'POST') saved = body.age;
        data = {studentId: 'S01', name: '<b>示例</b>', age: saved};
      }
    }
    return {status, ok: status < 400, json: async () => data};
  };
  vm.runInNewContext(source, {document: {getElementById: id => elements[id]}, fetch});
  const event = {preventDefault() {}};
  elements.username.value = 'alice'; elements.password.value = 'learn-only';
  await elements.loginForm.listeners.submit(event);
  assert.equal(elements.password.value, '');
  assert.ok(elements.profile.textContent.includes('S01／<b>示例</b>'));
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), {username: 'alice', password: 'learn-only'});
  assert.equal(calls[1].options.method, 'GET');

  const before = calls.length;
  elements.age.value = '11';
  await elements.ageForm.listeners.submit(event);
  assert.equal(calls.length, before, 'Client rejection must not send an update');
  assert.ok(elements.status.textContent.includes('客戶端'));
  elements.age.value = '18';
  await elements.ageForm.listeners.submit(event);
  assert.equal(JSON.parse(calls.at(-1).options.body).age, 18);
  assert.equal(saved, 18); assert.equal(elements.age.value, '18');

  elements.age.value = 'abc'; elements.bypass.checked = true;
  await elements.ageForm.listeners.submit(event);
  assert.equal(JSON.parse(calls.at(-1).options.body).age, null, 'NaN serialises to JSON null');
  assert.equal(saved, 18); assert.equal(elements.age.value, 'abc');
  assert.ok(elements.status.textContent.includes('400'));
  online = false; elements.age.value = '19';
  await elements.ageForm.listeners.submit(event);
  assert.ok(elements.status.textContent.includes('尚未確認'));
  assert.equal(elements.age.value, '19'); assert.equal(saved, 18);
  online = true;
  await elements.logout.listeners.click();
  assert.equal(elements.profile.textContent, '已登出'); assert.equal(logged, false);
  await elements.load.listeners.click();
  assert.ok(elements.status.textContent.includes('401'));
}

function navigationAndMaterials() {
  const context = {window: {}};
  vm.runInNewContext(read('course_data.js'), context);
  vm.runInNewContext(read('assets/js/lesson-plan-network.js'), context);
  const catalogue = context.window.HKDSE_ICT, plans = context.window.ICT_LESSON_PLANS;
  // Exercise the renderer's real local-link resolver without mounting a fake browser.
  const resolver = read('course-manual/manual.js').match(/const rootLink\s*=\s*[^;]+;/);
  assert(resolver, 'Manual renderer must define its material link resolver');
  const linkContext = {};
  vm.runInNewContext(resolver[0] + ';this.resolveMaterial=rootLink;', linkContext);
  const base = 'https://example.test/hkdse_ict/course-manual/index.html';
  let materialCount = 0;
  for (const unit of book.units) {
    const original = catalogue.getItemById(unit.id);
    assert(original && fs.existsSync(path.join(root, original.file)), unit.id + ' original lesson route');
    for (const section of unit.sections) for (const link of section.links || []) {
      materialCount++;
      const [file, hash] = link.href.split('#');
      assert(!link.href.startsWith('/') && !/^https?:/.test(link.href), 'Expected a local root-relative material');
      assert(fs.existsSync(path.join(root, file)), link.href);
      assert.equal(new URL(linkContext.resolveMaterial(link.href), base).href,
        new URL(link.href, 'https://example.test/hkdse_ict/').href);
      if (hash?.startsWith('sim-')) {
        assert(plans[file.replace(/\.html$/, '')]?.some(p => p.sim === hash.slice(4)),
          link.href + ' must be mounted on that actual lesson page');
      } else if (hash) {
        const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        assert(new RegExp('\\bid\\s*=\\s*([\'\"])' + escaped + '\\1').test(read(file)), link.href);
      }
    }
  }
  const navigation = read('animations/assets/host-navigation.js');
  const mappings = [
    ['chc.1', 'chc-1'], ['chc.2', 'chc-2'], ['chc.3', 'chc-3'], ['chc.4', 'chc-4'],
    ['chc.5', 'chc-5'], ['chc.6', 'chc-5'], ['elecb.1', 'eb-1'], ['elecb.2', 'eb-1'],
    ['elecb.3', 'eb-2'], ['elecb.4', 'eb-2'], ['elecb.5', 'eb-2'], ['pki_animation', 'chc-5']
  ];
  for (const [file, unitId] of mappings) {
    const anchors = [];
    const document = {
      createElement() { return {style: {}, setAttribute() {}, append(child) { anchors.push(child); }}; },
      body: {prepend() {}}
    };
    vm.runInNewContext(navigation, {location: {pathname: '/hkdse_ict/animations/' + file + '.html'}, document});
    const target = anchors.find(a => a.href?.includes('course-manual'));
    assert(target, file + ' has a manual link');
    assert.equal(new URL(target.href, 'https://example.test/hkdse_ict/animations/').searchParams.get('unit'), unitId);
    assert(book.units.some(u => u.id === unitId));
  }
  return {units: book.units.length, localMaterials: materialCount, standaloneMappings: mappings.length};
}

(async () => {
  syntaxChecks();
  await frontendFixture();
  const counts = navigationAndMaterials();
  console.log(JSON.stringify({status: 'PASS', ...counts,
    checks: ['JavaScript syntax', 'login and literal text output', 'client validation and numeric conversion',
      'bypass and server rejection fixture', 'offline uncertainty and retained input', 'logout',
      'material resolver and actual scene placements', 'standalone C4/C5/C6 and B1–B5 navigation'],
    limitation: 'Pure DOM/fetch fixture and source URL checks; no browser engine, layout audit, live networking or cross-device test.'}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
