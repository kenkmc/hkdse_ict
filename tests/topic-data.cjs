const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let intervalId = 0;
const intervals = new Map();
const sandbox = {window: {}, TextEncoder, location:{pathname:'/cha.2.html'}, setInterval(fn, period) { const id = ++intervalId; intervals.set(id, {fn, period}); return id; }, clearInterval(id) { intervals.delete(id); }};
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
assert.equal(sandbox.window.ICT_TOPIC_SIMS.length, 22);
assert.equal(M.rle('AAAABB').map(r=>r.char.repeat(r.count)).join(''),'AAAABB');
assert.equal(M.rle('ABCDEF').length*2,12);
assert.equal(M.subquery([40,60,80,null]).average,60);
assert.equal(M.subquery([40,60,80,null]).selected.join(','),'80');
assert.equal(M.subquery([40,60,80],true).selected.join(','),'60,80');
assert.equal(M.subquery([null,null]).average,null);
assert.equal(M.mutate([{id:'B1',copies:3}],'insert','B1',7).error,'主鍵重複，拒絕新增');
assert.equal(M.mutate([{id:'B1',copies:3},{id:'B2',copies:4}],'update','B1',7,true).rows.map(r=>r.copies).join(','),'7,7');
console.log('PASS: exhaustive 4/8-bit arithmetic, parity, references, SQL, quantization, scheduling, compression and subqueries. 22 mechanisms registered.');

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
{
  const s=mount('data-hierarchy-explorer');assert.match(s.caption,/1 個 UTF-8 位元組/);
  s.change('學生記錄','S02','input');assert.match(s.caption,/3 個 UTF-8 位元組，即 24 位元/);assert.equal(s.all('td-bitline').length,3);
  assert.match(s.stage.textContent,/E4 B8 AD/);s.change('欄位','Class','input');assert.match(s.caption,/1 個 UTF-8 位元組/);
  s.change('字符位置',2,'input');assert.match(s.stage.textContent,/42/);s.cleanup();
}
{
  const s=mount('memory-address-power');assert.match(s.answer,/8 個位置 × 8 bits = 64 bits = 8 bytes/);
  s.button('寫入 RAM').click();assert.match(s.caption,/37.*RAM\[3\]/);assert.match(s.stage.textContent,/00100101/);
  s.button('儲存至 SSD').click();s.button('切換電源').click();assert.match(s.caption,/RAM 內容已失去/);
  const rows=()=>walk(s.stage).find(n=>n.tagName==='tbody').children;
  assert.equal(rows()[3].children[1].textContent,'未指定');assert.equal(rows()[3].children[2].textContent,'00100101');
  s.button('寫入 RAM').click();assert.match(s.caption,/先開啟電源/);s.button('切換電源').click();
  s.change('地址位元數',4,'input');assert.match(s.answer,/16 個位置/);s.change('每格字長（bits）',16,'input');
  assert.match(s.answer,/256 bits = 32 bytes/);s.change('地址（十進制）',3.5,'input');assert.equal(s.field('地址（十進制）').value,'4');
  s.change('寫入數值',37.6,'input');assert.equal(s.field('寫入數值').value,'38');s.cleanup();
}
{
  const s=mount('os-print-service');s.finish();assert.equal(s.all('td-printed-pages')[0].children.length,3);assert.match(s.caption,/打印完成/);
  s.reset();assert.equal(s.one('td-printed-pages').children.length,0);s.change('打印權限','deny','input');
  s.finish();assert.match(s.caption,/拒絕未獲授權/);assert.equal(s.one('td-printed-pages').children.length,0);
  s.change('打印權限','allow','input');s.change('裝置驅動程式','wrong','input');s.finish();assert.match(s.caption,/缺少合適驅動程式/);
  s.change('裝置驅動程式','correct','input');s.change('文件頁數',5,'input');s.finish();assert.equal(s.one('td-printed-pages').children.length,5);
  s.change('文件頁數',3.6,'input');assert.equal(s.field('文件頁數').value,'4');s.finish();assert.equal(s.one('td-printed-pages').children.length,4);
  s.change('文件頁數',99,'input');assert.equal(s.field('文件頁數').value,'10');s.finish();assert.equal(s.one('td-printed-pages').children.length,10);s.cleanup();
}
{
  const s=mount('lossless-run-length');s.finish();assert.match(s.answer,/原本 16 bytes；完成後 8 bytes/);
  assert.equal(s.one('td-equation').textContent,'解碼：AAAAAABBBBCCAAAA');assert.match(s.caption,/與原文完全相同/);
  s.change('原始字元（A–Z，最多 24 個）','ABCDEF','input');s.finish();assert.match(s.answer,/原本 6 bytes；完成後 12 bytes/);
  assert.match(s.caption,/沒有節省空間/);s.reset();assert.equal(s.one('td-rle-runs').children.length,0);s.cleanup();
}
{
  const s=mount('entity-relationship-bridge');const count=()=>walk(s.stage).find(n=>n.tagName==='tbody').children.length;
  assert.equal(count(),3);s.button('新增選科').click();assert.match(s.caption,/複合主鍵.*已存在/);assert.equal(count(),3);
  s.change('StudentID','S9','input');s.button('新增選科').click();assert.match(s.caption,/參照完整性/);assert.equal(count(),3);
  s.change('StudentID','S2','input');s.change('CourseID','MATH','input');s.button('新增選科').click();assert.equal(count(),4);assert.match(s.caption,/S2 → MATH/);
  s.button('重設選科').click();assert.equal(count(),3);s.cleanup();
}
{
  const s=mount('sql-scalar-subquery');s.step();assert.match(s.one('td-inner-query').textContent,/回傳單值 60/);
  s.finish();assert.equal(s.answer,'結果：80');s.change('外層比較','>=','input');s.finish();assert.equal(s.answer,'結果：60、80');
  s.change('分數（逗號分隔，可用 NULL）','NULL,NULL','input');s.finish();assert.equal(s.answer,'結果：沒有符合記錄');assert.match(s.caption,/AVG 回傳 NULL/);
  s.reset();assert.equal(s.all('td-answer').length,0);s.cleanup();
}
{
  const s=mount('sql-row-mutation');s.finish();assert.equal(s.answer,'已更新 1 筆');
  const rows=()=>walk(s.stage).find(n=>n.tagName==='tbody').children;assert.equal(rows()[1].children[1].textContent,'2');
  s.change('WHERE 條件','all','input');s.finish();assert.equal(s.answer,'已更新 3 筆');assert.ok(rows().every(r=>r.children[1].textContent==='2'));
  s.change('SQL 操作','insert','input');s.finish();assert.match(s.answer,/主鍵重複/);assert.equal(rows().length,3);
  s.change('BookID','B4','input');s.finish();assert.equal(rows().length,4);assert.equal(s.answer,'已新增 1 筆');
  s.change('SQL 操作','delete','input');s.change('WHERE 條件','all','input');s.finish();assert.equal(rows().length,0);s.reset();assert.equal(rows().length,3);
  s.change('SQL 操作','update','input');s.change('WHERE 條件','key','input');s.change('BookID','B2','input');
  for(const [entered,stored] of [[-5,0],[2.6,3],[150,100]]){s.change('Copies',entered,'input');assert.equal(s.field('Copies').value,String(stored));assert.ok(s.one('td-sql').textContent.includes('Copies = '+stored));s.finish();assert.equal(rows()[1].children[1].textContent,String(stored));}s.cleanup();
}
{
  const s=mount('transitive-dependency');s.step();assert.match(s.caption,/更新異常/);s.finish();assert.equal(s.answer,'S1、S2 的班主任均為 陳老師');
  assert.equal(s.all('td-table').length,2);s.change('5A 新班主任','王校長','input');s.finish();assert.match(s.answer,/王校長/);s.reset();assert.equal(s.all('td-table').length,1);s.cleanup();
}
{
  const s=mount('hardware-component-map');const img=walk(s.host).find(n=>n.tagName==='img');assert.equal(img.width,1536);assert.equal(img.height,1024);
  assert.equal(img.src,'assets/images/explainers/desktop-components.webp');assert.match(img.alt,/RAM、SSD/);assert.match(s.host.textContent,/並非接線圖/);s.cleanup();
  sandbox.location.pathname='/animations/chb.2.html';const copy=mount('hardware-component-map');assert.equal(walk(copy.host).find(n=>n.tagName==='img').src,'../assets/images/explainers/desktop-components.webp');copy.cleanup();sandbox.location.pathname='/cha.2.html';
}
assert.equal(mounted.size, 22);
assert.equal(intervals.size, 0, 'all actual transports must stop after completion/cleanup');
console.log('PASS: all 22 data/hardware mechanisms mount and respond correctly; all step mechanisms complete/reset, semantic state changes, constraints, media and image paths verified.');

