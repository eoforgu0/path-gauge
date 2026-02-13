# 013: GitHub Pages デプロイ準備

## 種別
環境構築

## 概要
GitHub Pages へのデプロイが成功するように、CI ワークフローの修正と最小限のテストを追加する。

## 問題点
1. `.github/workflows/deploy.yml` に `npx vitest run` ステップがあるが、テストファイルが0本のため `No test files found` で exit code 1 → CI が失敗する
2. `biome ci .` コマンドが正しく動くか未確認

## 作業内容

### 1. CI ワークフローの vitest ステップを修正
2つの選択肢があり、どちらでもよい:

**選択肢A**: vitest の `passWithNoTests` オプションを使う
```yaml
- run: npx vitest run --passWithNoTests
```

**選択肢B**: テストファイルが存在する場合のみ実行する条件分岐（こちらは複雑なので選択肢Aを推奨）

### 2. 最小限のユーティリティテストを追加（推奨）
`src/__tests__/distance.test.ts` を作成:
- `pixelDistance` の基本テスト（3-4-5 三角形、同一点、水平/垂直）
- `formatDistance` のテスト（ピクセル表示、単位変換）
- `calcPathMetrics` のテスト（空パス、1ノード、2ノード、3ノード）

`src/__tests__/snap.test.ts` を作成:
- `snapToNode` のテスト（スナップ範囲内/外、水平/垂直/両方）
- `snapDragToNeighbors` のテスト（前ノードのみ/後ノードのみ/両方）

### 3. ローカルで CI 相当のコマンドを実行して確認
以下を順に実行し、すべて成功することを確認:
```bash
npx @biomejs/biome ci .
npm run build
npx vitest run
```

## 完了条件
1. `npx @biomejs/biome ci .` がエラーなく通る
2. `npm run build` がエラーなく通る
3. `npx vitest run` がエラーなく通り、テストが全て pass する
4. テストファイルが少なくとも1つ存在する

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-013: ci preparation and tests`
