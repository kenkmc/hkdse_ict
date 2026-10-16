'use strict';
// Integration test for the real router, not a second implementation of its filename parsing.
// Model tests exercise each scene separately; mounts here are spies so this test isolates
// routing, lesson insertion, markup and lifecycle wiring across every published lesson.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'assets/js', name), 'utf8');
const modules = ['topic-data.js', 'topic-network.js', 'topic-algorithms.js', 'topic-context.js'];
const scripts = [...modules, 'topic-runtime.js'];
const styles = scripts.map(name => name.replace(/\.js$/, '.css'));
const runtime = source('topic-runtime.js');

class Element {
  constructor(tag) {
    this.tagName = tag.toLowerCase(); this.children = []; this.parentElement = null;
    this.attributes = {}; this.dataset = {}; this.style = {}; this.className = '';
    this.id = ''; this._text = ''; this.listeners = new Map(); this.scrolled = false;
  }
  set textContent(value) { this._text = String(value); this.children.forEach(c => { c.parentElement = null; }); this.children = []; }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  get firstElementChild() { return this.children[0] || null; }
  setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'id') this.id = String(value); if (name === 'class') this.className = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  detach(node) { if (node.parentElement) { const siblings = node.parentElement.children; siblings.splice(siblings.indexOf(node), 1); } node.parentElement = this; return node; }
  append(...nodes) { nodes.forEach(node => this.children.push(this.detach(node))); }
  prepend(...nodes) { this.children.unshift(...nodes.map(node => this.detach(node))); }
  after(node) { const parent = this.parentElement; assert.ok(parent, 'after() requires an attached element'); parent.detach(node); parent.children.splice(parent.children.indexOf(this) + 1, 0, node); }
  matches(selector) { return selector.startsWith('.') ? this.className.split(/\s+/).includes(selector.slice(1)) : selector.startsWith('#') ? this.id === selector.slice(1) : this.tagName === selector; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
  contains(node) { return node === this || this.children.some(child => child.contains(node)); }
  addEventListener(name, fn, options) { const handlers = this.listeners.get(name) || []; handlers.push({ fn, once: Boolean(options?.once) }); this.listeners.set(name, handlers); }
  dispatch(name) { const handlers = this.listeners.get(name) || []; handlers.forEach(({ fn }) => fn()); this.listeners.set(name, handlers.filter(h => !h.once)); }
  scrollIntoView() { this.scrolled = true; }
}
function fixture({ library, objectives = true, container = 'main', empty = false } = {}) {
  const body = new Element('body');
  let main;
  if (container === 'main') { main = new Element('main'); body.append(main); }
  else if (container === 'root-parent') { main = new Element('article'); const rootNode = new Element('div'); rootNode.id = 'root'; main.append(rootNode); body.append(main); }
  else main = body;
  const markers = {};
  const mark = (name, tag = 'section', cls = '') => { const node = new Element(tag); node.id = 'fixture-' + name; node.className = cls; node.textContent = name; main.append(node); markers[name] = node; return node; };
  if (!empty) {
    mark('hero', 'header');
    if (library && objectives) mark('objectives', 'section', 'ict-objectives');
    mark('prose'); mark('exercise');
  }
  const before = [...main.children];
  const document = new Element('document'); document.body = body; document.append(body);
  document.readyState = 'loading'; document.hidden = false;
  document.createElement = tag => new Element(tag);
  document.createElementNS = (_, tag) => new Element(tag);
  document.getElementById = id => document.querySelector('#' + id);
  return { document, body, main, before, markers };
}

// Load the actual scene registries. No fake list can silently mask a missing module/tag.
const inventory = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
inventory.window.addEventListener = () => {};
vm.createContext(inventory);
modules.forEach(name => vm.runInContext(source(name), inventory, { filename: name }));
vm.runInContext(runtime, inventory, { filename: 'topic-runtime.js' });
const descriptors = Array.from(inventory.window.ICT_TOPIC_SIMS);
const descriptorIds = descriptors.map(sim => sim.id);
assert.equal(descriptors.length, 43, 'update this inventory expectation deliberately when adding/removing a scene');
assert.equal(new Set(descriptorIds).size, descriptors.length, 'duplicate IDs would break headings and deep links');
descriptors.forEach(sim => {
  assert.ok(sim.id && sim.title && sim.description && sim.topics.length && typeof sim.mount === 'function', 'incomplete descriptor ' + sim.id);
  assert.equal(new Set(Array.from(sim.topics)).size, sim.topics.length, 'duplicate topic in ' + sim.id);
});
const { hostMap, libraryMap } = inventory.window.ICTTopicRuntime;
assert.equal(Object.keys(hostMap).length, 30);
assert.equal(Object.keys(libraryMap).length, 45);
const registeredTags = new Set(descriptors.flatMap(sim => Array.from(sim.topics)));

