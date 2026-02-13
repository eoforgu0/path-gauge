# 011: キーボードショートカット

## 種別
機能実装

## 概要
キーボードショートカットを実装する。

## 参照すべき設計書
- `docs/UI_DESIGN.md` — §7「キーボードショートカット」
- `docs/REQUIREMENTS.md` — F6「Undo」

## 作業内容

### 1. useKeyboardShortcuts フック
`src/hooks/useKeyboardShortcuts.ts` を作成:
- `Ctrl+Z` / `⌘+Z`: drawMode === "drawing" のとき、`undoLastNode(activePathId)`
- `Escape`: drawMode === "drawing" のとき、描画をキャンセル（`setDrawMode("idle")`）。ノードが0のパスは削除する
- `Delete` / `Backspace`: 将来用（ノード選択状態での削除。現時点では右クリック削除があるので空実装でもよい）

### 2. Shift キー状態の追跡
- `keydown` / `keyup` イベントで `useCanvasStore.setShiftPressed()` を更新
- スナップ機能（ticket-012）で使用するための準備

### 3. App.tsx でフックを呼び出し
- `useKeyboardShortcuts()` を App コンポーネント内で呼ぶ

## 完了条件
1. 描画中に Ctrl+Z / ⌘+Z で最後のノードが取り消される
2. 描画中に Escape で描画がキャンセルされる
3. Shift キーの状態が `useCanvasStore.shiftPressed` に反映される
4. テキスト入力中（input, textarea にフォーカス中）はショートカットが発火しない
5. `npm run build` がエラーなく通る
6. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-011: keyboard shortcuts`
