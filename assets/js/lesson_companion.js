(function initialiseLessonCompanion() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const learning = window.HKDSE_ICT_LEARNING;
    if (!platform || !learning?.pages) return;

    const item = platform.getItemByPath(window.location.pathname);
    const page = item ? learning.pages[item.id] : null;
    const nav = document.querySelector(".platform-shell-nav");
    if (!item || !page || !nav || document.querySelector(".lesson-companion")) return;
    const expandedByDefault = item.type === "lesson" || item.id === "tool-dse-practice";

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
})();
