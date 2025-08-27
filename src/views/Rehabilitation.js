import React, { useState, useMemo } from 'react';
import {
  Row, Col, Card, Table, Button, Select, Space, Typography, Progress,
  Tabs, Modal, Form, Input, DatePicker, InputNumber, Tag, Tooltip,
  Steps, Timeline, Statistic, Badge, Empty, Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  EyeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import useTagStore from '../store/useTagStore';
import './Rehabilitation.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const Rehabilitation = () => {
  const navigate = useNavigate();
  const { patients } = usePatientStore();
  const { tags } = useTagStore();
  const [activeTab, setActiveTab] = useState('plans');
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [form] = Form.useForm();

  // 模拟康复治疗方案数据
  const mockRehabilitationPlans = useMemo(() => {
    return patients.slice(0, 8).map((patient, index) => ({
      id: `plan-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      planName: `${patient.name}的康复治疗方案`,
      status: ['active', 'completed', 'paused'][index % 3],
      startDate: dayjs().subtract(Math.floor(Math.random() * 60), 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(Math.floor(Math.random() * 90) + 30, 'day').format('YYYY-MM-DD'),
      progress: Math.floor(Math.random() * 100),
      totalSessions: 30,
      completedSessions: Math.floor(Math.random() * 30),
      exercises: [
        { name: '抬眉训练', frequency: '每日3次', duration: '5分钟' },
        { name: '微笑练习', frequency: '每日5次', duration: '3分钟' },
        { name: '闭眼训练', frequency: '每日4次', duration: '4分钟' },
        { name: '撅嘴练习', frequency: '每日3次', duration: '3分钟' }
      ],
      notes: index % 2 === 0 ? '患者配合度良好，进展顺利' : '',
      createdBy: '张医生',
      createdAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss')
    }));
  }, [patients]);

  // 过滤数据
  const filteredPlans = useMemo(() => {
    let filtered = mockRehabilitationPlans;

    if (selectedPatient !== 'all') {
      filtered = filtered.filter(plan => plan.patientId === selectedPatient);
    }

    // 按标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(plan => {
        const patient = patients.find(p => p.id === plan.patientId);
        if (!patient || !patient.tags) return false;
        return selectedTags.some(tagId => patient.tags.includes(tagId));
      });
    }

    return filtered;
  }, [mockRehabilitationPlans, selectedPatient, selectedTags, patients]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = filteredPlans.length;
    const active = filteredPlans.filter(plan => plan.status === 'active').length;
    const completed = filteredPlans.filter(plan => plan.status === 'completed').length;
    const avgProgress = total > 0 ? 
      (filteredPlans.reduce((sum, plan) => sum + plan.progress, 0) / total).toFixed(1) : 0;
    
    return { total, active, completed, avgProgress: parseFloat(avgProgress) };
  }, [filteredPlans]);

  const planColumns = [
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 120,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '标签',
      dataIndex: 'patientId',
      key: 'tags',
      width: 150,
      render: (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient || !patient.tags || patient.tags.length === 0) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Space size={[0, 4]} wrap>
            {patient.tags.slice(0, 2).map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Tag key={tag.id} color={tag.color} style={{ margin: '2px 2px' }}>
                  {tag.name}
                </Tag>
              ) : null;
            })}
            {patient.tags.length > 2 && (
              <Tag style={{ margin: '2px 2px' }}>+{patient.tags.length - 2}</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '方案名称',
      dataIndex: 'planName',
      key: 'planName',
      width: 200,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          active: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          paused: { color: 'warning', text: '已暂停' }
        };
        const config = statusMap[status];
        return <Badge status={config.color} text={config.text} />;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress, record) => (
        <div>
          <Progress 
            percent={progress} 
            size="small"
            strokeColor={progress >= 80 ? '#52c41a' : progress >= 50 ? '#faad14' : '#f5222d'}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.completedSessions}/{record.totalSessions} 次
          </Text>
        </div>
      )
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date) => dayjs(date).format('MM-DD')
    },
    {
      title: '预计结束',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date) => dayjs(date).format('MM-DD')
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewPlan(record)}
            />
          </Tooltip>
          <Tooltip title="编辑方案">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditPlan(record)}
            />
          </Tooltip>
          <Tooltip title="开始训练">
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              size="small"
              onClick={() => handleStartTraining(record)}
              disabled={record.status === 'completed'}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleCreatePlan = (values) => {
    console.log('创建康复方案:', values);
    setPlanModalVisible(false);
    form.resetFields();
  };

  const handleViewPlan = (record) => {
    Modal.info({
      title: '康复方案详情',
      width: 800,
      content: (
        <div>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="患者姓名">{record.patientName}</Descriptions.Item>
            <Descriptions.Item label="方案名称">{record.planName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge
                status={record.status === 'active' ? 'processing' : record.status === 'completed' ? 'success' : 'warning'}
                text={record.status === 'active' ? '进行中' : record.status === 'completed' ? '已完成' : '已暂停'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="进度">{record.progress}%</Descriptions.Item>
            <Descriptions.Item label="开始日期">{record.startDate}</Descriptions.Item>
            <Descriptions.Item label="预计结束">{record.endDate}</Descriptions.Item>
            <Descriptions.Item label="总训练次数">{record.totalSessions}次</Descriptions.Item>
            <Descriptions.Item label="已完成次数">{record.completedSessions}次</Descriptions.Item>
            <Descriptions.Item label="创建医生">{record.createdBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{record.createdAt}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {record.notes || '无'}
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 16 }}>
            <Title level={5}>训练项目</Title>
            {record.exercises.map((exercise, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <Space>
                  <Text strong>{exercise.name}</Text>
                  <Tag>{exercise.frequency}</Tag>
                  <Tag color="blue">{exercise.duration}</Tag>
                </Space>
              </Card>
            ))}
          </div>
        </div>
      ),
    });
  };

  const handleEditPlan = (record) => {
    form.setFieldsValue({
      patientId: record.patientId,
      planName: record.planName,
      startDate: dayjs(record.startDate),
      totalSessions: record.totalSessions,
      notes: record.notes
    });
    setPlanModalVisible(true);
  };

  const handleStartTraining = (record) => {
    Modal.confirm({
      title: '开始训练',
      content: `确定要为患者 ${record.patientName} 开始今日的康复训练吗？`,
      onOk() {
        console.log('开始训练:', record);
        // 这里可以跳转到训练界面或记录训练开始
        Modal.success({
          content: '训练已开始，请指导患者完成训练项目。',
        });
      },
    });
  };

  const tabItems = [
    {
      key: 'plans',
      label: '治疗方案',
      children: (
        <div>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="总方案数"
                  value={statistics.total}
                  prefix={<HeartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="进行中"
                  value={statistics.active}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={statistics.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="平均进度"
                  value={statistics.avgProgress}
                  suffix="%"
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: statistics.avgProgress >= 70 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 筛选和操作 */}
          <Card style={{ marginBottom: 24 }}>
            <Space wrap>
              <Select
                placeholder="选择患者"
                style={{ width: 150 }}
                value={selectedPatient}
                onChange={setSelectedPatient}
              >
                <Select.Option value="all">全部患者</Select.Option>
                {patients.map(patient => (
                  <Select.Option key={patient.id} value={patient.id}>
                    {patient.name}
                  </Select.Option>
                ))}
              </Select>

              <Select
                mode="multiple"
                placeholder="选择标签"
                style={{ width: 200 }}
                value={selectedTags}
                onChange={setSelectedTags}
                allowClear
              >
                {tags.map(tag => (
                  <Select.Option key={tag.id} value={tag.id}>
                    <Tag color={tag.color} style={{ margin: 0 }}>
                      {tag.name}
                    </Tag>
                  </Select.Option>
                ))}
              </Select>

              <Button
                onClick={() => {
                  setSelectedPatient('all');
                  setSelectedTags([]);
                }}
              >
                重置筛选
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setPlanModalVisible(true)}
              >
                创建方案
              </Button>
            </Space>
          </Card>

          {/* 方案列表 */}
          <Card>
            <Table
              columns={planColumns}
              dataSource={filteredPlans}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }}
              locale={{
                emptyText: <Empty description="暂无康复方案" />
              }}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'exercises',
      label: '训练库',
      children: (
        <div>
          <Row gutter={[16, 16]}>
            {[
              { name: '抬眉训练', description: '锻炼额肌，改善抬眉功能', difficulty: '简单', duration: '5分钟' },
              { name: '微笑练习', description: '训练口角上提，恢复微笑功能', difficulty: '中等', duration: '3分钟' },
              { name: '闭眼训练', description: '加强眼轮匝肌力量', difficulty: '简单', duration: '4分钟' },
              { name: '撅嘴练习', description: '训练口轮匝肌，改善口唇功能', difficulty: '中等', duration: '3分钟' },
              { name: '鼓腮训练', description: '锻炼颊肌，改善面部对称性', difficulty: '困难', duration: '6分钟' },
              { name: '皱眉练习', description: '训练皱眉肌，恢复眉间表情', difficulty: '简单', duration: '2分钟' }
            ].map((exercise, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card 
                  hoverable
                  actions={[
                    <EyeOutlined key="view" />,
                    <PlayCircleOutlined key="demo" />,
                    <PlusOutlined key="add" />
                  ]}
                >
                  <Card.Meta
                    title={exercise.name}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {exercise.description}
                        </Paragraph>
                        <Space>
                          <Tag color={exercise.difficulty === '简单' ? 'green' : exercise.difficulty === '中等' ? 'orange' : 'red'}>
                            {exercise.difficulty}
                          </Tag>
                          <Tag icon={<ClockCircleOutlined />}>
                            {exercise.duration}
                          </Tag>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )
    },
    {
      key: 'progress',
      label: '进度跟踪',
      children: (
        <div>
          <Card title="康复进度时间线">
            <Timeline>
              <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                <div>
                  <Text strong>2024-01-15</Text>
                  <br />
                  <Text>张三完成第10次训练，微笑功能明显改善</Text>
                </div>
              </Timeline.Item>
              <Timeline.Item color="blue" dot={<PlayCircleOutlined />}>
                <div>
                  <Text strong>2024-01-14</Text>
                  <br />
                  <Text>李四开始新的康复方案，预计30天完成</Text>
                </div>
              </Timeline.Item>
              <Timeline.Item color="orange" dot={<ExclamationCircleOutlined />}>
                <div>
                  <Text strong>2024-01-13</Text>
                  <br />
                  <Text>王五训练进度缓慢，需要调整方案</Text>
                </div>
              </Timeline.Item>
              <Timeline.Item color="green" dot={<TrophyOutlined />}>
                <div>
                  <Text strong>2024-01-12</Text>
                  <br />
                  <Text>赵六康复方案完成，效果良好</Text>
                </div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="rehabilitation-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <Title level={2}>康复治疗</Title>
            <Text type="secondary">制定和管理康复治疗方案，跟踪治疗效果</Text>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="rehabilitation-tabs"
      />

      {/* 创建方案模态框 */}
      <Modal
        title="创建康复方案"
        open={planModalVisible}
        onCancel={() => setPlanModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePlan}
        >
          <Form.Item
            name="patientId"
            label="选择患者"
            rules={[{ required: true, message: '请选择患者' }]}
          >
            <Select placeholder="请选择患者">
              {patients.map(patient => (
                <Select.Option key={patient.id} value={patient.id}>
                  {patient.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="planName"
            label="方案名称"
            rules={[{ required: true, message: '请输入方案名称' }]}
          >
            <Input placeholder="请输入方案名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalSessions"
                label="总训练次数"
                rules={[{ required: true, message: '请输入总训练次数' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建方案
              </Button>
              <Button onClick={() => setPlanModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rehabilitation;
