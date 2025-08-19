import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, theme, Avatar, Dropdown, Space, Badge } from 'antd';
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
  CalendarOutlined
} from '@ant-design/icons';

import usePatientStore from '../store/usePatientStore';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { patients } = usePatientStore();

  // 获取今天的随访提醒数量
  const todayReminders = patients.filter(
    patient => patient.nextFollowUp === new Date().toISOString().slice(0, 10)
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
      return '/';
    }
    
    // 查找匹配项
    const matchedItem = menuItems.find(item => {
      if (typeof item.key === 'string' && item.key !== '/') {
        return path.startsWith(item.key);
      }
      return false;
    });
    
    // 只返回匹配的key，不返回默认值
    return matchedItem?.key || '';
  };

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="main-sider"
      >
        <div className={`logo-container ${collapsed ? 'collapsed' : ''}`}>
          <MedicineBoxOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">面瘫检测评估系统</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
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
              {menuItems.find(item => item.key === getCurrentMenuKey())?.label || '总览'}
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