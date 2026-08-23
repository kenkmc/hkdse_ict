(function initialiseSystemLessons() {
    "use strict";

    const cycleSteps = {
        fetchAddress: {
            title: "1A · 取得下一指令的地址",
            explanation: "程序計數器（PC）保存下一指令的地址。地址送往記憶體地址暫存器（MAR），再經地址匯流排傳往主記憶體。",
            keyword: "地址：PC → MAR → 地址匯流排",
            registers: ["pc", "mar"],
            buses: ["address"]
        },
        fetchInstruction: {
            title: "1B · 把指令送入 CPU",
            explanation: "主記憶體把該地址的指令經數據匯流排送到記憶體數據暫存器（MDR），再複製到指令暫存器（IR／CIR）。PC 同時更新至下一指令地址。",
            keyword: "內容：記憶體 → MDR → IR；PC 更新",
            registers: ["mdr", "ir", "pc"],
            buses: ["data", "control"]
        },
        decode: {
            title: "2 · 解碼（Decode）",
            explanation: "控制單元解釋 IR 內的操作碼和運算對象，然後發出控制訊號，安排下一步需要的部件。",
            keyword: "控制單元：解釋指令、發出控制訊號",
            registers: ["ir", "cu"],
            buses: ["control"]
        },
        execute: {
            title: "3 · 執行（Execute）",
            explanation: "CPU 執行指令。若是計算或比較，算術邏輯單元（ALU）會處理運算；結果可存入累加器／暫存器，並按需要寫回記憶體。",
            keyword: "ALU 運算；結果 → 暫存器／記憶體",
            registers: ["alu", "acc"],
            buses: ["data", "control"]
        }
    };

    const deviceScenarios = {
        temperature: {
            title: "溫度感應器（temperature sensor）",
            summary: "在無人值守的溫室，每分鐘自動收集環境溫度。",
            reasons: [
                ["數據配對", "可直接感測物理溫度並轉成輸入數據。"],
                ["自動收集", "可連續、定時輸入，毋須人手讀數和抄錄。"]
            ]
        },
        omr: {
            title: "光學標記閱讀器（OMR）",
            summary: "大量讀取學生在預先印製選擇題答題紙上填黑的選項。",
            reasons: [
                ["資料形式", "專門辨認固定位置的填色標記。"],
                ["工作量", "可快速處理大量標準化答題紙，減少人手輸入。"]
            ]
        },
        barcode: {
            title: "條碼閱讀器（barcode reader）",
            summary: "超級市場在收銀時讀取貨品包裝上的貨品編號。",
            reasons: [
                ["直接輸入", "讀取已編碼的貨品識別碼，再從數據庫找出貨品資料。"],
                ["準確效率", "較人手輸入編號快，並減少按錯數字。"]
            ]
        },
        display: {
            title: "大型顯示屏（display unit）",
            summary: "車站需要同時向大量乘客顯示列車到站時間。",
            reasons: [
                ["輸出形式", "以文字及圖像即時顯示更新後的資訊。"],
                ["使用情境", "大畫面可讓多名、不同距離的乘客同時閱讀。"]
            ]
        }
    };

    const modes = {
        batch: {
            title: "批次處理（Batch processing）",
            definition: "先把同類工作或數據累積起來，再於指定時間依次集中處理；通常不要求每項輸入即時得到結果。",
            signals: ["累積工作", "預定時間", "一次處理多項"],
            example: "例：銀行在每日結束後一次產生所有月結單；防毒軟件在凌晨按排程掃描所有檔案。",
            contrast: "不要因為結果列出多個檔案就判定為批次；真正關鍵是工作先累積，然後按排程集中處理。"
        },
        realtime: {
            title: "實時處理（Real-time processing）",
            definition: "系統在事件發生後，必須在規定而且足夠短的時限內處理並回應，使回應仍然有效。",
            signals: ["事件觸發", "規定時限", "立即回應"],
            example: "例：汽車安全氣囊偵測碰撞後必須立即啟動；防毒軟件在受感染程式執行前即時封鎖。",
            contrast: "實時不單等於『電腦很快』；答案須指出系統為何必須在特定時限內作出回應。"
        },
        parallel: {
            title: "並行處理（Parallel processing）",
            definition: "把一項大型工作拆成可同時執行的部分，由多個處理核心或處理器同步計算，再合併結果。",
            signals: ["拆分同一工作", "同時運算", "多核心／處理器"],
            example: "例：GPU 的大量核心同時處理圖像中不同像素或 AI 模型中的矩陣運算。",
            contrast: "並行處理可在同一部電腦內完成；它不等同多部連網電腦共同工作。"
        },
        distributed: {
            title: "分布式處理（Distributed processing）",
            definition: "把工作分配給透過網絡連接、可獨立運作的多部電腦共同處理。",
            signals: ["多部電腦", "網絡連接", "分擔工作"],
            example: "例：不同地區的伺服器共同處理大型天氣模型或網上服務要求。",
            contrast: "作答時要提及多部獨立電腦和網絡；只寫『多核心』屬並行處理的典型描述。"
        },
        virtualisation: {
            title: "虛擬化（Virtualisation）",
            definition: "以軟件把實體電腦資源抽象成一個或多個彼此隔離的虛擬環境，每個環境可運行自己的操作系統和應用。",
            signals: ["共享實體資源", "多個虛擬環境", "互相隔離"],
            example: "例：一部實體伺服器同時運行網頁、電郵和測試用的多個虛擬伺服器。",
            contrast: "虛擬化不是增加實體硬件；它讓現有處理器、記憶體和儲存空間被多個隔離環境共享。"
        }
    };

    const cycle = document.querySelector("[data-cycle-lab]");
    if (cycle) {
        const renderCycle = stepName => {
            const step = cycleSteps[stepName];
            if (!step) return;
            cycle.querySelectorAll("[data-cycle-step]").forEach(button => {
                button.setAttribute("aria-selected", String(button.dataset.cycleStep === stepName));
            });
            cycle.querySelectorAll("[data-register]").forEach(register => {
                register.classList.toggle("is-active", step.registers.includes(register.dataset.register));
            });
            cycle.querySelectorAll("[data-bus]").forEach(bus => {
                bus.classList.toggle("is-active", step.buses.includes(bus.dataset.bus));
            });
            const memory = cycle.querySelector("[data-memory-box]");
            memory?.classList.toggle("is-active", stepName.startsWith("fetch"));
            cycle.querySelector("[data-cycle-title]").textContent = step.title;
            cycle.querySelector("[data-cycle-explanation]").textContent = step.explanation;
            cycle.querySelector("[data-cycle-keyword]").textContent = step.keyword;
        };
        cycle.querySelectorAll("[data-cycle-step]").forEach(button => button.addEventListener("click", () => renderCycle(button.dataset.cycleStep)));
        renderCycle("fetchAddress");
    }

    const deviceLab = document.querySelector("[data-device-lab]");
    if (deviceLab) {
        const renderDevice = scenarioName => {
            const scenario = deviceScenarios[scenarioName];
            if (!scenario) return;
            deviceLab.querySelectorAll("[data-device-scenario]").forEach(button => {
                button.setAttribute("aria-selected", String(button.dataset.deviceScenario === scenarioName));
            });
            deviceLab.querySelector("[data-device-title]").textContent = scenario.title;
            deviceLab.querySelector("[data-device-summary]").textContent = scenario.summary;
            const reasons = deviceLab.querySelectorAll("[data-device-reason]");
            scenario.reasons.forEach((reason, index) => {
                reasons[index].querySelector("strong").textContent = reason[0];
                reasons[index].querySelector("span").textContent = reason[1];
            });
        };
        deviceLab.querySelectorAll("[data-device-scenario]").forEach(button => button.addEventListener("click", () => renderDevice(button.dataset.deviceScenario)));
        renderDevice("temperature");
    }

    const modeLab = document.querySelector("[data-mode-lab]");
    if (modeLab) {
        const renderMode = modeName => {
            const mode = modes[modeName];
            if (!mode) return;
            modeLab.querySelectorAll("[data-mode]").forEach(button => {
                button.setAttribute("aria-selected", String(button.dataset.mode === modeName));
            });
            modeLab.querySelector("[data-mode-title]").textContent = mode.title;
            modeLab.querySelector("[data-mode-definition]").textContent = mode.definition;
            modeLab.querySelector("[data-mode-signals]").innerHTML = mode.signals.map(signal => `<span>${signal}</span>`).join("");
            modeLab.querySelector("[data-mode-example]").textContent = mode.example;
            modeLab.querySelector("[data-mode-contrast]").textContent = mode.contrast;
        };
        modeLab.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => renderMode(button.dataset.mode)));
        renderMode("batch");
    }

    document.querySelectorAll("[data-classifier]").forEach(classifier => {
        classifier.querySelectorAll("[data-classifier-answer]").forEach(button => {
            button.addEventListener("click", () => {
                const isCorrect = button.dataset.classifierAnswer === classifier.dataset.correct;
                classifier.querySelectorAll("[data-classifier-answer]").forEach(candidate => candidate.classList.remove("is-correct", "is-incorrect"));
                button.classList.add(isCorrect ? "is-correct" : "is-incorrect");
                classifier.querySelector("[data-classifier-feedback]").textContent = isCorrect
                    ? `答對。${classifier.dataset.explanation}`
                    : `未正確。${classifier.dataset.explanation}`;
            });
        });
    });

    const setQuestionVisibility = (question, open) => {
        const marking = question.querySelector(".sys-marking");
        const button = question.querySelector(".sys-reveal");
        if (!marking || !button) return;
        marking.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "收起評分準則" : "查看評分準則";
    };

    document.querySelectorAll("[data-exam-question]").forEach(question => {
        question.querySelector(".sys-reveal")?.addEventListener("click", event => {
            setQuestionVisibility(question, event.currentTarget.getAttribute("aria-expanded") !== "true");
        });
    });

    document.querySelector("[data-reveal-all]")?.addEventListener("click", event => {
        const questions = [...document.querySelectorAll("[data-exam-question]")];
        const willOpen = questions.some(question => question.querySelector(".sys-marking")?.hidden);
        questions.forEach(question => setQuestionVisibility(question, willOpen));
        event.currentTarget.textContent = willOpen ? "收起全部評分準則" : "顯示全部評分準則";
    });
})();
