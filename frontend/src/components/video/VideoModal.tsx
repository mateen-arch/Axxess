import React from 'react';
import { X, ExternalLink, Video } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const VideoModal: React.FC = () => {
  const { activeVideo, setActiveVideo } = useHealthcare();

  if (!activeVideo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 dark:bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-charcoal-850 rounded-2xl shadow-2xl border border-slate-200 dark:border-charcoal-700 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-charcoal-700 flex items-center justify-between bg-slate-50 dark:bg-charcoal-900">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-lg">
              {activeVideo.title}
            </h3>
          </div>
          <button
            onClick={() => setActiveVideo(null)}
            className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-charcoal-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`${activeVideo.videoEmbedUrl}?autoplay=1`}
            title={activeVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>

        {/* Description Footer */}
        <div className="p-4 bg-slate-50 dark:bg-charcoal-900 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
          <p className="line-clamp-2 max-w-xl text-[11px] leading-relaxed">
            {activeVideo.summary}
          </p>
          <button
            onClick={() => setActiveVideo(null)}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
