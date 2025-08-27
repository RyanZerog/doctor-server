import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input,
  ColorPicker,
  message,
  Popconfirm,
  Typography,
  Tooltip,
  Empty,
  Row,
  Col,
  Badge,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TagOutlined,
  TeamOutlined,
  AppstoreOutlined,

  ExclamationCircleOutlined
} from '@ant-design/icons';
import useTagStore from '../store/useTagStore';
import usePatientStore from '../store/usePatientStore';
import { useNavigate } from 'react-router-dom';
import './TagManagement.css';

const { Title, Text } = Typography;

const TagManagement = () => {
  const { tags, addTag, editTag, deleteTag } = useTagStore();
  const { patients } = usePatientStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [form] = Form.useForm();

  const handleOpenModal = (tag = null) => {
    setEditingTag(tag);
    setIsModalOpen(true);
    
    if (tag) {
      form.setFieldsValue({
        name: tag.name,
        color: tag.color,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        color: '#1D5B79',
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        if (editingTag) {
          editTag(editingTag.id, values);
          message.success('标签已更新');
        } else {
          addTag(values);
          message.success('新标签已创建');
        }
        setIsModalOpen(false);
        setEditingTag(null);
      })
      .catch(error => {
        console.error('表单验证失败:', error);
      });
  };

  const handleDeleteTag = (tagId) => {
    // 检查是否有患者使用了此标签
    const patientsWithTag = patients.filter(patient => 
      patient.tags.includes(tagId)
    );
    
    if (patientsWithTag.length > 0) {
      Modal.confirm({
        title: '确定要删除此标签吗?',
        content: (
          <div className="confirm-content">
            <ExclamationCircleOutlined className="warning-icon" />
            <Text>当前有 <Text strong>{patientsWithTag.length}</Text> 位患者使用了此标签。删除后，这些患者将不再拥有此标签。</Text>
            <div className="patient-list">
              {patientsWithTag.slice(0, 3).map(patient => (
                <div key={patient.id} className="patient-item">
                  <Badge dot offset={[0, 3]} color="#1D5B79" />
                  <Text>{patient.name}</Text>
                </div>
              ))}
              {patientsWithTag.length > 3 && 
                <Text type="secondary">等 {patientsWithTag.length} 位患者</Text>
              }
            </div>
          </div>
        ),
        okText: '确定删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          deleteTag(tagId);
          message.success('标签已删除');
        },
      });
    } else {
      deleteTag(tagId);
      message.success('标签已删除');
    }
  };

  // 跳转到患者列表并按标签过滤
  const handleViewPatientsByTag = (tagId) => {
    navigate(`/patients?tag=${tagId}`);
  };

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="tag-name-column">
          <Tag
            color={record.color}
            key={record.id}
            className="tag-display clickable-tag"
            style={{ cursor: 'pointer' }}
            onClick={() => handleViewPatientsByTag(record.id)}
          >
            <TagOutlined className="tag-icon" />
            <span className="tag-text">{text}</span>
          </Tag>
        </div>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <div className="color-preview-container">
          <Tooltip title={color}>
            <div 
              className="color-preview" 
              style={{ 
                backgroundColor: color
              }} 
            />
          </Tooltip>
          <Text className="color-code">{color}</Text>
        </div>
      ),
    },
    {
      title: '使用患者数',
      key: 'usageCount',
      render: (_, record) => {
        const count = patients.filter(patient => 
          patient.tags.includes(record.id)
        ).length;
        
        return (
          <div
            className="usage-count clickable-usage"
            style={{ cursor: count > 0 ? 'pointer' : 'default' }}
            onClick={() => count > 0 && handleViewPatientsByTag(record.id)}
          >
            <TeamOutlined className="usage-icon" />
            <Badge
              count={count}
              showZero
              style={{ backgroundColor: count ? '#1D5B79' : '#d9d9d9' }}
              className="usage-badge"
            />
            {count > 0 && (
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                点击查看
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="编辑">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleOpenModal(record)}
              className="edit-button"
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除此标签吗?"
            onConfirm={() => handleDeleteTag(record.id)}
            okText="是"
            cancelText="否"
          >
            <Tooltip title="删除">
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

  // 标签卡片组件
  const TagCard = ({ tag }) => {
    // 获取使用此标签的患者数量
    const usageCount = patients.filter(patient => 
      patient.tags.includes(tag.id)
    ).length;

    // 获取使用此标签的前5名患者
    const usedByPatients = patients
      .filter(patient => patient.tags.includes(tag.id))
      .slice(0, 5);

    return (
      <Card 
        hoverable 
        className="tag-card" 
        style={{ borderTop: `4px solid ${tag.color}` }}
        actions={[
          <Tooltip title="编辑标签">
            <EditOutlined key="edit" onClick={() => handleOpenModal(tag)} />
          </Tooltip>,
          <Tooltip title="删除标签">
            <DeleteOutlined 
              key="delete" 
              onClick={() => handleDeleteTag(tag.id)}
              className="delete-icon"
            />
          </Tooltip>
        ]}
      >
        <div className="tag-header">
          <Tag
            color={tag.color}
            className="tag-display-card clickable-tag"
            style={{ cursor: 'pointer' }}
            onClick={() => handleViewPatientsByTag(tag.id)}
          >
            <TagOutlined />
            <span>{tag.name}</span>
          </Tag>
          <div className="color-code-container">
            <div className="color-dot" style={{ backgroundColor: tag.color }} />
            <Text type="secondary" className="color-code">{tag.color}</Text>
          </div>
        </div>

        <div className="tag-stats">
          <div
            className="stat-item clickable-stat"
            style={{ cursor: usageCount > 0 ? 'pointer' : 'default' }}
            onClick={() => usageCount > 0 && handleViewPatientsByTag(tag.id)}
          >
            <Text type="secondary">使用患者数</Text>
            <div className="stat-value">
              <TeamOutlined />
              <Text strong>{usageCount}</Text>
              {usageCount > 0 && (
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '4px' }}>
                  点击查看
                </Text>
              )}
            </div>
          </div>
        </div>

        {usageCount > 0 && (
          <div className="used-by-patients">
            <Text type="secondary" className="section-title">使用此标签的患者：</Text>
            <div className="patient-avatars">
              {usedByPatients.map((patient, index) => (
                <Tooltip key={patient.id} title={`${patient.name} - 点击查看详情`}>
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor: patient.gender === '男' ? '#6ba3d6' : '#f4a6cd',
                      marginLeft: index > 0 ? -6 : 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    {patient.name.substring(0, 1)}
                  </Avatar>
                </Tooltip>
              ))}
              {usageCount > 5 && (
                <Avatar 
                  size="small" 
                  style={{ backgroundColor: '#fafafa', color: 'rgba(0, 0, 0, 0.45)', marginLeft: -6 }}
                >
                  +{usageCount - 5}
                </Avatar>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="tag-management-container">
      <div className="page-header">
        <Title level={4}>标签管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          className="add-tag-button"
        >
          新建标签
        </Button>
      </div>

      <Card className="tag-list-card">
        <div className="view-switcher">
          <Space>
            <Button.Group>
              <Button 
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('table')}
              >
                表格视图
              </Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
            </Button.Group>
          </Space>
        </div>

        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={tags}
            rowKey="id"
            pagination={false}
            className="tags-table"
            locale={{
              emptyText: (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="暂无标签" 
                />
              )
            }}
          />
        ) : (
          <Row gutter={[16, 16]} className="tag-cards-container">
            {tags.length > 0 ? (
              tags.map(tag => (
                <Col xs={24} sm={12} md={8} lg={6} key={tag.id}>
                  <TagCard tag={tag} />
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Empty 
                  description="暂无标签" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
              </Col>
            )}
          </Row>
        )}
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={handleCancel}
        className="tag-modal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            color: '#1D5B79',
          }}
          className="tag-form"
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" maxLength={20} showCount />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker showText />
          </Form.Item>

          <div className="tag-preview">
            <div className="preview-label">标签预览：</div>
            <Tag 
              color={form.getFieldValue('color')} 
              className="preview-tag"
            >
              <TagOutlined />
              <span>{form.getFieldValue('name') || '标签名称'}</span>
            </Tag>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TagManagement; 