(function (root) {
  'use strict';
  /* Topic-specific network models. No request, form submission or remote resource is used. */
  const M = {};
  M.route = (mode, client, failed) => ({
    source: client, destination: mode === 'p2p' ? (client + 1) % 3 : 'server',
    available: mode === 'p2p' || !failed,
    points: mode === 'p2p' ? [[110, 78 + client * 108], [310, 186], [110, 78 + ((client + 1) % 3) * 108]] : [[110, 78 + client * 108], [310, 186], [530, 186]]
  });
  M.tcpFrames = drop => {
    const a = [
      { type: 'dns', text: '先查詢本機 DNS 快取；本例沒有紀錄。', at: 0 },
      { type: 'dns', text: '向遞迴 DNS 解析器查詢 learn.school.example 的 IP 位址。', at: 1 },
      { type: 'dns', text: '解析器取得答案（本例省略根、頂級及權威 DNS 查詢），回覆 192.0.2.20。', at: 2 },
      { type: 'dns', text: '把 DNS 答案暫存於快取；IP 位址讓封包可被路由至目的地。', at: 3 },
      { type: 'connect', dir: 'out', label: 'SYN', text: 'TCP：客戶端傳送 SYN，要求建立連線。' },
      { type: 'connect', dir: 'back', label: 'SYN + ACK', text: '伺服器回覆 SYN + ACK。' },
      { type: 'connect', dir: 'out', label: 'ACK', text: '客戶端回覆 ACK，三次握手完成。下方序號只計本例資料位元組。' }
    ];
    for (let i = 0; i < 3; i++) {
      const seq = 1000 + i * 500, ack = seq + 500;
      a.push({ type: 'data', dir: 'out', n: i + 1, seq, label: 'SEQ ' + seq, lost: drop && i === 1, text: '傳送第 ' + (i + 1) + ' 段：500 個位元組，序號 ' + seq + '–' + (ack - 1) + '。' });
      if (drop && i === 1) {
        a.push({ type: 'timeout', n: 2, text: '第 2 段遺失，未收到相應確認；重傳計時器逾時。' });
        a.push({ type: 'data', dir: 'out', n: 2, seq, label: '重傳 SEQ ' + seq, text: '重傳相同資料及序號，避免把重傳誤認作新資料。' });
      }
      a.push({ type: 'ack', dir: 'back', n: i + 1, ack, label: 'ACK ' + ack, text: '接收端按序接收後回覆 ACK ' + ack + '：下一個預期位元組的序號。' });
    }
    a.push({ type: 'done', text: '共 1500 個位元組按序交付。這是逐段觀察的簡化模型；實際 TCP 可同時傳送多段資料。' });
    return a;
  };
  M.bufferTick = (s, incoming, bitrate) => {
    const available = Math.min(s.capacity, s.buffer + incoming);
    const canPlay = s.stalled ? available >= bitrate * 2 : available >= bitrate;
    const used = canPlay ? bitrate : 0;
    return { ...s, buffer: available - used, stalled: !canPlay, elapsed: s.elapsed + 1, played: s.played + (canPlay ? 1 : 0), received: (s.received || 0) + incoming, used };
  };
  M.parseHTML = source => {
    const tree = { tag: 'body', children: [] }, stack = [tree], errors = [];
    const allowed = new Set(['main', 'h1', 'h2', 'p', 'strong', 'em', 'ul', 'li']);
    const parts = String(source).slice(0, 1200).match(/<[^>]*>|[^<]+|</g) || [];
    parts.forEach(token => {
      if (!token.startsWith('<')) { stack[stack.length - 1].children.push({ text: token }); return; }
      const m = token.match(/^<(\/?)\s*([a-z0-9]+)\s*>$/i);
      if (!m || !allowed.has(m[2].toLowerCase())) { errors.push('不支援的標記：' + token); return; }
      const tag = m[2].toLowerCase();
      if (m[1]) {
        if (stack.length > 1 && stack[stack.length - 1].tag === tag) stack.pop();
        else errors.push('結束標籤不配對：' + token);
      } else {
        const node = { tag, children: [] }; stack[stack.length - 1].children.push(node); stack.push(node);
      }
    });
    if (stack.length > 1) errors.push('尚欠結束標籤：' + stack.slice(1).map(n => n.tag).join(', '));
    return { tree, errors };
  };
  M.access = ({ port, allow443, allow22, authenticated, role, action }) => {
    if (!(port === 443 ? allow443 : port === 22 ? allow22 : false)) return { stage: 1, allowed: false, text: '防火牆拒絕此目的連接埠，封包未到應用程式。' };
    if (!authenticated) return { stage: 2, allowed: false, text: '通過防火牆不代表登入成功：身分驗證失敗。' };
    if (action === 'write' && role !== 'teacher') return { stage: 3, allowed: false, text: '身分已驗證，但學生沒有修改成績的權限（授權失敗）。' };
    return { stage: 4, allowed: true, text: '防火牆規則、身分驗證及授權均通過，可以' + (action === 'write' ? '修改' : '讀取') + '資料。' };
  };
  M.hash = text => {
    let h = 2166136261;
    for (const c of String(text)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0');
  };
  M.http = (method, value) => {
    const query = 'q=' + encodeURIComponent(String(value).slice(0, 80));
    return method === 'GET'
      ? { line: 'GET /search?' + query + ' HTTP/1.1', url: 'https://school.example/search?' + query, headers: 'Host: school.example', body: '（本例沒有訊息主體）' }
      : { line: 'POST /search HTTP/1.1', url: 'https://school.example/search', headers: 'Host: school.example\nContent-Type: application/x-www-form-urlencoded', body: query };
  };
  M.dhcp = (used, requested) => {
    const pool = [21, 22, 23].map(n => '192.0.2.' + n);
    const free = pool.find(ip => !used.includes(ip));
    return { offered: free || null, granted: requested ? pool.includes(requested) && !used.includes(requested) : !!free };
  };
  M.permission = (role, action) => role === 'owner' || (role === 'editor' && ['read', 'write'].includes(action)) || (role === 'viewer' && action === 'read');
  M.cascade = ({ inherited, tag, klass, id, inline }) => {
    const candidates = [{ name: '父元素繼承', specificity: '繼承值', value: inherited, rank: 0 }];
    if (tag) candidates.push({ name: 'p', specificity: '0,0,1', value: '#2563eb', rank: 1 });
    if (klass) candidates.push({ name: '.notice', specificity: '0,1,0', value: '#c2410c', rank: 10 });
    if (id) candidates.push({ name: '#message', specificity: '1,0,0', value: '#7c3aed', rank: 100 });
    if (inline) candidates.push({ name: 'style 屬性', specificity: '行內樣式', value: '#047857', rank: 1000 });
    return { candidates, winner: candidates[candidates.length - 1] };
  };
  M.validateAge = age => /^\d{1,3}$/.test(String(age)) && +age >= 12 && +age <= 100;
  M.webResult = (age, bypass, consent, cookie) => ({ client: bypass || M.validateAge(age), server: M.validateAge(age), cookie: consent ? (cookie || 'demo-session-7') : null });
  root.ICTNetworkModels = M;
  const registry = root.ICT_TOPIC_SIMS ||= [];
  const E = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const S = (tag, attrs = {}) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const append = (p, ...children) => { p.append(...children); return p; };
  const note = host => { const n = E('p', '', 'nt-caption'); n.setAttribute('role', 'status'); n.setAttribute('aria-live', 'polite'); host.append(n); return n; };
  const button = (p, text, fn, cls = '') => { const b = E('button', text, cls); b.type = 'button'; b.addEventListener('click', fn); p.append(b); return b; };
  const control = (p, label, type, value, options) => {
    const wrap = E('label', undefined, 'nt-control'), span = E('span', label), n = E(type === 'select' ? 'select' : 'input');
    if (type === 'select') options.forEach(([v, t]) => { const o = E('option', t); o.value = v; n.append(o); });
    else n.type = type;
    if (type === 'checkbox') n.checked = !!value; else n.value = value;
    append(wrap, span, n); p.append(wrap); return n;
  };
  const svg = (host, label, w = 650, h = 370) => { const wrap = E('div', undefined, 'nt-diagram-scroll'); wrap.tabIndex = 0; wrap.setAttribute('aria-label', label + '；窄螢幕可水平捲動'); const n = S('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label, class: 'nt-svg' }); wrap.append(n); host.append(wrap); return n; };
  const txt = (s, x, y, text, cls) => { const n = S('text', { x, y, class: cls || '', 'text-anchor': 'middle' }); n.textContent = text; s.append(n); return n; };
  const line = (s, points, cls = 'nt-wire') => { const p = S('polyline', { points: points.map(p => p.join(',')).join(' '), class: cls, fill: 'none' }); s.append(p); return p; };
  function computer(s, x, y, name, server = false) {
    const g = S('g', { class: server ? 'nt-machine nt-server' : 'nt-machine' });
    if (server) {
      g.append(S('rect', { x: x - 39, y: y - 46, width: 78, height: 88, rx: 8 }));
      [y - 28, y - 5, y + 18].forEach(yy => { g.append(S('rect', { x: x - 28, y: yy - 7, width: 56, height: 15, rx: 3, class: 'nt-slot' })); g.append(S('circle', { cx: x + 18, cy: yy, r: 3, class: 'nt-led' })); });
    } else {
      g.append(S('rect', { x: x - 40, y: y - 28, width: 80, height: 50, rx: 5 }));
      g.append(S('rect', { x: x - 30, y: y - 19, width: 60, height: 30, rx: 2, class: 'nt-screen' }));
      g.append(S('path', { d: `M${x},${y + 22}v11m-23,1h46`, class: 'nt-wire' }));
    }
    s.append(g); txt(s, x, y + (server ? 62 : 52), name); return g;
  }
  function movePacket(s, points, label, api, color = '#f59e0b') {
    const width = Math.max(50, label.length * 8 + 18);
    const g = S('g', { class: 'nt-packet' }); g.append(S('rect', { x: -width / 2, y: -12, width, height: 24, rx: 7, fill: color }));
    const t = S('text', { x: 0, y: 5, 'text-anchor': 'middle', class: 'nt-packet-label' }); t.textContent = label; g.append(t); s.append(g);
    const reduced = root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    g.setAttribute('transform', `translate(${points.at(-1).join(' ')})`);
    if (!reduced && g.animate) {
      const anim = g.animate(points.map(([x, y]) => ({ transform: `translate(${x}px,${y}px)` })), { duration: 650, easing: 'linear', fill: 'forwards' });
      api.onCleanup?.(() => anim.cancel());
    }
    return g;
  }
  function transport(host, step, reset, api, period = 900) {
    const row = E('div', undefined, 'nt-controls'); host.append(row); let timer;
    const stop = () => { clearInterval(timer); timer = null; play.textContent = '▶ 播放'; play.setAttribute('aria-pressed', 'false'); };
    const tick = () => { if (step() === false) stop(); };
    const play = button(row, '▶ 播放', () => { if (timer) stop(); else { play.textContent = 'Ⅱ 暫停'; play.setAttribute('aria-pressed', 'true'); tick(); if (play.getAttribute('aria-pressed') === 'true') timer = setInterval(tick, period); } });
    play.setAttribute('aria-pressed', 'false');
    button(row, '下一步 →', () => { stop(); tick(); }); button(row, '↺ 重設', () => { stop(); reset(); }); api.onCleanup?.(stop);
    return { stop, row };
  }
  const register = spec => registry.push({ ...spec, mount(host, api) { host.classList.add('nt'); spec.build(host, api || {}); } });

  register({ id: 'network-request-topology', title: '客戶端與伺服器：封包真的走到哪裡？', topics: ['client-server'],
    description: '三部電腦同時索取檔案，觀察請求排隊、回應路徑，以及中央伺服器失效與點對點分享的差別。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr);
      const mode = control(ctr, '架構', 'select', 'server', [['server', '客戶端／伺服器'], ['p2p', '點對點 P2P']]);
      const fail = control(ctr, '中央伺服器故障', 'checkbox', false);
      const stage = E('div', undefined, 'nt-topology'); host.append(stage); const s = svg(stage, '三部客戶端透過交換器向伺服器索取檔案');
      const queue = E('div', undefined, 'nt-request-queue'); queue.setAttribute('aria-label', '服務請求佇列'); stage.append(queue);
      const caption = note(host); let pending = [], active = null, phase = 0, serial = 0, packet;
      const draw = () => {
        s.replaceChildren();
        [0, 1, 2].forEach(i => line(s, [[110, 78 + i * 108], [310, 186]])); line(s, [[310, 186], [530, 186]]);
        [0, 1, 2].forEach(i => computer(s, 70, 78 + i * 108, '電腦 ' + (i + 1)));
        s.append(S('rect', { x: 279, y: 164, width: 62, height: 44, rx: 6, class: 'nt-switch' })); txt(s, 310, 239, '交換器');
        const server = computer(s, 570, 186, '檔案伺服器', true); server.classList.toggle('nt-failed', fail.checked);
        if (mode.value === 'p2p') { txt(s, 465, 300, '每部電腦可同時是客戶端及伺服器'); server.classList.add('nt-dim'); }
        if (fail.checked) txt(s, 570, 95, '✕ 服務停止', 'nt-alert');
        queue.replaceChildren(E('strong', mode.value === 'server' ? '伺服器工作佇列' : '對等電腦的分享請求'));
        if (!pending.length && !active) queue.append(E('span', '等待請求…'));
        if (active) queue.append(E('span', '正在處理 #' + active.id + '（電腦 ' + (active.client + 1) + '）', 'nt-current-job'));
        pending.forEach(r => queue.append(E('span', '#' + r.id + ' 電腦 ' + (r.client + 1))));
      };
      const step = () => {
        if (!active) { active = pending.shift(); phase = 0; if (!active) { caption.textContent = '點選電腦按鈕加入請求；可連續加入多個，觀察排隊。'; draw(); return false; } }
        draw(); const route = M.route(mode.value, active.client, fail.checked);
        if (!route.available && phase >= 1) { caption.textContent = `請求 #${active.id} 到達失效的伺服器，無法取得檔案。交換器仍運作，但不能代替伺服器提供檔案服務。`; active = null; draw(); return pending.length > 0; }
        if (phase === 0) { packet = movePacket(s, route.points, '請求', api); caption.textContent = `電腦 ${active.client + 1} 發出請求，${mode.value === 'server' ? '由交換器轉送到檔案伺服器' : '向電腦 ' + (route.destination + 1) + ' 索取它分享的檔案'}。`; }
        if (phase === 1) { const pt = route.points.at(-1); s.append(S('circle', { cx: pt[0], cy: pt[1], r: 41, class: 'nt-processing' })); caption.textContent = `接收請求的${mode.value === 'server' ? '中央伺服器' : '對等電腦'}讀取檔案，準備回應。本例用單一工作佇列示範資源共享；實際伺服器可並行處理多個請求。`; }
        if (phase === 2) { packet = movePacket(s, [...route.points].reverse(), '檔案', api, '#10b981'); caption.textContent = `檔案資料沿回程送往電腦 ${active.client + 1}。此處用一個符號代表回應；實際檔案通常分成多個封包。`; }
        if (phase === 3) { caption.textContent = `電腦 ${active.client + 1} 收到檔案，請求 #${active.id} 完成。${mode.value === 'p2p' ? '中央伺服器故障不影響這次對等分享；若分享檔案的電腦離線，該檔案仍會不可用。' : '下一個排隊請求現在可取得服務。'}`; active = null; draw(); }
        phase++; return true;
      };
      const reset = () => { pending = []; active = null; serial = 0; draw(); caption.textContent = '選取電腦發送請求，再按播放或下一步。線路表示連接，移動方塊表示本次請求及檔案回應。'; };
      const playback = transport(host, step, reset, api);
      [0, 1, 2].forEach(i => button(ctr, '電腦 ' + (i + 1) + '：索取檔案', () => { if (pending.length >= 8) { caption.textContent = '示範佇列最多容納 8 個待處理請求；先完成部分請求。'; return; } pending.push({ id: ++serial, client: i }); draw(); caption.textContent = '已加入請求；按播放或下一步跟隨封包。'; }));
      mode.onchange = () => { playback.stop(); reset(); }; fail.onchange = () => { draw(); caption.textContent = fail.checked ? '中央伺服器已停止；比較兩種架構的請求結果。' : '中央伺服器恢復服務。'; }; reset();
    }
  });

  register({ id: 'dns-tcp-packets', title: '由域名到可靠傳送：DNS、序號與 ACK', topics: ['tcp-dns'],
    description: '先取得 IP 位址，再建立 TCP 連線；刻意丟失第 2 段，親眼追蹤逾時重傳及下一個預期位元組。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr); const drop = control(ctr, '第 2 段遺失一次', 'checkbox', true);
      const s = svg(host, '上方 DNS 解析，下方為客戶端和伺服器之間的 TCP 封包往返', 700, 380);
      const inbox = E('div', undefined, 'nt-tcp-inbox'); host.append(inbox); const caption = note(host); let n = -1, frames, received = new Set();
      const draw = f => {
        s.replaceChildren();
        computer(s, 75, 75, '客戶端'); computer(s, 350, 75, 'DNS 解析器', true); computer(s, 625, 75, '網站伺服器', true);
        line(s, [[120, 75], [300, 75]]); txt(s, 215, 40, '名稱 → IP 位址');
        line(s, [[75, 180], [75, 350]]); line(s, [[625, 180], [625, 350]]); txt(s, 75, 168, '客戶端'); txt(s, 625, 168, '伺服器');
        txt(s, 350, 365, 'TCP 傳送資料：每段 500 個位元組');
        if (f?.type === 'dns') { if (f.at === 1) movePacket(s, [[120, 75], [300, 75]], '查詢', api); if (f.at >= 2) movePacket(s, [[300, 75], [120, 75]], 'IP', api, '#10b981'); if (f.at === 3) txt(s, 350, 142, '快取：learn.school.example → 192.0.2.20'); }
        if (f?.dir) {
          const y = f.type === 'ack' ? 290 : 235; let pts = f.dir === 'out' ? [[75, y], [625, y]] : [[625, y], [75, y]];
          if (f.lost) { pts = [[75, y], [350, y]]; txt(s, 410, y + 5, '✕ 遺失', 'nt-alert'); }
          line(s, pts, f.type === 'ack' ? 'nt-wire nt-ack-wire' : 'nt-wire nt-data-wire'); movePacket(s, pts, f.label, api, f.type === 'ack' ? '#10b981' : '#f59e0b');
        }
        if (f?.type === 'timeout') { txt(s, 350, 235, '◷ 等待 ACK → 計時器逾時', 'nt-alert'); }
        if (f?.type === 'ack') received.add(f.n);
        inbox.replaceChildren(E('strong', '接收端資料重組 ')); [1, 2, 3].forEach(i => inbox.append(E('span', `第 ${i} 段 ${received.has(i) ? '✓' : '…'}`, received.has(i) ? 'nt-received' : '')));
      };
      const reset = () => { n = -1; received = new Set(); frames = M.tcpFrames(drop.checked); draw(); caption.textContent = '輸入的是域名，不是 IP。按下一步開始觀察 DNS 解析。文件範例位址不會被真正連線。'; };
      const p = transport(host, () => { if (++n >= frames.length) return false; draw(frames[n]); caption.textContent = frames[n].text; return n < frames.length - 1; }, reset, api, 1100);
      drop.onchange = () => { p.stop(); reset(); }; reset();
    }
  });

  register({ id: 'stream-buffer-tank', title: '串流緩衝槽：網速下降多久才停頓？', topics: ['streaming'],
    description: '接收數據注入緩衝槽，播放器持續取用。改變兩條流速，觀察緩衝耗盡、重新緩衝及畫質的取捨。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr); const input = control(ctr, '接收速率 Mbps', 'range', 5); input.min = 0; input.max = 12; input.step = 1;
      const output = control(ctr, '影片位元率 Mbps', 'range', 4); output.min = 2; output.max = 8; output.step = 1;
      const stage = E('div', undefined, 'nt-stream'); const incoming = E('div', undefined, 'nt-inlet'), tank = E('div', undefined, 'nt-tank'), water = E('div', undefined, 'nt-water'), level = E('strong', '', 'nt-water-label');
      append(tank, water, level); const screen = E('div', undefined, 'nt-player'); const film = E('div', undefined, 'nt-film'), screenText = E('strong'); append(screen, film, screenText); append(stage, incoming, tank, screen); host.append(stage);
      const stats = E('div', undefined, 'nt-stream-stats'); host.append(stats); const caption = note(host); let state;
      const render = () => { water.style.height = state.buffer / state.capacity * 100 + '%'; level.textContent = `${state.buffer.toFixed(1)} Mb / ${state.capacity} Mb`; incoming.textContent = `接收 ↓ ${input.value} Mbps`; screenText.textContent = state.stalled ? '◷ 正在重新緩衝' : `▶ 已播放 ${state.played} 秒`; screen.classList.toggle('nt-stalled', state.stalled); film.style.setProperty('--frame', state.played % 8); stats.textContent = `經過 ${state.elapsed} 秒 ｜ 輸出 ${output.value} Mbps ｜ 可播放緩衝約 ${(state.buffer / +output.value).toFixed(1)} 秒`; };
      const reset = () => { state = { capacity: 24, buffer: 12, stalled: false, elapsed: 0, played: 0, received: 0 }; render(); caption.textContent = '初始緩衝 12 Mb。每一步代表 1 秒；緩衝耗盡後，本例等待累積約 2 秒影片才重新播放。'; };
      transport(host, () => { state = M.bufferTick(state, +input.value, +output.value); render(); caption.textContent = state.stalled ? '接收數據仍在累積，但不足以重新開始播放。可增加網速或降低影片位元率。' : (+input.value < +output.value ? '輸出快於輸入：正在消耗先前緩衝；緩衝只延遲停頓，不能長期補足不足的頻寬。' : '輸入足以支援播放，餘下數據存入緩衝；槽滿後不再預先接收。'); return true; }, reset, api, 1000);
      input.oninput = render; output.oninput = render; reset();
    }
  });

  register({ id: 'html-dom-tree', title: 'HTML 如何長成 DOM 樹及網頁？', topics: ['web-dom'],
    description: '編輯真實的巢狀標籤；標籤、DOM 父子關係與渲染結果同步對照。點選樹上的節點可定位網頁元素。',
    build(host) {
      const label = E('label', 'HTML 原始碼（支援 main、h1、h2、p、strong、em、ul、li；不支援屬性）', 'nt-editor-label'); const editor = E('textarea'); editor.value = '<main>\n  <h1>校園新聞</h1>\n  <p>今天有<strong>運動會</strong>！</p>\n  <ul><li>跑步</li><li>跳遠</li></ul>\n</main>'; editor.spellcheck = false; label.append(editor); host.append(label);
      const layout = E('div', undefined, 'nt-dom-layout'), tree = E('div', undefined, 'nt-dom-tree'), preview = E('div', undefined, 'nt-dom-preview'); append(layout, append(E('section'), E('h4', 'DOM 節點樹'), tree), append(E('section'), E('h4', '瀏覽器渲染'), preview)); host.append(layout); const caption = note(host);
      const update = () => {
        tree.replaceChildren(); preview.replaceChildren(); const parsed = M.parseHTML(editor.value); const elementMap = new Map();
        function render(node) { if (node.text !== undefined) return document.createTextNode(node.text); const el = E(node.tag); elementMap.set(node, el); node.children.forEach(c => el.append(render(c))); return el; }
        parsed.tree.children.forEach(n => preview.append(render(n)));
        function branch(node) {
          const li = E('li'); const text = node.text !== undefined ? '#text ' + JSON.stringify(node.text.trim() || '空白') : '<' + node.tag + '>';
          const b = button(li, text, () => { preview.querySelectorAll('.nt-dom-selected').forEach(n => n.classList.remove('nt-dom-selected')); const el = elementMap.get(node); if (el) el.classList.add('nt-dom-selected'); caption.textContent = node.text !== undefined ? '文字也是 DOM 節點；不是 HTML 元素。' : `<${node.tag}> 是元素節點，有 ${node.children.length} 個直接子節點（包括空白文字）。`; }, 'nt-tree-node');
          if (node.children?.length) { const ul = E('ul'); node.children.forEach(c => ul.append(branch(c))); li.append(ul); } return li;
        }
        const ul = E('ul'); ul.append(branch(parsed.tree)); tree.append(ul); caption.textContent = parsed.errors.length ? parsed.errors.join('；') + '。不支援標記會被忽略，不會執行。' : 'HTML 由外至內形成父子關係。點選樹上的元素；直接子節點與所有後代節點的數目可以不同。';
      };
      editor.addEventListener('input', update); update();
    }
  });

  register({ id: 'security-firewall-gates', title: '封包過了防火牆，就能改成績嗎？', topics: ['security-flow'],
    description: '把連接埠過濾、身分驗證及權限授權放在不同關卡；再觀察釣魚 HTTPS 連線為何不一定被防火牆阻止。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr);
      const scenario = control(ctr, '情境', 'select', 'web', [['web', '校內網站 HTTPS :443'], ['ssh', '遠端管理 SSH :22'], ['phish', '電郵內的釣魚 HTTPS 網站']]);
      const allow443 = control(ctr, '允許 443', 'checkbox', true), allow22 = control(ctr, '允許 22', 'checkbox', false), logged = control(ctr, '身分驗證成功', 'checkbox', true);
      const role = control(ctr, '帳戶角色', 'select', 'student', [['student', '學生'], ['teacher', '教師']]), action = control(ctr, '操作', 'select', 'write', [['read', '讀取成績'], ['write', '修改成績']]);
      const mail = E('div', undefined, 'nt-phishing-mail'); append(mail, E('strong', '📨 「學校 IT 支援」：請立即重新驗證帳戶'), E('p', '寄件人：support@school-login.example　連結： https://school-login.example/verify'), E('small', '本校示範域名：school.example。HTTPS 可保護傳輸及驗證所連網站，不能證明電郵內容可信。')); host.append(mail);
      const s = svg(host, '封包依次通過防火牆、身分驗證及授權三道不同的關卡', 740, 240); const caption = note(host); let phase = 0;
      const draw = result => {
        s.replaceChildren(); mail.hidden = scenario.value !== 'phish'; const labels = scenario.value === 'phish' ? ['使用者', '允許 HTTPS', '仿冒登入頁', '輸入密碼', '外洩'] : ['互聯網', '防火牆', '身分驗證', '授權', '資料庫'];
        line(s, [[55, 110], [685, 110]]);
        labels.forEach((label, i) => { const x = 55 + i * 157; const blocked = result && !result.allowed && i === phase && i === result.stage && (scenario.value !== 'phish' || !allow443.checked); s.append(S('rect', { x: x - 43, y: 66, width: 86, height: 88, rx: i === 1 ? 2 : 14, class: 'nt-gate ' + (i <= phase ? 'nt-gate-reached' : '') + (blocked ? ' nt-gate-blocked' : '') })); txt(s, x, 115, label); txt(s, x, 183, i === 1 ? (allow443.checked ? '443 ✓' : '443 ✕') + ' / ' + (allow22.checked ? '22 ✓' : '22 ✕') : ''); });
      };
      const reset = () => { phase = 0; draw(); caption.textContent = '先設定規則及使用者條件，再逐關檢查。預設只允許網站 HTTPS 的 443 連接埠。'; };
      const p = transport(host, () => {
        const result = M.access({ port: scenario.value === 'ssh' ? 22 : 443, allow443: allow443.checked, allow22: allow22.checked, authenticated: logged.checked, role: role.value, action: action.value });
        if (phase >= 4 || (phase >= result.stage && !result.allowed && scenario.value !== 'phish') || (scenario.value === 'phish' && !allow443.checked && phase >= 1)) return false;
        phase++; draw(result); movePacket(s, [[55 + (phase - 1) * 157, 110], [55 + phase * 157, 110]], scenario.value === 'ssh' ? ':22' : ':443', api);
        if (scenario.value === 'phish') caption.textContent = !allow443.checked ? '防火牆規則拒絕 443 連線。' : ['','一般防火牆允許 443，不能單靠連接埠規則辨別釣魚內容。','瀏覽器連到仿冒域名；即使有 HTTPS，仍不是學校網站。','使用者若在仿冒頁輸入密碼，資料會送給該網站。','密碼外洩。核對完整域名、獨立開啟可信網站及多重身分驗證可降低風險。'][phase];
        else caption.textContent = phase === result.stage ? result.text : ['','檢查目的連接埠是否符合允許規則。','應用程式檢查登入資料，確認「你是誰」。','已登入後，再檢查角色是否可進行此操作。','操作成功。'][phase];
        return phase < (scenario.value === 'phish' ? (allow443.checked ? 4 : 1) : result.stage);
      }, reset, api, 1100);
      [scenario, allow443, allow22, logged, role, action].forEach(c => c.onchange = () => { p.stop(); reset(); }); reset();
    }
  });

  register({ id: 'crypto-signature-workbench', title: '加密與數碼簽署：鑰匙的方向不同', topics: ['crypto-pki'],
    description: '改動原文、截取密文或竄改訊息，逐步分辨保密性、完整性和發送者驗證。此處符號及短雜湊只供教學。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr); const mode = control(ctr, '工作模式', 'select', 'sign', [['sign', '數碼簽署：完整性／來源驗證'], ['encrypt', '公開鑰匙加密：保密性']]);
      const message = control(ctr, '發送原文', 'text', '明天九時交功課'), tamper = control(ctr, '傳送途中竄改', 'checkbox', false); message.maxLength = 60;
      const stage = E('div', undefined, 'nt-crypto'); host.append(stage); const caption = note(host); let phase = 0;
      const draw = () => {
        stage.replaceChildren(); const signed = mode.value === 'sign', text = message.value, received = tamper.checked ? text + '（已改）' : text;
        const sender = E('div', undefined, 'nt-crypto-person'), wire = E('div', undefined, 'nt-crypto-channel'), recipient = E('div', undefined, 'nt-crypto-person');
        append(sender, E('h4', '發送者 Alice'), E('blockquote', text), E('div', signed ? '🔑 Alice 私人鑰匙' : '🔓 Bob 公開鑰匙', 'nt-key'));
        append(recipient, E('h4', '接收者 Bob'), E('div', signed ? '🔓 Alice 公開鑰匙' : '🔑 Bob 私人鑰匙', 'nt-key'));
        if (signed) {
          sender.append(E('code', 'H(原文) = ' + M.hash(text)));
          if (phase >= 1) sender.append(E('div', '✒ 簽署雜湊 → 簽章 σ', 'nt-seal'));
          if (phase >= 2) append(wire, E('small', '公開通道 →'), E('blockquote', received), E('div', '簽章 σ', 'nt-seal'));
          if (phase >= 3) append(recipient, E('code', 'H(收到訊息) = ' + M.hash(received)), E('div', '驗證 σ 與收到的訊息'));
          if (phase >= 4) recipient.append(E('strong', tamper.checked ? '✕ 驗證失敗：訊息／簽章不符' : '✓ 驗證成功', tamper.checked ? 'nt-bad' : 'nt-good'));
        } else {
          if (phase >= 1) sender.append(E('div', '🔒 用 Bob 公開鑰匙加密', 'nt-cipher'));
          if (phase >= 2) append(wire, E('small', '公開通道 →'), E('code', tamper.checked ? '密文：7X!⧫竄改⧫' : '密文：7X!⧫K9?F2'), E('small', '旁觀者看到密文，沒有 Bob 私人鑰匙。'));
          if (phase >= 3) recipient.append(E('div', '🔑 用 Bob 私人鑰匙解密', 'nt-cipher'));
          if (phase >= 4) recipient.append(E('blockquote', tamper.checked ? '密文被竄改：不能假設可還原正確原文。' : text));
        }
        append(stage, sender, wire, recipient);
      };
      const captions = () => mode.value === 'sign' ? ['原文經雜湊產生摘要；本例短碼是教學用雜湊，不是安全密碼學演算法。','Alice 用私人鑰匙簽署摘要。私人鑰匙不能公開。','傳送「原文＋簽章」。旁觀者仍能讀原文；簽署本身不提供保密性。','Bob 用可信的 Alice 公開鑰匙驗證簽章，並把驗證與收到訊息的雜湊相連。','驗證成功須依賴正確而可信的公開鑰匙；數碼證書及受信任 CA 有助把身分與公開鑰匙聯繫。'] : ['目標是只有 Bob 能讀訊息。Alice 先取得可信的 Bob 公開鑰匙。','公開鑰匙可向任何人公開，用它加密給 Bob 的訊息。','通道上只有密文。本例符號不是可用的加密實作。','只有持有 Bob 私人鑰匙者才能解密這個訊息。','加密與數碼簽署目的不同。單靠此加密流程不能確認發送者就是 Alice；竄改偵測也須有適當驗證機制。'];
      const reset = () => { phase = 0; draw(); caption.textContent = captions()[0]; }; const p = transport(host, () => { if (phase >= 4) return false; phase++; draw(); caption.textContent = captions()[phase]; return phase < 4; }, reset, api, 1300);
      [mode, tamper].forEach(c => c.onchange = () => { p.stop(); reset(); }); message.oninput = () => { p.stop(); reset(); }; reset();
    }
  });

  register({ id: 'http-wire-inspector', title: 'GET 和 POST：資料放進哪一部分？', topics: ['http-request'],
    description: '輸入查詢字詞，觀察 URL、HTTP 起始行、標頭及訊息主體的實際差別，再把請求送往伺服器取得回應。',
    build(host, api) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr); const method = control(ctr, '方法', 'select', 'GET', [['GET', 'GET'], ['POST', 'POST']]), value = control(ctr, '搜尋字詞', 'text', 'ICT 動畫'); value.maxLength = 80;
      const address = E('div', undefined, 'nt-address'); host.append(address); const wire = E('div', undefined, 'nt-http-wire'), req = E('pre', undefined, 'nt-http-message'), arrow = E('div', '→', 'nt-http-arrow'), response = E('pre', '', 'nt-http-response'); append(wire, req, arrow, response); host.append(wire); const caption = note(host); let phase = 0;
      const draw = () => { const q = M.http(method.value, value.value); address.textContent = '🌐 ' + q.url; req.textContent = q.line + '\n' + q.headers + '\n\n' + q.body; req.classList.toggle('nt-http-sent', phase >= 1); response.textContent = phase >= 2 ? 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n<h1>搜尋結果</h1>\n<p>找到 3 項教材</p>' : '伺服器等待請求'; response.classList.toggle('nt-http-ready', phase >= 2); arrow.textContent = phase >= 2 ? '← 回應' : '請求 →'; };
      const reset = () => { phase = 0; draw(); caption.textContent = 'GET 本例把查詢放在 URL；POST 本例把資料放在主體。兩者的格式均可被查看，敏感資料仍需要 HTTPS。'; };
      const p = transport(host, () => { if (phase >= 2) return false; phase++; draw(); caption.textContent = phase === 1 ? 'HTTP 請求送到伺服器。這裡是安全的本機示範，不會發出真實網絡請求。' : '伺服器傳回狀態碼、回應標頭及 HTML 主體。瀏覽器再解析及渲染 HTML。POST 不會自動加密資料；HTTPS 才保護傳輸。'; return phase < 2; }, reset, api, 1200);
      method.onchange = value.oninput = () => { p.stop(); reset(); }; reset();
    }
  });

  register({ id: 'dhcp-lease-and-sharing', title: 'DHCP 租約：未有 IP 如何先開口？', topics: ['dhcp-permissions'],
    description: '以廣播尋找 DHCP 伺服器，跟隨 Discover、Offer、Request、ACK 的租約分配；取得 IP 後再測試檔案存取權限。',
    build(host, api) {
      const s = svg(host, '尚未有 IP 的電腦透過 DHCP 取得租約；網絡上的其他電腦也收到廣播', 700, 300); const leases = E('div', undefined, 'nt-lease-table'); host.append(leases); const caption = note(host); let phase = 0, used = ['192.0.2.21'];
      const offered = () => M.dhcp(used).offered;
      const draw = () => { s.replaceChildren(); line(s, [[85, 110], [350, 110], [610, 110]]); line(s, [[350, 110], [350, 220]]); computer(s, 85, 110, phase >= 4 ? offered() || '沒有可用 IP' : '0.0.0.0（未配置）'); computer(s, 610, 110, 'DHCP 伺服器', true); computer(s, 350, 220, '其他電腦'); leases.replaceChildren(E('strong', '地址池（教學網段）')); [21, 22, 23].forEach(n => { const ip = '192.0.2.' + n; leases.append(E('span', ip + (used.includes(ip) ? ' 已租出' : phase >= 4 && ip === offered() ? ' → 本機租約 3600 秒' : ' 可用'), used.includes(ip) ? 'nt-occupied' : '')); }); };
      const reset = () => { phase = 0; draw(); caption.textContent = '電腦未配置 IP。DHCP 可集中分配 IP、子網路遮罩、預設閘道及 DNS；本例集中觀察 IP 租約。'; };
      transport(host, () => {
        if (phase >= 4) return false; phase++; draw(); const out = phase === 1 || phase === 3;
        if (out) { movePacket(s, [[85, 110], [350, 110], [610, 110]], phase === 1 ? 'Discover' : 'Request', api); movePacket(s, [[85, 110], [350, 110], [350, 220]], '廣播', api); }
        else movePacket(s, [[610, 110], [85, 110]], phase === 2 ? 'Offer' : 'ACK', api, '#10b981');
        caption.textContent = ['','① Discover：本機廣播尋找 DHCP 伺服器，其他電腦也收到，但不提供租約。','② Offer：伺服器提出可用的 ' + offered() + '。未完成 ACK 前，本機不能當作已獲分配。','③ Request：本機廣播接受選定的租約，亦讓其他 DHCP 伺服器得知選擇。','④ ACK：確認租約，本機開始使用 IP。Offer／ACK 可按情況以廣播或單播傳送；本圖以回應路徑概括。'][phase]; return phase < 4;
      }, reset, api, 1300);
      const controls = E('div', undefined, 'nt-controls'); host.append(controls); const role = control(controls, '共享資料夾角色', 'select', 'viewer', [['viewer', '檢視者'], ['editor', '編輯者'], ['owner', '擁有者']]); const result = E('p', '', 'nt-permission-result'); host.append(result);
      ['read', 'write', 'delete'].forEach((a, i) => button(controls, ['讀取檔案', '修改檔案', '刪除檔案'][i], () => { result.textContent = phase < 4 ? '先取得租約並連接網絡；IP 位址本身不會授予檔案權限。' : (M.permission(role.value, a) ? '✓ 權限允許此操作。' : '✕ 權限不足。') + ' 此示範規則：檢視者只可讀；編輯者可讀／改；擁有者可讀／改／刪。實際權限可逐項配置。'; })); reset();
    }
  });

  let cssSerial = 0;
  register({ id: 'css-cascade-live', title: 'CSS 級聯：同一段文字，哪條規則勝出？', topics: ['css-cascade'],
    description: '逐一啟用選擇器及行內樣式，讓規則直接改變同一個網頁元素；對照繼承、特異性與計算結果。',
    build(host) {
      const ctr = E('div', undefined, 'nt-controls'); host.append(ctr); const inherited = control(ctr, '父元素文字顏色', 'select', '#334155', [['#334155', '灰色'], ['#b91c1c', '紅色']]);
      const toggles = [['tag', 'p 元素選擇器'], ['klass', '.notice 類別'], ['id', '#message 識別碼'], ['inline', '行內 style']].map(([key, label]) => [key, control(ctr, label, 'checkbox', key === 'tag')]);
      const uid = 'nt-cascade-' + (++cssSerial); host.dataset.ntCascade = uid;
      const liveStyle = E('style'); host.append(liveStyle);
      const layout = E('div', undefined, 'nt-css-lab'), rules = E('div', undefined, 'nt-css-rules'), parent = E('div', undefined, 'nt-css-parent'), target = E('p', '校園運動會：星期五見！', 'nt-css-target'); append(parent, E('small', '父元素 <section>'), target); append(layout, rules, parent); host.append(layout); const caption = note(host);
      const update = () => {
        const inputs = Object.fromEntries(toggles.map(([key, c]) => [key, c.checked])); inputs.inherited = inherited.value; const result = M.cascade(inputs); rules.replaceChildren();
        result.candidates.forEach(c => { const row = E('div', undefined, 'nt-css-rule ' + (c === result.winner ? 'nt-css-winner' : '')); append(row, E('code', `${c.name} { color: ${c.value}; }`), E('small', c.specificity + (c === result.winner ? ' → 採用 ✓' : ' → 被覆蓋'))); rules.append(row); });
        // The browser applies actual selectors; the pure model only annotates the winner.
        const scope = `[data-nt-cascade="${uid}"] .nt-css-parent`;
        liveStyle.textContent = (inputs.tag ? `${scope} p {color:#2563eb}` : '') + (inputs.klass ? `${scope} .notice {color:#c2410c}` : '') + (inputs.id ? `${scope} #${uid}-message {color:#7c3aed}` : '');
        parent.style.color = inherited.value; target.classList.toggle('notice', inputs.klass); target.id = inputs.id ? uid + '-message' : ''; target.style.color = inputs.inline ? '#047857' : '';
        caption.textContent = `計算後 color = ${result.winner.value}。本例規則均屬一般作者樣式，沒有 !important 或級聯層；行內樣式優先於一般選擇器，同級再比特異性，仍相同才看出現次序。父元素顏色只在子元素沒有指定值時繼承。`;
      };
      inherited.onchange = update; toggles.forEach(([, c]) => c.onchange = update); update();
    }
  });

  register({ id: 'webapp-request-lifecycle', title: '網頁應用程式：從表單到資料庫再回來', topics: ['webapp'],
    description: '故意略過客戶端驗證，觀察伺服器仍須檢查資料；成功才寫入資料庫，再用模擬 cookie 維持會話。',
    build(host, api) {
      const layout = E('div', undefined, 'nt-webapp'); const browser = E('section', undefined, 'nt-web-browser'), server = E('section', undefined, 'nt-web-server'), db = E('section', undefined, 'nt-web-db'); append(browser, E('h4', '🌐 瀏覽器'), E('small', '報名表：年齡 12–100')); append(server, E('h4', '⚙ 伺服器')); append(db, E('h4', '▤ 資料庫')); append(layout, browser, server, db); host.append(layout);
      const age = control(browser, '年齡', 'text', '16'); age.inputMode = 'numeric'; age.maxLength = 8; const bypass = control(browser, '略過客戶端驗證', 'checkbox', false), consent = control(browser, '接受模擬會話 cookie', 'checkbox', true);
      const clientState = E('p'), serverState = E('p'), cookieView = E('code', 'Cookie: （沒有）'), dbRows = E('ol'); browser.append(clientState, cookieView); server.append(serverState); db.append(dbRows); const caption = note(host); let phase = 0, cookie = null, result, records = [], snapshot;
      const reset = () => { phase = 0; clientState.textContent = '尚未提交'; serverState.textContent = '等待請求'; caption.textContent = '表單不會向外傳送。本例採用伺服器端會話：cookie 只存會話識別碼，並不是資料庫中的報名紀錄。'; };
      const step = () => {
        if (phase === 0) { snapshot = { age: age.value, consent: consent.checked }; result = M.webResult(age.value, bypass.checked, consent.checked, cookie); }
        if (phase >= 4) return false; phase++;
        if (phase === 1) { clientState.textContent = result.client ? '✓ 瀏覽器允許傳送' : '✕ 客戶端驗證：年齡不合要求'; caption.textContent = result.client ? '客戶端送出 HTTP POST。使用者可以略過或修改瀏覽器驗證，因此伺服器不能只靠它。' : '瀏覽器即時提示格式／範圍錯誤，尚未發出請求。勾選「略過」可測試伺服器的獨立驗證。'; if (!result.client) { phase = 4; return false; } }
        if (phase === 2) { serverState.textContent = result.server ? '✓ 伺服器獨立驗證成功' : '✕ HTTP 400：拒絕無效年齡'; caption.textContent = result.server ? '伺服器重新檢查型別與範圍，然後才允許寫入資料庫。' : '即使客戶端被略過，伺服器仍拒絕錯誤資料；資料庫沒有新紀錄。'; if (!result.server) { phase = 4; return false; } }
        if (phase === 3) { records.push(snapshot.age); dbRows.append(E('li', '報名 #' + records.length + '：' + snapshot.age + ' 歲')); caption.textContent = '驗證通過才寫入資料庫。本例每次成功提交建立一筆紀錄；正式系統還須處理重複提交、授權及安全查詢。'; }
        if (phase === 4) { cookie = snapshot.consent ? result.cookie : null; cookieView.textContent = 'Cookie: ' + (cookie ? 'sid=' + cookie : '（沒有）'); serverState.textContent = 'HTTP 201 Created → 已完成報名'; caption.textContent = cookie ? '伺服器以 Set-Cookie 回傳會話識別碼；瀏覽器下次向相同網站請求時可送回 Cookie。此頁只是記憶體模擬，沒有設定真 cookie。' : '報名資料已寫入，但沒有保留會話 cookie。cookie 與資料庫是不同儲存位置，不能互相代替。'; }
        layout.dataset.phase = phase; return phase < 4;
      };
      const p = transport(host, step, reset, api, 1300); [age, bypass, consent].forEach(c => c.addEventListener(c === age ? 'input' : 'change', () => { p.stop(); reset(); })); button(p.row, '模擬下一次請求', () => { caption.textContent = cookie ? '瀏覽器 → Cookie: sid=' + cookie + '。伺服器查找這個識別碼對應的會話；不需要每頁重新輸入登入資料。' : '瀏覽器沒有會話 cookie；伺服器不能只靠這次請求識別上一次會話。'; }); reset();
    }
  });
})(typeof window === 'undefined' ? globalThis : window);
