# アーキテクチャ設計

---

## 1. 型定義

### 1.1 基本型

```typescript
// types/index.ts

/** 2D座標（画像上のピクセル座標） */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** パス内のノード */
export interface PathNode {
  readonly id: string;       // UUID
  readonly x: number;
  readonly y: number;
}

/** パス */
export interface Path {
  readonly id: string;       // UUID
  readonly name: string;     // 表示名（"Path 1" 等）
  readonly color: string;    // hex カラーコード
  readonly nodes: readonly PathNode[];
}

/** 単位設定 */
export interface UnitConfig {
  readonly scale: number;    // 1px あたりの実距離値（例: 0.5 → 1px = 0.5m）
  readonly label: string;    // 単位表記（例: "m", "km"）
}

/** テンプレート画像の定義（manifest.json の1エントリ） */
export interface TemplateEntry {
  readonly file: string;     // ファイル名
  readonly name: string;     // 表示名
  readonly unit?: UnitConfig; // 単位プリセット（省略可）
}

/** テンプレートマニフェスト */
export interface TemplateManifest {
  readonly templates: readonly TemplateEntry[];
}

/** 描画モード */
export type DrawMode =
  | "idle"       // 何もしていない
  | "drawing"    // パス描画中
  | "editing";   // ノード編集中（ドラッグ等）

/** スナップ状態 */
export interface SnapState {
  readonly active: boolean;           // スナップが効いているか
  readonly snappedPoint: Point | null; // スナップ後の座標
  readonly guideLines: readonly SnapGuideLine[]; // 表示するガイドライン
}

/** スナップガイドライン */
export interface SnapGuideLine {
  readonly from: Point;
  readonly to: Point;
  readonly axis: "horizontal" | "vertical";
}
```

### 1.2 計算結果型

```typescript
// types/index.ts（続き）

/** エッジ（線分）の計算結果 */
export interface EdgeInfo {
  readonly fromNode: PathNode;
  readonly toNode: PathNode;
  readonly distance: number;      // ピクセル距離
  readonly midPoint: Point;       // 中点（ラベル表示位置）
}

/** パスの計算結果 */
export interface PathMetrics {
  readonly pathId: string;
  readonly totalDistance: number;  // 合計ピクセル距離
  readonly edges: readonly EdgeInfo[];
}
```

---

## 2. Zustand ストア設計

### 2.1 ストア分割方針

状態を2つのストアに分割する。更新頻度と関心の分離が目的。

| ストア | 責務 | 更新頻度 |
|--------|------|----------|
| `usePathStore` | パスデータ、単位設定 | ノード追加/移動/削除時 |
| `useCanvasStore` | ズーム/パン、描画モード、画像、スナップ状態 | マウス操作のたび（高頻度） |

### 2.2 usePathStore

```typescript
// stores/usePathStore.ts

interface PathState {
  // --- 状態 ---
  paths: Path[];
  activePathId: string | null;   // 現在描画中/選択中のパスID
  unitConfig: UnitConfig | null; // null = ピクセル表示
  pathCounter: number;           // パス名の連番管理

  // --- アクション: パス管理 ---
  addPath: () => string;                          // 新規パス作成、IDを返す
  removePath: (pathId: string) => void;
  clearAllPaths: () => void;
  setActivePathId: (pathId: string | null) => void;
  updatePathName: (pathId: string, name: string) => void;
  updatePathColor: (pathId: string, color: string) => void;

  // --- アクション: ノード操作 ---
  addNode: (pathId: string, point: Point) => void;
  removeNode: (pathId: string, nodeId: string) => void;
  moveNode: (pathId: string, nodeId: string, point: Point) => void;
  insertNodeAfter: (pathId: string, afterNodeId: string, point: Point) => void;
  undoLastNode: (pathId: string) => void;

  // --- アクション: 単位設定 ---
  setUnitConfig: (config: UnitConfig | null) => void;
}
```

