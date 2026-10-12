import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 2초 후 페이드아웃 시작
    const timer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // 페이드아웃 애니메이션 완료 후(0.5초) 스플래시 종료 알림
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        color: '#ffffff',
      }}
    >
      {/* 로고 영역 */}
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        My App
      </div>

      {/* 로딩 인디케이터 (CSS Keyframes 애니메이션) */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.2)',
          borderTop: '4px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* 인라인 애니메이션 스타일 정의 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
