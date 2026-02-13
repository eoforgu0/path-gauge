import { usePathStore } from "@/stores/usePathStore";
import { PathListItem } from "./PathListItem";

export function PathList() {
  const paths = usePathStore((s) => s.paths);
  const activePathId = usePathStore((s) => s.activePathId);

  if (paths.length === 0) {
    return <div className="px-3 py-2 text-sm text-text-dim">パスなし</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {paths.map((path) => (
        <PathListItem key={path.id} path={path} isActive={path.id === activePathId} />
      ))}
    </div>
  );
}
