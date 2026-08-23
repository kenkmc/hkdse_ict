(function initialiseInternetLessons() {
    "use strict";

    const queryParts = {
        phrase: { token: '"人工智能"', detail: "引號把多個字視為完整詞組，減少只包含其中一個字詞的結果。" },
        context: { token: "中學 學習成效", detail: "加入情境和所需面向，比只搜尋廣泛主題更容易找到直接相關資料。" },
        source: { token: "site:edu.hk", detail: "限制網站範圍可集中查看教育機構內容，但機構域名本身仍不等於內容必然正確。" },
        exclude: { token: "-廣告 -課程推廣", detail: "排除明顯不需要的字詞可減少商業推廣結果；仍須逐一評估來源。" }
    };

    const queryLab = document.querySelector("[data-query-lab]");
    if (queryLab) {
        const renderQuery = () => {
            const selected = [...queryLab.querySelectorAll("[data-query-part][aria-pressed='true']")].map(button => queryParts[button.dataset.queryPart]);
            queryLab.querySelector("[data-query-output]").textContent = selected.map(part => part.token).join(" ") || "人工智能";
            queryLab.querySelector("[data-query-detail]").textContent = selected.length
                ? selected.map(part => part.detail).join(" ")
                : "查詢過於寬泛；先加入具體詞組、情境或來源條件。";
        };
        queryLab.querySelectorAll("[data-query-part]").forEach(button => {
            button.addEventListener("click", () => {
                button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
                renderQuery();
            });
        });
        renderQuery();
    }

    document.querySelectorAll("[data-source-card]").forEach(card => {
        card.querySelector("button")?.addEventListener("click", event => {
            const result = card.querySelector("[data-source-result]");
            const open = result.hidden;
            result.hidden = !open;
            event.currentTarget.setAttribute("aria-expanded", String(open));
            event.currentTarget.textContent = open ? "收起分析" : "分析可信性";
        });
    });

    const streamProfiles = {
        stable: {
            title: "網速高於播放所需速度",
            description: "接收速度足以一邊播放一邊補充緩衝，播放一般可持續進行。",
            loaded: 8,
            status: "緩衝保持充足：播放流暢"
        },
        variable: {
            title: "網速短暫下降",
            description: "播放器先使用已緩衝的數據；若速度很快回復，使用者可能不會察覺停頓。",
            loaded: 4,
            status: "正在消耗緩衝：暫時仍可播放"
        },
        slow: {
            title: "網速長期低於播放所需速度",
            description: "緩衝最終耗盡，播放器需要等待更多數據，或降低媒體品質以減少每秒數據量。",
            loaded: 1,
            status: "緩衝不足：播放停頓／降低畫質"
        }
    };

    const streamLab = document.querySelector("[data-stream-lab]");
    if (streamLab) {
        const renderStream = profileName => {
            const profile = streamProfiles[profileName];
            streamLab.querySelectorAll("[data-stream-profile]").forEach(button => {
                button.setAttribute("aria-selected", String(button.dataset.streamProfile === profileName));
            });
            streamLab.querySelector("[data-stream-title]").textContent = profile.title;
            streamLab.querySelector("[data-stream-description]").textContent = profile.description;
            streamLab.querySelectorAll("[data-buffer-segment]").forEach((segment, index) => segment.classList.toggle("is-loaded", index < profile.loaded));
            streamLab.querySelector("[data-stream-status]").textContent = profile.status;
        };
        streamLab.querySelectorAll("[data-stream-profile]").forEach(button => button.addEventListener("click", () => renderStream(button.dataset.streamProfile)));
        renderStream("stable");
    }

    const tagDetails = {
        heading: { selector: "[data-code-heading]", title: "標題元素", detail: "h1 建立頁面的主要標題和資訊層次；不是單純把文字放大。", tags: ["<h1>", "內容層次", "每頁主題"] },
        paragraph: { selector: "[data-code-paragraph]", title: "段落元素", detail: "p 把一組文字標示成段落，讓瀏覽器和輔助工具理解內容結構。", tags: ["<p>", "文字段落", "結構"] },
        link: { selector: "[data-code-link]", title: "超連結元素", detail: "a 的 href 指出目標位置；可見文字應描述目的地，避免只寫『按此』。", tags: ["<a>", "href", "描述性連結"] },
        image: { selector: "[data-code-image]", title: "圖像元素", detail: "img 的 src 指出圖像資源；alt 應簡潔傳達有資訊作用圖片的內容或用途。", tags: ["<img>", "src", "alt"] }
    };

    const codeLab = document.querySelector("[data-code-lab]");
    if (codeLab) {
        const renderTag = tagName => {
            const profile = tagDetails[tagName];
            codeLab.querySelectorAll("[data-code-tag]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.codeTag === tagName)));
            codeLab.querySelectorAll("mark").forEach(mark => mark.replaceWith(...mark.childNodes));
            const target = codeLab.querySelector(profile.selector);
            if (target) {
                const mark = document.createElement("mark");
                target.replaceWith(mark);
                mark.append(target);
            }
            codeLab.querySelector("[data-code-title]").textContent = profile.title;
            codeLab.querySelector("[data-code-detail]").textContent = profile.detail;
            codeLab.querySelector("[data-code-tags]").innerHTML = profile.tags.map(tag => `<span>${tag.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>`).join("");
        };
        codeLab.querySelectorAll("[data-code-tag]").forEach(button => button.addEventListener("click", () => renderTag(button.dataset.codeTag)));
        renderTag("heading");
    }

    const designLab = document.querySelector("[data-design-lab]");
    if (designLab) {
        const preview = designLab.querySelector("[data-design-preview]");
        designLab.querySelectorAll("[data-design-toggle]").forEach(button => {
            button.addEventListener("click", () => {
                const active = button.getAttribute("aria-pressed") !== "true";
                button.setAttribute("aria-pressed", String(active));
                button.textContent = active ? "已啟用" : "未啟用";
                preview.classList.toggle(button.dataset.designToggle, active);
            });
        });
    }

    const risks = {
        interception: {
            title: "公共網絡上的截取／竊聽",
            description: "攻擊者若取得未加密傳輸，可能讀取登入資料或客戶內容，破壞保密性。",
            defenses: [["VPN／TLS 加密", "令被截取的內容以密文呈現。"], ["驗證證書", "減低連到冒充伺服器的風險。"]]
        },
        unauthorised: {
            title: "未授權登入帳戶",
            description: "密碼外洩、猜中或重用後，攻擊者可能冒認合法使用者存取資料。",
            defenses: [["多因素認證", "即使密碼外洩，仍需要另一項驗證因素。"], ["最小權限", "限制每個帳戶只可存取工作所需資源。"]]
        },
        malware: {
            title: "惡意程式入侵",
            description: "木馬、病毒、蠕蟲、間諜或勒索軟件可破壞、竊取、加密資料或擴散。",
            defenses: [["更新＋防毒", "修補已知漏洞並掃描可疑檔案或行為。"], ["備份＋權限控制", "降低勒索後的損失並限制可被修改的資料。"]]
        },
        dos: {
            title: "拒絕服務（DoS）",
            description: "大量惡意要求耗盡頻寬或伺服器資源，使合法使用者不能取得服務，破壞可用性。",
            defenses: [["防火牆／流量過濾", "按規則封鎖可疑來源或異常流量。"], ["分流／容量保護", "以負載平衡和供應商緩解服務吸收攻擊流量。"]]
        },
        wifi: {
            title: "未受保護的無線網絡",
            description: "弱密碼或舊式保安可讓附近攻擊者嘗試接入或截取無線通訊。",
            defenses: [["WPA2／WPA3", "以現行無線保安協定加密通訊。"], ["強密碼＋更新", "減少猜中密碼及利用路由器漏洞的風險。"]]
        }
    };

    const riskLab = document.querySelector("[data-risk-lab]");
    if (riskLab) {
        const renderRisk = riskName => {
            const risk = risks[riskName];
            riskLab.querySelectorAll("[data-risk]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.risk === riskName)));
            riskLab.querySelector("[data-risk-title]").textContent = risk.title;
            riskLab.querySelector("[data-risk-description]").textContent = risk.description;
            riskLab.querySelector("[data-defense-list]").innerHTML = risk.defenses.map(defense => `<div><strong>${defense[0]}：</strong>${defense[1]}</div>`).join("");
        };
        riskLab.querySelectorAll("[data-risk]").forEach(button => button.addEventListener("click", () => renderRisk(button.dataset.risk)));
        renderRisk("interception");
    }
})();
