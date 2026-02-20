import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectState {
  activeProjectId: number | null;
  projectCache: Record<number, Project>;
  setActiveProject: (id: number) => void;
  cacheProject: (project: Project) => void;
  clearCache: () => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  activeProjectId: null,
  projectCache: {},
  setActiveProject: (id) => set({ activeProjectId: id }),
  cacheProject: (project) =>
    set((s) => ({ projectCache: { ...s.projectCache, [project.id]: project } })),
  clearCache: () => set({ projectCache: {}, activeProjectId: null }),
}));
