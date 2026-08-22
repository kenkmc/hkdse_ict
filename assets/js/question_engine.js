(function initialiseQuestionEngine() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const questionBank = window.HKDSE_ICT_QUESTIONS;
    if (!platform || !Array.isArray(questionBank)) return;

    const topicSelect = document.getElementById("practice-topic");
    const difficultySelect = document.getElementById("practice-difficulty");
    const startButton = document.getElementById("practice-start");
    const questionPanel = document.getElementById("practice-question");
    const sessionPosition = document.getElementById("session-position");
    const sessionScore = document.getElementById("session-score");
    const sessionAvailable = document.getElementById("session-available");

    const difficultyLabels = {
        foundation: "基礎",
        standard: "標準",
        advanced: "進階"
    };

    let sessionQuestions = [];
    let currentIndex = 0;
    let earnedMarks = 0;
    let possibleMarks = 0;
    let answered = false;

    function normalise(value) {
        return String(value || "")
            .toUpperCase()
            .replace(/[；;]/g, "")
            .replace(/\s+/g, "")
            .replace(/[，。！？、]/g, "");
    }

    function getTopicLabel(topicId) {
        return platform.getItemById(topicId)?.title.replace(/^[ivx]+\.\s*/i, "") || topicId;
    }

    function populateTopics() {
        const topicIds = [...new Set(questionBank.map(question => question.topicId))];
        topicIds
            .sort((a, b) => getTopicLabel(a).localeCompare(getTopicLabel(b), "zh-Hant"))
            .forEach(topicId => {
                const option = document.createElement("option");
                option.value = topicId;
                option.textContent = getTopicLabel(topicId);
                topicSelect.appendChild(option);
            });
    }

    function getFilteredQuestions() {
        return questionBank.filter(question => {
            const topicMatches = !topicSelect.value || question.topicId === topicSelect.value;
            const difficultyMatches = !difficultySelect.value || question.difficulty === difficultySelect.value;
            return topicMatches && difficultyMatches;
        });
    }

    function updateAvailableCount() {
        sessionAvailable.textContent = getFilteredQuestions().length;
    }

    function createAnswerInput(question) {
        if (question.type === "mcq") {
            const options = document.createElement("div");
            options.className = "question-options";
            question.options.forEach(option => {
                const label = document.createElement("label");
                label.className = "question-option";
                label.innerHTML = `
                    <input type="radio" name="question-answer" value="${option.value}">
                    <span><strong>${option.value}.</strong> ${option.label}</span>
                `;
                options.appendChild(label);
            });
            return options;
        }

        const textarea = document.createElement("textarea");
        textarea.id = "question-answer";
        textarea.className = `question-answer${question.type === "sql" ? " question-answer-code" : ""}`;
        textarea.placeholder = question.type === "sql" ? "在此輸入 SQL…" : "在此輸入答案…";
        textarea.setAttribute("aria-label", "答案");
        return textarea;
    }

    function renderQuestion() {
        answered = false;
        const question = sessionQuestions[currentIndex];
        sessionPosition.textContent = `${currentIndex + 1} / ${sessionQuestions.length}`;
        sessionScore.textContent = `${earnedMarks} / ${possibleMarks}`;

        questionPanel.replaceChildren();

        const meta = document.createElement("div");
        meta.className = "question-meta";
        meta.innerHTML = `
            <span class="question-chip">${question.syllabusRef}</span>
            <span class="question-chip">${getTopicLabel(question.topicId)}</span>
            <span class="question-chip">${difficultyLabels[question.difficulty]}</span>
            <span class="question-chip question-chip-marks">${question.marks} 分</span>
        `;

        const title = document.createElement("h2");
        title.className = "question-title";
        title.textContent = question.question;

        questionPanel.append(meta, title);

        if (question.questionCode) {
            const code = document.createElement("pre");
            code.className = "question-code";
            code.textContent = question.questionCode;
            questionPanel.appendChild(code);
        }

        questionPanel.appendChild(createAnswerInput(question));

        const actions = document.createElement("div");
        actions.className = "question-actions";
        const submit = document.createElement("button");
        submit.type = "button";
        submit.className = "practice-button practice-button-secondary";
        submit.textContent = "提交答案";
        submit.addEventListener("click", submitAnswer);
        actions.appendChild(submit);
        questionPanel.appendChild(actions);
    }

    function readAnswer(question) {
        if (question.type === "mcq") {
            return questionPanel.querySelector('input[name="question-answer"]:checked')?.value || "";
        }
        return questionPanel.querySelector("#question-answer")?.value || "";
    }

    function calculateMarks(question, response) {
        const normalisedResponse = normalise(response);
        const accepted = [question.answer, ...(question.acceptedAnswers || [])].map(normalise);
        if (accepted.includes(normalisedResponse)) return question.marks;
        if (question.type === "mcq" || !normalisedResponse) return 0;

        return Math.min(question.marks, question.markingScheme.reduce((score, point) => {
            if (!point.anyOf) return score;
            const matched = point.anyOf.some(keyword => normalisedResponse.includes(normalise(keyword)));
            return score + (matched ? point.marks : 0);
        }, 0));
    }

    function submitAnswer() {
        if (answered) return;
        const question = sessionQuestions[currentIndex];
        const response = readAnswer(question).trim();
        if (!response) {
            window.alert("請先輸入或選擇答案。");
            return;
        }

        answered = true;
        const awarded = calculateMarks(question, response);
        earnedMarks += awarded;
        possibleMarks += question.marks;
        sessionScore.textContent = `${earnedMarks} / ${possibleMarks}`;

        questionPanel.querySelectorAll("input, textarea, button").forEach(control => {
            control.disabled = true;
        });

        const feedback = document.createElement("section");
        const state = awarded === question.marks ? "correct" : awarded > 0 ? "partial" : "incorrect";
        feedback.className = `question-feedback ${state}`;

        const heading = awarded === question.marks
            ? `答對：${awarded} / ${question.marks} 分`
            : awarded > 0
                ? `部分正確：${awarded} / ${question.marks} 分`
                : `需要再想：0 / ${question.marks} 分`;

        feedback.innerHTML = `
            <h3>${heading}</h3>
            <p><strong>參考答案：</strong>${question.answer}</p>
            <p><strong>解釋：</strong>${question.explanation}</p>
            <p><strong>評分準則：</strong></p>
            <ol class="marking-scheme">
                ${question.markingScheme.map(point => `<li>${point.criterion}（${point.marks} 分）</li>`).join("")}
            </ol>
        `;

        const actions = document.createElement("div");
        actions.className = "question-actions";
        const next = document.createElement("button");
        next.type = "button";
        next.className = "practice-button practice-button-secondary";
        next.textContent = currentIndex + 1 < sessionQuestions.length ? "下一題" : "查看總結";
        next.addEventListener("click", nextQuestion);
        actions.appendChild(next);
        feedback.appendChild(actions);
        questionPanel.appendChild(feedback);
    }

    function nextQuestion() {
        if (currentIndex + 1 < sessionQuestions.length) {
            currentIndex += 1;
            renderQuestion();
            return;
        }

        const percentage = possibleMarks ? Math.round(earnedMarks / possibleMarks * 100) : 0;
        questionPanel.innerHTML = `
            <div class="practice-empty">
                <div>
                    <div class="practice-empty-icon">${percentage}%</div>
                    <h2>本次練習完成</h2>
                    <p>得分：${earnedMarks} / ${possibleMarks}。可調整課題或難度後再練習。</p>
                </div>
            </div>
        `;
        sessionPosition.textContent = `${sessionQuestions.length} / ${sessionQuestions.length}`;
    }

    function startSession() {
        sessionQuestions = getFilteredQuestions();
        if (!sessionQuestions.length) {
            questionPanel.innerHTML = '<div class="practice-empty"><div><div class="practice-empty-icon">0</div><h2>沒有符合條件的題目</h2><p>請選擇其他課題或難度。</p></div></div>';
            return;
        }

        currentIndex = 0;
        earnedMarks = 0;
        possibleMarks = 0;
        renderQuestion();
    }

    populateTopics();
    updateAvailableCount();
    topicSelect.addEventListener("change", updateAvailableCount);
    difficultySelect.addEventListener("change", updateAvailableCount);
    startButton.addEventListener("click", startSession);
})();
