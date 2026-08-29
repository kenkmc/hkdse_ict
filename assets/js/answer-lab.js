(function initialiseAnswerLab() {
    "use strict";

    const study = window.HKDSE_ICT_EXAM_PRACTICE;
    if (!study) return;

    const frameworkContainer = document.querySelector("[data-answer-framework]");
    const setTabs = document.querySelector("[data-practice-set-tabs]");
    const practicePanel = document.querySelector("[data-practice-panel]");
    if (!frameworkContainer || !setTabs || !practicePanel) return;

    const state = {
        setId: study.practiceSets[0]?.id,
        layer: "foundation",
        foundation: {},
        exam: {},
        challenge: {}
    };

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function renderOverview() {
        frameworkContainer.replaceChildren(...study.answerFramework.map((item, index) => {
            const article = element("article", "answer-framework-card");
            article.append(
                element("b", "", String(index + 1)),
                element("h3", "", item.label),
                element("p", "", item.prompt)
            );
            return article;
        }));
    }

    function renderStimulus(visual) {
        const figure = element("figure", "answer-stimulus");
        figure.append(element("figcaption", "", visual.title));

        if (visual.type === "spreadsheet") {
            const table = element("table", "answer-sheet");
            const head = document.createElement("thead");
            const headRow = document.createElement("tr");
            visual.columns.forEach(column => headRow.append(element("th", "", column)));
            head.append(headRow);
            const body = document.createElement("tbody");
            visual.rows.forEach(row => {
                const tr = document.createElement("tr");
                row.forEach(value => tr.append(element("td", "", value)));
                body.append(tr);
            });
            table.append(head, body);
            figure.append(table);
        }

        if (visual.type === "network") {
            const flow = element("div", "answer-network-flow");
            visual.nodes.forEach((node, index) => {
                if (index) flow.append(element("span", "answer-network-arrow", "→"));
                flow.append(element("span", "answer-network-node", node));
            });
            figure.append(flow);
        }

        if (visual.type === "database") {
            const grid = element("div", "answer-db-grid");
            visual.tables.forEach(tableData => {
                const table = element("div", "answer-db-table");
                table.append(element("b", "", tableData.name));
                tableData.fields.forEach(field => table.append(element("span", "", field)));
                grid.append(table);
            });
            figure.append(grid);
        }

        if (visual.type === "algorithm") {
            figure.append(element("pre", "answer-algorithm", visual.code.join("\n")));
        }

        if (visual.type === "form") {
            const form = element("div", "answer-form-mock");
            visual.fields.forEach(field => {
                const row = element("div", "answer-form-field");
                row.append(element("span", "", field), element("i", ""));
                form.append(row);
            });
            const issues = element("div", "answer-issue-row");
            visual.issues.forEach(issue => issues.append(element("span", "", `⚠ ${issue}`)));
            form.append(issues);
            figure.append(form);
        }

        return figure;
    }

    function selectedSet() {
        return study.practiceSets.find(item => item.id === state.setId) || study.practiceSets[0];
    }

    function ensureState(setId) {
        state.foundation[setId] ||= { selected: new Set(), checked: false };
        state.exam[setId] ||= { sequence: [], checked: false };
        state.challenge[setId] ||= { text: "", checks: new Set(), revealed: false };
    }

    function renderSetTabs() {
        setTabs.replaceChildren(...study.practiceSets.map(item => {
            const button = element("button", "");
            button.type = "button";
            button.role = "tab";
            const active = item.id === state.setId;
            button.setAttribute("aria-selected", String(active));
            button.append(element("span", "", item.icon), document.createTextNode(item.label));
            button.addEventListener("click", () => {
                state.setId = item.id;
                state.layer = "foundation";
                renderSetTabs();
                renderPractice();
            });
            return button;
        }));
    }

    function renderFoundation(pack, container) {
        const layer = pack.layers.foundation;
        const current = state.foundation[pack.id];
        container.append(element("h4", "", layer.title), element("p", "answer-layer-prompt", layer.prompt));
        const response = element("blockquote", "answer-response-sample");
        response.append(element("strong", "", "全新編寫的模擬弱答案"), document.createTextNode(layer.response));
        container.append(response);

        const options = element("div", "answer-option-grid");
        const buttons = new Map();
        layer.options.forEach(option => {
            const button = element("button", "answer-option", option.label);
            button.type = "button";
            button.setAttribute("aria-pressed", String(current.selected.has(option.id)));
            button.addEventListener("click", () => {
                current.checked = false;
                if (current.selected.has(option.id)) current.selected.delete(option.id);
                else current.selected.add(option.id);
                renderPractice();
            });
            buttons.set(option.id, button);
            options.append(button);
        });
        container.append(options);

        const actions = element("div", "answer-action-row");
        const check = element("button", "answer-check-button", "檢查診斷");
        check.type = "button";
        const feedback = element("p", "answer-feedback");
        if (current.checked) {
            const correct = new Set(layer.correctIds);
            const exact = current.selected.size === correct.size && [...current.selected].every(id => correct.has(id));
            buttons.forEach((button, id) => {
                if (correct.has(id)) button.classList.add("is-correct");
                else if (current.selected.has(id)) button.classList.add("is-wrong");
            });
            feedback.classList.add(exact ? "is-success" : "is-warning");
            feedback.textContent = `${exact ? "診斷正確。" : "再看綠色答案點。"}${layer.feedback}`;
        } else {
            feedback.textContent = `已選 ${current.selected.size} 項；按題目要求選取最關鍵的缺口。`;
        }
        check.addEventListener("click", () => { current.checked = true; renderPractice(); });
        actions.append(check, feedback);
        container.append(actions);
    }

    function renderExam(pack, container) {
        const layer = pack.layers.exam;
        const current = state.exam[pack.id];
        container.append(element("h4", "", layer.title), element("p", "answer-layer-prompt", layer.prompt));

        const output = element("div", `answer-build-output${current.sequence.length ? "" : " is-empty"}`,
            current.sequence.length ? current.sequence.map(id => layer.blocks.find(block => block.id === id)?.text || "").join(" ") : "按下方積木，逐段建立答案……"
        );
        container.append(output);

        const blocks = element("div", "answer-block-grid");
        layer.blocks.forEach(block => {
            const chosen = current.sequence.includes(block.id);
            const button = element("button", "answer-block", block.text);
            button.type = "button";
            button.setAttribute("aria-pressed", String(chosen));
            button.addEventListener("click", () => {
                current.checked = false;
                if (chosen) current.sequence = current.sequence.filter(id => id !== block.id);
                else current.sequence.push(block.id);
                renderPractice();
            });
            blocks.append(button);
        });
        container.append(blocks);

        const actions = element("div", "answer-action-row");
        const check = element("button", "answer-check-button", "檢查結構");
        check.type = "button";
        check.addEventListener("click", () => { current.checked = true; renderPractice(); });
        const clear = element("button", "answer-clear-button", "清除重組");
        clear.type = "button";
        clear.addEventListener("click", () => { current.sequence = []; current.checked = false; renderPractice(); });
        const feedback = element("p", "answer-feedback");
        if (current.checked) {
            const exact = current.sequence.length === layer.targetIds.length && current.sequence.every((id, index) => id === layer.targetIds[index]);
            const samePieces = current.sequence.length === layer.targetIds.length && current.sequence.every(id => layer.targetIds.includes(id));
            feedback.classList.add(exact ? "is-success" : "is-warning");
            feedback.textContent = exact ? "結構完整，次序亦能清楚呈現答案邏輯。" : samePieces ? "答案點齊全，但應按題目或資料流次序排列。" : "仍有必要答案點遺漏，或混入不符合題意的內容。";
            const model = element("div", "answer-model");
            model.append(element("strong", "", "完整示例："), document.createTextNode(layer.model));
            container.append(actions, model);
            actions.append(check, clear, feedback);
            return;
        }
        feedback.textContent = `已選 ${current.sequence.length} 個積木。`;
        actions.append(check, clear, feedback);
        container.append(actions);
    }

    function renderChallenge(pack, container) {
        const layer = pack.layers.challenge;
        const current = state.challenge[pack.id];
        container.append(element("h4", "", layer.title), element("p", "answer-layer-prompt", `${layer.question}（${layer.marks} 分）`));

        const label = element("label", "answer-writing-label");
        label.append(element("span", "", "我的答案"));
        const textarea = document.createElement("textarea");
        textarea.value = current.text;
        textarea.placeholder = "先獨立作答，再按下方評分點自我核對……";
        textarea.addEventListener("input", () => {
            current.text = textarea.value;
            count.textContent = `${current.text.trim().length} 字`;
        });
        label.append(textarea);
        const meta = element("div", "answer-writing-meta");
        meta.append(element("span", "", `${layer.marks} 個可辨認評分點`));
        const count = element("span", "", `${current.text.trim().length} 字`);
        meta.append(count);
        label.append(meta);
        container.append(label);

        const checklist = element("div", "answer-self-check");
        layer.checklist.forEach((point, index) => {
            const checkLabel = document.createElement("label");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = current.checks.has(index);
            input.addEventListener("change", () => {
                if (input.checked) current.checks.add(index);
                else current.checks.delete(index);
            });
            checkLabel.append(input, element("span", "", point));
            checklist.append(checkLabel);
        });
        container.append(checklist);

        const actions = element("div", "answer-action-row");
        const reveal = element("button", "answer-reveal-button", current.revealed ? "重新核對參考答案" : "完成後查看參考答案");
        reveal.type = "button";
        reveal.addEventListener("click", () => {
            current.text = textarea.value;
            current.revealed = true;
            renderPractice();
        });
        const feedback = element("p", "answer-feedback");
        if (!current.revealed) {
            feedback.textContent = "勾選只代表你認為答案已包含該點；正式評分仍須按語意判斷。";
        } else {
            const checked = current.checks.size;
            feedback.classList.add(checked === layer.checklist.length ? "is-success" : "is-warning");
            feedback.textContent = `自評已涵蓋 ${checked} / ${layer.checklist.length} 個答案點。請逐句對照，不要只比較字眼。`;
        }
        actions.append(reveal, feedback);
        container.append(actions);

        if (current.revealed) {
            const model = element("div", "answer-model");
            model.append(element("strong", "", "原創參考答案："), document.createTextNode(layer.model));
            container.append(model);
        }
        const route = element("div", "answer-action-row");
        const routeLink = element("a", "answer-route", "重溫相關課題 →");
        routeLink.href = layer.route;
        route.append(routeLink);
        container.append(route);
    }

    function renderPractice() {
        const pack = selectedSet();
        if (!pack) return;
        ensureState(pack.id);

        const article = element("article", "answer-practice");
        const head = element("header", "answer-practice-head");
        const title = element("div");
        title.append(element("small", "sys-kicker", pack.paperStyle), element("h3", "", pack.label), element("p", "", "三個層級共用同一能力焦點，但使用的情境及答案要求逐步提高。"));
        const meta = element("div", "answer-practice-meta");
        meta.append(element("span", "", `建議 ${pack.minutes} 分鐘`), element("span", "", pack.topicId.toUpperCase()));
        head.append(title, meta);
        article.append(head);

        const caseGrid = element("div", "answer-case-grid");
        caseGrid.append(renderStimulus(pack.visual));
        const caseCopy = element("div", "answer-case-copy");
        caseCopy.append(element("small", "", "原創情境"), element("h4", "", pack.visual.title), element("p", "", pack.scenario));
        caseGrid.append(caseCopy);
        article.append(caseGrid);

        const layerTabs = element("div", "answer-layer-tabs");
        layerTabs.setAttribute("role", "tablist");
        const layers = [
            { id: "foundation", number: "1", label: "基礎診斷" },
            { id: "exam", number: "2", label: "應試改寫" },
            { id: "challenge", number: "3", label: "高階整合" }
        ];
        layers.forEach(layer => {
            const button = element("button");
            button.type = "button";
            button.role = "tab";
            button.setAttribute("aria-selected", String(state.layer === layer.id));
            button.append(element("b", "", layer.number), element("span", "", layer.label));
            button.addEventListener("click", () => { state.layer = layer.id; renderPractice(); });
            layerTabs.append(button);
        });
        article.append(layerTabs);

        const panel = element("section", "answer-layer-panel");
        panel.setAttribute("role", "tabpanel");
        if (state.layer === "foundation") renderFoundation(pack, panel);
        if (state.layer === "exam") renderExam(pack, panel);
        if (state.layer === "challenge") renderChallenge(pack, panel);
        article.append(panel);
        practicePanel.replaceChildren(article);
    }

    renderOverview();
    renderSetTabs();
    renderPractice();
})();
