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

    section.innerHTML = `
        <div class="lesson-companion-heading">
            <div>
                <p class="lesson-companion-kicker">本頁學習助手</p>
                <h2 id="lesson-companion-title">先掌握重點，再操作頁內實驗</h2>
            </div>
            <button class="lesson-companion-toggle" type="button" aria-expanded="${expandedByDefault}" aria-controls="lesson-companion-content">${expandedByDefault ? "收起" : "展開學習重點"}</button>
        </div>
        <div id="lesson-companion-content" class="lesson-companion-content"${expandedByDefault ? "" : " hidden"}>
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
