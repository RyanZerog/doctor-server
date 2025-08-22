import { useState, useEffect } from 'react';

/**
 * 响应式Hook
 * 根据屏幕尺寸返回当前的断点信息
 */
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // 根据Ant Design的断点设置
      if (width < 576) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 992) {
        setBreakpoint('md');
      } else if (width < 1200) {
        setBreakpoint('lg');
      } else if (width < 1600) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('xxl');
      }
    };

    // 初始化
    handleResize();

    // 添加事件监听器
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    screenSize,
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl',
    isSmallScreen: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md'
  };
};

export default useResponsive;
