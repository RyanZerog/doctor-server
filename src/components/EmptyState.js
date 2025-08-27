import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * 统一的空状态组件
 * @param {string} type - 空状态类型 'noData' | 'noSearch' | 'error'
 * @param {string} title - 主标题
 * @param {string} description - 描述文字
 * @param {Function} onAction - 主要操作回调
 * @param {string} actionText - 操作按钮文字
 * @param {Function} onSecondaryAction - 次要操作回调
 * @param {string} secondaryActionText - 次要操作按钮文字
 */
const EmptyState = ({
  type = 'noData',
  title,
  description,
  onAction,
  actionText,
  onSecondaryAction,
  secondaryActionText,
  style = {}
}) => {
  // 根据类型设置默认配置
  const getDefaultConfig = () => {
    switch (type) {
      case 'noSearch':
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          title: title || '没有找到相关数据',
          description: description || '尝试调整搜索条件或筛选器',
          actionText: actionText || '清除筛选',
          actionIcon: <ReloadOutlined />
        };
      case 'error':
        return {
          image: Empty.PRESENTED_IMAGE_SIMPLE,
          title: title || '加载失败',
          description: description || '数据加载时出现问题，请重试',
          actionText: actionText || '重新加载',
          actionIcon: <ReloadOutlined />
        };
      default: // noData
        return {
          image: Empty.PRESENTED_IMAGE_DEFAULT,
          title: title || '暂无数据',
          description: description || '还没有任何数据，点击下方按钮开始添加',
          actionText: actionText || '添加数据',
          actionIcon: <PlusOutlined />
        };
    }
  };

  const config = getDefaultConfig();

  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center',
      ...style 
    }}>
      <Empty
        image={config.image}
        description={
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              marginBottom: '8px',
              color: 'rgba(0, 0, 0, 0.85)'
            }}>
              {config.title}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: 'rgba(0, 0, 0, 0.45)' 
            }}>
              {config.description}
            </div>
          </div>
        }
      >
        <div style={{ marginTop: '16px' }}>
          {onAction && (
            <Button 
              type="primary" 
              icon={config.actionIcon}
              onClick={onAction}
              style={{ marginRight: onSecondaryAction ? '12px' : '0' }}
            >
              {config.actionText}
            </Button>
          )}
          {onSecondaryAction && (
            <Button onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      </Empty>
    </div>
  );
};

export default EmptyState;
