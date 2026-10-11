# 校園進度同步部署

老師現在可使用原 Web App 的 `?admin=1` 入口，在網頁管理名冊、群組、群組成員、課業、派發對象及要求，並唯讀查看 7 類進度／學習紀錄。見 [老師管理操作及回復指南](TEACHER_ADMIN.md)。只有部署老師可進入，不公開學生資料到 GitHub Pages。

學生以校園 Google Workspace 帳戶開啟 Web App。Apps Script 只在登入當刻讀取電郵以產生不可直接還原的 `AccountKey`，不會把電郵地址寫入試算表。學生按「同步至學校」後，GitHub Pages 才會傳送學習活動。

## 1. 建立校方試算表

1. 使用校方擁有的 Google Workspace 帳戶建立或匯入「HKDSE ICT 學習進度」試算表。
2. 只把存取權授予負責老師；不要設定成「知道連結的任何人」。
3. 選擇「擴充功能 → Apps Script」。
4. 上載本資料夾的 `Code.gs`、`TeacherAdmin.gs`、`TeacherResources.gs` 及 `TeacherAdminUI.html`（主程式可放於原有「程式碼.gs」）。
5. 顯示資訊清單檔案後，以 `appsscript.json` 取代原有內容。

本校的試算表及 Apps Script 現已建立，程式已經由 API 上載及讀回核對，不用再手動貼上。雲端主程式放在原有的「程式碼.gs」，來源則是本資料夾的 `Code.gs`。

## 2. 初始化

老師可開啟正式 Web App 網址並加上 `?setup=1`，由老師設定頁執行初始化；如 Google 要求執行授權，須由部署老師本人確認。這個入口會核對登入者等於部署者，學生不能執行。亦可在 Apps Script 編輯器執行一次 `initialiseSchoolSync()`。程式會建立及格式化：

- `TeacherDashboard`：老師查看學生登入、有效學習時間、瀏覽、練習和課業完成情況；
- `Students`：班別、學號、中英文姓名、不可還原的帳戶代碼及一次性啟用碼；
- `Groups`、`GroupMembers`：基礎、標準、進階、選修或自訂小組；
- `Assignments`、`AssignmentTargets`、`AssignmentItems`、`AssignmentProgress`：課業、指派對象、要求及完成度；
- `ProgressLatest`、`TopicProgress`：目前摘要及課題表現；
- `LearningSessions`、`PageActivity`、`ExerciseAttempts`：登入時段、有效頁面停留和練習紀錄。

試算表不會記錄 IP、裝置資料、滑鼠軌跡、按鍵內容或完整短答答案。

## 3. 匯入學生名冊

在 `Students` 填寫：

| StudentId | Class | ClassNo | ChineseName | EnglishName | AccountKey | Status | ActivationCode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 留空 | 4A | 01 | 陳大文 | CHAN Tai Man | 留空 | ACTIVE | 留空 |

`ClassNo`應以文字輸入以保留前置零。完成後在老師設定頁按「名冊填妥後：產生啟用碼」，或在編輯器執行 `generateActivationCodes()`：

- 程式會補上穩定的 `StudentId`；
- 為尚未連接的學生產生八位一次性啟用碼；
- 學生首次以班別、學號和啟用碼連接後，啟用碼會自動清除。

## 4. 設定組別

`Groups` 的 `GroupType` 可使用：

- `LEVEL`：基礎、標準、進階；
- `ELECTIVE`：選修 A、B、C；
- `CUSTOM`：補課、測驗或其他臨時組別。

`GroupMembers.RecordKey` 建議使用 `StudentId|GroupId`。同一學生可加入多個組別。

## 5. 建立課業

1. 在 `Assignments` 建立課業，完成後把 `Status` 設為 `PUBLISHED`。
2. 在 `AssignmentTargets` 指定 `ALL`、`GROUP` 或 `STUDENT`。
3. 在 `AssignmentItems` 加入要求。

可用的 `RequirementType`：

| 類型 | `ResourceId` | `TargetValue`／`MinimumPercentage` |
| --- | --- | --- |
| `VISIT_PAGE` | 課題 ID | 最少開啟次數 |
| `ACTIVE_MINUTES` | 課題 ID；留空代表全部頁面 | 有效分鐘 |
| `PRACTICE_ATTEMPTS` | 課題 ID | 作答次數 |
| `MIN_ACCURACY` | 課題 ID | `MinimumPercentage` |
| `COMPLETE_LAYER` | 課題 ID | 完成分層數目 |
| `COMPLETE_GAME` | 課題 ID | 完成遊戲次數 |
| `MOCK_ATTEMPT` | 模式 ID；可留空 | 模擬考次數 |

