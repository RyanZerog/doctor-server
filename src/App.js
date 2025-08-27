import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import MainLayout from './layouts/MainLayout';
import Dashboard from './views/Dashboard';
import PatientList from './views/PatientList';
import PatientDetail from './views/PatientDetail';
import TagManagement from './views/TagManagement';
import FollowUpReminders from './views/FollowUpReminders';
import AssessmentDetails from './views/AssessmentDetails';
import Rehabilitation from './views/Rehabilitation';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App = () => {
  const location = useLocation();

  // 设置页面标题
  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    document.title = `${pageTitle} - 面瘫患者评估及康复治疗管理平台-医生端`;
  }, [location.pathname]);

  const getPageTitle = (pathname) => {
    const titleMap = {
      '/': '总览',
      '/patients': '患者管理',
      '/tags': '标签管理',
      '/follow-up': '随访提醒',
      '/collaboration': '医患协同模块',
      '/collaboration/assessment-details': '评分详情',
      '/collaboration/rehabilitation': '康复治疗'
    };

    // 处理动态路由
    if (pathname.includes('/patients/') && !pathname.includes('/edit')) {
      return '患者详情';
    }

    return titleMap[pathname] || '总览';
  };

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN} theme={{
      token: {
        colorPrimary: '#1D5B79', // 专业的医疗蓝色
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#1677ff',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      components: {
        Card: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 8,
        },
        Button: {
          primaryShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
        },
        Table: {
          borderRadius: 8,
          headerBg: '#f9fafb',
        },
      },
    }}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="tags" element={<TagManagement />} />
          <Route path="follow-up" element={<FollowUpReminders />} />
          <Route path="collaboration/assessment-details" element={<AssessmentDetails />} />
          <Route path="collaboration/rehabilitation" element={<Rehabilitation />} />
        </Route>
      </Routes>
    </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App; 