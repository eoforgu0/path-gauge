# 技術スタック

---

## 1. 技術選定サマリー

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| React | 19.x (^19.2.0) | UIライブラリ | 最新安定版。grill-plannerと統一 |
| TypeScript | ~5.9.x | 型安全性 | 最新安定版。TS 6/7（Go移植版）は未安定のため見送り |
| Vite | 7.x (^7.3.0) | ビルドツール | 最新安定版。GitHub Pages との相性◎ |
| Tailwind CSS | 4.x (^4.1.0) | スタイリング | CSS-first設定、Viteプラグイン統合 |
| Konva + react-konva | ^19.x | Canvas描画 | 後述の比較検討による選定 |
| Zustand | 5.x (^5.0.0) | 状態管理 | 後述の比較検討による選定 |
| Biome | 2.x (2.3.x) | リンター/フォーマッター | grill-plannerと統一。ESLint+Prettier不要 |
| Vitest | ^4.x | テスト | Viteとの統合が最良。将来用 |
| GitHub Pages | — | ホスティング | 静的サイト。GitHub Actionsで自動デプロイ |

---

## 2. 比較検討: Canvas描画ライブラリ

本ツールでは「画像表示 + ズーム/パン + クリックで点を打つ + 線を描画 + ノードのドラッグ移動 + 線上クリックでノード挿入 + スナップ」が必要。

### 候補

| | 素のCanvas API | **Konva + react-konva** | Fabric.js |
|---|---|---|---|
| バンドルサイズ | 0 KB | ~98 KB (min+gzip) | ~150 KB (min+gzip) |
| React統合 | 自前実装 | 宣言的JSX（`<Line>`, `<Circle>`等） | 命令的API。React統合は薄い |
| ズーム/パン | 自前で座標変換を実装 | Stage の `scaleX/Y`, `x/y` で宣言的に実現 | 組み込みviewport変換あり |
| イベント処理 | 自前ヒットテスト | ノード単位でonClick等を宣言 | オブジェクト単位イベントあり |
| ノードのドラッグ | 自前でdrag処理を実装 | `draggable` prop + `onDragMove` | 組み込みdrag対応 |
| 線上のクリック検出 | 自前ヒットテスト | `Line` の `hitStrokeWidth` で太めの当たり判定 | オブジェクト単位イベントあり |
| 学習コスト | 低（APIは単純） | 中（Konva概念の理解が必要） | 中〜高 |
| 将来の拡張性 | 低（全て自前） | 高（ノードのドラッグ移動等が容易） | 高 |

### 選定: Konva + react-konva

**理由:**

本ツールの要件に照らした具体的な適合ポイント:

1. **ノードのドラッグ移動 + リアルタイム距離更新**: `draggable` prop と `onDragMove` で座標をリアルタイム取得。Zustand ストアを更新すれば距離表示が即座に再計算される。素のCanvas APIでは drag 処理（mousedown→mousemove→mouseup の状態管理）とヒットテスト（どのノードをクリックしたか）を全て自前実装する必要がある
2. **線上のクリック検出（ノード途中挿入用）**: `Line` コンポーネントの `hitStrokeWidth` を設定すれば、見た目の線は細くても当たり判定を太くできる。素のCanvas APIでは「マウス座標と線分の距離計算」を自前実装する必要がある
3. **スナップのゴースト表示**: 通常のReactコンポーネントとして `<Circle>` や `<Line>` を条件付きレンダリングするだけで実現。命令的なCanvas APIよりも宣言的で見通しが良い
4. **ズーム/パン中の座標変換**: Stage の `scaleX/Y` と `x/y` で管理。`stage.getPointerPosition()` + 逆変換で画像座標を取得できる。自前で変換行列を管理する必要がない

**スナップ機能の実装方針:**

マウスカーソル自体は動かさない。`onDragMove` 内でノードの `position()` をスナップ済み座標にセットする方式（`dragBoundFunc` は使わない）。新規配置時もマウス座標をスナップ補正した位置にゴーストを表示し、クリック時にゴースト座標を使用する。

**注意点:**

- デフォルトで全シェイプが全マウスイベントをリッスンする。背景画像など不要なものには `listening={false}` を設定すること
- react-konva v19 は React 19 に対応済み

