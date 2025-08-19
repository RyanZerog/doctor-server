import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  Radio,
  message,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Card,
  Badge,
  Avatar,
  Typography,
  Tabs,
  Segmented
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TagsOutlined,
  BellOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  UserOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  FileProtectOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import useTagStore from '../store/useTagStore';
import './PatientList.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PatientList = () => {
  const { patients, causesOptions, addPatient, updatePatient, deletePatient } = usePatientStore();
  const { tags } = useTagStore();
  
  const [searchText, setSearchText] = useState('');
  const [filterCause, setFilterCause] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  // 根据搜索、筛选条件过滤患者列表
  const filteredPatients = patients.filter(patient => {
    // 名字搜索
    const nameMatch = patient.name.toLowerCase().includes(searchText.toLowerCase());
    
    // 面瘫原因筛选
    const causeMatch = filterCause ? patient.cause === filterCause : true;
    
    // 标签筛选
    const tagMatch = filterTag ? patient.tags.includes(filterTag) : true;
    
    // 标签页筛选
    let tabMatch = true;
    if (activeTab === 'upcoming') {
      const followUpDate = dayjs(patient.nextFollowUp);
      const daysDiff = followUpDate.diff(dayjs(), 'day');
      tabMatch = daysDiff >= 0 && daysDiff <= 7;
    }
    
    return nameMatch && causeMatch && tagMatch && tabMatch;
  });

  useEffect(() => {
    if (editingPatient) {
      form.setFieldsValue({
        ...editingPatient,
        visitDate: dayjs(editingPatient.visitDate),
        nextFollowUp: editingPatient.nextFollowUp ? dayjs(editingPatient.nextFollowUp) : null,
      });
    } else {
      form.resetFields();
    }
  }, [editingPatient, form]);

  const handleOpenModal = (patient = null) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        const formattedValues = {
          ...values,
          visitDate: values.visitDate.format('YYYY-MM-DD'),
          nextFollowUp: values.nextFollowUp ? values.nextFollowUp.format('YYYY-MM-DD') : null,
          tags: values.tags || [],
        };

        if (editingPatient) {
          updatePatient(editingPatient.id, formattedValues);
          message.success('患者信息已更新');
        } else {
          addPatient(formattedValues);
          message.success('新患者已添加');
        }

        setIsModalOpen(false);
        setEditingPatient(null);
      })
      .catch(error => {
        console.error('表单验证失败:', error);
      });
  };

  const handleDeletePatient = (id) => {
    deletePatient(id);
    message.success('患者已删除');
  };

  // 自动设置随访日期（初诊后三个月）
  const handleVisitDateChange = (date) => {
    if (date) {
      const followUpDate = date.clone().add(3, 'month');
      form.setFieldsValue({ nextFollowUp: followUpDate });
    }
  };

  const columns = [
    {
      title: '患者信息',
      key: 'patientInfo',
      render: (_, record) => (
        <Space size="middle" align="center">
          <Avatar 
            size={48} 
            icon={<UserOutlined />} 
            className={`avatar-${record.gender}`}
          />
          <Space direction="vertical" size={0}>
            <Text strong>
              <Link to={`/patients/${record.id}`} className="patient-name-link">
                {record.name}
              </Link>
            </Text>
            <Text type="secondary" className="patient-meta">
              {record.gender}, {record.age}岁
            </Text>
            <Text type="secondary" className="patient-phone">
              {record.phone}
            </Text>
          </Space>
        </Space>
      ),
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
          className="cause-tag"
        >
          {text}
        </Tag>
      ),
    },
    {
      title: '初诊日期',
      dataIndex: 'visitDate',
      key: 'visitDate',
      sorter: (a, b) => dayjs(a.visitDate).unix() - dayjs(b.visitDate).unix(),
      render: (text) => (
        <Space>
          <CalendarOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '下次随访',
      dataIndex: 'nextFollowUp',
      key: 'nextFollowUp',
      sorter: (a, b) => {
        if (!a.nextFollowUp) return 1;
        if (!b.nextFollowUp) return -1;
        return dayjs(a.nextFollowUp).unix() - dayjs(b.nextFollowUp).unix();
      },
      render: (text) => {
        if (!text) return <Text type="secondary">暂未设置</Text>;
        
        const isToday = dayjs(text).isSame(dayjs(), 'day');
        const isUpcoming = dayjs(text).diff(dayjs(), 'day') <= 7 && dayjs(text).diff(dayjs(), 'day') >= 0;
        const isOverdue = dayjs(text).diff(dayjs(), 'day') < 0;
        
        return (
          <Space>
            {isToday ? (
              <Badge status="processing" text={<Text type="danger" strong>今日</Text>} />
            ) : isOverdue ? (
              <Badge status="error" text={<Text type="danger">已逾期</Text>} />
            ) : isUpcoming ? (
              <Badge status="warning" text={<Text type="warning">{dayjs(text).diff(dayjs(), 'day')}天后</Text>} />
            ) : (
              <Text>{text}</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
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
          <Tooltip title="编辑患者">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenModal(record)}
              className="edit-button"
            />
          </Tooltip>
          <Tooltip title="设置标签">
            <Button 
              type="default" 
              size="small" 
              icon={<TagsOutlined />} 
              onClick={() => console.log('设置标签', record.id)}
              className="tag-button"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此患者吗?"
            onConfirm={() => handleDeletePatient(record.id)}
            okText="是"
            cancelText="否"
          >
            <Tooltip title="删除患者">
              <Button 
                type="primary" 
                danger 
                size="small" 
                icon={<DeleteOutlined />} 
                className="delete-button"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 患者卡片视图
  const PatientCard = ({ patient }) => {
    const patientTags = patient.tags.map(tagId => tags.find(t => t.id === tagId)).filter(Boolean);
    const isUpcoming = patient.nextFollowUp && 
      dayjs(patient.nextFollowUp).diff(dayjs(), 'day') <= 7 && 
      dayjs(patient.nextFollowUp).diff(dayjs(), 'day') >= 0;
    const isToday = patient.nextFollowUp && dayjs(patient.nextFollowUp).isSame(dayjs(), 'day');
    
    return (
      <Card 
        hoverable 
        className="patient-card" 
        actions={[
          <Tooltip title="编辑">
            <EditOutlined key="edit" onClick={() => handleOpenModal(patient)} />
          </Tooltip>,
          <Tooltip title="设置标签">
            <TagsOutlined key="tags" />
          </Tooltip>,
          <Tooltip title="设置随访">
            <BellOutlined key="remind" />
          </Tooltip>,
        ]}
      >
        <div className="patient-card-header">
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            className={`avatar-${patient.gender}`}
          />
          <div className="patient-card-info">
            <Link to={`/patients/${patient.id}`} className="patient-name">
              {patient.name}
            </Link>
            <div className="patient-meta">
              <Space>
                <span>{patient.gender}, {patient.age}岁</span>
                <span>{patient.phone}</span>
              </Space>
            </div>
            <div className="patient-tags-container">
              {patientTags.map(tag => (
                <Tag color={tag.color} key={tag.id} className="patient-tag">
                  {tag.name}
                </Tag>
              ))}
            </div>
          </div>
          {isToday && (
            <Badge dot className="follow-up-badge" />
          )}
        </div>
        
        <div className="patient-card-details">
          <div className="detail-item">
            <FileProtectOutlined />
            <span className="detail-label">面瘫原因:</span>
            <Tag 
              color={
                patient.cause === '先天性' ? 'magenta' :
                patient.cause === 'BELL面瘫（面神经炎）' ? 'blue' :
                patient.cause === '外伤' ? 'orange' :
                patient.cause === '肿瘤' ? 'red' :
                patient.cause === '医源性' ? 'purple' : 
                'default'
              }
            >
              {patient.cause}
            </Tag>
          </div>
          
          <div className="detail-item">
            <CalendarOutlined />
            <span className="detail-label">初诊日期:</span>
            <span>{patient.visitDate}</span>
          </div>
          
          <div className="detail-item">
            <BellOutlined />
            <span className="detail-label">下次随访:</span>
            {patient.nextFollowUp ? (
              isToday ? (
                <Text type="danger" strong>今日</Text>
              ) : isUpcoming ? (
                <Text type="warning">{patient.nextFollowUp} ({dayjs(patient.nextFollowUp).diff(dayjs(), 'day')}天后)</Text>
              ) : (
                <span>{patient.nextFollowUp}</span>
              )
            ) : (
              <Text type="secondary">暂未设置</Text>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span><TeamOutlined /> 所有患者</span>
      ),
      children: null,
    },
    {
      key: 'upcoming',
      label: (
        <span>
          <BellOutlined /> 即将随访
        </span>
      ),
      children: null,
    },
  ];

  return (
    <div className="patient-list-container fade-in">
      <div className="page-header">
        <Title level={4}>患者管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          className="add-patient-btn"
          onClick={() => handleOpenModal()}
        >
          添加患者
        </Button>
      </div>

      <Card className="filter-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        
        <Row gutter={16} style={{ marginBottom: 16, marginTop: 16 }}>
          <Col xs={24} sm={24} md={8}>
            <Input
              placeholder="搜索患者姓名"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              className="search-input"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="按面瘫原因筛选"
              onChange={value => setFilterCause(value)}
              allowClear
              className="filter-select"
            >
              {causesOptions.map(cause => (
                <Option key={cause} value={cause}>{cause}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="按标签筛选"
              onChange={value => setFilterTag(value)}
              allowClear
              className="filter-select"
            >
              {tags.map(tag => (
                <Option key={tag.id} value={tag.id}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <div className="list-actions">
          <Space>
            <Badge count={filteredPatients.length} showZero>
              <Button icon={<FilterOutlined />}>筛选结果</Button>
            </Badge>
            <Segmented
              options={[
                {
                  value: 'table',
                  icon: <SortAscendingOutlined />,
                  label: '表格视图',
                },
                {
                  value: 'grid',
                  icon: <AppstoreOutlined />,
                  label: '卡片视图',
                },
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={filteredPatients}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="patients-table"
            rowClassName="patient-row"
          />
        ) : (
          <Row gutter={[16, 16]} className="patient-cards-container">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <Col xs={24} sm={12} md={8} lg={6} key={patient.id}>
                  <PatientCard patient={patient} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div className="empty-state">
                  <Title level={5}>暂无符合条件的患者</Title>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    添加患者
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        )}
      </Card>

      {/* 添加/编辑患者的模态框 */}
      <Modal
        title={editingPatient ? '编辑患者信息' : '添加新患者'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        width={700}
        className="patient-modal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            gender: '男',
            visitDate: dayjs(),
            tags: [],
          }}
          className="patient-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Radio value="男">男</Radio>
                  <Radio value="女">女</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入患者年龄' }]}
              >
                <Input type="number" placeholder="请输入患者年龄" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cause"
            label="面瘫原因"
            rules={[{ required: true, message: '请选择面瘫原因' }]}
          >
            <Select placeholder="请选择面瘫原因">
              {causesOptions.map(cause => (
                <Option key={cause} value={cause}>{cause}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="visitDate"
                label="初诊日期"
                rules={[{ required: true, message: '请选择初诊日期' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  onChange={handleVisitDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextFollowUp"
                label="下次随访日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select mode="multiple" placeholder="请选择标签">
              {tags.map(tag => (
                <Option key={tag.id} value={tag.id}>
                  <Tag color={tag.color}>{tag.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 添加AppstoreOutlined图标
const AppstoreOutlined = () => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">
    <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656zM492 400h184c4.4 0 8-3.6 8-8v-184c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm0 424h184c4.4 0 8-3.6 8-8V632c0-4.4-3.6-8-8-8H492c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm-292 0h184c4.4 0 8-3.6 8-8V632c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8zm0-424h184c4.4 0 8-3.6 8-8v-184c0-4.4-3.6-8-8-8H200c-4.4 0-8 3.6-8 8v184c0 4.4 3.6 8 8 8z" />
  </svg>
);

export default PatientList; 