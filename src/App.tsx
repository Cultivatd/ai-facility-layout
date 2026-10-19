import React from 'react';
import { FacilityCanvas2D } from './components/canvas/FacilityCanvas2D';
import { IsometricPreview3D } from './components/preview3d/IsometricPreview3D';
import { SpaceProgramSidebar } from './components/sidebar/SpaceProgramSidebar';
import { StudioHeader } from './components/toolbar/StudioHeader';
import { useViewStore } from './store/viewStore';

export const App: React.FC = () => {
  const viewMode = useViewStore((s) => s.viewMode);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <StudioHeader />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex overflow-hidden relative">
          {(viewMode === '2d' || viewMode === 'split') && <FacilityCanvas2D />}
          {viewMode === 'split' && <div className="w-px h-full bg-slate-800 shrink-0" />}
          {(viewMode === '3d' || viewMode === 'split') && <IsometricPreview3D />}
        </main>

        <SpaceProgramSidebar />
      </div>
    </div>
  );
};

export default App;
