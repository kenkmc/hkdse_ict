const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let intervalId = 0;
const intervals = new Map();
const sandbox = {window: {}, setInterval(fn, period) { const id = ++intervalId; intervals.set(id, {fn, period}); return id; }, clearInterval(id) { intervals.delete(id); }};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../assets/js/topic-data.js'), 'utf8'), sandbox);
const M = sandbox.window.ICTDataModels;
// Exhaustive signed encoding and add/subtract truth tables for both word sizes.
for (const width of [4, 8]) {
  const min = -(2 ** (width - 1)), max = 2 ** (width - 1) - 1;
  for (let n = min; n <= max; n++) {
    assert.equal(M.signed(M.bits(n, width)), n);
    assert.equal(M.twosTrace(n, width).at(-1).bits, M.bits(n, width));
    for (let b = min; b <= max; b++) for (const subtract of [false, true]) {
      const expected = subtract ? n - b : n + b, actual = M.add(n, b, width, subtract);
      assert.equal(actual.result, M.bits(expected, width));
      assert.equal(actual.signed, M.signed(actual.result));
      assert.equal(actual.overflow, expected < min || expected > max);
      assert.equal(actual.traces.at(-1).output, actual.result);
      const unsignedSum = parseInt(M.bits(n, width), 2) + (subtract ? (2 ** width - 1) ^ parseInt(M.bits(b, width), 2) : parseInt(M.bits(b, width), 2)) + Number(subtract);
      assert.equal(actual.carry, Number(unsignedSum >= 2 ** width));
    }
  }
}
assert.equal(M.twosTrace(-128, 8).at(-1).bits, '10000000');
assert.equal(M.add(7, 1, 4).carry, 0);
assert.equal(M.add(7, 1, 4).overflow, true);
assert.equal(M.add(-1, 1, 4).carry, 1);
assert.equal(M.add(-1, 1, 4).overflow, false);
assert.equal(M.convert('2F', 16).n, 47);
assert.equal(M.convert('101101', 2).decimal, '45');
assert.equal(M.convert('102', 2), null);
assert.equal(M.convert('65536', 10), null);
assert.equal(M.copyFormula('=B2*$F$1', 1, 2), '=C4*$F$1');
assert.equal(M.copyFormula('=$B2*C$1', 2, 3), '=$B5*E$1');
assert.equal(M.copyFormula('=A1', -1, 0), '=#REF!');
assert.equal(M.evaluateProduct('=B2*$F$1', {B2: 100, F1: .1}), 10);
assert.equal(M.evaluateProduct('=alert(1)', {}), null);
const bits = [1, 0, 1, 0, 0, 1, 0, 1], parity = M.parity(bits);
const sent = bits.concat(parity);
assert.equal(M.parityValid(sent), true);
sent[0] ^= 1; assert.equal(M.parityValid(sent), false);
sent[1] ^= 1; assert.equal(M.parityValid(sent), true);
assert.equal(M.parityValid(bits.concat(M.parity(bits, true)), true), true);
const rows = [{id: 1, house: '紅', score: 80}, {id: 2, house: '紅', score: 100}, {id: 3, house: '藍', score: null}];
assert.equal(M.aggregate(rows)[0].count, 2);
assert.equal(M.aggregate(rows)[0].mean, 90);
assert.equal(M.query(rows, 90, '全部', true)[0].id, 2);
for (const depth of [1, 2, 4, 8]) {
  assert.equal(M.quantize(-10, -10, 50, depth).code, 0);
  assert.equal(M.quantize(50, -10, 50, depth).code, 2 ** depth - 1);
  assert.equal(M.quantize(32, -10, 50, depth).bits.length, depth);
}
for (const mode of ['batch', 'timeshare', 'realtime']) {
  const schedule = M.schedule(mode);
  for (const [id, count] of [['A', 4], ['B', 2], ['C', 3]]) assert.equal(schedule.filter(s => s.job === id).length, count);
}
assert.equal(M.schedule('batch').find(s => s.job === 'B' && s.completed).time + 1, 6);
assert.equal(M.schedule('realtime').find(s => s.job === 'B' && s.completed).time + 1, 2);
assert.equal(sandbox.window.ICT_TOPIC_SIMS.length, 13);
console.log('PASS: exhaustive 4/8-bit two\'s-complement and arithmetic, parity limitations, references, query, quantization and scheduling. 13 simulations registered.');

