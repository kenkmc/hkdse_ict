/* Concept-specific data and computer-system simulations. No network dependencies. */
(function () {
  'use strict';
  const registry = (window.ICT_TOPIC_SIMS ||= []);
  const M = window.ICTDataModels = {};
  M.bits = (n, width) => ((n % 2 ** width + 2 ** width) % 2 ** width).toString(2).padStart(width, '0');
  M.signed = (bits) => parseInt(bits, 2) - (bits[0] === '1' ? 2 ** bits.length : 0);
  M.add = function (a, b, width, subtract = false) {
    const mask = 2 ** width - 1, ua = a & mask, ub = b & mask;
    const rhs = subtract ? (~ub & mask) : ub;
    let carry = subtract ? 1 : 0;
    const traces = [], output = Array(width).fill('·');
    for (let bit = 0; bit < width; bit++) {
      const x = ua >> bit & 1, y = rhs >> bit & 1, incoming = carry;
      const total = x + y + incoming;
      output[width - 1 - bit] = String(total & 1); carry = total > 1 ? 1 : 0;
      traces.push({bit, x, y, incoming, carry, total, output: output.join('')});
    }
    const unsigned = (ua + rhs + (subtract ? 1 : 0)) & mask;
    const signed = M.signed(M.bits(unsigned, width));
    const exact = subtract ? a - b : a + b;
    return {traces, result: M.bits(unsigned, width), signed, exact, carry, overflow: exact < -(2 ** (width - 1)) || exact >= 2 ** (width - 1)};
  };
  M.twosTrace = function (value, width) {
    const abs = M.bits(Math.abs(value), width), frames = [{bits: abs, active: -1, label: `先把絕對值 ${Math.abs(value)} 寫成 ${width} 位元二進制。`, phase: 'absolute'}];
    if (value >= 0) { frames.push({bits: abs, active: -1, phase: 'done', label: `非負數直接補 0 至 ${width} 位元；最高位為 0。`}); return frames; }
    const flipped = abs.split('');
    for (let i = 0; i < width; i++) { flipped[i] = flipped[i] === '1' ? '0' : '1'; frames.push({bits: flipped.join(''), active: i, phase: 'flip', label: `反轉第 ${i + 1} 位：${abs[i]} → ${flipped[i]}。`}); }
    let carry = 1;
    for (let i = width - 1; i >= 0 && carry; i--) {
      const old = +flipped[i], sum = old + carry; flipped[i] = String(sum % 2); carry = sum > 1 ? 1 : 0;
      frames.push({bits: flipped.join(''), active: i, phase: 'carry', carry, label: `${old} + 1 = ${sum.toString(2)}₂：寫下 ${sum % 2}${carry ? '，向左進 1' : '，進位停止'}。`});
    }
    frames.push({bits: flipped.join(''), active: -1, phase: 'done', label: `${flipped.join('')}₂ 的有號值是 ${value}。${value === -(2 ** (width - 1)) ? '這是最小有號值；其正值超出同位數有號範圍。' : ''}`});
    return frames;
  };
  M.convert = function (digits, base) {
    const valid = {2: /^[01]+$/, 10: /^\d+$/, 16: /^[\da-f]+$/i};
    if (!valid[base]?.test(String(digits))) return null;
    const n = parseInt(digits, base); if (!Number.isSafeInteger(n) || n > 65535) return null;
    return {n, terms: [...String(digits).toUpperCase()].map((digit, i, all) => ({digit, value: parseInt(digit, 16), power: all.length - i - 1, weight: base ** (all.length - i - 1), term: parseInt(digit, 16) * base ** (all.length - i - 1)})), binary: n.toString(2), decimal: String(n), hex: n.toString(16).toUpperCase()};
  };
  M.parity = (bits, odd = false) => bits.filter(Number).length % 2 === (odd ? 0 : 1) ? 1 : 0;
  M.parityValid = (bits, odd = false) => bits.filter(Number).length % 2 === (odd ? 1 : 0);
  M.aggregate = (rows) => {
    const valid = rows.filter(r => Number.isFinite(r.score));
    return [...new Set(valid.map(r => r.house))].sort().map(house => { const values = valid.filter(r => r.house === house).map(r => r.score); return {house, count: values.length, total: values.reduce((a, b) => a + b, 0), mean: values.reduce((a, b) => a + b, 0) / values.length}; });
  };
  const colIndex = s => [...s].reduce((v, c) => v * 26 + c.charCodeAt(0) - 64, 0);
  const colName = n => { let s = ''; while (n > 0) { n--; s = String.fromCharCode(65 + n % 26) + s; n = Math.floor(n / 26); } return s; };
  M.copyFormula = (formula, dx, dy) => formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/g, (_, lockC, col, lockR, row) => {
    const c = colIndex(col) + (lockC ? 0 : dx), r = +row + (lockR ? 0 : dy);
    return c < 1 || r < 1 ? '#REF!' : `${lockC}${colName(c)}${lockR}${r}`;
  });
  M.references = formula => [...formula.matchAll(/\$?[A-Z]+\$?\d+/g)].map(m => m[0].replaceAll('$', ''));
  M.evaluateProduct = (formula, cells) => {
    if (!/^=\$?[A-Z]+\$?\d+(\*\$?[A-Z]+\$?\d+)*$/.test(formula)) return null;
    return M.references(formula).reduce((v, ref) => v * Number(cells[ref] ?? 0), 1);
  };
  M.query = (rows, threshold, house, descending) => rows.filter(r => Number.isFinite(r.score) && r.score >= threshold && (house === '全部' || r.house === house)).sort((a, b) => (descending ? -1 : 1) * (a.score - b.score) || a.id - b.id);
  M.quantize = (value, min, max, depth) => { const levels = 2 ** depth; const code = Math.max(0, Math.min(levels - 1, Math.round((value - min) / (max - min) * (levels - 1)))); return {code, bits: M.bits(code, depth), reconstructed: min + code / (levels - 1) * (max - min), levels}; };
  M.schedule = (mode, duration = 12) => {
    const jobs = [{id: 'A', remaining: 4, deadline: 12}, {id: 'B', remaining: 2, deadline: 5}, {id: 'C', remaining: 3, deadline: 10}];
    const timeline = []; let cursor = 0, slice = 0;
    for (let t = 0; t < duration; t++) {
      const pending = jobs.filter(j => j.remaining > 0); if (!pending.length) { timeline.push({time: t, job: '—'}); continue; }
      let job;
      if (mode === 'realtime') job = pending.sort((a, b) => a.deadline - b.deadline)[0];
      else if (mode === 'batch') job = pending[0];
      else { if (!jobs[cursor].remaining || slice >= 2) { do { cursor = (cursor + 1) % jobs.length; } while (!jobs[cursor].remaining); slice = 0; } job = jobs[cursor]; slice++; }
      job.remaining--; timeline.push({time: t, job: job.id, remaining: job.remaining, deadline: job.deadline, completed: !job.remaining, late: t + 1 > job.deadline});
    }
    return timeline;
  };
  function E(tag, text, cls) { const e = document.createElement(tag); if (text !== undefined && text !== null) e.textContent = text; if (cls) e.className = cls; return e; }
  function S(tag, attrs) { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); return e; }
  function add(parent, tag, text, cls) { const e = E(tag, text, cls); parent.append(e); return e; }
  function control(parent, label, type, value, options) {
    const wrap = add(parent, 'label', null, 'td-control'); add(wrap, 'span', label);
    const e = E(type === 'select' ? 'select' : 'input');
    if (type === 'select') options.forEach(option => { const val = typeof option === 'object' ? option.value : option, name = typeof option === 'object' ? option.label : option; const o = E('option', name); o.value = val; e.append(o); });
    else e.type = type; e.value = value; wrap.append(e); return e;
  }
  function button(parent, text, action, cls) { const b = add(parent, 'button', text, cls); b.type = 'button'; b.addEventListener('click', action); return b; }
  function shell(host, cls) { const frame = add(host, 'div', null, 'td-sim ' + cls); const controls = add(frame, 'div', null, 'td-controls'); const stage = add(frame, 'div', null, 'td-stage'); const caption = add(frame, 'p', '', 'td-caption'); caption.setAttribute('aria-live', 'polite'); return {frame, controls, stage, caption}; }
  function transport(parent, api, step, reset) {
    let timer = null; const box = add(parent, 'div', null, 'td-transport');
    const stop = () => { clearInterval(timer); timer = null; play.textContent = '▶ 播放'; };
    const advance = () => { if (step() === false) stop(); };
    const play = button(box, '▶ 播放', () => { if (timer) stop(); else { timer = setInterval(advance, +speed.value); play.textContent = '❚❚ 暫停'; } });
    button(box, '下一步 →', () => { stop(); advance(); }); button(box, '↺ 重設', () => { stop(); reset(); });
    const speed = control(box, '每步時間', 'select', '700', [{value: '1400', label: '慢 1.4 秒'}, {value: '700', label: '中 0.7 秒'}, {value: '350', label: '快 0.35 秒'}]);
    speed.addEventListener('change', () => { if (timer) { clearInterval(timer); timer = setInterval(advance, +speed.value); } });
    api?.onCleanup?.(stop); return {stop};
  }
  function rowBits(parent, label, bits, width, active = -1, signed = false, carry = null) {
    const line = add(parent, 'div', null, 'td-bitline'); add(line, 'span', label, 'td-bitlabel');
    const row = add(line, 'div', null, 'td-bits');
    [...bits].forEach((bit, i) => { const cell = add(row, 'div', null, `td-bit ${i === active ? 'is-active' : ''} ${i === 0 && signed ? 'is-sign' : ''}`); add(cell, 'small', signed && i === 0 ? String(-(2 ** (width - 1))) : String(2 ** (width - 1 - i))); add(cell, 'strong', bit); if (carry !== null && i === active) add(cell, 'em', carry ? '← 進 1' : '進位 0', 'td-carry'); });
    return row;
  }
  function table(parent, headers, rows, rowClass) { const t = add(parent, 'table', null, 'td-table'); const thead = add(t, 'thead'), hr = add(thead, 'tr'); headers.forEach(h => add(hr, 'th', h)); const tbody = add(t, 'tbody'); rows.forEach((row, i) => { const tr = add(tbody, 'tr', null, rowClass?.(i)); row.forEach(c => add(tr, 'td', c)); }); return t; }
  function register(id, title, description, topics, mount) { registry.push({id, title, description, topics, mount}); }

  register('twos-complement-workbench', '二補碼：逐位反轉、進位與有號溢出', '親手輸入整數，觀看每一位如何改變；分清最高位的負權值、無號進位及有號溢出。', ['twos'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-twos');
    const width = control(controls, '位元數', 'select', 8, [4, 8]);
    const mode = control(controls, '觀察模式', 'select', 'encode', [{value: 'encode', label: '負數 → 二補碼'}, {value: 'decode', label: '位元 → 有號值'}, {value: 'add', label: '有號加法'}, {value: 'subtract', label: '有號減法'}]);
    const first = control(controls, '整數 A', 'number', -13), second = control(controls, '整數 B', 'number', 7);
    let index = 0, frames = [], arithmetic, editBits = '', player;
    const examples = E('div', null, 'td-examples'); frame.insertBefore(examples, stage); add(examples, 'span', '試看：');
    button(examples, '−8：連鎖進位', () => { width.value = '4'; mode.value = 'encode'; first.value = '-8'; reset(); });
    button(examples, '7 + 1：有號溢出', () => { width.value = '4'; mode.value = 'add'; first.value = '7'; second.value = '1'; reset(); });
    button(examples, '−1 + 1：進位但無溢出', () => { width.value = '4'; mode.value = 'add'; first.value = '-1'; second.value = '1'; reset(); });
    button(examples, '−128：最小值', () => { width.value = '8'; mode.value = 'encode'; first.value = '-128'; reset(); });
    const warning = add(frame, 'p', '', 'td-note');
    function reset() {
      player?.stop(); index = 0; const w = +width.value, min = -(2 ** (w - 1)), max = 2 ** (w - 1) - 1;
      [first, second].forEach(input => { input.min = min; input.max = max; input.value = Math.max(min, Math.min(max, Math.round(+input.value || 0))); });
      const a = +first.value, b = +second.value; editBits = M.bits(a, w); frames = M.twosTrace(a, w); arithmetic = M.add(a, b, w, mode.value === 'subtract');
      second.parentElement.hidden = !['add', 'subtract'].includes(mode.value); warning.textContent = `表示範圍：${min} 至 ${max}（${w} 位元有號整數）。`; draw();
    }
    function draw() {
      stage.replaceChildren(); const w = +width.value, a = +first.value, b = +second.value;
      if (mode.value === 'decode') {
        add(stage, 'p', '按下位元切換 0／1，最高位的權值是負數。', 'td-note');
        const grid = add(stage, 'div', null, 'td-decode');
        [...editBits].forEach((bit, i) => { const weight = i === 0 ? -(2 ** (w - 1)) : 2 ** (w - 1 - i); const cell = button(grid, '', () => { editBits = editBits.slice(0, i) + (bit === '0' ? '1' : '0') + editBits.slice(i + 1); draw(); }, 'td-togglebit' + (i === 0 ? ' is-sign' : '')); add(cell, 'small', `權值 ${weight}`); add(cell, 'strong', bit); add(cell, 'span', `${bit} × ${weight} = ${+bit * weight}`); });
        const terms = [...editBits].map((bit, i) => +bit * (i === 0 ? -(2 ** (w - 1)) : 2 ** (w - 1 - i)));
        add(stage, 'output', `${terms.join(' + ')} = ${M.signed(editBits)}`, 'td-answer');
        add(stage, 'p', `符號和值解讀：${editBits[0] === '1' ? '−' : '+'}${parseInt(editBits.slice(1), 2)}（最高位只表示正負，其餘位元表示大小）。`, 'td-note');
        caption.textContent = `同一組位元：無號解讀 ${parseInt(editBits, 2)}，二補碼解讀 ${M.signed(editBits)}。符號和值可以有 +0／−0；二補碼只有一個 0。`; return;
      }
      if (mode.value === 'encode') {
        const state = frames[Math.min(index, frames.length - 1)];
        add(stage, 'div', `${a}₁₀`, 'td-big-number'); rowBits(stage, '絕對值', M.bits(Math.abs(a), w), w);
        add(stage, 'div', state.phase === 'flip' ? '↓ 0 ↔ 1：逐位反轉' : state.phase === 'carry' ? '↓ 加 1：從最低位向左傳遞進位' : state.phase === 'done' ? '↓ 按有號權值解讀' : '↓ 負數須先反轉，再加 1', 'td-operation');
        rowBits(stage, state.phase === 'flip' ? '反轉中' : state.phase === 'carry' ? '加 1 中' : '目前位元', state.bits, w, state.active, state.phase === 'done', state.phase === 'carry' ? state.carry : null);
        if (state.phase === 'done') add(stage, 'output', `${state.bits}₂ = ${M.signed(state.bits)}₁₀`, 'td-answer');
        caption.textContent = `${Math.min(index + 1, frames.length)}／${frames.length}　${state.label}`; return;
      }
      const t = arithmetic.traces[Math.max(0, index - 1)], active = index ? w - 1 - t.bit : -1;
      rowBits(stage, 'A', M.bits(a, w), w, active, true);
      rowBits(stage, mode.value === 'subtract' ? 'NOT B' : 'B', mode.value === 'subtract' ? M.bits(~b, w) : M.bits(b, w), w, active, true);
      add(stage, 'div', mode.value === 'subtract' ? 'A − B = A + NOT B + 1（最低位先帶入 1）' : '從最低位起：A 位元 + B 位元 + 輸入進位', 'td-operation');
      rowBits(stage, '結果', index ? t.output : '·'.repeat(w), w, active, true, index ? t.carry : null);
      if (index) add(stage, 'p', `第 ${t.bit} 位：${t.x} + ${t.y} + ${t.incoming} = ${t.total} → 寫下 ${t.total % 2}，進位 ${t.carry}`, 'td-equation');
      if (index >= w) {
        const flags = add(stage, 'div', null, 'td-flags'); add(flags, 'span', `最高位進位 C = ${arithmetic.carry}`, 'td-flag'); add(flags, 'span', `有號溢出 V = ${Number(arithmetic.overflow)}`, 'td-flag ' + (arithmetic.overflow ? 'is-bad' : 'is-good'));
        add(stage, 'output', `${a} ${mode.value === 'subtract' ? '−' : '+'} ${b} = ${arithmetic.exact}；儲存位元 ${arithmetic.result} → 有號解讀 ${arithmetic.signed}`, 'td-answer');
      }
      caption.textContent = index >= w ? (arithmetic.overflow ? `精確答案 ${arithmetic.exact} 超出表示範圍，截斷後的有號結果錯誤：這才是有號溢出。` : `精確答案仍在範圍內，有號運算正確。最高位有進位也不一定有有號溢出。`) : '逐位追蹤全加器的進位；進位 C 與有號溢出 V 是不同訊號。';
    }
    player = transport(frame, api, () => { if (mode.value === 'decode') return false; const limit = mode.value === 'encode' ? frames.length - 1 : +width.value; if (index >= limit) return false; index++; draw(); return index < limit; }, reset);
    [width, mode, first, second].forEach(e => e.addEventListener('change', reset)); reset();
  });

  register('radix-place-machine', '進位制：每個數碼如何貢獻數值', '把二、十或十六進制數碼放在真正的位值上，逐項累加，再比較三種表示。', ['binary-place'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-radix'); const base = control(controls, '來源進制', 'select', 2, [{value: 2, label: '二進制'}, {value: 10, label: '十進制'}, {value: 16, label: '十六進制'}]), digits = control(controls, '數碼（最大 65535）', 'text', '101101'); let index = 0, model, player;
    function reset() { player?.stop(); index = 0; model = M.convert(digits.value.trim(), +base.value); draw(); }
    function draw() { stage.replaceChildren(); if (!model) { caption.textContent = '請輸入這個進制允許的數碼，數值介乎 0 至 65535。'; return; } const rail = add(stage, 'div', null, 'td-place-rail'); model.terms.forEach((term, i) => { const c = add(rail, 'div', null, 'td-place ' + (i < index ? 'is-counted' : '')); add(c, 'strong', term.digit); add(c, 'span', `× ${base.value}^${term.power}`); add(c, 'small', `位值 ${term.weight}`); add(c, 'b', i < index ? String(term.term) : '？'); }); const sum = model.terms.slice(0, index).reduce((s, t) => s + t.term, 0); add(stage, 'div', '↓ 每一位的「數碼 × 位值」相加', 'td-operation'); add(stage, 'output', `累加器 = ${sum}`, 'td-answer'); const out = add(stage, 'div', null, 'td-radix-results'); [['2', model.binary], ['10', model.decimal], ['16', model.hex]].forEach(([b, v]) => add(out, 'span', `${index === model.terms.length ? v : '…'}（${b} 進制）`)); caption.textContent = index ? `剛加入 ${model.terms[index - 1].digit} × ${model.terms[index - 1].weight}；已累加 ${index}／${model.terms.length} 個位值。` : '先預測每位數碼的貢獻，再按下一步累加。十六進制 A 至 F 分別代表 10 至 15。'; }
    player = transport(frame, api, () => { if (!model || index >= model.terms.length) return false; index++; draw(); return index < model.terms.length; }, reset); digits.maxLength = 16; base.addEventListener('change', () => { if (model) digits.value = model.n.toString(+base.value).toUpperCase(); reset(); }); digits.addEventListener('change', reset); reset();
  });

  const records = [{id: 1, name: '雅晴', house: '紅', score: 72}, {id: 2, name: '子朗', house: '藍', score: 91}, {id: 3, name: '詠欣', house: '紅', score: 84}, {id: 4, name: '俊軒', house: '藍', score: null}, {id: 5, name: '思澄', house: '紅', score: 96}, {id: 6, name: '浩然', house: '藍', score: 69}];
  register('data-information-pipeline', '數據變資訊：用真實紀錄完成分組統計', '觀察缺漏數據如何被排除、同社紀錄如何合併，以及人數與平均分怎樣得到。', ['information'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-information'); const extra = control(controls, '新增紅社分數', 'number', 60); extra.min = 0; extra.max = 100; let phase = 0, player;
    function rows() { return [...records, {id: 7, name: '新同學', house: '紅', score: Math.max(0, Math.min(100, +extra.value || 0))}]; }
    function draw() { stage.replaceChildren(); const data = rows(); const line = add(stage, 'div', null, 'td-dataflow'); ['原始紀錄', '排除缺漏', '按社分組', '計算資訊'].forEach((s, i) => add(line, 'span', `${i + 1} ${s}${i < 3 ? ' →' : ''}`, i === phase ? 'is-active' : '')); table(stage, ['學號', '姓名', '社', '分數'], data.map(r => [r.id, r.name, r.house, r.score ?? '缺漏']), i => phase > 0 && data[i].score === null ? 'is-rejected' : phase > 1 ? 'td-house-' + data[i].house : ''); if (phase >= 2) { const groups = add(stage, 'div', null, 'td-groupbars'); M.aggregate(data).forEach(g => { const group = add(groups, 'div', null, 'td-group'); add(group, 'b', `${g.house}社`); add(group, 'span', data.filter(r => r.house === g.house && r.score !== null).map(r => r.score).join(' + ')); const bar = add(group, 'div', null, 'td-meanbar'); bar.style.width = `${g.mean}%`; add(group, 'output', phase === 3 ? `總分 ${g.total} ÷ ${g.count} 人 = ${g.mean.toFixed(1)} 分` : `${g.count} 筆有效紀錄`); }); } caption.textContent = ['每一列是個別學生的原始紀錄；它們還未直接回答哪個社的平均分較高。', '缺漏分數不當作 0；俊軒不列入分數總和或有效人數。', '把同一社的有效分數放在同組；每組的人數可以不同。', '平均分是按組別計算的資訊；改動新同學的分數，觀察摘要如何改變。'][phase]; }
    player = transport(frame, api, () => { if (phase >= 3) return false; phase++; draw(); return phase < 3; }, () => { phase = 0; draw(); }); extra.addEventListener('input', draw); draw();
  });

  register('validation-verification-gates', '數據檢查：合理的輸入也可能抄錯', '讓一個值通過範圍檢查，再與原始表格比較，親眼區分有效性檢查與核實。', ['validation'], function (host) {
    const {controls, stage, caption} = shell(host, 'td-validation'); const source = control(controls, '原始表格上的年齡', 'number', 16), typed = control(controls, '第一次輸入', 'text', '18'), retyped = control(controls, '重新輸入核實', 'text', '16');
    function draw() { stage.replaceChildren(); const value = typed.value, typeOK = /^\d+$/.test(value), rangeOK = typeOK && +value >= 10 && +value <= 20, matches = value === retyped.value, correct = value === source.value; const gates = add(stage, 'div', null, 'td-gates'); [['原始表格', `${source.value} 歲`, true], ['類型／範圍檢查', `輸入「${value}」\n${!typeOK ? '必須是整數' : rangeOK ? '10 ≤ 年齡 ≤ 20：通過' : '超出 10 至 20'} `, rangeOK], ['雙重輸入核實', `第二次「${retyped.value}」\n${matches ? '兩次相同' : '兩次不一致'}`, matches]].forEach(([title, body, good]) => { const gate = add(gates, 'div', null, 'td-gate ' + (good ? 'is-good' : 'is-bad')); add(gate, 'h4', title); add(gate, 'strong', body); }); add(stage, 'output', correct ? '與來源一致' : '與來源不一致：仍然可能是抄寫錯誤', 'td-answer'); caption.textContent = rangeOK && !correct ? '18 是合理年齡，因此可通過有效性檢查；但原始表格是 16。核實用來檢查轉錄是否一致。兩次都抄錯同一值，雙重輸入也不能保證正確。' : '有效性檢查檢查格式或合理範圍；核實比較輸入與原始來源，或以雙重輸入找出不一致。'; }
    [source, typed, retyped].forEach(e => e.addEventListener('input', draw)); draw();
  });

  register('parity-transmission', '奇偶檢查：翻動傳輸中的實際位元', '資料加上奇偶位元，使 1 的總數符合指定奇偶性。翻動傳輸中的位元，觀察一位錯誤與兩位錯誤的差別。', ['parity'], function (host) {
    const {frame, controls, stage, caption} = shell(host, 'td-parity'); const odd = control(controls, '檢查方式', 'select', 'even', [{value: 'even', label: '偶數奇偶檢查'}, {value: 'odd', label: '奇數奇偶檢查'}]); let source = [1, 0, 1, 1, 0, 0, 1, 0], received = [], transmitted = [];
    function reset() { transmitted = [...source, M.parity(source, odd.value === 'odd')]; received = [...transmitted]; draw(); }
    function draw() { stage.replaceChildren(); add(stage, 'p', '傳送端：最後一格是計算出的奇偶位元 P。', 'td-note'); const sender = add(stage, 'div', null, 'td-parity-bits'); transmitted.forEach((b, i) => add(sender, 'span', `${i === 8 ? 'P' : 'D' + i}\n${b}`, i === 8 ? 'is-parity' : '')); add(stage, 'div', '↓ 傳輸通道：按接收位元製造錯誤', 'td-operation'); const receiver = add(stage, 'div', null, 'td-parity-bits'); received.forEach((b, i) => button(receiver, `${i === 8 ? 'P' : 'D' + i}\n${b}`, () => { received[i] = 1 - received[i]; draw(); }, (b !== transmitted[i] ? 'is-flipped ' : '') + (i === 8 ? 'is-parity' : ''))); const count = received.filter(Number).length, changed = received.filter((b, i) => b !== transmitted[i]).length, valid = M.parityValid(received, odd.value === 'odd'); add(stage, 'output', `接收到 ${count} 個 1 → ${valid ? '檢查通過' : '偵測到錯誤'}`, 'td-answer ' + (valid ? 'is-good' : 'is-bad')); caption.textContent = changed ? `實際有 ${changed} 位被改動。${changed % 2 ? '奇數個位元錯誤改變奇偶性，所以可被偵測。' : '偶數個位元錯誤保持奇偶性，所以檢查可能通過。'} 奇偶檢查不能確定哪個位元出錯。` : '先翻轉一位，再翻轉另一位。請比較「檢查通過」與「數據正確」是否相同。'; }
    button(controls, '清除傳輸錯誤', reset); odd.addEventListener('change', reset); reset();
  });

  register('storage-access-head', '儲存存取：磁帶讀頭與直接定址', '讓讀頭真的逐筆經過紀錄，再與直接定址比較；目標位置決定循序存取的讀取次數。', ['access'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-access'); const target = control(controls, '目標紀錄', 'select', 7, [1, 2, 3, 4, 5, 6, 7, 8]), mode = control(controls, '存取方式', 'select', 'sequential', [{value: 'sequential', label: '循序：從頭逐筆讀取'}, {value: 'direct', label: '直接：按地址讀取'}]); let visits = [], player;
    function reset() { player?.stop(); visits = []; draw(); }
    function draw() { stage.replaceChildren(); const strip = add(stage, 'div', null, 'td-tape'); for (let i = 1; i <= 8; i++) { const slot = add(strip, 'div', null, 'td-record ' + (visits.includes(i) ? 'is-visited ' : '') + (i === +target.value ? 'is-target ' : '') + (i === visits.at(-1) ? 'is-head' : '')); add(slot, 'small', `地址 ${i - 1}`); add(slot, 'strong', `R${i}`); add(slot, 'span', i === visits.at(-1) ? '▲ 讀頭' : i === +target.value ? '目標' : '　'); } add(stage, 'output', `已讀取 ${visits.length} 筆；路徑 ${visits.length ? visits.map(i => 'R' + i).join(' → ') : '尚未讀取'}`, 'td-answer'); caption.textContent = mode.value === 'sequential' ? `循序存取必須經過前面的紀錄；由帶頭到 R${target.value} 需讀取 ${target.value} 筆。` : '模型把地址映射至目標紀錄，只讀取該筆。實際磁碟仍有尋道、旋轉或控制器延遲，直接存取不代表零時間。'; }
    player = transport(frame, api, () => { if (visits.at(-1) === +target.value) return false; visits.push(mode.value === 'direct' ? +target.value : visits.length + 1); draw(); return visits.at(-1) !== +target.value; }, reset); [target, mode].forEach(e => e.addEventListener('change', reset)); reset();
  });

  register('spreadsheet-reference-copy', '試算表：搬動公式，追蹤參照與鎖定', '在工作表內複製相對、絕對和混合參照；依賴的儲存格會發光，修改數值即重新計算。', ['spreadsheet'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-spreadsheet'); const formula = control(controls, 'C2 的公式', 'select', '=B2*$F$1', ['=B2*$F$1', '=$B2*C$1', '=B2*C1']), target = control(controls, '複製到', 'select', 'D3', ['C3', 'C4', 'D3', 'D4', 'E4']); const editRef = control(controls, '修改數值格', 'select', 'B3', ['B2', 'B3', 'B4', 'C1', 'D1', 'E1', 'F1', 'C3']), editValue = control(controls, '數值', 'number', 150); let phase = 0, player;
    const cells = {B1: 1, C1: 1.1, D1: 1.2, E1: 1.3, F1: 0.1, B2: 100, B3: 150, B4: 200, B5: 250, C3: 30, C4: 40, D2: 20, D3: 45, D4: 60};
    function targetFormula() { return M.copyFormula(formula.value, colIndex(target.value[0]) - 3, +target.value.slice(1) - 2); }
    function draw() { stage.replaceChildren(); const copied = targetFormula(), refs = phase ? M.references(copied) : M.references(formula.value); const t = add(stage, 'table', null, 'td-sheet'); const head = add(t, 'tr'); [''].concat(['A', 'B', 'C', 'D', 'E', 'F']).forEach(h => add(head, 'th', h)); for (let r = 1; r <= 5; r++) { const tr = add(t, 'tr'); add(tr, 'th', r); for (let c = 1; c <= 6; c++) { const ref = colName(c) + r, isOrigin = ref === 'C2', isTarget = ref === target.value; const td = add(tr, 'td', null, `${refs.includes(ref) ? 'is-dependency ' : ''}${isOrigin ? 'is-origin ' : ''}${isTarget && phase ? 'is-destination' : ''}`); add(td, 'small', ref); const f = isOrigin ? formula.value : isTarget && phase ? copied : null; add(td, 'strong', f ? Number(M.evaluateProduct(f, cells)?.toFixed(2)) : cells[ref] ?? ''); if (f) add(td, 'span', f, 'td-cellformula'); } } const transform = add(stage, 'div', null, 'td-formula-transform'); add(transform, 'code', `C2: ${formula.value}`); add(transform, 'span', `→ 右移 ${colIndex(target.value[0]) - 3} 欄、下移 ${+target.value.slice(1) - 2} 列 →`); add(transform, 'code', `${target.value}: ${phase ? copied : '按下一步複製'}`); if (phase) add(stage, 'p', `依賴：${refs.map(ref => `${ref} = ${cells[ref] ?? 0}`).join('；')} → 結果 ${Number(M.evaluateProduct(copied, cells)?.toFixed(2))}`, 'td-equation'); caption.textContent = '$ 鎖住它後面的欄或列：$B2 鎖欄；C$1 鎖列；$F$1 同時鎖欄列。上方數值格可編輯，依賴變動後會重新計算。'; }
    player = transport(frame, api, () => { phase = 1; draw(); return false; }, () => { phase = 0; draw(); }); [formula, target].forEach(e => e.addEventListener('change', () => { player.stop(); phase = 0; draw(); })); editRef.addEventListener('change', () => { editValue.value = cells[editRef.value] ?? 0; }); editValue.addEventListener('input', () => { cells[editRef.value] = +editValue.value || 0; draw(); }); draw();
  });

  register('database-query-execution', '數據庫：逐列執行 WHERE，再投影與排序', '查詢真的篩選資料表；看每列如何通過條件，然後選取欄位及排序結果。', ['databasequery'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-query'); const threshold = control(controls, '最低分數', 'number', 80), house = control(controls, '社', 'select', '全部', ['全部', '紅', '藍']), order = control(controls, '分數排序', 'select', 'desc', [{value: 'desc', label: '由高至低 DESC'}, {value: 'asc', label: '由低至高 ASC'}]), projection = control(controls, 'SELECT 欄位', 'select', 'name,score', [{value: 'name,score', label: '姓名、分數'}, {value: 'name,house,score', label: '姓名、社、分數'}]); const data = records.filter(r => r.score !== null); let cursor = 0, player;
    function reset() { player?.stop(); cursor = 0; draw(); }
    function draw() { stage.replaceChildren(); add(stage, 'code', `SELECT ${projection.value} FROM Students WHERE score >= ${+threshold.value || 0}${house.value !== '全部' ? " AND house = '" + house.value + "'" : ''} ORDER BY score ${order.value.toUpperCase()}`, 'td-sql'); const pass = r => r.score >= (+threshold.value || 0) && (house.value === '全部' || house.value === r.house); table(stage, ['編號', '姓名', '社', '分數', 'WHERE'], data.map((r, i) => [r.id, r.name, r.house, r.score, i < cursor ? pass(r) ? '✓ 保留' : '× 排除' : '待檢查']), i => i === cursor && cursor < data.length ? 'is-current' : i < cursor ? pass(data[i]) ? 'is-accepted' : 'is-rejected' : ''); add(stage, 'div', '↓ WHERE 篩選列 → SELECT 選取欄 → ORDER BY 排序', 'td-operation'); const result = cursor > data.length ? M.query(data, +threshold.value || 0, house.value, order.value === 'desc') : data.slice(0, cursor).filter(pass), cols = projection.value.split(','); table(stage, cols.map(c => ({name: '姓名', house: '社', score: '分數'})[c]), result.map(r => cols.map(c => r[c]))); caption.textContent = cursor > data.length ? `查詢完成：${result.length} 列。投影只控制顯示欄位；排序不會改寫原資料表。` : `已檢查 ${Math.min(cursor, data.length)}／${data.length} 列。條件中的 AND 需要兩項都成立。下一步繼續篩選，最後才排序。`; }
    player = transport(frame, api, () => { if (cursor > data.length) return false; cursor++; draw(); return cursor <= data.length; }, reset); [threshold, house, order, projection].forEach(e => e.addEventListener('change', reset)); reset();
  });

  register('input-adc-controller', '輸入到輸出：感應器、ADC 與控制訊號', '移動溫度，觀看連續訊號如何量化成二進制，再由處理器判斷風扇狀態。', ['hardwareinput'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-input'); const temp = control(controls, '感測溫度（−10 至 50°C）', 'range', 32); temp.min = -10; temp.max = 50; temp.step = 0.1; const depth = control(controls, 'ADC 位元深度', 'select', 4, [4, 8]); let phase = 0, player;
    function reset() { player?.stop(); phase = 0; draw(); }
    function draw() { stage.replaceChildren(); const value = +temp.value, q = M.quantize(value, -10, 50, +depth.value); const flow = add(stage, 'div', null, 'td-device-flow'); const sensor = add(flow, 'div', null, 'td-device ' + (phase === 0 ? 'is-active' : '')); add(sensor, 'h4', '溫度感應器'); const gauge = add(sensor, 'div', null, 'td-thermometer'); const fill = add(gauge, 'span'); fill.style.height = `${(value + 10) / 60 * 100}%`; add(sensor, 'strong', `${value.toFixed(1)}°C`); add(sensor, 'small', '連續類比訊號'); add(flow, 'span', '→', 'td-flow-arrow'); const adc = add(flow, 'div', null, 'td-device ' + (phase === 1 ? 'is-active' : '')); add(adc, 'h4', 'ADC'); add(adc, 'strong', phase >= 1 ? q.bits : '…', 'td-device-binary'); add(adc, 'small', `${q.levels} 個量化級別`); add(flow, 'span', '→', 'td-flow-arrow'); const cpu = add(flow, 'div', null, 'td-device ' + (phase === 2 ? 'is-active' : '')); add(cpu, 'h4', '處理器'); add(cpu, 'code', 'IF 溫度 ≥ 30'); add(cpu, 'strong', phase >= 2 ? `${q.reconstructed.toFixed(2)} ≥ 30：${q.reconstructed >= 30 ? '真' : '假'}` : '等待數據'); add(flow, 'span', '→', 'td-flow-arrow'); const out = add(flow, 'div', null, 'td-device ' + (phase === 3 ? 'is-active' : '')); add(out, 'h4', '輸出：風扇'); add(out, 'div', '✣', 'td-fan ' + (phase >= 3 && q.reconstructed >= 30 ? 'is-spinning' : '')); add(out, 'strong', phase >= 3 ? q.reconstructed >= 30 ? '開啟' : '關閉' : '等待控制訊號'); if (phase >= 1) add(stage, 'output', `量化碼 ${q.code} → 重建溫度 ${q.reconstructed.toFixed(2)}°C；誤差 ${(q.reconstructed - value).toFixed(2)}°C`, 'td-answer'); caption.textContent = ['感應器把物理溫度轉成類比電訊號；量度範圍在本模型固定為 −10 至 50°C。', 'ADC 在固定範圍內四捨五入至最接近的離散級別。位元深度越高，級別越多，量化間距越小。', 'CPU 使用量化後的數值比較 30°C 門檻；接近門檻時，量化誤差可能改變判斷。', '輸出裝置接收控制訊號。本例風扇是開／關輸出；數碼鍵盤或條碼閱讀器的資料則不需要經過這個類比 ADC 流程。'][phase]; }
    player = transport(frame, api, () => { if (phase >= 3) return false; phase++; draw(); return phase < 3; }, reset); [temp, depth].forEach(e => e.addEventListener('input', reset)); reset();
  });

  register('cpu-register-bus', 'CPU：資料沿暫存器與匯流排移動', '追蹤 LOAD、ADD、STORE 的 PC、MAR、MDR、IR 和 ACC；比較同一地址的快取命中與未命中。', ['cpu-memory'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-cpu'); const caching = control(controls, '快取', 'select', 'on', [{value: 'on', label: '開啟快取'}, {value: 'off', label: '關閉快取'}]); let step = 0, player;
    const program = ['LOAD 4', 'ADD 4', 'STORE 5'], phases = ['PC → MAR：發出下一指令地址', 'RAM → MDR → IR：擷取指令，PC + 1', 'CU 解碼 IR，識別操作碼及資料地址', '資料地址 → MAR；讀取操作數或準備寫入', '執行 ALU／寫入 RAM，完成一條指令'];
    function stateAt(n) { const s = {pc: 0, mar: '—', mdr: '—', ir: '—', acc: 0, ram: ['LOAD 4', 'ADD 4', 'STORE 5', '—', 7, 0], cache: null, cacheStatus: '尚未存取', hits: 0, misses: 0}; for (let k = 1; k <= n; k++) { const ins = Math.floor((k - 1) / 5), phase = (k - 1) % 5; if (phase === 0) s.mar = ins; if (phase === 1) { s.mdr = program[ins]; s.ir = s.mdr; s.pc = ins + 1; } if (phase === 3) { s.mar = ins === 2 ? 5 : 4; if (ins < 2) { const hit = caching.value === 'on' && s.cache === 4; s.cacheStatus = hit ? 'HIT：快取 → MDR（地址 4）' : 'MISS：由 RAM 讀取地址 4'; hit ? s.hits++ : s.misses++; s.mdr = 7; if (caching.value === 'on') s.cache = 4; } } if (phase === 4) { if (ins === 0) s.acc = +s.mdr; else if (ins === 1) s.acc += +s.mdr; else { s.mdr = s.acc; s.ram[5] = s.acc; } } } return s; }
    function draw() { stage.replaceChildren(); const s = stateAt(step), phase = step ? (step - 1) % 5 : -1, instruction = step ? Math.floor((step - 1) / 5) : 0; const cacheHit = caching.value === 'on' && instruction === 1 && phase === 3; const externalData = phase === 1 || phase === 3 && instruction < 2 && !cacheHit || phase === 4 && instruction === 2; const schematic = add(stage, 'div', null, 'td-cpu-schematic'); const cpu = add(schematic, 'div', null, 'td-cpu-chip'); add(cpu, 'h4', 'CPU'); const regs = add(cpu, 'div', null, 'td-registers'); [['PC', s.pc, phase === 0 || phase === 1], ['MAR', s.mar, phase === 0 || phase === 3], ['MDR', s.mdr, phase === 1 || phase === 3 && instruction < 2 || phase === 4 && instruction === 2], ['IR', s.ir, phase === 1 || phase === 2], ['ACC', s.acc, phase === 4]].forEach(([name, value, active]) => { const r = add(regs, 'div', null, 'td-register ' + (active ? 'is-active' : '')); add(r, 'b', name); add(r, 'strong', value); }); const units = add(cpu, 'div', null, 'td-cpu-units'); add(units, 'span', 'CU 解碼', phase === 2 ? 'is-active' : ''); add(units, 'span', 'ALU 加法', phase === 4 && instruction === 1 ? 'is-active' : ''); const buses = add(schematic, 'div', null, 'td-buses'); add(buses, 'div', '地址匯流排　CPU → RAM', 'td-bus ' + ([0, 3].includes(phase) && !cacheHit ? 'is-flowing' : '')); add(buses, 'div', phase === 4 && instruction === 2 ? '數據匯流排　CPU → RAM' : '數據匯流排　RAM → CPU', 'td-bus ' + (externalData ? 'is-flowing' : '')); add(buses, 'div', '控制匯流排　讀取／寫入', 'td-bus ' + (externalData ? 'is-flowing' : '')); const memory = add(schematic, 'div', null, 'td-ram'); add(memory, 'h4', '主記憶體 RAM'); table(memory, ['地址', '內容'], s.ram.map((v, i) => [i, v]), i => i === s.mar && !cacheHit ? 'is-current' : ''); const cache = add(stage, 'div', null, 'td-cache' + (cacheHit ? ' is-active' : '')); add(cache, 'b', `快取 ${caching.value === 'on' ? s.cache === 4 ? '[地址 4 → 7]' : '[空]' : '停用'}`); add(cache, 'span', s.cacheStatus); add(cache, 'span', `命中 ${s.hits}／未命中 ${s.misses}`); add(stage, 'output', step ? `${program[instruction]}　${phases[phase]}` : '準備執行：LOAD 4 → ADD 4 → STORE 5', 'td-answer'); caption.textContent = step >= 15 ? '程式完成：RAM[5] = 14。第二次讀地址 4 時，快取可避免重讀主記憶體。本模型只計算資料存取，略去指令快取及真實時脈細節。' : '地址匯流排帶的是位置；數據匯流排帶的是指令或數值。留意 MAR 與 MDR 不保存相同種類的資料。'; }
    player = transport(frame, api, () => { if (step >= 15) return false; step++; draw(); return step < 15; }, () => { step = 0; draw(); }); caching.addEventListener('change', () => { player.stop(); step = 0; draw(); }); draw();
  });

  register('os-job-scheduler', '作業系統：CPU 時間如何分給工作', '在甘特圖逐格執行相同工作，比較批次、兩單位時間片和按截止時間處理。', ['os-scheduler'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-scheduler'); const mode = control(controls, '排程策略', 'select', 'timeshare', [{value: 'batch', label: '批次：A → B → C'}, {value: 'timeshare', label: '分時：每片 2 單位'}, {value: 'realtime', label: '實時示例：截止時間較早優先'}]); let tick = 0, player;
    function reset() { player?.stop(); tick = 0; draw(); }
    function draw() { stage.replaceChildren(); const timeline = M.schedule(mode.value), done = timeline.slice(0, tick); const key = add(stage, 'div', null, 'td-jobkey'); [['A', 4, 12], ['B', 2, 5], ['C', 3, 10]].forEach(([id, need, deadline]) => { const used = done.filter(t => t.job === id).length; const box = add(key, 'div', null, 'td-job td-job-' + id); add(box, 'b', `工作 ${id}`); add(box, 'span', `需 ${need} 單位；截止 t=${deadline}`); add(box, 'strong', `剩餘 ${Math.max(0, need - used)}`); const completion = done.find(t => t.job === id && t.completed); if (completion) add(box, 'span', `t=${completion.time + 1} 完成${completion.time + 1 > deadline ? '（逾時）' : ''}`); }); const chart = add(stage, 'div', null, 'td-gantt'); timeline.forEach((slot, i) => { const col = add(chart, 'div', null, 'td-gantt-unit'); add(col, 'small', i); add(col, 'div', i < tick ? slot.job : '·', i < tick ? 'td-job-' + slot.job : ''); if ([5, 10, 12].includes(i + 1)) add(col, 'em', `截止 ${i + 1}`); }); add(stage, 'output', `時鐘 t = ${tick}；CPU ${tick ? done.at(-1).job === '—' ? '閒置' : '剛執行 ' + done.at(-1).job : '尚未執行'}`, 'td-answer'); caption.textContent = mode.value === 'realtime' ? '本例所有工作 t=0 到達，先執行截止時間最早的 B。實時系統的要求是在期限內回應；這個排程只是示例，不能單憑執行速度判定為實時。' : mode.value === 'timeshare' ? '時間片用完後切換下一工作，讓各工作輪流取得 CPU。這是交替執行；單核心同一刻只執行一個工作。' : '先集中工作，再依次完成。本例 A 執行 4 單位後 B 才開始，B 到 t=6 才完成，錯過 t=5 期限。'; }
    player = transport(frame, api, () => { if (tick >= 12) return false; tick++; draw(); return tick < 12; }, reset); mode.addEventListener('change', reset); reset();
  });

  register('image-rgb-bitdepth', '圖像：像素內的 RGB 位元與檔案大小', '點選像素直接編輯 RGB，降低每個通道的位元數，觀察量化顏色與儲存位元的變化。', ['media'], function (host) {
    const {controls, stage, caption} = shell(host, 'td-image'); const depth = control(controls, '每個 RGB 通道位元數', 'select', 8, [1, 2, 4, 8]), red = control(controls, 'R', 'range', 235), green = control(controls, 'G', 'range', 120), blue = control(controls, 'B', 'range', 55); [red, green, blue].forEach(e => { e.min = 0; e.max = 255; }); const pixels = Array.from({length: 64}, (_, i) => [(i % 8) * 32 + 15, Math.floor(i / 8) * 32 + 15, (i % 2) * 100 + 55]); let selected = 19;
    function select(index) { selected = index; [red, green, blue].forEach((e, i) => e.value = pixels[index][i]); draw(); }
    function draw() { stage.replaceChildren(); const layout = add(stage, 'div', null, 'td-pixel-layout'); const grid = add(layout, 'div', null, 'td-pixel-grid'); pixels.forEach((p, i) => { const rgb = p.map(v => Math.round(M.quantize(v, 0, 255, +depth.value).reconstructed)); const cell = button(grid, '', () => select(i), i === selected ? 'is-selected' : ''); cell.style.backgroundColor = `rgb(${rgb.join(',')})`; cell.setAttribute('aria-label', `像素 ${i % 8 + 1}, ${Math.floor(i / 8) + 1}，RGB ${rgb.join('、')}`); }); const detail = add(layout, 'div', null, 'td-pixel-detail'); const rgb = pixels[selected]; add(detail, 'h4', `像素 (${selected % 8 + 1}, ${Math.floor(selected / 8) + 1})`); rgb.forEach((v, i) => { const q = M.quantize(v, 0, 255, +depth.value), row = add(detail, 'div', null, 'td-channel'); row.style.setProperty('--channel', ['#ef4444', '#22c55e', '#3b82f6'][i]); add(row, 'b', ['R', 'G', 'B'][i]); add(row, 'code', q.bits); add(row, 'span', `${v} → ${Math.round(q.reconstructed)}`); }); add(detail, 'output', `8 × 8 × ${+depth.value * 3} = ${64 * +depth.value * 3} 位元\n= ${64 * +depth.value * 3 / 8} bytes`, 'td-answer'); caption.textContent = `${+depth.value * 3} 位元 RGB 可表示 2^${+depth.value * 3} = ${(2 ** (+depth.value * 3)).toLocaleString()} 種顏色。這裏把每個通道獨立量化；大小只計像素資料，未計標頭、壓縮或調色盤。`; }
    [red, green, blue].forEach((e, i) => e.addEventListener('input', () => { pixels[selected][i] = +e.value; draw(); })); depth.addEventListener('change', draw); select(selected);
  });

  register('audio-sampling-quantization', '聲音：取樣位置與量化級別分開觀察', '真正移動取樣點及量化階梯，對比連續波形、時間取樣與離散振幅。', ['media'], function (host, api) {
    const {frame, controls, stage, caption} = shell(host, 'td-audio'); const rate = control(controls, '每秒取樣數（模型）', 'select', 16, [8, 16, 32, 64]), depth = control(controls, '振幅位元深度', 'select', 3, [2, 3, 4, 8]), frequency = control(controls, '原音頻率（Hz）', 'select', 3, [1, 3, 6, 10]); let count = 0, player;
    const signal = t => 0.78 * Math.sin(2 * Math.PI * +frequency.value * t);
    function reset() { player?.stop(); count = 0; draw(); }
    function draw() { stage.replaceChildren(); const svg = S('svg', {viewBox: '0 0 760 300', role: 'img', 'aria-label': '連續聲波、取樣點及量化振幅'}); svg.classList.add('td-wave'); stage.append(svg); const x = t => 45 + t * 680, y = v => 135 - v * 100, levels = 2 ** +depth.value; for (let i = 0; i < Math.min(levels, 16); i++) { const v = -1 + i / (Math.min(levels, 16) - 1) * 2; svg.append(S('line', {x1: 45, x2: 725, y1: y(v), y2: y(v), class: 'td-wave-grid'})); } svg.append(S('line', {x1: 45, x2: 725, y1: y(0), y2: y(0), class: 'td-wave-axis'})); let d = ''; for (let i = 0; i <= 500; i++) d += `${i ? 'L' : 'M'}${x(i / 500)} ${y(signal(i / 500))}`; svg.append(S('path', {d, class: 'td-analogue-wave'})); const shown = Math.min(count, +rate.value), values = []; for (let i = 0; i < shown; i++) { const t = i / +rate.value, raw = signal(t), q = M.quantize(raw, -1, 1, +depth.value); values.push(q.bits); svg.append(S('line', {x1: x(t), x2: x(t), y1: y(raw), y2: y(q.reconstructed), class: 'td-quant-error'})); svg.append(S('line', {x1: x(t), x2: x(t), y1: y(0), y2: y(q.reconstructed), class: 'td-sample-stem'})); svg.append(S('circle', {cx: x(t), cy: y(raw), r: 3, class: 'td-raw-point'})); svg.append(S('rect', {x: x(t) - 4, y: y(q.reconstructed) - 4, width: 8, height: 8, class: 'td-quant-point'})); } [['0 s', 45, 275], ['1 s', 705, 275], ['連續波形', 50, 20], ['圓：原振幅　方：量化振幅', 400, 20]].forEach(([text, xx, yy]) => { const t = S('text', {x: xx, y: yy}); t.textContent = text; svg.append(t); }); add(stage, 'code', values.join(' ') || '等待第一個取樣點…', 'td-audio-stream'); add(stage, 'output', `1 秒單聲道原始資料：${rate.value} samples/s × ${depth.value} bits = ${+rate.value * +depth.value} bits`, 'td-answer'); caption.textContent = +rate.value <= 2 * +frequency.value ? `取樣率 ${rate.value} 不高於原頻率兩倍；本例可能出現混疊，無法可靠保留這個頻率。提高取樣率看時間細節。` : `${levels} 個振幅級別；取樣率改變橫向時間位置，位元深度改變縱向量化精細度。圖中量化採用均勻級別及四捨五入。`; }
    player = transport(frame, api, () => { if (count >= +rate.value) return false; count++; draw(); return count < +rate.value; }, reset); [rate, depth, frequency].forEach(e => e.addEventListener('change', reset)); reset();
  });
  M.rle = text => [...text].reduce((runs, char) => { const last = runs.at(-1); if (last?.char === char) last.count++; else runs.push({char, count: 1}); return runs; }, []);
  M.subquery = (values, includeEqual = false) => { const valid = values.filter(Number.isFinite), average = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null; return {average, selected: average === null ? [] : valid.filter(v => includeEqual ? v >= average : v > average)}; };
  M.mutate = function (rows, operation, key, copies, all = false) {
    const original = rows.map(r => ({...r}));
    if (operation === 'insert') return original.some(r => r.id === key) ? {error: '主鍵重複，拒絕新增', rows: original, affected: []} : {rows: [...original, {id: key, copies}], affected: [key]};
    const affected = original.filter(r => all || r.id === key).map(r => r.id);
    return {rows: operation === 'delete' ? original.filter(r => !affected.includes(r.id)) : original.map(r => affected.includes(r.id) ? {...r, copies} : r), affected};
  };
  register('data-hierarchy-explorer', '由資料庫一路放大至位元', '選一筆記錄，再選欄位及字符，觀察欄位、記錄、檔案、字元、位元組和位元之間的關係。', ['data-hierarchy'], function (host) {
    const {controls, stage, caption} = shell(host, 'td-hierarchy');
    const record = control(controls, '學生記錄', 'select', 'S01', ['S01', 'S02']), field = control(controls, '欄位', 'select', 'Name', ['Name', 'Class']), character = control(controls, '字符位置', 'number', 1); character.min = 1;
    const students = [{id:'S01', Name:'Amy', Class:'4A'}, {id:'S02', Name:'中', Class:'4B'}];
    function draw() {
      stage.replaceChildren(); const row = students.find(s => s.id === record.value), text = row[field.value], chars = [...text];
      character.max = chars.length; character.value = Math.max(1, Math.min(chars.length, Math.round(+character.value || 1))); const char = chars[+character.value - 1], bytes = [...new TextEncoder().encode(char)];
      const tree = add(stage, 'div', null, 'td-hierarchy-tree');
      [['資料庫','學校：學生檔＋成績檔'],['檔案','學生檔：S01、S02'],['記錄',`${row.id}：Name=${row.Name}，Class=${row.Class}`],['欄位',`${field.value} = ${text}`],['字符',char],['UTF-8 位元組',bytes.map(b => b.toString(16).toUpperCase().padStart(2,'0')).join(' ')]].forEach(([name,value],i) => { const branch = add(tree,'div',null,'td-hierarchy-level'); branch.style.marginLeft = `${i * 12}px`; add(branch,'b',name); add(branch,'span',value); });
      bytes.forEach((byte,i) => rowBits(stage, `Byte ${i + 1}`, M.bits(byte,8),8));
      caption.textContent = `這個字符使用 ${bytes.length} 個 UTF-8 位元組，即 ${bytes.length * 8} 位元。1 byte 固定是 8 bits；一個字符不一定只佔 1 byte。`;
    }
    [record,field,character].forEach(e => e.addEventListener('input',draw)); draw();
  });

  register('memory-address-power', '地址、字長與斷電後的內容', '地址選擇哪個位置，字長決定每格能存多少位元；把 RAM 內容存到 SSD，再切斷電源比較結果。', ['memory-address'], function (host) {
    const {controls, stage, caption} = shell(host,'td-memory'); const addressBits = control(controls,'地址位元數','select',3,[2,3,4]), word = control(controls,'每格字長（bits）','select',8,[8,16]), address = control(controls,'地址（十進制）','number',3), value = control(controls,'寫入數值','number',37);
    let powered = true, ram = Array(16).fill(null), disk = Array(16).fill(null), message = 'RAM 尚未寫入；空白不代表預設數值 0。'; address.min = 0; value.min = 0;
    function draw() { stage.replaceChildren(); const count = 2 ** +addressBits.value; address.max = count - 1; address.value = Math.max(0,Math.min(count-1,Math.round(+address.value||0))); value.max = 2 ** +word.value - 1; value.value = Math.max(0,Math.min(+value.max,Math.round(+value.value||0)));
      add(stage,'output',`${count} 個位置 × ${word.value} bits = ${count * +word.value} bits = ${count * +word.value / 8} bytes`,'td-answer');
      add(stage,'p',`地址匯流排：${M.bits(+address.value,+addressBits.value)} → 位置 ${address.value}；電源 ${powered?'ON':'OFF'}`,'td-equation');
      table(stage,['地址（二進制）','RAM（揮發性）','SSD 已儲存（非揮發性）'],Array.from({length:count},(_,i)=>[M.bits(i,+addressBits.value),ram[i]===null?'未指定':M.bits(ram[i],+word.value),disk[i]===null?'未儲存':M.bits(disk[i],+word.value)]),i=>i===+address.value?'is-current':'');caption.textContent=message;
    }
    button(controls,'寫入 RAM',()=>{if(!powered){message='先開啟電源才可寫入 RAM。';draw();return;}ram[+address.value]=+value.value;message=`已把 ${value.value} 寫入 RAM[${address.value}]，SSD 尚未改變。`;draw();});
    button(controls,'儲存至 SSD',()=>{if(!powered||ram[+address.value]===null){message='須有電源及有效 RAM 內容才可儲存。';draw();return;}disk[+address.value]=ram[+address.value];message='已複製至 SSD；只有已儲存的內容可在斷電後保留。';draw();});
    button(controls,'切換電源',()=>{powered=!powered;if(!powered)ram.fill(null);message=powered?'重新開機不會自動恢復已失去的 RAM 內容；SSD 仍保留已儲存資料。':'斷電：RAM 內容已失去，SSD 已儲存資料保留。';draw();});
    addressBits.addEventListener('input',draw);word.addEventListener('input',()=>{ram.fill(null);disk.fill(null);message='改變字長重新建立教學記憶體；這不是實際硬件重新格式化操作。';draw();});[address,value].forEach(e=>e.addEventListener('input',draw));draw();
  });

  register('os-print-service','打印要求如何經過操作系統與驅動程式','傳送一份文件，觀察權限、打印佇列、裝置命令及實際輸出；比較缺少合適驅動程式時停在哪一層。',['os-services'],function(host,api){
    const {frame,controls,stage,caption}=shell(host,'td-print');const pages=control(controls,'文件頁數','number',3),permission=control(controls,'打印權限','select','allow',[{value:'allow',label:'允許'},{value:'deny',label:'拒絕'}]),driver=control(controls,'裝置驅動程式','select','correct',[{value:'correct',label:'符合打印機型號'},{value:'wrong',label:'缺少合適版本'}]);pages.min=1;pages.max=10;let phase=0,player;
    function draw(){stage.replaceChildren();const n=Math.max(1,Math.min(10,+pages.value||1));const flow=add(stage,'div',null,'td-print-path');[['應用程式',phase?'文件 '+n+' 頁':'等待打印'],['操作系統',phase>=2?permission.value==='allow'?'權限通過；佇列 1 工作':'權限拒絕':'尚未排程'],['驅動程式',phase>=3&&permission.value==='allow'?driver.value==='correct'?'轉成裝置命令':'不能正確控制設備':'等待工作'],['打印機',phase>=4?'已輸出 '+n+' 頁':'尚未輸出']].forEach(([title,value],i)=>{const box=add(flow,'div',null,'td-print-layer '+(phase===i+1?'is-active':''));add(box,'b',title);add(box,'span',value);if(i<3)add(flow,'em','→');});const paper=add(stage,'div',null,'td-printed-pages');if(phase>=4)for(let i=1;i<=n;i++)add(paper,'span','頁 '+i);caption.textContent=phase===2&&permission.value==='deny'?'操作系統拒絕未獲授權的工作；沒有裝置輸出。':phase===3&&driver.value==='wrong'?'工作已有文件資料，但缺少合適驅動程式，無法把要求轉成設備命令。':phase===4?'打印完成。應用軟件處理文件，操作系統管理權限與佇列，驅動程式控制指定硬件。':'逐步送出文件；每一層有不同責任。模型略去實際打印協定與並行工作。';}
    function reset(){player?.stop();pages.value=Math.max(1,Math.min(10,Math.round(+pages.value||0)));phase=0;draw();}player=transport(frame,api,()=>{if(phase===4||phase===2&&permission.value==='deny'||phase===3&&driver.value==='wrong')return false;phase++;draw();return !(phase===4||phase===2&&permission.value==='deny'||phase===3&&driver.value==='wrong');},reset);[pages,permission,driver].forEach(e=>e.addEventListener('input',reset));reset();
  });

  register('lossless-run-length','無損壓縮：把連續相同值編成次數','逐段把重複字元改成「字元＋數量」，再完整解碼；沒有重複時，這個格式反而可能增加大小。',['compression'],function(host,api){
    const {frame,controls,stage,caption}=shell(host,'td-rle');const source=control(controls,'原始字元（A–Z，最多 24 個）','text','AAAAAABBBBCCAAAA');source.maxLength=24;let cursor=0,player;
    function draw(){stage.replaceChildren();const text=source.value.toUpperCase();if(!/^[A-Z]{1,24}$/.test(text)){caption.textContent='請輸入 1 至 24 個 A–Z 字元。';return;}const runs=M.rle(text),seen=runs.slice(0,cursor),raw=add(stage,'div',null,'td-rle-strip');[...text].forEach((c,i)=>{const block=add(raw,'span',c);block.style.background=`hsl(${(c.charCodeAt(0)-65)*43%360} 55% 85%)`;if(i<seen.reduce((n,r)=>n+r.count,0))block.className='is-counted';});add(stage,'div','↓ 每段用 1 byte 字元＋1 byte 次數表示','td-operation');const encoded=add(stage,'div',null,'td-rle-runs');seen.forEach(r=>add(encoded,'code',`${r.char} × ${r.count}`));add(stage,'output',`原本 ${text.length} bytes；完成後 ${runs.length*2} bytes`,'td-answer');add(stage,'p','解碼：'+seen.map(r=>r.char.repeat(r.count)).join(''),'td-equation');caption.textContent=cursor>=runs.length?`解碼與原文完全相同。${runs.length*2<text.length?'這組重複資料可縮小。':'這個格式沒有節省空間；壓縮成效取決於內容。'} 本例固定使用兩個 bytes 表示每段，未計檔頭。`:'按下一步處理下一段；原始內容會保留，沒有刪掉任何訊息。';}
    function reset(){player?.stop();cursor=0;draw();}player=transport(frame,api,()=>{const text=source.value.toUpperCase();if(!/^[A-Z]{1,24}$/.test(text)||cursor>=M.rle(text).length)return false;cursor++;draw();return cursor<M.rle(text).length;},reset);source.addEventListener('input',reset);reset();
  });

  register('entity-relationship-bridge','多對多：每條關係成為一筆選科記錄','新增一項選科，觀察連線與關聯表一起改變；兩個外鍵各可重複，但同一組合不能重複。',['er-bridge'],function(host){
    const {controls,stage,caption}=shell(host,'td-er');const student=control(controls,'StudentID','select','S1',['S1','S2','S9']),course=control(controls,'CourseID','select','ICT',['ICT','ENG','MATH']),date=control(controls,'EnrollDate','date','2026-10-16');let rows=[{sid:'S1',course:'ICT',date:'2026-09-01'},{sid:'S1',course:'ENG',date:'2026-09-01'},{sid:'S2',course:'ICT',date:'2026-09-02'}],message='每筆 ENROL 記錄代表一個學生修讀一個科目；日期屬於這項關係。';
    function draw(){stage.replaceChildren();const svg=S('svg',{viewBox:'0 0 780 300',role:'img','aria-label':'學生、選科關聯及科目的實際配對'});stage.append(svg);rows.forEach((r,i)=>{const y1=r.sid==='S1'?70:200,y2=['ICT','ENG','MATH'].indexOf(r.course)*95+45;svg.append(S('path',{d:`M180 ${y1} C300 ${y1} 480 ${y2} 600 ${y2}`,fill:'none',stroke:i===rows.length-1?'#d18a22':'#78a4b3','stroke-width':3}));});[['S1',70],['S2',200]].forEach(([id,y])=>{svg.append(S('rect',{x:15,y:y-24,width:165,height:48,rx:7,fill:'#d9edf5',stroke:'#5285a0'}));const t=S('text',{x:95,y:y+5,'text-anchor':'middle'});t.textContent='STUDENT '+id;svg.append(t);});['ICT','ENG','MATH'].forEach((id,i)=>{svg.append(S('rect',{x:600,y:i*95+20,width:165,height:48,rx:7,fill:'#e7efda',stroke:'#86a25f'}));const t=S('text',{x:682,y:i*95+49,'text-anchor':'middle'});t.textContent='COURSE '+id;svg.append(t);});add(stage,'p','STUDENT 1 ── 0..M ENROL 0..M ── 1 COURSE','td-equation');table(stage,['StudentID（PK/FK）','CourseID（PK/FK）','EnrollDate'],rows.map(r=>[r.sid,r.course,r.date]));caption.textContent=message;}
    button(controls,'新增選科',()=>{if(student.value==='S9'){message='拒絕：STUDENT 沒有 S9，違反參照完整性。';}else if(rows.some(r=>r.sid===student.value&&r.course===course.value)){message='拒絕：複合主鍵 (StudentID, CourseID) 已存在；不能重複同一選科。';}else if(!date.value){message='請輸入這次選科的日期。';}else{rows.push({sid:student.value,course:course.value,date:date.value});message=`已新增 ${student.value} → ${course.value}；只新增關係，不重複學生或科目主檔。`;}draw();});button(controls,'重設選科',()=>{rows=rows.slice(0,3);message='已回復原本三筆選科；S1 可選多科，ICT 亦可有多名學生。';draw();});[student,course,date].forEach(e=>e.addEventListener('input',()=>{message='先檢查兩個外鍵存在及整組鍵唯一，再新增選科。';draw();}));draw();
  });

  register('sql-scalar-subquery','子查詢：先算一個平均值，再逐列比較','修改分數後，內層 AVG 重新計算，外層以新的單值比較；NULL 不計入 AVG，等於平均值是否保留則由運算符決定。',['sql-subquery'],function(host,api){
    const {frame,controls,stage,caption}=shell(host,'td-subquery');const source=control(controls,'分數（逗號分隔，可用 NULL）','text','40,60,80'),operator=control(controls,'外層比較','select','>',[{value:'>',label:'嚴格大於 >'},{value:'>=',label:'大於或等於 >='}]);let cursor=0,player;
    const values=()=>source.value.split(/[,，]/).map(s=>s.trim().toUpperCase()==='NULL'?null:s.trim()===''?NaN:Number(s));
    function draw(){stage.replaceChildren();const data=values();if(data.some(v=>v!==null&&!Number.isFinite(v))||data.length>12){caption.textContent='請輸入最多 12 個數值或 NULL。';return;}const model=M.subquery(data,operator.value==='>=');add(stage,'code',`SELECT Mark FROM EXAM WHERE Mark ${operator.value} (SELECT AVG(Mark) FROM EXAM);`,'td-sql');const inner=add(stage,'div',null,'td-inner-query '+(cursor===1?'is-active':''));add(inner,'b','內層：SELECT AVG(Mark)');add(inner,'output',cursor?`回傳單值 ${model.average===null?'NULL':Number(model.average.toFixed(3))}`:'尚未求值');table(stage,['外層 Mark','比較平均值','是否保留'],data.map((v,i)=>[v===null?'NULL':v,cursor>i+1?`${v===null?'NULL':v} ${operator.value} ${model.average===null?'NULL':Number(model.average.toFixed(3))}`:'待比較',cursor>i+1?v!==null&&model.average!==null&&(operator.value==='>='?v>=model.average:v>model.average)?'✓ 保留':'× 不保留':'—']),i=>cursor===i+2?'is-current':'');if(cursor>data.length)add(stage,'output','結果：'+(model.selected.join('、')||'沒有符合記錄'),'td-answer');caption.textContent=cursor===0?'內層子查詢未執行。先按下一步，求出供外層使用的單一平均值。':model.average===null?'所有分數都是 NULL，AVG 回傳 NULL；與 NULL 作大小比較不成立。':'內層平均值只是一個中間結果；外層仍要逐筆檢查，不會自動只選最高分。';}
    function reset(){player?.stop();cursor=0;draw();}player=transport(frame,api,()=>{if(values().some(v=>v!==null&&!Number.isFinite(v))||values().length>12||cursor>values().length)return false;cursor++;draw();return cursor<=values().length;},reset);[source,operator].forEach(e=>e.addEventListener('input',reset));reset();
  });

  register('sql-row-mutation','INSERT、UPDATE、DELETE：先預覽哪些列受影響','逐列辨認 WHERE 的目標，再套用變更；比較省略條件與按主鍵處理，以及重複主鍵被拒絕的情況。',['sql-dml'],function(host,api){
    const {frame,controls,stage,caption}=shell(host,'td-mutation');const operation=control(controls,'SQL 操作','select','update',[{value:'update',label:'UPDATE 數量'},{value:'insert',label:'INSERT 記錄'},{value:'delete',label:'DELETE 記錄'}]),key=control(controls,'BookID','select','B2',['B1','B2','B3','B4']),copies=control(controls,'Copies','number',2),where=control(controls,'WHERE 條件','select','key',[{value:'key',label:'按 BookID'},{value:'all',label:'省略 WHERE'}]);copies.min=0;copies.max=100;let phase=0,player;const original=[{id:'B1',copies:3},{id:'B2',copies:5},{id:'B3',copies:8}];
    function result(){return M.mutate(original,operation.value,key.value,Math.max(0,Math.min(100,+copies.value||0)),where.value==='all');}
    function draw(){stage.replaceChildren();const model=result(),condition=where.value==='key'?` WHERE BookID = '${key.value}'`:'';add(stage,'code',operation.value==='insert'?`INSERT INTO BOOK VALUES ('${key.value}', ${copies.value});`:operation.value==='delete'?`DELETE FROM BOOK${condition};`:`UPDATE BOOK SET Copies = ${copies.value}${condition};`,'td-sql');table(stage,['BookID（PK）','Copies','處理'],(phase===2?model.rows:original).map(r=>[r.id,r.copies,phase&&model.affected.includes(r.id)?operation.value==='insert'?'新增':operation.value==='delete'?'待刪除':'修改目標':'—']),i=>phase===1&&model.affected.includes(original[i]?.id)?'is-current':'');add(stage,'output',model.error?model.error:phase===0?'先預覽條件':phase===1?`符合條件：${model.affected.join('、')||'沒有'}；共 ${model.affected.length} 筆`:`已${operation.value==='insert'?'新增':operation.value==='delete'?'刪除':'更新'} ${model.affected.length} 筆`,'td-answer');caption.textContent=model.error?'主鍵必須唯一且非空；被拒絕的 INSERT 不會改變原表。':phase===2?'這裏只修改本模型的資料副本。要操作課程實驗數據，可使用 SQL 編輯器。':operation.value!=='insert'&&where.value==='all'?'省略 WHERE 會讓整張表都成為目標；這不是只處理目前選取的 BookID。':'先確定操作、資料類型及目標，再執行；CREATE／ALTER 處理結構，這三個操作處理記錄。';}
    function reset(){player?.stop();copies.value=Math.max(0,Math.min(100,Math.round(+copies.value||0)));phase=0;draw();}player=transport(frame,api,()=>{if(phase>=2||result().error)return false;phase++;draw();return phase<2;},reset);[operation,key,copies,where].forEach(e=>e.addEventListener('input',reset));reset();
  });

  register('transitive-dependency','3NF：沿非鍵欄位找出傳遞依賴','同一班別的班主任在多筆學生資料重複；分出 CLASS 後，只需更新一處，再由外鍵取得一致結果。',['transitive-dependency'],function(host,api){
    const {frame,controls,stage,caption}=shell(host,'td-dependency');const teacher=control(controls,'5A 新班主任','text','陳老師');let phase=0,player;
    function draw(){stage.replaceChildren();const names=['敏','健','玲'],classes=['5A','5A','5B'];add(stage,'p','StudentID → ClassID → ClassTeacher','td-equation');if(phase<2)table(stage,['StudentID（PK）','Name','ClassID','ClassTeacher'],names.map((name,i)=>['S'+(i+1),name,classes[i],phase===1&&i===0?teacher.value:i<2?'李老師':'王老師']),i=>phase===1&&i<2?'is-current':'');else{table(stage,['STUDENT.StudentID（PK）','Name','ClassID（FK）'],names.map((n,i)=>['S'+(i+1),n,classes[i]]));table(stage,['CLASS.ClassID（PK）','ClassTeacher'],[['5A',phase===3?teacher.value:'李老師'],['5B','王老師']]);}caption.textContent=['學號唯一，但班主任由 ClassID 決定；同一班主任隨學生列重複。','只改一列會令同班學生顯示不同班主任，形成更新異常。','把 ClassID → ClassTeacher 移至 CLASS，STUDENT 只保存 ClassID 外鍵。','只更新 CLASS 的 5A 一筆；兩名 5A 學生透過外鍵取得相同新班主任。'][phase];if(phase===3)add(stage,'output',`S1、S2 的班主任均為 ${teacher.value}`,'td-answer');}
    function reset(){player?.stop();phase=0;draw();}player=transport(frame,api,()=>{if(phase>=3)return false;phase++;draw();return phase<3;},reset);teacher.addEventListener('input',reset);reset();
  });

  register('hardware-component-map','從實物辨認硬件部件','先辨認部件外形，再把它與處理、記憶及儲存等功能對照。',['hardware-image'],function(host){
    const figure=add(host,'figure',null,'td-hardware-figure'),img=add(figure,'img');const library=typeof location!=='undefined'&&location.pathname.includes('/animations/');img.src=(library?'../':'')+'assets/images/explainers/desktop-components.webp';img.width=1536;img.height=1024;img.loading='lazy';img.alt='桌上電腦機箱及分離展示的處理器、散熱器、RAM、SSD、電源和硬碟外形示意';
    add(figure,'figcaption','左上：CPU 與散熱器；左中：RAM；左下：M.2 SSD 與電源；右下：磁性硬碟。CPU 處理指令，RAM 暫存工作資料，SSD／硬碟長期儲存，電源供電。這是部件外形示意，並非接線圖；實際位置依型號而異。');
  });
})();
