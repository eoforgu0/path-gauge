# 006: Konva Stage での画像表示 + ズーム/パン

## 種別
機能実装

## 概要
読み込んだ画像を Konva Stage 上に表示し、マウスホイールでのズームと中ボタンドラッグでのパンを実装する。

## 参照すべき設計書
- `docs/ARCHITECTURE.md` — §5「ズーム/パン設計」、§3.1 コンポーネント階層（MapCanvas, BackgroundImage）
- `docs/UI_DESIGN.md` — §8「カーソル」、§6「ステータスバー」
- `docs/REQUIREMENTS.md` — F8「画像のズーム・パン」

## 作業内容

### 1. MapCanvas を Konva Stage に置き換え
`src/components/Canvas/MapCanvas.tsx` を修正:
- `imageUrl !== null` のとき、react-konva の `<Stage>` + `<Layer>` をレンダリング
- Stage のサイズは親要素のサイズに追従させる（`ResizeObserver` または `useEffect` + ref で親の clientWidth/Height を取得）
- Stage の `scaleX`, `scaleY` を `useCanvasStore` の `scale` にバインド
- Stage の `x`, `y` を `useCanvasStore` の `position` にバインド

### 2. BackgroundImage コンポーネント
`src/components/Canvas/BackgroundImage.tsx` を作成:
- react-konva の `<Image>` を使って読み込んだ画像を描画
- `useCanvasStore` から `imageUrl` と `imageSize` を取得
- `useImage` フック（react-konva 提供、または自前で `HTMLImageElement` を管理）で画像をロード
- `listening={false}` を設定（マウスイベントを受け取らない）

### 3. ズーム
- Stage の `onWheel` イベントでズーム
- ズーム中心: マウスカーソル位置（`evt.evt.offsetX/Y` からStage座標に変換）
- ズーム倍率: ホイール1ノッチで ×1.1 or ÷1.1
- `useCanvasStore.setScale()` で更新（0.1〜10.0 にクランプ済み）
- ズーム時の Position 補正: カーソル位置を中心にズームするため、Position も同時に更新する
  - 計算: `newPos = cursorPos - (cursorPos - oldPos) * (newScale / oldScale)`

### 4. パン
- 中ボタン（button === 1）ドラッグでパン
- `onMouseDown`（中ボタン）でパン開始、`onMouseMove` で移動、`onMouseUp` でパン終了
- パン中のカーソルは `move`（CSS cursor）
- Stage の `draggable` は使わない（描画モードとの干渉を避けるため、手動で position を更新）

### 5. Fit to Screen
- `useCanvasStore.resetView()` を拡張（または MapCanvas 内のローカル関数として実装）:
  - 画像全体がキャンバス領域に収まるスケールを計算
  - 上下左右に 20px マージン
  - `scale = Math.min((canvasWidth - 40) / imageWidth, (canvasHeight - 40) / imageHeight)`
  - Position は画像が中央に来るように計算
- 画像読み込み直後に自動で Fit to Screen を実行
- ツールバーの「ズームリセット」ボタンでも実行

### 6. ステータスバーの更新
`src/components/StatusBar/StatusBar.tsx` を修正:
- マウスカーソルの画像上座標を表示（Stage のポインタ位置から逆変換）
- ズーム率を %表示
- Stage 上の `onMouseMove` で `useCanvasStore.setCursorPosition()` を更新

### 7. ツールバーの「ズームリセット」ボタン
`src/components/Toolbar/Toolbar.tsx` に追加:
- 画像読込済みのとき有効
- クリックで Fit to Screen を実行

## 完了条件
1. 画像読み込み後、Konva Stage 上に画像が表示される
2. 画像読み込み直後に自動で Fit to Screen される（画像全体が見える）
3. マウスホイールでカーソル位置を中心にズームイン/ズームアウトできる
4. 中ボタンドラッグで画像をパンできる
5. ズームリセットボタンで Fit to Screen に戻る
6. ステータスバーにカーソル座標（画像上のピクセル座標）とズーム率が表示される
7. `npm run build` がエラーなく通る
8. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-006: konva stage with zoom and pan`