// Mount the real components, with browser-like string-valued form controls and
// deterministic timer delivery. No implementation logic is reproduced here.
class Node {
  constructor(tag) {
    this.tagName = tag; this.children = []; this.attributes = {}; this.listeners = {};
    this.className = ''; this.hidden = false; this.disabled = false; this._text = ''; this._value = '';
    this.style = {setProperty(name, value) { this[name] = String(value); }};
    this.classList = {add: (...values) => { this.className += ' ' + values.join(' '); }};
  }
  get value() { return this._value; }
  set value(value) { this._value = String(value); }
  get textContent() { return this._text + this.children.map(n => n.textContent).join(''); }
  set textContent(value) { this._text = value == null ? '' : String(value); this.children = []; }
  append(...nodes) { nodes.forEach(n => { n.parentElement = this; this.children.push(n); }); }
  insertBefore(node, reference) { const index = this.children.indexOf(reference); assert.ok(index >= 0, 'insertBefore reference must be an existing child'); node.parentElement = this; this.children.splice(index, 0, node); }
  replaceChildren(...nodes) { this._text = ''; this.children = []; this.append(...nodes); }
  setAttribute(key, value) { this.attributes[key] = String(value); if (key === 'class') this.className = String(value); }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  dispatch(name) { (this.listeners[name] || []).forEach(fn => fn({target: this})); }
  click() { if (!this.disabled) this.dispatch('click'); }
}
sandbox.document = {createElement: tag => new Node(tag), createElementNS: (_, tag) => new Node(tag)};
const walk = node => [node, ...node.children.flatMap(walk)];
const hasClass = (node, cls) => node.className.split(/\s+/).includes(cls);
const mounted = new Set();
function mount(id) {
  const descriptor = sandbox.window.ICT_TOPIC_SIMS.find(d => d.id === id); assert.ok(descriptor, id);
  assert.equal(intervals.size, 0, 'previous scene must clean up its timers');
  const host = new Node('div'), cleanups = [];
  descriptor.mount(host, {onCleanup(fn) { cleanups.push(fn); }}); mounted.add(id);
  return {
    host,
    field(label) { const wrapper = walk(host).find(n => n.tagName === 'label' && n.children.some(c => c.tagName === 'span' && c.textContent === label)); assert.ok(wrapper, `${id}: field ${label}`); return wrapper.children.find(n => n.tagName === 'input' || n.tagName === 'select'); },
    change(label, value, event = 'change') { const input = this.field(label); input.value = value; input.dispatch(event); return input; },
    button(text) { const b = walk(host).find(n => n.tagName === 'button' && n.textContent === text); assert.ok(b, `${id}: button ${text}`); return b; },
    all(cls) { return walk(host).filter(n => hasClass(n, cls)); },
    one(cls) { const n = this.all(cls)[0]; assert.ok(n, `${id}: .${cls}`); return n; },
    get stage() { return this.one('td-stage'); },
    get caption() { return this.one('td-caption').textContent; },
    get answer() { return this.one('td-answer').textContent; },
    step() { this.button('下一步 →').click(); },
    reset() { this.button('↺ 重設').click(); assert.equal(intervals.size, 0); },
    finish() { this.button('▶ 播放').click(); let ticks = 0; while (intervals.size && ticks++ < 300) [...intervals.values()].forEach(t => t.fn()); assert.equal(intervals.size, 0, `${id} playback must complete within 300 steps`); assert.ok(ticks < 300); assert.ok(this.button('▶ 播放')); return ticks; },
    cleanup() { cleanups.forEach(fn => fn()); assert.equal(intervals.size, 0, `${id} timers must stop on cleanup`); }
  };
}