### 2.3 useCanvasStore

```typescript
// stores/useCanvasStore.ts

interface CanvasState {
  // --- 状態: 画像 ---
  imageUrl: string | null;           // 読み込んだ画像のObject URL or テンプレートURL
  imageSize: { width: number; height: number } | null;

  // --- 状態: ビューポート ---
  scale: number;                     // ズーム倍率（1.0 = 100%）
  position: Point;                   // パン位置（Stage の x, y）

  // --- 状態: 描画モード ---
  drawMode: DrawMode;
  cursorPosition: Point | null;      // マウスの画像上座標

  // --- 状態: スナップ ---
  snapState: SnapState;
  shiftPressed: boolean;             // Shift キーの押下状態

  // --- アクション: 画像 ---
  loadImage: (url: string, width: number, height: number) => void;
  clearImage: () => void;

  // --- アクション: ビューポート ---
  setScale: (scale: number) => void;
  setPosition: (position: Point) => void;
  resetView: () => void;             // Fit to screen

  // --- アクション: 描画モード ---
  setDrawMode: (mode: DrawMode) => void;
  setCursorPosition: (point: Point | null) => void;

  // --- アクション: スナップ ---
  setSnapState: (state: SnapState) => void;
  setShiftPressed: (pressed: boolean) => void;
}
```

### 2.4 セレクタ（派生データ）

距離計算などの派生データはセレクタとして定義し、コンポーネント側で利用する。

```typescript
// stores/selectors.ts

import { usePathStore } from "./usePathStore";
import type { PathMetrics, EdgeInfo, Point } from "@/types";

/** 2点間のピクセル距離 */
function pixelDistance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** パスの距離メトリクスを計算 */
function calcPathMetrics(path: Path): PathMetrics {
  const edges: EdgeInfo[] = [];
  for (let i = 0; i < path.nodes.length - 1; i++) {
    const from = path.nodes[i]!;
    const to = path.nodes[i + 1]!;
    const dist = pixelDistance(from, to);
    edges.push({
      fromNode: from,
      toNode: to,
      distance: dist,
      midPoint: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
    });
  }
  return {
    pathId: path.id,
    totalDistance: edges.reduce((sum, e) => sum + e.distance, 0),
    edges,
  };
}

/** 全パスのメトリクスを取得するセレクタ */
export function useAllPathMetrics(): PathMetrics[] {
  return usePathStore((state) => state.paths.map(calcPathMetrics));
}

/** 特定パスのメトリクスを取得するセレクタ */
export function usePathMetrics(pathId: string): PathMetrics | null {
  return usePathStore((state) => {
    const path = state.paths.find((p) => p.id === pathId);
    return path ? calcPathMetrics(path) : null;
  });
}

/** 距離を表示用文字列に変換 */
export function formatDistance(px: number, unit: UnitConfig | null): string {
  if (unit && unit.scale > 0) {
    return `${(px * unit.scale).toFixed(1)}${unit.label}`;
  }
  return `${Math.round(px)}px`;
}
```

---

## 3. コンポーネント階層

### 3.1 全体構造

```
App
├── Toolbar
│   ├── ImageLoadButton
│   ├── NewPathButton
│   ├── ConfirmButton
│   ├── UndoButton
│   ├── ClearAllButton
│   ├── ZoomResetButton
│   └── PanelToggleButton
├── MainArea
│   ├── CanvasArea
│   │   ├── ImageDropZone          （画像未読込時のみ表示）
│   │   │   └── TemplateSelector
│   │   └── MapCanvas              （画像読込後に表示）
│   │       ├── [Konva Stage]
│   │       │   └── [Layer]
│   │       │       ├── BackgroundImage
│   │       │       ├── PathRenderer      （パスごとに1つ）
│   │       │       │   ├── EdgeLine      （エッジごとに1つ）
│   │       │       │   ├── EdgeLabel     （エッジ距離ラベル）
│   │       │       │   └── NodeCircle    （ノードごとに1つ）
│   │       │       ├── PreviewLine       （描画中のプレビュー）
│   │       │       ├── SnapGhost         （スナップゴースト表示）
│   │       │       └── SnapGuideLines    （スナップガイドライン）
│   │       └── CanvasEventHandler        （ズーム/パン/クリックの統合制御）
│   └── SidePanel
│       ├── PanelToggle
│       ├── PathList
│       │   └── PathListItem       （パスごとに1つ）
│       │       ├── ColorIndicator
│       │       ├── PathNameEditor
│       │       ├── DistanceDisplay
│       │       └── DeleteButton
│       ├── NewPathButton
│       └── UnitSettings
└── StatusBar
    ├── CursorCoords
    └── ZoomLevel
```

