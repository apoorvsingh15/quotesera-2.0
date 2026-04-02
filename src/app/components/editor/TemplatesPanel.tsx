'use client';

import React from 'react';
import { Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEditor } from '../../context/EditorContext';
import type { BackgroundConfig } from '../../context/EditorContext';

interface Template {
  label: string;
  bg: BackgroundConfig;
  preview: string; // CSS background string for preview div
}

const TEMPLATES: Template[] = [
  {
    label: 'Pure Black',
    bg: { type: 'color', color: '#000000' },
    preview: '#000000',
  },
  {
    label: 'Pure White',
    bg: { type: 'color', color: '#ffffff' },
    preview: '#ffffff',
  },
  {
    label: 'Ocean Blue',
    bg: { type: 'gradient', gradient: { colors: ['#1a1a2e', '#16213e', '#0f3460'], direction: 'to bottom' } },
    preview: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)',
  },
  {
    label: 'Sunset',
    bg: { type: 'gradient', gradient: { colors: ['#ff6b6b', '#feca57'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #ff6b6b, #feca57)',
  },
  {
    label: 'Forest',
    bg: { type: 'gradient', gradient: { colors: ['#134e5e', '#71b280'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #134e5e, #71b280)',
  },
  {
    label: 'Purple Haze',
    bg: { type: 'gradient', gradient: { colors: ['#8360c3', '#2ebf91'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #8360c3, #2ebf91)',
  },
  {
    label: 'Midnight',
    bg: { type: 'gradient', gradient: { colors: ['#0f0c29', '#302b63', '#24243e'], direction: 'to bottom' } },
    preview: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)',
  },
  {
    label: 'Rose Gold',
    bg: { type: 'gradient', gradient: { colors: ['#b76e79', '#f7cac9'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #b76e79, #f7cac9)',
  },
  {
    label: 'Deep Space',
    bg: { type: 'gradient', gradient: { colors: ['#000428', '#004e92'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #000428, #004e92)',
  },
  {
    label: 'Warm Sand',
    bg: { type: 'color', color: '#f5deb3' },
    preview: '#f5deb3',
  },
  {
    label: 'Charcoal',
    bg: { type: 'color', color: '#36454f' },
    preview: '#36454f',
  },
  {
    label: 'Coral Reef',
    bg: { type: 'gradient', gradient: { colors: ['#ff9966', '#ff5e62'], direction: 'to bottom right' } },
    preview: 'linear-gradient(to bottom right, #ff9966, #ff5e62)',
  },
];

export default function TemplatesPanel() {
  const { dispatch } = useEditor();

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      dispatch({ type: 'SET_BACKGROUND', payload: { type: 'image', imageUrl } });
    };
    reader.readAsDataURL(file);
    return false; // prevent default upload
  };

  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Upload Image
      </p>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleUpload}
      >
        <Button icon={<UploadOutlined />} className="w-full mb-4" block>
          Upload Background
        </Button>
      </Upload>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Background Templates
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.label}
            onClick={() => dispatch({ type: 'SET_BACKGROUND', payload: tpl.bg })}
            className="flex flex-col items-center gap-1 p-1 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all duration-150 cursor-pointer bg-white"
          >
            <div
              className="w-full rounded"
              style={{
                height: 52,
                background: tpl.preview,
                border: tpl.label === 'Pure White' ? '1px solid #e5e7eb' : 'none',
              }}
            />
            <span className="text-xs text-gray-600 text-center leading-tight">{tpl.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