// Exercise every two's-complement mode and every preset through real controls.
{
  const s = mount('twos-complement-workbench');
  assert.equal(s.field('位元數').value, '8');
  assert.equal(s.field('整數 B').parentElement.hidden, true);
  const start = s.stage.textContent;
  s.button('▶ 播放').click(); assert.equal(intervals.size, 1);
  s.change('每步時間', '350'); assert.equal([...intervals.values()][0].period, 350);
  s.button('❚❚ 暫停').click(); assert.equal(intervals.size, 0);
  s.step(); assert.notEqual(s.stage.textContent, start);
  s.finish(); assert.equal(s.answer, '11110011₂ = -13₁₀');
  s.reset(); assert.equal(s.stage.textContent, start); assert.equal(s.all('td-answer').length, 0);
  s.button('−8：連鎖進位').click(); assert.equal(s.field('位元數').value, '4');
  s.finish(); assert.equal(s.answer, '1000₂ = -8₁₀'); s.reset();
  s.button('7 + 1：有號溢出').click(); assert.equal(s.field('觀察模式').value, 'add');
  assert.equal(s.field('整數 B').parentElement.hidden, false);
  s.finish(); assert.match(s.answer, /7 \+ 1 = 8.*1000.*有號解讀 -8/);
  assert.equal(s.one('td-flags').textContent, '最高位進位 C = 0有號溢出 V = 1');
  s.reset(); assert.equal(s.all('td-flags').length, 0);
  s.button('−1 + 1：進位但無溢出').click(); s.finish();
  assert.equal(s.one('td-flags').textContent, '最高位進位 C = 1有號溢出 V = 0');
  assert.match(s.answer, /0000.*有號解讀 0/); s.reset();
  s.button('−128：最小值').click(); s.finish();
  assert.equal(s.answer, '10000000₂ = -128₁₀'); assert.match(s.caption, /正值超出/); s.reset();
  s.change('整數 A', 0); s.change('觀察模式', 'decode');
  assert.equal(s.all('td-togglebit').length, 8); assert.match(s.answer, / = 0$/);
  s.one('td-togglebit').click(); assert.match(s.answer, /-128.* = -128$/);
  const decoded = s.stage.textContent; s.finish(); assert.equal(s.stage.textContent, decoded);
  s.reset(); assert.match(s.answer, / = 0$/);
  s.change('位元數', 4); s.change('觀察模式', 'subtract'); s.change('整數 A', 7); s.change('整數 B', 3);
  s.finish(); assert.match(s.answer, /7 − 3 = 4.*0100.*有號解讀 4/); s.reset();
  s.change('整數 A', 999); assert.equal(s.field('整數 A').value, '7');
  s.button('▶ 播放').click(); assert.equal(intervals.size, 1); s.cleanup();
}

{
  const s = mount('radix-place-machine'); s.finish(); assert.equal(s.answer, '累加器 = 45');
  s.change('來源進制', 16); assert.equal(s.field('數碼（最大 65535）').value, '2D');
  s.finish(); assert.match(s.one('td-radix-results').textContent, /2D（16 進制）/);
  s.change('數碼（最大 65535）', '2F'); s.finish(); assert.equal(s.answer, '累加器 = 47');
  s.reset(); assert.equal(s.answer, '累加器 = 0');
  s.change('數碼（最大 65535）', '2G'); assert.match(s.caption, /請輸入這個進制允許的數碼/); s.finish();
  s.change('數碼（最大 65535）', 'FF'); s.finish(); assert.equal(s.answer, '累加器 = 255'); s.cleanup();
}

{
  const s = mount('data-information-pipeline'); s.finish();
  assert.match(s.stage.textContent, /總分 312 ÷ 4 人 = 78\.0 分/);
  assert.match(s.stage.textContent, /總分 160 ÷ 2 人 = 80\.0 分/);
  s.change('新增紅社分數', 100, 'input'); assert.match(s.stage.textContent, /總分 352 ÷ 4 人 = 88\.0 分/);
  s.reset(); assert.equal(s.all('td-groupbars').length, 0); s.step(); assert.equal(s.all('is-rejected').length, 1); s.cleanup();
}

{
  const s = mount('validation-verification-gates'); assert.match(s.answer, /與來源不一致/);
  assert.match(s.stage.textContent, /10 ≤ 年齡 ≤ 20：通過/);
  s.change('第一次輸入', '16', 'input'); assert.equal(s.answer, '與來源一致'); assert.match(s.stage.textContent, /兩次相同/);
  s.change('第一次輸入', 'abc', 'input'); assert.match(s.stage.textContent, /必須是整數/);
  s.change('第一次輸入', '30', 'input'); assert.match(s.stage.textContent, /超出 10 至 20/);
  s.change('原始表格上的年齡', 18, 'input'); s.change('第一次輸入', '18', 'input'); assert.equal(s.answer, '與來源一致');
  assert.match(s.stage.textContent, /兩次不一致/); s.cleanup();
}

