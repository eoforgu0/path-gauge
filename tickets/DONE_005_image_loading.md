# 005: 画像読み込み（ドロップゾーン + テンプレート選択）

## 種別
機能実装

## 概要
画像未読み込み時にキャンバス領域全体にドロップゾーンを表示し、D&D / ファイル選択 / テンプレート選択で画像を読み込めるようにする。

## 参照すべき設計書
- `docs/UI_DESIGN.md` — §1.3「画像未読み込み時」
- `docs/ARCHITECTURE.md` — §6「画像読み込みフロー」、§3.1 コンポーネント階層（ImageDropZone, TemplateSelector）
- `docs/REQUIREMENTS.md` — F1「画像の読み込み」

## 作業内容

### 1. ImageDropZone コンポーネント
`src/components/ImageLoader/ImageDropZone.tsx` を作成:
- `useCanvasStore` の `imageUrl` が null のときに表示される
- キャンバス領域全体を覆う
- ドラッグ＆ドロップ対応（dragover, drop イベント）
- ドラッグ中は破線ボーダーの色を変える等のフィードバック
- 「ファイルを選択」ボタン（hidden input[type=file] + ボタンクリックで発火）
- 受け付ける形式: 画像ファイル（image/*）

### 2. TemplateSelector コンポーネント
`src/components/ImageLoader/TemplateSelector.tsx` を作成:
- `public/templates/manifest.json` を fetch して読み込み
- テンプレートが0件の場合はセクション自体を非表示
- テンプレートがある場合、名前を横並びボタンで表示（サムネイルは後回しでもよい、ボタンだけでOK）
- クリックでテンプレート画像を読み込み

### 3. 画像読み込みロジック
共通の画像読み込み処理をカスタムフックまたはユーティリティに切り出す:
- `src/hooks/useImageLoader.ts` を作成
- File → `URL.createObjectURL()` → `Image` で `naturalWidth/Height` 取得 → `useCanvasStore.loadImage()` 呼び出し
- テンプレート選択時: URL から `Image` を読み込み → 同様に `loadImage()` + `usePathStore.setUnitConfig()`（unit がある場合）

### 4. MapCanvas の条件分岐
`src/components/Canvas/MapCanvas.tsx` を修正:
- `imageUrl === null` → `ImageDropZone` を表示
- `imageUrl !== null` → 画像表示（次のチケット006で実装するので、この時点では「画像読込済み」のプレースホルダーテキスト + 画像サイズ表示でよい）

### 5. ツールバーの「画像読込」ボタン
`src/components/Toolbar/Toolbar.tsx` に画像読込ボタンを追加:
- クリックで hidden input[type=file] を発火
- 画像読込後も再度別画像を読み込める

## UIスタイル
- ドロップゾーン: `docs/UI_DESIGN.md` §1.3 に準拠。破線ボーダー、中央配置
- ダークモードの配色に合わせること（`bg-canvas-bg`, `text-text-muted`, `border-border` 等）

## 完了条件
1. 画像未読込時にドロップゾーンが表示される
2. D&D で画像ファイルを読み込める
3. 「ファイルを選択」ボタンで画像ファイルを読み込める
4. 画像読込後にドロップゾーンが消え、「画像読込済み（幅 x 高さ）」のようなプレースホルダーが表示される
5. ツールバーの画像読込ボタンで再度別の画像を読み込める
6. テンプレートが0件（manifest.json が空配列）の場合、テンプレートセクションが表示されない
7. `npm run build` がエラーなく通る
8. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-005: image loading`
