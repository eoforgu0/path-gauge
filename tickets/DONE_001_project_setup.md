# 001: プロジェクトセットアップ

## 種別
環境構築

## 概要
Vite + React + TypeScript のプロジェクトを初期化し、全ての開発ツール・設定ファイルを配置する。
この時点ではアプリのUIは作らず、環境が正しく動作することだけを確認する。

## 前提
- Git リポジトリは初期化済み（空の initial commit あり）
- `docs/` ディレクトリに設計書が配置済み

## 参照すべき設計書
- `docs/TECH_STACK.md` — §4「プロジェクトセットアップ手順」に全手順が記載されている

## 作業内容

### 1. Vite プロジェクト作成
- `npm create vite@latest . -- --template react-ts` で **既存ディレクトリ内に** 生成
  - 既に docs/, tickets/ が存在するので、既存ファイルを上書きしないこと
- 不要なボイラープレートファイルを削除（App.css, assets/react.svg 等）

### 2. 依存パッケージのインストール
`docs/TECH_STACK.md` §4.2 に記載のパッケージをインストール:
```bash
npm install tailwindcss @tailwindcss/vite konva react-konva zustand
npm install -D @biomejs/biome @types/node
```

### 3. 設定ファイルの配置
以下のファイルを `docs/TECH_STACK.md` の記載通りに作成・編集:
- `vite.config.ts` — §4.3
- `tsconfig.json` — §4.4
- `tsconfig.app.json` — §4.4
- `tsconfig.node.json` — §4.4
- `biome.json` — §4.5
- `src/index.css` — §4.6（Tailwind CSS のインポートとテーマ変数のみ）

### 4. package.json の scripts
`docs/TECH_STACK.md` §5.1 に記載の scripts を設定。

### 5. .gitignore
Vite が生成するデフォルトの `.gitignore` をベースに、以下を追加:
```
dist/
```

### 6. GitHub Actions
`docs/TECH_STACK.md` §5.2 に記載の `.github/workflows/deploy.yml` を作成。

### 7. 最小限の App.tsx
画面に「PathGauge」とだけ表示する最小限の `App.tsx` と `main.tsx` を作成。
スタイリングは Tailwind CSS のクラスを使って、ダークモード背景（`bg-[#0f1117] text-[#e2e8f0]`）であること。

### 8. public ディレクトリ
- `public/templates/manifest.json` を作成（空のテンプレート配列: `{ "templates": [] }`）

### 9. index.html
- `<title>` を「PathGauge」に変更

## 完了条件
1. `npm run dev` でローカル開発サーバーが起動し、「PathGauge」が表示される
2. `npm run build` がエラーなく完了する
3. `npm run lint` （biome check .）がエラーなく通る
4. Tailwind CSS が動作している（背景色がダークになっている）
5. 以下のファイルが存在する:
   - `vite.config.ts`
   - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
   - `biome.json`
   - `src/index.css`（Tailwind インポート + テーマ変数）
   - `src/App.tsx`, `src/main.tsx`
   - `.github/workflows/deploy.yml`
   - `public/templates/manifest.json`
6. `src/` 配下に不要なボイラープレートが残っていない（App.css, assets/react.svg 等）

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-001: project setup`