### 3.2 各コンポーネントの責務

| コンポーネント | 責務 | 参照するストア |
|--------------|------|-------------|
| `App` | レイアウトの組み立て | — |
| `Toolbar` | ボタン群の配置、状態に応じた有効/無効制御 | `useCanvasStore`, `usePathStore` |
| `ImageDropZone` | D&D/ファイル選択/テンプレート選択 | `useCanvasStore` |
| `MapCanvas` | Konva Stage の管理、ズーム/パン制御 | `useCanvasStore` |
| `PathRenderer` | 1つのパスの描画（エッジ + ノード + ラベル） | `usePathStore` |
| `EdgeLine` | 1本の線分の描画。クリックでノード挿入 | `usePathStore` |
| `EdgeLabel` | エッジの距離ラベル表示 | `usePathStore` |
| `NodeCircle` | 1つのノード。ドラッグ移動対応 | `usePathStore`, `useCanvasStore` |
| `PreviewLine` | 描画中の最終ノード→カーソル間のプレビュー線 | `useCanvasStore`, `usePathStore` |
| `SnapGhost` | スナップ時のゴーストノード表示 | `useCanvasStore` |
| `SnapGuideLines` | スナップガイドライン表示 | `useCanvasStore` |
| `SidePanel` | 右サイドパネルの折りたたみ制御 | — |
| `PathList` | パス一覧の表示 | `usePathStore` |
| `PathListItem` | 1つのパスの情報表示・編集 | `usePathStore` |
| `UnitSettings` | 倍率/単位の入力 | `usePathStore` |
| `StatusBar` | カーソル座標とズーム率の表示 | `useCanvasStore` |

### 3.3 ディレクトリ対応

```
src/
├── components/
│   ├── Canvas/
│   │   ├── MapCanvas.tsx
│   │   ├── BackgroundImage.tsx
│   │   ├── PathRenderer.tsx
│   │   ├── EdgeLine.tsx
│   │   ├── EdgeLabel.tsx
│   │   ├── NodeCircle.tsx
│   │   ├── PreviewLine.tsx
│   │   ├── SnapGhost.tsx
│   │   ├── SnapGuideLines.tsx
│   │   └── CanvasEventHandler.tsx
│   ├── ImageLoader/
│   │   ├── ImageDropZone.tsx
│   │   └── TemplateSelector.tsx
│   ├── Toolbar/
│   │   └── Toolbar.tsx
│   ├── SidePanel/
│   │   ├── SidePanel.tsx
│   │   ├── PathList.tsx
│   │   ├── PathListItem.tsx
│   │   └── UnitSettings.tsx
│   └── StatusBar/
│       └── StatusBar.tsx
├── stores/
│   ├── usePathStore.ts
│   ├── useCanvasStore.ts
│   └── selectors.ts
├── types/
│   └── index.ts
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   └── useSnapCalculation.ts
├── utils/
│   ├── distance.ts
│   ├── snap.ts
│   └── id.ts
├── constants/
│   └── colors.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 4. スナップロジック

### 4.1 スナップ判定

```typescript
// utils/snap.ts

const SNAP_THRESHOLD = 8; // px（画面上。ズーム補正前）

