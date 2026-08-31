(function initialiseLessonGames() {
    "use strict";

    const root = document.querySelector("[data-lesson-game-root]");
    const platform = window.HKDSE_ICT;
    const learning = window.HKDSE_ICT_LEARNING;
    const progress = window.HKDSEProgress;
    const item = platform?.getItemByPath(window.location.pathname);
    const game = item ? learning?.pages?.[item.id]?.game : null;
    if (!root || !item || !game) return;

    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
    const storageKey = "hkdse-ict-lesson-games-v1";
    const readRecords = () => {
        try {
            const value = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
            return value && typeof value === "object" ? value : {};
        } catch (error) {
            return {};
        }
    };
    const records = readRecords();
    const record = records[item.id] && typeof records[item.id] === "object"
        ? records[item.id]
        : { best: 0, total: 0 };

    const totalByType = {
        "formula-detective": game.missions?.length * 2,
        "network-builder": game.slots?.length + 1,
        "trace-debugger": game.trace?.length + 1,
        "sql-missions": game.missions?.length * 2,
        "cpu-cycle-race": game.rounds?.length * 2,
        "cyber-defense": game.waves?.length * 2,
        "algorithm-arena": game.rounds?.length * 2
    };
    const total = Number(totalByType[game.type]) || 0;

    root.innerHTML = `
        <div class="lesson-game-heading">
            <div>
                <p class="lesson-check-label">${escapeHTML(game.eyebrow)}</p>
                <h3>${escapeHTML(game.title)}</h3>
                <p>${escapeHTML(game.intro)}</p>
            </div>
            <div class="lesson-game-score" aria-live="polite">
                <span>本次 <b data-game-score>0 / ${total}</b></span>
                <span>最佳 <b data-game-best>${Math.min(Number(record.best) || 0, total)} / ${total}</b></span>
            </div>
        </div>
        <div class="lesson-game-stage" data-game-stage></div>
        <div class="lesson-game-footer">
            <p>分數只儲存在目前瀏覽器；重設活動不會清除最佳紀錄。</p>
            <button type="button" data-game-reset>重新開始</button>
        </div>
    `;

    const stage = root.querySelector("[data-game-stage]");
    const scoreNode = root.querySelector("[data-game-score]");
    const bestNode = root.querySelector("[data-game-best]");
    let currentScore = 0;
    let resetCurrentGame = () => {};

    const updateScore = score => {
        currentScore = Math.max(0, Math.min(Number(score) || 0, total));
        scoreNode.textContent = `${currentScore} / ${total}`;
        let shouldSave = false;
        if (currentScore > (Number(record.best) || 0)) {
            record.best = currentScore;
            record.total = total;
            record.updatedAt = new Date().toISOString();
            shouldSave = true;
            progress?.recordEvent("game-score", { topicId: item.id, source: "lesson-game", score: currentScore, maxScore: total, metadata: { gameType: game.type, title: game.title } });
        }
        if (total > 0 && currentScore === total && !record.completed) {
            record.completed = true;
            record.completedAt = new Date().toISOString();
            shouldSave = true;
            progress?.recordEvent("game-complete", { topicId: item.id, source: "lesson-game", score: currentScore, maxScore: total, metadata: { gameType: game.type, title: game.title } });
        }
        if (shouldSave) {
            records[item.id] = record;
            try {
                window.localStorage.setItem(storageKey, JSON.stringify(records));
            } catch (error) {
                // The game still works when private browsing blocks storage.
            }
        }
        bestNode.textContent = `${Math.min(Number(record.best) || 0, total)} / ${total}`;
    };

    const tableHTML = (headers, rows, className = "") => `
        <div class="lesson-game-table-wrap">
            <table class="lesson-game-table ${className}">
                <thead><tr>${headers.map(header => `<th>${escapeHTML(header)}</th>`).join("")}</tr></thead>
                <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
        </div>
    `;

    const renderFormulaDetective = () => {
        const state = {
            index: 0,
            attempts: game.missions.map(() => 0),
            earned: game.missions.map(() => null),
            answers: game.missions.map(mission => mission.faulty),
            revealed: game.missions.map(() => false),
            feedback: game.missions.map(() => "")
        };
        const score = () => state.earned.reduce((sum, value) => sum + (Number(value) || 0), 0);
        const normalise = value => String(value || "")
            .trim()
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/\s+/g, "")
            .toUpperCase();

        const render = () => {
            const mission = game.missions[state.index];
            const completed = state.earned[state.index] !== null;
            stage.innerHTML = `
                <div class="lesson-game-tabs" role="tablist" aria-label="公式偵探關卡">
                    ${game.missions.map((candidate, index) => `
                        <button type="button" role="tab" data-formula-mission="${index}" aria-label="${escapeHTML(candidate.title)}" aria-selected="${index === state.index}" class="${state.earned[index] !== null ? "is-complete" : ""}">
                            ${index + 1}<span>${state.earned[index] === null ? "未完成" : `${state.earned[index]} / 2`}</span>
                        </button>
                    `).join("")}
                </div>
                <div class="lesson-formula-grid">
                    <section>
                        <p class="lesson-game-kicker">${escapeHTML(mission.title)}</p>
                        <h4>${escapeHTML(mission.prompt)}</h4>
                        ${tableHTML(mission.headers, mission.rows, "lesson-sheet-table")}
                    </section>
                    <section class="lesson-game-workbench">
                        <label class="lesson-game-input">
                            <span>修正公式</span>
                            <input type="text" spellcheck="false" autocomplete="off" data-formula-input value="${escapeHTML(state.answers[state.index])}" ${completed ? "disabled" : ""}>
                        </label>
                        <p class="lesson-game-fault"><strong>原有公式：</strong><code>${escapeHTML(mission.faulty)}</code></p>
                        <div class="lesson-game-actions">
                            <button type="button" class="is-primary" data-formula-check ${completed ? "disabled" : ""}>檢查公式</button>
                            <button type="button" data-formula-hint>提示</button>
                            <button type="button" data-formula-reveal ${state.attempts[state.index] >= 2 && !completed ? "" : "hidden"}>顯示答案</button>
                        </div>
                        <p class="lesson-game-feedback ${completed ? "is-success" : ""}" data-formula-feedback aria-live="polite">${escapeHTML(state.feedback[state.index] || "先找出函數、範圍、準則或參照中的問題。")}</p>
                        ${completed ? `<div class="lesson-game-explanation"><code>${escapeHTML(mission.answer)}</code><p>${escapeHTML(mission.explanation)}</p></div>` : ""}
                    </section>
                </div>
            `;
            updateScore(score());

            stage.querySelectorAll("[data-formula-mission]").forEach(button => {
                button.addEventListener("click", () => {
                    state.index = Number(button.dataset.formulaMission);
                    render();
                });
            });
            const input = stage.querySelector("[data-formula-input]");
            input?.addEventListener("input", event => {
                state.answers[state.index] = event.currentTarget.value;
            });
            stage.querySelector("[data-formula-check]")?.addEventListener("click", () => {
                state.attempts[state.index] += 1;
                const correct = mission.acceptable.some(answer => normalise(answer) === normalise(state.answers[state.index]));
                if (correct) {
                    state.earned[state.index] = state.attempts[state.index] === 1 ? 2 : 1;
                    state.feedback[state.index] = `正確，取得 ${state.earned[state.index]} / 2 分。`;
                } else {
                    state.feedback[state.index] = state.attempts[state.index] === 1
                        ? "仍有一處不符合題意。可先查看提示，再修正一次。"
                        : "仍未正確。現在可以顯示答案並核對失分位置。";
                }
                render();
            });
            stage.querySelector("[data-formula-hint]")?.addEventListener("click", () => {
                state.feedback[state.index] = `提示：${mission.hint}`;
                render();
            });
            stage.querySelector("[data-formula-reveal]")?.addEventListener("click", () => {
                state.answers[state.index] = mission.answer;
                state.earned[state.index] = 0;
                state.revealed[state.index] = true;
                state.feedback[state.index] = "已顯示答案；本關不計分，請閱讀解釋後再重做。";
                render();
            });
        };
        resetCurrentGame = () => {
            state.index = 0;
            state.attempts.fill(0);
            state.earned.fill(null);
            state.answers = game.missions.map(mission => mission.faulty);
            state.revealed.fill(false);
            state.feedback.fill("");
            render();
        };
        render();
    };

    const renderNetworkBuilder = () => {
        const state = { selected: "", placements: {}, medium: -1, checked: false };
        const deviceById = id => game.devices.find(device => device.id === id);
        const placeDevice = (deviceId, slotId) => {
            if (!deviceById(deviceId) || !game.slots.some(slot => slot.id === slotId)) return;
            Object.keys(state.placements).forEach(key => {
                if (state.placements[key] === deviceId) delete state.placements[key];
            });
            state.placements[slotId] = deviceId;
            state.selected = "";
            state.checked = false;
            render();
        };
        const render = () => {
            const correctSlots = game.slots.filter(slot => state.placements[slot.id] === slot.answer).length;
            const mediumCorrect = state.medium === game.mediumChallenge.answerIndex;
            const score = state.checked ? correctSlots + (mediumCorrect ? 1 : 0) : 0;
            stage.innerHTML = `
                <div class="lesson-network-scenario"><strong>情境：</strong>${escapeHTML(game.scenario)}</div>
                <div class="lesson-network-builder">
                    <section>
                        <p class="lesson-game-kicker">1 · 選擇硬件</p>
                        <div class="lesson-network-devices" role="list" aria-label="可用網絡硬件">
                            ${game.devices.map(device => {
                                const used = Object.values(state.placements).includes(device.id);
                                return `
                                    <button type="button" role="listitem" draggable="true" data-network-device="${escapeHTML(device.id)}" class="${state.selected === device.id ? "is-selected" : ""} ${used ? "is-used" : ""}" aria-pressed="${state.selected === device.id}">
                                        <img src="${escapeHTML(device.image)}" alt="${escapeHTML(device.alt)}" width="220" height="150" loading="lazy">
                                        <span><b>${escapeHTML(device.label)}</b><small>${escapeHTML(device.note)}</small></span>
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    </section>
                    <section>
                        <p class="lesson-game-kicker">2 · 放到網絡位置</p>
                        <div class="lesson-network-slots">
                            ${game.slots.map(slot => {
                                const placed = deviceById(state.placements[slot.id]);
                                const resultClass = state.checked ? (placed?.id === slot.answer ? "is-correct" : "is-incorrect") : "";
                                return `
                                    <button type="button" data-network-slot="${escapeHTML(slot.id)}" class="${resultClass}">
                                        <span>${escapeHTML(slot.label)}</span>
                                        <b>${placed ? escapeHTML(placed.label) : "點選或拖放硬件到這裏"}</b>
                                        ${state.checked && placed?.id !== slot.answer ? `<small>${escapeHTML(slot.hint)}</small>` : ""}
                                    </button>
                                `;
                            }).join("")}
                        </div>
                    </section>
                </div>
                <section class="lesson-network-medium">
                    <p class="lesson-game-kicker">3 · 選擇傳輸媒介</p>
                    <h4>${escapeHTML(game.mediumChallenge.prompt)}</h4>
                    <div class="lesson-game-options">
                        ${game.mediumChallenge.options.map((option, index) => {
                            const className = state.checked
                                ? (index === game.mediumChallenge.answerIndex ? "is-correct" : state.medium === index ? "is-incorrect" : "")
                                : "";
                            return `<button type="button" data-network-medium="${index}" aria-pressed="${state.medium === index}" class="${className}">${escapeHTML(option)}</button>`;
                        }).join("")}
                    </div>
                </section>
                <div class="lesson-game-actions">
                    <button type="button" class="is-primary" data-network-check>檢查網絡</button>
                </div>
                <p class="lesson-game-feedback ${state.checked && score === total ? "is-success" : state.checked ? "is-warning" : ""}" aria-live="polite">
                    ${state.checked
                        ? `取得 ${score} / ${total} 分。${mediumCorrect ? game.mediumChallenge.explanation : " 再按情境的距離、成本及用途檢查媒介。"}`
                        : "完成四個位置及媒介選擇後才檢查。"}
                </p>
            `;
            updateScore(score);

            stage.querySelectorAll("[data-network-device]").forEach(button => {
                button.addEventListener("click", () => {
                    state.selected = state.selected === button.dataset.networkDevice ? "" : button.dataset.networkDevice;
                    render();
                });
                button.addEventListener("dragstart", event => {
                    event.dataTransfer?.setData("text/plain", button.dataset.networkDevice);
                });
            });
            stage.querySelectorAll("[data-network-slot]").forEach(button => {
                button.addEventListener("click", () => {
                    if (state.selected) placeDevice(state.selected, button.dataset.networkSlot);
                });
                button.addEventListener("dragover", event => {
                    event.preventDefault();
                    button.classList.add("is-dragover");
                });
                button.addEventListener("dragleave", () => button.classList.remove("is-dragover"));
                button.addEventListener("drop", event => {
                    event.preventDefault();
                    button.classList.remove("is-dragover");
                    placeDevice(event.dataTransfer?.getData("text/plain"), button.dataset.networkSlot);
                });
            });
            stage.querySelectorAll("[data-network-medium]").forEach(button => {
                button.addEventListener("click", () => {
                    state.medium = Number(button.dataset.networkMedium);
                    state.checked = false;
                    render();
                });
            });
            stage.querySelector("[data-network-check]").addEventListener("click", () => {
                state.checked = true;
                render();
            });
        };
        resetCurrentGame = () => {
            state.selected = "";
            state.placements = {};
            state.medium = -1;
            state.checked = false;
            render();
        };
        render();
    };

    const renderTraceDebugger = () => {
        const state = { step: 0, rows: [], awarded: new Set(), bugAwarded: false, feedback: "" };
        const render = () => {
            const tracing = state.step < game.trace.length;
            const current = game.trace[state.step];
            stage.innerHTML = `
                <div class="lesson-trace-grid">
                    <section class="lesson-trace-code">
                        <p class="lesson-game-kicker">有錯誤的偽代碼</p>
                        <ol>${game.code.map((line, index) => `<li class="${tracing && index >= 2 && index <= 4 ? "is-active" : ""}"><code>${escapeHTML(line)}</code></li>`).join("")}</ol>
                    </section>
                    <section class="lesson-trace-work">
                        <p class="lesson-game-kicker">${tracing ? `迭代 ${state.step + 1} / ${game.trace.length}` : "找出邏輯錯誤"}</p>
                        ${tracing ? `
                            <h4>當 i = ${escapeHTML(current.i)}、scores[i] = ${escapeHTML(current.value)}，執行後 count 是多少？</h4>
                            <div class="lesson-game-options">
                                ${[0, 1, 2, 3].map(value => `<button type="button" data-trace-prediction="${value}">${value}</button>`).join("")}
                            </div>
                        ` : `
                            <h4>${escapeHTML(game.bugPrompt)}</h4>
                            <div class="lesson-game-options lesson-trace-bug-options">
                                ${game.bugOptions.map((option, index) => `<button type="button" data-trace-bug="${index}">${escapeHTML(option)}</button>`).join("")}
                            </div>
                            ${state.bugAwarded ? `<div class="lesson-game-explanation"><strong>修正：</strong><code>${escapeHTML(game.fix)}</code><p>${escapeHTML(game.explanation)}</p></div>` : ""}
                        `}
                        <p class="lesson-game-feedback ${state.feedback.startsWith("正確") ? "is-success" : state.feedback ? "is-warning" : ""}" aria-live="polite">${escapeHTML(state.feedback || "先預測，才查看追蹤結果。")}</p>
                    </section>
                </div>
                <div class="lesson-game-table-wrap">
                    <table class="lesson-game-table">
                        <thead><tr><th>i</th><th>scores[i]</th><th>count</th><th>解釋</th></tr></thead>
                        <tbody>
                            ${state.rows.length ? state.rows.map(row => `<tr><td>${escapeHTML(row.i)}</td><td>${escapeHTML(row.value)}</td><td>${escapeHTML(row.expectedCount)}</td><td>${escapeHTML(row.note)}</td></tr>`).join("") : `<tr><td colspan="4">尚未執行第一輪。</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;
            updateScore(state.awarded.size + (state.bugAwarded ? 1 : 0));

            stage.querySelectorAll("[data-trace-prediction]").forEach(button => {
                button.addEventListener("click", () => {
                    const correct = Number(button.dataset.tracePrediction) === current.expectedCount;
                    if (!correct) {
                        state.feedback = "未正確。重新比較 scores[i] 與 50，再判斷 count 是否增加。";
                        render();
                        return;
                    }
                    state.awarded.add(state.step);
                    state.rows.push(current);
                    state.step += 1;
                    state.feedback = state.step < game.trace.length
                        ? `正確。${current.note} 繼續預測下一輪。`
                        : `正確。${current.note} 追蹤完成，現在找出為何仍漏計。`;
                    render();
                });
            });
            stage.querySelectorAll("[data-trace-bug]").forEach(button => {
                button.addEventListener("click", () => {
                    const correct = Number(button.dataset.traceBug) === game.bugAnswerIndex;
                    state.feedback = correct ? "正確。迴圈上限令最後一項從未被處理。" : "未正確。先比較列表長度、最後索引及實際出現的 i 值。";
                    if (correct) state.bugAwarded = true;
                    render();
                });
            });
        };
        resetCurrentGame = () => {
            state.step = 0;
            state.rows = [];
            state.awarded = new Set();
            state.bugAwarded = false;
            state.feedback = "";
            render();
        };
        render();
    };

    const renderSQLMissions = () => {
        const state = {
            index: 0,
            attempts: game.missions.map(() => 0),
            earned: game.missions.map(() => null),
            answers: game.missions.map(mission => mission.starter),
            feedback: game.missions.map(() => ""),
            hintIndex: game.missions.map(() => 0)
        };
        const score = () => state.earned.reduce((sum, value) => sum + (Number(value) || 0), 0);
        const normaliseSQL = value => String(value || "")
            .replace(/--.*$/gm, " ")
            .replace(/;/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        const renderResult = mission => tableHTML(mission.resultColumns, mission.resultRows, "lesson-sql-result");
        const render = () => {
            const mission = game.missions[state.index];
            const completed = state.earned[state.index] !== null;
            stage.innerHTML = `
                <div class="lesson-game-tabs" role="tablist" aria-label="SQL 任務">
                    ${game.missions.map((candidate, index) => `
                        <button type="button" role="tab" data-sql-mission="${index}" aria-label="${escapeHTML(candidate.title)}" aria-selected="${index === state.index}" class="${state.earned[index] !== null ? "is-complete" : ""}">
                            ${index + 1}<span>${state.earned[index] === null ? "未完成" : `${state.earned[index]} / 2`}</span>
                        </button>
                    `).join("")}
                </div>
                <div class="lesson-sql-schema">
                    <div><p class="lesson-game-kicker">Database schema</p>${game.schema.map(line => `<code>${escapeHTML(line)}</code>`).join("")}</div>
                    <div class="lesson-sql-data">${game.tables.map(table => `<section><b>${escapeHTML(table.title)}</b>${tableHTML(table.headers, table.rows)}</section>`).join("")}</div>
                </div>
                <div class="lesson-sql-workbench">
                    <section>
                        <p class="lesson-game-kicker">${escapeHTML(mission.title)}</p>
                        <h4>${escapeHTML(mission.prompt)}</h4>
                        <textarea rows="8" spellcheck="false" aria-label="SQL 查詢輸入" data-sql-input ${completed ? "disabled" : ""}>${escapeHTML(state.answers[state.index])}</textarea>
                        <div class="lesson-game-actions">
                            <button type="button" class="is-primary" data-sql-check ${completed ? "disabled" : ""}>執行並檢查</button>
                            <button type="button" data-sql-hint>逐步提示</button>
                            <button type="button" data-sql-reveal ${state.attempts[state.index] >= 2 && !completed ? "" : "hidden"}>顯示參考查詢</button>
                            <a href="${escapeHTML(game.simulatorHref)}">開啟完整 SQL 平台 →</a>
                        </div>
                        <p class="lesson-game-feedback ${completed ? "is-success" : ""}" aria-live="polite">${escapeHTML(state.feedback[state.index] || "系統會逐項檢查查詢所需的子句。")}</p>
                    </section>
                    <section class="lesson-sql-output">
                        <p class="lesson-game-kicker">Result</p>
                        ${completed ? renderResult(mission) : "<p>查詢正確後才顯示結果表。</p>"}
                        ${completed ? `<div class="lesson-game-explanation"><code>${escapeHTML(mission.canonical)}</code><p>${escapeHTML(mission.explanation)}</p></div>` : ""}
                    </section>
                </div>
            `;
            updateScore(score());
            stage.querySelectorAll("[data-sql-mission]").forEach(button => {
                button.addEventListener("click", () => {
                    state.index = Number(button.dataset.sqlMission);
                    render();
                });
            });
            stage.querySelector("[data-sql-input]")?.addEventListener("input", event => {
                state.answers[state.index] = event.currentTarget.value;
            });
            stage.querySelector("[data-sql-check]")?.addEventListener("click", () => {
                state.attempts[state.index] += 1;
                const query = normaliseSQL(state.answers[state.index]);
                const missing = mission.requiredTokens.filter(token => !query.includes(normaliseSQL(token)));
                if (!missing.length) {
                    state.earned[state.index] = state.attempts[state.index] === 1 ? 2 : 1;
                    state.feedback[state.index] = `查詢結構完整，取得 ${state.earned[state.index]} / 2 分。`;
                } else {
                    const firstMissing = missing[0].split(" ")[0];
                    state.feedback[state.index] = `尚未符合：${firstMissing} 部分。請核對題目要求和子句次序。`;
                }
                render();
            });
            stage.querySelector("[data-sql-hint]")?.addEventListener("click", () => {
                const index = state.hintIndex[state.index] % mission.hints.length;
                state.feedback[state.index] = `提示 ${index + 1}：${mission.hints[index]}`;
                state.hintIndex[state.index] += 1;
                render();
            });
            stage.querySelector("[data-sql-reveal]")?.addEventListener("click", () => {
                state.answers[state.index] = mission.canonical;
                state.earned[state.index] = 0;
                state.feedback[state.index] = "已顯示參考查詢；本關不計分，請逐句對照題目。";
                render();
            });
        };
        resetCurrentGame = () => {
            state.index = 0;
            state.attempts.fill(0);
            state.earned.fill(null);
            state.answers = game.missions.map(mission => mission.starter);
            state.feedback.fill("");
            state.hintIndex.fill(0);
            render();
        };
        render();
    };

    const renderCPUCycleRace = () => {
        const state = {
            index: 0,
            attempts: game.rounds.map(() => 0),
            earned: game.rounds.map(() => null),
            feedback: "",
            lastChoice: -1
        };
        const score = () => state.earned.reduce((sum, value) => sum + (Number(value) || 0), 0);
        const render = () => {
            const round = game.rounds[state.index];
            const completed = state.earned[state.index] !== null;
            stage.innerHTML = `
                <div class="lesson-cpu-dashboard">
                    <div class="lesson-cpu-route" aria-label="CPU 資料路線">
                        ${game.route.map((stop, index) => `<span class="${index <= state.index + 2 ? "is-reached" : ""}${index === Math.min(state.index + 2, game.route.length - 1) ? " is-current" : ""}"><b>${escapeHTML(stop)}</b><i aria-hidden="true">${index === Math.min(state.index + 2, game.route.length - 1) ? "⚡" : index <= state.index + 2 ? "✓" : "·"}</i></span>`).join("")}
                    </div>
                    <div class="lesson-arcade-status"><span>閘門 <b>${state.index + 1} / ${game.rounds.length}</b></span><span>能量 <b>${Math.max(1, 4 - state.attempts[state.index])} ⚡</b></span></div>
                </div>
                <section class="lesson-arcade-challenge">
                    <p class="lesson-game-kicker">${escapeHTML(round.title)}</p>
                    <h4>${escapeHTML(round.prompt)}</h4>
                    <div class="lesson-game-options lesson-arcade-options">
                        ${round.options.map((option, index) => {
                            const className = completed && index === round.answerIndex ? "is-correct" : (!completed && state.lastChoice === index ? "is-incorrect" : "");
                            return `<button type="button" data-cpu-choice="${index}" class="${className}"${completed ? " disabled" : ""}>${escapeHTML(option)}</button>`;
                        }).join("")}
                    </div>
                    <p class="lesson-game-feedback ${completed ? "is-success" : state.feedback ? "is-warning" : ""}" aria-live="polite">${escapeHTML(state.feedback || "選擇後，資料封包才會通過下一個閘門。")}</p>
                    ${completed ? `<div class="lesson-game-explanation"><p>${escapeHTML(round.explanation)}</p></div>` : ""}
                    ${completed ? `<div class="lesson-game-actions">${state.index === game.rounds.length - 1 ? `<button type="button" class="is-primary" disabled>已完成 ✓</button>` : `<button type="button" class="is-primary" data-cpu-next>衝向下一關 →</button>`}</div>` : ""}
                </section>
                ${state.earned.every(value => value !== null) && state.index === game.rounds.length - 1 ? `<div class="lesson-arcade-victory"><span aria-hidden="true">🏁</span><div><strong>機器周期通關！</strong><p>你已把 PC、MAR、MDR、CIR、控制器及 ALU 放回正確資料流程。</p></div></div>` : ""}
            `;
            updateScore(score());
            stage.querySelectorAll("[data-cpu-choice]").forEach(button => button.addEventListener("click", () => {
                const choice = Number(button.dataset.cpuChoice);
                state.attempts[state.index] += 1;
                state.lastChoice = choice;
                if (choice === round.answerIndex) {
                    state.earned[state.index] = state.attempts[state.index] === 1 ? 2 : 1;
                    state.feedback = `閘門開啟！取得 ${state.earned[state.index]} XP。`;
                } else {
                    state.feedback = "閘門未開。先判斷這一步處理的是地址、資料、解碼還是運算，再試一次。";
                }
                render();
            }));
            stage.querySelector("[data-cpu-next]")?.addEventListener("click", () => {
                if (state.index < game.rounds.length - 1) {
                    state.index += 1;
                    state.feedback = "";
                    state.lastChoice = -1;
                    render();
                }
            });
        };
        resetCurrentGame = () => {
            state.index = 0;
            state.attempts.fill(0);
            state.earned.fill(null);
            state.feedback = "";
            state.lastChoice = -1;
            render();
        };
        render();
    };

    const renderCyberDefense = () => {
        const state = {
            index: 0,
            health: 100,
            attempts: game.waves.map(() => 0),
            earned: game.waves.map(() => null),
            feedback: "",
            lastChoice: -1,
            penalised: new Set()
        };
        const score = () => state.earned.reduce((sum, value) => sum + (Number(value) || 0), 0);
        const render = () => {
            const wave = game.waves[state.index];
            const completed = state.earned[state.index] !== null;
            const healthClass = state.health >= 70 ? "is-healthy" : state.health >= 40 ? "is-warning" : "is-danger";
            stage.innerHTML = `
                <div class="lesson-defense-skyline" aria-hidden="true"><span>🏫</span><i>🖥️</i><i>📡</i><i>🗄️</i><b class="${completed ? "is-blocked" : ""}">${state.index === game.waves.length - 1 ? "👾" : "⚠️"}</b></div>
                <div class="lesson-defense-hud">
                    <span>攻擊波 <b>${state.index + 1} / ${game.waves.length}</b></span>
                    <span>系統健康 <b>${state.health}%</b></span>
                    <div class="lesson-defense-health ${healthClass}"><i style="width:${state.health}%"></i></div>
                </div>
                <section class="lesson-arcade-challenge">
                    <p class="lesson-game-kicker">${escapeHTML(wave.name)}</p>
                    <h4>${escapeHTML(wave.threat)}</h4>
                    <p class="lesson-defense-impact"><strong>可能影響：</strong>${escapeHTML(wave.impact)}</p>
                    <div class="lesson-game-options lesson-defense-options">
                        ${wave.options.map((option, index) => {
                            const className = completed && index === wave.answerIndex ? "is-correct" : (!completed && state.lastChoice === index ? "is-incorrect" : "");
                            return `<button type="button" data-defense-choice="${index}" class="${className}"${completed ? " disabled" : ""}>${escapeHTML(option)}</button>`;
                        }).join("")}
                    </div>
                    <p class="lesson-game-feedback ${completed ? "is-success" : state.feedback ? "is-warning" : ""}" aria-live="polite">${escapeHTML(state.feedback || "選擇一項能直接處理這個威脅的保安控制。")}</p>
                    ${completed ? `<div class="lesson-game-explanation"><p>${escapeHTML(wave.explanation)}</p></div><div class="lesson-game-actions">${state.index === game.waves.length - 1 ? `<button type="button" class="is-primary" disabled>保衛戰完成 ✓</button>` : `<button type="button" class="is-primary" data-defense-next>迎戰下一波 →</button>`}</div>` : ""}
                </section>
                ${state.earned.every(value => value !== null) && state.index === game.waves.length - 1 ? `<div class="lesson-arcade-victory"><span aria-hidden="true">🛡️</span><div><strong>校園系統守住了！</strong><p>剩餘健康值 ${state.health}%。記住：措施要寫出機制，不能只列「防毒／加密／備份」。</p></div></div>` : ""}
            `;
            updateScore(score());
            stage.querySelectorAll("[data-defense-choice]").forEach(button => button.addEventListener("click", () => {
                const choice = Number(button.dataset.defenseChoice);
                state.attempts[state.index] += 1;
                state.lastChoice = choice;
                if (choice === wave.answerIndex) {
                    state.earned[state.index] = state.attempts[state.index] === 1 ? 2 : 1;
                    state.feedback = `防禦成功，取得 ${state.earned[state.index]} XP。`;
                } else {
                    if (!state.penalised.has(state.index)) {
                        state.health = Math.max(40, state.health - 15);
                        state.penalised.add(state.index);
                    }
                    state.feedback = "控制未能直接處理目前攻擊。先找出攻擊途徑，再選能阻止、偵測或復原的措施。";
                }
                render();
            }));
            stage.querySelector("[data-defense-next]")?.addEventListener("click", () => {
                if (state.index < game.waves.length - 1) {
                    state.index += 1;
                    state.feedback = "";
                    state.lastChoice = -1;
                    render();
                }
            });
        };
        resetCurrentGame = () => {
            state.index = 0;
            state.health = 100;
            state.attempts.fill(0);
            state.earned.fill(null);
            state.feedback = "";
            state.lastChoice = -1;
            state.penalised = new Set();
            render();
        };
        render();
    };

    const renderAlgorithmArena = () => {
        const state = {
            index: 0,
            combo: 0,
            bestCombo: 0,
            attempts: game.rounds.map(() => 0),
            earned: game.rounds.map(() => null),
            feedback: "",
            lastChoice: -1
        };
        const score = () => state.earned.reduce((sum, value) => sum + (Number(value) || 0), 0);
        const render = () => {
            const round = game.rounds[state.index];
            const completed = state.earned[state.index] !== null;
            stage.innerHTML = `
                <div class="lesson-arena-header">
                    <div><span>ROUND</span><b>${state.index + 1}</b><small>/ ${game.rounds.length}</small></div>
                    <div class="lesson-arena-combo"><span>COMBO</span><b>×${state.combo}</b><small>最佳 ×${state.bestCombo}</small></div>
                </div>
                <section class="lesson-arcade-challenge">
                    <p class="lesson-game-kicker">${escapeHTML(round.title)}</p>
                    <h4>${escapeHTML(round.prompt)}</h4>
                    <div class="lesson-arena-array" aria-label="題目資料">${round.visual.map((value, index) => `<span style="--bar:${35 + ((index * 17) % 56)}%"><i></i><b>${escapeHTML(value)}</b></span>`).join("")}</div>
                    <div class="lesson-game-options lesson-arcade-options">
                        ${round.options.map((option, index) => {
                            const className = completed && index === round.answerIndex ? "is-correct" : (!completed && state.lastChoice === index ? "is-incorrect" : "");
                            return `<button type="button" data-arena-choice="${index}" class="${className}"${completed ? " disabled" : ""}>${escapeHTML(option)}</button>`;
                        }).join("")}
                    </div>
                    <p class="lesson-game-feedback ${completed ? "is-success" : state.feedback ? "is-warning" : ""}" aria-live="polite">${escapeHTML(state.feedback || "先在腦中逐步執行操作，再選答案。")}</p>
                    ${completed ? `<div class="lesson-game-explanation"><p>${escapeHTML(round.explanation)}</p></div><div class="lesson-game-actions">${state.index === game.rounds.length - 1 ? `<button type="button" class="is-primary" disabled>擂台完成 ✓</button>` : `<button type="button" class="is-primary" data-arena-next>下一回合 →</button>`}</div>` : ""}
                </section>
                ${state.earned.every(value => value !== null) && state.index === game.rounds.length - 1 ? `<div class="lesson-arcade-victory"><span aria-hidden="true">🏆</span><div><strong>演算法擂台完成！</strong><p>你已分辨 binary／linear search，以及 stack 的 LIFO 和 queue 的 FIFO。</p></div></div>` : ""}
            `;
            updateScore(score());
            stage.querySelectorAll("[data-arena-choice]").forEach(button => button.addEventListener("click", () => {
                const choice = Number(button.dataset.arenaChoice);
                state.attempts[state.index] += 1;
                state.lastChoice = choice;
                if (choice === round.answerIndex) {
                    state.earned[state.index] = state.attempts[state.index] === 1 ? 2 : 1;
                    state.combo += 1;
                    state.bestCombo = Math.max(state.bestCombo, state.combo);
                    state.feedback = `判斷正確，combo ×${state.combo}，取得 ${state.earned[state.index]} XP。`;
                } else {
                    state.combo = 0;
                    state.feedback = "Combo 中斷，但可以立即再試。把每一步寫出或用手指逐項追蹤。";
                }
                render();
            }));
            stage.querySelector("[data-arena-next]")?.addEventListener("click", () => {
                if (state.index < game.rounds.length - 1) {
                    state.index += 1;
                    state.feedback = "";
                    state.lastChoice = -1;
                    render();
                }
            });
        };
        resetCurrentGame = () => {
            state.index = 0;
            state.combo = 0;
            state.bestCombo = 0;
            state.attempts.fill(0);
            state.earned.fill(null);
            state.feedback = "";
            state.lastChoice = -1;
            render();
        };
        render();
    };

    const renderers = {
        "formula-detective": renderFormulaDetective,
        "network-builder": renderNetworkBuilder,
        "trace-debugger": renderTraceDebugger,
        "sql-missions": renderSQLMissions,
        "cpu-cycle-race": renderCPUCycleRace,
        "cyber-defense": renderCyberDefense,
        "algorithm-arena": renderAlgorithmArena
    };
    const renderer = renderers[game.type];
    if (!renderer) {
        stage.textContent = "這項互動活動尚未支援。";
        return;
    }
    renderer();
    root.querySelector("[data-game-reset]").addEventListener("click", () => {
        resetCurrentGame();
        root.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
})();
