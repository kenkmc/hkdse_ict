(function initialisePlatformShell() {
    "use strict";

    const platform = window.HKDSE_ICT;
    if (!platform || document.querySelector(".platform-shell-nav")) return;

    if (!document.querySelector('link[data-viewport-fixes]')) {
        const viewportStyle = document.createElement("link");
        viewportStyle.rel = "stylesheet";
        viewportStyle.href = "assets/css/viewport-fixes.css?v=1";
        viewportStyle.dataset.viewportFixes = "true";
        document.head.append(viewportStyle);
    }

    const currentItem = platform.getItemByPath(window.location.pathname);
    const currentSection = currentItem
        ? platform.sections.find(section => section.id === currentItem.sectionId)
        : null;

    document.body.classList.add("platform-page");

    if (currentItem) {
        document.body.dataset.contentId = currentItem.id;
        document.body.dataset.contentType = currentItem.type;
        document.body.dataset.syllabusRef = currentItem.syllabusRef;
        document.title = `${currentItem.title.replace(/^[ivx]+\.\s*/i, "")} | ${platform.config.siteName}`;
        window.HKDSEProgress?.recordVisit(currentItem.id);
    }

    const bodyStyle = window.getComputedStyle(document.body);
    document.body.style.setProperty("--platform-body-padding-left", bodyStyle.paddingLeft);
    document.body.style.setProperty("--platform-body-padding-right", bodyStyle.paddingRight);

    const nav = document.createElement("nav");
    nav.className = "platform-shell-nav";
    nav.setAttribute("aria-label", "全站導覽");

    const practiceAction = currentItem?.id === "tool-dse-practice"
        ? ""
        : '<a class="platform-action platform-action-primary" href="practice.html">DSE 練習</a>';

    nav.innerHTML = `
        <a class="platform-brand" href="index.html" aria-label="返回 ICT 學習資源網首頁">
            <span class="platform-brand-mark" aria-hidden="true">ICT</span>
            <span class="platform-brand-copy">
                <strong>${platform.config.siteName}</strong>
                <span>HKDSE Interactive Learning</span>
            </span>
        </a>
        <div class="platform-context">
            <small>${currentSection?.sectionTitle || platform.config.tagline}</small>
            <strong>${currentItem?.title || "課程與工具目錄"}</strong>
        </div>
        <div class="platform-actions">
            ${currentItem?.id === "tool-my-learning" ? "" : '<a class="platform-action" href="progress.html">我的學習</a>'}
            ${practiceAction}
            <button class="platform-action platform-action-random" type="button" data-platform-random>隨機學習</button>
            <a class="platform-action" href="index.html">課程目錄</a>
        </div>
    `;

    nav.querySelector("[data-platform-random]")?.addEventListener("click", platform.randomStudy);
    document.body.prepend(nav);

    let footer = document.querySelector("body > footer");
    const shouldAppendFooter = !footer;
    if (!footer) footer = document.createElement("footer");
    footer.className = "platform-footer";
    footer.innerHTML = `
        <p>原創 HKDSE ICT 學習資源；並非官方網站。</p>
        <p class="platform-footer-links">
            課程依據：<a href="${platform.config.curriculumUrl}" target="_blank" rel="noopener">2021 課程及評估指引</a>
        </p>
    `;
    if (shouldAppendFooter) document.body.appendChild(footer);
})();
