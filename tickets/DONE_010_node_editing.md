# 010: ノード編集（ドラッグ移動・途中挿入・削除）

## 種別
機能実装

## 概要
既存パスのノードをドラッグで移動、エッジ上クリックでノード挿入、ノードの削除を実装する。

## 参照すべき設計書
- `docs/REQUIREMENTS.md` — F10「ノードの編集」
- `docs/UI_DESIGN.md` — §3「Canvas上の描画仕様」（ノードのホバー/ドラッグ状態）、§8「カーソル」
- `docs/ARCHITECTURE.md` — §2.2 usePathStore（moveNode, insertNodeAfter, removeNode）

## 作業内容

### 1. NodeCircle のドラッグ対応
`src/components/Canvas/NodeCircle.tsx` を修正:
- drawMode が "idle" のときのみドラッグ可能（描画中はドラッグ不可）
- Konva の `draggable` prop を使用
- `onDragMove` で `usePathStore.moveNode()` を呼び、距離をリアルタイム更新
- ホバー時: 半径を大きく（8px）、カーソルを `grab` に
- ドラッグ中: カーソルを `grabbing`、ストローク幅を太く（3px）

### 2. EdgeLine のクリックでノード挿入
`src/components/Canvas/EdgeLine.tsx` を修正:
- drawMode が "idle" のときのみクリック可能
- `hitStrokeWidth` を 20px に設定（太めの当たり判定）
- クリック時、クリック位置の画像座標で `usePathStore.insertNodeAfter()` を呼ぶ
  - 挿入位置: エッジの `fromNode` の直後
- ホバー時: エッジを太く（4px）、色を明るく、カーソルを `copy`

### 3. ノード削除
- ノードを右クリックで削除（コンテキストメニュー表示ではなく直接削除）
- または、ノード選択中に Delete/Backspace キーで削除（ticket-011 のキーボードショートカットで対応予定）
- この時点では右クリック削除のみ実装
- パスのノードが0になったらパス自体を削除するかは任意（残しても問題ない）

### 4. 描画モードとの共存
- drawMode === "drawing" のとき: ノードのドラッグ無効、エッジクリック無効（クリックは新しいノード追加に使われるため）
- drawMode === "idle" のとき: ノードのドラッグ有効、エッジクリック有効

## 完了条件
1. idle モードでノードをドラッグして移動でき、距離がリアルタイムに更新される
2. idle モードでエッジ上をクリックすると、そこにノードが挿入される
3. ノードを右クリックで削除できる
4. drawing モード中はドラッグ・エッジクリック・右クリック削除が無効
5. ノードホバー時にカーソルが `grab` に変わる
6. `npm run build` がエラーなく通る
7. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-010: node editing`
