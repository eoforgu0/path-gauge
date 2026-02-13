# 004: 基本レイアウト（UIシェル）

## 種別
機能実装

## 概要
アプリの全体レイアウト（ツールバー、キャンバス領域、サイドパネル、ステータスバー）の外枠を作成する。
各コンポーネントの中身はプレースホルダーでよい。レイアウトの構造とダークモード配色が正しいことを確認する。

## 参照すべき設計書
- `docs/UI_DESIGN.md` — §1「全体レイアウト」、§2「配色」
- `docs/ARCHITECTURE.md` — §3「コンポーネント階層」

## 作業内容

### 1. src/index.css の更新
`docs/UI_DESIGN.md` §2.1 のカラーパレットを `@theme {}` に追加。
ticket-001 で作成した `--color-path-*` に加え、以下を追加:
- `--color-bg`, `--color-surface`, `--color-surface-hover`, `--color-border`
- `--color-text`, `--color-text-muted`, `--color-text-dim`
- `--color-canvas-bg`
- `--color-accent`, `--color-accent-hover`
- `--color-snap-guide`, `--color-snap-ghost`
- `--color-danger`, `--color-danger-hover`

### 2. App.tsx
全体レイアウトを組み立てる。`docs/UI_DESIGN.md` §1.1 の構成:
- 最外枠: `h-screen` + `flex flex-col` + `bg-bg text-text`
- ツールバー: 上部固定、高さ 48px
- メインエリア: `flex-1` + `flex`（横並び）
  - キャンバス領域: `flex-1`
  - サイドパネル: 幅 280px
- ステータスバー: 下部固定、高さ 28px

### 3. コンポーネント作成（プレースホルダー）
以下のコンポーネントを作成。中身はシンプルなプレースホルダーテキスト表示でよい:

- `src/components/Toolbar/Toolbar.tsx`
  - 背景色: `bg-surface`、下ボーダー: `border-b border-border`
  - 高さ 48px
  - 中に「ツールバー」とテキスト表示（仮）

- `src/components/Canvas/MapCanvas.tsx`
  - 背景色: `bg-canvas-bg`
  - flex-1 で残り幅を占有
  - 中に「キャンバス」とテキスト表示（仮）

- `src/components/SidePanel/SidePanel.tsx`
  - 背景色: `bg-surface`、左ボーダー: `border-l border-border`
  - 幅 280px
  - 中に「サイドパネル」とテキスト表示（仮）

- `src/components/StatusBar/StatusBar.tsx`
  - 背景色: `bg-surface`、上ボーダー: `border-t border-border`
  - 高さ 28px
  - 中に「ステータスバー」とテキスト表示（仮）

### 4. ディレクトリ構造
`docs/ARCHITECTURE.md` §3.3 のディレクトリ構造に沿って `src/components/` 配下にフォルダを作成。
この時点では上記4コンポーネントのファイルだけでよい。

## 完了条件
1. `npm run dev` でアプリが表示され、4つの領域（ツールバー、キャンバス、サイドパネル、ステータスバー）が視覚的に区別できる
2. ダークモードの配色が適用されている（背景が暗い、テキストが明るい）
3. レイアウトが `100vh` に収まり、スクロールが発生しない
4. キャンバス領域がウィンドウリサイズに追従して伸縮する（flex-1）
5. `npm run build` がエラーなく通る
6. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-004: basic layout shell`
