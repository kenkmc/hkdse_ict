/* Local, parameter-driven models. No dependency, request, audio, or automatic playback. */
(() => {
  'use strict';
  const running = new Set();
  const NS = 'http://www.w3.org/2000/svg';
  let serial = 0;
  const E = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  const S = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v))); return e; };
  function panel(target, title, intro, invariant) {
    const box = E('section', undefined, 'im-model'), heading = E('h3', title);
    heading.id = 'im-model-' + (++serial); box.setAttribute('aria-labelledby', heading.id);
    box.append(heading, E('p', intro, 'im-intro'));
    const fields = E('div', undefined, 'im-fields'), visual = E('div', undefined, 'im-visual'), status = E('p', '', 'im-status');
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    box.append(fields, visual, status, E('p', invariant, 'im-invariant')); target.append(box);
    return {box, fields, visual, status};
  }
  function field(parent, text, type, value, options) {
    const label = E('label', text), input = E(type === 'select' ? 'select' : 'input');
    if (type !== 'select') input.type = type;
    input.setAttribute('aria-label', text);
    if (options) options.forEach(([v, t]) => { const o = E('option', t); o.value = v; input.append(o); });
    input.value = value; label.append(input); parent.append(label); return input;
  }
  function button(parent, text, fn) { const b = E('button', text); b.type = 'button'; b.addEventListener('click', fn); parent.append(b); return b; }
  function message(p, text, error = false) { p.status.textContent = text; p.status.classList.toggle('is-error', error); }
  function integer(input, min, max) { if (!input.value.trim()) return null; const v = Number(input.value); return Number.isInteger(v) && v >= min && v <= max ? v : null; }
  function playback(p, tick, reset, base = 700) {
    const row = E('div', undefined, 'im-controls'); p.visual.after(row);
    let timer = null;
    const play = button(row, '播放', () => { if (timer !== null) stop(); else { play.textContent = '暫停'; play.setAttribute('aria-pressed', 'true'); schedule(); } });
    const next = button(row, '單步', () => { stop(); tick(); });
    button(row, '重設', () => { stop(); reset(); });
    const speed = field(row, '速度', 'select', '1', [['2', '慢'], ['1', '標準'], ['0.5', '快']]);
    function stop() { clearTimeout(timer); timer = null; play.textContent = '播放'; play.setAttribute('aria-pressed', 'false'); }
    function schedule() { timer = setTimeout(() => { timer = null; if (tick()) schedule(); else stop(); }, base * Number(speed.value)); }
    speed.addEventListener('change', () => { if (timer !== null) { stop(); play.textContent = '暫停'; play.setAttribute('aria-pressed', 'true'); schedule(); } });
    const api = {stop, finish(done) { if (done) stop(); play.disabled = done; next.disabled = done; }};
    running.add(api); return api;
  }
  function twosComplement(a, b, bits) {
    if (![4, 8].includes(bits) || ![a, b].every(Number.isInteger)) throw new Error('位元數及運算元無效');
    const mod = 2 ** bits, min = -(mod / 2), max = mod / 2 - 1;
    if (a < min || a > max || b < min || b > max) throw new Error('運算元超出補碼表示範圍');
    const ua = (a + mod) % mod, ub = (b + mod) % mod, unsigned = (ua + ub) % mod;
    let carry = 0; const columns = [];
    for (let i = 0; i < bits; i++) { const x = (ua >> i) & 1, y = (ub >> i) & 1, total = x + y + carry; columns.push({x, y, carryIn: carry, out: total % 2, carryOut: Math.floor(total / 2)}); carry = Math.floor(total / 2); }
    return {a, b, bits, ua, ub, unsigned, stored: unsigned >= mod / 2 ? unsigned - mod : unsigned, sum: a + b, overflow: a + b < min || a + b > max, carryOut: carry, columns};
  }
  function mountBinary(target) {
    const p = panel(target, '可調模型：補碼相加與溢出', '選 4 或 8 位元及兩個整數，再逐位觀察由最低有效位開始相加。這是固定位元寬度模型。', '不變量：每一欄都滿足 A 位元 + B 位元 + 進位 = 結果位元 + 2 × 下一欄進位。帶符號溢出取決於結果超出範圍，不能只看最高位進位。');
    const bits = field(p.fields, '位元數', 'select', '4', [['4', '4 位元'], ['8', '8 位元']]), a = field(p.fields, 'A（整數）', 'number', '7'), b = field(p.fields, 'B（整數）', 'number', '3');
    a.step = b.step = '1'; let model = null, position = 0, control;
    function draw() {
      p.visual.replaceChildren(); if (!model) return;
      const width = model.bits, table = E('div', undefined, 'im-bits'); table.style.setProperty('--im-bits', width);
      const strings = [model.ua, model.ub, model.unsigned].map(v => v.toString(2).padStart(width, '0'));
      const labels = ['權重', 'A', 'B', '結果'];
      labels.forEach((label, row) => { const line = E('div', undefined, 'im-bitrow'); line.append(E('span', label));
        for (let i = 0; i < width; i++) { const fromRight = width - 1 - i, active = position > 0 && fromRight === position - 1; let value = row === 0 ? String(i === 0 ? -(2 ** fromRight) : 2 ** fromRight) : strings[row - 1][i]; if (row === 3 && fromRight >= position) value = '·'; const cell = E('span', value, row === 0 ? '' : 'im-bit' + (active ? ' is-active' : '')); line.append(cell); } table.append(line);
      }); p.visual.append(table);
      const result = E('div', undefined, 'im-result'); result.append(E('span', '表示範圍：' + (-(2 ** (width - 1))) + ' 至 ' + (2 ** (width - 1) - 1)));
      if (position === width) { result.append(E('span', '數學答案：' + model.sum), E('span', '固定位元儲存值：' + model.stored), E('span', '最高位進位：' + model.carryOut), E('span', model.overflow ? '帶符號溢出：有' : '帶符號溢出：無')); message(p, `${model.a} + ${model.b} = ${model.sum}；${width} 位元留下 ${strings[2]}，按補碼解讀為 ${model.stored}。${model.overflow ? '兩個同號數相加卻變成相反符號，結果超出表示範圍。' : '結果在表示範圍內。'}${model.carryOut && !model.overflow ? '最高位有進位，但沒有帶符號溢出。' : ''}`, model.overflow); }
      else if (position) { const c = model.columns[position - 1]; message(p, `第 ${position} 欄（由右數）：${c.x} + ${c.y} + 進位 ${c.carryIn} = ${c.x + c.y + c.carryIn}；寫下 ${c.out}，向左進位 ${c.carryOut}。`); }
      else message(p, '按「單步」開始，由右至左相加；結果列的圓點表示尚未計算。');
      p.visual.append(result); control?.finish(position === width);
    }
    function reset() { control?.stop(); position = 0; const width = Number(bits.value), min = -(2 ** (width - 1)), max = 2 ** (width - 1) - 1; a.min = b.min = min; a.max = b.max = max;
      const x = integer(a, min, max), y = integer(b, min, max); if (x === null || y === null) { model = null; p.visual.replaceChildren(); message(p, `請輸入 ${min} 至 ${max} 的整數，空白及小數不接受。`, true); control?.finish(true); return; } model = twosComplement(x, y, width); control?.finish(false); draw(); }
    control = playback(p, () => { if (!model) return false; position = Math.min(model.bits, position + 1); draw(); return position < model.bits; }, reset);
    const examples = E('div', undefined, 'im-controls'); p.fields.after(examples);
    [['正數溢出', () => [2 ** (Number(bits.value) - 1) - 1, 1]], ['負數溢出', () => [-(2 ** (Number(bits.value) - 1)), -1]], ['有進位而無溢出', () => [-1, 1]]].forEach(([text, values]) => button(examples, text, () => { const pair = values(); a.value = pair[0]; b.value = pair[1]; reset(); }));
    [bits, a, b].forEach(input => input.addEventListener('input', reset)); reset();
  }
  function sampleTone(rate, depth, frequency) {
    const levels = 2 ** depth; return Array.from({length: rate}, (_, i) => { const time = i / rate, amplitude = .85 * Math.sin(2 * Math.PI * frequency * time), code = Math.round((amplitude + 1) * (levels - 1) / 2); return {time, amplitude, code, quantized: 2 * code / (levels - 1) - 1}; });
  }
  function mountAudio(target) {
    const p = panel(target, '可調模型：取樣、量化與音訊數據量', '波形視窗顯示 1 秒。為清楚看見取樣點，使用 8–64 Hz 的教學數值，並不播放聲音，也不模擬真實音訊品質。', '數據量 = 取樣率 × 每樣本位元數 × 聲道數 × 時間。此處計算未壓縮、緊密排列的 PCM 有效載荷，不計標頭、對齊或壓縮。提高位元深度減少量化間距；它不增加每秒取樣次數。');
    const rate = field(p.fields, '取樣率', 'select', '16', [8,16,32,64].map(v => [v, v + ' Hz'])), depth = field(p.fields, '位元深度', 'select', '3', [2,3,4,8].map(v => [v, v + ' 位元'])), frequency = field(p.fields, '示例正弦波頻率', 'select', '3', [3,7,11].map(v => [v, v + ' Hz'])), channels = field(p.fields, '聲道數', 'select', '1', [['1','單聲道（1）'],['2','立體聲（2）']]), duration = field(p.fields, '儲存時間（秒）', 'number', '1'); duration.min = '1'; duration.max = '60'; duration.step = '1';
    let samples = [], count = 0, control;
    const x = t => 40 + t * 560, y = a => 105 - a * 76;
    function draw() {
      p.visual.replaceChildren(); const svg = S('svg', {viewBox:'0 0 640 240', role:'img', 'aria-label':`1 秒波形，${rate.value} 個取樣位置，已處理 ${count} 個樣本。藍點代表量化值；橙線顯示量化誤差。`});
      const title = S('title'); title.textContent = '灰色連續波形、藍色量化樣本、橙色量化誤差'; svg.append(title);
      const levels = 2 ** Number(depth.value); if (levels <= 16) for (let i = 0; i < levels; i++) svg.append(S('line', {x1:40,y1:y(2*i/(levels-1)-1),x2:600,y2:y(2*i/(levels-1)-1),stroke:'#d8e4ef','stroke-width':1}));
      svg.append(S('line',{x1:40,y1:y(0),x2:600,y2:y(0),stroke:'#7b8fa5'}));
      const points = Array.from({length:561},(_,i) => `${x(i/560)},${y(.85*Math.sin(2*Math.PI*Number(frequency.value)*i/560))}`).join(' '); svg.append(S('polyline',{points,fill:'none',stroke:'#6e7d8d','stroke-width':2}));
      samples.forEach((s,i) => { const visible = i < count, active = i === count-1; svg.append(S('line',{x1:x(s.time),y1:197,x2:x(s.time),y2:202,stroke:'#738aa4'})); if (!visible) {svg.append(S('circle',{cx:x(s.time),cy:y(s.amplitude),r:2.5,fill:'#fff',stroke:'#9aabba'}));return;} svg.append(S('line',{x1:x(s.time),y1:y(s.amplitude),x2:x(s.time),y2:y(s.quantized),stroke:'#b35600','stroke-width':active?3:2}),S('circle',{cx:x(s.time),cy:y(s.quantized),r:active?6:4,fill:active?'#a14b00':'#2563a0'})); });
      [['0 s',40],['1 s',578]].forEach(([text,left])=>{const t=S('text',{x:left,y:224,fill:'#344d66','font-size':13});t.textContent=text;svg.append(t);});p.visual.append(svg);
      const sec = integer(duration,1,60); if (sec === null) {message(p,'儲存時間必須是 1 至 60 秒的整數。',true);control?.finish(true);return;}
      const total = Number(rate.value)*Number(depth.value)*Number(channels.value)*sec, results = E('div',undefined,'im-result'); results.append(E('span',`${levels} 個量化級別`),E('span',`整段每聲道樣本數：${Number(rate.value)*sec}`),E('span',`有效載荷：${total} bit = ${total/8} byte`));p.visual.append(results);
      const alias = Number(rate.value) <= 2*Number(frequency.value) ? ' 此取樣率未高於此單一頻率的兩倍，不能期望從取樣唯一還原波形；可觀察混疊。' : ' 本單一頻率的取樣率高於兩倍頻率；真實數碼化仍需考慮頻寬限制及抗混疊濾波。';
      if (count) {const s=samples[count-1];message(p,`樣本 ${count}/${samples.length}：t=${s.time.toFixed(4)} s，原振幅 ${s.amplitude.toFixed(3)} → 代碼 ${s.code.toString(2).padStart(Number(depth.value),'0')} → 量化振幅 ${s.quantized.toFixed(3)}。${alias}`);} else message(p,'按「單步」逐個取樣；灰色空心點是取樣時刻，藍點是量化後的振幅。'+alias);
      control?.finish(count === samples.length);
    }
    function reset(){control?.stop();count=0;samples=sampleTone(Number(rate.value),Number(depth.value),Number(frequency.value));control?.finish(false);draw();}
    control=playback(p,()=>{count=Math.min(samples.length,count+1);draw();return count<samples.length;},reset,180);
    [rate,depth,frequency,channels,duration].forEach(input=>input.addEventListener('input',reset));reset();
  }
  function sortingEvents(input, algorithm) {
    if (!Array.isArray(input) || input.length < 2 || input.length > 12 || input.some(v=>!Number.isInteger(v)||Math.abs(v)>99)) throw new Error('請輸入 2–12 個介乎 -99 至 99 的整數');
    if (!['bubble','selection','insertion'].includes(algorithm)) throw new Error('排序方法無效');
    const values=input.slice(), events=[]; let comparisons=0;
    const emit=(note,active=[],done=[],key=null,gap=null)=>events.push({values:values.slice(),note,active:active.slice(),done:done.slice(),comparisons,key,gap});
    emit('初始陣列；尚未進行元素比較。');
    if(algorithm==='bubble') { let done=[];for(let end=values.length-1;end>0;end--){let changed=false;for(let j=0;j<end;j++){comparisons++;emit(`比較相鄰位置 ${j}、${j+1}：${values[j]} 與 ${values[j+1]}。`,[j,j+1],done);if(values[j]>values[j+1]){[values[j],values[j+1]]=[values[j+1],values[j]];changed=true;emit('左值較大，交換相鄰元素。',[j,j+1],done);}}done=[end,...done];emit(`本輪最大值已到位置 ${end}；右側區段已在最終位置。`,[],done);if(!changed){emit('本輪沒有交換，剩餘區段已排序，可以提早停止。',[],values.map((_,i)=>i));break;}} }
    if(algorithm==='selection') {for(let i=0;i<values.length-1;i++){let min=i;emit(`從未排序區段 ${i} 起尋找最小值。`,[min],Array.from({length:i},(_,j)=>j));for(let j=i+1;j<values.length;j++){comparisons++;emit(`比較候選最小值 ${values[min]} 與 ${values[j]}。`,[min,j],Array.from({length:i},(_,k)=>k));if(values[j]<values[min]){min=j;emit(`更新最小值候選為位置 ${min}。`,[min],Array.from({length:i},(_,k)=>k));}}if(min!==i){[values[i],values[min]]=[values[min],values[i]];emit(`把最小值交換至位置 ${i}。`,[i,min],Array.from({length:i},(_,k)=>k));}emit(`位置 0 至 ${i} 已在最終位置。`,[],Array.from({length:i+1},(_,k)=>k));}}
    if(algorithm==='insertion') {for(let i=1;i<values.length;i++){const key=values[i];let j=i-1;emit(`暫存待插入值 ${key}，位置 ${i} 成為空位。`,[i],[],key,i);while(j>=0){comparisons++;emit(`比較已排序前綴的 ${values[j]} 與暫存值 ${key}。`,[j],[],key,j+1);if(values[j]<=key)break;values[j+1]=values[j];emit(`把 ${values[j]} 右移一格，空位移至 ${j}。`,[j+1],[],key,j);j--;}values[j+1]=key;emit(`插入 ${key}；位置 0 至 ${i} 是已排序前綴，未來仍可能移動。`,[j+1],Array.from({length:i+1},(_,k)=>k));}}
    emit('排序完成；比較次數只計兩個陣列元素（或元素與暫存值）之間的比較，不計迴圈條件。',[],values.map((_,i)=>i));return events;
  }
  function mountSorting(target) {
    const p=panel(target,'可調模型：三種排序的真實操作','輸入 2–12 個整數（-99 至 99），以逗號分隔。選擇演算法並載入後，每一步由當前陣列計算；可以暫停、重設或單步觀察。','氣泡法：每輪把未排序區段最大值推到右端。選擇法：每輪選最小值放入左端最終位置。插入法：把新元素插入已排序前綴；前綴元素日後仍可移動。');
    const input=field(p.fields,'陣列','text','5, 1, 4, 2, 8'),algorithm=field(p.fields,'排序方法','select','bubble',[['bubble','氣泡排序'],['selection','選擇排序'],['insertion','插入排序']]);let events=[],index=0,control;
    function draw(){p.visual.replaceChildren();if(!events.length)return;const state=events[index],values=state.values,min=Math.min(0,...values),max=Math.max(1,...values),y=v=>20+(max-v)/(max-min)*145,zero=y(0),svg=S('svg',{viewBox:'0 0 640 225',role:'img','aria-label':'目前陣列：'+values.map((v,i)=>i===state.gap?'空位':v).join(', ')});svg.append(S('line',{x1:20,y1:zero,x2:620,y2:zero,stroke:'#748aa3'}));const width=590/values.length;
      values.forEach((value,i)=>{const x=25+i*width,top=Math.min(zero,y(value)),height=Math.max(2,Math.abs(zero-y(value))),active=state.active.includes(i),done=state.done.includes(i),gap=i===state.gap;svg.append(S('rect',{x:x+4,y:top,width:Math.max(5,width-9),height,rx:3,fill:gap?'none':active?'#ad570c':done?'#247250':'#326fa9',stroke:gap?'#8c531b':'#fff','stroke-dasharray':gap?'4 3':'none'}));const text=S('text',{x:x+width/2,y:value>=0?top-5:top+height+15,'text-anchor':'middle',fill:'#16334f','font-size':15});text.textContent=gap?'空位':value;const label=S('text',{x:x+width/2,y:208,'text-anchor':'middle',fill:'#465e77','font-size':12});label.textContent='['+i+']';svg.append(text,label);});p.visual.append(svg,E('p',`陣列：${values.map((v,i)=>i===state.gap?'□':v).join(', ')}${state.key!==null?'　暫存 key = '+state.key:''}`,'im-key'),E('p',`比較次數：${state.comparisons}　步驟：${index+1}/${events.length}。橙色＝目前操作；綠色＝已確認區段。`,'im-counter'));message(p,state.note);control?.finish(index===events.length-1);}
    function reset(){control?.stop();const raw=input.value.trim().split(/[,，]/).map(v=>v.trim());if(raw.some(v=>!/^[-+]?\d+$/.test(v))){message(p,'請用逗號分隔整數，例如 5, 1, 4, 2, 8。',true);control?.finish(true);return;}try{events=sortingEvents(raw.map(Number),algorithm.value);index=0;control?.finish(false);draw();}catch(error){message(p,error.message,true);control?.finish(true);}}
    button(p.fields,'載入／重設',reset);control=playback(p,()=>{if(index<events.length-1)index++;draw();return index<events.length-1;},reset,650);
    [input,algorithm].forEach(e=>e.addEventListener('input',()=>{control.stop();control.finish(true);message(p,'輸入已改動，請按「載入／重設」套用；目前圖形仍顯示上一組資料。');}));reset();
  }
  function structureOperation(values,mode,operation,value,capacity){
    const next=values.slice();if(!['stack','queue'].includes(mode)||!Number.isInteger(capacity)||capacity<1||capacity>8||next.length>capacity)throw new Error('結構設定無效');
    if(operation==='add'){if(next.length>=capacity)return{values:next,error:'已滿：加入失敗，原有內容保持不變。'};if(typeof value!=='string'||!value.trim()||value.trim().length>8)return{values:next,error:'請輸入 1–8 個字元的值。'};next.push(value.trim());return{values:next,added:value.trim()};}
    if(operation!=='remove')throw new Error('操作無效');if(!next.length)return{values:next,error:'已空：移除失敗，沒有元素可取出。'};const removed=mode==='stack'?next.pop():next.shift();return{values:next,removed};
  }
  function mountStructures(target){
    const p=panel(target,'可調模型：堆疊與隊列','選擇 LIFO 堆疊或 FIFO 隊列，再親自加入及移除資料。圖中使用邏輯位置，不展示底層實體記憶體或環形陣列實作。','堆疊的 push／pop 都在 top；隊列的 enqueue 在 rear，dequeue 在 front。成功加入令元素數加 1，成功移除令它減 1；滿或空的失敗操作不改動資料。');
    const mode=field(p.fields,'資料結構','select','stack',[['stack','堆疊 Stack（LIFO）'],['queue','隊列 Queue（FIFO）']]),capacityInput=field(p.fields,'容量（1–8）','number','4'),value=field(p.fields,'加入值（最多 8 字元）','text','A');capacityInput.min='1';capacityInput.max='8';capacityInput.step='1';value.maxLength=8;
    let values=[],capacity=4;const controls=E('div',undefined,'im-controls');p.fields.after(controls);
    const add=button(controls,'Push（推入）',()=>operate('add')),remove=button(controls,'Pop（彈出）',()=>operate('remove'));
    button(controls,'套用容量／清空',reset);function reset(){const n=integer(capacityInput,1,8);if(n===null){message(p,'容量須為 1–8 的整數；原有資料未改動。',true);return;}capacity=n;values=[];draw();message(p,'已清空並套用容量 '+capacity+'。選擇結構或套用容量會開始新一輪實驗。');}
    function draw(){p.visual.replaceChildren();const stack=mode.value==='stack',slots=E('div',undefined,'im-slots'+(stack?' is-stack':''));slots.setAttribute('role','list');slots.setAttribute('aria-label',stack?'由底至頂的堆疊':'由 front 至 rear 的隊列');for(let i=0;i<capacity;i++){const filled=i<values.length,active=filled&&(stack?i===values.length-1:i===0),slot=E('div',undefined,'im-slot'+(filled?' is-filled':'')+(active?' is-active':''));slot.setAttribute('role','listitem');let tag=stack?(filled&&i===values.length-1?'top':'位置 '+i):(filled&&i===0?'front':'位置 '+i);if(!stack&&filled&&i===values.length-1)tag+=' / rear';slot.append(E('small',tag),E('strong',filled?values[i]:'空位'));slots.append(slot);}p.visual.append(slots,E('p',`元素數 ${values.length}／容量 ${capacity}；${values.length===0?'空':values.length===capacity?'滿':'仍有空位'}。${stack?'視圖由下方底部向上堆疊。':'視圖由左方 front 向右方 rear 排列。'}`));add.textContent=stack?'Push（推入）':'Enqueue（入隊）';remove.textContent=stack?'Pop（彈出）':'Dequeue（出隊）';}
    function operate(operation){const result=structureOperation(values,mode.value,operation,value.value,capacity);if(result.error){message(p,result.error,true);return;}values=result.values;draw();message(p,operation==='add'?`成功加入「${result.added}」；${mode.value==='stack'?'新值成為 top。':'新值位於 rear。'}`:`成功取出「${result.removed}」；${mode.value==='stack'?'後進先出（LIFO）。':'先進先出（FIFO）。'}`);}
    mode.addEventListener('change',()=>{ values=[];capacityInput.value=String(capacity);draw();message(p,'已切換結構並清空資料；容量保持 '+capacity+'。'); });value.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();operate('add');}});reset();
  }
  function init(){const ids=window.ICT_MODEL_PAGE_IDS||[location.pathname.split('/').pop().replace(/\.html$/,'')];if(ids.includes('cha.3')){mountBinary(document.getElementById('sec3-1-signed')||document.querySelector('main')||document.body);mountAudio(document.getElementById('content-audio')||document.querySelector('main')||document.body);}const target=document.getElementById('live-animation-labs')||document.getElementById('ict-lesson')||document.querySelector('main')||document.body;if(ids.includes('elecc.5'))mountStructures(target);if(ids.includes('elecc.6'))mountSorting(target);}
  window.ICTInteractiveModels={twosComplement,sampleTone,sortingEvents,structureOperation};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)running.forEach(p=>p.stop());});window.addEventListener('pagehide',()=>running.forEach(p=>p.stop()));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
