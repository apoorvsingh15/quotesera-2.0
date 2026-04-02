'use client';

import React, { useEffect, useRef } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Circle,
  Line,
  Image as KonvaImage,
  Transformer,
} from 'react-konva';
import Konva from 'konva';
import type { Filter } from 'konva/lib/Node';
import useImage from 'use-image';
import { useEditor } from '../context/EditorContext';
import type { CanvasElement as CanvasElementType } from '../context/EditorContext';

// ─── Gradient helper ────────────────────────────────────────────────────────

function getGradientPoints(
  direction: string,
  width: number,
  height: number
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  switch (direction) {
    case 'to right':
      return { start: { x: 0, y: 0 }, end: { x: width, y: 0 } };
    case 'to bottom':
      return { start: { x: 0, y: 0 }, end: { x: 0, y: height } };
    case 'to bottom right':
      return { start: { x: 0, y: 0 }, end: { x: width, y: height } };
    case 'to top right':
      return { start: { x: 0, y: height }, end: { x: width, y: 0 } };
    case 'to top':
      return { start: { x: 0, y: height }, end: { x: 0, y: 0 } };
    default:
      return { start: { x: 0, y: 0 }, end: { x: 0, y: height } };
  }
}

function buildColorStops(colors: string[]): (number | string)[] {
  const stops: (number | string)[] = [];
  const total = Math.max(colors.length - 1, 1);
  colors.forEach((color, i) => {
    stops.push(i / total);
    stops.push(color);
  });
  return stops;
}

// ─── Background image node with filters ────────────────────────────────────

interface BgImageProps {
  url: string;
  width: number;
  height: number;
  blur: number;
  brightness: number;
  contrast: number;
}

function BackgroundImageNode({ url, width, height, blur, brightness, contrast }: BgImageProps) {
  const [image] = useImage(url, 'anonymous');
  const imgRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    if (!image) return;

    const filters: Filter[] = [];
    if (blur > 0) filters.push(Konva.Filters.Blur);
    if (brightness !== 100) filters.push(Konva.Filters.Brighten);
    if (contrast !== 100) filters.push(Konva.Filters.Contrast);

    if (filters.length > 0) {
      imgRef.current.filters(filters);
      if (blur > 0) imgRef.current.blurRadius(blur);
      if (brightness !== 100) imgRef.current.brightness((brightness - 100) / 100);
      if (contrast !== 100) imgRef.current.contrast(contrast - 100);
      imgRef.current.cache();
    } else {
      imgRef.current.clearCache();
      imgRef.current.filters([]);
    }
    imgRef.current.getLayer()?.batchDraw();
  }, [image, blur, brightness, contrast]);

  return (
    <KonvaImage
      ref={imgRef}
      image={image}
      width={width}
      height={height}
      x={0}
      y={0}
    />
  );
}

// ─── Main Canvas component ──────────────────────────────────────────────────

const MIN_ELEMENT_SIZE = 5;

export interface CanvasProps {
  stageRef: React.RefObject<Konva.Stage>;
  scale: number;
}

