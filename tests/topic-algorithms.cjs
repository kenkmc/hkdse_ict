'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sandbox = { window: { matchMedia: () => ({ matches: true }) }, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/topic-algorithms.js'), 'utf8'), sandbox);
const M = sandbox.window.ICTAlgorithmModels;
const plain = value => JSON.parse(JSON.stringify(value));
const last = frames => frames.at(-1);
assert.equal(last(M.flow(49, 50)).yes, false);
assert.equal(last(M.flow(50, 50)).yes, true);
for (let n = 1; n <= 10; n++) assert.equal(last(M.trace(n)).total, n * (n + 1) / 2);
for (const values of [[], [7], [1, 2, 3, 7], [7, 3, 7, -2, 5]]) {
  for (const target of [-2, 1, 7, 100]) for (const binary of [false, true]) {
    const frame = last(M.search(values, target, binary));
    assert.equal(frame.found, values.includes(target));
    assert.equal(frame.done, true);
    if (frame.found) assert.equal(frame.a[frame.at], target);
  }
}
assert.equal(M.boundary(12, 18, false).filter(c => c.actual !== c.expected).length, 1);
assert.equal(M.boundary(12, 18, true).filter(c => c.actual !== c.expected).length, 0);
assert.equal(M.boundary(12, 12, false).find(c => c.value === 12).actual, false);
for (const amount of [0, 100, 700, 701]) for (const failure of [false, true]) {
  const frames = M.transaction(700, 300, amount, failure), end = last(frames);
  assert.equal(end.committed[0] + end.committed[1], 1000);
  assert.ok(end.committed.every(v => v >= 0));
  assert.deepEqual(plain(end.committed), failure || amount > 700 ? [700, 300] : [700 - amount, 300 + amount]);
  frames.slice(0, -1).forEach(frame => assert.deepEqual(plain(frame.committed), [700, 300]));
}
const relationEnd = last(M.relations([76, 58, 84, 40, 91], ['紅', '藍', '紅', '藍'], 50));
assert.equal(relationEnd.joined.length, 4, 'orphan mark must not survive INNER JOIN');
assert.deepEqual(plain(relationEnd.groups.map(g => [g.house, g.count, g.sum])), [['紅', 2, 160], ['藍', 1, 58]]);
assert.equal(last(M.relations([1, 2, 3], ['A', 'B', 'A'], 100)).groups.length, 0);
const normalized = M.normalize(['ICT', 'Maths', 'English'], '87654321');
assert.deepEqual(plain(normalized[1].flat.map(r => r.phone)), ['87654321', '12345678', '12345678']);
assert.equal(normalized[3].phone, '87654321');
for (let r = 1; r <= 6; r++) for (let c = 1; c <= 6; c++) {
  const end = last(M.nested(r, c)); assert.equal(end.visited.length, r * c);
  assert.equal(new Set(end.visited.map(v => v.join(','))).size, r * c);
  assert.deepEqual(plain(end.visited.at(-1)), [r - 1, c - 1]);
}
let expected = 1;
for (let n = 0; n <= 7; n++) { if (n) expected *= n; const end = last(M.factorial(n)); assert.equal(end.result, expected); assert.equal(end.stack.length, 0); }
assert.deepEqual(plain(last(M.structure('+4,+7,-', 'stack', 3)).output), ['7']);
assert.deepEqual(plain(last(M.structure('+4,+7,-', 'queue', 3)).output), ['4']);
const circular = last(M.structure('+1,+2,+3,-,-,+4,+5', 'queue', 3));
assert.deepEqual(plain(circular.slots), ['4', '5', '3']); assert.equal(circular.head, 2); assert.equal(circular.size, 3); assert.equal(circular.next, 2);
assert.equal(last(M.structure('-,-,+1,+2,+3', 'stack', 2)).size, 2);
assert.match(last(M.structure('+1,+2,+3', 'queue', 2)).note, /Overflow/);
let seed = 123456;
for (const mode of ['bubble', 'insertion', 'selection']) for (let sample = 0; sample < 30; sample++) {
  const values = Array.from({ length: sample % 11 }, () => { seed = (seed * 16807) % 2147483647; return seed % 31 - 15; });
  const frames = M.sort(values, mode), end = last(frames);
  assert.deepEqual(plain(end.items.map(v => v.value)), [...values].sort((a, b) => a - b));
  frames.forEach(f => assert.deepEqual(plain(f.items.map(i => i.id).sort((a, b) => a - b)), values.map((_, i) => i), 'each frame preserves all item identities'));
}
assert.deepEqual(plain(last(M.fileWrite(['A', 'B', 'C'], 'edit', 2, 'X')).output), ['A', 'X', 'C']);
assert.deepEqual(plain(last(M.fileWrite(['A', 'B', 'C'], 'delete', 2, 'X')).output), ['A', 'C']);
assert.deepEqual(plain(last(M.fileWrite([], 'append', 1, 'X')).output), ['X']);
assert.equal(M.quantize('9.995', 2, 'round').result, '10.00');
assert.equal(M.quantize('1.005', 2, 'round').result, '1.01', 'decimal rounding must not inherit binary floating-point error');
assert.equal(M.quantize('-1.235', 2, 'round').result, '-1.24');
assert.equal(M.quantize('-1.239', 2, 'truncate').result, '-1.23');
assert.equal(M.quantize('99.9', 0, 'round').result, '100');
assert.equal(M.quantize('2', 3, 'round').result, '2.000');
assert.equal(M.quantize('-0.0001', 2, 'round').result, '0.00');
assert.ok(M.quantize('NaN', 2, 'round').error);

