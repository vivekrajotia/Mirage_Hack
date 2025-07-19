'use client';

import GraphEngineExamples from '@/components/graph-engine/graph-engine-examples';
import { useEffect, useState } from 'react';

export default function GraphEngineDemoPage() {
  const [previewConfig, setPreviewConfig] = useState(null);

  useEffect(() => {
    const storedConfig = localStorage.getItem('widgetPreviewConfig');
    if (storedConfig) {
      setPreviewConfig(JSON.parse(storedConfig));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <GraphEngineExamples previewConfig={previewConfig} />
    </div>
  );
} 