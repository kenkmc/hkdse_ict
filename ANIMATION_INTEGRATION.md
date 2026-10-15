# 動畫教材與現行主站的整合

2026-10-15，PR #1 已合併至 `main`（合併提交 `e4658c08ade94ba7582e313cb432b818284a8e37`）。GitHub Pages 當時由 `feat/phase-1-platform-foundation` 的 `204f3eb` 發布，該分支另有30個平台更新提交。因此本次以現行發布分支為基礎接入動畫，保留題庫、學習進度、Google登入及教師管理。

## 發布內容

- 首頁增加顯眼的動畫入口，全站導覽增加「逐步動畫」。
- `animations/` 保存 PR #1 的42課、129組講解及四個互動模型，並增加返回主站、題庫及進度的導覽。
- `assets/js/animation-bridge.js` 按現行26個課程頁、三個工具及SBA的分課方式，映射全部35個新課與既有講解。在30個主站頁面共載入129組講解及四個可調模型。
- 重點課題使用可展開區塊；原有課頁維持原永久ID、題庫、學習助手、課業與進度儲存介面。獨立動畫目錄保留自身課程資料，避免混用兩種目錄格式。
- 原有A1–5、協定、SQL、PKI及Python工具同步整合已驗證的正確性與時序修正，保留現行平台的腳本及樣式。
- 沒有更改 Apps Script、登入設定、同步服務、試題資料或原課程目錄ID。動畫獨立頁的選擇題提供即時回饋；正式作答及進度仍使用原主站功能。

## 驗證

全部12個 `scripts/validate_*.js` 通過，包括目錄、463題、學習提示、七個遊戲、模擬考、學習進度、Google登入、校園同步、教師管理、錯題及版面檢查。動畫資料與四個行為測試亦通過：

```sh
node animations/tests/verify.cjs
node animations/tests/core-a.cjs
node animations/tests/network-tools.cjs
node animations/tests/interactive-models.cjs
```

瀏覽器逐一檢查30個主站動畫頁：129組講解、四個模型及原有導覽均出現。實測主站算法課的展開與單步操作（1/3→2/3）、永久課題ID `chd-2`、動畫目錄42張課題卡與返回主站導覽。此前已驗證PR中的42課及補碼、排序、取樣、SQL與Python實際結果；詳見 `animations/docs/VALIDATION.md`。

`animations/docs/CURRICULUM_REVIEW.md` 的「原有」描述以PR #1最初的 `46444c8` 為基線，不是對現行平台已完成內容的重新判定。動畫是輔助理解，仍需配合軟件、網絡裝設與編程實作。

## 回復

這次整合是發布分支的一個可回復提交。需要撤回時應回復本整合提交；保留此前30個平台更新及主站原有服務。請勿直接把Pages來源改至只含PR #1的舊平台版本。
