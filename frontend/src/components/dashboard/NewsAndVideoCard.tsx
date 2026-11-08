import React from 'react';
import { Play, Sparkles, Newspaper, ExternalLink, ArrowRight, Video } from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

export const NewsAndVideoCard: React.FC = () => {
  const { announcements, setActiveVideo } = useHealthcare();

  const featuredVideoItem = announcements.find((a) => a.videoEmbedUrl);
  const newsArticles = announcements.filter((a) => !a.videoEmbedUrl);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-pearl-200 dark:border-charcoal-700">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Newspaper size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Care Intelligence & Industry News</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Continuing education & clinical best practices</span>
          </div>
        </div>
        <span className="badge badge-crimson text-xs">
          <Sparkles size={11} /> AI Insights
        </span>
      </div>

      {/* Main Grid: Video Spotlight on Left/Top + News Feed on Right */}
      <div className="my-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Featured Video Spotlight */}
        {featuredVideoItem && (
          <div
            onClick={() => setActiveVideo(featuredVideoItem)}
            className="group relative rounded-xl overflow-hidden cursor-pointer border border-pearl-200 dark:border-charcoal-700 shadow-sm hover:shadow-md transition-all flex flex-col bg-white dark:bg-charcoal-850"
          >
            {/* Visual Cover Mockup */}
            <div className="relative h-44 w-full bg-gradient-to-tr from-charcoal-950 via-charcoal-900 to-rose-950/60 overflow-hidden flex items-center justify-center">
              {/* Play Button Pulsing Overlay */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-rose-600 group-hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <Play size={24} className="ml-1 fill-white" />
              </div>

              {/* Tag / Overlay Pill */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md border border-white/20">
                  <Video size={11} className="text-rose-400" />
                  Featured Keynote
                </span>
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="video-meta-box p-3.5 flex-1 flex flex-col justify-between transition-colors border-t border-pearl-200 dark:border-charcoal-700">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                  {featuredVideoItem.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {featuredVideoItem.summary}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-pearl-200 dark:border-charcoal-700 text-[11px]">
                <span className="text-rose-600 dark:text-rose-400 font-semibold group-hover:underline flex items-center gap-1">
                  Watch Video Keynote
                  <ArrowRight size={12} />
                </span>
                <span className="text-slate-400 dark:text-slate-500">12 mins</span>
              </div>
            </div>
          </div>
        )}

        {/* News & Updates List */}
        <div className="flex flex-col justify-between space-y-2.5">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="p-3 rounded-xl bg-pearl-50 dark:bg-charcoal-850/80 border border-pearl-200 dark:border-charcoal-700 hover:bg-white dark:hover:bg-charcoal-800 hover:border-pearl-300 dark:hover:border-charcoal-600 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                  {article.category}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{article.timestamp}</span>
              </div>

              <h4 className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                {article.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {article.summary}
              </p>
            </div>
          ))}

          {/* Quick CMS Insight Pill */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50/70 to-pearl-50 dark:from-charcoal-850 dark:to-charcoal-800 border border-rose-100 dark:border-charcoal-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-[11px] text-slate-700 dark:text-slate-300">
                <strong>OASIS-E1 Guidance:</strong> New automated compliance engine is active.
              </span>
            </div>
            <ExternalLink size={13} className="text-rose-600 dark:text-rose-400 shrink-0 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-pearl-200 dark:border-charcoal-700 flex items-center justify-between text-xs">
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Standards Home Care Knowledge Stream</span>
        <button className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-xs flex items-center gap-1">
          <span>View All News & Updates</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