export default function Canvas({ stageRef, scale }: CanvasProps) {
  const { state, dispatch } = useEditor();
  const { elements, selectedId, background, overlay, canvasSize } = state;

  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedElement = elements.find(el => el.id === selectedId);

  // Attach transformer to selected node
  useEffect(() => {
    if (!transformerRef.current) return;
    const tr = transformerRef.current;
    const stage = tr.getStage();
    if (!stage) return;

    if (selectedId && selectedElement && selectedElement.type !== 'line') {
      const node = stage.findOne(`#${selectedId}`);
      if (node) {
        tr.nodes([node]);
      } else {
        tr.nodes([]);
      }
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements, selectedElement]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Stage') {
      dispatch({ type: 'DESELECT' });
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id, x: e.target.x(), y: e.target.y() },
    });
    dispatch({ type: 'PUSH_HISTORY' });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id,
        x: node.x(),
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
        rotation: node.rotation(),
      },
    });
    dispatch({ type: 'PUSH_HISTORY' });
  };

  // ─── Background rendering ─────────────────────────────────────────────────

  const renderBackground = () => {
    if (background.type === 'color') {
      return (
        <Rect
          width={canvasSize.width}
          height={canvasSize.height}
          fill={background.color || '#000000'}
          listening={false}
        />
      );
    }

    if (background.type === 'gradient' && background.gradient) {
      const { start, end } = getGradientPoints(
        background.gradient.direction,
        canvasSize.width,
        canvasSize.height
      );
      return (
        <Rect
          width={canvasSize.width}
          height={canvasSize.height}
          fillLinearGradientStartPoint={start}
          fillLinearGradientEndPoint={end}
          fillLinearGradientColorStops={buildColorStops(background.gradient.colors)}
          listening={false}
        />
      );
    }

    if (background.type === 'image' && background.imageUrl) {
      return (
        <BackgroundImageNode
          url={background.imageUrl}
          width={canvasSize.width}
          height={canvasSize.height}
          blur={overlay.blur}
          brightness={overlay.brightness}
          contrast={overlay.contrast}
        />
      );
    }

    return (
      <Rect
        width={canvasSize.width}
        height={canvasSize.height}
        fill="#000000"
        listening={false}
      />
    );
  };

  // ─── Element rendering ────────────────────────────────────────────────────

  const renderElement = (el: CanvasElementType) => {
    const commonProps = {
      key: el.id,
      id: el.id,
      x: el.x,
      y: el.y,
      scaleX: el.scaleX ?? 1,
      scaleY: el.scaleY ?? 1,
      rotation: el.rotation ?? 0,
      draggable: !el.locked,
      onClick: () => dispatch({ type: 'SELECT_ELEMENT', payload: el.id }),
      onTap: () => dispatch({ type: 'SELECT_ELEMENT', payload: el.id }),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, el.id),
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, el.id),
    };

    switch (el.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={el.text || 'Text'}
            fontSize={el.fontSize || 24}
            fontFamily={el.fontFamily || 'Roboto'}
            fontStyle={el.fontStyle || 'normal'}
            textDecoration={el.textDecoration || ''}
            fill={el.fill || '#ffffff'}
            align={(el.align as 'left' | 'center' | 'right') || 'left'}
            letterSpacing={el.letterSpacing || 0}
            lineHeight={el.lineHeight || 1.2}
            width={el.width || 300}
            wrap="word"
          />
        );
      case 'rect':
        return (
          <Rect
            {...commonProps}
            width={el.rectWidth || 100}
            height={el.rectHeight || 100}
            fill={el.shapeFill || 'transparent'}
            stroke={el.stroke || '#ffffff'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={el.radius || 50}
            fill={el.shapeFill || 'transparent'}
            stroke={el.stroke || '#ffffff'}
            strokeWidth={el.strokeWidth || 2}
          />
        );
      case 'line':
        return (
          <Line
            {...commonProps}
            points={el.points || [0, 0, 100, 0]}
            stroke={el.stroke || '#ffffff'}
            strokeWidth={el.strokeWidth || 2}
            lineCap="round"
            lineJoin="round"
          />
        );
      default:
        return null;
    }
  };

  const isTextSelected = selectedElement?.type === 'text';

  return (
    <Stage
      width={canvasSize.width * scale}
      height={canvasSize.height * scale}
      scale={{ x: scale, y: scale }}
      ref={stageRef}
      onClick={handleStageClick}
      onTap={handleStageClick}
    >
      {/* Background layer */}
      <Layer>
        {renderBackground()}
        {overlay.opacity > 0 && background.type !== 'image' && (
          <Rect
            width={canvasSize.width}
            height={canvasSize.height}
            fill={overlay.color}
            opacity={overlay.opacity}
            listening={false}
          />
        )}
        {overlay.opacity > 0 && background.type === 'image' && (
          <Rect
            width={canvasSize.width}
            height={canvasSize.height}
            fill={overlay.color}
            opacity={overlay.opacity}
            listening={false}
          />
        )}
      </Layer>

      {/* Elements + Transformer layer */}
      <Layer>
        {elements.map(renderElement)}
        <Transformer
          ref={transformerRef}
          rotateEnabled={true}
          keepRatio={!isTextSelected}
          enabledAnchors={
            isTextSelected
              ? [
                  'top-left', 'top-right',
                  'bottom-left', 'bottom-right',
                  'middle-left', 'middle-right',
                ]
              : undefined
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < MIN_ELEMENT_SIZE || Math.abs(newBox.height) < MIN_ELEMENT_SIZE) return oldBox;
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}
