(function initialiseCatalogPage() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const container = document.getElementById("course-container");
    const filterInput = document.getElementById("filterInput");
    const noResults = document.getElementById("no-results");

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
            card.innerHTML = `
                <div class="absolute left-0 top-0 h-full w-1 bg-gray-200 transition-colors group-hover:bg-indigo-500"></div>
                <div class="mb-2 flex items-start justify-between gap-3">
                    <h3 class="text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600">${item.title}</h3>
                    <span class="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">${item.type === "tool" ? "工具" : item.syllabusRef}</span>
                </div>
                <p class="mb-3 text-sm text-slate-500">${item.desc}</p>
                <div class="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                    <span class="rounded bg-gray-50 px-2 py-1 font-mono text-xs text-gray-400">${item.file}</span>
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
    filterInput.addEventListener("input", event => filterCatalog(event.target.value));
})();
