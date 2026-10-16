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
  function nested(rows, columns, triangular = false) {
    rows = integer(rows, 1, 6); columns = integer(columns, 1, 6);
    if (triangular) columns = rows;
    const target = triangular ? rows * (rows + 1) / 2 : rows * columns;
    const frames = [{ i: -1, j: -1, visited: [], rows, columns, triangular, target, note: '外迴圈控制列，內迴圈控制每列的欄。' }], visited = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < (triangular ? i + 1 : columns); j++) {
      visited.push([i, j]);
      frames.push({ i, j, visited: clone(visited), rows, columns, triangular, target, note: `${j === 0 && i > 0 ? '內迴圈 j 回到 0；' : ''}處理 cell[${i}][${j}]。累計 ${visited.length} / ${target} 次。` });
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
    target = Number(target);
    const output = [], frames = [{ records, output: [], read: -1, done: false, note: '原檔案保持不變；把處理後的記錄寫入暫存檔。' }];
    if (operation !== 'append' && (!Number.isInteger(target) || target < 1 || target > records.length)) { frames.push({ records, output: [...records], read: -1, done: true, note: '目標記錄不存在；沒有執行替換，原檔維持不變。' }); return frames; }
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
  function sentinel(text, stop, freeze) {
    const values = numbers(text), frames = [{ values, at: -1, total: 0, count: 0, note: '先讀第一個值，再檢查是否為哨兵。' }];
    let total = 0, count = 0;
    for (let at = 0; at < values.length; at++) {
      const value = values[at];
      frames.push({ values, at, total, count, test: true, note: `${value} ${value === stop ? '=' : '≠'} ${stop}：${value === stop ? '遇到哨兵，終止，不加入總和。' : '不是哨兵，可以處理。'}`, done: value === stop });
      if (value === stop) return frames;
      total += value; count++;
      frames.push({ values, at, total, count, note: `total += ${value} → ${total}；count = ${count}。接着讀下一個值。` });
      if (freeze) { frames.push({ values, at, total, count, stalled: true, note: `錯誤版本沒有再次讀取輸入；x 仍是 ${value}，條件永遠不變。本模型在此暫停，避免真的無窮迴圈。` }); return frames; }
    }
    frames.push({ values, at: values.length, total, count, done: true, note: '輸入序列已耗盡而未遇哨兵；真實互動程式會等待更多輸入，必須明確定義 EOF 的處理。' }); return frames;
  }
  function arrayShift(values, operation, index, item, capacity = 6) {
    const data = values.slice(0, capacity), length = data.length, frames = [];
    while (data.length < capacity) data.push(null);
    const record = (from, to, count, note) => frames.push({ data: [...data], from, to, length: count, note });
    record(-1, -1, length, '固定容量的陣列須分清有效長度和空位。索引由 0 開始。');
    if (!Number.isInteger(index) || index < 0 || index > length || operation === 'delete' && index === length) { record(-1, -1, length, '索引不合法；保留陣列，不自動更改輸入。'); return frames; }
    if (operation === 'insert') {
      if (length === capacity) { record(-1, -1, length, '陣列已滿：拒絕插入，避免 overflow。'); return frames; }
      for (let from = length - 1; from >= index; from--) { data[from + 1] = data[from]; record(from, from + 1, length, `由右至左：a[${from + 1}] = a[${from}]，先保留右方數據。`); }
      data[index] = item; record(-1, index, length + 1, `把 ${item} 寫入 a[${index}]，有效長度增至 ${length + 1}。`);
    } else {
      for (let from = index + 1; from < length; from++) { data[from - 1] = data[from]; record(from, from - 1, length, `由左至右：a[${from - 1}] = a[${from}]，填補刪除後空位。`); }
      data[length - 1] = null; record(-1, -1, length - 1, `有效長度減至 ${length - 1}，尾端不再屬有效資料。`);
    }
    return frames;
  }
  function inputTypes(raw, factor) {
    raw = String(raw); factor = integer(factor, 0, 5);
    const syntax = /^[+-]?\d+$/.test(raw.trim()), inRange = syntax && Number.isSafeInteger(Number(raw)) && Math.abs(Number(raw)) <= 1e12;
    const valid = syntax && inRange, value = valid ? Number(raw) : null;
    const frames = [{ phase: 0, raw, factor, value: null, note: 'input() 取得文字，即使畫面看起來像數字，型別仍是 str。' }];
    frames.push({ phase: 1, raw, factor, value, valid, syntax, note: valid ? `int(${JSON.stringify(raw)}) → 整數 ${value}。` : syntax ? '超出本圖解的 ±10¹² 顯示範圍；這是模型限制，Python int 本身可表示更大的整數。' : `int(${JSON.stringify(raw)}) 失敗：應捕捉 ValueError 並保留輸入，不能繼續數值計算。` });
    if (valid) frames.push({ phase: 2, raw, factor, value, valid, product: value * factor, repeated: raw.repeat(factor), note: `整數乘法得到 ${value * factor}；字串乘法則重複文字，兩者不同。` });
    return frames;
  }
  function booleanRule(member, overdue, useOr) {
    const notOverdue = !overdue, result = useOr ? member || notOverdue : member && notOverdue;
    return [0, 1, 2].map(phase => ({ phase, member, overdue, notOverdue, result, useOr, note: phase === 0 ? '先讀取 member 和 overdue 兩個 Boolean。' : phase === 1 ? `NOT 先求值：not overdue = ${notOverdue}。` : `${member} ${useOr ? 'OR' : 'AND'} ${notOverdue} = ${result}。${useOr ? 'OR 只需其中一項成立；比較它是否符合「會員而且沒有逾期」的規格。' : 'AND 要求兩項條件同時成立。'}` }));
  }
  function scan(values, cutoff, mode, strict, inclusive = true) {
    let total = 0, count = 0, min = null, max = null, ordered = true;
    const frames = [{ values, at: -1, total, count, min, max, ordered, mode, note: '總和與計數從 0 開始；最大最小值等首項有效資料初始化。' }];
    for (let at = 0; at < values.length; at++) {
      const value = values[at], accepted = mode !== 'filtered' || (inclusive ? value >= cutoff : value > cutoff);
      if (accepted) { total += value; count++; min = min === null ? value : Math.min(min, value); max = max === null ? value : Math.max(max, value); }
      if (at && (strict ? value <= values[at - 1] : value < values[at - 1])) ordered = false;
      frames.push({ values, at, total, count, min, max, ordered, accepted, mode, expected: values.slice(0,at+1).filter(x => x >= cutoff).length, note: mode === 'order' ? at === 0 ? '首項沒有前一項可比較。' : `${values[at - 1]} ${strict ? '<' : '≤'} ${value}：${(strict ? value > values[at - 1] : value >= values[at - 1]) ? '通過' : '反例：原列表沒有按要求排列'}。` : `${value}${mode === 'filtered' ? accepted ? ' 符合目前條件，' : ' 不符合目前條件，略過；' : '：'}total = ${total}，count = ${count}。` });
      if (mode === 'order' && !ordered) break;
    }
    frames.push({ values, at: -1, total, count, min, max, ordered, mode, expected: values.filter(x => x >= cutoff).length, done: true, note: mode === 'order' ? `次序檢查：${ordered ? '通過（空表／單項亦按此約定通過）' : '失敗；已有一對反例，毋須先排序改動資料'}。` : count ? `平均 = ${total} ÷ ${count} = ${total / count}；min = ${min}，max = ${max}。` : '沒有符合條件的資料，平均未定義，不能除以零。' }); return frames;
  }
  function stringModel(text, start, end, term) {
    text = String(text).slice(0, 18); start = integer(start, -text.length, text.length); end = integer(end, -text.length, text.length);
    const normalized = String(term).trim().toUpperCase(), normalizedText = text.trim().toUpperCase();
    return { text, start, end, slice: text.slice(start, end), normalized, normalizedText, found: normalizedText.indexOf(normalized), length: text.length };
  }
  function mergeLists(a, b) {
    a = [...a].sort((x, y) => x - y); b = [...b].sort((x, y) => x - y);
    let i = 0, j = 0; const output = [], frames = [{ a, b, i, j, output: [], note: '先把輸入各自排序，以符合合併的前提；只比較兩邊尚未處理的首項。' }];
    while (i < a.length || j < b.length) {
      const from = j >= b.length || i < a.length && a[i] <= b[j] ? 'A' : 'B';
      const value = from === 'A' ? a[i++] : b[j++]; output.push(value);
      frames.push({ a, b, i, j, output: [...output], from, note: `從 ${from} 取 ${value}，只移動 ${from} 的指標。${i === a.length || j === b.length ? '其中一邊耗盡，其餘項目直接接上。' : ''}` });
    }
    return frames;
  }
  function bindings(kind, value, factor) {
    const before = numbers(value), amount = Number(value) || 0, rate = Number(factor) || 0;
    if (kind === 'discount') return [
      { phase: 0, kind, caller: `price = ${amount}`, local: '尚未呼叫', heap: [], note: '呼叫前，主程式持有 price；函數的局部變量還未建立。' },
      { phase: 1, kind, caller: `price = ${amount}`, local: `amount = ${amount}\nfactor = ${rate}`, heap: [], note: '引數值綁定至本次呼叫的參數名稱。' },
      { phase: 2, kind, caller: `price = ${amount}`, local: `result = ${amount} × ${rate} = ${amount * rate}`, heap: [], note: '在函數局部框架計算 result。' },
      { phase: 3, kind, caller: `price = ${amount}\nfinal = ${amount * rate}`, local: '框架已離開', heap: [], note: 'return 把結果交回 final；price 保持原值。' }
    ];
    return [
      { phase: 0, kind, caller: 'data → 物件 A', local: '尚未呼叫', heap: [before], note: 'data 名稱指向列表物件 A。' },
      { phase: 1, kind, caller: 'data → 物件 A', local: 'items → 物件 A', heap: [before], note: '參數 items 與 data 暫時指向同一列表物件。' },
      { phase: 2, kind, caller: 'data → 物件 A', local: kind === 'mutate' ? 'items → 物件 A' : 'items → 物件 B', heap: kind === 'mutate' ? [[...before, rate]] : [before, [rate]], note: kind === 'mutate' ? 'items.append(value) 修改共同指向的物件，data 亦看到改動。' : 'items = [value] 只重新綁定局部名稱；data 仍指向原物件 A。' },
      { phase: 3, kind, caller: 'data → 物件 A', local: '框架已離開', heap: kind === 'mutate' ? [[...before, rate]] : [before], note: '離開函數後，主程式的 data 仍指向物件 A；比較其內容是否改變。' }
    ];
  }
  function linkedInsert(first, middle, lastValue) {
    const data = [lastValue, null, first], next = [-1, -1, 0], frames = [];
    const take = note => frames.push({ data: [...data], next: [...next], head: 2, note });
    take('head = 2：邏輯順序是索引 2 → 0，不是陣列的物理順序。');
    data[1] = middle; take(`把新值 ${middle} 放到空位置 1；尚未把它接到鏈上。`);
    next[1] = next[2]; take('先令 next[1] = next[2]，保留通往原後繼節點的鏈結。');
    next[2] = 1; take('再令 next[2] = 1，鏈結成 2 → 1 → 0；沒有搬動其他資料。');
    next[2] = next[1]; take('刪除中間節點：next[2] = next[1]，繞過位置 1。');
    data[1] = null; next[1] = -1; take('回收位置 1，邏輯順序回復 2 → 0，位置 1 可再使用。'); return frames;
  }
  function fileMode(records, mode, line) {
    const original = [...records], opened = mode === 'w' ? [] : [...records];
    return [{ phase: 0, records: original, visible: original, mode, note: '這只是記憶體模型，不會讀寫你電腦上的檔案。' },
      { phase: 1, records: original, visible: opened, mode, note: mode === 'w' ? '以 w 開啟既有檔案：即使還未寫入，也可能已把舊內容截斷。' : mode === 'r' ? '以 r 開啟：允許讀取，不允許寫入。' : '以 a 開啟：保留舊資料，寫入位置在末尾。' },
      { phase: 2, records: original, visible: mode === 'r' ? opened : [...opened, line], mode, note: mode === 'r' ? '嘗試 write 會失敗（不支援寫入），舊內容維持不變。' : `寫入一行「${line}」後關閉。${mode === 'w' ? '舊資料已不在新檔內。' : '這是新增記錄，不是按鍵修改舊記錄。'}` }];
  }
  function gradeDivide(value, mode, divisor, reverse) {
    value = integer(value, 0, 999); divisor = integer(divisor, 1, 12);
    if (mode === 'mod') return [{ phase: 0, value, divisor, mode, note: '把所有項目按每組容量分組；商是完整組數，餘數是剩下的項目。' }, { phase: 1, value, divisor, mode, quotient: Math.floor(value / divisor), remainder: value % divisor, note: `${value} = ${Math.floor(value / divisor)} × ${divisor} + ${value % divisor}；// 與 % 分別取得商與餘數。` }];
    const thresholds = reverse ? [50, 80] : [80, 50], labels = reverse ? ['合格', '優良'] : ['優良', '合格'], frames = [{ phase: 0, value, mode, thresholds, note: '由上至下檢查條件，只執行第一條為真的分支。' }];
    for (let i = 0; i < thresholds.length; i++) { const pass = value >= thresholds[i]; frames.push({ phase: i + 1, value, mode, thresholds, at: i, result: pass ? labels[i] : null, note: `${value} >= ${thresholds[i]} 為 ${pass}。${pass ? `輸出「${labels[i]}」，略過後面的分支。` : '繼續檢查下一條。'}` }); if (pass) return frames; }
    frames.push({ phase: 3, value, mode, thresholds, at: 2, result: '不合格', note: '所有條件都不成立，執行 else 分支。' }); return frames;
  }
  function assignment(value, delta) {
    const result = Number(value) + Number(delta);
    return [0,1,2,3].map(phase => ({ phase, old: Number(value), delta: Number(delta), memory: phase >= 2 ? result : Number(value), result, comparison: result >= 0 && result <= 10, note: ['先讀取右方 x 的舊值，左方記憶體尚未改動。', `運算器計算 ${value} + ${delta} = ${result}。`, `把結果 ${result} 寫回 x；賦值不是數學等式。`, `比較 0 <= x <= 10 得到 ${result >= 0 && result <= 10}；比較不再改變 x。`][phase] }));
  }
  function stringSearch(values, raw) {
    const target = raw.trim().toUpperCase(), frames = [{ values, raw, target, at: -1, found: -1, note: `依本題規格把搜尋詞 trim() 及 upper()：${JSON.stringify(raw)} → ${JSON.stringify(target)}；原記錄保留。` }];
    for (let at = 0; at < values.length; at++) { const found = values[at].trim().toUpperCase() === target; frames.push({ values, raw, target, at, found: found ? at : -1, note: `比較索引 ${at} 的正規化副本 ${JSON.stringify(values[at].trim().toUpperCase())}：${found ? '相同，回傳此索引。' : '不同，繼續。'}` }); if (found) return frames; }
    frames.push({ values, raw, target, at: -1, found: -1, note: '全部比較仍找不到，回傳 -1。' }); return frames;
  }
  window.ICTAlgorithmModels = { numbers, flow, trace, search, boundary, transaction, relations, normalize, nested, factorial, structure, sort, fileWrite, quantize, sentinel, arrayShift, inputTypes, booleanRule, scan, stringModel, mergeLists, bindings, linkedInsert, fileMode, gradeDivide, assignment, stringSearch };

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
    mount(host, api) { lab(host, api, p => ({ n: input(p, 'n（1–10）', 3, 'number') }), v => trace(v.n.value), (p, f, i, v) => {
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
    mount(host, api) { lab(host, api, p => ({ rows: input(p, '列數（1–6）', 3, 'number'), columns: input(p, '欄數（矩形模式，1–6）', 4, 'number'), shape: input(p, '內迴圈範圍', 'rectangle', null, [['rectangle', '矩形：固定欄數'], ['triangle', '三角形：range(i+1)']]) }), v => nested(v.rows.value, v.columns.value, v.shape.value === 'triangle'), (p, f) => {
      const layout = append(p, 'div', null, 'ta-machine'); const code = append(layout, 'pre', `for i in range(${f.rows}):\n    for j in range(${f.triangular ? 'i + 1' : f.columns}):\n        visit(i, j)`, 'ta-code');
      const matrix = append(layout, 'div', null, 'ta-matrix'); matrix.style.gridTemplateColumns = `38px repeat(${f.columns}, minmax(35px,1fr))`;
      append(matrix, 'span', 'i ↓ / j →', 'ta-matrix-corner'); for (let j = 0; j < f.columns; j++) append(matrix, 'b', j, j === f.j ? 'ta-column-pointer' : '');
      for (let i = 0; i < f.rows; i++) { append(matrix, 'b', `${i === f.i ? '▶ ' : ''}${i}`, i === f.i ? 'ta-row-pointer' : ''); for (let j = 0; j < f.columns; j++) { const at = f.visited.findIndex(v => v[0] === i && v[1] === j); append(matrix, 'div', f.triangular && j > i ? '—' : at < 0 ? '·' : at + 1, `ta-matrix-cell ${f.triangular && j > i ? 'ta-inactive' : ''} ${at >= 0 ? 'ta-visited' : ''} ${f.i === i && f.j === j ? 'ta-current' : ''}`); } }
      append(p, 'div', `i = ${f.i < 0 ? '—' : f.i}　j = ${f.j < 0 ? '—' : f.j}　執行次數 = ${f.visited.length} / ${f.target}`, 'ta-terminal');
    }); }
  });
  registry.push({
    id: 'recursive-frames', title: '呼叫框架、局部狀態與回傳', description: '一般函數呼叫會建立參數及局部變量框架，回傳後離開。可切換遞歸延伸例子，觀察多層框架按後進先出次序回傳。', topics: ['callstack'],
    mount(host, api) { lab(host, api, p => ({ n: input(p, '一般呼叫的 price／遞歸的 n', 4, 'number'), kind: input(p, '呼叫例子', 'single', null, [['single', '一般函數：discount(price, 0.9)'], ['recursive', '延伸：factorial(n)，n=0–7']]) }), v => v.kind.value === 'recursive' ? factorial(v.n.value) : bindings('discount', v.n.value, .9), (p, f, i, v) => {
      if (v.kind.value === 'single') {
        const layout = append(p, 'div', null, 'ta-recursion'); append(layout, 'pre', `def discount(amount, factor):\n    result = amount * factor\n    return result\n\nprice = ${Number(v.n.value) || 0}\nfinal = discount(price, 0.9)`, 'ta-code');
        const stack = append(layout, 'div', null, 'ta-callstack'); append(stack, 'h4', '呼叫堆疊'); if (f.phase > 0 && f.phase < 3) { const frame = append(stack, 'div', null, 'ta-stack-frame ta-current'); append(frame, 'strong', 'discount 的局部框架'); append(frame, 'pre', f.local); } append(stack, 'div', f.caller, 'ta-stack-base'); if (f.phase === 3) append(stack, 'p', '↶ result 回傳到 final，discount 框架已 pop。', 'ta-return-value'); return;
      }
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
  registry.push({ id: 'spec-contract', title: '規格如何約束輸入、計算與顯示', description: '文具訂購規格：數量必須是 1–99 整數，單價非負。先驗證，再傳值給計算模組，最後格式化金額。', topics: ['spec-interface'], mount(host, api) {
    lab(host, api, p => ({ quantity: input(p, '數量（件，1–99 整數）', '3'), price: input(p, '單價（HK$，非負數）', '12.50') }), v => {
      const q = Number(v.quantity.value), price = Number(v.price.value), valid = v.quantity.value.trim() !== '' && Number.isInteger(q) && q >= 1 && q <= 99 && v.price.value.trim() !== '' && Number.isFinite(price) && price >= 0;
      const qValid = v.quantity.value.trim() !== '' && Number.isInteger(q) && q >= 1 && q <= 99, priceValid = v.price.value.trim() !== '' && Number.isFinite(price) && price >= 0;
      const note = valid ? `計算模組回傳 ${q * price}，顯示模組輸出 HK$ ${(q * price).toFixed(2)}。` : '拒絕輸入：數量須為 1–99 整數，單價須為非負數；保留原輸入，不能悄悄截斷。';
      return [0, 1, 2].map(phase => ({ q, price, valid, qValid, priceValid, phase, note: phase === 0 ? '輸入欄位的標籤、單位及範圍要與規格一致。' : phase === 1 ? valid ? '所有前置條件通過，才呼叫計算模組。' : note : note }));
    }, (p, f) => {
      table(p, ['規格', '當前輸入', '檢驗'], [['數量為 1–99 整數', f.q, f.qValid ? '✓' : '✗'], ['單價為非負數', f.price, f.priceValid ? '✓' : '✗']]);
      append(p, 'pre', '輸入介面\n    ↓ 驗證成功才傳入\ntotal_cost(quantity, unit_price)\n    ↓ 回傳數值\nformat(amount, ".2f")', 'ta-code');
      if (f.phase >= 1) append(p, 'div', f.valid ? '✓ 可以進入計算模組' : '✗ 停在驗證層，保留輸入', f.valid ? 'ta-ledger' : 'ta-error');
      if (f.phase === 2 && f.valid) append(p, 'output', `HK$ ${(f.q * f.price).toFixed(2)}`, 'ta-number-result');
    });
  }});
  registry.push({ id: 'boolean-wires', title: 'NOT、AND、OR 如何組合條件', description: '規格是會員而且沒有逾期才可借用。先反轉 overdue，再把結果與 member 組合；切換 OR 可看見規格如何被改變。', topics: ['boolean-expression'], mount(host, api) {
    lab(host, api, p => ({ member: input(p, 'member（會員）', 'true', null, [['true', 'True'], ['false', 'False']]), overdue: input(p, 'overdue（有逾期）', 'true', null, [['true', 'True'], ['false', 'False']]), operator: input(p, '組合運算', 'and', null, [['and', 'AND（符合原規格）'], ['or', 'OR（比較不同規則）']]) }), v => booleanRule(v.member.value === 'true', v.overdue.value === 'true', v.operator.value === 'or'), (p, f) => {
      const s = svg(p, 750, 235); s.setAttribute('aria-label', 'Boolean 條件的訊號線及逐步求值');
      shape(s, 'path', { d: 'M150 50H430V100M150 175H235M335 175H430V140M540 120H690', class: 'ta-key-line ta-lit' });
      [[50, 50, 'member', f.member], [50, 175, 'overdue', f.overdue], [285, 175, 'NOT', f.phase >= 1 ? f.notOverdue : '？'], [485, 120, f.useOr ? 'OR' : 'AND', f.phase >= 2 ? f.result : '？'], [685, 120, 'allowed', f.phase >= 2 ? f.result : '？']].forEach(([x, y, label, value]) => {
        shape(s, 'rect', { x: x - 45, y: y - 30, width: 100, height: 60, rx: 7, fill: value === true ? '#d4f1df' : value === false ? '#fff0e6' : '#fff', stroke: '#6a8b9e', 'stroke-width': 2 });
        shape(s, 'text', { x: x + 5, y: y - 8, 'text-anchor': 'middle' }, label); shape(s, 'text', { x: x + 5, y: y + 16, 'text-anchor': 'middle' }, String(value));
      });
      table(p, ['member', 'overdue', `member ${f.useOr ? 'or' : 'and'} not overdue`], [[false, false], [false, true], [true, false], [true, true]].map(([m, o]) => [String(m), String(o), String(f.useOr ? m || !o : m && !o)]), (f.member ? 2 : 0) + (f.overdue ? 1 : 0));
    });
  }});
  registry.push({ id: 'sentinel-reader', title: '哨兵值與下一次輸入', description: '讀入序列後，先檢查哨兵才累加。比較正確版本與漏讀下一個值的版本，亦可測試第一項已是哨兵。', topics: ['sentinel'], mount(host, api) {
    lab(host, api, p => ({ values: input(p, '模擬輸入序列（最多 10 項）', '4,6,-1'), stop: input(p, '哨兵值', -1, 'number'), bug: input(p, '迴圈更新', 'read', null, [['read', '每輪讀下一個值'], ['freeze', '錯誤：漏讀下一個值']]) }), v => sentinel(v.values.value, Number(v.stop.value), v.bug.value === 'freeze'), (p, f, i, v) => {
      append(p, 'pre', `total = 0\nx = read()\nwhile x != ${Number(v.stop.value)}:\n    total += x\n${v.bug.value === 'read' ? '    x = read()' : '    # 漏了 x = read()'}`, 'ta-code');
      const tape = append(p, 'div', null, 'ta-array'); f.values.forEach((value, at) => { const c = append(tape, 'div', null, `ta-slot ${at === f.at ? 'ta-current' : ''} ${at < f.at ? 'ta-excluded' : ''}`); append(c, 'strong', value); append(c, 'span', at === f.at ? '▲ x' : '待讀'); });
      append(p, 'div', `total = ${f.total}　count = ${f.count}${f.stalled ? '　⚠ 控制變量沒有更新' : ''}`, 'ta-terminal');
    });
  }});
  registry.push({ id: 'array-shifting', title: '插入與刪除時搬移哪些元素', description: '固定容量陣列的插入由右向左搬移，刪除則把後續元素向左補位。箭頭顯示本步真正的來源和目的位置。', topics: ['array-update'], mount(host, api) {
    lab(host, api, p => ({ a: input(p, '原數列（容量 5）', '10,20,30'), op: input(p, '操作', 'insert', null, [['insert', '插入'], ['delete', '刪除']]), index: input(p, '目標索引', 1, 'number'), value: input(p, '插入值', 15, 'number') }), v => arrayShift(numbers(v.a.value), v.op.value, Number(v.index.value), Number(v.value.value), 5), (p, f) => {
      const s = svg(p, 720, 80); s.setAttribute('aria-label', f.from < 0 ? '等待元素搬移' : `索引 ${f.from} 搬到 ${f.to}`);
      if (f.from >= 0) { const unit = 720 / f.data.length, x1 = unit/2 + f.from * unit, x2 = unit/2 + f.to * unit; shape(s, 'path', { d: `M${x1} 72V20H${x2}V62`, class: 'ta-key-line ta-lit' }); shape(s, 'path', { d: `M${x2 - 7} 55L${x2} 65L${x2 + 7} 55`, class: 'ta-key-line ta-lit' }); }
      const tape = append(p, 'div', null, 'ta-array'); f.data.forEach((value, at) => { const c = append(tape, 'div', null, `ta-slot ${at === f.to ? 'ta-current' : ''} ${at >= f.length ? 'ta-inactive' : ''}`); append(c, 'small', `[${at}]`); append(c, 'strong', value ?? '空'); append(c, 'span', at === f.from ? '讀取來源' : at === f.to ? '寫入位置' : '　'); });
      append(p, 'div', `有效長度 ${f.length} / 容量 ${f.data.length}`, 'ta-terminal');
    });
  }});
  registry.push({ id: 'python-input-types', title: '文字輸入、型別轉換與運算', description: '比較同一輸入保持 str 與轉成 int 的差別。文字 abc 和小數 3.5 不能直接用 int(raw) 轉換。', topics: ['input-types'], mount(host, api) {
    lab(host, api, p => ({ raw: input(p, 'input() 回傳文字', '12'), factor: input(p, '乘數（0–5）', 3, 'number') }), v => inputTypes(v.raw.value, v.factor.value), (p, f) => {
      const memory = append(p, 'div', null, 'ta-memory'); append(memory, 'h4', '名稱 → 型別 → 值');
      table(memory, ['名稱', '型別', '值'], [['raw', 'str', JSON.stringify(f.raw)], ...(f.phase > 0 ? [['quantity', f.valid ? 'int' : f.syntax ? '超出圖解範圍' : '轉換失敗', f.valid ? f.value : f.syntax ? 'Python int 可處理更大的整數' : 'ValueError']] : [])]);
      append(p, 'pre', `raw = input()\nquantity = int(raw)\nprint(quantity * ${f.factor})`, 'ta-code');
      if (f.phase === 2) table(p, ['表達式', '結果', '意義'], [[`quantity * ${f.factor}`, f.product, '數值乘法'], [`raw * ${f.factor}`, JSON.stringify(f.repeated), '字串重複']]);
      if (f.phase === 1 && !f.valid) append(p, 'p', '停在轉換步驟：請修正輸入後再計算。', 'ta-error');
    });
  }});
  function statsMount(defaultMode, values) { return function(host, api) {
    lab(host, api, p => ({ values: input(p, '數列（可留空，最多 10 項）', values), mode: input(p, '算法', defaultMode, null, [['all', '全部資料累計'], ['filtered', '只累計達標資料'], ['extrema', '找最大／最小'], ['order', '檢查原次序']]), cutoff: input(p, '達標界線', 50, 'number'), strict: input(p, '次序規格', 'no', null, [['no', '非遞減（容許相等）'], ['yes', '嚴格遞增']]), inclusive: input(p, '達標條件（規格包含界線）', 'yes', null, [['yes', '>=（正確）'], ['no', '>（錯誤示例）']]) }), v => scan(numbers(v.values.value), Number(v.cutoff.value), v.mode.value, v.strict.value === 'yes', v.inclusive.value === 'yes'), (p, f) => {
      const tape = append(p, 'div', null, 'ta-array'); f.values.forEach((value, at) => { const c = append(tape, 'div', null, `ta-slot ${at === f.at || f.mode === 'order' && at === f.at - 1 ? 'ta-current' : ''}`); append(c, 'small', `[${at}]`); append(c, 'strong', value); append(c, 'span', at === f.at ? f.accepted === false ? '略過' : '▲ 讀取' : '　'); }); if (!f.values.length) append(tape, 'p', '空列表');
      if (f.mode === 'order') append(p, 'div', `ordered = ${f.ordered}　原始列表不變：${f.values.join(', ')}`, 'ta-terminal');
      else table(p, ['count', 'total', 'min', 'max', 'average（完成後）'], [[f.count, f.total, f.min ?? '未定義', f.max ?? '未定義', f.done ? f.count ? (f.total / f.count).toFixed(2) : '未定義，避免 ÷0' : '迴圈後才計算']]);
      if (f.mode === 'filtered') append(p, 'div', `本步按規格 >= 應累計 ${f.expected ?? 0} 人；程式實際 ${f.count} 人${f.expected !== undefined && f.expected !== f.count ? '　✗ 找到差異，檢查目前比較符號' : ''}`, 'ta-ledger');
    });
  }; }
  registry.push({ id: 'list-statistics', title: '同一批資料的累積與平均', description: '追蹤每個元素如何更新 total 和 count。空列表沒有平均；最大最小值從首個有效項目初始化，支援全負數。', topics: ['list-statistics'], mount: statsMount('all', '60,80,100') });
  registry.push({ id: 'filtered-statistics', title: '只累計符合相同條件的分數', description: 'total 和 count 必須採用同一篩選條件。切換最大最小及次序檢查，可以比較相同資料的不同算法。', topics: ['filtered-list'], mount: statsMount('filtered', '40,60,80') });
  registry.push({ id: 'extrema-order', title: '全負數初值與相鄰次序檢查', description: '不要把最大值任意初始化為 0。次序檢查只比較相鄰資料，遇反例便停止，無須先排序。', topics: ['extrema-order'], mount: statsMount('extrema', '-8,-3,-5') });
  registry.push({ id: 'count-breakpoint', title: '在條件處停下來比較預期與實際', description: '先以 [49,50,51] 預測包含 50 的達標人數，再切換 >= 與 >，逐步觀察哪次迭代開始偏離規格。', topics: ['count-debug'], mount: statsMount('filtered', '49,50,51') });
  registry.push({ id: 'string-positions', title: '字串長度、索引與切片', description: '本模型限制為 ASCII，索引由 0 開始。切片包含 start、不包含 end；識別碼的前置零須保留。', topics: ['string-index'], mount(host, api) {
    lab(host, api, p => ({ text: input(p, '原字串（ASCII，最多 18 字元）', 'HK0123'), start: input(p, '切片 start', 2, 'number'), end: input(p, '切片 end（不包括）', 6, 'number') }), v => {
      const model = stringModel(v.text.value.replace(/[^\x00-\x7f]/g, ''), v.start.value, v.end.value, ''); return [0, 1, 2].map(phase => ({ ...model, phase, note: phase === 0 ? `len(text) = ${model.length}。${v.text.value !== model.text ? '已只保留 ASCII；此模型不處理 Unicode 索引。' : ''}` : phase === 1 ? `text[${model.start}:${model.end}] = ${JSON.stringify(model.slice)}；空字串沒有可讀取的單一字符。` : `切片仍是字串，結果 ${JSON.stringify(model.slice)} 保留前置零；負索引由末端回數。` }));
    }, (p, f) => {
      const from = f.start < 0 ? Math.max(0, f.length + f.start) : f.start, until = f.end < 0 ? Math.max(0, f.length + f.end) : f.end;
      const tape = append(p, 'div', null, 'ta-array'); [...f.text].forEach((char, at) => { const c = append(tape, 'div', null, `ta-slot ${f.phase >= 1 && at >= from && at < until ? 'ta-current' : ''}`); append(c, 'small', `[${at}] / [${at - f.length}]`); append(c, 'strong', char === ' ' ? '␠' : char); });
      append(p, 'div', `len = ${f.length}${f.phase >= 1 ? `　slice → ${JSON.stringify(f.slice)}` : ''}`, 'ta-terminal');
      if (f.phase === 2) table(p, ['原字串（沒有更改）', '切片結果', '結果型別'], [[JSON.stringify(f.text), JSON.stringify(f.slice), 'str']]);
    });
  }});
  registry.push({ id: 'merge-pointers', title: '兩個有序列表如何合併', description: '用 i 和 j 指向兩邊尚未處理的首項；每次只取較小的一項，並移動相應指標，保持結果有序。', topics: ['sorted-merge'], mount(host, api) {
    lab(host, api, p => ({ a: input(p, '列表 A（模型先排序）', '1,4,7'), b: input(p, '列表 B（模型先排序）', '2,3,8') }), v => mergeLists(numbers(v.a.value), numbers(v.b.value)), (p, f) => {
      [['A', f.a, f.i], ['B', f.b, f.j]].forEach(([name, values, pointer]) => { append(p, 'h4', `${name}　${name === 'A' ? 'i' : 'j'} = ${pointer}`); const tape = append(p, 'div', null, 'ta-array'); values.forEach((value, at) => { const c = append(tape, 'div', null, `ta-slot ${at < pointer ? 'ta-excluded' : ''} ${at === pointer ? 'ta-current' : ''}`); append(c, 'strong', value); append(c, 'span', at === pointer ? '▲ 下一項' : '　'); }); if (pointer >= values.length) append(tape, 'span', '已耗盡'); });
      append(p, 'div', `↓ ${f.from ? '本步取自 ' + f.from : '比較兩邊首項'}\n結果：[${f.output.join(', ')}]`, 'ta-terminal');
    });
  }});
  registry.push({ id: 'parameter-bindings', title: '參數、局部框架與共同列表物件', description: '比較數字引數與回傳值、修改列表內容及重新綁定局部參數。箭頭表示名稱指向哪個物件。', topics: ['parameter-binding'], mount(host, api) {
    lab(host, api, p => ({ value: input(p, '數值／列表資料', '1,2'), kind: input(p, '例子', 'mutate', null, [['discount', 'discount(amount, factor)'], ['mutate', 'items.append(value)'], ['rebind', 'items = [value]']]), factor: input(p, '折扣倍率／加入值', '3', 'number') }), v => bindings(v.kind.value, v.value.value, v.factor.value), (p, f) => {
      const layout = append(p, 'div', null, 'ta-machine'); const caller = append(layout, 'section', null, 'ta-memory'); append(caller, 'h4', '呼叫者'); append(caller, 'pre', f.caller);
      const frame = append(layout, 'section', null, 'ta-memory'); append(frame, 'h4', '本次函數局部框架'); append(frame, 'pre', f.local);
      if (f.kind !== 'discount') {
        const s = svg(p, 650, 150); s.setAttribute('aria-label', 'data 與 items 的名稱綁定'); shape(s, 'text', { x: 40, y: 35 }, 'data'); shape(s, 'path', { d: 'M90 30H245V75', class: 'ta-key-line ta-lit' });
        if (f.phase === 1 || f.phase === 2) { shape(s, 'text', { x: 40, y: 125 }, 'items'); shape(s, 'path', { d: f.kind === 'rebind' && f.phase === 2 ? 'M95 120H480V75' : 'M95 120H245V75', class: 'ta-key-line ta-lit' }); }
        f.heap.forEach((items, at) => { shape(s, 'rect', { x: 175 + at * 235, y: 55, width: 175, height: 50, rx: 6, fill: '#e4f4ee', stroke: '#619384' }); shape(s, 'text', { x: 262 + at * 235, y: 85, 'text-anchor': 'middle' }, `${at ? 'B' : 'A'}: [${items.join(',')}]`); });
      }
    });
  }});
  registry.push({ id: 'linked-array', title: '鏈表的物理位置與邏輯次序', description: 'head 和 next 決定遍歷順序，節點不必在陣列中相鄰。先保留後繼鏈結，再把新節點接上；刪除則繞過節點並回收空位。', topics: ['linked-array'], mount(host, api) {
    lab(host, api, p => ({ first: input(p, '首節點值', 'A'), middle: input(p, '要插入的值', 'B'), last: input(p, '末節點值', 'C') }), v => linkedInsert(v.first.value.slice(0, 8), v.middle.value.slice(0, 8), v.last.value.slice(0, 8)), (p, f) => {
      table(p, ['物理索引', 'data', 'next'], f.data.map((value, at) => [at, value ?? '空／free', f.next[at]]));
      const s = svg(p, 700, 175); s.setAttribute('aria-label', '從 head 沿 next 的實際遍歷路徑'); shape(s, 'text', { x: 20, y: 25 }, 'head = 2'); shape(s, 'path', { d: 'M90 25H580V65', class: 'ta-key-line ta-lit' });
      f.data.forEach((value, at) => { const x = 130 + at * 225; shape(s, 'rect', { x: x - 75, y: 65, width: 150, height: 55, rx: 4, fill: value === null ? '#eee' : '#dcefe6', stroke: '#618b7d' }); shape(s, 'text', { x, y: 87, 'text-anchor': 'middle' }, `[${at}] ${value ?? 'free'}`); shape(s, 'text', { x, y: 109, 'text-anchor': 'middle' }, `next = ${f.next[at]}`);
        if (f.next[at] >= 0) { const dest = 130 + f.next[at] * 225, y = 140 + at * 8; shape(s, 'path', { d: `M${x} 120V${y}H${dest}V120`, class: 'ta-key-line ta-lit' }); }
      });
      let at = f.head, order = [], seen = new Set(); while (at >= 0 && !seen.has(at)) { seen.add(at); order.push(f.data[at]); at = f.next[at]; }
      append(p, 'div', `邏輯順序：${order.join(' → ')} → −1`, 'ta-terminal');
    });
  }});
  registry.push({ id: 'file-open-modes', title: 'r、w、a 在開啟時已經不同', description: '對照原內容與目前內容，觀察 w 的截斷時機、a 的追加位置及 r 拒絕寫入的情況。', topics: ['file-mode'], mount(host, api) {
    lab(host, api, p => ({ records: input(p, '原檔記錄（以 | 分隔）', 'S1,60|S2,80'), mode: input(p, 'open 模式', 'w', null, [['r', 'r 只讀'], ['w', 'w 截斷後寫'], ['a', 'a 末端追加']]), line: input(p, '嘗試寫入的新行', 'S3,75') }), v => fileMode(v.records.value.split('|').filter(Boolean).slice(0, 8), v.mode.value, v.line.value.slice(0, 40)), (p, f) => {
      append(p, 'pre', `with open("marks.txt", "${f.mode}", encoding="utf-8") as f:\n    f.write(new_line + "\\n")`, 'ta-code');
      const layout = append(p, 'div', null, 'ta-bank-layout'); [['開啟前', f.records], [`${f.phase === 0 ? '尚未開啟' : f.phase === 1 ? '剛開啟' : '嘗試寫入並關閉'}後的內容`, f.visible]].forEach(([label, lines]) => { const file = append(layout, 'section', null, 'ta-file'); append(file, 'h4', label); lines.forEach(line => append(file, 'div', line, 'ta-record')); if (!lines.length) append(file, 'p', '空檔案'); });
    });
  }});
  registry.push({ id: 'grade-and-modulus', title: '第一個真分支與商、餘數', description: '成績分類只取第一條成立的條件；分組則分清 // 的商與 % 的餘數。兩種模式各顯示實際計算。', topics: ['grade-mod'], mount(host, api) {
    lab(host, api, p => ({ value: input(p, '分數／數量（0–999）', 85, 'number'), mode: input(p, '例子', 'grade', null, [['grade', '多向成績分類'], ['mod', '分組、商和餘數']]), divisor: input(p, '每組容量（1–12）', 5, 'number'), reverse: input(p, '條件次序', 'correct', null, [['correct', '先 >=80 再 >=50'], ['wrong', '錯誤：先 >=50 再 >=80']]) }), v => gradeDivide(v.value.value, v.mode.value, v.divisor.value, v.reverse.value === 'wrong'), (p, f) => {
      if (f.mode === 'grade') { const lines = [`if score >= ${f.thresholds[0]}:`, '    grade = "' + (f.thresholds[0] === 80 ? '優良' : '合格') + '"', `elif score >= ${f.thresholds[1]}:`, '    grade = "' + (f.thresholds[1] === 50 ? '合格' : '優良') + '"', 'else:', '    grade = "不合格"']; const code = append(p, 'ol', null, 'ta-code'); lines.forEach((line, i) => append(code, 'li', line, f.at === Math.floor(i / 2) ? 'ta-current' : '')); append(p, 'div', `score = ${f.value}　${f.result ? '輸出：' + f.result : '尚未輸出'}`, 'ta-terminal'); }
      else { const groups = append(p, 'div', null, 'ta-mod-groups'); const quantity = Math.min(f.value, 120); for (let i = 0; i < quantity; i++) append(groups, 'span', i + 1, i >= Math.floor(f.value / f.divisor) * f.divisor ? 'ta-remainder' : ''); if (f.value > 120) append(groups, 'p', '只畫首 120 件；下列算式使用完整輸入。'); groups.style.gridTemplateColumns = `repeat(${f.divisor},minmax(24px,1fr))`; if (f.phase === 1) append(p, 'div', `${f.value} // ${f.divisor} = ${f.quotient}\n${f.value} % ${f.divisor} = ${f.remainder}\n${f.value} = ${f.quotient} × ${f.divisor} + ${f.remainder}`, 'ta-terminal'); }
    });
  }});
  registry.push({ id: 'assignment-writeback', title: '先計算右方，再寫回左方', description: 'x = x + delta 是一次狀態更新。看清楚舊值、暫存運算結果與寫回後的新值，最後用比較產生 Boolean。', topics: ['assignment'], mount(host, api) {
    lab(host, api, p => ({ value: input(p, 'x 初值', 3, 'number'), delta: input(p, '增量 delta', 1, 'number') }), v => assignment(v.value.value, v.delta.value), (p, f) => {
      append(p, 'pre', `x = ${f.old}\nx = x + ${f.delta}\nprint(0 <= x <= 10)`, 'ta-code');
      const alu = append(p, 'div', null, 'ta-alu'); append(alu, 'span', `讀取舊 x：${f.old}`); append(alu, 'b', '+'); append(alu, 'span', f.delta); append(alu, 'b', '→ 暫存結果'); append(alu, 'strong', f.phase >= 1 ? f.result : '？');
      const memory = append(p, 'div', null, 'ta-register'); append(memory, 'b', '記憶體 x'); append(memory, 'strong', f.memory); if (f.phase >= 2) append(memory, 'span', '← 已寫回');
      if (f.phase === 3) append(p, 'div', `輸出 ${f.comparison}；x 仍是 ${f.memory}`, 'ta-terminal');
    });
  }});
  registry.push({ id: 'normalized-string-search', title: '正規化搜尋詞，再逐項比較', description: '原記錄保持原樣；按本題規格用去除首尾空白及大寫的副本比較，找到首個匹配便回傳索引。', topics: ['string-search'], mount(host, api) {
    lab(host, api, p => ({ values: input(p, '文字列表（逗號分隔，最多 8 項）', 'BIO,ICT,MATH'), target: input(p, '原搜尋詞', '  ict  ') }), v => stringSearch(v.values.value.split(/[，,]/).slice(0,8), v.target.value), (p, f) => {
      append(p, 'pre', `raw = ${JSON.stringify(f.raw)}\ntarget = raw.strip().upper()\n# target = ${JSON.stringify(f.target)}`, 'ta-code');
      table(p, ['索引', '原記錄', '用來比較的副本', '比較結果'], f.values.map((value, at) => [at, JSON.stringify(value), JSON.stringify(value.trim().toUpperCase()), at === f.at ? f.found === at ? '✓ 首個匹配' : '不同' : '—']), f.at);
      append(p, 'div', `目前索引 ${f.at < 0 ? '—' : f.at}　找到位置 ${f.found}`, 'ta-terminal');
    });
  }});
})();
