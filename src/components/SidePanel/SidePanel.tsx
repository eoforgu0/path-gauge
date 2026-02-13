import { PathList } from "./PathList";

export function SidePanel() {
  return (
    <div className="flex w-70 flex-col border-l border-border bg-surface">
      <div className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">パスリスト</div>
      <div className="flex-1 overflow-y-auto p-2">
        <PathList />
      </div>
    </div>
  );
}
