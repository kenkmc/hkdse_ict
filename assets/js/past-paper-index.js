(function initialisePastPaperIndex() {
    "use strict";
    const data = window.HKDSE_ICT_PAST_PAPER_INDEX;
    if (!data) return;

    const filters = {
        year: document.querySelector('[data-index-filter="year"]'),
        topic: document.querySelector('[data-index-filter="topic"]'),
        ask: document.querySelector('[data-index-filter="ask"]')
    };
    const list = document.querySelector("[data-index-list]");
    const empty = document.querySelector("[data-index-empty]");
    const count = document.querySelector("[data-index-count]");

    function addOptions(select, values) {
        [...new Set(values)].sort((a, b) => String(b).localeCompare(String(a), "zh-Hant", { numeric: true })).forEach(value => {
            const option = document.createElement("option");
            option.value = String(value);
            option.textContent = String(value);
            select.appendChild(option);
        });
    }

    addOptions(filters.year, data.entries.map(entry => entry.year));
    addOptions(filters.topic, data.entries.map(entry => entry.topic));
    addOptions(filters.ask, data.entries.map(entry => entry.askType));

    function render() {
        const shown = data.entries.filter(entry =>
            (filters.year.value === "all" || String(entry.year) === filters.year.value) &&
            (filters.topic.value === "all" || entry.topic === filters.topic.value) &&
            (filters.ask.value === "all" || entry.askType === filters.ask.value)
        );
        list.replaceChildren(...shown.map(entry => {
            const article = document.createElement("article");
            article.className = "past-index-card";
            const year = document.createElement("div");
            year.className = "past-index-year";
            year.innerHTML = `<b>${entry.year}</b><span>${entry.paper}</span>`;
            const details = document.createElement("div");
            const title = document.createElement("h3");
            title.textContent = entry.topic;
            const metadata = document.createElement("div");
            metadata.className = "past-index-meta";
            [entry.askType, entry.curriculum].forEach(value => {
                const tag = document.createElement("span");
                tag.textContent = value;
                metadata.appendChild(tag);
            });
            const context = document.createElement("p");
            context.textContent = entry.context;
            details.append(title, metadata, context);
            const link = document.createElement("a");
            link.href = entry.sourceUrl;
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "官方示例 ↗";
            article.append(year, details, link);
            return article;
        }));
        count.textContent = `${shown.length} 項公開示例標記`;
        empty.hidden = shown.length > 0;
    }

    Object.values(filters).forEach(select => select.addEventListener("change", render));
    document.querySelector("[data-index-reset]")?.addEventListener("click", () => {
        Object.values(filters).forEach(select => { select.value = "all"; });
        render();
    });

    const guideContainer = document.querySelector("[data-ask-guides]");
    guideContainer?.replaceChildren(...data.askGuides.map(guide => {
        const article = document.createElement("article");
        article.className = "past-verb-card";
        const title = document.createElement("h3");
        title.textContent = guide.verb;
        const description = document.createElement("p");
        description.textContent = guide.demand;
        const link = document.createElement("a");
        link.href = guide.route;
        link.textContent = "練習這類問法 →";
        article.append(title, description, link);
        return article;
    }));

    const sourceContainer = document.querySelector("[data-source-pages]");
    sourceContainer?.replaceChildren(...data.sourcePages.map(source => {
        const article = document.createElement("article");
        article.className = "past-source-card";
        const details = document.createElement("div");
        const year = document.createElement("b");
        year.textContent = source.year;
        const title = document.createElement("p");
        title.textContent = source.label;
        details.append(year, title);
        const link = document.createElement("a");
        link.href = source.href;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "前往考評局 ↗";
        article.append(details, link);
        return article;
    }));
    render();
})();
