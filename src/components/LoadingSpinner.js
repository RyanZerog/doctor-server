import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * 统一的加载组件
 * @param {boolean} spinning - 是否显示加载状态
 * @param {string} tip - 加载提示文字
 * @param {React.ReactNode} children - 子组件
 * @param {string} size - 加载图标大小 'small' | 'default' | 'large'
 */
const LoadingSpinner = ({ 
  spinning = false, 
  tip = '加载中...', 
  children, 
  size = 'default',
  style = {}
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} spin />;

  if (!children) {
    // 独立的加载组件
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 20px',
        ...style 
      }}>
        <Spin indicator={antIcon} size={size} />
        <Text type="secondary" style={{ marginTop: 12 }}>
          {tip}
        </Text>
      </div>
    );
  }

  // 包装子组件的加载状态
  return (
    <Spin 
      spinning={spinning} 
      tip={tip} 
      indicator={antIcon}
      size={size}
    >
      {children}
    </Spin>
  );
};

export default LoadingSpinner;
