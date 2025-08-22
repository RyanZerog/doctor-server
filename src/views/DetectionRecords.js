import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Typography,
  Avatar,
  Tooltip,
  message,
  Modal,
  Statistic
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  DeleteOutlined,
  ExportOutlined,
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import useDetectionStore, { ActionTypeNames, FaceActionTypes } from '../store/useDetectionStore';
import usePatientStore from '../store/usePatientStore';
import './DetectionRecords.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DetectionRecords = () => {
  const { detectionRecords, deleteRecord, deleteRecords, getActionTypeStats } = useDetectionStore();
  const { patients } = usePatientStore();
  
  const [searchText, setSearchText] = useState('');
  const [filterActionType, setFilterActionType] = useState(null);
  const [filterPatient, setFilterPatient] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 过滤检测记录
  const filteredRecords = useMemo(() => {
    return detectionRecords.filter(record => {
      const patient = patients.find(p => p.id === record.patientId);
      
      // 患者姓名搜索
      const nameMatch = !searchText || 
        (patient && patient.name.toLowerCase().includes(searchText.toLowerCase()));
      
      // 动作类型筛选
      const actionMatch = !filterActionType || record.actionType === filterActionType;
      
      // 患者筛选
      const patientMatch = !filterPatient || record.patientId === filterPatient;
      
      // 日期范围筛选
      const dateMatch = !dateRange || (
        dayjs(record.timestamp).isAfter(dateRange[0]) && 
        dayjs(record.timestamp).isBefore(dateRange[1])
      );
      
      return nameMatch && actionMatch && patientMatch && dateMatch;
    });
  }, [detectionRecords, patients, searchText, filterActionType, filterPatient, dateRange]);

  // 获取动作类型颜色
  const getActionTypeColor = (actionType) => {
    const colors = {
      [FaceActionTypes.STILL]: 'blue',
      [FaceActionTypes.RAISE_EYEBROWS]: 'green',
      [FaceActionTypes.WRINKLE_NOSE]: 'orange',
      [FaceActionTypes.SMILE]: 'red',
      [FaceActionTypes.PUCKER_LIPS]: 'purple',
      [FaceActionTypes.CLOSE_EYES]: 'cyan'
    };
    return colors[actionType] || 'default';
  };

  // 获取评分等级
  const getScoreLevel = (score) => {
    if (score >= 18) return { level: '优秀', color: '#52c41a' };
    if (score >= 15) return { level: '良好', color: '#1890ff' };
    if (score >= 10) return { level: '一般', color: '#faad14' };
    return { level: '较差', color: '#f5222d' };
  };

  // 表格列定义
  const columns = [
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => {
        const patient = patients.find(p => p.id === record.patientId);
        return patient ? (
          <Space>
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              className={`avatar-${patient.gender}`}
            />
            <div>
              <Link to={`/patients/${patient.id}`} className="patient-name">
                {patient.name}
              </Link>
              <div className="patient-meta">
                <Text type="secondary">{patient.gender}, {patient.age}岁</Text>
              </div>
            </div>
          </Space>
        ) : (
          <Text type="secondary">患者信息不存在</Text>
        );
      }
    },
    {
      title: '动作类型',
      dataIndex: 'actionType',
      key: 'actionType',
      render: (actionType) => (
        <Tag color={getActionTypeColor(actionType)}>
          {ActionTypeNames[actionType]}
        </Tag>
      ),
      filters: Object.values(FaceActionTypes).map(type => ({
        text: ActionTypeNames[type],
        value: type
      })),
      onFilter: (value, record) => record.actionType === value
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => {
        const { level, color } = getScoreLevel(score);
        return (
          <div className="score-display-container">
            <Text strong className="score-value" style={{ color }}>
              {score.toFixed(1)}
            </Text>
            <Tag color={color} className="score-level-tag">
              {level}
            </Tag>
          </div>
        );
      },
      sorter: (a, b) => a.score - b.score
    },
    {
      title: '检测时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Space>
          <CalendarOutlined />
          <span>{dayjs(timestamp).format('YYYY-MM-DD HH:mm')}</span>
        </Space>
      ),
      sorter: (a, b) => a.timestamp - b.timestamp
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => (
        <Tooltip title={notes}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {notes || '-'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handleViewRecord(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRecord(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理查看记录详情
  const handleViewRecord = (record) => {
    // 这里可以打开详情模态框或跳转到详情页面
    message.info('查看记录详情功能待实现');
  };

  // 处理删除单个记录
  const handleDeleteRecord = (recordId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条检测记录吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        deleteRecord(recordId);
        message.success('检测记录已删除');
      }
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？删除后无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        deleteRecords(selectedRowKeys);
        setSelectedRowKeys([]);
        message.success(`已删除 ${selectedRowKeys.length} 条记录`);
      }
    });
  };

  // 清除筛选条件
  const handleClearFilters = () => {
    setSearchText('');
    setFilterActionType(null);
    setFilterPatient(null);
    setDateRange(null);
    message.success('已清除所有筛选条件');
  };

  // 获取统计数据
  const totalRecords = filteredRecords.length;
  const averageScore = totalRecords > 0 
    ? filteredRecords.reduce((sum, record) => sum + record.score, 0) / totalRecords 
    : 0;

  return (
    <div className="detection-records">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总检测记录"
              value={totalRecords}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="平均评分"
              value={averageScore}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="活跃患者"
              value={new Set(filteredRecords.map(r => r.patientId)).size}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主要内容卡片 */}
      <Card 
        title={<Title level={4}>检测记录管理</Title>}
        extra={
          <Space>
            <Button icon={<ExportOutlined />}>
              导出数据
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        }
      >
        {/* 筛选条件 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Input
              placeholder="搜索患者姓名"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="动作类型"
              value={filterActionType}
              onChange={setFilterActionType}
              allowClear
            >
              {Object.entries(ActionTypeNames).map(([type, name]) => (
                <Option key={type} value={type}>{name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择患者"
              value={filterPatient}
              onChange={setFilterPatient}
              allowClear
            >
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>{patient.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col xs={24} sm={2}>
            <Button onClick={handleClearFilters}>
              清除
            </Button>
          </Col>
        </Row>

        {/* 检测记录表格 */}
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            selections: [
              Table.SELECTION_ALL,
              Table.SELECTION_INVERT,
              Table.SELECTION_NONE
            ]
          }}
          className="detection-records-table"
        />
      </Card>
    </div>
  );
};

export default DetectionRecords;
