(function initialiseNetworkLesson() {
    "use strict";

    const scaleCheck = document.querySelector("[data-scale-check]");
    scaleCheck?.querySelectorAll("[data-scale-answer]").forEach(button => {
        button.addEventListener("click", () => {
            const isCorrect = button.dataset.scaleAnswer === "WAN";
            scaleCheck.querySelectorAll("[data-scale-answer]").forEach(option => {
                option.classList.remove("is-selected", "is-wrong");
            });
            button.classList.add(isCorrect ? "is-selected" : "is-wrong");
            const feedback = scaleCheck.querySelector("[data-scale-feedback]");
            feedback.textContent = isCorrect
                ? "正確。連接跨地域的網絡，覆蓋範圍超出單一校舍，屬 WAN 情境。"
                : "再想一想：題目涉及香港和海外兩個地區，不只是一座校舍內的網絡。";
        });
    });

    document.querySelectorAll("[data-hardware-card]").forEach(card => {
        const button = card.querySelector("button");
        const note = card.querySelector(".nw-answer-note");
        button?.addEventListener("click", () => {
            const willOpen = note.hidden;
            note.hidden = !willOpen;
            button.setAttribute("aria-expanded", String(willOpen));
            button.textContent = willOpen ? "收起作答句式" : "顯示 DSE 作答句式";
        });
    });

    const media = {
        utp: {
            en: "Unshielded twisted pair",
            title: "UTP 雙絞線",
            summary: "常用於建築物內的 Ethernet LAN，鋪設成本較低，但距離及抗干擾能力不及光纖。",
            speed: "中至高", cost: "低", security: "中", availability: "建築物內普及",
            fit: "連接電腦室內的桌面電腦與交換器。"
        },
        fibre: {
            en: "Optical fibre",
            title: "光纖",
            summary: "利用光脈衝傳送數據，可提供高頻寬、長距離傳輸及良好抗電磁干擾能力。",
            speed: "很高", cost: "較高", security: "較高／抗干擾", availability: "視鋪設覆蓋",
            fit: "校舍骨幹或需要穩定高頻寬的固定互聯網連線。"
        },
        microwave: {
            en: "Terrestrial microwave link",
            title: "地面微波",
            summary: "以無線電波在地面站之間傳送數據，毋須鋪設整段實體線路，但通常需要合適的視線路徑。",
            speed: "可達高速度", cost: "需建收發設備", security: "需加密／會受干擾", availability: "受視線及地形影響",
            fit: "在不便鋪設線纜的兩座建築物之間建立定向通訊鏈路。"
        },
        satellite: {
            en: "Satellite link",
            title: "衛星",
            summary: "可服務偏遠地區或海上位置，覆蓋廣，但設備成本和傳輸延遲通常較高。",
            speed: "視服務而定", cost: "較高", security: "需加密保護", availability: "偏遠地區亦可用",
            fit: "沒有地面固網或流動網絡覆蓋的偏遠位置。"
        }
    };

    const comparison = document.querySelector("[data-medium-comparison]");
    comparison?.querySelectorAll("[data-medium]").forEach(tab => {
        tab.addEventListener("click", () => {
            const selected = media[tab.dataset.medium];
            if (!selected) return;
            comparison.querySelectorAll("[data-medium]").forEach(item => item.setAttribute("aria-selected", "false"));
            tab.setAttribute("aria-selected", "true");
            comparison.querySelector("[data-medium-en]").textContent = selected.en;
            comparison.querySelector("[data-medium-title]").textContent = selected.title;
            comparison.querySelector("[data-medium-summary]").textContent = selected.summary;
            comparison.querySelector("[data-rating-speed]").textContent = selected.speed;
            comparison.querySelector("[data-rating-cost]").textContent = selected.cost;
            comparison.querySelector("[data-rating-security]").textContent = selected.security;
            comparison.querySelector("[data-rating-availability]").textContent = selected.availability;
            comparison.querySelector("[data-medium-fit]").textContent = selected.fit;
        });
    });

    const setQuestionVisibility = (question, open) => {
        const marking = question.querySelector(".nw-marking");
        const button = question.querySelector(".nw-reveal");
        marking.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "收起評分準則" : "查看評分準則";
    };

    document.querySelectorAll("[data-exam-question]").forEach(question => {
        question.querySelector(".nw-reveal")?.addEventListener("click", event => {
            setQuestionVisibility(question, event.currentTarget.getAttribute("aria-expanded") !== "true");
        });
    });

    document.querySelector("[data-reveal-all]")?.addEventListener("click", event => {
        const questions = [...document.querySelectorAll("[data-exam-question]")];
        const willOpen = questions.some(question => question.querySelector(".nw-marking").hidden);
        questions.forEach(question => setQuestionVisibility(question, willOpen));
        event.currentTarget.textContent = willOpen ? "收起全部評分準則" : "顯示全部評分準則";
    });
})();
