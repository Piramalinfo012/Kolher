import React from 'react';
import '@google/model-viewer';


interface Product3DViewerProps {
  modelUrl?: string;
  altText?: string;
  className?: string;
  colorHex?: string;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ 
  modelUrl = '/products/placeholder.glb',
  altText = 'A 3D model of the product',
  className = '',
  colorHex = '#C8C8C8'
}) => {
  // Extract filename from URL for the note
  const expectedPath = `public${modelUrl}`;

  return (
    <div className={`w-full h-full min-h-[400px] flex flex-col items-center justify-center ${className}`}>
      <model-viewer
        src={modelUrl}
        alt={altText}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%' }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10"
          slot="poster" 
        >
          <div className="flex flex-col items-center animate-pulse">
            <svg className="w-10 h-10 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <span className="text-sm font-semibold text-neutral-600">Loading 3D Model...</span>
            <span className="text-xs text-neutral-500 mt-1 max-w-[200px] text-center">
              Make sure you have converted your 3D files to .glb format and placed them in the public folder.
            </span>
          </div>
        </div>
      </model-viewer>
      
      <div className="text-xs text-neutral-500 text-center mt-4">
        <span className="font-bold">Note:</span> Please convert your <code className="bg-neutral-100 px-1 py-0.5 rounded">.3ds</code> / <code className="bg-neutral-100 px-1 py-0.5 rounded">.skp</code> files to <code className="bg-neutral-100 px-1 py-0.5 rounded">.glb</code> format and place it in <code className="bg-neutral-100 px-1 py-0.5 rounded">{expectedPath}</code> for it to show up here.
      </div>
    </div>
  );
};