{
  const s = mount('parity-transmission'); const receiver = () => s.all('td-parity-bits')[1];
  assert.match(s.answer, /4 個 1 → 檢查通過/);
  receiver().children[0].click(); assert.match(s.answer, /偵測到錯誤/); assert.equal(s.all('is-flipped').length, 1);
  receiver().children[1].click(); assert.match(s.answer, /檢查通過/); assert.match(s.caption, /實際有 2 位.*偶數個位元錯誤/);
  s.button('清除傳輸錯誤').click(); assert.equal(s.all('is-flipped').length, 0);
  s.change('檢查方式', 'odd'); assert.match(s.answer, /5 個 1 → 檢查通過/);
  receiver().children[8].click(); assert.match(s.answer, /偵測到錯誤/); s.cleanup();
}

{
  const s = mount('storage-access-head'); s.finish(); assert.match(s.answer, /已讀取 7 筆.*R1 → R2.*R7/);
  s.reset(); assert.match(s.answer, /已讀取 0 筆/);
  s.change('存取方式', 'direct'); s.finish(); assert.match(s.answer, /已讀取 1 筆；路徑 R7/);
  s.change('目標紀錄', 3); s.finish(); assert.match(s.answer, /已讀取 1 筆；路徑 R3/);
  s.change('存取方式', 'sequential'); s.finish(); assert.match(s.answer, /已讀取 3 筆；路徑 R1 → R2 → R3/); s.cleanup();
}

{
  const s = mount('spreadsheet-reference-copy'); s.finish();
  assert.match(s.one('td-formula-transform').textContent, /D3: =C3\*\$F\$1/);
  assert.match(s.one('td-equation').textContent, /結果 3$/);
  s.change('修改數值格', 'C3'); assert.equal(s.field('數值').value, '30');
  s.change('數值', 80, 'input'); assert.match(s.one('td-equation').textContent, /結果 8$/);
  s.change('C2 的公式', '=$B2*C$1'); s.finish(); assert.match(s.one('td-formula-transform').textContent, /D3: =\$B3\*D\$1/);
  assert.match(s.one('td-equation').textContent, /結果 180$/);
  s.change('修改數值格', 'B3'); s.change('數值', 200, 'input'); assert.match(s.one('td-equation').textContent, /結果 240$/);
  s.change('複製到', 'E4'); s.finish(); assert.match(s.one('td-formula-transform').textContent, /E4: =\$B4\*E\$1/);
  assert.match(s.one('td-equation').textContent, /結果 260$/);
  s.reset(); assert.equal(s.all('is-destination').length, 0); s.cleanup();
}

{
  const s = mount('database-query-execution'); s.finish(); assert.match(s.caption, /查詢完成：3 列/);
  const resultRows = () => walk(s.all('td-table')[1]).filter(n => n.tagName === 'tbody')[0].children;
  assert.deepEqual(resultRows().map(r => r.children[1].textContent), ['96', '91', '84']);
  s.change('最低分數', 90); s.change('社', '紅'); s.finish(); assert.match(s.caption, /查詢完成：1 列/);
  s.change('社', '全部'); s.change('最低分數', 0); s.change('分數排序', 'asc');
  s.change('SELECT 欄位', 'name,house,score'); s.finish();
  assert.equal(resultRows().length, 5); assert.equal(resultRows()[0].children.length, 3);
  assert.deepEqual(resultRows().map(r => r.children[2].textContent), ['69', '72', '84', '91', '96']);
  s.reset(); assert.equal(resultRows().length, 0); s.cleanup();
}

