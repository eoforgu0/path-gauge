import { MapCanvas } from "@/components/Canvas/MapCanvas";
import { SidePanel } from "@/components/SidePanel/SidePanel";
import { StatusBar } from "@/components/StatusBar/StatusBar";
import { Toolbar } from "@/components/Toolbar/Toolbar";

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <MapCanvas />
        <SidePanel />
      </div>
      <StatusBar />
    </div>
  );
}