// Check natural placements against actual native IDs / generated section IDs.
const path=require('node:path'),repo=path.resolve(__dirname,'..'),placement={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(repo,'animations/assets/new-lessons.js'),'utf8'),placement);
vm.runInNewContext(fs.readFileSync(path.join(repo,'assets/js/lesson-plan-data.js'),'utf8'),placement);
const known=new Set(sandbox.window.ICT_TOPIC_SIMS.map(s=>s.id));
const algorithmContext={window:{}};vm.runInNewContext(fs.readFileSync(path.join(repo,'assets/js/topic-algorithms.js'),'utf8'),algorithmContext);
algorithmContext.window.ICT_TOPIC_SIMS.forEach(s=>known.add(s.id));
assert.equal(Object.keys(placement.window.ICT_LESSON_PLANS).length,25);
let placements=0;
for(const [page,entries] of Object.entries(placement.window.ICT_LESSON_PLANS)){
  const html=fs.readFileSync(path.join(repo,page+'.html'),'utf8');
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const generated=html.match(/data-lesson="([^"]+)"/);
  if(generated)placement.window.ICT_NEW_LESSONS[generated[1]].sections.forEach((s,i)=>ids.add(s.id||'topic-'+i));
  const scenes=new Set();
  for(const entry of entries){assert.ok(known.has(entry.sim),page+': missing mechanism '+entry.sim);assert.ok(ids.has(entry.target.slice(1)),page+': missing section '+entry.target);assert.ok(!scenes.has(entry.sim),page+': duplicate '+entry.sim);scenes.add(entry.sim);placements++;}
  if(page.endsWith('cha.2')){assert.equal(entries.filter(e=>e.sim==='parity-transmission').length,1);assert.ok(!html.includes('id="parityInput"'));assert.ok(!html.includes('2. 偶校驗 (Even Parity)'));}
  if(page.endsWith('db_simulator')){assert.equal(entries.length,0);assert.ok(!html.includes('id="sql-topic-labs"'));}
}
assert.ok(fs.existsSync(path.join(repo,'assets/images/explainers/desktop-components.webp')));
console.log(`PASS: ${placements} section placements across 25 data/system/database pages; one parity activity per page and native SQL tools preserved.`);
