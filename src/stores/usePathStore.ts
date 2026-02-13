import { create } from "zustand";
import { getPathColor } from "@/constants/colors";
import type { Path, Point, UnitConfig } from "@/types";
import { generateId } from "@/utils/id";

interface PathState {
  paths: Path[];
  activePathId: string | null;
  unitConfig: UnitConfig | null;
  pathCounter: number;

  addPath: () => string;
  removePath: (pathId: string) => void;
  clearAllPaths: () => void;
  setActivePathId: (pathId: string | null) => void;
  updatePathName: (pathId: string, name: string) => void;
  updatePathColor: (pathId: string, color: string) => void;

  addNode: (pathId: string, point: Point) => void;
  removeNode: (pathId: string, nodeId: string) => void;
  moveNode: (pathId: string, nodeId: string, point: Point) => void;
  insertNodeAfter: (pathId: string, afterNodeId: string, point: Point) => void;
  undoLastNode: (pathId: string) => void;

  setUnitConfig: (config: UnitConfig | null) => void;
}

export const usePathStore = create<PathState>()((set, get) => ({
  paths: [],
  activePathId: null,
  unitConfig: null,
  pathCounter: 0,

  addPath: () => {
    const id = generateId();
    const counter = get().pathCounter;
    const newPath: Path = {
      id,
      name: `Path ${counter + 1}`,
      color: getPathColor(counter),
      nodes: [],
    };
    set((state) => ({
      paths: [...state.paths, newPath],
      activePathId: id,
      pathCounter: state.pathCounter + 1,
    }));
    return id;
  },

  removePath: (pathId) => {
    set((state) => ({
      paths: state.paths.filter((p) => p.id !== pathId),
      activePathId: state.activePathId === pathId ? null : state.activePathId,
    }));
  },

  clearAllPaths: () => {
    set({ paths: [], activePathId: null });
  },

  setActivePathId: (pathId) => {
    set({ activePathId: pathId });
  },

  updatePathName: (pathId, name) => {
    set((state) => ({
      paths: state.paths.map((p) => (p.id === pathId ? { ...p, name } : p)),
    }));
  },

  updatePathColor: (pathId, color) => {
    set((state) => ({
      paths: state.paths.map((p) => (p.id === pathId ? { ...p, color } : p)),
    }));
  },

  addNode: (pathId, point) => {
    const node = { id: generateId(), x: point.x, y: point.y };
    set((state) => ({
      paths: state.paths.map((p) => (p.id === pathId ? { ...p, nodes: [...p.nodes, node] } : p)),
    }));
  },

  removeNode: (pathId, nodeId) => {
    set((state) => ({
      paths: state.paths.map((p) => (p.id === pathId ? { ...p, nodes: p.nodes.filter((n) => n.id !== nodeId) } : p)),
    }));
  },

  moveNode: (pathId, nodeId, point) => {
    set((state) => ({
      paths: state.paths.map((p) =>
        p.id === pathId
          ? { ...p, nodes: p.nodes.map((n) => (n.id === nodeId ? { ...n, x: point.x, y: point.y } : n)) }
          : p,
      ),
    }));
  },

  insertNodeAfter: (pathId, afterNodeId, point) => {
    const node = { id: generateId(), x: point.x, y: point.y };
    set((state) => ({
      paths: state.paths.map((p) => {
        if (p.id !== pathId) return p;
        const idx = p.nodes.findIndex((n) => n.id === afterNodeId);
        if (idx === -1) return p;
        const newNodes = [...p.nodes];
        newNodes.splice(idx + 1, 0, node);
        return { ...p, nodes: newNodes };
      }),
    }));
  },

  undoLastNode: (pathId) => {
    set((state) => ({
      paths: state.paths.map((p) => (p.id === pathId ? { ...p, nodes: p.nodes.slice(0, -1) } : p)),
    }));
  },

  setUnitConfig: (config) => {
    set({ unitConfig: config });
  },
}));
