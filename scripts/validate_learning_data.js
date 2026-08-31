const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const browser = { location: { pathname: "/index.html", href: "" }, alert() {} };
const context = { window: browser, console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "course_data.js"), "utf8"), context, { filename: "course_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "question_data.js"), "utf8"), context, { filename: "question_data.js" });
vm.runInContext(fs.readFileSync(path.join(root, "learning_data.js"), "utf8"), context, { filename: "learning_data.js" });

const platform = browser.HKDSE_ICT;
const learning = browser.HKDSE_ICT_LEARNING;
const questions = browser.HKDSE_ICT_QUESTIONS || [];
const errors = [];
let lessonCount = 0;
let lessonVisualCount = 0;
let layeredLessonCount = 0;
let dseFocusCount = 0;
let lessonGameCount = 0;
const expectedGames = new Map([
    ["cha-4", "formula-detective"],
    ["chb-1", "cpu-cycle-race"],
    ["chc-1", "network-builder"],
    ["chc-5", "cyber-defense"],
    ["chd-2", "trace-debugger"],
    ["ea-2", "sql-missions"],
    ["ec-1", "algorithm-arena"]
]);

if (!learning?.pages) {
    errors.push("learning_data.js 沒有公開有效的學習提示資料。");
} else {
    const catalogIds = new Set(platform.getItems().map(item => item.id));
    const catalogById = new Map(platform.getItems().map(item => [item.id, item]));
    const questionById = new Map(questions.map(question => [question.id, question]));
    const learningIds = new Set(Object.keys(learning.pages));

    catalogIds.forEach(id => {
        if (!learningIds.has(id)) errors.push(`目錄項目缺少學習提示：${id}`);
    });
    learningIds.forEach(id => {
        if (!catalogIds.has(id)) errors.push(`學習提示引用不存在的目錄項目：${id}`);
    });

    Object.entries(learning.pages).forEach(([id, page]) => {
        if (!Array.isArray(page.objectives) || page.objectives.length < 2) errors.push(`${id} 至少需要兩個學習目標。`);
        if (!Array.isArray(page.concepts) || page.concepts.length < 3) errors.push(`${id} 至少需要三個概念節點。`);
        if (!Array.isArray(page.misconceptions) || !page.misconceptions.length) errors.push(`${id} 缺少常見誤解。`);
        if (!page.examTip) errors.push(`${id} 缺少 DSE 提示。`);

        if (catalogById.get(id)?.type === "lesson") {
            lessonCount += 1;
            if (!page.scopeNote) errors.push(`${id} 缺少課程界線提示。`);
            if (!page.featuredQuestionId && !page.embeddedExamPractice) {
                errors.push(`${id} 缺少頁內 DSE 題型或嵌入式練習標記。`);
            }
            if (page.featuredQuestionId) {
                const featured = questionById.get(page.featuredQuestionId);
                if (!featured) errors.push(`${id} 引用不存在的精選題目：${page.featuredQuestionId}`);
                if (featured && featured.topicId !== id) errors.push(`${id} 的精選題目屬於其他課題：${featured.topicId}`);
            }

            const visual = page.visual;
            if (!visual) {
                errors.push(`${id} 缺少圖像導讀。`);
            } else {
                lessonVisualCount += 1;
                if (!visual.src || !fs.existsSync(path.join(root, visual.src))) {
                    errors.push(`${id} 的圖像檔不存在：${visual.src || "（未填寫）"}`);
                }
                if (!visual.alt || !visual.title || !visual.caption) {
                    errors.push(`${id} 的圖像替代文字、標題或說明不完整。`);
                }
                if (!Array.isArray(visual.points) || visual.points.length < 3) {
                    errors.push(`${id} 的圖像導讀至少需要三個觀察重點。`);
                }
                if (!Number.isInteger(visual.width) || visual.width <= 0 || !Number.isInteger(visual.height) || visual.height <= 0) {
                    errors.push(`${id} 的圖像尺寸資料無效。`);
                }
            }

            const layered = page.layeredLearning;
            if (!layered) {
                errors.push(`${id} 缺少分層學習及課業。`);
            } else {
                layeredLessonCount += 1;
                const scenario = layered.scenario;
                if (!scenario?.src || !fs.existsSync(path.join(root, scenario.src))) {
                    errors.push(`${id} 的情境圖片不存在：${scenario?.src || "（未填寫）"}`);
                }
                if (!scenario?.alt || !scenario?.title || !scenario?.caption) {
                    errors.push(`${id} 的情境圖片替代文字、標題或說明不完整。`);
                }
                if (!Number.isInteger(scenario?.width) || scenario.width <= 0 || !Number.isInteger(scenario?.height) || scenario.height <= 0) {
                    errors.push(`${id} 的情境圖片尺寸資料無效。`);
                }
                if (!layered.microLesson?.title || !Array.isArray(layered.microLesson?.steps) || layered.microLesson.steps.length < 3) {
                    errors.push(`${id} 的圖像微課至少需要三個畫面。`);
                } else {
                    layered.microLesson.steps.forEach((step, index) => {
                        if (!step.kicker || !step.title || !step.body) errors.push(`${id} 的圖像微課畫面 ${index + 1} 不完整。`);
                    });
                }
                const levels = layered.levels;
                const expectedLevelIds = ["foundation", "exam", "challenge"];
                if (!Array.isArray(levels) || levels.length !== expectedLevelIds.length) {
                    errors.push(`${id} 必須提供基礎、應試及挑戰三個學習層。`);
                } else {
                    const levelIds = levels.map(level => level.id);
                    expectedLevelIds.forEach(levelId => {
                        if (!levelIds.includes(levelId)) errors.push(`${id} 缺少 ${levelId} 學習層。`);
                    });
                    if (new Set(levelIds).size !== levelIds.length) errors.push(`${id} 有重複學習層識別碼。`);
                    levels.forEach(level => {
                        if (!level.label || !level.tag || !level.duration || !level.goal || !level.task || !level.output) {
                            errors.push(`${id} 的 ${level.id || "未命名"} 學習層內容不完整。`);
                        }
                        if (!Array.isArray(level.criteria) || level.criteria.length < 3) {
                            errors.push(`${id} 的 ${level.id || "未命名"} 學習層至少需要三項完成準則。`);
                        }
                    });
                }
            }

            const focus = page.dseFocus;
            if (!focus) {
                errors.push(`${id} 缺少 DSE 用字與答題重點。`);
            } else {
                dseFocusCount += 1;
                if (!Array.isArray(focus.keyTerms) || focus.keyTerms.length < 5) errors.push(`${id} 至少需要五個必用字詞。`);
                if (!Array.isArray(focus.mustKnow) || focus.mustKnow.length < 3) errors.push(`${id} 至少需要三項核心重點。`);
                if (!Array.isArray(focus.questionForms) || focus.questionForms.length < 2) errors.push(`${id} 至少需要兩種常見題型。`);
                if (!focus.answerPattern) errors.push(`${id} 缺少建議答題結構。`);
                if (!Array.isArray(focus.lossPoints) || focus.lossPoints.length < 3) errors.push(`${id} 至少需要三項常見失分。`);
            }

            const expectedGameType = expectedGames.get(id);
            if (expectedGameType && page.game?.type !== expectedGameType) {
                errors.push(`${id} 應提供 ${expectedGameType} 互動遊戲。`);
            }
            if (page.game) {
                lessonGameCount += 1;
                const game = page.game;
                if (!expectedGameType) errors.push(`${id} 提供了未列入驗證範圍的互動遊戲。`);
                if (!game.title || !game.intro || !game.eyebrow) errors.push(`${id} 的互動遊戲標題或說明不完整。`);
                if (game.type === "formula-detective") {
                    if (!Array.isArray(game.missions) || game.missions.length < 3) errors.push(`${id} 公式偵探至少需要三關。`);
                    game.missions?.forEach((mission, index) => {
                        if (!mission.prompt || !mission.faulty || !mission.answer || !mission.hint || !mission.explanation) {
                            errors.push(`${id} 公式關卡 ${index + 1} 內容不完整。`);
                        }
                        if (!Array.isArray(mission.acceptable) || !mission.acceptable.includes(mission.answer)) {
                            errors.push(`${id} 公式關卡 ${index + 1} 沒有包含標準答案。`);
                        }
                    });
                }
                if (game.type === "network-builder") {
                    const deviceIds = new Set(game.devices?.map(device => device.id));
                    if (!Array.isArray(game.devices) || game.devices.length < 4 || !Array.isArray(game.slots) || game.slots.length < 4) {
                        errors.push(`${id} 網絡建構遊戲至少需要四件硬件及四個位置。`);
                    }
                    game.devices?.forEach(device => {
                        if (!device.image || !fs.existsSync(path.join(root, device.image))) errors.push(`${id} 網絡硬件圖片不存在：${device.image || "（未填寫）"}`);
                        if (!device.alt || !device.note) errors.push(`${id} 網絡硬件 ${device.id || "未命名"} 缺少替代文字或功能說明。`);
                    });
                    game.slots?.forEach(slot => {
                        if (!deviceIds.has(slot.answer)) errors.push(`${id} 網絡位置 ${slot.id || "未命名"} 引用不存在的硬件。`);
                    });
                    if (!Number.isInteger(game.mediumChallenge?.answerIndex) || game.mediumChallenge.answerIndex < 0 || game.mediumChallenge.answerIndex >= game.mediumChallenge.options?.length) {
                        errors.push(`${id} 傳輸媒介挑戰答案索引無效。`);
                    }
                }
                if (game.type === "trace-debugger") {
                    if (!Array.isArray(game.code) || game.code.length < 6 || !Array.isArray(game.trace) || game.trace.length < 3) {
                        errors.push(`${id} 追蹤除錯遊戲缺少程式或追蹤步驟。`);
                    }
                    game.trace?.forEach((step, index) => {
                        if (step.i === undefined || step.value === undefined || !Number.isInteger(step.expectedCount) || !step.note) {
                            errors.push(`${id} 追蹤步驟 ${index + 1} 不完整。`);
                        }
                    });
                    if (!Number.isInteger(game.bugAnswerIndex) || game.bugAnswerIndex < 0 || game.bugAnswerIndex >= game.bugOptions?.length || !game.fix) {
                        errors.push(`${id} 除錯答案或修正方法無效。`);
                    }
                }
                if (game.type === "sql-missions") {
                    if (!Array.isArray(game.tables) || game.tables.length < 2 || !Array.isArray(game.missions) || game.missions.length < 2) {
                        errors.push(`${id} SQL 任務至少需要兩個數據表及兩關。`);
                    }
                    game.missions?.forEach((mission, index) => {
                        if (!mission.prompt || !mission.starter || !mission.canonical || !Array.isArray(mission.requiredTokens) || mission.requiredTokens.length < 4) {
                            errors.push(`${id} SQL 任務 ${index + 1} 查詢資料不完整。`);
                        }
                        if (!Array.isArray(mission.resultColumns) || !Array.isArray(mission.resultRows) || !mission.explanation) {
                            errors.push(`${id} SQL 任務 ${index + 1} 結果或解釋不完整。`);
                        }
                    });
                }
                if (game.type === "cpu-cycle-race" || game.type === "algorithm-arena") {
                    if (!Array.isArray(game.rounds) || game.rounds.length < 4) errors.push(`${id} 競技遊戲至少需要四個回合。`);
                    game.rounds?.forEach((round, index) => {
                        if (!round.title || !round.prompt || !round.explanation || !Array.isArray(round.options) || round.options.length < 3) {
                            errors.push(`${id} 競技回合 ${index + 1} 內容不完整。`);
                        }
                        if (!Number.isInteger(round.answerIndex) || round.answerIndex < 0 || round.answerIndex >= round.options?.length) {
                            errors.push(`${id} 競技回合 ${index + 1} 的答案索引無效。`);
                        }
                    });
                    if (game.type === "cpu-cycle-race" && (!Array.isArray(game.route) || game.route.length < 6)) {
                        errors.push(`${id} CPU 競速缺少完整資料路線。`);
                    }
                }
                if (game.type === "cyber-defense") {
                    if (!Array.isArray(game.waves) || game.waves.length < 3) errors.push(`${id} 網絡保衛戰至少需要三波攻擊。`);
                    game.waves?.forEach((wave, index) => {
                        if (!wave.name || !wave.threat || !wave.impact || !wave.explanation || !Array.isArray(wave.options) || wave.options.length < 3) {
                            errors.push(`${id} 攻擊波 ${index + 1} 內容不完整。`);
                        }
                        if (!Number.isInteger(wave.answerIndex) || wave.answerIndex < 0 || wave.answerIndex >= wave.options?.length) {
                            errors.push(`${id} 攻擊波 ${index + 1} 的答案索引無效。`);
                        }
                    });
                }
            }
        }

        const check = page.quickCheck;
        if (!check?.question || !check.explanation || !Array.isArray(check.options)) errors.push(`${id} 的快速檢查不完整。`);
        if (!Number.isInteger(check?.answerIndex) || check.answerIndex < 0 || check.answerIndex >= check.options.length) {
            errors.push(`${id} 的快速檢查答案索引無效。`);
        }
    });
}

const companionSource = fs.readFileSync(path.join(root, "assets/js/lesson_companion.js"), "utf8");
["hkdse-ict-zero-start-v1", "data-zero-step", "speechSynthesis", "完全未學過？由這裏開始"].forEach(marker => {
    if (!companionSource.includes(marker)) errors.push(`零基礎起步扶手缺少標記：${marker}`);
});
platform?.getItems().filter(item => item.type === "lesson").forEach(item => {
    const html = fs.readFileSync(path.join(root, item.file), "utf8");
    if (!html.includes("learning_data.js?v=14")) errors.push(`${item.file} 未載入最新學習資料。`);
    if (!html.includes("lesson_companion.js?v=8")) errors.push(`${item.file} 未載入最新學習助手。`);
});

if (errors.length) {
    console.error(`學習提示驗證失敗（${errors.length} 項）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`學習提示驗證通過：${Object.keys(learning.pages).length} 個頁面均有目標、概念圖、常見誤解及快速檢查；${lessonVisualCount}/${lessonCount} 個課程頁有圖像導讀、零基礎起步扶手及三級學習，${dseFocusCount}/${lessonCount} 個課程頁有專屬 DSE 用字、重點及失分提示，${lessonGameCount} 個互動遊戲資料完整。`);
}
