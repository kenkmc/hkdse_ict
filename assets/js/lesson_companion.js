(function initialiseLessonCompanion() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const learning = window.HKDSE_ICT_LEARNING;
    const questionBank = window.HKDSE_ICT_QUESTIONS || [];
    if (!platform || !learning?.pages) return;

    const item = platform.getItemByPath(window.location.pathname);
    const page = item ? learning.pages[item.id] : null;
    const nav = document.querySelector(".platform-shell-nav");
    if (!item || !page || !nav || document.querySelector(".lesson-companion")) return;
    const expandedByDefault = item.type === "lesson" || item.id === "tool-dse-practice";
    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
    const layerStorageKey = "hkdse-ict-layered-learning-v1";
    const readLayerProgress = () => {
        try {
            const stored = JSON.parse(window.localStorage.getItem(layerStorageKey) || "{}");
            return stored && typeof stored === "object" ? stored : {};
        } catch (error) {
            return {};
        }
    };
    const allLayerProgress = readLayerProgress();
    const pageLayerProgress = allLayerProgress[item.id] && typeof allLayerProgress[item.id] === "object"
        ? allLayerProgress[item.id]
        : { activeLevelId: "foundation", levels: {} };
    pageLayerProgress.levels ||= {};
    const saveLayerProgress = () => {
        try {
            allLayerProgress[item.id] = pageLayerProgress;
            window.localStorage.setItem(layerStorageKey, JSON.stringify(allLayerProgress));
            return true;
        } catch (error) {
            return false;
        }
    };
    const featuredQuestion = page.featuredQuestionId
        ? questionBank.find(question => question.id === page.featuredQuestionId)
        : null;

    const section = document.createElement("section");
    section.className = "lesson-companion";
    section.setAttribute("aria-labelledby", "lesson-companion-title");

    const concepts = page.concepts.map((concept, index) => `
        <button class="lesson-concept${index === 0 ? " is-active" : ""}" type="button" data-concept-index="${index}" aria-pressed="${index === 0}">
            <span class="lesson-concept-icon" aria-hidden="true">${concept.icon}</span>
            <span>${concept.label}</span>
        </button>
    `).join("");

    const misconceptions = page.misconceptions.map(item => `
        <details class="lesson-misconception">
            <summary>${item.claim}</summary>
            <p>${item.correction}</p>
        </details>
    `).join("");

    const quickOptions = page.quickCheck.options.map((option, index) => `
        <button class="lesson-check-option" type="button" data-answer-index="${index}">${String.fromCharCode(65 + index)}. ${option}</button>
    `).join("");

    const practiceLink = item.id === "tool-dse-practice"
        ? ""
        : `<a class="lesson-practice-link" href="practice.html?topic=${encodeURIComponent(item.id)}">練習此課題 →</a>`;

    const scopeNote = page.scopeNote
        ? `<p class="lesson-scope-note"><strong>課程界線：</strong>${escapeHTML(page.scopeNote)}</p>`
        : "";

    const featuredPractice = featuredQuestion ? `
        <div class="lesson-featured-practice" data-lesson-featured>
            <div class="lesson-featured-heading">
                <div>
                    <p class="lesson-check-label">原創 DSE 題型</p>
                    <h3>把概念放回考試情境</h3>
                </div>
                <span>${featuredQuestion.marks} 分 · ${featuredQuestion.difficulty === "advanced" ? "進階" : featuredQuestion.difficulty === "standard" ? "標準" : "基礎"}</span>
            </div>
            <p class="lesson-featured-question">${escapeHTML(featuredQuestion.question)}</p>
            ${featuredQuestion.questionCode ? `<pre class="lesson-featured-code"><code>${escapeHTML(featuredQuestion.questionCode)}</code></pre>` : ""}
            ${featuredQuestion.type === "mcq" ? `
                <div class="lesson-featured-options" role="group" aria-label="題目選項">
                    ${featuredQuestion.options.map(option => `<button type="button" data-featured-option="${escapeHTML(option.value)}" aria-pressed="false">${escapeHTML(option.value)}. ${escapeHTML(option.label)}</button>`).join("")}
                </div>
            ` : `<textarea class="lesson-featured-response" rows="3" aria-label="原創 DSE 題型答案" placeholder="先按題目指令詞作答，再逐點對照評分準則……"></textarea>`}
            <button class="lesson-featured-reveal" type="button" aria-expanded="false">提交並查看評分準則</button>
            <div class="lesson-featured-scheme" hidden>
                <p><strong>參考答案：</strong>${escapeHTML(featuredQuestion.answer)}</p>
                <ol>${featuredQuestion.markingScheme.map(point => `<li><b>${point.marks} 分</b>${escapeHTML(point.criterion)}</li>`).join("")}</ol>
                <p class="lesson-featured-explanation">${escapeHTML(featuredQuestion.explanation)}</p>
            </div>
        </div>
    ` : "";

    const lessonVisual = page.visual ? `
        <figure class="lesson-visual">
            <div class="lesson-visual-media">
                <img src="${escapeHTML(page.visual.src)}" alt="${escapeHTML(page.visual.alt)}" width="${Number(page.visual.width) || 1672}" height="${Number(page.visual.height) || 941}" loading="lazy" decoding="async">
            </div>
            <figcaption>
                <p class="lesson-check-label">圖像導讀</p>
                <h3>${escapeHTML(page.visual.title)}</h3>
                <p>${escapeHTML(page.visual.caption)}</p>
                <div class="lesson-visual-points">${page.visual.points.map(point => `<span>${escapeHTML(point)}</span>`).join("")}</div>
            </figcaption>
        </figure>
    ` : "";

    const layeredStudy = page.layeredLearning ? (() => {
        const { scenario, microLesson, levels } = page.layeredLearning;
        if (!levels.some(level => level.id === pageLayerProgress.activeLevelId)) pageLayerProgress.activeLevelId = levels[0].id;
        const completeCount = levels.filter(level => pageLayerProgress.levels[level.id]?.completed).length;
        const tabs = levels.map((level, index) => {
            const active = level.id === pageLayerProgress.activeLevelId;
            const complete = Boolean(pageLayerProgress.levels[level.id]?.completed);
            return `
                <button class="lesson-layer-tab${active ? " is-active" : ""}${complete ? " is-complete" : ""}" type="button" role="tab" aria-selected="${active}" aria-controls="lesson-layer-panel-${escapeHTML(level.id)}" data-layer-tab="${escapeHTML(level.id)}">
                    <span>${index + 1}</span>
                    <b>${escapeHTML(level.label)}</b>
                    <small>${escapeHTML(level.tag)}</small>
                </button>
            `;
        }).join("");
        const panels = levels.map(level => {
            const active = level.id === pageLayerProgress.activeLevelId;
            const saved = pageLayerProgress.levels[level.id] || {};
            const checkedCriteria = new Set(Array.isArray(saved.criteria) ? saved.criteria : []);
            const allChecked = level.criteria.every((criterion, index) => checkedCriteria.has(index));
            return `
                <section id="lesson-layer-panel-${escapeHTML(level.id)}" class="lesson-layer-panel" role="tabpanel" data-layer-panel="${escapeHTML(level.id)}"${active ? "" : " hidden"}>
                    <div class="lesson-layer-brief">
                        <div class="lesson-layer-meta"><span>${escapeHTML(level.duration)}</span><span>${escapeHTML(level.tag)}</span></div>
                        <h3>${escapeHTML(level.label)}：${escapeHTML(level.goal)}</h3>
                        <p><strong>本層課業：</strong>${escapeHTML(level.task)}</p>
                        <p class="lesson-layer-output"><strong>提交形式：</strong>${escapeHTML(level.output)}</p>
                        ${level.id === "exam" ? `<a class="lesson-layer-practice" href="practice.html?topic=${encodeURIComponent(item.id)}">開啟本課題題庫 →</a>` : ""}
                    </div>
                    <div class="lesson-layer-work">
                        <p class="lesson-check-label">完成準則</p>
                        <div class="lesson-layer-criteria">
                            ${level.criteria.map((criterion, index) => `
                                <label><input type="checkbox" data-layer-criterion="${index}"${checkedCriteria.has(index) ? " checked" : ""}> <span>${escapeHTML(criterion)}</span></label>
                            `).join("")}
                        </div>
                        <label class="lesson-layer-note">
                            <span>我的答案／證據筆記</span>
                            <textarea rows="4" data-layer-note placeholder="先草擬答案；內容只儲存在這個瀏覽器。">${escapeHTML(saved.note || "")}</textarea>
                        </label>
                        <div class="lesson-layer-actions">
                            <button type="button" data-layer-complete${allChecked ? "" : " disabled"}>${saved.completed ? "已完成 ✓" : "標記本層完成"}</button>
                            <span data-layer-save-status>${saved.note || checkedCriteria.size ? "已儲存在此瀏覽器" : "尚未儲存"}</span>
                        </div>
                    </div>
                </section>
            `;
        }).join("");
        const mediaSteps = microLesson.steps.map((step, index) => `
            <button type="button" data-media-step="${index}" aria-label="查看畫面 ${index + 1}" aria-pressed="${index === 0}"></button>
        `).join("");
        const firstStep = microLesson.steps[0];
        return `
            <section class="lesson-layered-study" aria-labelledby="lesson-layered-title">
                <div class="lesson-layered-heading">
                    <div>
                        <p class="lesson-check-label">分層學習與課業</p>
                        <h3 id="lesson-layered-title">由概念穩固到 DSE 應用</h3>
                        <p>三層可以按需要選做，不會鎖住內容；完成記錄只存於目前瀏覽器。</p>
                    </div>
                    <div class="lesson-layer-progress" aria-label="分層課業進度">
                        <strong data-layer-progress-text>${completeCount} / ${levels.length}</strong>
                        <span><i data-layer-progress-bar style="width:${(completeCount / levels.length) * 100}%"></i></span>
                    </div>
                </div>
                <div class="lesson-layer-tabs" role="tablist" aria-label="選擇學習層級">${tabs}</div>
                ${panels}
                <section class="lesson-media-lab" aria-labelledby="lesson-media-title">
                    <figure>
                        <img src="${escapeHTML(scenario.src)}" alt="${escapeHTML(scenario.alt)}" width="${Number(scenario.width) || 1672}" height="${Number(scenario.height) || 941}" loading="lazy" decoding="async">
                        <figcaption><strong>${escapeHTML(scenario.title)}</strong>${escapeHTML(scenario.caption)}</figcaption>
                    </figure>
                    <div class="lesson-media-player">
                        <div class="lesson-media-player-heading">
                            <div><p class="lesson-check-label">圖像微課</p><h3 id="lesson-media-title">${escapeHTML(microLesson.title)}</h3></div>
                            <span>約 90 秒</span>
                        </div>
                        <div class="lesson-media-frame" aria-live="polite">
                            <span class="lesson-media-icon" aria-hidden="true" data-media-icon>${escapeHTML(firstStep.icon)}</span>
                            <div><small data-media-kicker>${escapeHTML(firstStep.kicker)}</small><h4 data-media-title>${escapeHTML(firstStep.title)}</h4><p data-media-body>${escapeHTML(firstStep.body)}</p></div>
                        </div>
                        <div class="lesson-media-controls">
                            <button type="button" data-media-prev aria-label="上一個畫面">←</button>
                            <button type="button" data-media-play aria-pressed="false">播放微課</button>
                            <button type="button" data-media-next aria-label="下一個畫面">→</button>
                            <div class="lesson-media-dots">${mediaSteps}</div>
                        </div>
                    </div>
                </section>
            </section>
        `;
    })() : "";

    const dseFocus = page.dseFocus ? `
        <section class="lesson-dse-focus" aria-labelledby="lesson-dse-focus-title">
            <div class="lesson-dse-focus-heading">
                <div><p class="lesson-check-label">DSE 用字與重點</p><h3 id="lesson-dse-focus-title">這一課要懂甚麼、怎樣寫</h3></div>
                <a href="past-paper-index.html#topics">查看全部課題 →</a>
            </div>
            <div class="lesson-dse-focus-grid">
                <div class="lesson-dse-focus-block">
                    <h4>必用字詞</h4>
                    <div class="lesson-dse-term-list">${page.dseFocus.keyTerms.map(term => `<span>${escapeHTML(term)}</span>`).join("")}</div>
                </div>
                <div class="lesson-dse-focus-block">
                    <h4>核心重點</h4>
                    <ul>${page.dseFocus.mustKnow.map(point => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
                </div>
                <div class="lesson-dse-focus-block lesson-dse-losses">
                    <h4>常見失分</h4>
                    <ul>${page.dseFocus.lossPoints.map(point => `<li>${escapeHTML(point)}</li>`).join("")}</ul>
                </div>
            </div>
            <div class="lesson-dse-answer-pattern"><strong>建議答題結構</strong><span>${escapeHTML(page.dseFocus.answerPattern)}</span></div>
            <div class="lesson-dse-question-forms"><strong>常見要求：</strong>${page.dseFocus.questionForms.map(form => `<span>${escapeHTML(form)}</span>`).join("")}</div>
        </section>
    ` : "";

    section.innerHTML = `
        <div class="lesson-companion-heading">
            <div>
                <p class="lesson-companion-kicker">本頁學習助手</p>
                <h2 id="lesson-companion-title">先掌握重點，再操作頁內實驗</h2>
            </div>
            <button class="lesson-companion-toggle" type="button" aria-expanded="${expandedByDefault}" aria-controls="lesson-companion-content">${expandedByDefault ? "收起" : "展開學習重點"}</button>
        </div>
        <div id="lesson-companion-content" class="lesson-companion-content"${expandedByDefault ? "" : " hidden"}>
            ${lessonVisual}
            ${dseFocus}
            ${layeredStudy}
            <div class="lesson-objectives">
                <h3>完成本頁後，你應能夠</h3>
                <ul>${page.objectives.map(objective => `<li>${objective}</li>`).join("")}</ul>
                ${scopeNote}
            </div>
            <div class="lesson-concept-explorer">
                <div class="lesson-section-heading">
                    <div>
                        <span>互動概念圖</span>
                        <h3>點選節點查看關係</h3>
                    </div>
                    ${practiceLink}
                </div>
                <div class="lesson-concept-track" role="group" aria-label="本頁概念節點">${concepts}</div>
                <p class="lesson-concept-detail" aria-live="polite"><strong>${page.concepts[0].label}：</strong>${page.concepts[0].detail}</p>
            </div>
            <div class="lesson-mistakes">
                <h3>常見誤解</h3>
                ${misconceptions}
                <p class="lesson-exam-tip"><strong>DSE 提示：</strong>${page.examTip}</p>
            </div>
            <div class="lesson-quick-check">
                <p class="lesson-check-label">60 秒快速檢查</p>
                <h3>${page.quickCheck.question}</h3>
                <div class="lesson-check-options">${quickOptions}</div>
                <p class="lesson-check-feedback" aria-live="polite">選擇答案後會顯示解釋。</p>
            </div>
            ${featuredPractice}
        </div>
    `;

    nav.insertAdjacentElement("afterend", section);

    const content = section.querySelector(".lesson-companion-content");
    const toggle = section.querySelector(".lesson-companion-toggle");
    toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        toggle.textContent = expanded ? "展開學習重點" : "收起";
        content.hidden = expanded;
    });

    const layeredSection = section.querySelector(".lesson-layered-study");
    if (layeredSection && page.layeredLearning) {
        const levels = page.layeredLearning.levels;
        const updateLayerProgressUI = () => {
            const completed = levels.filter(level => pageLayerProgress.levels[level.id]?.completed).length;
            const progressText = layeredSection.querySelector("[data-layer-progress-text]");
            const progressBar = layeredSection.querySelector("[data-layer-progress-bar]");
            if (progressText) progressText.textContent = `${completed} / ${levels.length}`;
            if (progressBar) progressBar.style.width = `${(completed / levels.length) * 100}%`;
            layeredSection.querySelectorAll("[data-layer-tab]").forEach(tab => {
                tab.classList.toggle("is-complete", Boolean(pageLayerProgress.levels[tab.dataset.layerTab]?.completed));
            });
        };
        const showLayer = levelId => {
            pageLayerProgress.activeLevelId = levelId;
            layeredSection.querySelectorAll("[data-layer-tab]").forEach(tab => {
                const active = tab.dataset.layerTab === levelId;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", String(active));
            });
            layeredSection.querySelectorAll("[data-layer-panel]").forEach(panel => {
                panel.hidden = panel.dataset.layerPanel !== levelId;
            });
            saveLayerProgress();
        };
        layeredSection.querySelectorAll("[data-layer-tab]").forEach(tab => {
            tab.addEventListener("click", () => showLayer(tab.dataset.layerTab));
        });
        layeredSection.querySelectorAll("[data-layer-panel]").forEach(panel => {
            const levelId = panel.dataset.layerPanel;
            const level = levels.find(candidate => candidate.id === levelId);
            if (!level) return;
            const state = pageLayerProgress.levels[levelId] ||= { criteria: [], note: "", completed: false };
            const criteria = [...panel.querySelectorAll("[data-layer-criterion]")];
            const completeButton = panel.querySelector("[data-layer-complete]");
            const saveStatus = panel.querySelector("[data-layer-save-status]");
            const updateCompletionAvailability = () => {
                const allChecked = criteria.every(input => input.checked);
                completeButton.disabled = !allChecked;
                if (!allChecked && state.completed) {
                    state.completed = false;
                    completeButton.textContent = "標記本層完成";
                }
                updateLayerProgressUI();
            };
            criteria.forEach(input => {
                input.addEventListener("change", () => {
                    state.criteria = criteria.flatMap((candidate, index) => candidate.checked ? [index] : []);
                    updateCompletionAvailability();
                    saveStatus.textContent = saveLayerProgress() ? "已儲存在此瀏覽器" : "瀏覽器未能儲存";
                });
            });
            panel.querySelector("[data-layer-note]").addEventListener("input", event => {
                state.note = event.currentTarget.value;
                saveStatus.textContent = saveLayerProgress() ? "已儲存在此瀏覽器" : "瀏覽器未能儲存";
            });
            completeButton.addEventListener("click", () => {
                if (completeButton.disabled) return;
                state.completed = true;
                state.completedAt = new Date().toISOString();
                completeButton.textContent = "已完成 ✓";
                saveStatus.textContent = saveLayerProgress() ? "完成記錄已儲存" : "瀏覽器未能儲存";
                updateLayerProgressUI();
            });
            updateCompletionAvailability();
        });

        const mediaSteps = page.layeredLearning.microLesson.steps;
        let mediaIndex = 0;
        let mediaTimer = null;
        const mediaPlay = layeredSection.querySelector("[data-media-play]");
        const renderMediaStep = index => {
            mediaIndex = (index + mediaSteps.length) % mediaSteps.length;
            const step = mediaSteps[mediaIndex];
            layeredSection.querySelector("[data-media-icon]").textContent = step.icon;
            layeredSection.querySelector("[data-media-kicker]").textContent = step.kicker;
            layeredSection.querySelector("[data-media-title]").textContent = step.title;
            layeredSection.querySelector("[data-media-body]").textContent = step.body;
            layeredSection.querySelectorAll("[data-media-step]").forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === mediaIndex);
                dot.setAttribute("aria-pressed", String(dotIndex === mediaIndex));
            });
        };
        const stopMedia = () => {
            if (mediaTimer) window.clearInterval(mediaTimer);
            mediaTimer = null;
            mediaPlay.setAttribute("aria-pressed", "false");
            mediaPlay.textContent = "播放微課";
            layeredSection.classList.remove("is-playing");
        };
        const startMedia = () => {
            mediaTimer = window.setInterval(() => renderMediaStep(mediaIndex + 1), 4000);
            mediaPlay.setAttribute("aria-pressed", "true");
            mediaPlay.textContent = "暫停微課";
            layeredSection.classList.add("is-playing");
        };
        mediaPlay.addEventListener("click", () => mediaTimer ? stopMedia() : startMedia());
        layeredSection.querySelector("[data-media-prev]").addEventListener("click", () => { stopMedia(); renderMediaStep(mediaIndex - 1); });
        layeredSection.querySelector("[data-media-next]").addEventListener("click", () => { stopMedia(); renderMediaStep(mediaIndex + 1); });
        layeredSection.querySelectorAll("[data-media-step]").forEach(dot => {
            dot.addEventListener("click", () => { stopMedia(); renderMediaStep(Number(dot.dataset.mediaStep)); });
        });
        renderMediaStep(0);
        window.addEventListener("pagehide", stopMedia, { once: true });
    }

    const conceptDetail = section.querySelector(".lesson-concept-detail");
    section.querySelectorAll(".lesson-concept").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.conceptIndex);
            const concept = page.concepts[index];
            section.querySelectorAll(".lesson-concept").forEach(candidate => {
                const active = candidate === button;
                candidate.classList.toggle("is-active", active);
                candidate.setAttribute("aria-pressed", String(active));
            });
            conceptDetail.innerHTML = `<strong>${concept.label}：</strong>${concept.detail}`;
        });
    });

    const feedback = section.querySelector(".lesson-check-feedback");
    section.querySelectorAll(".lesson-check-option").forEach(button => {
        button.addEventListener("click", () => {
            const selectedIndex = Number(button.dataset.answerIndex);
            const correct = selectedIndex === page.quickCheck.answerIndex;
            section.querySelectorAll(".lesson-check-option").forEach(candidate => {
                const candidateIndex = Number(candidate.dataset.answerIndex);
                candidate.classList.remove("is-correct", "is-incorrect");
                if (candidateIndex === page.quickCheck.answerIndex) candidate.classList.add("is-correct");
            });
            if (!correct) button.classList.add("is-incorrect");
            feedback.className = `lesson-check-feedback ${correct ? "is-correct" : "is-incorrect"}`;
            feedback.textContent = `${correct ? "答對。" : "未正確。"}${page.quickCheck.explanation}`;
        });
    });

    const featured = section.querySelector("[data-lesson-featured]");
    if (featured && featuredQuestion) {
        featured.querySelectorAll("[data-featured-option]").forEach(option => {
            option.addEventListener("click", () => {
                featured.querySelectorAll("[data-featured-option]").forEach(candidate => {
                    const selected = candidate === option;
                    candidate.classList.toggle("is-selected", selected);
                    candidate.setAttribute("aria-pressed", String(selected));
                });
            });
        });

        const reveal = featured.querySelector(".lesson-featured-reveal");
        const scheme = featured.querySelector(".lesson-featured-scheme");
        reveal.addEventListener("click", () => {
            const willOpen = scheme.hidden;
            scheme.hidden = !willOpen;
            reveal.setAttribute("aria-expanded", String(willOpen));
            reveal.textContent = willOpen ? "收起評分準則" : "提交並查看評分準則";
            featured.querySelectorAll("[data-featured-option]").forEach(option => {
                option.classList.remove("is-correct", "is-incorrect");
                if (willOpen && option.dataset.featuredOption === featuredQuestion.answer) option.classList.add("is-correct");
                if (willOpen && option.classList.contains("is-selected") && option.dataset.featuredOption !== featuredQuestion.answer) {
                    option.classList.add("is-incorrect");
                }
            });
        });
    }
})();