function execute(pathname, { library = pathname.includes('/animations/'), ready = false, hash = '', throws = false, ...fixtureOptions } = {}) {
  const dom = fixture({ library, ...fixtureOptions });
  const mounted = [], errors = [], cleaned = [], animationFrames = [];
  const window = new Element('window');
  window.ICT_TOPIC_SIMS = descriptors.map(sim => ({
    id: sim.id, title: sim.title, description: sim.description, topics: Array.from(sim.topics),
    mount(stage, api) {
      assert.ok(dom.main.contains(stage), 'mount must receive a stage already inserted in the lesson');
      ['E', 'S', 'field', 'button', 'playback', 'onCleanup'].forEach(name => assert.equal(typeof api[name], 'function'));
      mounted.push(sim.id);
      if (throws) throw new Error('deliberate mount failure');
      stage.append(api.E('output', sim.id, 'fixture-mounted'));
      api.onCleanup(() => cleaned.push(sim.id));
    }
  }));
  const context = {
    window, document: dom.document, location: { pathname, hash },
    console: { error: (...args) => errors.push(args) },
    requestAnimationFrame: fn => animationFrames.push(fn),
    setTimeout() { throw new Error('routing test must not schedule timers'); }, clearTimeout() {}
  };
  dom.document.readyState = ready ? 'complete' : 'loading';
  vm.createContext(context);
  vm.runInContext(runtime, context, { filename: 'topic-runtime.js' });
  if (!ready) {
    assert.equal(mounted.length, 0, 'loading document must wait for its rendered lesson');
    assert.equal(dom.document.getElementById('topic-laboratory'), null);
    dom.document.dispatch('DOMContentLoaded');
  }
  animationFrames.forEach(fn => fn());
  const target = dom.document.getElementById('topic-laboratory');
  return { ...dom, target, mounted, errors, cleaned, window, context };
}

