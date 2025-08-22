import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Descriptions,
  Image,
  Statistic,
  Progress,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useDetectionStore, { ActionTypeNames } from '../store/useDetectionStore';
import usePatientStore from '../store/usePatientStore';
import './DetectionRecordDetail.css';

const { Title, Paragraph, Text } = Typography;

const DetectionRecordDetail = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { getRecordById } = useDetectionStore();
  const { patients } = usePatientStore();
  
  const record = getRecordById(recordId);
  const patient = record ? patients.find(p => p.id === record.patientId) : null;

  if (!record) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={4}>未找到检测记录</Title>
          <Button type="primary" onClick={() => navigate('/detection-records')}>
            返回记录列表
          </Button>
        </div>
      </Card>
    );
  }

  // 获取评分等级和颜色
  const getScoreLevel = (score) => {
    if (score >= 18) return { level: '优秀', color: '#52c41a', percent: 90 };
    if (score >= 15) return { level: '良好', color: '#1890ff', percent: 75 };
    if (score >= 10) return { level: '一般', color: '#faad14', percent: 50 };
    return { level: '较差', color: '#f5222d', percent: 25 };
  };

  const scoreInfo = getScoreLevel(record.score);

  // 获取动作类型颜色
  const getActionTypeColor = (actionType) => {
    const colors = {
      'STILL': 'blue',
      'RAISE_EYEBROWS': 'green',
      'WRINKLE_NOSE': 'orange',
      'SMILE': 'red',
      'PUCKER_LIPS': 'purple',
      'CLOSE_EYES': 'cyan'
    };
    return colors[actionType] || 'default';
  };

  return (
    <div className="detection-record-detail">
      {/* 头部导航 */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/detection-records')}
              >
                返回列表
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                检测记录详情
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />}>
                编辑记录
              </Button>
              <Button icon={<ShareAltOutlined />}>
                分享报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 左侧：基本信息和评分 */}
        <Col xs={24} lg={8}>
          {/* 患者信息卡片 */}
          {patient && (
            <Card title="患者信息" className="patient-info-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="patient-header">
                  <Space>
                    <div className={`patient-avatar avatar-${patient.gender}`}>
                      <UserOutlined />
                    </div>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {patient.name}
                      </Title>
                      <Text type="secondary">
                        {patient.gender}, {patient.age}岁
                      </Text>
                    </div>
                  </Space>
                </div>
                
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="联系电话">
                    {patient.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="面瘫原因">
                    {patient.cause}
                  </Descriptions.Item>
                  <Descriptions.Item label="患侧">
                    <Tag color={patient.affectedSide === 'left' ? 'orange' : 'blue'}>
                      {patient.affectedSide === 'left' ? '左侧' : '右侧'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="主治医生">
                    {patient.attendingDoctor}
                  </Descriptions.Item>
                </Descriptions>
              </Space>
            </Card>
          )}

          {/* 评分信息卡片 */}
          <Card title="评分信息" className="score-info-card">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div className="score-display">
                <Statistic
                  title="总评分"
                  value={record.score}
                  precision={1}
                  valueStyle={{ 
                    color: scoreInfo.color,
                    fontSize: '32px',
                    fontWeight: 'bold'
                  }}
                  suffix="分"
                />
                <Progress
                  percent={scoreInfo.percent}
                  strokeColor={scoreInfo.color}
                  showInfo={false}
                  size="small"
                />
                <Tag color={scoreInfo.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {scoreInfo.level}
                </Tag>
              </div>

              {/* 详细评分信息 */}
              {record.facialSymmetryScore && (
                <div className="detailed-scores">
                  <Title level={5}>面部对称性评分</Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="眼部"
                        value={record.facialSymmetryScore.eyeScore}
                        suffix="/1"
                        valueStyle={{ fontSize: '18px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.facialSymmetryScore.eyeOption}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="面颊"
                        value={record.facialSymmetryScore.cheekScore}
                        suffix="/2"
                        valueStyle={{ fontSize: '18px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.facialSymmetryScore.cheekOption}
                      </Text>
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="嘴部"
                        value={record.facialSymmetryScore.mouthScore}
                        suffix="/1"
                        valueStyle={{ fontSize: '18px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.facialSymmetryScore.mouthOption}
                      </Text>
                    </Col>
                  </Row>
                </div>
              )}

              {record.dynamicActionScore && (
                <div className="detailed-scores">
                  <Title level={5}>动态动作评分</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="对称性"
                        value={record.dynamicActionScore.symmetryScore}
                        suffix="/5"
                        valueStyle={{ fontSize: '18px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.dynamicActionScore.symmetryOption}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="联动性"
                        value={record.dynamicActionScore.linkageScore}
                        suffix="/3"
                        valueStyle={{ fontSize: '18px' }}
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.dynamicActionScore.linkageOption}
                      </Text>
                    </Col>
                  </Row>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 右侧：检测详情和图像 */}
        <Col xs={24} lg={16}>
          {/* 检测基本信息 */}
          <Card title="检测信息" className="detection-info-card">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="动作类型" span={1}>
                <Tag color={getActionTypeColor(record.actionType)}>
                  {ActionTypeNames[record.actionType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="检测时间" span={1}>
                <Space>
                  <CalendarOutlined />
                  {dayjs(record.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="记录ID" span={2}>
                <Text code>{record.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="备注信息" span={2}>
                {record.notes || '无备注'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 检测图像 */}
          <Card title="检测图像" className="detection-images-card">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div className="image-container">
                  <Title level={5}>原始图像</Title>
                  <Image
                    src={record.originalImageUri || '/images/placeholder.jpg'}
                    alt="原始图像"
                    fallback="/images/placeholder.jpg"
                    preview={{
                      mask: <EyeOutlined />
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="image-container">
                  <Title level={5}>特征点标注</Title>
                  <Image
                    src={record.imageUri || '/images/placeholder.jpg'}
                    alt="特征点标注图像"
                    fallback="/images/placeholder.jpg"
                    preview={{
                      mask: <EyeOutlined />
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="image-container">
                  <Title level={5}>边缘检测</Title>
                  <Image
                    src={record.edgeImageUri || '/images/placeholder.jpg'}
                    alt="边缘检测图像"
                    fallback="/images/placeholder.jpg"
                    preview={{
                      mask: <EyeOutlined />
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* 分析建议 */}
          <Card title="分析建议" className="analysis-suggestions-card">
            <Alert
              message="康复建议"
              description={
                <div>
                  <Paragraph>
                    根据本次检测结果，患者在{ActionTypeNames[record.actionType]}动作上的表现为
                    <Text strong style={{ color: scoreInfo.color }}>{scoreInfo.level}</Text>
                    （{record.score.toFixed(1)}分）。
                  </Paragraph>
                  
                  {record.score < 15 && (
                    <Paragraph>
                      <Text type="warning">
                        建议加强面部肌肉训练，特别是{patient?.affectedSide === 'left' ? '左侧' : '右侧'}面部的康复练习。
                        可以考虑增加训练频次或调整治疗方案。
                      </Text>
                    </Paragraph>
                  )}
                  
                  {record.score >= 15 && (
                    <Paragraph>
                      <Text type="success">
                        康复进展良好，请继续保持当前的治疗方案和训练强度。
                        建议定期复查以监测康复进度。
                      </Text>
                    </Paragraph>
                  )}
                </div>
              }
              type={record.score >= 15 ? 'success' : 'warning'}
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DetectionRecordDetail;
