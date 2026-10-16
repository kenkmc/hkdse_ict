(function () {
  'use strict';
  const registry = window.ICT_TOPIC_SIMS ||= [];
  const integer = (n, min, max) => Math.min(max, Math.max(min, Math.trunc(Number(n) || 0)));
  const numbers = text => String(text).split(/[，,\s]+/).filter(Boolean).map(Number).filter(Number.isFinite).slice(0, 10);
  const clone = value => JSON.parse(JSON.stringify(value));
  function flow(score, pass) {
    const yes = score >= pass;
    return ['start', 'input', 'test', yes ? 'yes' : 'no', 'end'].map((active, i, path) => ({ active, visited: path.slice(0, i + 1), yes, score, pass }));
  }
  function trace(n) {
    n = integer(n, 1, 10);
    const frames = [{ line: 0, i: null, total: null, note: '程式開始，記憶體尚未配置 total。' }];
    let total = 0;
    frames.push({ line: 1, i: null, total, note: 'total = 0：建立變數並寫入 0。' });
    for (let i = 1; i <= n; i++) {
      frames.push({ line: 2, i, total, note: `迴圈把 ${i} 寫入 i。` });
      const before = total; total += i;
      frames.push({ line: 3, i, total, before, note: `讀取 ${before} 和 ${i}，相加後把 ${total} 寫回 total。` });
    }
    frames.push({ line: 4, i: n, total, note: `迴圈完成。輸出 ${total}。` });
    return frames;
  }
  function search(values, target, binary) {
    const a = [...values]; if (binary) a.sort((a, b) => a - b);
    const frames = [{ a, lo: 0, hi: a.length - 1, at: -1, found: false, done: false, note: binary ? '二分搜尋需要已排序的資料。' : '從索引 0 開始逐項比較。' }];
    if (binary) {
      let lo = 0, hi = a.length - 1;
      while (lo <= hi) {
        const at = Math.floor((lo + hi) / 2), found = a[at] === target;
        frames.push({ a, lo, hi, at, found, done: found, note: `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${at}；${a[at]} ${found ? '=' : a[at] < target ? '<' : '>'} ${target}` });
        if (found) return frames;
        if (a[at] < target) lo = at + 1; else hi = at - 1;
      }
    } else {
      for (let at = 0; at < a.length; at++) {
        const found = a[at] === target;
        frames.push({ a, lo: at, hi: a.length - 1, at, found, done: found, note: `比較 a[${at}] = ${a[at]} 與目標 ${target}：${found ? '找到' : '不相等，繼續'}。` });
        if (found) return frames;
      }
    }
    frames.push({ a, lo: a.length, hi: -1, at: -1, found: false, done: true, note: '候選範圍已空，回傳 -1（不存在）。' });
    return frames;
  }
  function boundary(lower, upper, corrected) {
    lower = Number(lower); upper = Math.max(lower, Number(upper));
    return [...new Set([lower - 1, lower, lower + 1, upper - 1, upper, upper + 1])].sort((a, b) => a - b).map(value => ({ value, expected: value >= lower && value <= upper, actual: (corrected ? value >= lower : value > lower) && value <= upper }));
  }
  function transaction(a, b, amount, failure) {
    a = Math.max(0, Number(a)); b = Math.max(0, Number(b)); amount = Math.max(0, Number(amount));
    const frames = [{ committed: [a, b], pending: [a, b], phase: 'BEGIN', log: '建立交易，永久資料尚未改動。' }];
    if (amount > a) { frames.push({ committed: [a, b], pending: [a, b], phase: 'ROLLBACK', log: '餘額不足；驗證失敗，整筆交易取消。' }); return frames; }
    frames.push({ committed: [a, b], pending: [a - amount, b], phase: 'DEBIT', log: `暫存 A − ${amount}。此中間狀態不能提交。` });
    if (failure) { frames.push({ committed: [a, b], pending: [a, b], phase: 'ROLLBACK', log: '模擬扣款後連線失敗：撤回暫存扣款，兩戶口回復原值。' }); return frames; }
    frames.push({ committed: [a, b], pending: [a - amount, b + amount], phase: 'CREDIT', log: `暫存 B + ${amount}；兩項更新均成功。` });
    frames.push({ committed: [a - amount, b + amount], pending: [a - amount, b + amount], phase: 'COMMIT', log: '一次提交兩項更新，總額保持不變。' });
    return frames;
  }
  function relations(scores, houses, threshold) {
    const students = ['敏', '安', '健', '玲'].map((name, i) => ({ id: i + 1, name, house: houses[i] || '未分組' }));
    const marks = scores.slice(0, 5).map((score, i) => ({ sid: i + 1, score }));
    const frames = [{ students, marks, at: -1, joined: [], groups: [], note: 'INNER JOIN 只保留主鍵與外鍵相等的組合。' }];
    const joined = [];
    marks.forEach((mark, at) => {
      const student = students.find(s => s.id === mark.sid);
      if (student) joined.push({ ...student, score: mark.score });
      frames.push({ students, marks, at, joined: clone(joined), groups: [], note: student ? `${mark.sid} = ${student.id}，連接成一列。` : `${mark.sid} 沒有對應學生，INNER JOIN 排除此列。` });
    });
    const groups = [];
    joined.forEach((row, grouped) => {
      if (row.score >= threshold) {
        let group = groups.find(g => g.house === row.house);
        if (!group) { group = { house: row.house, count: 0, sum: 0, members: [] }; groups.push(group); }
        group.count++; group.sum += row.score; group.members.push(row.name);
      }
      frames.push({ students, marks, at: -1, joined: clone(joined), groups: clone(groups), grouped, note: row.score >= threshold ? `${row.name} 符合 WHERE score >= ${threshold}，放入 ${row.house} 群組。` : `${row.name} 的 ${row.score} 不符合 WHERE，不加入聚合。` });
    });
    return frames;
  }
  function normalize(courses, phone) {
    courses = courses.filter(Boolean).slice(0, 5); if (!courses.length) courses = ['ICT'];
    const flat = courses.map(course => ({ sid: 'S01', name: '敏', phone: '12345678', course }));
    const inconsistent = clone(flat); inconsistent[0].phone = phone;
    return [
      { flat, normalized: false, stage: 0, phone: '12345678', note: `同一學生的電話重複儲存 ${courses.length} 次；鍵是 (sid, course)。` },
      { flat: inconsistent, normalized: false, stage: 1, phone, note: courses.length > 1 ? '只更新第一列，其他副本仍是舊電話：更新異常。' : '目前只有一列；加入其他修讀課程後便會產生電話副本。' },
      { flat, normalized: true, stage: 2, phone: '12345678', note: '分拆 Students 與 Enrolments：電話只依賴 sid，Enrolments.sid 是外鍵。' },
      { flat, normalized: true, stage: 3, phone, note: `只更新 Students 一列。全部 ${courses.length} 個修讀項目經外鍵讀到同一新電話。` }
    ];
  }
  function nested(rows, columns) {
    rows = integer(rows, 1, 6); columns = integer(columns, 1, 6);
    const frames = [{ i: -1, j: -1, visited: [], rows, columns, note: '外迴圈控制列，內迴圈控制每列的欄。' }], visited = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < columns; j++) {
      visited.push([i, j]);
      frames.push({ i, j, visited: clone(visited), rows, columns, note: `${j === 0 && i > 0 ? '內迴圈 j 回到 0；' : ''}處理 cell[${i}][${j}]。累計 ${visited.length} / ${rows * columns} 次。` });
    }
    return frames;
  }
  function factorial(n) {
    n = integer(n, 0, 7);
    const frames = [{ stack: [], result: null, note: `呼叫 factorial(${n})。` }], stack = [];
    for (let k = n; k >= 0; k--) {
      stack.push({ n: k, waiting: k > 0, value: null });
      frames.push({ stack: clone(stack), result: null, note: k > 0 ? `push frame：n = ${k}，等待 factorial(${k - 1}) 回傳。` : '基底情況 n = 0：回傳 1。' });
    }
    let result = 1;
    while (stack.length) {
      const frame = stack.pop(); if (frame.n > 0) result *= frame.n;
      if (stack.length) stack[stack.length - 1].value = result;
      frames.push({ stack: clone(stack), result, popped: frame.n, note: `pop factorial(${frame.n})，回傳 ${result}${stack.length ? ` 給 n = ${stack[stack.length - 1].n} 的呼叫者` : '，主程式取得答案'}。` });
    }
    return frames;
  }
  function structure(actions, mode, capacity) {
    capacity = integer(capacity, 2, 6); let head = 0, size = 0; const slots = Array(capacity).fill(null);
    const frames = [{ slots: [...slots], head, size, next: 0, active: -1, output: [], note: '以 +數值 加入，以 - 移除，例如 +4,+7,-,+9。' }], output = [];
    String(actions).split(/[，,]+/).map(x => x.trim()).filter(Boolean).slice(0, 16).forEach(action => {
      let active = -1, note;
      if (action === '-') {
        if (!size) note = 'Underflow：結構為空，不能移除。';
        else { active = mode === 'queue' ? head : size - 1; const removed = slots[active]; output.push(removed); slots[active] = null; size--; if (mode === 'queue') head = (head + 1) % capacity; note = `${mode === 'queue' ? 'dequeue：從 head' : 'pop：從 top'} 移除 ${removed}。`; }
      } else if (/^\+.+/.test(action)) {
        if (size === capacity) note = 'Overflow：容量已滿，不能加入。';
        else { active = mode === 'queue' ? (head + size) % capacity : size; slots[active] = action.slice(1).slice(0, 12); size++; note = `${mode === 'queue' ? 'enqueue' : 'push'} ${slots[active]} 到索引 ${active}。`; }
      } else note = `忽略無效操作 ${action}；請使用 +數值 或 -。`;
      frames.push({ slots: [...slots], head, size, next: mode === 'queue' ? (head + size) % capacity : size, active, output: [...output], note });
    });
    return frames;
  }
  function sort(values, mode) {
    const items = values.map((value, id) => ({ value, id }));
    const frames = [{ items: clone(items), active: [], sorted: [], note: '每條柱保留自己的編號；交換時移動整項資料。' }];
    const record = (active, sorted, note) => frames.push({ items: clone(items), active, sorted, note });
    const swap = (i, j) => { [items[i], items[j]] = [items[j], items[i]]; };
    const n = items.length;
    if (mode === 'selection') {
      for (let i = 0; i < n - 1; i++) {
        let min = i;
        for (let j = i + 1; j < n; j++) { if (items[j].value < items[min].value) min = j; record([min, j], [...Array(i).keys()], `未排序部分的最小值候選：${items[min].value}。`); }
        swap(i, min); record([i, min], [...Array(i + 1).keys()], `把最小值 ${items[i].value} 放到索引 ${i}。`);
      }
    } else if (mode === 'insertion') {
      for (let i = 1; i < n; i++) {
        let j = i; record([i], [...Array(i).keys()], `取出 ${items[i].value}，向左尋找插入位置。`);
        while (j > 0 && items[j - 1].value > items[j].value) { swap(j - 1, j); j--; record([j, j + 1], [], `較大的 ${items[j + 1].value} 右移，${items[j].value} 向左插入。`); }
        record([j], [...Array(i + 1).keys()], `前 ${i + 1} 項已排序。`);
      }
    } else {
      for (let end = n - 1; end > 0; end--) {
        let changed = false;
        for (let j = 0; j < end; j++) {
          record([j, j + 1], [...Array(n - end - 1)].map((_, k) => end + 1 + k), `比較相鄰 ${items[j].value} 和 ${items[j + 1].value}。`);
          if (items[j].value > items[j + 1].value) { swap(j, j + 1); changed = true; record([j, j + 1], [], '左大右小，交換兩項。'); }
        }
        if (!changed) break;
      }
    }
    record([], [...Array(n).keys()], '完成：數列由小至大。'); return frames;
  }
  function fileWrite(records, operation, target, value) {
    target = integer(target, 1, Math.max(1, records.length));
    const output = [], frames = [{ records, output: [], read: -1, done: false, note: '原檔案保持不變；把處理後的記錄寫入暫存檔。' }];
    records.forEach((record, i) => {
      if (!(operation === 'delete' && i === target - 1)) output.push(operation === 'edit' && i === target - 1 ? value : record);
      frames.push({ records, output: [...output], read: i, done: false, note: i === target - 1 && operation !== 'append' ? operation === 'delete' ? `讀到第 ${i + 1} 筆，略過寫入（刪除）。` : `讀到第 ${i + 1} 筆，以「${value}」取代後寫入。` : `把第 ${i + 1} 筆「${record}」複製到暫存檔。` });
    });
    if (operation === 'append') { output.push(value); frames.push({ records, output: [...output], read: records.length, done: false, note: `到達 EOF，把新記錄「${value}」附加到末端。` }); }
    frames.push({ records, output: [...output], read: -1, done: true, note: '關閉檔案，完成後以暫存檔取代原檔。' }); return frames;
  }
  function quantize(text, places, mode) {
    const match = String(text).trim().match(/^([+-]?)(\d+)(?:\.(\d*))?$/);
    if (!match || match[2].length > 15 || (match[3] || '').length > 15) return { error: '請輸入一般十進制數字，整數及小數各最多 15 位。' };
    places = integer(places, 0, 6);
    const negative = match[1] === '-', whole = match[2].replace(/^0+(?=\d)/, ''), fraction = match[3] || '';
    const kept = fraction.padEnd(places, '0').slice(0, places), discarded = fraction.slice(places);
    const increment = mode === 'round' && Number(discarded[0] || '0') >= 5;
    let magnitude = BigInt(whole + kept) + (increment ? 1n : 0n);
    const digits = magnitude.toString().padStart(places + 1, '0');
    const result = (negative && magnitude !== 0n ? '-' : '') + (places ? digits.slice(0, -places) + '.' + digits.slice(-places) : digits);
    return { whole, fraction, places, kept, discarded, increment, result, negative, mode };
  }
  window.ICTAlgorithmModels = { numbers, flow, trace, search, boundary, transaction, relations, normalize, nested, factorial, structure, sort, fileWrite, quantize };

  const el = (tag, text, className) => { const e = document.createElement(tag); if (text !== undefined && text !== null) e.textContent = String(text); if (className) e.className = className; return e; };
  const append = (parent, tag, text, cls) => { const e = el(tag, text, cls); parent.append(e); return e; };
  function input(parent, label, value, type, options) {
    const wrapper = append(parent, 'label', null, 'ta-field'); append(wrapper, 'span', label);
    const control = append(wrapper, options ? 'select' : 'input');
    if (options) options.forEach(([value, label]) => { const option = append(control, 'option', label); option.value = value; });
    else control.type = type || 'text';
    control.value = value; return control;
  }
  function table(parent, headers, rows, active) {
    const wrap = append(parent, 'div', null, 'ta-table-scroll'), t = append(wrap, 'table', null, 'ta-table');
    const hr = append(append(t, 'thead'), 'tr'); headers.forEach(h => append(hr, 'th', h));
    const body = append(t, 'tbody'); rows.forEach((row, i) => { const tr = append(body, 'tr', null, i === active ? 'ta-current' : ''); row.forEach(value => append(tr, 'td', value)); }); return t;
  }
  function svg(parent, width, height) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', `0 0 ${width} ${height}`); s.setAttribute('role', 'img'); parent.append(s); return s; }
  function shape(parent, tag, attrs, text) { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v)); if (text) e.textContent = text; parent.append(e); return e; }
  function lab(host, api, setup, model, render) {
    host.classList.add('ta-lab'); const controls = append(host, 'div', null, 'ta-inputs'), values = setup(controls);
    const stage = append(host, 'div', null, 'ta-stage'), note = append(host, 'p', '', 'ta-note'); note.setAttribute('aria-live', 'polite');
    let frames = [], index = 0, playback;
    const draw = () => { stage.replaceChildren(); const frame = frames[index]; render(stage, frame, index, values); note.textContent = frame.note || frame.log || ''; playback?.finish(index >= frames.length - 1); };
    const reset = () => { playback?.stop(); frames = model(values); index = 0; draw(); };
    playback = api.playback(host, { step() { if (index < frames.length - 1) index++; draw(); }, reset, period: 850 });
    Object.values(values).forEach(c => { if (c?.addEventListener) c.addEventListener('input', reset); });
    api.onCleanup(() => playback.stop()); reset();
  }
  registry.push({
    id: 'decision-flow', title: '沿着流程圖作決定', description: '改變分數和合格線，沿真正的判斷分支追蹤執行路徑。菱形只選擇一條出口。', topics: ['flowchart'],
    mount(host, api) { lab(host, api, p => ({ score: input(p, '輸入分數', 48, 'number'), pass: input(p, '合格線', 50, 'number') }), v => flow(Number(v.score.value), Number(v.pass.value)), (p, f) => {
      const s = svg(p, 660, 455); s.setAttribute('aria-label', `流程圖目前位置 ${f.active}，分數 ${f.score}，合格線 ${f.pass}`);
      const points = { start: [330, 34], input: [330, 107], test: [330, 210], yes: [145, 321], no: [515, 321], end: [330, 412] };
      const edge = (from, to, path, label, x, y) => { shape(s, 'path', { d: path, class: f.visited.includes(to) && f.visited.includes(from) ? 'ta-flow-edge ta-lit' : 'ta-flow-edge' }); if (label) shape(s, 'text', { x, y, class: 'ta-svg-label' }, label); };
      edge('start', 'input', 'M330 55V80'); edge('input', 'test', 'M330 134V161');
      edge('test', 'yes', 'M250 210H145V292', '是', 189, 200); edge('test', 'no', 'M410 210H515V292', '否', 461, 200);
      edge('yes', 'end', 'M145 350V412H270'); edge('no', 'end', 'M515 350V412H390');
      const labels = { start: '開始', input: `讀入 score = ${f.score}`, test: `score ≥ ${f.pass}？`, yes: '輸出「合格」', no: '輸出「未合格」', end: '結束' };
      Object.entries(points).forEach(([id, [x, y]]) => {
        const g = shape(s, 'g', { class: `ta-flow-node ${f.visited.includes(id) ? 'ta-visited' : ''} ${f.active === id ? 'ta-current' : ''}` });
        if (id === 'test') shape(g, 'polygon', { points: `${x},${y - 49} ${x + 80},${y} ${x},${y + 49} ${x - 80},${y}` });
        else if (id === 'input') shape(g, 'polygon', { points: `${x - 110},${y - 27} ${x + 125},${y - 27} ${x + 110},${y + 27} ${x - 125},${y + 27}` });
        else shape(g, 'rect', { x: x - (id === 'start' || id === 'end' ? 60 : 100), y: y - 27, width: id === 'start' || id === 'end' ? 120 : 200, height: 54, rx: id === 'start' || id === 'end' ? 27 : 4 });
        shape(g, 'text', { x, y: y + 5, 'text-anchor': 'middle' }, `${f.active === id ? '▶ ' : ''}${labels[id]}`);
      });
      append(p, 'p', `判斷結果：${f.score} ≥ ${f.pass} 是 ${f.yes ? 'True' : 'False'}。`, 'ta-caption');
      f.note = f.active === 'test' ? `檢查 ${f.score} ≥ ${f.pass}；下一步只會沿「${f.yes ? '是' : '否'}」分支。` : f.active === 'end' ? `已輸出「${f.yes ? '合格' : '未合格'}」，流程結束。` : `目前執行：${labels[f.active]}。`;
    }); }
  });
  registry.push({
    id: 'python-registers', title: '程式行與變數記憶體', description: '逐行執行加總程式，看見讀取、運算和寫回變數的次序，而不是只看最後答案。', topics: ['trace-machine', 'python-memory'],
    mount(host, api) { lab(host, api, p => ({ n: input(p, 'n（1–10）', 4, 'number') }), v => trace(v.n.value), (p, f, i, v) => {
      const layout = append(p, 'div', null, 'ta-machine'); const code = append(layout, 'ol', null, 'ta-code');
      ['# 計算 1 + 2 + … + n', 'total = 0', `for i in range(1, ${integer(v.n.value, 1, 10)} + 1):`, '    total = total + i', 'print(total)'].forEach((line, index) => append(code, 'li', `${f.line === index ? '▶ ' : '  '}${line}`, f.line === index ? 'ta-current' : ''));
      const memory = append(layout, 'div', null, 'ta-memory'); append(memory, 'h4', '變數記憶體');
      ['i', 'total'].forEach(name => { const cell = append(memory, 'div', null, 'ta-register'); append(cell, 'span', name); append(cell, 'strong', f[name] ?? '未配置'); });
      if (f.line === 3) { const alu = append(p, 'div', null, 'ta-alu'); append(alu, 'span', f.before); append(alu, 'b', '+'); append(alu, 'span', f.i); append(alu, 'b', '→ 寫回 total'); append(alu, 'strong', f.total); }
      if (f.line === 4) append(p, 'pre', `終端機輸出 > ${f.total}`, 'ta-terminal');
    }); }
  });
  registry.push({
    id: 'array-search', title: '搜尋器走過陣列', description: '線性搜尋逐項掃描；二分搜尋持續收窄候選區間。輸入自己的數列和目標，觀察搜尋失敗的情況。', topics: ['linearsearch'],
    mount(host, api) { lab(host, api, p => ({ a: input(p, '數列（逗號分隔，最多 10 項）', '4,9,15,23,31,42,56'), target: input(p, '目標', 31, 'number'), mode: input(p, '搜尋方法', 'binary', null, [['linear', '線性搜尋'], ['binary', '二分搜尋（先排序）']]) }), v => search(numbers(v.a.value), Number(v.target.value), v.mode.value === 'binary'), (p, f, i, v) => {
      append(p, 'p', v.mode.value === 'binary' ? `候選範圍 [${f.lo}, ${f.hi}]；灰色項目已排除` : '掃描指標由左至右；索引從 0 開始', 'ta-caption');
      const tape = append(p, 'div', null, 'ta-array');
      f.a.forEach((value, index) => { const slot = append(tape, 'div', null, `ta-slot ${index < f.lo || index > f.hi ? 'ta-excluded' : ''} ${index === f.at ? 'ta-current' : ''} ${index === f.at && f.found ? 'ta-found' : ''}`); append(slot, 'small', `[${index}]`); append(slot, 'strong', value); append(slot, 'span', index === f.at ? f.found ? '✓ 找到' : '▲ 比較' : index === f.lo ? 'lo' : index === f.hi ? 'hi' : '　'); });
      if (!f.a.length) append(tape, 'p', '空陣列');
      const count = Math.max(0, i - (f.done && !f.found ? 1 : 0)); append(p, 'div', `已比較 ${count} 次　${f.done ? `回傳 ${f.found ? f.at : -1}` : '尚未回傳'}`, 'ta-terminal');
    }); }
  });
  registry.push({
    id: 'boundary-line', title: '用邊界測試找出差一錯誤', description: '規格要求包含下限和上限。把測試值放到數線上，比較程式結果與預期，修正 > 與 ≥ 的差別。', topics: ['boundary-debugger'],
    mount(host, api) { lab(host, api, p => ({ lower: input(p, '包含的下限', 12, 'number'), upper: input(p, '包含的上限', 18, 'number'), mode: input(p, '程式條件', 'bug', null, [['bug', 'x > 下限 and x <= 上限'], ['fix', 'x >= 下限 and x <= 上限']]) }), v => {
      const cases = boundary(v.lower.value, v.upper.value, v.mode.value === 'fix'); return cases.map((current, at) => ({ cases, current, at, note: current.actual === current.expected ? `x = ${current.value}：實際與預期相符。` : `找到錯誤！x = ${current.value} 應被接受，程式卻拒絕。下邊界應使用 >=。` }));
    }, (p, f, i, v) => {
      const lower = Number(v.lower.value), upper = Math.max(lower, Number(v.upper.value));
      const s = svg(p, 720, 125); s.setAttribute('aria-label', `邊界數線，測試值 ${f.current.value}`);
      shape(s, 'line', { x1: 40, y1: 65, x2: 680, y2: 65, class: 'ta-axis' });
      const x = n => 70 + (n - lower + 1) / (upper - lower + 2 || 1) * 580;
      shape(s, 'line', { x1: x(lower), y1: 65, x2: x(upper), y2: 65, class: 'ta-range' });
      [lower, upper].forEach(value => { shape(s, 'circle', { cx: x(value), cy: 65, r: 7, class: 'ta-endpoint' }); shape(s, 'text', { x: x(value), y: 99, 'text-anchor': 'middle' }, String(value)); });
      shape(s, 'path', { d: `M${x(f.current.value) - 8} 19L${x(f.current.value) + 8} 19L${x(f.current.value)} 34Z`, class: 'ta-pointer' });
      shape(s, 'text', { x: x(f.current.value), y: 13, 'text-anchor': 'middle' }, `x = ${f.current.value}`);
      table(p, ['測試值 x', '預期', '實際', '結果'], f.cases.map(c => [c.value, c.expected ? '接受' : '拒絕', c.actual ? '接受' : '拒絕', c.expected === c.actual ? '✓ 相符' : '✗ 差一錯誤']), f.at);
      append(p, 'code', `return x ${v.mode.value === 'fix' ? '>=' : '>'} ${lower} and x <= ${upper}`, 'ta-condition');
    }); }
  });
  registry.push({
    id: 'atomic-transfer', title: '銀行轉帳的提交與回滾', description: '觀察交易工作區和永久資料分別如何改變。模擬扣款後故障，驗證原子性及總額不變。', topics: ['transaction'],
    mount(host, api) { lab(host, api, p => ({ a: input(p, 'A 原有餘額', 700, 'number'), b: input(p, 'B 原有餘額', 300, 'number'), amount: input(p, 'A 轉給 B 的金額', 200, 'number'), fail: input(p, '執行情況', 'no', null, [['no', '正常完成'], ['yes', '扣款後發生故障']]) }), v => transaction(v.a.value, v.b.value, v.amount.value, v.fail.value === 'yes'), (p, f) => {
      const badge = append(p, 'div', f.phase, `ta-db-phase ${f.phase === 'ROLLBACK' ? 'ta-error' : ''}`);
      const banks = append(p, 'div', null, 'ta-bank-layout');
      [['永久資料（其他交易讀取）', f.committed, 'ta-disk'], ['交易工作區（未提交）', f.pending, 'ta-buffer']].forEach(([title, balances, cls]) => {
        const panel = append(banks, 'section', null, cls); append(panel, 'h4', title);
        balances.forEach((balance, i) => { const account = append(panel, 'div', null, 'ta-account'); append(account, 'b', i === 0 ? 'A' : 'B'); const meter = append(account, 'div', null, 'ta-balance-track'); const bar = append(meter, 'span'); bar.style.width = `${100 * balance / Math.max(1, ...f.committed, ...f.pending)}%`; append(account, 'strong', balance.toFixed(2)); });
        append(panel, 'p', `總額：${(balances[0] + balances[1]).toFixed(2)}`);
      });
      append(p, 'p', f.phase === 'COMMIT' ? '✓ A 與 B 同時更新至永久資料' : f.phase === 'ROLLBACK' ? '↶ 永久資料維持轉帳前狀態' : '鎖定中的暫存更新尚未提交', 'ta-ledger');
    }); }
  });
  registry.push({
    id: 'join-and-group', title: '資料列怎樣 JOIN 和 GROUP BY', description: '用相等的鍵值連接資料列，再經 WHERE 篩選到不同分組，逐步計算 COUNT 和 AVG。第五個分數可製造沒有對應學生的記錄。', topics: ['sql-group', 'join'],
    mount(host, api) { lab(host, api, p => ({ scores: input(p, '分數（按學生 1–5）', '76,58,84,40,91'), houses: input(p, '學生 1–4 的社別', '紅,藍,紅,藍'), threshold: input(p, 'WHERE score >=', 50, 'number') }), v => relations(numbers(v.scores.value), v.houses.value.split(/[，,]/).map(s => s.trim()), Number(v.threshold.value)), (p, f) => {
      const top = append(p, 'div', null, 'ta-join');
      const left = append(top, 'section'); append(left, 'h4', 'Students（id 是 PK）'); table(left, ['id', 'name', 'house'], f.students.map(s => [s.id, s.name, s.house]), f.at < 4 ? f.at : -1);
      const link = append(top, 'div', null, 'ta-join-link'); const s = svg(link, 130, 225); s.setAttribute('aria-label', '相同 id 的資料列連接');
      f.marks.slice(0, Math.min(f.at + 1, 4)).forEach((mark, i) => { shape(s, 'path', { d: `M5 ${55 + i * 37} C48 ${55 + i * 37} 82 ${55 + i * 37} 125 ${55 + i * 37}`, class: `ta-key-line ${i === f.at ? 'ta-lit' : ''}` }); shape(s, 'text', { x: 65, y: 48 + i * 37, 'text-anchor': 'middle' }, `${mark.sid} = ${mark.sid}`); });
      const right = append(top, 'section'); append(right, 'h4', 'Marks（sid 關聯 id）'); table(right, ['sid', 'score'], f.marks.map(s => [s.sid, s.score]), f.at);
      if (f.marks.length > 4) append(p, 'p', '此示例未啟用外鍵限制，故容許 sid = 5。若啟用外鍵限制，插入這筆記錄時便應被拒絕。', 'ta-caption');
      append(p, 'code', 'SELECT house, COUNT(*), AVG(score) FROM Students JOIN Marks ON id = sid WHERE score >= ? GROUP BY house', 'ta-query');
      table(p, ['連接結果 id', 'name', 'house', 'score'], f.joined.map(r => [r.id, r.name, r.house, r.score]), f.grouped);
      const buckets = append(p, 'div', null, 'ta-buckets');
      f.groups.forEach(g => { const bucket = append(buckets, 'section', null, 'ta-bucket'); append(bucket, 'h4', `house = ${g.house}`); const members = append(bucket, 'div', null, 'ta-members'); g.members.forEach(name => append(members, 'span', name)); append(bucket, 'strong', `COUNT = ${g.count}　SUM = ${g.sum}`); append(bucket, 'div', `AVG = ${g.sum} ÷ ${g.count} = ${(g.sum / g.count).toFixed(2)}`); });
      if (!f.groups.length) append(buckets, 'p', f.grouped !== undefined ? '尚未有符合篩選條件的群組。' : 'JOIN 後將按社別送入分組桶。');
    }); }
  });
  registry.push({
    id: 'key-decomposition', title: '由更新異常到主鍵、外鍵', description: '重複的電話資料只改一列會怎樣？把 Students 與 Enrolments 分拆，沿外鍵看到一次更新如何套用到所有修讀記錄。', topics: ['keys-index', 'normalization'],
    mount(host, api) { lab(host, api, p => ({ courses: input(p, '同一學生修讀科目（最多 5 科）', 'ICT,Maths,English'), phone: input(p, '要改成的新電話', '87654321') }), v => normalize(v.courses.value.split(/[，,]/).map(s => s.trim()), v.phone.value.slice(0, 20)), (p, f) => {
      if (!f.normalized) {
        append(p, 'h4', '未分拆：學生修讀表');
        table(p, ['sid（複合 PK）', 'name', 'phone（重複）', 'course（複合 PK）'], f.flat.map(r => [r.sid, r.name, r.phone, r.course]), f.stage === 1 ? 0 : -1);
        const copies = append(p, 'div', null, 'ta-duplicate-phone'); f.flat.forEach(r => append(copies, 'span', `☎ ${r.phone}`, r.phone === f.phone && f.stage === 1 ? 'ta-new-phone' : ''));
        append(p, 'p', '函數依賴：sid → name, phone；(sid, course) → 修讀記錄', 'ta-dependency');
      } else {
        const layout = append(p, 'div', null, 'ta-key-layout'); const students = append(layout, 'section'); append(students, 'h4', 'Students'); table(students, ['sid（PK）', 'name', 'phone'], [['S01', '敏', f.phone]], f.stage === 3 ? 0 : -1);
        const links = append(layout, 'div', null, 'ta-fk-links'), s = svg(links, 150, Math.max(170, f.flat.length * 46)); s.setAttribute('aria-label', '一個主鍵連接多個外鍵');
        f.flat.forEach((r, i) => { shape(s, 'path', { d: `M5 65C70 65 80 ${40 + i * 44} 145 ${40 + i * 44}`, class: 'ta-key-line ta-lit' }); });
        shape(s, 'text', { x: 65, y: 22, 'text-anchor': 'middle' }, '1 → 多');
        const enrol = append(layout, 'section'); append(enrol, 'h4', 'Enrolments'); table(enrol, ['sid（PK 部分、FK）', 'course（PK 部分）'], f.flat.map(r => [r.sid, r.course]));
        append(p, 'div', `所有修讀記錄查詢到的電話：${f.phone}`, 'ta-ledger');
      }
    }); }
  });
  registry.push({
    id: 'nested-grid', title: '雙重迴圈逐格走訪', description: 'i 控制列，j 控制欄。看清楚每次進入新一列時 j 為何必須重設，以及總執行次數 rows × columns。', topics: ['nestedloops'],
    mount(host, api) { lab(host, api, p => ({ rows: input(p, '列數（1–6）', 3, 'number'), columns: input(p, '欄數（1–6）', 4, 'number') }), v => nested(v.rows.value, v.columns.value), (p, f) => {
      const layout = append(p, 'div', null, 'ta-machine'); const code = append(layout, 'pre', `for i in range(${f.rows}):\n    for j in range(${f.columns}):\n        visit(i, j)`, 'ta-code');
      const matrix = append(layout, 'div', null, 'ta-matrix'); matrix.style.gridTemplateColumns = `38px repeat(${f.columns}, minmax(35px,1fr))`;
      append(matrix, 'span', 'i ↓ / j →', 'ta-matrix-corner'); for (let j = 0; j < f.columns; j++) append(matrix, 'b', j, j === f.j ? 'ta-column-pointer' : '');
      for (let i = 0; i < f.rows; i++) { append(matrix, 'b', `${i === f.i ? '▶ ' : ''}${i}`, i === f.i ? 'ta-row-pointer' : ''); for (let j = 0; j < f.columns; j++) { const at = f.visited.findIndex(v => v[0] === i && v[1] === j); append(matrix, 'div', at < 0 ? '·' : at + 1, `ta-matrix-cell ${at >= 0 ? 'ta-visited' : ''} ${f.i === i && f.j === j ? 'ta-current' : ''}`); } }
      append(p, 'div', `i = ${f.i < 0 ? '—' : f.i}　j = ${f.j < 0 ? '—' : f.j}　執行次數 = ${f.visited.length} / ${f.rows * f.columns}`, 'ta-terminal');
    }); }
  });
  registry.push({
    id: 'recursive-frames', title: '遞歸呼叫堆疊', description: '每次遞歸都建立自己的 n 和返回位置。到達基底情況後逐層 pop，乘法才逐一完成。', topics: ['callstack'],
    mount(host, api) { lab(host, api, p => ({ n: input(p, 'factorial(n)，n = 0–7', 4, 'number') }), v => factorial(v.n.value), (p, f, i, v) => {
      const layout = append(p, 'div', null, 'ta-recursion'); const program = append(layout, 'div'); append(program, 'pre', `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nanswer = factorial(${integer(v.n.value, 0, 7)})`, 'ta-code');
      append(program, 'p', f.result === null ? '回傳通道：尚未有結果' : `↶ 回傳通道：${f.result}`, 'ta-return-value');
      const stack = append(layout, 'div', null, 'ta-callstack'); append(stack, 'h4', 'Stack top ↓');
      [...f.stack].reverse().forEach((frame, i) => { const card = append(stack, 'div', null, `ta-stack-frame ${i === 0 ? 'ta-current' : ''}`); append(card, 'strong', `factorial(${frame.n})`); append(card, 'span', `本層 n = ${frame.n}`); append(card, 'code', frame.n === 0 ? 'return 1（基底）' : `${frame.n} × ${frame.value ?? '等待子呼叫'}`); });
      if (!f.stack.length) append(stack, 'p', f.result === null ? '堆疊為空' : `主程式收到 ${f.result}`, 'ta-stack-empty');
      append(stack, 'div', '主程式', 'ta-stack-base');
    }); }
  });
  registry.push({
    id: 'stack-queue-slots', title: '堆疊與循環隊列的儲存格', description: '自己編排加入和移除操作，看指標及實際儲存位置改變。循環隊列到達陣列末端後會繞回開頭。', topics: ['datastruct'],
    mount(host, api) { lab(host, api, p => ({ mode: input(p, '資料結構', 'queue', null, [['stack', 'Stack：後進先出'], ['queue', 'Circular queue：先進先出']]), cap: input(p, '容量（2–6）', 4, 'number'), actions: input(p, '操作：+值 表示加入，- 表示移除', '+4,+7,+2,-,-,+9,+8,+6,-') }), v => structure(v.actions.value, v.mode.value, v.cap.value), (p, f, i, v) => {
      const queue = v.mode.value === 'queue'; append(p, 'p', queue ? 'head 指向下一個移除位置；tail 指向下一個加入位置。' : 'top 指向最後加入的項目。', 'ta-caption');
      const store = append(p, 'div', null, queue ? 'ta-queue' : 'ta-stack-store');
      f.slots.forEach((value, at) => { const cell = append(store, 'div', null, `ta-slot ${at === f.active ? 'ta-current' : ''} ${value !== null ? 'ta-occupied' : ''}`); append(cell, 'small', `[${at}]`); append(cell, 'strong', value ?? '空'); append(cell, 'span', queue ? `${at === f.head ? '▲ head' : ''}${at === f.next ? ' ▼ tail' : ''}` : at === f.size - 1 ? '← top' : '　'); });
      if (queue) append(p, 'div', `↶ 下一個索引 = (目前索引 + 1) mod ${f.slots.length}`, 'ta-wrap-arrow');
      else append(p, 'p', `top = ${f.size - 1}（−1 表示空）`, 'ta-caption');
      append(p, 'div', `size = ${f.size} / ${f.slots.length}　已移除：${f.output.length ? f.output.join(' → ') : '—'}`, 'ta-terminal');
    }); }
  });
  registry.push({
    id: 'sorting-bars', title: '排序時資料怎樣移動', description: '追蹤每項資料自己的編號，觀察相鄰交換、向左插入與選擇最小值的不同移動方式。', topics: ['sorting'],
    mount(host, api) {
      let previous = new Map(), animations = [];
      const cancelAnimations = () => { animations.forEach(a => a.cancel()); animations = []; };
      api.onCleanup(cancelAnimations);
      lab(host, api, p => ({ a: input(p, '待排序數列（最多 10 項）', '42,17,31,8,25'), mode: input(p, '排序方法', 'bubble', null, [['bubble', 'Bubble sort 冒泡排序'], ['insertion', 'Insertion sort 插入排序'], ['selection', 'Selection sort 選擇排序']]) }), v => { cancelAnimations(); previous = new Map(); return sort(numbers(v.a.value), v.mode.value); }, (p, f) => {
        cancelAnimations();
        const field = append(p, 'div', null, 'ta-sort-field'); const max = Math.max(1, ...f.items.map(x => Math.abs(x.value))), count = f.items.length;
        f.items.forEach((item, at) => {
          const bar = append(field, 'div', null, `ta-sort-bar ${f.active.includes(at) ? 'ta-current' : ''} ${f.sorted.includes(at) ? 'ta-sorted' : ''}`);
          const height = 32 + Math.abs(item.value) / max * 140;
          bar.style.width = `${84 / Math.max(1, count)}%`; bar.style.left = `${2 + at * 96 / Math.max(1, count)}%`; bar.style.height = `${height}px`;
          append(bar, 'strong', item.value); append(bar, 'small', `#${item.id + 1}`);
          const from = previous.get(item.id);
          if (from !== undefined && from !== at && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && bar.animate) {
            const width = field.clientWidth || 600, shift = (from - at) * width * .96 / Math.max(1, count);
            animations.push(bar.animate([{ transform: `translateX(${shift}px)` }, { transform: 'translateX(0)' }], { duration: 430, easing: 'ease-in-out' }));
          }
        });
        previous = new Map(f.items.map((item, at) => [item.id, at]));
        const indices = append(p, 'div', null, 'ta-sort-indices'); f.items.forEach((_, at) => append(indices, 'span', `[${at}]`));
        append(p, 'p', `目前數列：[${f.items.map(x => x.value).join(', ')}]`, 'ta-caption');
        if (!f.items.length) append(p, 'p', '請輸入數值。');
      });
    }
  });
  registry.push({
    id: 'sequential-file', title: '順序檔案更新輸送帶', description: '順序讀取原檔記錄，決定複製、修改或略過，寫入暫存檔。顯示讀取位置、EOF 和最後取代原檔的時機。', topics: ['filewrite'],
    mount(host, api) { lab(host, api, p => ({ records: input(p, '原檔記錄（逗號分隔，最多 8 筆）', 'Amy:70,Ben:55,Cam:81,Don:42'), operation: input(p, '檔案操作', 'edit', null, [['edit', '修改一筆'], ['delete', '刪除一筆'], ['append', '附加新記錄']]), target: input(p, '目標記錄編號（由 1 開始）', 2, 'number'), value: input(p, '修改內容／附加內容', 'Ben:65') }), v => fileWrite(v.records.value.split(/[，,]/).map(s => s.trim()).filter(Boolean).slice(0, 8), v.operation.value, v.target.value, v.value.value.slice(0, 30)), (p, f) => {
      const pipeline = append(p, 'div', null, 'ta-file-pipeline');
      const source = append(pipeline, 'section', null, 'ta-file'); append(source, 'h4', f.done ? '舊原檔（已關閉）' : 'data.txt（讀取）');
      f.records.forEach((record, at) => append(source, 'div', `${at + 1}　${record}${at === f.read ? ' ◀ read' : ''}`, `ta-record ${at === f.read ? 'ta-current' : ''}`)); append(source, 'div', 'EOF', f.read === f.records.length ? 'ta-current ta-eof' : 'ta-eof');
      const head = append(pipeline, 'div', null, 'ta-file-head'); append(head, 'b', f.done ? '✓ close / replace' : 'read → process → write'); append(head, 'span', f.done ? '↶ rename temp.txt → data.txt' : '→');
      const target = append(pipeline, 'section', null, 'ta-file ta-temp-file'); append(target, 'h4', f.done ? 'data.txt（新原檔）' : 'temp.txt（寫入）'); f.output.forEach((record, at) => append(target, 'div', `${at + 1}　${record}`, `ta-record ${!f.done && at === f.output.length - 1 ? 'ta-written' : ''}`)); if (!f.output.length) append(target, 'p', '尚無記錄');
      append(p, 'p', f.done ? `完成後共有 ${f.output.length} 筆記錄。` : '處理途中只改動暫存檔；原檔仍完整。', 'ta-caption');
    }); }
  });
  registry.push({
    id: 'decimal-precision', title: '保留位數、截斷和進位', description: '把數字拆成各位值，觀察被捨棄的第一位怎樣決定進位。可測試 9.995 的連續進位及負數的截斷。', topics: ['numericprecision'],
    mount(host, api) { lab(host, api, p => ({ value: input(p, '十進制數值', '9.995'), places: input(p, '小數位數（0–6）', 2, 'number'), mode: input(p, '處理方法', 'round', null, [['round', '四捨五入（中點遠離零）'], ['truncate', '截斷（朝零）']]) }), v => {
      const result = quantize(v.value.value, v.places.value, v.mode.value);
      if (result.error) return [{ ...result, phase: 0, note: result.error }];
      return [
        { ...result, phase: 0, note: '先分辨整數位與小數位，每個位置代表不同的十進位權重。' },
        { ...result, phase: 1, note: `保留 ${result.places} 位小數；${result.discarded ? `捨棄部分是 ${result.discarded}` : '沒有超出精度的數字'}。` },
        { ...result, phase: 2, note: result.mode === 'truncate' ? '截斷直接移除多餘小數，不檢查下一位。' : result.increment ? `第一個捨棄位是 ${result.discarded[0]}（≥ 5），最末保留位加 1，需要時向左進位。` : `第一個捨棄位是 ${result.discarded[0] || 0}（< 5），不進位。` },
        { ...result, phase: 3, note: `結果：${result.result}。${result.negative ? '符號保留；中點四捨五入遠離零，截斷則朝零。' : ''}` }
      ];
    }, (p, f) => {
      if (f.error) { append(p, 'p', f.error, 'ta-error'); return; }
      const digits = append(p, 'div', null, 'ta-place-values'); if (f.negative) append(digits, 'b', '−', 'ta-sign');
      const all = [...f.whole.split('').map((digit, i) => ({ digit, power: f.whole.length - i - 1, discard: false })), ...f.fraction.padEnd(f.places, '0').split('').map((digit, i) => ({ digit, power: -i - 1, discard: i >= f.places }))];
      all.forEach((item, i) => { if (i === f.whole.length) append(digits, 'b', '.', 'ta-decimal-point'); const tile = append(digits, 'div', null, `ta-digit ${item.discard && f.phase >= 1 ? 'ta-discard' : ''}`); append(tile, 'strong', item.digit); append(tile, 'small', `10^${item.power}`); });
      if (f.phase >= 2) append(p, 'div', f.increment ? '← +1 進位至最末保留位（如遇 9，繼續向左）' : '× 移除捨棄位', 'ta-carry-arrow');
      if (f.phase >= 3) append(p, 'output', f.result, 'ta-number-result');
    }); }
  });
})();