// Exercise every actual mount, its reset/input path and its complete step sequence.
class Node {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.style = {}; this.listeners = {}; this.className = ''; this.value = ''; this.textContent = ''; this.classList = { add: (...values) => { this.className += ' ' + values.join(' '); } }; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
}
sandbox.document = { createElement: tag => new Node(tag), createElementNS: (_, tag) => new Node(tag) };
const nodeText = n => n.textContent + n.children.map(nodeText).join('');
function controls(n) { return [n, ...n.children.flatMap(controls)].filter(n => n.tagName === 'input' || n.tagName === 'select'); }
const replacements = { 'decision-flow': '80', 'python-registers': '2', 'array-search': '7,3,5', 'boundary-line': '5', 'atomic-transfer': '500', 'join-and-group': '12,34,56,78', 'key-decomposition': 'Physics,Chemistry', 'nested-grid': '2', 'recursive-frames': '2', 'stack-queue-slots': 'stack', 'sorting-bars': '7,3,5', 'sequential-file': 'One,Two', 'decimal-precision': '12.345' };
for (const descriptor of sandbox.window.ICT_TOPIC_SIMS) {
  const host = new Node('div'); let actions, done = false, stops = 0; const cleanup = [];
  descriptor.mount(host, { playback(parent, options) { actions = options; return { stop() { stops++; }, finish(value) { done = value; } }; }, onCleanup(fn) { cleanup.push(fn); } });
  const before = nodeText(host.children[1]);
  let steps = 0; while (!done && steps++ < 250) actions.step();
  assert.ok(done, `${descriptor.id} should finish`); assert.ok(steps < 250);
  actions.reset(); assert.equal(done, false, `${descriptor.id} reset must re-enable playback`);
  const first = controls(host.children[0])[0]; first.value = replacements[descriptor.id]; first.listeners.input();
  assert.notEqual(nodeText(host.children[1]), before, `${descriptor.id} input must alter the computed scene`);
  cleanup.forEach(fn => fn()); assert.ok(stops > 0);
}
const allTags = new Set(sandbox.window.ICT_TOPIC_SIMS.flatMap(s => s.topics));
for (const tag of ['flowchart','trace-machine','python-memory','linearsearch','boundary-debugger','transaction','sql-group','join','keys-index','normalization','nestedloops','callstack','datastruct','sorting','filewrite','numericprecision']) assert.ok(allTags.has(tag), `missing ${tag}`);
console.log(`Algorithm models and ${sandbox.window.ICT_TOPIC_SIMS.length} interactive mounts passed.`);
