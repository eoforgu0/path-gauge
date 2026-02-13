# 008: パス描画（基本機能）

## 種別
機能実装

## 概要
画像上にクリックでノードを打ち、直線で結んでパスを描画する基本機能を実装する。
「新規パス」ボタン→クリックでノード配置→ダブルクリックまたは確定ボタンで描画完了、のフロー。

## 参照すべき設計書
- `docs/REQUIREMENTS.md` — F2「パスの描画」、F3「複数パスの管理」、F4「距離の表示」
- `docs/ARCHITECTURE.md` — §2「Zustand ストア設計」、§3「コンポーネント階層」（PathRenderer, EdgeLine, NodeCircle, PreviewLine）
- `docs/UI_DESIGN.md` — §3「Canvas上の描画仕様」（ノード、エッジ、エッジ距離ラベルの見た目）、§4「ツールバー」（ボタン状態）、§8「カーソル」

## 作業内容

### 1. ツールバーのボタン実装
`src/components/Toolbar/Toolbar.tsx` を拡張:
- **新規パス** ボタン: `usePathStore.addPath()` → `useCanvasStore.setDrawMode("drawing")` → `setActivePathId(新ID)`
  - 有効条件: 画像読込済み & drawMode === "idle"
- **確定** ボタン: `useCanvasStore.setDrawMode("idle")`
  - 有効条件: drawMode === "drawing" & アクティブパスのノード数 >= 2
- **Undo** ボタン: `usePathStore.undoLastNode(activePathId)`
  - 有効条件: drawMode === "drawing" & アクティブパスのノード数 >= 1
- **全クリア** ボタン: `usePathStore.clearAllPaths()` → `useCanvasStore.setDrawMode("idle")`
  - 有効条件: パスが1本以上ある
- ボタンの有効/無効を状態に応じて切り替えること（disabled 属性 + 見た目の変化）

### 2. Canvas上のクリックでノード追加
`MapCanvas.tsx`（または新しい `CanvasEventHandler` ）で:
- drawMode === "drawing" のとき、Stage上の左クリックでノードを追加
  - クリック位置を画像座標に変換してから `usePathStore.addNode(activePathId, point)` を呼ぶ
  - 座標変換: `imageX = (pointerX - position.x) / scale`
- drawMode === "drawing" のとき、ダブルクリックで描画完了（`setDrawMode("idle")`）
  - ダブルクリック時、2回目のクリックでノードが追加されないよう注意
- drawMode === "drawing" のとき、カーソルを `crosshair` にする

### 3. PathRenderer コンポーネント
`src/components/Canvas/PathRenderer.tsx` を作成:
- props: `path: Path`
- パスの全エッジを `<Line>` で描画（`docs/UI_DESIGN.md` §3.2 の通常状態）
- パスの全ノードを `<Circle>` で描画（`docs/UI_DESIGN.md` §3.1 の通常状態）
- ノードとエッジはズームレベルに関わらず画面上のサイズを一定に保つ（`1 / scale` で補正）

### 4. EdgeLine コンポーネント
`src/components/Canvas/EdgeLine.tsx` を作成:
- props: fromNode, toNode, color, scale
- react-konva `<Line>` で描画
- strokeWidth: `3 / scale`（画面上3px固定）

### 5. NodeCircle コンポーネント
`src/components/Canvas/NodeCircle.tsx` を作成:
- props: node, color, scale
- react-konva `<Circle>` で描画
- radius: `6 / scale`, strokeWidth: `2 / scale`
- この時点ではドラッグは不要（ticket-010 で実装）

### 6. EdgeLabel コンポーネント
`src/components/Canvas/EdgeLabel.tsx` を作成:
- props: fromNode, toNode, color, scale, unitConfig
- エッジの中点付近に距離を表示
- `docs/UI_DESIGN.md` §3.3 の仕様に従う
- react-konva の `<Group>` + `<Rect>`（背景） + `<Text>`（距離値）
- フォントサイズ: `11 / scale`（画面上11px固定）
- 位置: エッジの中点から法線方向に `12 / scale` オフセット

### 7. PreviewLine コンポーネント
`src/components/Canvas/PreviewLine.tsx` を作成:
- drawMode === "drawing" のとき、アクティブパスの最後のノードからマウスカーソル位置まで破線を描画
- `docs/UI_DESIGN.md` §3.2 の「描画中のプレビュー線」スタイル
- カーソル位置は `useCanvasStore.cursorPosition` から取得

### 8. サイドパネルのパスリスト
`src/components/SidePanel/PathList.tsx` と `PathListItem.tsx` を作成:
- 各パスの色インジケータ（●）、名前、距離を表示
- 距離は `formatDistance()` を使って表示
- アクティブパスをハイライト（背景色やボーダーで強調）
- この時点では名前変更・色変更・削除は不要（後のチケットで実装）

### 9. Layer構成
MapCanvas の Layer 内に PathRenderer と PreviewLine を配置:
```
<Layer>
  <BackgroundImage />
  {paths.map(path => <PathRenderer key={path.id} path={path} />)}
  <PreviewLine />
</Layer>
```

## 完了条件
1. 「新規パス」→ キャンバスクリックでノードが打たれ、線で結ばれる
2. 描画中、最後のノードからカーソルまでプレビュー線（破線）が表示される
3. ダブルクリックまたは「確定」ボタンで描画が完了する
4. 描画完了後、パスリストにパス名と距離が表示される
5. 複数パスを作成でき、それぞれ異なる色で表示される
6. 各エッジの中点付近に距離ラベルが表示される
7. 「Undo」で最後のノードを取り消せる
8. 「全クリア」で全パスが削除される
9. ズーム/パンしてもノード・エッジ・ラベルの画面上のサイズが一定
10. 描画中はカーソルが crosshair になる
11. `npm run build` がエラーなく通る
12. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-008: path drawing`
