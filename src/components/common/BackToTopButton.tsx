import React, { useEffect, useState } from 'react';

const BackToTopButton: React.FC<{ noFixed?: boolean }> = ({ noFixed }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`${noFixed ? '' : 'fixed'} z-50 right-4 bottom-4 md:right-8 md:bottom-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/80 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 backdrop-blur-lg border border-white/20`}
      aria-label="回到顶部"
    >
      <svg 
        className="w-6 h-6 md:w-7 md:h-7" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={3} 
        viewBox="0 0 24 24"
      >
        <path d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default BackToTopButton; 