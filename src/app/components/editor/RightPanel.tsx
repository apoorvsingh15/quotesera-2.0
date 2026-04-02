'use client';

import React from 'react';
import { Button, Collapse, Select, Slider, Input } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useEditor } from '../../context/EditorContext';
import type { CanvasElement } from '../../context/EditorContext';

const FONTS = [
  'Roboto',
  'Playfair Display',
  'Montserrat',
  'Oswald',
  'Lato',
  'Dancing Script',
  'Merriweather',
  'Raleway',
];

/** Maps a CSS gradient direction string to a CSS angle string for use in linear-gradient(). */
function gradientDirectionToDeg(direction: string): string {
  const map: Record<string, string> = {
    'to right': '90deg',
    'to bottom': '180deg',
    'to bottom right': '135deg',
    'to bottom left': '225deg',
    'to top right': '45deg',
    'to top left': '315deg',
    'to top': '0deg',
    'to left': '270deg',
  };
  return map[direction] ?? '180deg';
}

const GRADIENT_PRESETS = [
  { label: 'Sunset', colors: ['#ff6b6b', '#feca57'], direction: 'to bottom right' },
  { label: 'Ocean', colors: ['#1a1a2e', '#0f3460'], direction: 'to bottom' },
  { label: 'Forest', colors: ['#134e5e', '#71b280'], direction: 'to bottom right' },
  { label: 'Purple', colors: ['#8360c3', '#2ebf91'], direction: 'to bottom right' },
  { label: 'Coral', colors: ['#ff9966', '#ff5e62'], direction: 'to bottom right' },
  { label: 'Deep Space', colors: ['#000428', '#004e92'], direction: 'to bottom right' },
];

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-3">{children}</p>;
}

