/** 2D座標（画像上のピクセル座標） */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** パス内のノード */
export interface PathNode {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

/** パス */
export interface Path {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly nodes: readonly PathNode[];
}

/** 単位設定 */
export interface UnitConfig {
  readonly scale: number;
  readonly label: string;
}

/** テンプレート画像の定義（manifest.json の1エントリ） */
export interface TemplateEntry {
  readonly file: string;
  readonly name: string;
  readonly unit?: UnitConfig;
}

/** テンプレートマニフェスト */
export interface TemplateManifest {
  readonly templates: readonly TemplateEntry[];
}

/** 描画モード */
export type DrawMode = "idle" | "drawing" | "editing";

/** スナップガイドライン */
export interface SnapGuideLine {
  readonly from: Point;
  readonly to: Point;
  readonly axis: "horizontal" | "vertical";
}

/** スナップ状態 */
export interface SnapState {
  readonly active: boolean;
  readonly snappedPoint: Point | null;
  readonly guideLines: readonly SnapGuideLine[];
}

/** エッジ（線分）の計算結果 */
export interface EdgeInfo {
  readonly fromNode: PathNode;
  readonly toNode: PathNode;
  readonly distance: number;
  readonly midPoint: Point;
}

/** パスの計算結果 */
export interface PathMetrics {
  readonly pathId: string;
  readonly totalDistance: number;
  readonly edges: readonly EdgeInfo[];
}
