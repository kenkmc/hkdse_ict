# 校園同步部署及回復紀錄

## 2026-10-12：設定頁無回應修正（版本 7）

- 原 Web App 已更新至固定版本 **7**，API 已逐檔讀回核對及確認部署版本；原 URL、`DOMAIN / USER_DEPLOYING` 和 OAuth 權限不變。
- Google 登入設定改為伺服器產生初始內容，獨立 bootstrap 不再讀取學生、群組或課業。儲存改用帶老師管理確認碼的標準 POST，結果在新分頁顯示，毋須依賴 `google.script.run`；失敗會顯示具體欄位／權限錯誤和返回設定的連結。
- 重新讀取／啟用加入 45 秒回應逾時提示；讀取狀態不再清除尚未儲存的 Client ID。逾時後先核對最新狀態，避免重複啟用。
- Google 登入、校園同步、老師管理三套驗證通過；隔離瀏覽器驗證 1920×1080、1280×720、390×844、無 JavaScript 的表單儲存、缺少／逾時 RPC、具頁框限制的 POST 新分頁、憑證不回顯及未測試不能啟用。手機畫面已檢視。
- 本次未代填 Client secret、未啟用遷移或修改學生名冊／綁定。使用者實際 Google OAuth 儲存及登入結果仍需在正式頁面確認；本機模擬不能替代端到端驗收。
- 本次回復點為固定版本 **6**、Git **51ee724**；雲端原稿備份 `.local-school-sync/before-upload-2026-10-12T03-40-21-840Z.json`。回復 UI 程式不會自動回復 Script Properties。若已執行登入遷移，仍須依 [Google 登入指南](GOOGLE_LOGIN.md) 處理綁定回復。

## 2026-10-12：Google 登入遷移準備

- 同一 Web App 已更新至固定版本 **6**；Apps Script API 已逐檔讀回核對、再核對部署版本、原 URL 及 `DOMAIN / USER_DEPLOYING` 權限未變。
- 新增 `GoogleAuth.gs`、`GoogleAuthSettings.html`，教師入口 `?auth-settings=1`；學生名冊提供「登入配對」修正／解除電郵。首次配對即時啟用，按用戶選擇不加審批。
- Students 只新增 **K1 = GoogleEmail**，原 A:J、學生名冊行、帳戶綁定、群組及學習紀錄未重設。Sheets 技能採精確範圍寫入、沿用鄰欄標頭格式並讀回核對；原生 Google Sheet 視覺畫面未驗證，格式以 API 核對。
- 完整 Google Sheet 遷移前備份：`1TUWsF5sPWt75Sb2QIi4RBf2uBDJufJFmxXuq1ubOpro`；原表及備份權限均已核對只有部署老師擁有。
- **尚未啟用新 OAuth 登入**：沒有專用校方 Web OAuth Client ID／secret。舊登入仍作過渡；沒有使用 clasp Client 代替學生登入，沒有以偽造帳戶／資料填入名冊，沒有執行綁定重設。
- 啟用需部署老師在設定頁確認新 Script 連網權限、建立 Internal Web OAuth Client、設定頁輸入憑證、測試老師登入，最後确认備份及重設。此流程只需 `openid email`；學生不需要 Sheet 權限。
- 12 個驗證套件通過。隔離瀏覽器以虛構資料測試老師 13 個畫面、新設定頁及首次配對頁，尺寸 1920×1080、1280×720、390×844 通過；真實 Google OAuth／學生帳戶端到端測試待設定後完成。
- Google 登入程式仍受 Apps Script 原生多帳戶入口限制；必要時用只登入校園帳戶的瀏覽器／無痕視窗。跨設備登入辨認不包含雲端下載／合併本機進度。
- 回復到新流程前：固定版本 **5**、Git **a923aa2**，原稿 `.local-school-sync/before-upload-2026-10-12T00-56-33-165Z.json`。已啟用後還需按 StudentId 回復登入欄及 Script Properties，不能只改部署版本；見 [Google 登入及回復指南](GOOGLE_LOGIN.md)。不合併 main。

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
- 初始化已核對完成：`TeacherDashboard` 顯示最後更新為香港時間 `2026-10-11 23:56`，學生人數仍為 0，沒有加入虛構學生或學習紀錄。
- 試算表權限已核對只有擁有者，未開放網域或知道連結的人存取。

## 仍須老師完成／驗收

1. 在 `Students` 輸入班別、學號及中英文姓名，再在老師設定頁按「名冊填妥後：產生啟用碼」。
2. 用真正學生校園帳戶測試啟用、指定課業及手動同步；用非校園帳戶測試拒絕存取。匿名請求已核對會轉至 Google 校園登入頁；未完成學生帳戶測試前，不應宣稱完整學生登入已驗收。

## 回復點

| 回復目標 | Git 提交 |
| --- | --- |
| 網站只用本機進度，沒有校園同步 | `f06a41e` |
| 校園同步程式及試算表模型 v2 | `29fee74` |
| 本校預設，但網站端仍停用 | `8b09d47` |

網站回復可先把 `school_sync_config.js` 設為 `enabled: false`、`webAppUrl: ""` 並提交；保留歷史，勿使用 `git reset --hard`。若要撤回這次啟用提交，使用 `git revert` 並推送到同一發佈分支。

Apps Script 上載前原稿在本機（Git 已忽略）`.local-school-sync/before-upload-*.json`，保存最初空白原稿及每次部署前的版本。`backup-reference.json` 記錄最近的備份位置，`uploaded.json` 保存讀回指紋，`deployment.json` 保存版本及部署資料。這些檔案不包含管理用 OAuth 憑證。

如要停止 Web App，在 Apps Script「管理部署」封存本次部署。網站的 Git 回復不會刪除 Google Sheet 或回復 Google Script。回復原稿時，先備份目前雲端程式，再用備份的完整 `content.files` 更新同一 Script ID；學生試算表資料及指令碼屬性獨立保存，不要刪除。日後功能更新應建立新固定版本並更新同一部署，保留原 URL。
