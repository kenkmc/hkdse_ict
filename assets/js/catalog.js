(function initialiseCatalogPage() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const container = document.getElementById("course-container");
    const filterInput = document.getElementById("filterInput");
    const noResults = document.getElementById("no-results");
    const progress = window.HKDSEProgress;
    const progressState = progress?.read();

    if (!platform || !container || !filterInput || !noResults) {
        console.error("課程目錄初始化失敗：缺少中央資料或必要的頁面元素。");
        return;
    }

    document.getElementById("site-name").textContent = platform.config.siteName;
    document.getElementById("site-tagline").textContent = platform.config.tagline;
    document.getElementById("site-search-scope").value = platform.config.searchSite;

    function refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    function createSection(section) {
        const sectionElement = document.createElement("section");
        sectionElement.className = "course-section";
        sectionElement.dataset.sectionId = section.id;

        const header = document.createElement("div");
        header.className = "mb-4 flex items-center justify-between border-b border-gray-200 pb-2";
        header.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="rounded-lg p-2 ${section.color}">
                    <i data-lucide="${section.icon}" class="h-6 w-6"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">${section.sectionTitle}</h2>
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-400">${section.sectionCode}${section.recommendedHours ? ` · 建議 ${section.recommendedHours} 小時 · ${section.selectionNote}` : ""}</p>
                </div>
            </div>
            <span class="text-sm text-slate-400">${section.items.length} 項內容</span>
        `;

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3";

        section.items.forEach(item => {
            const card = document.createElement("a");
            const searchText = [
                section.sectionTitle,
                section.sectionCode,
                item.title,
                item.desc,
                item.syllabusRef,
                ...item.tags
            ].join(" ").toLowerCase();

            card.href = item.file;
            card.className = "card group relative block overflow-hidden rounded-xl border border-gray-200 bg-white p-5 hover:border-indigo-300";
            card.dataset.contentId = item.id;
            card.dataset.searchText = searchText;
            const visit = progressState?.visits?.[item.id];
            card.innerHTML = `
                <div class="absolute left-0 top-0 h-full w-1 bg-gray-200 transition-colors group-hover:bg-indigo-500"></div>
                <div class="mb-2 flex items-start justify-between gap-3">
                    <h3 class="text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600">${item.title}</h3>
                    <span class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">${item.type === "tool" ? "工具" : item.syllabusRef}</span>
                </div>
                <p class="mb-3 text-sm text-slate-500">${item.desc}</p>
                <div class="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                    <span class="rounded bg-gray-50 px-2 py-1 text-xs font-bold ${visit ? "text-indigo-600" : "text-gray-400"}">${visit ? `繼續 · 已瀏覽 ${visit.count} 次` : item.type === "tool" ? "開啟工具" : "開始課題"}</span>
                    <i data-lucide="arrow-right" class="h-4 w-4 text-gray-300 group-hover:text-indigo-500"></i>
                </div>
            `;
            grid.appendChild(card);
        });

        sectionElement.append(header, grid);
        return sectionElement;
    }

    function renderCatalog() {
        const fragment = document.createDocumentFragment();
        platform.sections.forEach(section => fragment.appendChild(createSection(section)));
        container.replaceChildren(fragment);
        refreshIcons();
    }

    function renderHomeProgress() {
        const root = document.getElementById("home-progress");
        if (!root || !progress) return;
        const summary = progress.getSummary();
        const latest = platform.getItemById(summary.latestTopicId);
        const weak = summary.weakestTopic;
        const weakItem = weak ? platform.getItemById(weak.topicId) : null;
        root.innerHTML = `
            <div class="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
                <div class="flex flex-col justify-between gap-4 bg-gradient-to-r from-indigo-950 via-indigo-800 to-cyan-800 px-6 py-5 text-white md:flex-row md:items-center">
                    <div><p class="text-xs font-bold uppercase tracking-widest text-cyan-200">我的學習摘要</p><h2 id="home-progress-title" class="mt-1 text-2xl font-bold">今天由一個清楚的下一步開始</h2></div>
                    <a href="progress.html" class="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-800">查看完整進度 →</a>
                </div>
                <div class="grid gap-0 md:grid-cols-3">
                    <article class="border-b border-slate-100 p-5 md:border-b-0 md:border-r"><span class="text-xs font-bold text-slate-400">繼續學習</span><h3 class="mt-2 font-bold text-slate-800">${latest ? latest.title.replace(/^[ivx]+\.\s*/i, "") : "由第一課開始"}</h3><p class="mt-1 text-xs leading-6 text-slate-500">${latest ? latest.desc : "每課均設零基礎起步和分層課業。"}</p><a class="mt-3 inline-block text-sm font-bold text-indigo-600" href="${latest?.file || "cha.1.html"}">前往 →</a></article>
                    <article class="border-b border-slate-100 p-5 md:border-b-0 md:border-r"><span class="text-xs font-bold text-slate-400">今日重練</span><h3 class="mt-2 font-bold text-slate-800">${summary.dueReviews ? `${summary.dueReviews} 題到期` : "沒有到期錯題"}</h3><p class="mt-1 text-xs leading-6 text-slate-500">${summary.dueReviews ? "先獨立重做，再核對原先遺漏的評分點。" : "可以先做一組基礎題建立檢討紀錄。"}</p><a class="mt-3 inline-block text-sm font-bold text-indigo-600" href="${summary.dueReviews ? "mistakes.html" : "practice.html?difficulty=foundation"}">${summary.dueReviews ? "打開錯題簿" : "做基礎練習"} →</a></article>
                    <article class="p-5"><span class="text-xs font-bold text-slate-400">目前練習證據</span><h3 class="mt-2 font-bold text-slate-800">${summary.questionAttempts ? `${summary.questionAttempts} 次作答 · ${summary.accuracy}%` : "尚未有足夠資料"}</h3><p class="mt-1 text-xs leading-6 text-slate-500">${weakItem ? `較弱：${weakItem.title.replace(/^[ivx]+\.\s*/i, "")}（${weak.percentage}%）` : "完成數題後會顯示較弱課題；百分比不是公開試等級預測。"}</p><a class="mt-3 inline-block text-sm font-bold text-indigo-600" href="${weakItem?.file || "progress.html"}">${weakItem ? "重溫較弱課題" : "了解進度記錄"} →</a></article>
                </div>
            </div>
        `;
    }

    function filterCatalog(query) {
        const normalisedQuery = query.toLowerCase().trim();
        let visibleCount = 0;

        container.querySelectorAll(".course-section").forEach(section => {
            let sectionVisibleCount = 0;
            section.querySelectorAll(".card").forEach(card => {
                const isVisible = card.dataset.searchText.includes(normalisedQuery);
                card.classList.toggle("hidden", !isVisible);
                if (isVisible) sectionVisibleCount += 1;
            });
            section.classList.toggle("hidden", sectionVisibleCount === 0);
            visibleCount += sectionVisibleCount;
        });

        noResults.classList.toggle("hidden", visibleCount !== 0);
    }

    renderCatalog();
    renderHomeProgress();
    filterInput.addEventListener("input", event => filterCatalog(event.target.value));
})();
