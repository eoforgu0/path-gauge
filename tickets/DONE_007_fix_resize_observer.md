# 007: MapCanvas の ResizeObserver が動作しないバグの修正

## 種別
バグ修正

## 問題
画像を読み込んでも Konva Stage が描画されない。キャンバス領域のdivは存在するが中身が空。

## 原因
`MapCanvas.tsx` の ResizeObserver を登録する `useEffect` の依存配列が `[]`（空配列）になっている。

コンポーネントの初回マウント時、`imageUrl` が `null` なので早期 return で `<ImageDropZone />` が返される。この時点で `containerRef` の div はレンダリングされていないが、hooks（useRef, useState, useEffect）は全て呼ばれる。`useEffect []` が実行されるが、`containerRef.current` は `null` なので ResizeObserver は登録されない。

その後 `imageUrl` がセットされてdivがレンダリングされても、`useEffect []` は再実行されないため、ResizeObserver が永久に登録されず、`containerSize` が `{width: 0, height: 0}` のまま。結果として `containerSize.width > 0` の条件が `false` で Stage が描画されない。

## 修正方針

ResizeObserverの登録を `containerRef.current` の存在に依存させる。いくつかのアプローチがある:

### 推奨: callback ref を使う
`useRef` の代わりに callback ref を使い、DOMノードがアタッチ/デタッチされたタイミングで ResizeObserver を登録/解除する。

```typescript
const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

useEffect(() => {
  if (!containerEl) return;
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    }
  });
  observer.observe(containerEl);
  return () => observer.disconnect();
}, [containerEl]);

// JSXでの使用:
<div ref={setContainerEl} ...>
```

`useState` をrefコールバックとして使うことで、DOMノードが変わった時にuseEffectが再実行される。

## 完了条件
1. 画像を読み込むと Konva Stage が描画され、画像が表示される
2. Fit to Screen が自動で動作する（画像全体がキャンバスに収まる）
3. マウスホイールでズームが動作する
4. 中ボタンドラッグでパンが動作する
5. ステータスバーにカーソル座標とズーム率が表示される
6. `npm run build` がエラーなく通る
7. `npm run lint` がエラーなく通る

## コミット
完了条件を満たしたら `tickets/README.md` の「コミット手順」に従いコミット。
コミットメッセージ: `ticket-007: fix resize observer not attaching`
