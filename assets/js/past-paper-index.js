(function initialiseTopicFocus() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const learning = window.HKDSE_ICT_LEARNING;
    const practice = window.HKDSE_ICT_EXAM_PRACTICE;
    const commandContainer = document.querySelector("[data-command-words]");
    const groupContainer = document.querySelector("[data-topic-groups]");
    if (!platform || !learning?.pages || !practice || !commandContainer || !groupContainer) return;

    const element = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    commandContainer.replaceChildren(...practice.commandWords.map(command => {
        const article = element("article", "past-command-card");
        article.append(element("h3", "", command.verb), element("p", "", command.demand));
        return article;
    }));

    const lessonSections = platform.sections.filter(section => section.kind === "course");
    let topicCount = 0;
    const groups = lessonSections.map(section => {
        const group = element("section", "past-topic-group");
        const header = element("header", "past-topic-group-head");
        header.append(element("span", "", section.sectionCode), element("h3", "", section.sectionTitle));
        group.append(header);

        const cards = element("div", "past-topic-card-grid");
        section.items.forEach(item => {
            const focus = learning.pages[item.id]?.dseFocus;
            if (!focus) return;
            topicCount += 1;
            const article = element("article", "past-topic-card");
            const heading = element("div", "past-topic-card-heading");
            const title = element("div");
            title.append(element("small", "", item.syllabusRef), element("h4", "", item.title.replace(/^[ivx]+\.\s*/i, "")));
            heading.append(title, element("span", "", focus.questionForms[0]));
            article.append(heading);

            const terms = element("div", "past-topic-terms");
            focus.keyTerms.forEach(term => terms.append(element("span", "", term)));
            article.append(terms);

            const columns = element("div", "past-topic-columns");
            const know = element("div", "past-topic-list");
            know.append(element("b", "", "核心重點"));
            const knowList = document.createElement("ul");
            focus.mustKnow.forEach(point => knowList.append(element("li", "", point)));
            know.append(knowList);
            const losses = element("div", "past-topic-list past-topic-losses");
            losses.append(element("b", "", "常見失分"));
            const lossList = document.createElement("ul");
            focus.lossPoints.forEach(point => lossList.append(element("li", "", point)));
            losses.append(lossList);
            columns.append(know, losses);
            article.append(columns);

            const pattern = element("p", "past-answer-pattern");
            pattern.append(element("strong", "", "建議答題結構："), document.createTextNode(focus.answerPattern));
            article.append(pattern);

            const forms = element("div", "past-question-forms");
            focus.questionForms.forEach(form => forms.append(element("span", "", form)));
            article.append(forms);

            const actions = element("div", "past-topic-actions");
            const lesson = element("a", "", "重溫課題");
            lesson.href = item.file;
            const questions = element("a", "", "做原創題");
            questions.href = `practice.html?topic=${encodeURIComponent(item.id)}`;
            actions.append(lesson, questions);
            article.append(actions);
            cards.append(article);
        });
        group.append(cards);
        return group;
    });

    groupContainer.replaceChildren(...groups);
    document.querySelector("[data-topic-count]").textContent = `${topicCount} 個課題`;
    document.querySelector("[data-topic-total]").textContent = String(topicCount);
})();