**不採用理由:**

- **素のCanvas API**: ドラッグ処理、ヒットテスト、座標変換、再描画管理を全て自前実装する必要がある。本ツールの要件（ノードドラッグ、線上クリック、スナップ）では自前実装のコストが高く、バグの温床になる
- **Fabric.js**: 高機能だがバンドルサイズが大きく、React との統合が弱い。本ツールでは Fabric の高度な機能（テキスト編集、SVGインポート等）が不要

---

## 3. 比較検討: 状態管理

本ツールでは「複数パスの管理」「描画モード」「ズーム状態」「Undo」「ドラッグ中のリアルタイム距離更新」を扱う。

### 候補

| | React標準 (useState + useReducer + Context) | **Zustand** | Jotai |
|---|---|---|---|
| バンドルサイズ | 0 KB | ~2 KB (min+gzip) | ~3 KB (min+gzip) |
| ボイラープレート | Context + Provider 定義が必要 | ほぼゼロ。`create()` のみ | atom 定義がやや冗長になり得る |
| 再レンダリング制御 | Context 変更で子全体が再レンダリング（memo必須） | セレクタで自動最適化 | atom 単位で自動最適化 |
| React外からのアクセス | 不可（hooks経由のみ） | `store.getState()` で可能 | 基本的にReactコンテキスト内 |

### 選定: Zustand

**理由:**

本ツールの要件に照らした具体的な適合ポイント:

1. **ドラッグ中のリアルタイム距離更新**: `onDragMove` は mousemove ごとに発火する（秒60回程度）。Context だとこの更新が全購読コンポーネントに伝播する。Zustand のセレクタ（例: `useStore(s => s.paths[activeId])`）なら、関係するパスの距離表示だけが再レンダリングされる
2. **react-konva Stage との統合**: Zustand はグローバルストアなので、Stage 内外の区別なく `useStore(selector)` で直接アクセスできる。Context だと Stage 内からアクセスするために bridge が必要になるケースがある
3. **設計のシンプルさ**: Provider 不要。ストア定義ファイル1つで状態・アクション・セレクタが完結する。コンポーネント階層に依存しない

**不採用理由:**

- **React標準**: 今回の規模（3パス×10ノード）ならパフォーマンス上は問題ないが、Context の再レンダリング制御（memo + コンテキスト分割）の設計が煩雑になる。Zustand の方が設計がシンプルに保てる
- **Jotai**: atom ベースのモデルは「パスの配列」のような構造化データの管理がやや回りくどい。Zustand の方がストア設計が直感的

---

## 4. プロジェクトセットアップ手順

### 4.1 プロジェクト作成

```bash
npm create vite@latest path-gauge -- --template react-ts
cd path-gauge
```

### 4.2 依存パッケージのインストール

```bash
# Tailwind CSS v4 + Vite プラグイン
npm install tailwindcss @tailwindcss/vite

# Canvas描画
npm install konva react-konva

# 状態管理
npm install zustand

# 開発ツール
npm install -D @biomejs/biome @types/node
```

### 4.3 Vite 設定

```typescript
// vite.config.ts
/// <reference types="vitest/config" />

import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/path-gauge/",  // ← リポジトリ名に合わせる
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: "node",
  },
});
```

### 4.4 TypeScript 設定

grill-planner と同一構成（3ファイル分割）。

```json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

```json
// tsconfig.node.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 4.5 Biome 設定