interface SnapResult {
  point: Point;
  guides: SnapGuideLine[];
}

/**
 * 新規ノード配置時のスナップ計算
 * 基準: 直前のノード
 */
function snapToNode(cursor: Point, referenceNode: Point, scale: number): SnapResult {
  const threshold = SNAP_THRESHOLD / scale; // ズーム補正
  const guides: SnapGuideLine[] = [];
  let { x, y } = cursor;

  // 水平スナップ（Y座標を揃える）
  if (Math.abs(cursor.y - referenceNode.y) < threshold) {
    y = referenceNode.y;
    guides.push({
      from: referenceNode,
      to: { x: cursor.x, y: referenceNode.y },
      axis: "horizontal",
    });
  }

  // 垂直スナップ（X座標を揃える）
  if (Math.abs(cursor.x - referenceNode.x) < threshold) {
    x = referenceNode.x;
    guides.push({
      from: referenceNode,
      to: { x: referenceNode.x, y: cursor.y },
      axis: "vertical",
    });
  }

  return { point: { x, y }, guides };
}

/**
 * ノードドラッグ時のスナップ計算
 * 基準: 前後のノード（両方チェック）
 */
function snapDragToNeighbors(
  cursor: Point,
  prevNode: Point | null,
  nextNode: Point | null,
  scale: number,
): SnapResult {
  const threshold = SNAP_THRESHOLD / scale;
  const guides: SnapGuideLine[] = [];
  let { x, y } = cursor;

  for (const ref of [prevNode, nextNode]) {
    if (!ref) continue;

    if (Math.abs(cursor.y - ref.y) < threshold) {
      y = ref.y;
      guides.push({ from: ref, to: { x: cursor.x, y: ref.y }, axis: "horizontal" });
    }
    if (Math.abs(cursor.x - ref.x) < threshold) {
      x = ref.x;
      guides.push({ from: ref, to: { x: ref.x, y: cursor.y }, axis: "vertical" });
    }
  }

  return { point: { x, y }, guides };
}
```

### 4.2 スナップ閾値

- 画面上で 8px 以内に入ったらスナップが効く
- ズームレベルで補正する（ズーム200%なら画像上 4px 以内）
- 水平と垂直が同時にスナップ可能（交点にスナップ = 基準ノードと同一座標）

---

## 5. ズーム/パン設計

### 5.1 ズーム

- マウスホイールでズーム
- ズーム中心: マウスカーソル位置
- ズーム範囲: 10% 〜 1000%（`0.1` 〜 `10.0`）
- ズームステップ: ホイール1ノッチで ×1.1 or ÷1.1

### 5.2 パン

- 中ボタンドラッグでパン
- 描画モードでない時は左ドラッグでもパン（キャンバスの空き領域）
- 描画モード中は左クリックがノード配置になるため、パンは中ボタンのみ

### 5.3 Fit to screen

画像全体がキャンバス領域に収まるようにスケールと位置を計算。上下左右に 20px のマージン。

---

## 6. 画像読み込みフロー

### 6.1 ドラッグ＆ドロップ / ファイル選択

1. File オブジェクトを取得
2. `URL.createObjectURL(file)` で Object URL を生成
3. `Image` オブジェクトで読み込み、`naturalWidth/Height` を取得
4. `useCanvasStore.loadImage(url, width, height)` を呼ぶ
5. 自動で Fit to screen

### 6.2 テンプレート選択

1. `manifest.json` を fetch
2. ユーザーがテンプレートを選択
3. `${BASE_URL}templates/${file}` のURLで `Image` を読み込み
4. `useCanvasStore.loadImage(url, width, height)` を呼ぶ
5. テンプレートに `unit` があれば `usePathStore.setUnitConfig(unit)` も呼ぶ
6. 自動で Fit to screen

### 6.3 画像変更時

画像を変更した場合、既存のパスデータをどうするかの確認が必要（要実装時判断）。
