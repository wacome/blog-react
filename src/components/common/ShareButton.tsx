import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import ShareCard from './ShareCard';

const ShareButton: React.FC<{ show?: boolean; post?: any }> = ({ show, post }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImg, setShareImg] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!show) return null;

  const handleShare = async () => {
    setShowShareModal(true);
    setShareImg(null);
    setTimeout(async () => {
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
        setShareImg(canvas.toDataURL('image/png'));
      }
    }, 100);
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="w-12 h-12 rounded-full bg-[#b3e0e7]/80 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-200 backdrop-blur-lg border border-[#e5e7eb]"
        aria-label="分享"
        style={{fontFamily: 'inherit'}}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M14 9V5a1 1 0 00-1-1h-7a1 1 0 00-1 1v14a1 1 0 001 1h7a1 1 0 001-1v-4" />
          <path d="M17 12l-4-4m0 0l4-4m-4 4h9" />
        </svg>
      </button>
      {showShareModal && post && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl p-6 relative max-w-full" style={{ minWidth: 420 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowShareModal(false)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
            {!shareImg && (
              <ShareCard
                ref={cardRef}
                title={post.title}
                excerpt={post.excerpt || post.summary || ''}
                author={post.author || (post.authorInfo && post.authorInfo.name) || '匿名'}
                avatar={post.authorAvatar || (post.authorInfo && post.authorInfo.avatar) || ''}
                content={window.getSelection()?.toString().trim() || ''}
                url={typeof window !== 'undefined' ? window.location.href : ''}
              />
            )}
            {shareImg && (
              <div>
                <img src={shareImg} alt="分享卡片" style={{ borderRadius: 20, maxWidth: '100%' }} />
                <div className="text-center mt-2 text-gray-500 text-sm">长按或右键保存图片</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton; 