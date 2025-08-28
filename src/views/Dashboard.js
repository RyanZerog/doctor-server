import React, { useState } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Typography, Alert, Button, Progress } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  BellOutlined,
  TagOutlined,
  UserAddOutlined,
  RiseOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import useTagStore from '../store/useTagStore';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { patients, causesOptions } = usePatientStore();
  const { tags } = useTagStore();
  const navigate = useNavigate();
  const [activeTimeRange, setActiveTimeRange] = useState('month'); // week, month, year

  // 获取今天的日期
  const today = dayjs().format('YYYY-MM-DD');
  
  // 计算即将随访的患者（未来7天内需要随访的）
  const upcomingFollowUps = patients.filter(
    (patient) => {
      const followUpDate = dayjs(patient.nextFollowUp);
      const daysDiff = followUpDate.diff(dayjs(), 'day');
      return daysDiff >= 0 && daysDiff <= 7;
    }
  );

  // 按面瘫原因统计患者数量
  const causeStatistics = causesOptions.map(cause => {
    const count = patients.filter(patient => patient.cause === cause).length;
    return { cause, count };
  }).filter(item => item.count > 0);

  // 按照每种原因占总患者比例排序
  const sortedCauseStats = [...causeStatistics].sort((a, b) => b.count - a.count);

  // 随机生成一些统计数据用于展示
  const patientGrowthRate = 15; // 患者增长率
  const totalVisits = patients.length * 3; // 总随访次数

  // 获取最常见的面瘫原因
  const mostCommonCause = sortedCauseStats.length > 0 ? sortedCauseStats[0] : { cause: '暂无数据', count: 0 };

  // 随机生成不同原因的颜色
  const causeColors = {
    '先天性': '#7D7AFF',
    'BELL面瘫（面神经炎）': '#5AD8A6',
    '外伤': '#FFA940',
    '肿瘤': '#FF7875',
    '医源性': '#597EF7',
    '不明原因/其他': '#73D13D'
  };

  // 点击面瘫原因跳转到患者列表
  const handleCauseClick = (cause) => {
    navigate(`/patients?cause=${encodeURIComponent(cause)}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2}>医生工作台</Title>
        <div className="time-range-selector">
          <Button 
            type={activeTimeRange === 'week' ? 'primary' : 'default'} 
            size="small"
            onClick={() => setActiveTimeRange('week')}
          >
            本周
          </Button>
          <Button 
            type={activeTimeRange === 'month' ? 'primary' : 'default'} 
            size="small"
            onClick={() => setActiveTimeRange('month')}
          >
            本月
          </Button>
          <Button 
            type={activeTimeRange === 'year' ? 'primary' : 'default'} 
            size="small"
            onClick={() => setActiveTimeRange('year')}
          >
            本年
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card patient-card">
            <Statistic
              title="患者总数"
              value={patients.length}
              valueStyle={{ color: '#1D5B79' }}
            />
            <div className="stat-footer">
              <div className="stat-trend positive">
                <RiseOutlined />
                <span>{patientGrowthRate}% 较上月</span>
              </div>
              <Button type="primary" size="small" icon={<UserAddOutlined />}>
                <Link to="/patients">管理患者</Link>
              </Button>
            </div>
            <TeamOutlined className="stat-background" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card visit-card">
            <Statistic
              title="今日复诊提醒"
              value={patients.filter(p => p.nextFollowUp === today).length}
              valueStyle={{ color: '#cf1322' }}
            />
            <div className="stat-footer">
              <div className="stat-trend">
                <span>总随访: {totalVisits}次</span>
              </div>
              <Button type="primary" size="small" icon={<BellOutlined />}>
                <Link to="/follow-up">查看提醒</Link>
              </Button>
            </div>
            <CalendarOutlined className="stat-background" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card tag-card">
            <Statistic
              title="标签数量"
              value={tags.length}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-footer">
              <div className="stat-trend">
                <span>分类管理患者</span>
              </div>
              <Button type="primary" size="small" icon={<TagOutlined />}>
                <Link to="/tags">管理标签</Link>
              </Button>
            </div>
            <TagOutlined className="stat-background" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card cause-card">
            <Statistic
              title="最常见原因"
              value={mostCommonCause.count}
              suffix="例"
              precision={0}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-footer">
              <div className="cause-name" style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '8px',
                fontWeight: 'bold'
              }}>
                {mostCommonCause.cause}
              </div>
            </div>
            <PieChartOutlined className="stat-background" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<Title level={5}><BellOutlined /> 即将随访的患者</Title>} className="list-card">
            {upcomingFollowUps.length > 0 ? (
              <List
                className="follow-up-list"
                dataSource={upcomingFollowUps}
                renderItem={(patient) => (
                  <List.Item className="follow-up-item">
                    <List.Item.Meta
                      title={
                        <Link to={`/patients/${patient.id}`} className="patient-link">
                          {patient.name} ({patient.gender}, {patient.age}岁)
                        </Link>
                      }
                      description={
                        <div className="follow-up-details">
                          <div className="follow-up-date">
                            <CalendarOutlined /> 随访日期: <Text strong>{patient.nextFollowUp}</Text>
                            <Tag color={dayjs(patient.nextFollowUp).diff(dayjs(), 'day') === 0 ? 'error' : 'warning'}>
                              {dayjs(patient.nextFollowUp).diff(dayjs(), 'day') === 0 ? '今日' : `${dayjs(patient.nextFollowUp).diff(dayjs(), 'day')}天后`}
                            </Tag>
                          </div>
                          <div className="patient-tags">
                            {patient.tags.map((tagId) => {
                              const tag = tags.find((t) => t.id === tagId);
                              return tag ? (
                                <Tag color={tag.color} key={tag.id}>
                                  {tag.name}
                                </Tag>
                              ) : null;
                            })}
                          </div>
                        </div>
                      }
                    />
                    <Button size="small" type="primary">
                      <Link to={`/patients/${patient.id}`}>查看</Link>
                    </Button>
                  </List.Item>
                )}
              />
            ) : (
              <Alert
                message="暂无近期随访计划"
                description="未来7天内没有需要随访的患者。"
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={<Title level={5}><PieChartOutlined /> 面瘫原因分布</Title>} 
            className="chart-card"
          >
            {sortedCauseStats.length > 0 ? (
              <div className="cause-stats">
                {sortedCauseStats.map((item, index) => (
                  <div
                    className="cause-stat-item clickable-cause"
                    key={item.cause}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCauseClick(item.cause)}
                  >
                    <div className="cause-info">
                      <div className="cause-name">
                        <span
                          className="cause-color-dot"
                          style={{ backgroundColor: causeColors[item.cause] || '#1890ff' }}
                        ></span>
                        <span>{item.cause}</span>
                      </div>
                      <div className="cause-count">
                        <span>{item.count}人</span>
                        <span className="cause-percent">
                          {Math.round((item.count / patients.length) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      percent={Math.round((item.count / patients.length) * 100)} 
                      showInfo={false} 
                      strokeColor={causeColors[item.cause] || '#1890ff'} 
                      className="cause-progress"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Alert message="暂无数据" type="info" showIcon />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={<Title level={5}><LineChartOutlined /> 患者统计趋势</Title>} 
            className="trend-card"
          >
            <div className="trend-placeholder">
              <Text type="secondary">此处可集成患者随访趋势图表，如患者数量变化、治疗效果统计等。</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 