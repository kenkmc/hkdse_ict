# 校園同步部署及回復紀錄

## 2026-10-11（香港時間）

- 工作分支：`feat/phase-1-platform-foundation`；不合併 `main`。
- GitHub Pages 已設定由此分支根目錄發佈。
- 試算表「HKDSE ICT 學生進度管理」已建立 13 張工作表；尚未匯入學生名冊。
- 已以 Apps Script API 確認專案綁定到目標試算表、下載完整原稿及部署資料作備份，再上載並逐檔讀回核對。
- Apps Script 固定版本：`4`；第 1–3 版及原稿備份仍保留作回復點。
- 主程式已放回雲端「程式碼.gs」，並新增部署老師專用的 `?setup=1` 初始化頁及啟用碼按鈕。
- Web App 存取權：`DOMAIN`；執行身分：`USER_DEPLOYING`，學生不用取得老師試算表的存取權。
- 正式端點在 `school_sync_config.js`；不是 `/dev` 測試網址。
- 網站支援一般及 Workspace 網域端點，修正課業完成時間戳及新分頁／頁內連結的離開提醒。
- 共用電腦不同學生的連接受到本機帳戶切換保護；清除學習紀錄亦會清除連接及學生顯示資料。

## 仍須老師完成／驗收

1. 以部署老師的校園帳戶開啟正式 Web App 的 `?setup=1` 老師設定頁，完成 Google 要求的執行授權。亦可在 Apps Script 函數選單執行 `initialiseSchoolSync`。
2. 在 `Students` 輸入班別、學號及中英文姓名，再在老師設定頁按「名冊填妥後：產生啟用碼」。
3. 用真正學生校園帳戶測試啟用、指定課業及手動同步；用非校園帳戶測試拒絕存取。未執行這些測試前，不應宣稱完整學生登入已驗收。

## 回復點

| 回復目標 | Git 提交 |
| --- | --- |
| 網站只用本機進度，沒有校園同步 | `f06a41e` |
| 校園同步程式及試算表模型 v2 | `29fee74` |
| 本校預設，但網站端仍停用 | `8b09d47` |

網站回復可先把 `school_sync_config.js` 設為 `enabled: false`、`webAppUrl: ""` 並提交；保留歷史，勿使用 `git reset --hard`。若要撤回這次啟用提交，使用 `git revert` 並推送到同一發佈分支。

Apps Script 上載前原稿在本機（Git 已忽略）`.local-school-sync/before-upload-*.json`，保存最初空白原稿及每次部署前的版本。`backup-reference.json` 記錄最近的備份位置，`uploaded.json` 保存讀回指紋，`deployment.json` 保存版本及部署資料。這些檔案不包含管理用 OAuth 憑證。

如要停止 Web App，在 Apps Script「管理部署」封存本次部署。網站的 Git 回復不會刪除 Google Sheet 或回復 Google Script。回復原稿時，先備份目前雲端程式，再用備份的完整 `content.files` 更新同一 Script ID；學生試算表資料及指令碼屬性獨立保存，不要刪除。日後功能更新應建立新固定版本並更新同一部署，保留原 URL。
