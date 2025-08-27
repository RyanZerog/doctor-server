import React from 'react';
import { Routes, Route } from 'react-router-dom';
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