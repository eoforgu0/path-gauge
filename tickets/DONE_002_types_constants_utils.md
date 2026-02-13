# 002: 型定義・定数・ユーティリティ

## 種別
機能実装

## 概要
アプリ全体で使う型定義、カラー定数、距離計算ユーティリティを作成する。
UIやストアはまだ作らない。純粋なデータ層のみ。

## 参照すべき設計書
- `docs/ARCHITECTURE.md` — §1「型定義」、§4「スナップロジック」
- `docs/UI_DESIGN.md` — §2.1「カラーパレット」

## 作業内容

### 1. 型定義ファイル
`src/types/index.ts` を作成。`docs/ARCHITECTURE.md` §1.1, §1.2 に記載の全型を定義:
- `Point`, `PathNode`, `Path`, `UnitConfig`
- `TemplateEntry`, `TemplateManifest`
- `DrawMode`, `SnapState`, `SnapGuideLine`
- `EdgeInfo`, `PathMetrics`

### 2. カラー定数
`src/constants/colors.ts` を作成:
- パスカラーパレット（`docs/UI_DESIGN.md` §2.1 の `--color-path-1` 〜 `--color-path-8`）を配列として定義
- `getPathColor(index: number): string` — インデックスからパスの色を返す関数（配列長で循環）

### 3. 距離計算ユーティリティ
`src/utils/distance.ts` を作成:
- `pixelDistance(a: Point, b: Point): number` — 2点間のユークリッド距離
- `calcPathMetrics(path: Path): PathMetrics` — パスの全エッジ距離と合計距離を計算
- `formatDistance(px: number, unit: UnitConfig | null): string` — 表示用文字列に変換

### 4. スナップユーティリティ
`src/utils/snap.ts` を作成。`docs/ARCHITECTURE.md` §4.1 に記載のロジック:
- `SNAP_THRESHOLD` 定数（8px）
- `snapToNode(cursor, referenceNode, scale): SnapResult`
- `snapDragToNeighbors(cursor, prevNode, nextNode, scale): SnapResult`
- `SnapResult` 型もここで定義（exportする）

### 5. ID生成ユーティリティ
`src/utils/id.ts` を作成:
- `generateId(): string` — `crypto.randomUUID()` のラッパー

## 完了条件
1. `npm run build` がエラーなく通る
2. `npm run lint` がエラーなく通る
3. 全ての型が `src/types/index.ts` からエクスポートされている
4. `distance.ts`, `snap.ts`, `id.ts`, `colors.ts` が存在し、上記関数がエクスポートされている

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-002: types, constants, and utilities`
