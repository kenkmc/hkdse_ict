/* Section-by-section placement, reviewed against the lesson prose. No top showcase. */
(function () {
  'use strict';
  const at = (sim, target, position = 'append') => ({ sim, target, position });
  Object.assign(window.ICT_LESSON_PLANS ||= {}, {
    'chd.1': [at('spec-contract', '#ipo'), at('problem-workbench', '#thinking')],
    'chd.2': [at('decision-flow', '#represent'), at('python-input-types', '#types'), at('boolean-wires', '#control'), at('python-registers', '#trace'), at('recursive-frames', '#modules')],
    'chd.3': [at('assignment-writeback', '#building'), at('python-input-types', '#operators'), at('grade-and-modulus', '#control'), at('sentinel-reader', '#control'), at('filtered-statistics', '#lists'), at('extrema-order', '#pattern-extrema'), at('array-search', '#pattern-search'), at('string-positions', '#pattern-string'), at('array-shifting', '#pattern-array')],
    'chd.4': [at('boundary-line', '#boundary'), at('decimal-precision', '#debug-precision'), at('array-search', '#compare')],
    'ec.1': [at('array-search', '#search-algorithm'), at('sorting-bars', '#sort-algorithm'), at('stack-queue-slots', '#stack-operations'), at('linked-array', '#linked-operations'), at('sequential-file', '#file-handling'), at('recursive-frames', '#call-frame'), at('parameter-bindings', '#parameter-sharing'), at('nested-grid', '#nested-control'), at('decimal-precision', '#numeric-errors')],
    'ec.2': [at('sensor-greenhouse', '#loop')],
    'python_converter': [at('decision-flow', '#python-decision-guide'), at('python-registers', '#python-trace-guide')],
    'animations/chd.1': [at('list-statistics', '#topic-0'), at('problem-workbench', '#topic-1'), at('spec-contract', '#topic-2')],
    'animations/chd.2': [at('decision-flow', '#topic-0'), at('boolean-wires', '#topic-2')],
    'animations/chd.3': [at('python-registers', '#topic-0'), at('sentinel-reader', '#topic-1'), at('array-shifting', '#topic-2')],
    'animations/chd.4': [at('python-input-types', '#topic-0'), at('assignment-writeback', '#topic-1'), at('grade-and-modulus', '#topic-2')],
    'animations/chd.5': [at('filtered-statistics', '#topic-0'), at('normalized-string-search', '#topic-1'), at('extrema-order', '#topic-2'), at('string-positions', '#topic-3')],
    'animations/chd.6': [at('boundary-line', '#topic-1')],
    'animations/elecc.1': [at('list-statistics', '#types'), at('merge-pointers', '#merge')],
    'animations/elecc.2': [at('decimal-precision', '#numbers'), at('count-breakpoint', '#debug')],
    'animations/elecc.3': [at('nested-grid', '#nested')],
    'animations/elecc.4': [at('recursive-frames', '#calls'), at('parameter-bindings', '#scope')],
    'animations/elecc.5': [at('stack-queue-slots', '#stackqueue'), at('linked-array', '#linked')],
    'animations/elecc.6': [at('array-search', '#search'), at('sorting-bars', '#sort')],
    'animations/elecc.7': [at('file-open-modes', '#readwrite'), at('sequential-file', '#update')],
    'animations/elecc.8': [at('sensor-greenhouse', '#events')],
    'animations/python_converter': [at('decision-flow', '#python-decision-guide'), at('python-registers', '#python-trace-guide')]
  });

  // Generated lesson data is shared with other owners. Preserve the essential
  // worked code and small diagrams here when the old duplicate card transcript
  // is suppressed. Patches are restricted to the exact reviewed lesson paths.
  function enrichGeneratedSections() {
    const path = location.pathname, key = path.slice(path.lastIndexOf('/animations/') + 1).replace(/\.html$/, '');
    if (!path.includes('/animations/') || !window.ICT_LESSON_PLANS[key]) return;
    const section = selector => document.querySelector(selector);
    const add = (target, tag, text, cls = '') => {
      const parent = section(target); if (!parent) return null;
      const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls;
      const quiz = parent.querySelector('.ict-section-check'); if (quiz) quiz.before(node); else parent.append(node); return node;
    };
    const code = (target, text) => add(target, 'pre', text, 'ta-code');
    const link = (target, text, href) => { const p = add(target, 'p', '', 'ta-inline-reading'); if (!p) return; const a = document.createElement('a'); a.textContent = text; a.href = href; p.append(a); };
    const diagram = (target, caption, labels) => {
      const figure = add(target, 'figure', '', 'ta-section-figure'); if (!figure) return;
      const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 780 140'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', caption);
      const width = 720 / labels.length;
      labels.forEach((text, i) => {
        const x = 30 + width * i, rect = document.createElementNS(ns, 'rect'); Object.entries({x,y:20,width:width-15,height:75,rx:8,fill:i%2?'#fff0d3':'#e0f1ea',stroke:'#78998d'}).forEach(([k,v])=>rect.setAttribute(k,v)); svg.append(rect);
        const words = text.split('|'); words.forEach((word, line) => { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', x + (width-15)/2); t.setAttribute('y', 47 + line*24); t.setAttribute('text-anchor','middle'); t.setAttribute('fill','#17324c'); t.setAttribute('font-size','15'); t.textContent = word; svg.append(t); });
        if (i < labels.length-1) { const arrow = document.createElementNS(ns,'text'); arrow.setAttribute('x',x+width-12); arrow.setAttribute('y',65); arrow.setAttribute('fill','#215d57'); arrow.textContent='→'; svg.append(arrow); }
      });
      const cap=document.createElement('figcaption');cap.textContent=caption;figure.append(svg,cap);
    };
    if (key === 'animations/chd.2') {
      const paragraph = section('#topic-0 p'); if (paragraph) paragraph.textContent = paragraph.textContent.replace('符號在此以文字節點表達。', '下方使用平行四邊形、菱形及有條件標籤的分支，直接追蹤執行路徑。');
      code('#topic-1', 'READ score\nIF score >= 50 THEN\n    OUTPUT "合格"\nELSE\n    OUTPUT "不合格"\nENDIF\n\n# Python 使用冒號及縮排\nif score >= 50:\n    print("合格")\nelse:\n    print("不合格")');
      link('#topic-1', '對照上一節的同一張流程圖；毋須再播放一套相同的分支示範。', '#sim-decision-flow');
    }
    if (key === 'animations/chd.5') {
      code('#topic-4', 'ordered = True\nfor i in range(1, len(values)):\n    if values[i] < values[i - 1]:\n        ordered = False\n        break\n# 嚴格遞增：把 < 改為 <=\n# 非遞增：把 < 改為 >');
      diagram('#topic-4', '原次序 [2,2,5,4]：相等在非遞減規格下可通過；5 → 4 是足以停止檢查的反例。', ['2 ≤ 2|通過', '2 ≤ 5|通過', '5 ≤ 4|反例，停止']);
      link('#topic-4', '回到相鄰掃描器，選「檢查原次序」測試嚴格與非嚴格要求。', '#sim-extrema-order');
    }
    if (key === 'animations/chd.6') {
      diagram('#topic-0', '語法錯誤阻止剖析；執行時錯誤在操作時發生；邏輯錯誤要與規格比較才可識別。', ['剖析|欠冒號', '執行|除以零', '核對結果|公式或條件錯']);
      code('#topic-0', '# 語法錯誤：欠冒號\nif score >= 50\n    print("合格")\n\n# 執行時錯誤：count = 0 才觸發\naverage = total / count\n\n# 邏輯錯誤：規格包含 50，錯用 >\npassed = score > 50');
    }
    if (key === 'animations/elecc.1') {
      code('#merge', '# 交換前先保存未搬走的值\ntemp = a\na = b\nb = temp\n# Python 亦可用 a, b = b, a');
    }
    if (key === 'animations/elecc.2') {
      diagram('#numbers', '固定 8 位元有符號補碼的範圍是 −128 至 127；Python 的一般 int 不按此模型自動環回。', ['最大值|127', '數學加 1|128 超出範圍', '固定字長環回|−128']);
      code('#numbers', 'import math\n# 比較策略按題目所需精度訂定\nmath.isclose(0.1 + 0.2, 0.3, rel_tol=1e-9)');
      code('#debug', '# 在比較條件前設斷點，逐項觀察 mark 及 count\nif mark > 50:   # 錯誤：規格包含 50\n    count += 1\n# 修正為 >=，再測空表、全合格及全不合格');
    }
    if (key === 'animations/elecc.3') {
      code('#nested', 'for row in matrix:\n    row_sum = 0\n    for value in row:\n        row_sum += value\n    print(row_sum)');
      diagram('#counts', '固定矩形的步數是 n×m；三角形 range(i+1) 則逐列相加，n=3 時為 1+2+3=6。', ['i = 0|1 次', 'i = 1|2 次', 'i = 2|3 次']);
      link('#counts', '在上方矩陣切換「三角形：range(i+1)」，逐格核對實際步數。', '#sim-nested-grid');
    }
    if (key === 'animations/elecc.5') code('#stackqueue', '# 保留理解題所用的同一個環狀例子\ncapacity = 3\n# enqueue A, enqueue B, dequeue A, enqueue C, enqueue D\n# 物理陣列：[D, B, C]\n# front = 1, rear = 1, count = 3\n# 邏輯出隊順序：B → C → D\n# front == rear 本身不足以分清空和滿');
    if (key === 'animations/elecc.7') code('#readwrite', '# CSV 的引號、逗號與換行應交給 csv 模組處理\nimport csv\nwith open("marks.csv", "r", encoding="utf-8", newline="") as f:\n    rows = list(csv.reader(f))');
    if (key === 'animations/elecc.8') {
      diagram('#sensor', '兩個閾值形成遲滯：<30 開燈，>40 關燈，30–40 保持舊狀態；這與事件抵達後才更新輸出是兩件不同的事。', ['讀值 < 30|設為 ON', '30 ≤ 讀值 ≤ 40|保持原狀', '讀值 > 40|設為 OFF']);
      code('#sensor', 'if reading < 30:\n    lamp = True\nelif reading > 40:\n    lamp = False\n# 中間範圍沒有賦值，所以維持舊狀態');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enrichGeneratedSections, {once:true}); else enrichGeneratedSections();
})();
