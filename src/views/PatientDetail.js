import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Divider, 
  Row, 
  Col,
  Select,
  DatePicker,
  Modal,
  message,
  Typography,
  Popconfirm
} from 'antd';
import { 
  EditOutlined, 
  TagsOutlined, 
  BellOutlined, 
  ArrowLeftOutlined,
  DeleteOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import useTagStore from '../store/useTagStore';

const { Option } = Select;
const { Title } = Typography;

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, updatePatientTags, setFollowUpDate, deletePatient } = usePatientStore();
  const { tags } = useTagStore();
  
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [followUpDate, setFollowUpDateState] = useState(null);

  const patient = patients.find(p => p.id === id);
  
  if (!patient) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={4}>未找到患者信息</Title>
          <Button type="primary" onClick={() => navigate('/patients')}>
            返回患者列表
          </Button>
        </div>
      </Card>
    );
  }

  // 初始化选中的标签
  const handleOpenTagModal = () => {
    setSelectedTags(patient.tags || []);
    setIsTagModalOpen(true);
  };

  const handleTagsSubmit = () => {
    updatePatientTags(patient.id, selectedTags);
    setIsTagModalOpen(false);
    message.success('标签已更新');
  };

  // 初始化随访日期
  const handleOpenFollowUpModal = () => {
    setFollowUpDateState(patient.nextFollowUp ? dayjs(patient.nextFollowUp) : null);
    setIsFollowUpModalOpen(true);
  };

  const handleFollowUpSubmit = () => {
    const dateString = followUpDate ? followUpDate.format('YYYY-MM-DD') : null;
    setFollowUpDate(patient.id, dateString);
    setIsFollowUpModalOpen(false);
    message.success('随访日期已设置');
  };

  // 删除患者
  const handleDeletePatient = () => {
    deletePatient(patient.id);
    message.success('患者已删除');
    navigate('/patients');
  };

  return (
    <>
      <Card 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/patients')}
              type="link"
            />
            <span>患者详情</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<TagsOutlined />} 
              onClick={handleOpenTagModal}
            >
              管理标签
            </Button>
            <Button 
              icon={<BellOutlined />} 
              onClick={handleOpenFollowUpModal}
            >
              设置随访
            </Button>
            <Button 
              icon={<EditOutlined />} 
              type="primary"
              onClick={() => navigate(`/patients/${patient.id}/edit`)}
            >
              编辑信息
            </Button>
            <Popconfirm
              title="确定要删除此患者吗?"
              description="删除后无法恢复"
              onConfirm={handleDeletePatient}
              okText="是"
              cancelText="否"
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ marginBottom: 16 }}>
              <Title level={3}>{patient.name}</Title>
              <Space size="large">
                <span>
                  {patient.gender}, {patient.age}岁
                </span>
                <span>
                  联系电话: {patient.phone}
                </span>
                {patient.nextFollowUp && (
                  <span>
                    <CalendarOutlined /> 下次随访: {patient.nextFollowUp}
                  </span>
                )}
              </Space>
              <div style={{ marginTop: 8 }}>
                {patient.tags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <Tag color={tag.color} key={tagId} style={{ marginBottom: 8 }}>
                      {tag.name}
                    </Tag>
                  ) : null;
                })}
              </div>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Descriptions title="基本信息" bordered>
          <Descriptions.Item label="面瘫原因" span={3}>
            {patient.cause}
          </Descriptions.Item>
          <Descriptions.Item label="初诊日期" span={3}>
            {patient.visitDate}
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>
            {patient.notes || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5}>随访记录</Title>
        {/* 这里可以放置随访记录相关内容 */}
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
          暂无随访记录
        </div>
      </Card>

      {/* 标签管理模态框 */}
      <Modal
        title="管理患者标签"
        open={isTagModalOpen}
        onOk={handleTagsSubmit}
        onCancel={() => setIsTagModalOpen(false)}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="请选择标签"
          value={selectedTags}
          onChange={setSelectedTags}
        >
          {tags.map(tag => (
            <Option key={tag.id} value={tag.id}>
              <Tag color={tag.color}>{tag.name}</Tag>
            </Option>
          ))}
        </Select>
      </Modal>

      {/* 随访日期模态框 */}
      <Modal
        title="设置随访日期"
        open={isFollowUpModalOpen}
        onOk={handleFollowUpSubmit}
        onCancel={() => setIsFollowUpModalOpen(false)}
      >
        <div style={{ textAlign: 'center' }}>
          <p>为患者 {patient.name} 设置下次随访日期</p>
          <div style={{ margin: '20px 0' }}>
            <DatePicker 
              style={{ width: '100%' }} 
              value={followUpDate}
              onChange={setFollowUpDateState}
              placeholder="选择随访日期"
            />
          </div>
          <p style={{ color: '#999' }}>
            建议随访周期为3个月
            {patient.visitDate && (
              <Button 
                type="link" 
                onClick={() => {
                  const threeMonthsLater = dayjs(patient.visitDate).add(3, 'month');
                  setFollowUpDateState(threeMonthsLater);
                }}
              >
                设置为3个月后({dayjs(patient.visitDate).add(3, 'month').format('YYYY-MM-DD')})
              </Button>
            )}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default PatientDetail; 