export default function RightPanel() {
  const { state, dispatch } = useEditor();
  const { elements, selectedId, background, overlay } = state;

  const selectedElement = elements.find(el => el.id === selectedId) as CanvasElement | undefined;
  const isTextSelected = selectedElement?.type === 'text';
  const isShapeSelected = selectedElement && selectedElement.type !== 'text' && selectedElement.type !== 'line';

  const update = (changes: Partial<CanvasElement>) => {
    if (!selectedElement) return;
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id: selectedElement.id, ...changes } });
  };

  const isBold = selectedElement?.fontStyle?.includes('bold') ?? false;
  const isItalic = selectedElement?.fontStyle?.includes('italic') ?? false;
  const isUnderline = (selectedElement?.textDecoration ?? '') === 'underline';

  const toggleBold = () => {
    if (!selectedElement) return;
    let style = selectedElement.fontStyle || 'normal';
    if (isBold) {
      style = style.replace('bold', '').trim() || 'normal';
    } else {
      style = style === 'normal' ? 'bold' : `${style} bold`.trim();
    }
    update({ fontStyle: style });
  };

  const toggleItalic = () => {
    if (!selectedElement) return;
    let style = selectedElement.fontStyle || 'normal';
    if (isItalic) {
      style = style.replace('italic', '').trim() || 'normal';
    } else {
      style = style === 'normal' ? 'italic' : `${style} italic`.trim();
    }
    update({ fontStyle: style });
  };

  const addText = () => {
    const el: CanvasElement = {
      id: genId(),
      type: 'text',
      x: 100,
      y: 100,
      text: 'Your quote here...',
      fontSize: 36,
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      textDecoration: '',
      fill: '#ffffff',
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.3,
      width: 500,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    dispatch({ type: 'ADD_ELEMENT', payload: el });
  };

  const addRect = () => {
    const el: CanvasElement = {
      id: genId(),
      type: 'rect',
      x: 150,
      y: 150,
      rectWidth: 200,
      rectHeight: 120,
      shapeFill: 'transparent',
      stroke: '#ffffff',
      strokeWidth: 3,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    dispatch({ type: 'ADD_ELEMENT', payload: el });
  };

  const addCircle = () => {
    const el: CanvasElement = {
      id: genId(),
      type: 'circle',
      x: 300,
      y: 300,
      radius: 80,
      shapeFill: 'transparent',
      stroke: '#ffffff',
      strokeWidth: 3,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
    };
    dispatch({ type: 'ADD_ELEMENT', payload: el });
  };

  const addLine = () => {
    const el: CanvasElement = {
      id: genId(),
      type: 'line',
      x: 100,
      y: 300,
      points: [0, 0, 300, 0],
      stroke: '#ffffff',
      strokeWidth: 3,
    };
    dispatch({ type: 'ADD_ELEMENT', payload: el });
  };

  const deleteSelected = () => {
    if (selectedElement) dispatch({ type: 'DELETE_ELEMENT', payload: selectedElement.id });
  };

  const moveUp = (id: string) => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx < elements.length - 1) {
      const newArr = [...elements];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      dispatch({ type: 'REORDER_ELEMENTS', payload: newArr });
    }
  };

  const moveDown = (id: string) => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx > 0) {
      const newArr = [...elements];
      [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      dispatch({ type: 'REORDER_ELEMENTS', payload: newArr });
    }
  };

  const collapseItems = [
    {
      key: 'text',
      label: <span className="font-semibold text-sm">✍️ Text</span>,
      children: (
        <div className="space-y-3">
          <Button type="primary" block onClick={addText}>
            + Add Text
          </Button>

          {isTextSelected && selectedElement && (
            <>
              <SectionLabel>Content</SectionLabel>
              <Input.TextArea
                rows={3}
                value={selectedElement.text || ''}
                onChange={e => update({ text: e.target.value })}
                className="text-sm"
              />

              <SectionLabel>Font Family</SectionLabel>
              <Select
                value={selectedElement.fontFamily || 'Roboto'}
                onChange={val => update({ fontFamily: val })}
                style={{ width: '100%' }}
                options={FONTS.map(f => ({ label: f, value: f }))}
              />

              <SectionLabel>Font Size</SectionLabel>
              <Input
                type="number"
                min={8}
                max={200}
                value={selectedElement.fontSize || 24}
                onChange={e => update({ fontSize: Number(e.target.value) })}
              />

              <SectionLabel>Style</SectionLabel>
              <div className="flex gap-2">
                <Button
                  icon={<BoldOutlined />}
                  type={isBold ? 'primary' : 'default'}
                  onClick={toggleBold}
                />
                <Button
                  icon={<ItalicOutlined />}
                  type={isItalic ? 'primary' : 'default'}
                  onClick={toggleItalic}
                />
                <Button
                  icon={<UnderlineOutlined />}
                  type={isUnderline ? 'primary' : 'default'}
                  onClick={() => update({ textDecoration: isUnderline ? '' : 'underline' })}
                />
              </div>

              <SectionLabel>Alignment</SectionLabel>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map(a => (
                  <Button
                    key={a}
                    icon={a === 'left' ? <AlignLeftOutlined /> : a === 'center' ? <AlignCenterOutlined /> : <AlignRightOutlined />}
                    type={selectedElement.align === a ? 'primary' : 'default'}
                    onClick={() => update({ align: a })}
                  />
                ))}
              </div>

              <SectionLabel>Color</SectionLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.fill || '#ffffff'}
                  onChange={e => update({ fill: e.target.value })}
                  className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-sm text-gray-600">{selectedElement.fill || '#ffffff'}</span>
              </div>

              <SectionLabel>Letter Spacing</SectionLabel>
              <Slider
                min={0}
                max={20}
                value={selectedElement.letterSpacing ?? 0}
                onChange={val => update({ letterSpacing: val })}
              />

              <SectionLabel>Line Height</SectionLabel>
              <Slider
                min={0.5}
                max={3}
                step={0.1}
                value={selectedElement.lineHeight ?? 1.2}
                onChange={val => update({ lineHeight: val })}
              />
            </>
          )}
        </div>
      ),
    },
    {
      key: 'background',
      label: <span className="font-semibold text-sm">🖼️ Background</span>,
      children: (
        <div className="space-y-3">
          <SectionLabel>Solid Color</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.type === 'color' ? background.color || '#000000' : '#000000'}
              onChange={e =>
                dispatch({ type: 'SET_BACKGROUND', payload: { type: 'color', color: e.target.value } })
              }
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <span className="text-sm text-gray-600">
              {background.type === 'color' ? background.color : 'Custom'}
            </span>
          </div>

          <SectionLabel>Gradient Presets</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_PRESETS.map(g => (
              <button
                key={g.label}
                title={g.label}
                onClick={() =>
                  dispatch({
                    type: 'SET_BACKGROUND',
                    payload: { type: 'gradient', gradient: { colors: g.colors, direction: g.direction } },
                  })
                }
                className="rounded-md border border-gray-200 hover:border-indigo-400 transition-all duration-150 cursor-pointer"
                style={{
                  height: 36,
                  background: `linear-gradient(${gradientDirectionToDeg(g.direction)}, ${g.colors.join(', ')})`,
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'overlay',
      label: <span className="font-semibold text-sm">🎨 Overlay & Filters</span>,
      children: (
        <div className="space-y-3">
          <SectionLabel>Overlay Color</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={overlay.color}
              onChange={e => dispatch({ type: 'SET_OVERLAY', payload: { color: e.target.value } })}
              className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
            />
            <span className="text-sm text-gray-600">{overlay.color}</span>
          </div>

          <SectionLabel>Overlay Opacity ({Math.round(overlay.opacity * 100)}%)</SectionLabel>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={overlay.opacity}
            onChange={val => dispatch({ type: 'SET_OVERLAY', payload: { opacity: val } })}
          />

          <SectionLabel>Blur ({overlay.blur}px)</SectionLabel>
          <Slider
            min={0}
            max={20}
            value={overlay.blur}
            onChange={val => dispatch({ type: 'SET_OVERLAY', payload: { blur: val } })}
          />

          <SectionLabel>Brightness ({overlay.brightness}%)</SectionLabel>
          <Slider
            min={0}
            max={200}
            value={overlay.brightness}
            onChange={val => dispatch({ type: 'SET_OVERLAY', payload: { brightness: val } })}
          />

          <SectionLabel>Contrast ({overlay.contrast}%)</SectionLabel>
          <Slider
            min={0}
            max={200}
            value={overlay.contrast}
            onChange={val => dispatch({ type: 'SET_OVERLAY', payload: { contrast: val } })}
          />
        </div>
      ),
    },
    {
      key: 'shapes',
      label: <span className="font-semibold text-sm">🔷 Shapes</span>,
      children: (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <Button block onClick={addRect}>+ Add Rectangle</Button>
            <Button block onClick={addCircle}>+ Add Circle</Button>
            <Button block onClick={addLine}>+ Add Line</Button>
          </div>

          {isShapeSelected && selectedElement && (
            <>
              <SectionLabel>Fill Color</SectionLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.shapeFill && selectedElement.shapeFill !== 'transparent' ? selectedElement.shapeFill : '#ffffff'}
                  onChange={e => update({ shapeFill: e.target.value })}
                  className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <Button
                  size="small"
                  onClick={() => update({ shapeFill: 'transparent' })}
                  type={selectedElement.shapeFill === 'transparent' ? 'primary' : 'default'}
                >
                  Transparent
                </Button>
              </div>

              <SectionLabel>Stroke Color</SectionLabel>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.stroke || '#ffffff'}
                  onChange={e => update({ stroke: e.target.value })}
                  className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-sm text-gray-600">{selectedElement.stroke || '#ffffff'}</span>
              </div>

              <SectionLabel>Stroke Width</SectionLabel>
              <Slider
                min={1}
                max={20}
                value={selectedElement.strokeWidth ?? 2}
                onChange={val => update({ strokeWidth: val })}
              />
            </>
          )}
        </div>
      ),
    },
    {
      key: 'layers',
      label: <span className="font-semibold text-sm">🗂️ Layers</span>,
      children: (
        <div className="space-y-1">
          {elements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No layers yet</p>
          )}
          {[...elements].reverse().map((el, revIdx) => {
            const realIdx = elements.length - 1 - revIdx;
            const isSelected = el.id === selectedId;
            return (
              <div
                key={el.id}
                onClick={() => dispatch({ type: 'SELECT_ELEMENT', payload: el.id })}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors duration-100 ${
                  isSelected ? 'bg-indigo-50 border border-indigo-300' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="text-gray-700 truncate max-w-[80px]">
                  {el.type === 'text' ? `T: ${el.text?.slice(0, 10) ?? ''}…` : `${el.type} ${realIdx + 1}`}
                </span>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button
                    size="small"
                    icon={<ArrowUpOutlined />}
                    onClick={() => moveUp(el.id)}
                    disabled={realIdx === elements.length - 1}
                  />
                  <Button
                    size="small"
                    icon={<ArrowDownOutlined />}
                    onClick={() => moveDown(el.id)}
                    disabled={realIdx === 0}
                  />
                  <Button
                    size="small"
                    icon={el.locked ? <LockOutlined /> : <UnlockOutlined />}
                    type={el.locked ? 'primary' : 'default'}
                    onClick={() => dispatch({ type: 'LOCK_ELEMENT', payload: el.id })}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch({ type: 'DELETE_ELEMENT', payload: el.id })}
                  />
                </div>
              </div>
            );
          })}
          {selectedElement && (
            <Button danger block className="mt-2" icon={<DeleteOutlined />} onClick={deleteSelected}>
              Delete Selected
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <Collapse
        accordion
        defaultActiveKey={['text']}
        items={collapseItems}
        size="small"
        className="bg-white"
      />
    </div>
  );
}
