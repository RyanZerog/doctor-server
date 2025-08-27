import React, { useState, useMemo } from 'react';
import { 
  Row, Col, Card, Table, Tag, Button, Select, DatePicker, Space, 
  Typography, Progress, Statistic, Tabs, Empty, Badge, Tooltip,
  Modal, Image, Descriptions
} from 'antd';
import { 
  BarChartOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  FilterOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LineChartOutlined,
  SmileOutlined,
  FrownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import usePatientStore from '../store/usePatientStore';
import './AssessmentDetails.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const AssessmentDetails = () => {
  const navigate = useNavigate();
  const { patients } = usePatientStore();
  const [selectedPatient, setSelectedPatient] = useState('all');

  const [dateRange, setDateRange] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 面部评分选项配置（基于Android应用的表A和表B）
  const scoringOptions = {
    // 表A：功能评分（正向得分，分数越高越好）
    function: {
      '静止-眼（脸裂）': [
        { label: '正常', score: 0, weight: 1, type: 'static' },
        { label: '缩窄', score: 1, weight: 1, type: 'static' },
        { label: '增宽', score: 1, weight: 1, type: 'static' },
        { label: '做过眼睑整形手术', score: 1, weight: 1, type: 'static' }
      ],
      '静止-鼻唇沟': [
        { label: '正常', score: 0, weight: 1, type: 'static' },
        { label: '消失', score: 2, weight: 1, type: 'static' },
        { label: '不明显', score: 1, weight: 1, type: 'static' },
        { label: '过于明显', score: 1, weight: 1, type: 'static' }
      ],
      '静止-嘴': [
        { label: '正常', score: 0, weight: 1, type: 'static' },
        { label: '口角下垂', score: 1, weight: 1, type: 'static' },
        { label: '口角上提', score: 1, weight: 1, type: 'static' }
      ],
      '抬眉': [
        { label: '完全正常', score: 4, weight: 4, type: 'voluntary' },
        { label: '轻度减弱', score: 3, weight: 4, type: 'voluntary' },
        { label: '中度减弱', score: 2, weight: 4, type: 'voluntary' },
        { label: '重度减弱', score: 1, weight: 4, type: 'voluntary' },
        { label: '完全无力', score: 0, weight: 4, type: 'voluntary' }
      ],
      '耸鼻': [
        { label: '完全正常', score: 4, weight: 4, type: 'voluntary' },
        { label: '轻度减弱', score: 3, weight: 4, type: 'voluntary' },
        { label: '中度减弱', score: 2, weight: 4, type: 'voluntary' },
        { label: '重度减弱', score: 1, weight: 4, type: 'voluntary' },
        { label: '完全无力', score: 0, weight: 4, type: 'voluntary' }
      ],
      '微笑': [
        { label: '完全正常', score: 4, weight: 4, type: 'voluntary' },
        { label: '轻度减弱', score: 3, weight: 4, type: 'voluntary' },
        { label: '中度减弱', score: 2, weight: 4, type: 'voluntary' },
        { label: '重度减弱', score: 1, weight: 4, type: 'voluntary' },
        { label: '完全无力', score: 0, weight: 4, type: 'voluntary' }
      ],
      '撅嘴': [
        { label: '完全正常', score: 4, weight: 4, type: 'voluntary' },
        { label: '轻度减弱', score: 3, weight: 4, type: 'voluntary' },
        { label: '中度减弱', score: 2, weight: 4, type: 'voluntary' },
        { label: '重度减弱', score: 1, weight: 4, type: 'voluntary' },
        { label: '完全无力', score: 0, weight: 4, type: 'voluntary' }
      ],
      '闭眼': [
        { label: '完全正常', score: 4, weight: 4, type: 'voluntary' },
        { label: '轻度减弱', score: 3, weight: 4, type: 'voluntary' },
        { label: '中度减弱', score: 2, weight: 4, type: 'voluntary' },
        { label: '重度减弱', score: 1, weight: 4, type: 'voluntary' },
        { label: '完全无力', score: 0, weight: 4, type: 'voluntary' }
      ]
    },
    // 表B：联动评分（负向得分，分数越低越好）
    synkinesis: [
      { label: '无联动', score: 0 },
      { label: '轻度联动', score: 1 },
      { label: '中度联动', score: 2 },
      { label: '重度联动', score: 3 }
    ]
  };

  // H-B评级标准（基于Sunny Brook总分）
  const getHBGrade = (sunnyBrookScore) => {
    if (sunnyBrookScore >= 70) return { grade: 'I', description: '正常功能' };
    if (sunnyBrookScore >= 56) return { grade: 'II', description: '轻度功能障碍' };
    if (sunnyBrookScore >= 42) return { grade: 'III', description: '中度功能障碍' };
    if (sunnyBrookScore >= 28) return { grade: 'IV', description: '中重度功能障碍' };
    if (sunnyBrookScore >= 14) return { grade: 'V', description: '重度功能障碍' };
    return { grade: 'VI', description: '完全瘫痪' };
  };

  // 模拟移动端评估数据（按评估记录组织）
  const mockAssessmentData = useMemo(() => {
    const actions = ['静止-眼（脸裂）', '静止-鼻唇沟', '静止-嘴', '抬眉', '耸鼻', '微笑', '撅嘴', '闭眼'];
    const data = [];

    patients.slice(0, 8).forEach((patient, patientIndex) => {
      // 为每个患者生成3-5次完整评估记录
      const recordCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < recordCount; i++) {
        const assessmentId = `assessment-${patientIndex}-${i}`;
        const timestamp = dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss');

        // 生成六个动作的评分
        const actionScores = actions.map(action => {
          const functionOptions = scoringOptions.function[action];
          const selectedFunction = functionOptions[Math.floor(Math.random() * functionOptions.length)];
          const selectedSynkinesis = scoringOptions.synkinesis[Math.floor(Math.random() * scoringOptions.synkinesis.length)];

          return {
            action,
            function: {
              label: selectedFunction.label,
              score: selectedFunction.score,
              weight: selectedFunction.weight,
              type: selectedFunction.type,
              weightedScore: selectedFunction.score * selectedFunction.weight
            },
            synkinesis: {
              label: selectedSynkinesis.label,
              score: selectedSynkinesis.score
            }
          };
        });

        // 计算各项得分
        const eyeScore = actionScores.find(item => item.action === '眼（脸裂）')?.function.score || 0;
        const nasolabialScore = actionScores.find(item => item.action === '鼻唇沟')?.function.score || 0;
        const mouthScore = actionScores.find(item => item.action === '嘴')?.function.score || 0;
        const staticScore = (eyeScore + nasolabialScore + mouthScore) * 5;
        const voluntaryScore = actionScores
          .filter(item => item.function.type === 'voluntary')
          .reduce((sum, item) => sum + item.function.weightedScore, 0);
        const synkinesisScore = actionScores.reduce((sum, item) => sum + item.synkinesis.score, 0);

        // 计算Sunny Brook总分：随意运动分 - 静态分 - 联动分
        const sunnyBrookScore = Math.max(0, voluntaryScore - staticScore - synkinesisScore);
        const hbGrade = getHBGrade(sunnyBrookScore);

        data.push({
          id: assessmentId,
          patientId: patient.id,
          patientName: patient.name,
          timestamp,
          actionScores,
          staticScore,
          voluntaryScore,
          synkinesisScore,
          sunnyBrookScore,
          hbGrade,
          imageUrl: '/api/placeholder/300/200',
          notes: i % 3 === 0 ? '检测到轻微异常联动' : ''
        });
      }
    });

    return data.sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix());
  }, [patients]);

  // 过滤数据
  const filteredData = useMemo(() => {
    let filtered = mockAssessmentData;

    if (selectedPatient !== 'all') {
      filtered = filtered.filter(item => item.patientId === selectedPatient);
    }

    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.timestamp);
        return itemDate.isAfter(dateRange[0]) && itemDate.isBefore(dateRange[1]);
      });
    }

    return filtered;
  }, [mockAssessmentData, selectedPatient, dateRange]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = filteredData.length;
    const avgSunnyBrook = total > 0 ? (filteredData.reduce((sum, item) => sum + item.sunnyBrookScore, 0) / total).toFixed(1) : 0;
    const avgStatic = total > 0 ? (filteredData.reduce((sum, item) => sum + item.staticScore, 0) / total).toFixed(1) : 0;
    const avgVoluntary = total > 0 ? (filteredData.reduce((sum, item) => sum + item.voluntaryScore, 0) / total).toFixed(1) : 0;
    const avgSynkinesis = total > 0 ? (filteredData.reduce((sum, item) => sum + item.synkinesisScore, 0) / total).toFixed(1) : 0;
    const abnormalCount = filteredData.filter(item => item.synkinesisScore > 2).length;
    
    return {
      total,
      avgSunnyBrook: parseFloat(avgSunnyBrook),
      avgStatic: parseFloat(avgStatic),
      avgVoluntary: parseFloat(avgVoluntary),
      avgSynkinesis: parseFloat(avgSynkinesis),
      abnormalCount,
      abnormalRate: total > 0 ? ((abnormalCount / total) * 100).toFixed(1) : 0
    };
  }, [filteredData]);

  const columns = [
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 100,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Sunny Brook总分',
      dataIndex: 'sunnyBrookScore',
      key: 'sunnyBrookScore',
      width: 120,
      render: (score) => (
        <Space>
          <Badge
            count={score}
            showZero={true}
            style={{
              backgroundColor: score >= 56 ? '#52c41a' : score >= 42 ? '#faad14' : '#f5222d',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          />
          <Progress
            percent={(score / 100) * 100}
            size="small"
            strokeColor={score >= 56 ? '#52c41a' : score >= 42 ? '#faad14' : '#f5222d'}
            showInfo={false}
          />
        </Space>
      ),
      sorter: (a, b) => a.sunnyBrookScore - b.sunnyBrookScore
    },
    {
      title: 'H-B评级',
      dataIndex: 'hbGrade',
      key: 'hbGrade',
      width: 120,
      render: (hbGrade) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={hbGrade.grade <= 'II' ? 'success' : hbGrade.grade <= 'IV' ? 'warning' : 'error'}
            text={<Text strong>Grade {hbGrade.grade}</Text>}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {hbGrade.description}
          </Text>
        </Space>
      )
    },
    {
      title: '静态分',
      dataIndex: 'staticScore',
      key: 'staticScore',
      width: 80,
      render: (score) => (
        <Badge
          count={score}
          showZero={true}
          style={{ backgroundColor: score === 0 ? '#52c41a' : score <= 10 ? '#faad14' : '#f5222d' }}
        />
      ),
      sorter: (a, b) => a.staticScore - b.staticScore
    },
    {
      title: '随意运动分',
      dataIndex: 'voluntaryScore',
      key: 'voluntaryScore',
      width: 100,
      render: (score) => (
        <Badge
          count={score}
          showZero={true}
          style={{ backgroundColor: score >= 60 ? '#52c41a' : score >= 40 ? '#faad14' : '#f5222d' }}
        />
      ),
      sorter: (a, b) => a.voluntaryScore - b.voluntaryScore
    },
    {
      title: '联动分',
      dataIndex: 'synkinesisScore',
      key: 'synkinesisScore',
      width: 80,
      render: (score) => {
        const getStatus = (score) => {
          if (score === 0) return { text: '无', color: 'success' };
          if (score <= 3) return { text: '轻度', color: 'warning' };
          if (score <= 8) return { text: '中度', color: 'error' };
          return { text: '重度', color: 'error' };
        };
        const status = getStatus(score);
        return (
          <Space>
            <Badge count={score} showZero={true} style={{ backgroundColor: score === 0 ? '#52c41a' : '#f5222d' }} />
            <Badge status={status.color} text={status.text} />
          </Space>
        );
      },
      sorter: (a, b) => a.synkinesisScore - b.synkinesisScore
    },
    {
      title: '检测时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => {
        const daysAgo = dayjs().diff(dayjs(timestamp), 'day');
        const hoursAgo = dayjs().diff(dayjs(timestamp), 'hour');
        const minutesAgo = dayjs().diff(dayjs(timestamp), 'minute');

        let timeAgo = '';
        if (daysAgo > 0) {
          timeAgo = `${daysAgo}天前`;
        } else if (hoursAgo > 0) {
          timeAgo = `${hoursAgo}小时前`;
        } else if (minutesAgo > 0) {
          timeAgo = `${minutesAgo}分钟前`;
        } else {
          timeAgo = '刚刚';
        }

        return (
          <div>
            <div>{dayjs(timestamp).format('MM-DD HH:mm')}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {timeAgo}
            </Text>
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              setSelectedRecord(record);
              setDetailModalVisible(true);
            }}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            size="small"
          >
            导出
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="assessment-details-container">
      <div className="page-header">
        <div className="header-content">
          <div>
            <Title level={2}>评分详情</Title>
            <Text type="secondary">查看和管理来自移动端的面瘫评估数据</Text>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总评估次数"
              value={statistics.total}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均Sunny Brook"
              value={statistics.avgSunnyBrook}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: statistics.avgSunnyBrook >= 56 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均静态分"
              value={statistics.avgStatic}
              suffix="/ 20"
              precision={1}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: statistics.avgStatic <= 5 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均随意运动分"
              value={statistics.avgVoluntary}
              suffix="/ 80"
              precision={1}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: statistics.avgVoluntary >= 60 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="平均联动分"
              value={statistics.avgSynkinesis}
              precision={1}
              prefix={<FrownOutlined />}
              valueStyle={{ color: statistics.avgSynkinesis <= 3 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
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
          

          <RangePicker
            placeholder={['开始日期', '结束日期']}
            value={dateRange}
            onChange={setDateRange}
          />
          
          <Button 
            icon={<FilterOutlined />}
            onClick={() => {
              setSelectedPatient('all');
              setDateRange(null);
            }}
          >
            重置筛选
          </Button>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          locale={{
            emptyText: <Empty description="暂无评估数据" />
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="面部评估详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {selectedRecord && (
          <div>
            {/* 基本信息 */}
            <Descriptions column={3} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="患者姓名">{selectedRecord.patientName}</Descriptions.Item>
              <Descriptions.Item label="检测时间">{selectedRecord.timestamp}</Descriptions.Item>
              <Descriptions.Item label="Sunny Brook总分">
                <Badge
                  count={selectedRecord.sunnyBrookScore}
                  style={{
                    backgroundColor: selectedRecord.sunnyBrookScore >= 56 ? '#52c41a' :
                                   selectedRecord.sunnyBrookScore >= 42 ? '#faad14' : '#f5222d',
                    fontSize: '14px'
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="H-B评级">
                <Badge
                  status={selectedRecord.hbGrade.grade <= 'II' ? 'success' :
                         selectedRecord.hbGrade.grade <= 'IV' ? 'warning' : 'error'}
                  text={`Grade ${selectedRecord.hbGrade.grade} - ${selectedRecord.hbGrade.description}`}
                />
              </Descriptions.Item>
              <Descriptions.Item label="静态分">
                <Badge count={selectedRecord.staticScore} showZero={true} style={{ backgroundColor: '#1890ff' }} />
                <Text type="secondary" style={{ marginLeft: 8 }}>/ 20</Text>
              </Descriptions.Item>
              <Descriptions.Item label="随意运动分">
                <Badge count={selectedRecord.voluntaryScore} showZero={true} style={{ backgroundColor: '#52c41a' }} />
                <Text type="secondary" style={{ marginLeft: 8 }}>/ 80</Text>
              </Descriptions.Item>
              <Descriptions.Item label="联动分">
                <Badge count={selectedRecord.synkinesisScore} showZero={true} style={{ backgroundColor: '#f5222d' }} />
              </Descriptions.Item>
            </Descriptions>

            {/* 六个动作详细评分 */}
            <Title level={5}>动作评分详情</Title>
            <Table
              dataSource={selectedRecord.actionScores}
              pagination={false}
              size="small"
              rowKey="action"
              columns={[
                {
                  title: '动作',
                  dataIndex: 'action',
                  key: 'action',
                  width: 80,
                  render: (action) => {
                    const colorMap = {
                      '静止': 'default',
                      '抬眉': 'blue',
                      '耸鼻': 'green',
                      '微笑': 'orange',
                      '撅嘴': 'purple',
                      '闭眼': 'red'
                    };
                    return <Tag color={colorMap[action]}>{action}</Tag>;
                  }
                },
                {
                  title: '功能评分',
                  key: 'function',
                  width: 200,
                  render: (_, record) => (
                    <Space direction="vertical" size={0}>
                      <Text>{record.function.label}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        原始分: {record.function.score} × 权重: {record.function.weight} = {record.function.weightedScore}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        类型: {record.function.type === 'static' ? '静态' : '随意运动'}
                      </Text>
                    </Space>
                  )
                },
                {
                  title: '联动评分',
                  key: 'synkinesis',
                  width: 120,
                  render: (_, record) => (
                    <Space>
                      <Badge
                        count={record.synkinesis.score}
                        showZero={true}
                        style={{ backgroundColor: record.synkinesis.score === 0 ? '#52c41a' : '#f5222d' }}
                      />
                      <Text>{record.synkinesis.label}</Text>
                    </Space>
                  )
                }
              ]}
            />

            {/* 计算公式说明 */}
            <Card size="small" style={{ marginTop: 16, backgroundColor: '#f9f9f9' }}>
              <Title level={5}>Sunny Brook评分计算</Title>
              <Space direction="vertical">
                <Text>
                  <strong>静态分（扣分项）</strong>：(眼部 + 鼻唇沟 + 嘴部) × 5 = {selectedRecord.staticScore}
                </Text>
                <Text>
                  <strong>随意运动分</strong>：(抬眉 + 耸鼻 + 微笑 + 撅嘴 + 闭眼) × 4 = {selectedRecord.voluntaryScore}
                </Text>
                <Text>
                  <strong>联动分（扣分项）</strong>：联动异常总分 = {selectedRecord.synkinesisScore}
                </Text>
                <Text strong style={{ color: '#1890ff' }}>
                  Sunny Brook总分 = 随意运动分 - 静态分 - 联动分 = {selectedRecord.voluntaryScore} - {selectedRecord.staticScore} - {selectedRecord.synkinesisScore} = {selectedRecord.sunnyBrookScore}
                </Text>
              </Space>
            </Card>

            {selectedRecord.notes && (
              <div style={{ marginTop: 16 }}>
                <Title level={5}>备注</Title>
                <Text>{selectedRecord.notes}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AssessmentDetails;
