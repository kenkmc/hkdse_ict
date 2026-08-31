(function initialiseProgressDashboard() {
    "use strict";

    const platform = window.HKDSE_ICT;
    const progress = window.HKDSEProgress;
    if (!platform || !progress) return;
    const byId = id => document.getElementById(id);
    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
    const cleanTitle = title => String(title || "").replace(/^[ivx]+\.\s*/i, "");
    const dateLabel = value => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("zh-HK", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };
    const itemById = id => platform.getItemById(id);

    function renderSummary() {
        const state = progress.read();
        const summary = progress.getSummary();
        byId("progress-lessons").textContent = summary.visitedLessons;
        byId("progress-attempts").textContent = summary.questionAttempts;
        byId("progress-accuracy").textContent = summary.questionAttempts ? `${summary.accuracy}%` : "—";
        byId("progress-due").textContent = summary.dueReviews;

        const latest = itemById(summary.latestTopicId);
        byId("progress-continue").innerHTML = latest ? `
            <h3>${escapeHTML(cleanTitle(latest.title))}</h3>
            <p>${escapeHTML(latest.desc)}</p>
            <a class="progress-action" href="${escapeHTML(latest.file)}">繼續本課 →</a>
        ` : `<p>尚未有課題瀏覽紀錄。可先由一個必修課題的「零基礎起步」開始。</p><a class="progress-action" href="cha.1.html">開始第一課 →</a>`;

        byId("progress-review").innerHTML = summary.dueReviews ? `
            <h3>${summary.dueReviews} 題今天到期</h3>
            <p>先重做再看答案，並留意原先遺漏的評分點。</p>
            <a class="progress-action" href="mistakes.html">打開錯題簿 →</a>
        ` : `<h3>今天沒有到期錯題</h3><p>可用 10–15 分鐘完成一組基礎練習，建立下一次檢討資料。</p><a class="progress-action" href="practice.html?difficulty=foundation">做基礎練習 →</a>`;

        const weak = summary.weakestTopic;
        const weakItem = weak ? itemById(weak.topicId) : null;
        byId("progress-weak").innerHTML = weak && weakItem ? `
            <h3>${escapeHTML(cleanTitle(weakItem.title))}</h3>
            <p>已作答 ${weak.attempts} 次，累積得分率 ${weak.percentage}%。先重溫概念，再做另一題核對。</p>
            <a class="progress-action" href="${escapeHTML(weakItem.file)}">重溫課題 →</a>
        ` : `<h3>需要更多作答證據</h3><p>完成至少數題後，這裏會按本站作答紀錄指出較弱課題。</p><a class="progress-action" href="practice.html">前往題庫 →</a>`;

        renderTopics(state);
        renderMocks(state.mockAttempts);
    }

    function renderTopics(state) {
        const stats = new Map(progress.topicStats(state).map(topic => [topic.topicId, topic]));
        const lessons = platform.getItems().filter(item => item.type === "lesson");
        lessons.sort((a, b) => {
            const left = stats.get(a.id), right = stats.get(b.id);
            if (left && right) return left.percentage - right.percentage || right.attempts - left.attempts;
            if (left) return -1;
            if (right) return 1;
            return a.id.localeCompare(b.id);
        });
        byId("progress-topic-grid").innerHTML = lessons.map(item => {
            const stat = stats.get(item.id);
            const percentage = stat?.percentage || 0;
            const status = !stat ? "未開始" : percentage >= 80 ? "較穩固" : percentage >= 50 ? "鞏固中" : "需重溫";
            return `
                <a class="progress-topic-card${stat ? "" : " is-unstarted"}" href="${escapeHTML(item.file)}">
                    <div class="progress-topic-head"><strong>${escapeHTML(cleanTitle(item.title))}</strong><span>${status}</span></div>
                    <div class="progress-topic-track" aria-label="得分率 ${percentage}%"><i style="width:${percentage}%"></i></div>
                    <div class="progress-topic-meta"><span>${stat ? `${stat.attempts} 次作答` : "尚未有作答"}</span><span>${stat ? `${percentage}%` : item.syllabusRef}</span></div>
                </a>
            `;
        }).join("");
    }

    function renderMocks(attempts) {
        const target = byId("progress-mock-history");
        if (!attempts.length) {
            target.innerHTML = `<div class="progress-empty">尚未有模擬考紀錄。完成並交卷後，分數及課題表現會在這裏保留。</div>`;
            return;
        }
        target.innerHTML = `
            <table>
                <thead><tr><th>完成時間</th><th>試卷</th><th>得分</th><th>得分率</th><th>狀態</th></tr></thead>
                <tbody>${[...attempts].reverse().slice(0, 10).map(attempt => `
                    <tr><td>${escapeHTML(dateLabel(attempt.completedAt))}</td><td>${escapeHTML(attempt.paperLabel || attempt.mode)}</td><td>${attempt.score} / ${attempt.maxScore}</td><td><strong>${attempt.percentage}%</strong></td><td>${attempt.timedOut ? "到時自動交卷" : "已交卷"}</td></tr>
                `).join("")}</tbody>
            </table>
        `;
    }

    const status = (message, isError = false) => {
        const output = byId("progress-data-status");
        output.textContent = message;
        output.style.color = isError ? "#be123c" : "#047857";
    };
    byId("progress-export").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(progress.exportData(), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `hkdse-ict-progress-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        status("備份已下載。請把檔案存放在安全位置。");
    });
    byId("progress-import").addEventListener("change", async event => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;
        try {
            if (file.size > 5 * 1024 * 1024) throw new Error("備份檔案過大。");
            progress.importData(JSON.parse(await file.text()));
            status("備份已匯入，頁面統計已更新。");
            renderSummary();
        } catch (error) {
            status(error.message || "未能匯入備份。", true);
        } finally {
            event.currentTarget.value = "";
        }
    });
    byId("progress-clear").addEventListener("click", () => {
        if (!window.confirm("確定清除這個瀏覽器內所有本站學習紀錄？此操作不能復原，建議先匯出備份。")) return;
        progress.clear();
        progress.legacyKeys.forEach(key => window.localStorage.removeItem(key));
        status("所有本機學習紀錄已清除。");
        renderSummary();
    });
    window.addEventListener("hkdse-progress-change", renderSummary);
    renderSummary();
})();
