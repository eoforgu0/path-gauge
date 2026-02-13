# 009: サイドパネル詳細（パス編集 + 単位設定）

## 種別
機能実装

## 概要
サイドパネルのパスリストにパス名変更・色変更・個別削除機能を追加し、単位設定セクションを実装する。

## 参照すべき設計書
- `docs/UI_DESIGN.md` — §5「右サイドパネル」
- `docs/REQUIREMENTS.md` — F3「複数パスの管理」、F5「単位変換」、F7「パスのクリア」

## 作業内容

### 1. PathListItem の拡張
`src/components/SidePanel/PathListItem.tsx` を修正:
- パス名のインライン編集（クリックで input に切り替わり、Enter/blur で確定）
- カラーインジケータ（●）クリックでカラーピッカー表示（`<input type="color">` でよい）
- 個別削除ボタン（控えめなアイコン。ゴミ箱やXアイコン）
- パスリスト内のパスをクリックでアクティブ切替（`setActivePathId`）

### 2. UnitSettings コンポーネント
`src/components/SidePanel/UnitSettings.tsx` を作成:
- 倍率（scale）: 数値入力。`usePathStore.setUnitConfig()` で更新
- 単位（label）: テキスト入力
- 倍率が空/0/未入力のときは `setUnitConfig(null)` でピクセル表示に戻す
- 入力値の変更は blur または Enter で確定（リアルタイムではない）

### 3. SidePanel の構成
`src/components/SidePanel/SidePanel.tsx` を修正:
- 上部: パスリスト
- 下部: 単位設定セクション（「単位設定」ヘッダー付き）
- パスリスト下に「+ 新規パス」ボタン（Toolbar と同じ動作）

### 4. 折りたたみ（簡易版）
サイドパネルの折りたたみは後回しでもよい。この時点では固定表示のままでOK。

## 完了条件
1. パス名をクリックして編集できる
2. カラーインジケータクリックでパスの色を変更できる
3. 削除ボタンで個別パスを削除できる
4. パスリスト内のパスをクリックでアクティブ切替できる
5. 単位設定（倍率・単位）を入力すると距離表示が変わる（例: 倍率0.5, 単位m → 距離がm表示に）
6. 倍率を空にするとピクセル表示に戻る
7. `npm run build` がエラーなく通る
8. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-009: side panel details and unit settings`
