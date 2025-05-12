import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export interface ShareCardProps {
  title: string;
  excerpt?: string;
  author: string;
  avatar?: string;
  content?: string; // 摘录内容
  url: string;
}

const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ title, excerpt, author, avatar, content, url }, ref) => {
    // 保留段落，支持多段摘录
    const contentParagraphs = (content || '').split(/\n+/).filter(Boolean);

    return (
      <div
        ref={ref}
        style={{
          width: 340,
          minHeight: 200,
          background: `url('/images/sharecard-bg.jpg') center/cover no-repeat, linear-gradient(135deg, #e6f0ff 0%, #bcd7f7 60%, #fffbe6 100%)`,
          borderRadius: 22,
          boxShadow: '0 6px 32px 0 rgba(80,120,180,0.10)',
          padding: 20,
          fontFamily: 'inherit',
          color: '#222',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid #e0e7ef',
        }}
      >
        {/* 文章标题和副标题 */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, lineHeight: 1.3, wordBreak: 'break-all' }}>{title}</div>
          {excerpt && <div style={{ fontSize: 13, color: '#888', fontWeight: 500, marginBottom: 2, lineHeight: 1.4, wordBreak: 'break-all' }}>{excerpt}</div>}
        </div>
        {/* 摘录内容/正文分段 */}
        {content && (
          <div
            style={{
              background: 'rgba(255,255,255,0.45)',
              borderRadius: 12,
              padding: 14,
              fontSize: 15,
              color: '#333',
              marginBottom: 14,
              marginTop: 10,
              fontStyle: 'italic',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              minHeight: 32,
              lineHeight: 1.7,
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              border: 'none',
            }}
          >
            {contentParagraphs.map((p, i) => (
              <p key={i} style={{ margin: i === 0 ? 0 : '0.8em 0 0 0' }}>{p}</p>
            ))}
          </div>
        )}
        {/* 底部信息区：左下作者，右下出处+二维码 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8, minHeight: 56 }}>
          {/* 左下：头像+作者名（上下两行） */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
            <img
              src={avatar || '/images/avatar.png'}
              alt={author}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                marginBottom: -2,
                objectFit: 'cover',
                border: '1.5px solid #e0e7ef',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'block',
              }}
            />
            <span style={{
              fontSize: 15,
              color: '#666',
              fontWeight: 500,
              lineHeight: '20px',
              display: 'block',
              margin: 0
            }}>神谷綺夜</span>
          </div>
          {/* 右下：出处+二维码 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 2 }}>
              <div style={{ fontSize: 15, color: '#666', fontWeight: 500, fontFamily: 'inherit' }}>Toyconの世界探索記</div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 400, fontFamily: 'inherit' }}>分享自 Toycon 博客</div>
            </div>
            <QRCodeCanvas value={url} size={44} fgColor="#222" bgColor="transparent" style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(80,120,180,0.10)', background: 'transparent' }} />
          </div>
        </div>
      </div>
    );
  }
);

export default ShareCard;