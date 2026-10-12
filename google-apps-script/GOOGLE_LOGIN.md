# Google 登入、名冊遷移與回復

## 現況及啟用條件

程式支援專用 Google OAuth authorization-code flow：帳戶選擇、校園身份驗證、首次以班別／學號立即配對、同帳戶跨設備登入、老師修正／解除配對。**部署新程式不等於已啟用 OAuth**：需老師建立校方 Web OAuth Client、儲存設定、成功測試，再啟用。未完成前保留舊登入，不能聲稱真實學生流程已驗收。

學生可自選名冊，不經老師審批。重複電郵及已配對名冊會被拒絕，但不能防止第一個登入者冒認未配對的學生。老師可預填正確 GoogleEmail 減少風險。修正配對不會自動搬移可能誤記於別人的歷史紀錄。

## 老師操作

1. 正式 Web App 加上 `?auth-settings=1`（或學生名冊 → Google 登入設定）。新版本可能要求部署老師確認新增的 `script.external_request` 權限。
2. 校園帳戶進入 [Google Auth Platform](https://console.cloud.google.com/auth/overview)，建立校方擁有的專案；Audience 選 **Internal**，設定應用名稱及校方聯絡資料。
3. Clients → Create client → **Web application**。Authorized redirect URIs 複製設定頁顯示的**完整**正式 `/exec` 網址，不加查詢參數。此流程不需要 JavaScript origin。不要使用 clasp 的 OAuth Client。
4. 將 Client ID 和完整 Client secret 填入私有設定頁，按「儲存 OAuth 設定」；**儲存結果在新分頁顯示**。成功頁可直接按「測試 Google 帳戶選擇」；失敗頁會顯示具體原因及返回設定的連結。Secret 只存 Script Properties，**不要貼到聊天、名冊或 GitHub**。不要求學生 Drive／Sheets 權限；登入只索取 `openid email`。
5. 按「測試 Google 帳戶選擇」，選部署老師本人的帳戶。確認成功後返回設定頁按「重新讀取狀態」。測試不改學生資料。
6. 勾選遷移確認，再按「備份舊綁定並啟用 Google 登入」。系統先檢查名冊識別碼和班別學號不重複，複製 Students 工作表並核對內容，再清除舊 AccountKey、ActivationCode、FirstLinkedAt，最後才啟用。StudentId、名冊、LastLoginAt、預填 GoogleEmail、群組、課業及歷史进度保留。重複按啟用不會再次清除。

**Workspace 限制：**Web App 仍為 `DOMAIN / USER_DEPLOYING`，不改匿名公開，不把 Sheet 分享給學生。Apps Script 的多帳戶存取本身有 Google 限制；若未能進入 Web App，使用只登入校園帳戶的瀏覽器／無痕視窗。OAuth 帳戶選擇並不能消除 Google 在 Web App 入口的限制。校方可能需要允許這個 Internal OAuth app。

**設定頁没有反應時：**重新開啟正式 `?auth-settings=1` 頁面。新版由伺服器直接產生設定及管理確認碼，毋須等候學生／群組／課業資料；即使即時狀態連線不能運作，也可用標準表單儲存。按儲存後查看新分頁結果，再返回按「重新讀取狀態」。即時讀取／啟用等候 45 秒後會顯示恢復方法；逾時不代表伺服器已取消，應先重新開啟設定頁確認結果，不要連按啟用。管理連線過期時，重新開啟頁面取得新確認碼。

## 學生流程

「我的學習」→「使用校園 Google 帳戶連接」→「選擇 Google 帳戶」。首次登入選自己的班別、學號並確認，即時配對。電郵由 Google 在伺服器端驗證，不能由學生自行填寫；其他設備選同一帳戶便會辨認同一 StudentId，不再問啟用碼。停用學生不可登入。

按「前往 ICT 學習網站」返回，只有按「同步至學校」才傳送學習紀錄。連接最多約 5 小時，亦可能因 Google cache 提早淘汰而需重登。**跨設備登入不等於下載／合併另一部設備的本機紀錄**；這次沒有擴充雲端進度還原功能。

## 老師修正

學生名冊 → 該學生的「登入配對」：填正確校園 GoogleEmail，或留空解除。若電郵已配對另一人，先解除錯誤的那個配對。不能覆蓋另一人的綁定。新流程啟用前，只預填電郵，不重設舊登入。

啟用後修正會輪替登入 epoch，**所有學生的舊連接／首次配對票據失效，須重新連接**。StudentId 和歷史資料不改變；不刪名冊，不刪題目紀錄。一般學生不可呼叫老師設定／修正函數。

## 結構及安全

- 原 Students 的 A:J 不移位，只在 K 新增 `GoogleEmail`。舊 AccountKey 仍用作不公開的內部識別；ActivationCode 僅供過渡相容，新登入不使用。
- OAuth 使用一次性 10 分鐘 state、PKCE、Workspace 使用者工作階段綁定；code 只在伺服器交換，Google UserInfo 嚴格核對 `email_verified`、校方 `hd` 及電郵網域。
- 不保存 Google access／refresh tokens、不把 Client secret 傳回前端。無離線 Google 權限；不信任瀏覽器傳入的電郵或解碼而未驗證的 JWT。
- 初次配對頁不公開其他學生姓名、電郵或綁定狀態。票據一次性、最多 10 分鐘，配對與老師修正共用鎖。
- 同步採用 OAuth 已驗證的伺服器連接票據，不以瀏覽器預設 Google 帳戶電郵替代學生身份；每次同步重新核對綁定／狀態，成功後輪替票據。
- 12 個自動驗證套件包括 OAuth 模擬、舊流程相容、重複配對、跨設備辨認、非校園帳戶拒絕、老師限定、名冊備份及歷史保留。模擬測試不能替代 Google Cloud 的真實端到端測試。

## 回復

啟用前完整 Google Sheet 備份：`HKDSE ICT 學生進度管理 — Google 登入遷移前備份 2026-10-12`，ID `1TUWsF5sPWt75Sb2QIi4RBf2uBDJufJFmxXuq1ubOpro`，只有部署老師擁有。不要公開備份或覆蓋整本現有試算表，以免丟失其後進度。

新流程**尚未啟用時**：可把原 Web App 部署改回固定版本 **5**，網站原回復提交 `a923aa2`；新增的 K 欄不影響舊版。Script 原稿備份在 Git 忽略的 `.local-school-sync/before-upload-2026-10-12T00-56-33-165Z.json`。

新流程**已啟用後**：只改回版本 5 **不會還原綁定或 Script Properties**。先停止學生同步／備份當前資料；由部署老師將 `STUDENT_AUTH_MODE` 改回 `LEGACY`，輪替 `GOOGLE_LOGIN_EPOCH`；從啟用時的 `StudentsLoginBackup_*` 按 **StudentId** 回復登入欄 F、H、I（不要按排序後的行號，不要改 A:E 或任何進度表）。新登入時保存的 K 欄不必刪除；原有 LastLoginAt 保留最近值。其後回復版本 5；新流程啟用後新增的學生需要舊啟用碼。不要 `git reset --hard` 或刪除試算表。

參考：[Google Web OAuth](https://developers.google.com/identity/protocols/oauth2/web-server)、[Google OpenID Connect](https://developers.google.com/identity/openid-connect)、[Apps Script 多帳戶限制](https://developers.google.com/apps-script/guides/support/troubleshooting#issues_with_multiple_google_accounts)。
