import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  TagsOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  HeartOutlined
} from '@ant-design/icons';

import usePatientStore from '../store/usePatientStore';
import { getToday } from '../utils/dateUtils';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { patients } = usePatientStore();

  // 获取今天的随访提醒数量
  const todayReminders = patients.filter(
    patient => patient.nextFollowUp === getToday()
  ).length;

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '总览',
    },
    {
      key: '/patients',
      icon: <TeamOutlined />,
      label: '患者管理',
    },
    {
      key: '/tags',
      icon: <TagsOutlined />,
      label: '标签管理',
    },
    {
      key: '/collaboration',
      icon: <UsergroupAddOutlined />,
      label: '医患协同',
      children: [
        {
          key: '/follow-up',
          icon: <BellOutlined />,
          label: (
            <Space>
              随访提醒
              {todayReminders > 0 && (
                <Badge count={todayReminders} size="small" offset={[5, 0]} />
              )}
            </Space>
          ),
        },
        {
          key: '/collaboration/assessment-details',
          icon: <BarChartOutlined />,
          label: '评分详情',
        },
        {
          key: '/collaboration/rehabilitation',
          icon: <HeartOutlined />,
          label: '康复治疗',
        },
      ],
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  // 页面标题动画效果
  useEffect(() => {
    document.querySelector('.page-title')?.classList.add('fade-in');
    return () => {
      document.querySelector('.page-title')?.classList.remove('fade-in');
    };
  }, [location.pathname]);

  const getCurrentMenuKey = () => {
    const path = location.pathname;

    // 精确匹配根路径
    if (path === '/') {
      return ['/'];
    }

    // 检查是否是子菜单项
    for (const item of menuItems) {
      if (item.children) {
        const matchedChild = item.children.find(child => path === child.key);
        if (matchedChild) {
          return [matchedChild.key];
        }
      }
    }

    // 查找匹配项
    const matchedItem = menuItems.find(item => {
      if (typeof item.key === 'string' && item.key !== '/') {
        return path.startsWith(item.key);
      }
      return false;
    });

    // 只返回匹配的key，不返回默认值
    return matchedItem ? [matchedItem.key] : [''];
  };

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className="main-sider"
      >
        <div className={`logo-container ${collapsed ? 'collapsed' : ''}`}>
          <MedicineBoxOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">面瘫患者评估及康复治疗管理平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getCurrentMenuKey()}
          items={menuItems}
          onClick={({ key }) => {
            // 如果点击的是医患协同父菜单，导航到第一个子菜单项
            if (key === '/collaboration') {
              navigate('/follow-up');
            } else {
              navigate(key);
            }
          }}
          className="main-menu"
        />
        <div className="sider-footer">
          {!collapsed && (
            <div className="version-info">
              <span>v1.0.0</span>
            </div>
          )}
        </div>
      </Sider>
      <Layout>
        <Header className="main-header">
          <div className="header-left">
            <div
              className="trigger-button"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Title level={4} className="page-title">
              {(() => {
                const path = location.pathname;
                const currentKeys = getCurrentMenuKey();
                const currentKey = currentKeys[0];

                // 检查是否是子菜单项
                for (const item of menuItems) {
                  if (item.children) {
                    const matchedChild = item.children.find(child => child.key === currentKey);
                    if (matchedChild) {
                      // 特殊处理随访提醒，只显示文字部分
                      if (currentKey === '/follow-up') {
                        return '随访提醒';
                      }
                      return matchedChild.label;
                    }
                  }
                }

                // 默认显示菜单项标题
                const menuItem = menuItems.find(item => item.key === currentKey);
                return menuItem?.label || '总览';
              })()}
            </Title>
          </div>
          <div className="header-right">
            <Space size="large">
              <Badge dot offset={[-2, 5]}>
                <CalendarOutlined className="header-icon" />
              </Badge>
              <Badge count={todayReminders} size="small" offset={[2, -2]}>
                <BellOutlined className="header-icon" />
              </Badge>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'logout') {
                      console.log('用户登出');
                    }
                  },
                }}
              >
                <Space className="user-dropdown">
                  <Avatar className="user-avatar">医</Avatar>
                  <span className="username">医生</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 