{
  const s = mount('input-adc-controller'); s.finish(); assert.match(s.answer, /量化碼 11 → 重建溫度 34\.00°C/);
  assert.equal(s.all('is-spinning').length, 1);
  s.change('感測溫度（−10 至 50°C）', 10, 'input'); assert.equal(s.all('is-spinning').length, 0);
  s.finish(); assert.match(s.answer, /重建溫度 10\.00°C/); assert.equal(s.all('is-spinning').length, 0);
  s.change('ADC 位元深度', 8, 'input'); s.step(); assert.equal(s.one('td-device-binary').textContent.length, 8);
  s.reset(); assert.equal(s.one('td-device-binary').textContent, '…'); s.cleanup();
}

{
  const s = mount('cpu-register-bus'); assert.equal(s.all('td-register').length, 5);
  s.finish(); assert.match(s.caption, /RAM\[5\] = 14/); assert.match(s.one('td-cache').textContent, /命中 1／未命中 1/);
  const ramLast = () => walk(s.one('td-ram')).find(n => n.tagName === 'tbody').children.at(-1).children[1].textContent;
  assert.equal(ramLast(), '14'); s.reset(); assert.equal(ramLast(), '0');
  for (let i = 0; i < 9; i++) s.step();
  assert.equal(s.all('is-flowing').length, 0, 'cache hit must not animate external RAM buses');
  assert.ok(hasClass(s.one('td-cache'), 'is-active')); assert.match(s.one('td-cache').textContent, /HIT/);
  s.change('快取', 'off'); s.finish(); assert.match(s.one('td-cache').textContent, /命中 0／未命中 2/);
  assert.equal(ramLast(), '14'); s.cleanup();
}

{
  const s = mount('os-job-scheduler'); s.change('排程策略', 'batch'); s.finish(); assert.match(s.answer, /時鐘 t = 12/);
  assert.match(s.stage.textContent, /工作 B.*t=6 完成（逾時）/);
  s.change('排程策略', 'realtime'); s.finish(); assert.match(s.stage.textContent, /工作 B.*t=2 完成/);
  s.change('排程策略', 'timeshare'); s.reset(); assert.match(s.answer, /時鐘 t = 0/);
  s.step(); assert.match(s.answer, /時鐘 t = 1.*剛執行 A/); s.cleanup();
}

{
  const s = mount('image-rgb-bitdepth'); const grid = () => s.one('td-pixel-grid'); assert.equal(grid().children.length, 64);
  grid().children[0].click(); assert.match(s.one('td-pixel-detail').textContent, /像素 \(1, 1\)/);
  s.change('R', 255, 'input'); assert.equal(grid().children[0].style.backgroundColor, 'rgb(255,15,55)');
  s.change('G', 255, 'input'); s.change('B', 0, 'input'); assert.equal(grid().children[0].style.backgroundColor, 'rgb(255,255,0)');
  s.change('每個 RGB 通道位元數', 1); assert.match(s.answer, /8 × 8 × 3 = 192 位元\n= 24 bytes/);
  assert.equal(s.all('td-channel')[0].children[1].textContent, '1');
  grid().children[63].click(); assert.match(s.one('td-pixel-detail').textContent, /像素 \(8, 8\)/); s.cleanup();
}

{
  const s = mount('audio-sampling-quantization'); assert.equal(s.all('td-wave').length, 1);
  assert.equal(s.all('td-quant-point').length, 0); s.step(); assert.equal(s.all('td-quant-point').length, 1);
  s.finish(); assert.equal(s.all('td-quant-point').length, 16); assert.match(s.answer, /16 samples\/s × 3 bits = 48 bits/);
  s.reset(); assert.equal(s.all('td-quant-point').length, 0);
  s.change('每秒取樣數（模型）', 8); s.change('原音頻率（Hz）', 6); assert.match(s.caption, /可能出現混疊/);
  s.change('振幅位元深度', 2); s.finish(); assert.equal(s.all('td-quant-point').length, 8);
  assert.equal(s.one('td-audio-stream').textContent.split(' ').length, 8);
  assert.ok(s.one('td-audio-stream').textContent.split(' ').every(bits => bits.length === 2)); s.cleanup();
}
assert.equal(mounted.size, 13);
assert.equal(intervals.size, 0, 'all actual transports must stop after completion/cleanup');
console.log('PASS: all 13 real data/hardware mounts and interactions, including every two\'s-complement mode/preset, playback cleanup, cache buses, pixel editing and waveform samples.');
