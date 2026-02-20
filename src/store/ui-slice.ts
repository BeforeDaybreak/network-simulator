import type { StateCreator } from 'zustand';
import type { DifficultyLevel } from '../types/network';

export interface UiSlice {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  connectionMode: boolean;
  connectionSourceId: string | null;
  difficultyLevel: DifficultyLevel;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setConnectionMode: (on: boolean) => void;
  setConnectionSource: (id: string | null) => void;
  setDifficultyLevel: (level: DifficultyLevel) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  selectedNodeId: null,
  selectedEdgeId: null,
  connectionMode: false,
  connectionSourceId: null,
  difficultyLevel: 'beginner',

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setConnectionMode: (on) => set({ connectionMode: on, connectionSourceId: null }),
  setConnectionSource: (id) => set({ connectionSourceId: id }),
  setDifficultyLevel: (level) => set({ difficultyLevel: level }),
});
