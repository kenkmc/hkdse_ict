(function initialiseSchoolSync() {
    "use strict";

    const progress = window.HKDSEProgress;
    const config = window.HKDSE_SCHOOL_SYNC_CONFIG || {};
    if (!progress || !document?.body) return;

    const syncStateKey = "hkdse-ict-school-sync-state-v1";
    const connectionTokenKey = "hkdse-ict-school-sync-token-v1";
    const schoolProfileKey = "hkdse-ict-school-profile-v1";
    const channelName = "hkdse-ict-school-sync";
    const configured = Boolean(config.enabled)
        && /^https:\/\/script\.google\.com\/(?:a\/macros\/[a-z0-9.-]+\/|macros\/)s\/[A-Za-z0-9_-]+\/exec$/.test(String(config.webAppUrl || ""));
    let internalNavigation = false;
    let channel = null;

    const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
    const readJSON = (value, fallback) => {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" ? parsed : fallback;
        } catch (error) {
            return fallback;
        }
    };
    const readSyncState = () => readJSON(window.localStorage.getItem(syncStateKey), {});
    const writeSyncState = state => {
        window.localStorage.setItem(syncStateKey, JSON.stringify(state));
        return state;
    };
    const getConnectionToken = () => window.sessionStorage.getItem(connectionTokenKey) || "";
    const validToken = value => /^[A-Za-z0-9_-]{32,160}$/.test(String(value || ""));
    const makeNonce = () => window.crypto?.randomUUID?.().replace(/-/g, "")
        || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const fingerprint = value => {
        const text = JSON.stringify(value);
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return `v1-${(hash >>> 0).toString(16).padStart(8, "0")}-${text.length}`;
    };
    const readSchoolProfile = () => readJSON(window.sessionStorage.getItem(schoolProfileKey), null);
    const writeSchoolProfile = value => {
        if (!value || typeof value !== "object") return false;
        window.sessionStorage.setItem(schoolProfileKey, JSON.stringify(value));
        return true;
    };
    const decodeSchoolData = value => {
        try {
            const base64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
            const bytes = Uint8Array.from(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")), character => character.charCodeAt(0));
            return JSON.parse(new TextDecoder().decode(bytes));
        } catch (error) {
            return null;
        }
    };
    const currentSnapshot = () => {
        const snapshot = progress.getSyncSnapshot();
        snapshot.assignmentProgress = evaluateAssignments(snapshot);
        return snapshot;
    };
    const currentFingerprint = () => fingerprint(currentSnapshot());
    const hasLearningEvidence = snapshot => {
        const summary = snapshot?.summary || {};
        return [
            summary.visitedLessons,
            summary.questionAttempts,
            summary.completedLayers,
            summary.completedGames,
            summary.mockAttempts,
            snapshot.pageActivity?.length,
            snapshot.exerciseAttempts?.length
        ].some(value => Number(value) > 0);
    };
    const isPending = () => {
        if (!configured) return false;
        const snapshot = currentSnapshot();
        return hasLearningEvidence(snapshot)
            && readSyncState().lastSyncedFingerprint !== fingerprint(snapshot);
    };
    const formatDate = value => {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "尚未同步"
            : date.toLocaleString("zh-HK", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    function ensureStyles() {
        if (document.querySelector('link[data-school-sync-style]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "assets/css/school-sync.css?v=1";
        link.dataset.schoolSyncStyle = "true";
        document.head.append(link);
    }

    function setConnectionToken(token, schoolData, notify = true) {
        if (!validToken(token)) return false;
        const state = readSyncState();
        const studentId = schoolData?.student?.studentId;
        if (!studentId || (state.linkedStudentId && state.linkedStudentId !== studentId)) {
            if (notify) window.alert("這個瀏覽器保留了另一位學生的學習紀錄。請先匯出備份，再在『我的學習』清除本機紀錄，或使用獨立的瀏覽器設定檔，然後重新連接。未有傳送任何資料。");
            return false;
        }
        writeSyncState({ ...state, linkedStudentId: studentId });
        window.sessionStorage.setItem(connectionTokenKey, token);
        if (schoolData) writeSchoolProfile(schoolData);
        progress.ensureSession?.();
        if (notify) channel?.postMessage({ type: "connection-token", token, schoolData: schoolData || readSchoolProfile() });
        return true;
    }

    function consumeConnectionToken() {
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const token = params.get("school-connect") || "";
        if (!token) return;
        const schoolData = decodeSchoolData(params.get("school-data"));
        setConnectionToken(token, schoolData);
        const cleanUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState({}, "", cleanUrl);
    }

    function evaluateRequirement(item, snapshot) {
        const pages = Array.isArray(snapshot.pageActivity) ? snapshot.pageActivity : [];
        const attempts = Array.isArray(snapshot.exerciseAttempts) ? snapshot.exerciseAttempts : [];
        const topics = Array.isArray(snapshot.topics) ? snapshot.topics : [];
        const resourceId = String(item.resourceId || "");
        const pageRows = pages.filter(page => !resourceId || page.pageId === resourceId);
        const topic = topics.find(row => row.topicId === resourceId) || {};
        const target = Math.max(0, Number(item.targetValue || 0));
        const minimum = Math.max(0, Number(item.minimumPercentage || target || 0));
        let actual = 0;
        let complete = false;
        switch (item.requirementType) {
        case "VISIT_PAGE":
            actual = pageRows.reduce((sum, page) => sum + Number(page.viewCount || 0), 0);
            complete = actual >= Math.max(1, target);
            break;
        case "ACTIVE_MINUTES":
            actual = Math.round(pageRows.reduce((sum, page) => sum + Number(page.activeSeconds || 0), 0) / 60);
            complete = actual >= Math.max(1, target);
            break;
        case "PRACTICE_ATTEMPTS":
            actual = Number(topic.attempts || 0);
            complete = actual >= Math.max(1, target);
            break;
        case "MIN_ACCURACY":
            actual = Number(topic.percentage || 0);
            complete = Number(topic.attempts || 0) > 0 && actual >= minimum;
            break;
        case "COMPLETE_LAYER":
            actual = attempts.filter(attempt => attempt.activityType === "lesson-layer-complete" && (!resourceId || attempt.topicId === resourceId)).length;
            complete = actual >= Math.max(1, target);
            break;
        case "COMPLETE_GAME":
            actual = attempts.filter(attempt => attempt.activityType === "game-complete" && (!resourceId || attempt.topicId === resourceId)).length;
            complete = actual >= Math.max(1, target);
            break;
        case "MOCK_ATTEMPT":
            actual = (snapshot.recentMocks || []).filter(mock => !resourceId || mock.mode === resourceId).length;
            complete = actual >= Math.max(1, target);
            break;
        default:
            complete = false;
        }
        return { ...item, actual, complete };
    }

    function evaluateAssignments(snapshot) {
        const profile = readSchoolProfile();
        const assignments = Array.isArray(profile?.assignments) ? profile.assignments : [];
        const state = readSyncState();
        const savedTimes = state.assignmentCompletionTimes || {};
        const completionTimes = {};
        const results = assignments.map(assignment => {
            const items = (assignment.items || []).map(item => evaluateRequirement(item, snapshot));
            const assessed = items.some(item => item.required) ? items.filter(item => item.required) : items;
            const completedItems = assessed.filter(item => item.complete).length;
            const totalItems = assessed.length;
            const percentage = totalItems ? Math.round(completedItems / totalItems * 100) : 0;
            const completionKey = `${profile.student?.studentId || ""}|${assignment.assignmentId}`;
            if (percentage >= 100) {
                completionTimes[completionKey] = savedTimes[completionKey] || snapshot.lastActivityAt || new Date().toISOString();
            }
            return {
                assignmentId: assignment.assignmentId,
                completedItems,
                totalItems,
                percentage,
                status: percentage >= 100 ? "COMPLETED" : completedItems ? "IN_PROGRESS" : "NOT_STARTED",
                completedAt: completionTimes[completionKey] || "",
                items
            };
        });
        if (JSON.stringify(completionTimes) !== JSON.stringify(savedTimes)) {
            writeSyncState({ ...state, assignmentCompletionTimes: completionTimes });
        }
        return results;
    }

    function resourceLabel(resourceId) {
        return window.HKDSE_ICT?.getItemById?.(resourceId)?.title?.replace(/^[ivx]+\.\s*/i, "") || resourceId || "指定內容";
    }

    function requirementText(item) {
        const title = resourceLabel(item.resourceId);
        const target = Math.max(1, Number(item.targetValue || 0));
        const labels = {
            VISIT_PAGE: `瀏覽「${title}」`,
            ACTIVE_MINUTES: `在「${title}」有效學習 ${target} 分鐘`,
            PRACTICE_ATTEMPTS: `完成「${title}」練習 ${target} 次`,
            MIN_ACCURACY: `「${title}」練習得分率達 ${Math.max(0, Number(item.minimumPercentage || item.targetValue || 0))}%`,
            COMPLETE_LAYER: `完成「${title}」分層課業 ${target} 項`,
            COMPLETE_GAME: `完成「${title}」互動遊戲 ${target} 次`,
            MOCK_ATTEMPT: `完成模擬考 ${target} 次`
        };
        return labels[item.requirementType] || title;
    }

    function renderAssignments() {
        const summary = document.getElementById("school-student-summary");
        const list = document.getElementById("school-assignment-list");
        if (!summary || !list) return;
        const profile = readSchoolProfile();
        if (!profile?.student) {
            summary.hidden = true;
            list.innerHTML = '<p class="school-assignment-empty">連接校園帳戶後，這裡會顯示老師指派的學習內容。</p>';
            return;
        }
        summary.hidden = false;
        const student = profile.student;
        const groupNames = (profile.groups || []).map(group => escapeHTML(group.name)).join("、");
        summary.innerHTML = `<strong>${escapeHTML(student.chineseName || student.englishName || "學生")}</strong><span>${escapeHTML(student.className)} ${escapeHTML(student.classNo)}${groupNames ? ` · ${groupNames}` : ""}</span>`;
        const evaluations = evaluateAssignments(progress.getSyncSnapshot());
        if (!evaluations.length) {
            list.innerHTML = '<p class="school-assignment-empty">目前沒有已發布的指定課業。</p>';
            return;
        }
        const assignments = profile.assignments || [];
        list.innerHTML = evaluations.map(result => {
            const assignment = assignments.find(item => item.assignmentId === result.assignmentId) || {};
            const due = assignment.dueAt ? new Date(assignment.dueAt).toLocaleString("zh-HK", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "沒有期限";
            return `<article class="school-assignment-card ${result.status === "COMPLETED" ? "is-complete" : ""}">
                <div class="school-assignment-head"><div><h3>${escapeHTML(assignment.title || result.assignmentId)}</h3><p>${escapeHTML(assignment.instructions || "")}</p></div><strong>${result.percentage}%</strong></div>
                <div class="school-assignment-progress"><i style="width:${result.percentage}%"></i></div>
                <ul>${result.items.map(item => `<li class="${item.complete ? "is-complete" : ""}"><span>${item.complete ? "✓" : "○"}</span>${item.directUrl ? `<a href="${escapeHTML(item.directUrl)}">${escapeHTML(requirementText(item))}</a>` : escapeHTML(requirementText(item))}</li>`).join("")}</ul>
                <small>截止：${escapeHTML(due)}</small>
            </article>`;
        }).join("");
    }

    function consumeSyncReceipt() {
        const params = new URLSearchParams(window.location.search);
        if (params.get("sync") !== "success") return;
        const receipt = params.get("receipt") || "";
        const state = readSyncState();
        if (receipt && receipt === state.pendingNonce && state.pendingFingerprint) {
            writeSyncState({
                ...state,
                lastSyncedAt: new Date().toISOString(),
                lastSyncedFingerprint: state.pendingFingerprint,
                pendingNonce: "",
                pendingFingerprint: "",
                lastError: ""
            });
        }
        params.delete("sync");
        params.delete("receipt");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }

    function connectLink(label = "連接學校") {
        if (!configured) return `<span class="school-sync-disabled">尚待校方設定</span>`;
        return `<a class="school-sync-button" href="${escapeHTML(config.webAppUrl)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>`;
    }

    function ensureReminder() {
        let reminder = document.querySelector("[data-school-sync-reminder]");
        if (!reminder) {
            reminder = document.createElement("aside");
            reminder.className = "school-sync-reminder";
            reminder.dataset.schoolSyncReminder = "true";
            reminder.setAttribute("aria-live", "polite");
            document.body.append(reminder);
        }
        return reminder;
    }

    function renderReminder() {
        const reminder = ensureReminder();
        const pending = isPending();
        if (!configured || !pending) {
            reminder.hidden = true;
            reminder.innerHTML = "";
            return;
        }
        const connected = Boolean(getConnectionToken());
        reminder.hidden = false;
        reminder.innerHTML = `
            <div><strong>☁️ 有尚未同步的學習進度</strong><span>${connected ? "前往「我的學習」傳送給老師。" : "先用校園 Google 帳戶連接學校。"}</span></div>
            ${connected
                ? '<a class="school-sync-button" href="progress.html#school-sync-panel">前往同步</a>'
                : connectLink("連接學校")}
            <button type="button" data-school-sync-dismiss aria-label="暫時隱藏同步提示">稍後</button>
        `;
        reminder.querySelector("[data-school-sync-dismiss]")?.addEventListener("click", () => {
            reminder.hidden = true;
        });
    }

    function updateProgressPanel() {
        const panel = document.getElementById("school-sync-panel");
        if (!panel) return;
        const state = readSyncState();
        const connected = Boolean(getConnectionToken());
        const pending = isPending();
        const badge = document.getElementById("school-sync-badge");
        const description = document.getElementById("school-sync-description");
        const connect = document.getElementById("school-sync-connect");
        const form = document.getElementById("school-sync-form");
        const disconnect = document.getElementById("school-sync-disconnect");
        const last = document.getElementById("school-sync-last");
        const heroBadge = document.getElementById("progress-storage-badge");

        if (!configured) {
            badge.textContent = "尚待校方設定";
            badge.className = "school-sync-status is-setup";
            description.textContent = "網站程式已準備好；校方需部署 Apps Script，再在 school_sync_config.js 填入正式網址才會啟用。";
            connect.hidden = true;
            form.hidden = true;
            disconnect.hidden = true;
            last.textContent = "目前所有紀錄仍只保存在這個瀏覽器。";
            if (heroBadge) heroBadge.textContent = "本機保存 · 校園同步待設定";
            renderAssignments();
            return;
        }

        badge.textContent = !connected ? "未連接" : pending ? "尚未同步" : "已同步";
        badge.className = `school-sync-status ${!connected ? "is-disconnected" : pending ? "is-pending" : "is-synced"}`;
        description.textContent = connected
            ? `本次瀏覽器工作階段已連接${config.schoolName || "學校"}；只會在你按下按鈕後傳送摘要。`
            : `先以${config.schoolName || "學校"}的 Google 帳戶登入，取得短期連接碼。`;
        connect.href = config.webAppUrl;
        connect.hidden = connected;
        form.hidden = !connected || !pending;
        form.action = config.webAppUrl;
        disconnect.hidden = !connected;
        last.textContent = state.lastSyncedAt
            ? `上次成功同步：${formatDate(state.lastSyncedAt)}`
            : "尚未有成功同步紀錄。";
        if (heroBadge) heroBadge.textContent = connected
            ? pending ? "已連接 · 尚未同步" : "已連接 · 進度已同步"
            : "本機保存 · 可連接學校";
        renderAssignments();
    }

    function render() {
        renderReminder();
        updateProgressPanel();
    }

    function prepareSubmission(event) {
        const token = getConnectionToken();
        if (!configured || !validToken(token)) {
            event.preventDefault();
            render();
            return;
        }
        const snapshot = currentSnapshot();
        const nonce = makeNonce();
        const pendingFingerprint = fingerprint(snapshot);
        const payload = { schemaVersion: 2, clientNonce: nonce, snapshot };
        document.getElementById("school-sync-payload").value = JSON.stringify(payload);
        document.getElementById("school-sync-token").value = token;
        const state = readSyncState();
        writeSyncState({
            ...state,
            pendingNonce: nonce,
            pendingFingerprint,
            lastAttemptAt: new Date().toISOString()
        });
        const output = document.getElementById("school-sync-output");
        if (output) output.textContent = "正在開啟校方同步頁面；成功後請按『返回學習網站』完成確認。";
    }

    function bindProgressPanel() {
        document.getElementById("school-sync-form")?.addEventListener("submit", prepareSubmission);
        document.getElementById("school-sync-disconnect")?.addEventListener("click", () => {
            window.sessionStorage.removeItem(connectionTokenKey);
            window.sessionStorage.removeItem(schoolProfileKey);
            render();
        });
    }

    function clearConnection() {
        window.sessionStorage.removeItem(connectionTokenKey);
        window.sessionStorage.removeItem(schoolProfileKey);
        window.localStorage.removeItem(syncStateKey);
        render();
    }

    function setupChannel() {
        if (typeof window.BroadcastChannel !== "function") return;
        channel = new BroadcastChannel(channelName);
        channel.addEventListener("message", event => {
            if (event.data?.type === "connection-token" && setConnectionToken(event.data.token, event.data.schoolData, false)) render();
            if (event.data?.type === "clear-connection") clearConnection();
        });
    }

    function trackNavigation() {
        document.addEventListener("click", event => {
            const link = event.target.closest?.("a[href]");
            if (!link) return;
            try {
                const destination = new URL(link.href, window.location.href);
                const current = new URL(window.location.href);
                internalNavigation = !event.defaultPrevented && event.button === 0
                    && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
                    && (!link.target || link.target === "_self") && !link.hasAttribute("download")
                    && destination.origin === current.origin
                    && (destination.pathname !== current.pathname || destination.search !== current.search);
            } catch (error) {
                internalNavigation = false;
            }
        });
        window.addEventListener("pageshow", () => { internalNavigation = false; });
        window.addEventListener("beforeunload", event => {
            if (!isPending() || internalNavigation) return;
            event.preventDefault();
            event.returnValue = "";
        });
    }

    ensureStyles();
    setupChannel();
    consumeConnectionToken();
    consumeSyncReceipt();
    bindProgressPanel();
    trackNavigation();
    window.addEventListener("hkdse-progress-change", render);
    window.addEventListener("hkdse-progress-clear", () => {
        clearConnection();
        channel?.postMessage({ type: "clear-connection" });
    });
    window.addEventListener("storage", event => {
        if (event.key === syncStateKey) render();
    });
    render();

    window.HKDSESchoolSync = Object.freeze({
        configured,
        isPending,
        evaluateAssignments,
        render
    });
})();