let checked = 0;
for (const [prefix, mapping] of [['', hostMap], ['animations/', libraryMap]]) {
  for (const [id, topics] of Object.entries(mapping)) {
    const filename = prefix + id + '.html';
    const label = '/' + filename;
    const absolute = path.join(root, filename);
    assert.ok(fs.existsSync(absolute), 'missing published lesson ' + filename);
    const html = fs.readFileSync(absolute, 'utf8');
    const scriptPaths = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1].split(/[?#]/)[0]);
    const linkPaths = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["']/gi)].map(m => m[1].split(/[?#]/)[0]);
    const scriptIndexes = scripts.map(name => {
      const index = scriptPaths.findIndex(src => path.basename(src) === name);
      assert.ok(index >= 0, filename + ' missing script ' + name);
      assert.ok(fs.existsSync(path.resolve(path.dirname(absolute), scriptPaths[index])), filename + ' has broken script path ' + scriptPaths[index]);
      return index;
    });
    assert.deepEqual(scriptIndexes, [...scriptIndexes].sort((a, b) => a - b), filename + ' must load scene registries before runtime');
    styles.forEach(name => {
      const relative = linkPaths.find(href => path.basename(href) === name);
      assert.ok(relative, filename + ' missing CSS ' + name);
      assert.ok(fs.existsSync(path.resolve(path.dirname(absolute), relative)), filename + ' has broken CSS path ' + relative);
    });
    Array.from(topics).forEach(topic => assert.ok(registeredTags.has(topic), filename + ' references unregistered topic ' + topic));
    const expected = descriptors.filter(sim => sim.topics.some(topic => topics.includes(topic))).map(sim => sim.id);
    assert.ok(expected.length > 0, 'empty expected scene list for ' + filename);
    // Keep the actual .html suffix and a GitHub Pages project prefix: this executes
    // filename normalization and would fail on a literal-backslash regex regression.
    const run = execute('/hkdse_ict/' + filename, { library: Boolean(prefix), ready: checked % 2 === 1 });
    assert.ok(run.target, label + ' did not insert a laboratory (check filename normalization)');
    assert.equal(run.target.parentElement, run.main, label + ' laboratory must remain inside lesson main');
    assert.equal(run.target.dataset.simCount, String(expected.length), label + ' count does not match real registry filtering');
    assert.deepEqual(run.mounted, expected, label + ' mounted wrong scenes or duplicate scenes');
    assert.deepEqual(run.errors, [], label + ' mounting errors');
    const sections = run.target.querySelectorAll('.topic-simulation');
    assert.deepEqual(sections.map(section => section.dataset.simId), expected, label + ' scene DOM order differs from registry');
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      assert.equal(section.getAttribute('aria-labelledby'), heading.id, 'scene accessibility heading mismatch');
      assert.ok(section.querySelector('.topic-sim-stage').querySelector('output'), 'mount output missing from scene stage');
    });
    const nav = run.target.querySelector('nav');
    assert.equal(nav.getAttribute('aria-label'), '本課專用動畫');
    assert.deepEqual(nav.children.map(link => link.href), expected.map(id => '#sim-' + id), label + ' broken deep links');
    assert.deepEqual(run.main.children.filter(node => node !== run.target), run.before, label + ' insertion changed or reordered original lesson content');
    const anchor = prefix ? run.markers.objectives : run.markers.hero;
    assert.equal(run.main.children.indexOf(run.target), run.main.children.indexOf(anchor) + 1, label + ' mechanisms must follow hero/objectives before lesson prose');
    assert.ok(run.main.children.indexOf(run.target) < run.main.children.indexOf(run.markers.prose), label + ' mechanisms inserted below lesson prose');
    if (checked % 2 === 0) { run.document.dispatch('DOMContentLoaded'); assert.equal(run.document.querySelectorAll('.topic-laboratory').length, 1, 'DOMContentLoaded listener must be once-only'); }
    run.document.hidden = false; run.document.dispatch('visibilitychange'); assert.deepEqual(run.cleaned, [], 'visible page must not trigger cleanup');
    run.document.hidden = true; run.document.dispatch('visibilitychange'); assert.deepEqual(run.cleaned, expected, label + ' hidden-page cleanup not wired');
    run.window.dispatch('pagehide'); assert.deepEqual(run.cleaned, [...expected, ...expected], label + ' pagehide cleanup not wired');
    checked++;
  }
}

// Explicit fallback branches prevent a selector change from moving lessons outside
// their shell, or erasing their original first content when no objective box exists.
const noObjectives = execute('/animations/chd.2.html', { library: true, objectives: false });
assert.equal(noObjectives.main.firstElementChild, noObjectives.target);
assert.deepEqual(noObjectives.main.children.slice(1), noObjectives.before);
const empty = execute('/chd.2.html', { empty: true });
assert.equal(empty.main.firstElementChild, empty.target);
const rootFallback = execute('/chd.2.html', { container: 'root-parent' });
assert.equal(rootFallback.target.parentElement, rootFallback.main);
assert.equal(rootFallback.main.children[1], rootFallback.target, 'root-parent fallback inserts after the original first child');
const bodyFallback = execute('/chd.2.html', { container: 'body' });
assert.equal(bodyFallback.target.parentElement, bodyFallback.body);
assert.equal(bodyFallback.body.children[1], bodyFallback.target);
const unknown = execute('/hkdse_ict/index.html');
assert.equal(unknown.target, null); assert.deepEqual(unknown.mounted, []); assert.deepEqual(unknown.errors, []);
const hash = execute('/animations/chd.2.html', { hash: '#sim-decision-flow' });
assert.equal(hash.document.getElementById('sim-decision-flow').scrolled, true, 'restored anchor should scroll only after scenes mount');
const foreignHash = execute('/animations/chd.2.html', { hash: '#fixture-hero' });
assert.equal(foreignHash.markers.hero.scrolled, false, 'runtime must not hijack anchors outside its inserted laboratory');
const failure = execute('/animations/chd.2.html', { throws: true });
assert.equal(failure.target.dataset.simCount, '1');
assert.equal(failure.errors.length, 1);
assert.equal(failure.target.querySelectorAll('.topic-error').length, 1, 'mount errors must remain visible and contained in their scene');

console.log(`PASS executable coverage: ${descriptors.length} real scene descriptors; ${checked} lesson paths, assets, DOM insertion, routing, anchors and lifecycle.`);
