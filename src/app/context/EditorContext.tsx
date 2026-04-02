'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'line';
  x: number;
  y: number;
  // text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  fill?: string;
  align?: string;
  letterSpacing?: number;
  lineHeight?: number;
  width?: number;
  // shape-specific
  rectWidth?: number;
  rectHeight?: number;
  radius?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  shapeFill?: string;
  // common
  locked?: boolean;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: { colors: string[]; direction: string };
  imageUrl?: string;
}

export interface OverlayConfig {
  color: string;
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
}

export interface CanvasSize {
  width: number;
  height: number;
  label: string;
}

interface HistorySnapshot {
  elements: CanvasElement[];
  background: BackgroundConfig;
}

export interface EditorState {
  elements: CanvasElement[];
  selectedId: string | null;
  background: BackgroundConfig;
  overlay: OverlayConfig;
  canvasSize: CanvasSize;
  history: HistorySnapshot[];
  historyIndex: number;
}

type Action =
  | { type: 'ADD_ELEMENT'; payload: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; payload: Partial<CanvasElement> & { id: string } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'SELECT_ELEMENT'; payload: string }
  | { type: 'DESELECT' }
  | { type: 'REORDER_ELEMENTS'; payload: CanvasElement[] }
  | { type: 'LOCK_ELEMENT'; payload: string }
  | { type: 'SET_BACKGROUND'; payload: BackgroundConfig }
  | { type: 'SET_OVERLAY'; payload: Partial<OverlayConfig> }
  | { type: 'SET_CANVAS_SIZE'; payload: CanvasSize }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'PUSH_HISTORY' };

export const CANVAS_SIZES: CanvasSize[] = [
  { width: 1080, height: 1080, label: 'Instagram Square (1:1)' },
  { width: 1080, height: 1920, label: 'Instagram Story (9:16)' },
  { width: 1200, height: 630, label: 'Facebook Post' },
  { width: 1200, height: 675, label: 'Twitter Post' },
  { width: 1200, height: 627, label: 'LinkedIn Post' },
  { width: 1280, height: 720, label: 'YouTube Thumbnail (16:9)' },
  { width: 800, height: 800, label: 'Square (800×800)' },
];

const defaultBackground: BackgroundConfig = { type: 'color', color: '#1a1a2e' };
const defaultOverlay: OverlayConfig = { color: '#000000', opacity: 0, blur: 0, brightness: 100, contrast: 100 };
const initialSnapshot: HistorySnapshot = { elements: [], background: defaultBackground };

const initialState: EditorState = {
  elements: [],
  selectedId: null,
  background: defaultBackground,
  overlay: defaultOverlay,
  canvasSize: CANVAS_SIZES[0],
  history: [initialSnapshot],
  historyIndex: 0,
};

function pushHistory(state: EditorState): Pick<EditorState, 'history' | 'historyIndex'> {
  const snapshot: HistorySnapshot = { elements: state.elements, background: state.background };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(snapshot);
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const newElements = [...state.elements, action.payload];
      const updated = { ...state, elements: newElements, selectedId: action.payload.id };
      return { ...updated, ...pushHistory(updated) };
    }

    case 'UPDATE_ELEMENT': {
      const { id, ...changes } = action.payload;
      return {
        ...state,
        elements: state.elements.map(el => el.id === id ? { ...el, ...changes } : el),
      };
    }

    case 'DELETE_ELEMENT': {
      const newElements = state.elements.filter(el => el.id !== action.payload);
      const updated = { ...state, elements: newElements, selectedId: null };
      return { ...updated, ...pushHistory(updated) };
    }

    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.payload };

    case 'DESELECT':
      return { ...state, selectedId: null };

    case 'REORDER_ELEMENTS': {
      const updated = { ...state, elements: action.payload };
      return { ...updated, ...pushHistory(updated) };
    }

    case 'LOCK_ELEMENT': {
      const newElements = state.elements.map(el =>
        el.id === action.payload ? { ...el, locked: !el.locked } : el
      );
      const updated = { ...state, elements: newElements };
      return { ...updated, ...pushHistory(updated) };
    }

    case 'SET_BACKGROUND': {
      const updated = { ...state, background: action.payload };
      return { ...updated, ...pushHistory(updated) };
    }

    case 'SET_OVERLAY':
      return { ...state, overlay: { ...state.overlay, ...action.payload } };

    case 'SET_CANVAS_SIZE':
      return { ...state, canvasSize: action.payload };

    case 'PUSH_HISTORY': {
      const snapshot: HistorySnapshot = { elements: state.elements, background: state.background };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      return { ...state, history: newHistory, historyIndex: newHistory.length - 1 };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const prevIndex = state.historyIndex - 1;
      const prev = state.history[prevIndex];
      return {
        ...state,
        elements: prev.elements,
        background: prev.background,
        historyIndex: prevIndex,
        selectedId: null,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextIndex = state.historyIndex + 1;
      const next = state.history[nextIndex];
      return {
        ...state,
        elements: next.elements,
        background: next.background,
        historyIndex: nextIndex,
        selectedId: null,
      };
    }

    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