`DirectUrl` 只接受本站相對網址或 `https://kenkmc.github.io/hkdse_ict/` 下的網址。

## 6. 設定指令碼屬性

`initialiseSchoolSync()` 會先寫入本校預設值；日後搬站或轉校時，才需要在「專案設定 → 指令碼屬性」修改：

| 名稱 | 示例 | 說明 |
| --- | --- | --- |
| `SCHOOL_DOMAIN` | `jcmkec.edu.hk` | 不要包含 `@` |
| `SITE_PROGRESS_URL` | `https://kenkmc.github.io/hkdse_ict/progress.html` | 固定返回頁面 |
| `TOKEN_TTL_SECONDS` | `18000` | 選填；預設五小時，最大六小時 |

`SHEET_ID`及`ACCOUNT_KEY_SECRET`由初始化函數自動建立。不要把它們放入 GitHub。

## 7. 部署 Web App

1. 選擇「部署 → 新增部署 → 網頁應用程式」。
2. 執行身分選擇部署者。
3. 存取權選擇校方網域內的使用者。
4. 複製以 `/exec` 結尾的正式網址；不要使用只供編輯者測試的 `/dev` 網址。
5. 使用學生帳戶測試首次啟用及重新登入。
6. 使用私人 Gmail 或未登入視窗測試，確認不能進入。

Google Workspace 可能提供 `https://script.google.com/a/macros/校園網域/s/部署ID/exec`；本站亦支援這個正式網址，應保留 API／部署畫面提供的網址。

## 8. 啟用網站端

修改網站根目錄 `school_sync_config.js`：

```js
window.HKDSE_SCHOOL_SYNC_CONFIG = Object.freeze({
    enabled: true,
    schoolName: "賽馬會萬鈞毅智書院",
    webAppUrl: "https://script.google.com/macros/s/正式部署ID/exec",
    connectionHours: 5
});
```

提交並推送到 GitHub Pages 後，學生便可在「我的學習」連接、查看指定課業及手動同步。

## 9. 驗收

- 校園帳戶可開啟，私人帳戶不可開啟；
- 學生首次連接後，`Students.AccountKey`有值、`ActivationCode`已清除、試算表沒有校園電郵；
- 學生只看見自己及所屬組別的已發布課業；
- 切換分頁或閒置超過兩分鐘後不再累計有效學習時間；
- 同一登入時段和同一頁面的紀錄會更新，不會因心跳重複新增；
- 同步後活動表、課題進度、課業進度及 `TeacherDashboard` 均更新；
- 連接碼過期後必須重新登入；
- 老師以外的人不能開啟試算表。
- 共用瀏覽器連接不同學生時會拒絕切換，須先自行匯出備份，再清除本機紀錄；清除紀錄亦會清除該瀏覽器的校園連接及學生顯示資料。

## 10. 日後直接上載及回復

可用 Google 的 `clasp` 或 Apps Script API 管理程式，不需要透過瀏覽器逐行編輯。管理用 OAuth 授權與 Apps Script 執行時的試算表授權是兩回事；首次初始化的 Google 權限確認仍須由老師完成。

上載前必須下載整個遠端專案及部署資料作本機備份。`projects.updateContent` 會取代整個專案檔案集合，不能只傳一個檔案而忽略其他原稿。本次已備份原有空白「程式碼」檔案，並以主程式取代；第 1 版曾使用的 `Code` 檔案已合併移除，避免重複函數。

Web App 執行時沒有試算表編輯器的 active container。本機 `DeploymentConfig.gs` 保存綁定試算表 ID，只上載到校方 Script，Git 已忽略它；沒有此檔案時須先由試算表編輯器執行初始化。重複初始化會保留既有組別、課業核取值及帳戶密鑰。

本機 `.clasp.json`、OAuth 憑證及 `.local-school-sync/` 已被 Git 忽略。不要把 OAuth 憑證、學生資料或 `ACCOUNT_KEY_SECRET` 放到 GitHub。

## 限制

學習時間代表「頁面在前景而且學生最近曾操作」的時間，不能證明學生一直專心。分數由學生瀏覽器產生，適合形成性評估及跟進，不應直接當成正式校內考試成績。關閉分頁提示亦不能代替成功同步；學生必須按同步按鈕並看到成功頁面。
