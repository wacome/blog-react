import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

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
    const [isLongPress, setIsLongPress] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout>();
    const cardRef = useRef<HTMLDivElement>(null);

    // 处理长按事件
    const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
        setIsLongPress(true);
        handleSaveImage();
      }, 500); // 500ms 长按触发
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      setIsLongPress(false);
    };

    const handleTouchMove = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      setIsLongPress(false);
    };

    // 保存图片
    const handleSaveImage = async () => {
      if (!cardRef.current) return;
      
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });
        
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('保存图片失败:', error);
      }
    };

    // 保留段落，支持多段摘录
    const contentParagraphs = (content || '').split(/\n+/).filter(Boolean);

    return (
      <div
        ref={cardRef}
        style={{
          width: '100%',
          minHeight: 200,
          background: `url('https://blog-1257292087.cos.ap-nanjing.myqcloud.com/content-cover.jpg') center/cover no-repeat, linear-gradient(135deg, #e6f0ff 0%, #bcd7f7 60%, #fffbe6 100%)`,
          borderRadius: 22,
          boxShadow: '0 6px 32px 0 rgba(80,120,180,0.10)',
          padding: 16,
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
          touchAction: 'none', // 防止移动端默认行为
        }}
      >
        {/* 文章标题和副标题 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            marginBottom: 4, 
            lineHeight: 1.3, 
            wordBreak: 'break-all' 
          }}>{title}</div>
          {excerpt && (
            <div style={{ 
              fontSize: 'clamp(12px, 3vw, 13px)', 
              color: '#888', 
              fontWeight: 500, 
              marginBottom: 2, 
              lineHeight: 1.4, 
              wordBreak: 'break-all' 
            }}>{excerpt}</div>
          )}
        </div>
        {/* 摘录内容/正文分段 */}
        {content && (
          <div
            style={{
              background: 'rgba(255,255,255,0.45)',
              borderRadius: 12,
              padding: 12,
              fontSize: 'clamp(13px, 3.5vw, 15px)',
              color: '#333',
              marginBottom: 12,
              marginTop: 8,
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          marginTop: 8, 
          minHeight: 48 
        }}>
          {/* 左下：头像+作者名（上下两行） */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
            <img
              src={avatar || 'https://blog-1257292087.cos.ap-nanjing.myqcloud.com/avatar.png'}
              alt={author}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                marginBottom: -2,
                objectFit: 'cover',
                border: '1.5px solid #e0e7ef',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'block',
              }}
            />
            <span style={{
              fontSize: 'clamp(12px, 3vw, 15px)',
              color: '#666',
              fontWeight: 500,
              lineHeight: '20px',
              display: 'block',
              margin: 0
            }}>神谷綺夜</span>
          </div>
          {/* 右下：出处+二维码 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(171, 169, 206, 0.28)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              borderRadius: 17,
              padding: '6px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginBottom: 2,
              }}
            >
              <div style={{
                fontSize: 'clamp(12px, 3vw, 15px)',
                color: '#666',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}>Toyconの世界探索記</div>
              <div style={{
                fontSize: 'clamp(10px, 2.5vw, 11px)',
                color: '#777',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}>分享自 Toycon 博客</div>
            </div>
            <QRCodeCanvas 
              value={url} 
              size={40} 
              fgColor="#222" 
              bgColor="transparent" 
              style={{ 
                borderRadius: 8, 
                boxShadow: '0 1px 4px rgba(80,120,180,0.10)', 
                background: 'transparent' 
              }} 
            />
          </div>
        </div>
      </div>
    );
  }
);

export default ShareCard;