import { Fragment } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { usePathStore } from "@/stores/usePathStore";
import type { Path } from "@/types";
import { EdgeLabel } from "./EdgeLabel";
import { EdgeLine } from "./EdgeLine";
import { NodeCircle } from "./NodeCircle";

interface Props {
  path: Path;
}

export function PathRenderer({ path }: Props) {
  const scale = useCanvasStore((s) => s.scale);
  const unitConfig = usePathStore((s) => s.unitConfig);

  return (
    <>
      {path.nodes.map((node, i) => {
        const nextNode = path.nodes[i + 1];
        return (
          <Fragment key={node.id}>
            {nextNode && (
              <>
                <EdgeLine fromNode={node} toNode={nextNode} color={path.color} scale={scale} />
                <EdgeLabel fromNode={node} toNode={nextNode} color={path.color} scale={scale} unitConfig={unitConfig} />
              </>
            )}
            <NodeCircle node={node} color={path.color} scale={scale} />
          </Fragment>
        );
      })}
    </>
  );
}
