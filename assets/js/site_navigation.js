(function initialiseSharedNavigation() {
    "use strict";

    const platform = window.HKDSE_ICT;
    if (!platform) return;

    const currentItem = platform.getItemByPath(window.location.pathname);
    if (currentItem) {
        document.body.dataset.contentId = currentItem.id;
        document.body.dataset.contentType = currentItem.type;
        document.body.dataset.syllabusRef = currentItem.syllabusRef;
    }

    // 保留各課頁原有的導覽設計，只在缺少首頁連結的獨立頁面補上共用入口。
    const existingHomeLink = document.querySelector('a[href="index.html"], a[href="./"], a[href="/"]');
    if (existingHomeLink) return;

    const homeLink = document.createElement("a");
    homeLink.href = "index.html";
    homeLink.textContent = "← 返回課程目錄";
    homeLink.setAttribute("aria-label", "返回 ICT 學習資源網課程目錄");
    Object.assign(homeLink.style, {
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: "9999",
        padding: "0.65rem 0.9rem",
        borderRadius: "9999px",
        background: "#312e81",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.875rem",
        fontWeight: "700",
        textDecoration: "none",
        boxShadow: "0 8px 24px rgb(15 23 42 / 0.25)"
    });
    document.body.appendChild(homeLink);
})();
