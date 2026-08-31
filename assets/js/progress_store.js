(function initialiseProgressStore() {
    "use strict";

    const storageKey = "hkdse-ict-progress-v1";
    const schemaVersion = 1;
    const maxEvents = 2000;
    const maxMockAttempts = 50;
    const legacyKeys = [
        "hkdse-ict-study-records-v1",
        "hkdse-ict-layered-learning-v1",
        "hkdse-ict-zero-start-v1",
        "hkdse-ict-lesson-games-v1",
        "hkdse-ict-sba-progress-v1"
    ];

    const isoNow = () => new Date().toISOString();
    const makeId = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const freshState = () => ({
        schemaVersion,
        events: [],
        visits: {},
        focus: {},
        mockAttempts: [],
        updatedAt: isoNow()
    });
    const plainObject = value => value && typeof value === "object" && !Array.isArray(value);
    const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const safeText = (value, length = 160) => String(value ?? "").slice(0, length);
    const scoredPracticeTypes = new Set(["question-attempt", "answer-lab-attempt", "quick-check"]);
    const safeParse = (value, fallback) => {
        try {
            const parsed = JSON.parse(value);
            return parsed ?? fallback;
        } catch (error) {
            return fallback;
        }
    };
    const dispatchChange = () => {
        if (typeof window.CustomEvent === "function") {
            window.dispatchEvent(new CustomEvent("hkdse-progress-change"));
        }
    };
    const normaliseState = value => {
        const state = plainObject(value) ? value : freshState();
        return {
            schemaVersion,
            events: Array.isArray(state.events) ? state.events.slice(-maxEvents) : [],
            visits: plainObject(state.visits) ? state.visits : {},
            focus: plainObject(state.focus) ? state.focus : {},
            mockAttempts: Array.isArray(state.mockAttempts) ? state.mockAttempts.slice(-maxMockAttempts) : [],
            updatedAt: safeText(state.updatedAt || isoNow(), 40)
        };
    };
    function read() {
        try {
            return normaliseState(safeParse(window.localStorage.getItem(storageKey), freshState()));
        } catch (error) {
            return freshState();
        }
    }
    function write(nextState, notify = true) {
        const state = normaliseState(nextState);
        state.updatedAt = isoNow();
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(state));
            if (notify) dispatchChange();
            return state;
        } catch (error) {
            return state;
        }
    }
    function recordEvent(type, payload = {}) {
        const state = read();
        const event = {
            id: makeId("event"),
            type: safeText(type, 50),
            topicId: safeText(payload.topicId, 80),
            source: safeText(payload.source || "site", 60),
            score: Math.max(0, safeNumber(payload.score)),
            maxScore: Math.max(0, safeNumber(payload.maxScore)),
            difficulty: safeText(payload.difficulty, 30),
            hintUsed: Boolean(payload.hintUsed),
            metadata: plainObject(payload.metadata) ? payload.metadata : {},
            createdAt: safeText(payload.createdAt || isoNow(), 40)
        };
        state.events.push(event);
        state.events = state.events.slice(-maxEvents);
        write(state);
        return event;
    }
    function recordVisit(topicId) {
        if (!topicId) return null;
        const state = read();
        const current = plainObject(state.visits[topicId]) ? state.visits[topicId] : {};
        const visit = {
            count: Math.max(0, safeNumber(current.count)) + 1,
            firstVisitedAt: current.firstVisitedAt || isoNow(),
            lastVisitedAt: isoNow()
        };
        state.visits[topicId] = visit;
        write(state);
        return visit;
    }
    function recordQuestionAttempt(question, response, awarded, meta = {}) {
        if (!question?.id) return null;
        const maxScore = Math.max(0, safeNumber(question.marks));
        return recordEvent("question-attempt", {
            topicId: question.topicId,
            source: meta.source || "practice",
            score: Math.max(0, Math.min(safeNumber(awarded), maxScore)),
            maxScore,
            difficulty: question.difficulty,
            hintUsed: meta.hintUsed,
            metadata: {
                questionId: safeText(question.id, 100),
                questionType: safeText(question.type, 30),
                answered: Boolean(String(response ?? "").trim()),
                section: safeText(meta.section, 20)
            }
        });
    }
    function recordMockAttempt(attempt = {}) {
        const state = read();
        const record = {
            id: makeId("mock"),
            mode: safeText(attempt.mode, 30),
            paperLabel: safeText(attempt.paperLabel, 100),
            score: Math.max(0, safeNumber(attempt.score)),
            maxScore: Math.max(0, safeNumber(attempt.maxScore)),
            percentage: Math.max(0, Math.min(100, safeNumber(attempt.percentage))),
            topicScores: plainObject(attempt.topicScores) ? attempt.topicScores : {},
            unanswered: Math.max(0, safeNumber(attempt.unanswered)),
            timedOut: Boolean(attempt.timedOut),
            completedAt: safeText(attempt.completedAt || isoNow(), 40)
        };
        state.mockAttempts.push(record);
        state.mockAttempts = state.mockAttempts.slice(-maxMockAttempts);
        write(state);
        return record;
    }
    function setFocusState(topicId, focusState = {}) {
        if (!topicId) return null;
        const state = read();
        const current = plainObject(state.focus[topicId]) ? state.focus[topicId] : {};
        const next = {
            ...current,
            step: Math.max(0, Math.min(4, safeNumber(focusState.step, current.step || 0))),
            mode: focusState.mode === "all" ? "all" : "focus",
            updatedAt: isoNow()
        };
        state.focus[topicId] = next;
        write(state);
        return next;
    }
    function getFocusState(topicId) {
        const state = read();
        return plainObject(state.focus[topicId]) ? state.focus[topicId] : { step: 0, mode: "focus" };
    }
    function readLegacy() {
        const output = {};
        legacyKeys.forEach(key => {
            try {
                output[key] = safeParse(window.localStorage.getItem(key), key.includes("study-records") ? [] : {});
            } catch (error) {
                output[key] = key.includes("study-records") ? [] : {};
            }
        });
        return output;
    }
    function topicStats(state = read()) {
        const stats = {};
        state.events.filter(event => scoredPracticeTypes.has(event.type) && safeNumber(event.maxScore) > 0).forEach(event => {
            const topicId = event.topicId || "unknown";
            const topic = stats[topicId] ||= {
                topicId,
                attempts: 0,
                score: 0,
                maxScore: 0,
                correct: 0,
                difficulties: { foundation: 0, standard: 0, advanced: 0 }
            };
            topic.attempts += 1;
            topic.score += safeNumber(event.score);
            topic.maxScore += safeNumber(event.maxScore);
            if (safeNumber(event.score) === safeNumber(event.maxScore) && safeNumber(event.maxScore) > 0) topic.correct += 1;
            if (topic.difficulties[event.difficulty] !== undefined) topic.difficulties[event.difficulty] += 1;
        });
        return Object.values(stats).map(topic => ({
            ...topic,
            percentage: topic.maxScore ? Math.round(topic.score / topic.maxScore * 100) : 0
        }));
    }
    function getSummary() {
        const state = read();
        const legacy = readLegacy();
        const attempts = state.events.filter(event => scoredPracticeTypes.has(event.type) && safeNumber(event.maxScore) > 0);
        const possible = attempts.reduce((sum, event) => sum + safeNumber(event.maxScore), 0);
        const earned = attempts.reduce((sum, event) => sum + safeNumber(event.score), 0);
        const studyRecords = Array.isArray(legacy["hkdse-ict-study-records-v1"])
            ? legacy["hkdse-ict-study-records-v1"]
            : [];
        const dueReviews = studyRecords.filter(record => record?.status !== "mastered" && new Date(record?.dueAt || 0).getTime() <= Date.now()).length;
        const lessonItems = window.HKDSE_ICT?.getItems?.().filter(item => item.type === "lesson") || [];
        const lessonIds = new Set(lessonItems.map(item => item.id));
        const visitedLessons = Object.entries(state.visits).filter(([id]) => lessonIds.size ? lessonIds.has(id) : true);
        const latestVisit = visitedLessons.sort((a, b) => new Date(b[1].lastVisitedAt) - new Date(a[1].lastVisitedAt))[0];
        const topics = topicStats(state).sort((a, b) => a.percentage - b.percentage || b.attempts - a.attempts);
        const layerData = legacy["hkdse-ict-layered-learning-v1"];
        const completedLayers = plainObject(layerData)
            ? Object.values(layerData).reduce((sum, page) => sum + Object.values(page?.levels || {}).filter(level => level?.completed).length, 0)
            : 0;
        return {
            visitedLessons: visitedLessons.length,
            questionAttempts: attempts.length,
            accuracy: possible ? Math.round(earned / possible * 100) : 0,
            dueReviews,
            completedLayers,
            completedGames: state.events.filter(event => event.type === "game-complete").length,
            latestTopicId: latestVisit?.[0] || "",
            weakestTopic: topics[0] || null,
            mockAttempts: state.mockAttempts.length
        };
    }
    function exportData() {
        return {
            format: "hkdse-ict-progress-backup",
            schemaVersion,
            exportedAt: isoNow(),
            progress: read(),
            legacy: readLegacy()
        };
    }
    function importData(value) {
        if (!plainObject(value) || value.format !== "hkdse-ict-progress-backup" || !plainObject(value.progress)) {
            throw new Error("這不是有效的 HKDSE ICT 學習記錄備份。");
        }
        const state = write(value.progress, false);
        if (plainObject(value.legacy)) {
            legacyKeys.forEach(key => {
                if (value.legacy[key] !== undefined) {
                    window.localStorage.setItem(key, JSON.stringify(value.legacy[key]));
                }
            });
        }
        dispatchChange();
        return state;
    }
    function clear() {
        try {
            window.localStorage.removeItem(storageKey);
            dispatchChange();
        } catch (error) {
            // The in-memory page can still continue when storage is unavailable.
        }
    }

    window.HKDSEProgress = {
        storageKey,
        schemaVersion,
        legacyKeys,
        read,
        write,
        recordEvent,
        recordVisit,
        recordQuestionAttempt,
        recordMockAttempt,
        setFocusState,
        getFocusState,
        topicStats,
        getSummary,
        exportData,
        importData,
        clear
    };
})();
