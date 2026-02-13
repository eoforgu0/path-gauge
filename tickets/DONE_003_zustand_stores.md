# 003: Zustand ストア

## 種別
機能実装

## 概要
パスデータとキャンバス状態を管理する2つの Zustand ストアを作成する。
UIはまだ作らない。ストアのインターフェースと実装のみ。

## 参照すべき設計書
- `docs/ARCHITECTURE.md` — §2「Zustand ストア設計」全体

## 作業内容

### 1. usePathStore
`src/stores/usePathStore.ts` を作成。`docs/ARCHITECTURE.md` §2.2 のインターフェースに従い実装:

- 状態: `paths`, `activePathId`, `unitConfig`, `pathCounter`
- アクション:
  - `addPath()`: 新規パス作成。色は `getPathColor(pathCounter)` で自動割当。名前は `Path ${pathCounter + 1}`。IDを返す
  - `removePath(pathId)`: パス削除。activePathId が削除対象なら null にする
  - `clearAllPaths()`: 全パス削除。activePathId も null に
  - `setActivePathId(pathId | null)`
  - `updatePathName(pathId, name)`
  - `updatePathColor(pathId, color)`
  - `addNode(pathId, point)`: ノードを末尾に追加。ID は `generateId()`
  - `removeNode(pathId, nodeId)`
  - `moveNode(pathId, nodeId, point)`: ノード座標を更新
  - `insertNodeAfter(pathId, afterNodeId, point)`: 指定ノードの直後に挿入
  - `undoLastNode(pathId)`: 末尾ノードを削除
  - `setUnitConfig(config | null)`

### 2. useCanvasStore
`src/stores/useCanvasStore.ts` を作成。`docs/ARCHITECTURE.md` §2.3 のインターフェースに従い実装:

- 状態: `imageUrl`, `imageSize`, `scale`（初期値1.0）, `position`（初期値{x:0,y:0}）, `drawMode`（初期値"idle"）, `cursorPosition`, `snapState`, `shiftPressed`
- アクション:
  - `loadImage(url, width, height)`: 画像情報をセット
  - `clearImage()`: 画像をクリア
  - `setScale(scale)`: 0.1〜10.0 にクランプ
  - `setPosition(position)`
  - `resetView()`: scale=1.0, position={x:0,y:0} にリセット（Fit to screen の計算は Canvas コンポーネント側で行うため、ストアでは単純リセット）
  - `setDrawMode(mode)`
  - `setCursorPosition(point | null)`
  - `setSnapState(state)`
  - `setShiftPressed(pressed)`

### 3. セレクタ
`src/stores/selectors.ts` を作成。`docs/ARCHITECTURE.md` §2.4 に記載:
- `useAllPathMetrics(): PathMetrics[]`
- `usePathMetrics(pathId): PathMetrics | null`

ただし、`calcPathMetrics` と `formatDistance` は `src/utils/distance.ts` に既にあるのでそれを利用する。

## 完了条件
1. `npm run build` がエラーなく通る
2. `npm run lint` がエラーなく通る
3. `usePathStore`, `useCanvasStore` が正しくエクスポートされている
4. `selectors.ts` が正しくエクスポートされている

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-003: zustand stores`
