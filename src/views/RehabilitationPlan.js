import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Progress,
  Statistic,
  Alert,
  Tabs,
  Timeline,
  Checkbox
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import usePatientStore from '../store/usePatientStore';
import useRehabilitationStore from '../store/useRehabilitationStore';
import './RehabilitationPlan.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const RehabilitationPlan = () => {
  const { patients, updatePatient } = usePatientStore();
  const { 
    plans, 
    addPlan, 
    updatePlan, 
    deletePlan, 
    addPlanItem, 
    updatePlanItem, 
    deletePlanItem,
    getPlansByPatient 
  } = useRehabilitationStore();
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

  // 获取选中患者的康复计划
  const patientPlans = useMemo(() => {
    if (!selectedPatient) return [];
    return getPlansByPatient(selectedPatient);
  }, [selectedPatient, plans, getPlansByPatient]);

  // 计算统计数据
  const planStats = useMemo(() => {
    const totalPlans = patientPlans.length;
    const activePlans = patientPlans.filter(plan => plan.status === 'active').length;
    const completedPlans = patientPlans.filter(plan => plan.status === 'completed').length;
    const totalItems = patientPlans.reduce((sum, plan) => sum + (plan.items?.length || 0), 0);
    const completedItems = patientPlans.reduce((sum, plan) => 
      sum + (plan.items?.filter(item => item.completed).length || 0), 0
    );
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalItems,
      completedItems,
      completionRate
    };
  }, [patientPlans]);

  // 处理新增/编辑计划
  const handlePlanSubmit = async (values) => {
    try {
      const planData = {
        ...values,
        patientId: selectedPatient,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        createdAt: editingPlan ? editingPlan.createdAt : Date.now(),
        updatedAt: Date.now()
      };

      if (editingPlan) {
        updatePlan(editingPlan.id, planData);
        message.success('康复计划已更新');
      } else {
        addPlan(planData);
        message.success('康复计划已创建');
      }

      setIsModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 处理新增/编辑计划项目
  const handleItemSubmit = async (values) => {
    try {
      const itemData = {
        ...values,
        completed: editingItem ? editingItem.completed : false,
        createdAt: editingItem ? editingItem.createdAt : Date.now(),
        updatedAt: Date.now()
      };

      if (editingItem) {
        updatePlanItem(editingItem.planId, editingItem.id, itemData);
        message.success('训练项目已更新');
      } else {
        addPlanItem(editingItem.planId, itemData);
        message.success('训练项目已添加');
      }

      setIsItemModalOpen(false);
      setEditingItem(null);
      itemForm.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 处理删除计划
  const handleDeletePlan = (planId) => {
    deletePlan(planId);
    message.success('康复计划已删除');
  };

  // 处理删除计划项目
  const handleDeleteItem = (planId, itemId) => {
    deletePlanItem(planId, itemId);
    message.success('训练项目已删除');
  };

  // 处理项目完成状态切换
  const handleItemToggle = (planId, itemId, completed) => {
    updatePlanItem(planId, itemId, { completed, updatedAt: Date.now() });
    message.success(completed ? '项目已完成' : '项目已重置');
  };

  // 获取计划状态颜色
  const getPlanStatusColor = (status) => {
    const colors = {
      'active': 'processing',
      'completed': 'success',
      'paused': 'warning',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // 获取计划状态文本
  const getPlanStatusText = (status) => {
    const texts = {
      'active': '进行中',
      'completed': '已完成',
      'paused': '已暂停',
      'cancelled': '已取消'
    };
    return texts[status] || '未知';
  };

  // 计划表格列定义
  const planColumns = [
    {
      title: '计划名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </div>
      )
    },
    {
      title: '计划周期',
      key: 'period',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>{record.startDate} ~ {record.endDate}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(record.endDate).diff(dayjs(record.startDate), 'day')} 天
          </Text>
        </Space>
      )
    },
    {
      title: '训练频次',
      dataIndex: 'frequency',
      key: 'frequency',
      align: 'center',
      render: (frequency) => (
        <Tag color="blue">{frequency}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={getPlanStatusColor(status)}>
          {getPlanStatusText(status)}
        </Tag>
      )
    },
    {
      title: '完成进度',
      key: 'progress',
      align: 'center',
      render: (_, record) => {
        const items = record.items || [];
        const completedItems = items.filter(item => item.completed).length;
        const progress = items.length > 0 ? (completedItems / items.length) * 100 : 0;
        
        return (
          <div style={{ width: '80px' }}>
            <Progress
              percent={progress}
              size="small"
              format={() => `${completedItems}/${items.length}`}
            />
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPlan(record);
              form.setFieldsValue({
                ...record,
                startDate: dayjs(record.startDate),
                endDate: dayjs(record.endDate)
              });
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="确定要删除这个康复计划吗？"
            onConfirm={() => handleDeletePlan(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="rehabilitation-plan">
      {/* 患者选择 */}
      <Card title="康复计划管理" className="header-card">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>选择患者</Text>
              <Select
                style={{ width: '100%' }}
                placeholder="请选择患者"
                value={selectedPatient}
                onChange={setSelectedPatient}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {patients.map(patient => (
                  <Option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.gender}, {patient.age}岁
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={16} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', paddingTop: '24px' }}>
            {selectedPatient && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingPlan(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
              >
                新建康复计划
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {selectedPatient && (
        <>
          {/* 统计概览 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="总计划数"
                  value={planStats.totalPlans}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="进行中"
                  value={planStats.activePlans}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="已完成"
                  value={planStats.completedPlans}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="完成率"
                  value={planStats.completionRate}
                  precision={1}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                  valueStyle={{ 
                    color: planStats.completionRate >= 80 ? '#52c41a' : 
                           planStats.completionRate >= 60 ? '#faad14' : '#f5222d' 
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* 主要内容 */}
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="康复计划" key="plans">
                <Table
                  dataSource={patientPlans}
                  columns={planColumns}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                  }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};

export default RehabilitationPlan;