grill-planner をベースに、本プロジェクト固有の調整を加える。

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.3.15/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!dist", "!public/templates"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  },
  "css": {
    "parser": {
      "cssModules": false,
      "tailwindDirectives": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "noUnusedImports": "warn",
        "noUnusedVariables": "warn"
      },
      "style": {
        "useImportType": "error",
        "noNonNullAssertion": "warn"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noArrayIndexKey": "off"
      },
      "a11y": {
        "noStaticElementInteractions": "off",
        "noSvgWithoutTitle": "off",
        "useKeyWithClickEvents": "off",
        "noLabelWithoutControl": "off"
      }
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### 4.6 CSS エントリポイント

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* パスのデフォルトカラーパレット */
  --color-path-1: #ef4444;
  --color-path-2: #3b82f6;
  --color-path-3: #22c55e;
  --color-path-4: #f59e0b;
  --color-path-5: #8b5cf6;
  --color-path-6: #ec4899;
  --color-path-7: #06b6d4;
  --color-path-8: #84cc16;
}
```

### 4.7 ディレクトリ構造（初期）

```
path-gauge/
├── public/
│   ├── templates/
│   │   ├── manifest.json       # テンプレート画像の定義
│   │   └── (ユーザーが配置する画像)
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── Canvas/             # Konva Stage, 画像描画, パス描画
│   │   ├── Toolbar/            # ツールバー
│   │   ├── PathList/           # パスリストパネル
│   │   └── ImageLoader/        # D&D, ファイル選択, テンプレート選択
│   ├── stores/
│   │   ├── usePathStore.ts     # パスデータの状態管理
│   │   └── useCanvasStore.ts   # ズーム/パン/描画モードの状態管理
│   ├── types/
│   │   └── index.ts            # Path, Node, DrawMode 等の型定義
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts
│   ├── utils/
│   │   └── distance.ts         # ピクセル距離計算
│   ├── constants/
│   │   └── colors.ts           # パスカラーパレット
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── REQUIREMENTS.md         # 要件定義書
│   ├── TECH_STACK.md           # 本文書
│   ├── UI_DESIGN.md            # UIデザイン仕様
│   └── ARCHITECTURE.md         # アーキテクチャ設計
├── .github/
│   └── workflows/
│       └── deploy.yml
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── biome.json
├── package.json
└── README.md
```

---

## 5. ビルドとデプロイ

### 5.1 npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

### 5.2 GitHub Actions デプロイ

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npx @biomejs/biome ci .

      - run: npm run build

      - run: npx vitest run

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 5.3 テンプレート画像の読み込み

```typescript
// テンプレート一覧の取得
const basePath = import.meta.env.BASE_URL;
const response = await fetch(`${basePath}templates/manifest.json`);
```

---

## 6. 開発環境

### 6.1 開発体制

grill-planner と同様、**Claude Code** が実装を担当する。
デバッグ・動作確認には **Playwright MCP** を使用。

### 6.2 Node.js バージョン

Vite 7 の要件に合わせ **Node.js 20.19+** を使用。
GitHub Actions では `node-version: 22` を指定。

### 6.3 実装の進め方

実装フェーズの事前設計は行わない。代わりに以下のフローで段階的に進める:

1. Claude（チャット側）がチケット（作業指示）を1〜2個ずつ発行する
2. Claude Code がチケットに従い実装する
3. 動作確認（ユーザー or Playwright MCP 経由）
4. フィードバックを受けて調整
5. 問題なければ次のチケットへ

チケットのフォーマット・粒度・Claude Code への渡し方は別途検討する。

---

## 7. バージョン固定方針

grill-planner と同様、メジャーバージョンを固定し、マイナー・パッチの更新は許容する。

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "konva": "^9.3.0",
    "react-konva": "^19.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.15",
    "@tailwindcss/vite": "^4.1.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.1.0",
    "tailwindcss": "^4.1.0",
    "typescript": "~5.9.3",
    "vite": "^7.3.0",
    "vitest": "^4.0.0"
  }
}
```

**Biome のみ exact バージョン**で固定（grill-planner踏襲）。Biome はメジャー間で breaking change が大きいため。

`package-lock.json` をコミットし、CI/CD では `npm ci` を使用して再現性を確保する。

---

## 8. Tailwind CSS 4.x 注意事項

grill-planner の TECH_STACK.md に記載の内容と同一。要点のみ再掲:

- **CSS-first 設定**: `tailwind.config.js` は不要。`@import "tailwindcss"` + `@theme {}` で設定
- **Vite プラグイン**: `@tailwindcss/vite` を使用。PostCSS 経由は不要
- **クラス名の変更**: `shadow` → `shadow-sm`, `rounded` → `rounded-sm`, `ring` → `ring-3` 等
- **Sass/Less 非対応**: Tailwind 自体がプリプロセッサの役割を果たす
