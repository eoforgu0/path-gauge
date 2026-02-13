# 012: スナップ機能

## 種別
機能実装

## 概要
Shift キーを押しながらノードを配置/ドラッグすると、水平・垂直方向にスナップする機能を実装する。
スナップ時にはガイドラインとゴーストノードを表示する。

## 参照すべき設計書
- `docs/ARCHITECTURE.md` — §4「スナップロジック」
- `docs/UI_DESIGN.md` — §3.5「スナップ」（ガイドライン、ゴーストの見た目）
- `docs/REQUIREMENTS.md` — F9「スナップ」

## 前提
- ticket-011 で Shift キーの状態追跡が実装済み（`useCanvasStore.shiftPressed`）
- `src/utils/snap.ts` に `snapToNode`, `snapDragToNeighbors` が実装済み

## 作業内容

### 1. 描画中のスナップ
MapCanvas（またはCanvasEventHandler）のクリックハンドラを修正:
- `shiftPressed === true` かつアクティブパスのノードが1つ以上あるとき
- クリック位置を `snapToNode(cursor, lastNode, scale)` に通す
- スナップ結果の座標で `addNode()` を呼ぶ

### 2. 描画中のリアルタイムプレビュー
マウス移動時にもスナップ計算を行い、`useCanvasStore.setSnapState()` を更新:
- `shiftPressed === true` のとき、毎フレームのマウス位置に対して `snapToNode()` を計算
- 結果を `snapState` に反映（active, snappedPoint, guideLines）
- `shiftPressed === false` のときは `snapState` をリセット

### 3. ドラッグ中のスナップ
NodeCircle のドラッグハンドラを修正:
- `shiftPressed === true` のとき
- ドラッグ中のノードの前後ノードを取得
- `snapDragToNeighbors(cursor, prevNode, nextNode, scale)` でスナップ計算
- スナップ結果の座標で `moveNode()` を呼ぶ
- `snapState` を更新

### 4. SnapGuideLines コンポーネント
`src/components/Canvas/SnapGuideLines.tsx` を作成:
- `useCanvasStore.snapState.guideLines` を描画
- react-konva の `<Line>` で破線表示
- 色: `--color-snap-guide`（`#6366f1`）
- strokeWidth: `1 / scale`
- dash: `[6 / scale, 4 / scale]`
- 画像の端から端まで伸びるガイドライン（from/to を画像境界まで延長）

### 5. SnapGhost コンポーネント
`src/components/Canvas/SnapGhost.tsx` を作成:
- `useCanvasStore.snapState.snappedPoint` が存在するとき、ゴーストノードを描画
- react-konva の `<Circle>` で半透明表示
- 色: `--color-snap-ghost`（`#6366f180`）
- radius: `6 / scale`
- `listening={false}`

### 6. PreviewLine のスナップ対応
PreviewLine コンポーネントを修正:
- `snapState.active === true` のとき、プレビュー線の終点を `snapState.snappedPoint` に変更

### 7. Layer への追加
MapCanvas の Layer 内に SnapGuideLines と SnapGhost を追加（PathRenderer の後、最前面に配置）

## 完了条件
1. 描画中に Shift を押しながらマウスを動かすと、直前のノードに対して水平/垂直のガイドラインが表示される
2. Shift + クリックでスナップされた座標にノードが配置される
3. Shift を押さないときはスナップが無効
4. ドラッグ中に Shift を押すと、前後ノードに対してスナップが効く
5. ガイドラインとゴーストノードが視覚的に表示される
6. プレビュー線がスナップ先に向かう
7. `npm run build` がエラーなく通る
8. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-012: snap feature`
