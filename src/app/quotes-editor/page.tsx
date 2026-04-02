'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button, Select, Tooltip } from 'antd';
import {
  UndoOutlined,
  RedoOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import Konva from 'konva';
import { EditorProvider, useEditor, CANVAS_SIZES } from '../context/EditorContext';
import TemplatesPanel from '../components/editor/TemplatesPanel';
import RightPanel from '../components/editor/RightPanel';

const Canvas = dynamic(() => import('../components/canvas'), { ssr: false });

// ─── Editor inner content (uses context) ────────────────────────────────────

function EditorContent() {
  const { state, dispatch } = useEditor();
  const { canvasSize, historyIndex, history } = state;

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const computeScale = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = 48;
    const scaleX = (width - padding) / canvasSize.width;
    const scaleY = (height - padding) / canvasSize.height;
    setScale(Math.min(scaleX, scaleY, 1));
  }, [canvasSize]);

  useEffect(() => {
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [computeScale]);

  const handleExport = (format: 'png' | 'jpeg') => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    // Save current scale
    const currentScaleX = stage.scaleX();
    const currentScaleY = stage.scaleY();
    const currentWidth = stage.width();
    const currentHeight = stage.height();

    // Reset to full size for export
    stage.scale({ x: 1, y: 1 });
    stage.width(canvasSize.width);
    stage.height(canvasSize.height);
    stage.draw();

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = stage.toDataURL({ mimeType, pixelRatio: 2 });

    // Restore display scale
    stage.scale({ x: currentScaleX, y: currentScaleY });
    stage.width(currentWidth);
    stage.height(currentHeight);
    stage.draw();

    const link = document.createElement('a');
    link.download = `quotesera-quote.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0" style={{ height: 52 }}>
        {/* Left */}
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 no-underline">
          ← Home
        </Link>

        {/* Center – platform size */}
        <Select
          value={canvasSize.label}
          style={{ width: 220 }}
          size="small"
          onChange={label => {
            const size = CANVAS_SIZES.find(s => s.label === label);
            if (size) dispatch({ type: 'SET_CANVAS_SIZE', payload: size });
          }}
          options={CANVAS_SIZES.map(s => ({ label: s.label, value: s.label }))}
        />

        {/* Right – actions */}
        <div className="flex items-center gap-2">
          <Tooltip title="Undo">
            <Button
              size="small"
              icon={<UndoOutlined />}
              disabled={!canUndo}
              onClick={() => dispatch({ type: 'UNDO' })}
            />
          </Tooltip>
          <Tooltip title="Redo">
            <Button
              size="small"
              icon={<RedoOutlined />}
              disabled={!canRedo}
              onClick={() => dispatch({ type: 'REDO' })}
            />
          </Tooltip>
          <Tooltip title="Export PNG">
            <Button
              size="small"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('png')}
            >
              PNG
            </Button>
          </Tooltip>
          <Tooltip title="Export JPG">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('jpeg')}
            >
              JPG
            </Button>
          </Tooltip>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <aside
          className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 editor-scrollbar"
        >
          <TemplatesPanel />
        </aside>

        {/* Center – Canvas */}
        <main
          ref={containerRef}
          className="flex-1 overflow-hidden flex items-center justify-center bg-gray-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) dispatch({ type: 'DESELECT' });
          }}
        >
          <div
            className="shadow-2xl"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              flexShrink: 0,
            }}
          >
            <Canvas stageRef={stageRef} scale={scale} />
          </div>
        </main>

        {/* Right Panel */}
        <aside
          className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 editor-scrollbar"
        >
          <RightPanel />
        </aside>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
