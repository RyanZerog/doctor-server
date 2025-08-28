import React, { useState } from 'react';
import { 
  Card, 
  Tabs,
  Table, 
  Tag, 
  Button, 
  Space, 
  DatePicker, 
  message,
  Badge,
  Modal,
  Typography,
  Empty,
  Alert,
  Avatar,
  Calendar,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  WarningOutlined,
  UserOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  CheckOutlined,
  NotificationOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import useTagStore from '../store/useTagStore';
import { useNavigate } from 'react-router-dom';
import './FollowUpReminders.css';

const { Title, Text, Paragraph } = Typography;

const FollowUpReminders = () => {
  const { patients, setFollowUpDate } = usePatientStore();
  const { tags } = useTagStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [followUpDate, setFollowUpDateState] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  // 获取今天的日期
  const today = dayjs().format('YYYY-MM-DD');
  
  // 按随访日期过滤患者
  const todayFollowUps = patients.filter(
    patient => patient.nextFollowUp === today
  );
  
  const upcomingFollowUps = patients.filter(
    patient => {
      const followUpDate = dayjs(patient.nextFollowUp);
      const daysDiff = followUpDate.diff(dayjs(), 'day');
      return daysDiff > 0 && daysDiff <= 7;
    }
  );
  
  const overdueFollowUps = patients.filter(
    patient => {
      const followUpDate = dayjs(patient.nextFollowUp);
      const daysDiff = followUpDate.diff(dayjs(), 'day');
      return daysDiff < 0;
    }
  );
  
  const allFollowUps = patients.filter(
    patient => patient.nextFollowUp
  ).sort((a, b) => dayjs(a.nextFollowUp).unix() - dayjs(b.nextFollowUp).unix());

  const handleSetFollowUpDate = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    setFollowUpDateState(patient.nextFollowUp ? dayjs(patient.nextFollowUp) : null);
    setIsModalOpen(true);
  };

  const handleFollowUpSubmit = () => {
    const dateString = followUpDate ? followUpDate.format('YYYY-MM-DD') : null;
    setFollowUpDate(selectedPatient.id, dateString);
    setIsModalOpen(false);
    message.success('随访日期已更新');
  };

  const handleCompleteFollowUp = (patientId) => {
    // 设置下次随访日期为3个月后
    const nextFollowUpDate = dayjs().add(3, 'month').format('YYYY-MM-DD');
    setFollowUpDate(patientId, nextFollowUpDate);
    message.success('已完成随访，下次随访日期设置为3个月后');
  };

  // 点击面瘫原因跳转到患者列表
  const handleCauseClick = (cause) => {
    navigate(`/patients?cause=${encodeURIComponent(cause)}`);
  };

  const columns = [
    {
      title: '患者信息',
      key: 'patientInfo',
      render: (_, record) => (
        <Space className="patient-info">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            className={`avatar-${record.gender}`}
          />
          <div className="patient-details">
            <Link to={`/patients/${record.id}`} className="patient-name">
              {record.name}
            </Link>
            <div className="patient-meta">
              <span>{record.gender}, {record.age}岁</span>
              <span className="separator">|</span>
              <span>{record.phone}</span>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '随访日期',
      dataIndex: 'nextFollowUp',
      key: 'nextFollowUp',
      render: (text) => {
        const isToday = text === today;
        const isOverdue = dayjs(text).diff(dayjs(), 'day') < 0;
        const daysDiff = Math.abs(dayjs(text).diff(dayjs(), 'day'));
        
        return (
          <Space direction="vertical" size={0} className="followup-date">
            <div className="date-display">
              <CalendarOutlined className="date-icon" />
              <span>{text}</span>
            </div>
            {isToday ? (
              <Badge status="processing" text={<Text type="danger" strong className="date-status">今日</Text>} />
            ) : isOverdue ? (
              <Badge status="error" text={
                <Text type="danger" className="date-status">
                  已逾期 {daysDiff} 天
                </Text>
              } />
            ) : (
              <Badge status="warning" text={
                <Text type="warning" className="date-status">
                  {daysDiff} 天后
                </Text>
              } />
            )}
          </Space>
        );
      },
    },
    {
      title: '面瘫原因',
      dataIndex: 'cause',
      key: 'cause',
      render: (text) => (
        <Tag
          color={
            text === '先天性' ? 'magenta' :
            text === 'BELL面瘫（面神经炎）' ? 'blue' :
            text === '外伤' ? 'orange' :
            text === '肿瘤' ? 'red' :
            text === '医源性' ? 'purple' :
            'default'
          }
          className="cause-tag clickable-tag"
          style={{ cursor: 'pointer' }}
          onClick={() => handleCauseClick(text)}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, record) => (
        <Space size={[0, 4]} wrap className="tag-container">
          {record.tags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Tag color={tag.color} key={tagId} className="patient-tag">
                {tag.name}
              </Tag>
            ) : null;
          })}
          {record.tags.length === 0 && <Text type="secondary">无标签</Text>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="完成随访">
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleCompleteFollowUp(record.id)}
              className="complete-button"
            >
              完成随访
            </Button>
          </Tooltip>
          <Tooltip title="调整随访日期">
            <Button 
              size="small" 
              icon={<CalendarOutlined />} 
              onClick={() => handleSetFollowUpDate(record.id)}
              className="reschedule-button"
            >
              调整日期
            </Button>
          </Tooltip>
          <Tooltip title="联系患者">
            <Button
              type="default"
              size="small"
              icon={<PhoneOutlined />}
              className="contact-button"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 随访提醒卡片组件
  const FollowUpCard = ({ patient }) => {
    const patientTags = patient.tags.map(tagId => 
      tags.find(t => t.id === tagId)
    ).filter(Boolean);
    
    const isToday = patient.nextFollowUp === today;
    const isOverdue = dayjs(patient.nextFollowUp).diff(dayjs(), 'day') < 0;
    const daysDiff = Math.abs(dayjs(patient.nextFollowUp).diff(dayjs(), 'day'));
    
    return (
      <Card 
        className={`followup-card ${isToday ? 'today' : isOverdue ? 'overdue' : 'upcoming'}`}
        hoverable
        actions={[
          <Tooltip title="完成随访">
            <CheckOutlined key="complete" onClick={() => handleCompleteFollowUp(patient.id)} />
          </Tooltip>,
          <Tooltip title="调整日期">
            <ScheduleOutlined key="schedule" onClick={() => handleSetFollowUpDate(patient.id)} />
          </Tooltip>,
          <Tooltip title="查看详情">
            <InfoCircleOutlined key="info" onClick={() => window.location.href = `/patients/${patient.id}`} />
          </Tooltip>,
        ]}
      >
        <div className="followup-card-header">
          <Avatar 
            size={50} 
            icon={<UserOutlined />}
            className={`avatar-${patient.gender}`}
          />
          <div className="followup-patient-info">
            <div className="patient-name-container">
              <Link to={`/patients/${patient.id}`} className="patient-name-link">
                {patient.name}
              </Link>
              <Text type="secondary" className="patient-meta">
                {patient.gender}, {patient.age}岁
              </Text>
            </div>
            <div className="followup-badge">
              {isToday ? (
                <Badge status="processing" text={<Text type="danger" strong>今日</Text>} />
              ) : isOverdue ? (
                <Badge status="error" text={<Text type="danger">逾期 {daysDiff} 天</Text>} />
              ) : (
                <Badge status="warning" text={<Text type="warning">{daysDiff} 天后</Text>} />
              )}
            </div>
          </div>
        </div>

        <div className="followup-details">
          <div className="detail-row">
            <CalendarOutlined className="detail-icon" />
            <Text strong>随访日期:</Text>
            <Text>{patient.nextFollowUp}</Text>
          </div>
          <div className="detail-row">
            <PhoneOutlined className="detail-icon" />
            <Text strong>联系电话:</Text>
            <Text>{patient.phone}</Text>
          </div>
          <div className="detail-row">
            <NotificationOutlined className="detail-icon" />
            <Text strong>面瘫原因:</Text>
            <Tag
              color={
                patient.cause === '先天性' ? 'magenta' :
                patient.cause === 'BELL面瘫（面神经炎）' ? 'blue' :
                patient.cause === '外伤' ? 'orange' :
                patient.cause === '肿瘤' ? 'red' :
                patient.cause === '医源性' ? 'purple' :
                'default'
              }
              className="clickable-tag"
              style={{ cursor: 'pointer' }}
              onClick={() => handleCauseClick(patient.cause)}
            >
              {patient.cause}
            </Tag>
          </div>
          {patientTags.length > 0 && (
            <div className="patient-tags">
              {patientTags.map(tag => (
                <Tag color={tag.color} key={tag.id}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 日历渲染函数
  const calendarCellRender = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    const patientsOnDate = patients.filter(p => p.nextFollowUp === dateString);
    
    if (patientsOnDate.length === 0) {
      return null;
    }
    
    return (
      <ul className="calendar-patients">
        {patientsOnDate.map(patient => (
          <li key={patient.id} className="calendar-patient-item">
            <Badge
              color={patient.gender === '男' ? '#6ba3d6' : '#f4a6cd'}
              text={
                <Tooltip title={`${patient.name} - ${patient.cause}`}>
                  <Link to={`/patients/${patient.id}`}>{patient.name}</Link>
                </Tooltip>
              } 
            />
          </li>
        ))}
      </ul>
    );
  };

  const tabItems = [
    {
      key: 'today',
      label: (
        <span className="tab-label">
          <ClockCircleOutlined />
          今日随访
          <Badge count={todayFollowUps.length} className="tab-badge" />
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="view-switcher">
            <Button.Group>
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
              <Button 
                type={viewMode === 'card' ? 'primary' : 'default'} 
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
              <Button 
                type={viewMode === 'calendar' ? 'primary' : 'default'} 
                onClick={() => setViewMode('calendar')}
              >
                日历视图
              </Button>
            </Button.Group>
          </div>

          {viewMode === 'calendar' ? (
            <div className="calendar-view">
              <Calendar 
                cellRender={calendarCellRender}
                className="followup-calendar"
              />
            </div>
          ) : viewMode === 'card' ? (
            todayFollowUps.length > 0 ? (
              <Row gutter={[16, 16]} className="followup-cards">
                {todayFollowUps.map(patient => (
                  <Col key={patient.id} xs={24} sm={12} md={8} lg={8}>
                    <FollowUpCard patient={patient} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="今日没有需要随访的患者" />
            )
          ) : (
            todayFollowUps.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={todayFollowUps} 
                rowKey="id" 
                className="followup-table"
              />
            ) : (
              <Empty description="今日没有需要随访的患者" />
            )
          )}
        </div>
      )
    },
    {
      key: 'upcoming',
      label: (
        <span className="tab-label">
          <BellOutlined />
          即将随访
          <Badge count={upcomingFollowUps.length} className="tab-badge" />
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="view-switcher">
            <Button.Group>
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
              <Button 
                type={viewMode === 'card' ? 'primary' : 'default'} 
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
              <Button 
                type={viewMode === 'calendar' ? 'primary' : 'default'} 
                onClick={() => setViewMode('calendar')}
              >
                日历视图
              </Button>
            </Button.Group>
          </div>

          {viewMode === 'calendar' ? (
            <div className="calendar-view">
              <Calendar 
                cellRender={calendarCellRender} 
                className="followup-calendar"
              />
            </div>
          ) : viewMode === 'card' ? (
            upcomingFollowUps.length > 0 ? (
              <Row gutter={[16, 16]} className="followup-cards">
                {upcomingFollowUps.map(patient => (
                  <Col key={patient.id} xs={24} sm={12} md={8} lg={8}>
                    <FollowUpCard patient={patient} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="未来7天内没有需要随访的患者" />
            )
          ) : (
            upcomingFollowUps.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={upcomingFollowUps} 
                rowKey="id" 
                className="followup-table"
              />
            ) : (
              <Empty description="未来7天内没有需要随访的患者" />
            )
          )}
        </div>
      )
    },
    {
      key: 'overdue',
      label: (
        <span className="tab-label">
          <WarningOutlined />
          已逾期
          <Badge count={overdueFollowUps.length} className="tab-badge" />
        </span>
      ),
      children: (
        <div className="tab-content">
          {overdueFollowUps.length > 0 && (
            <Alert 
              message="存在已逾期的随访计划" 
              description="以下患者的随访日期已过期，请及时联系患者进行随访。" 
              type="warning" 
              showIcon 
              className="overdue-alert"
            />
          )}

          <div className="view-switcher">
            <Button.Group>
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
              <Button 
                type={viewMode === 'card' ? 'primary' : 'default'} 
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
            </Button.Group>
          </div>

          {viewMode === 'card' ? (
            overdueFollowUps.length > 0 ? (
              <Row gutter={[16, 16]} className="followup-cards">
                {overdueFollowUps.map(patient => (
                  <Col key={patient.id} xs={24} sm={12} md={8} lg={8}>
                    <FollowUpCard patient={patient} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="没有逾期的随访计划" />
            )
          ) : (
            overdueFollowUps.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={overdueFollowUps} 
                rowKey="id" 
                className="followup-table"
              />
            ) : (
              <Empty description="没有逾期的随访计划" />
            )
          )}
        </div>
      )
    },
    {
      key: 'all',
      label: (
        <span className="tab-label">
          <CalendarOutlined />
          所有随访计划
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="view-switcher">
            <Button.Group>
              <Button 
                type={viewMode === 'list' ? 'primary' : 'default'} 
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
              <Button 
                type={viewMode === 'card' ? 'primary' : 'default'} 
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
              <Button 
                type={viewMode === 'calendar' ? 'primary' : 'default'} 
                onClick={() => setViewMode('calendar')}
              >
                日历视图
              </Button>
            </Button.Group>
          </div>

          {viewMode === 'calendar' ? (
            <div className="calendar-view">
              <Calendar 
                cellRender={calendarCellRender}
                className="followup-calendar"
              />
            </div>
          ) : viewMode === 'card' ? (
            allFollowUps.length > 0 ? (
              <Row gutter={[16, 16]} className="followup-cards">
                {allFollowUps.map(patient => (
                  <Col key={patient.id} xs={24} sm={12} md={8} lg={8}>
                    <FollowUpCard patient={patient} />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="暂无随访计划" />
            )
          ) : (
            allFollowUps.length > 0 ? (
              <Table 
                columns={columns} 
                dataSource={allFollowUps} 
                rowKey="id" 
                className="followup-table"
              />
            ) : (
              <Empty description="暂无随访计划" />
            )
          )}
        </div>
      )
    },
  ];

  return (
    <div className="follow-up-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <Title level={2}>随访提醒</Title>
            <Text type="secondary">管理患者随访计划，按照建议的三个月复查周期进行提醒</Text>
          </div>
        </div>
        <div className="header-actions">
          {activeTab === 'today' && todayFollowUps.length > 0 && (
            <Button 
              type="primary" 
              size="middle"
              icon={<NotificationOutlined />}
              className="reminder-button"
            >
              一键发送提醒
            </Button>
          )}
        </div>
      </div>
      
      <Card className="follow-up-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="followup-tabs" />
      </Card>

      <Modal
        title="设置随访日期"
        open={isModalOpen}
        onOk={handleFollowUpSubmit}
        onCancel={() => setIsModalOpen(false)}
        className="followup-modal"
      >
        {selectedPatient && (
          <div className="modal-content">
            <div className="patient-avatar">
              <Avatar 
                size={64} 
                icon={<UserOutlined />}
                className={`avatar-${selectedPatient.gender}`}
              />
              <div className="patient-name">
                <Text strong>{selectedPatient.name}</Text>
                <Text type="secondary">{selectedPatient.gender}, {selectedPatient.age}岁</Text>
              </div>
            </div>
            
            <Paragraph className="modal-instruction">
              为患者设置下次随访日期
            </Paragraph>

            <DatePicker 
              style={{ width: '100%' }} 
              value={followUpDate}
              onChange={setFollowUpDateState}
              placeholder="选择随访日期"
              size="large"
              className="followup-datepicker"
            />

            <div className="helper-buttons">
              <Text type="secondary">
                建议随访周期为3个月
              </Text>
              <Button 
                type="link" 
                onClick={() => {
                  const threeMonthsLater = dayjs().add(3, 'month');
                  setFollowUpDateState(threeMonthsLater);
                }}
                className="quick-button"
              >
                设置为3个月后({dayjs().add(3, 'month').format('YYYY-MM-DD')})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FollowUpReminders; 