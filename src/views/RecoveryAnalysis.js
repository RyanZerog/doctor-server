import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Statistic,
  Progress,
  Alert,
  Divider,
  Select,
  DatePicker,
  Table,
  Tag,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined,
  DownloadOutlined,
  PrinterOutlined,
  LineChartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { Line, Radar, Column } from '@ant-design/charts';
import dayjs from 'dayjs';
import usePatientStore from '../store/usePatientStore';
import useDetectionStore, { ActionTypeNames, FaceActionTypes } from '../store/useDetectionStore';
import './RecoveryAnalysis.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const RecoveryAnalysis = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { patients } = usePatientStore();
  const { getRecordsForPatient } = useDetectionStore();
  
  const [timeRange, setTimeRange] = useState('all'); // all, 1month, 3months, 6months
  const [selectedActions, setSelectedActions] = useState(Object.values(FaceActionTypes));
  const [dateRange, setDateRange] = useState(null);

  const patient = patients.find(p => p.id === patientId);
  const allRecords = getRecordsForPatient(patientId || '');

  // 根据时间范围筛选记录
  const filteredRecords = useMemo(() => {
    let records = [...allRecords];
    
    // 按时间范围筛选
    if (timeRange !== 'all') {
      const months = parseInt(timeRange.replace('months', '').replace('month', ''));
      const cutoffDate = dayjs().subtract(months, 'month');
      records = records.filter(record => dayjs(record.timestamp).isAfter(cutoffDate));
    }
    
    // 按日期范围筛选
    if (dateRange && dateRange.length === 2) {
      records = records.filter(record => 
        dayjs(record.timestamp).isAfter(dateRange[0]) && 
        dayjs(record.timestamp).isBefore(dateRange[1])
      );
    }
    
    // 按动作类型筛选
    records = records.filter(record => selectedActions.includes(record.actionType));
    
    return records.sort((a, b) => a.timestamp - b.timestamp);
  }, [allRecords, timeRange, dateRange, selectedActions]);

  // 计算康复统计数据
  const recoveryStats = useMemo(() => {
    if (filteredRecords.length === 0) return null;

    const firstRecord = filteredRecords[0];
    const lastRecord = filteredRecords[filteredRecords.length - 1];
    const averageScore = filteredRecords.reduce((sum, record) => sum + record.score, 0) / filteredRecords.length;
    const improvement = lastRecord.score - firstRecord.score;
    const improvementRate = firstRecord.score > 0 ? (improvement / firstRecord.score) * 100 : 0;

    // 按动作类型分组统计
    const actionStats = {};
    Object.values(FaceActionTypes).forEach(actionType => {
      const actionRecords = filteredRecords.filter(r => r.actionType === actionType);
      if (actionRecords.length > 0) {
        const firstScore = actionRecords[0].score;
        const lastScore = actionRecords[actionRecords.length - 1].score;
        const avgScore = actionRecords.reduce((sum, r) => sum + r.score, 0) / actionRecords.length;
        
        actionStats[actionType] = {
          name: ActionTypeNames[actionType],
          count: actionRecords.length,
          firstScore,
          lastScore,
          averageScore: avgScore,
          improvement: lastScore - firstScore,
          improvementRate: firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0
        };
      }
    });

    return {
      totalRecords: filteredRecords.length,
      averageScore,
      firstScore: firstRecord.score,
      lastScore: lastRecord.score,
      improvement,
      improvementRate,
      actionStats,
      timeSpan: dayjs(lastRecord.timestamp).diff(dayjs(firstRecord.timestamp), 'day')
    };
  }, [filteredRecords]);

  // 准备趋势图数据
  const trendData = useMemo(() => {
    return filteredRecords.map(record => ({
      date: dayjs(record.timestamp).format('MM-DD'),
      score: record.score,
      action: ActionTypeNames[record.actionType],
      actionType: record.actionType
    }));
  }, [filteredRecords]);

  // 准备雷达图数据
  const radarData = useMemo(() => {
    if (!recoveryStats) return [];
    
    return Object.entries(recoveryStats.actionStats).map(([actionType, stats]) => ({
      action: stats.name,
      score: stats.lastScore,
      fullMark: 20
    }));
  }, [recoveryStats]);

  // 准备柱状图数据
  const columnData = useMemo(() => {
    if (!recoveryStats) return [];
    
    return Object.entries(recoveryStats.actionStats).map(([actionType, stats]) => ({
      action: stats.name,
      首次评分: stats.firstScore,
      最新评分: stats.lastScore,
      平均评分: stats.averageScore
    }));
  }, [recoveryStats]);

  // 获取康复阶段
  const getRecoveryStage = (score, improvement) => {
    if (score >= 18) return { stage: '康复期', color: '#52c41a', icon: <RiseOutlined /> };
    if (score >= 15) return { stage: '恢复期', color: '#1890ff', icon: <RiseOutlined /> };
    if (score >= 10) return { stage: '稳定期', color: '#faad14', icon: <MinusOutlined /> };
    return { stage: '治疗期', color: '#f5222d', icon: <FallOutlined /> };
  };

  const currentStage = recoveryStats ? getRecoveryStage(recoveryStats.lastScore, recoveryStats.improvement) : null;

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

  // 趋势图配置
  const trendConfig = {
    data: trendData,
    xField: 'date',
    yField: 'score',
    seriesField: 'action',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 4,
      shape: 'circle',
    },
    legend: {
      position: 'top',
    },
    yAxis: {
      min: 0,
      max: 20,
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.action,
          value: `${datum.score.toFixed(1)}分`
        };
      }
    }
  };

  // 雷达图配置
  const radarConfig = {
    data: radarData,
    xField: 'action',
    yField: 'score',
    area: {
      visible: true,
    },
    point: {
      visible: true,
      size: 4,
    },
    legend: {
      visible: false,
    },
    yAxis: {
      min: 0,
      max: 20,
      tickCount: 5,
    }
  };

  // 柱状图配置
  const columnConfig = {
    data: columnData,
    isGroup: true,
    xField: 'action',
    yField: ['首次评分', '最新评分', '平均评分'],
    seriesField: 'type',
    color: ['#ff7875', '#52c41a', '#1890ff'],
    legend: {
      position: 'top',
    },
    yAxis: {
      min: 0,
      max: 20,
    }
  };

  return (
    <div className="recovery-analysis">
      {/* 头部 */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/patients/${patientId}`)}
              >
                返回患者详情
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {patient.name} - 康复分析报告
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />} type="primary">
                导出报告
              </Button>
              <Button icon={<PrinterOutlined />}>
                打印报告
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 筛选条件 */}
      <Card title="分析条件" className="filter-card">
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>时间范围</Text>
              <Select
                style={{ width: '100%' }}
                value={timeRange}
                onChange={setTimeRange}
              >
                <Option value="all">全部时间</Option>
                <Option value="1month">近1个月</Option>
                <Option value="3months">近3个月</Option>
                <Option value="6months">近6个月</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>自定义日期</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={['开始日期', '结束日期']}
              />
            </Space>
          </Col>
          <Col xs={24} sm={10}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>动作类型</Text>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                value={selectedActions}
                onChange={setSelectedActions}
                placeholder="选择要分析的动作类型"
              >
                {Object.entries(ActionTypeNames).map(([type, name]) => (
                  <Option key={type} value={type}>{name}</Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {filteredRecords.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Title level={4}>暂无检测数据</Title>
            <Text type="secondary">请调整筛选条件或添加检测记录</Text>
          </div>
        </Card>
      ) : (
        <>
          {/* 康复概况 */}
          <Card title="康复概况" className="overview-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={6}>
                <Statistic
                  title="检测次数"
                  value={recoveryStats.totalRecords}
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="平均评分"
                  value={recoveryStats.averageScore}
                  precision={1}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="评分提升"
                  value={recoveryStats.improvement}
                  precision={1}
                  prefix={recoveryStats.improvement >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  valueStyle={{ 
                    color: recoveryStats.improvement >= 0 ? '#52c41a' : '#f5222d' 
                  }}
                  suffix="分"
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="改善率"
                  value={Math.abs(recoveryStats.improvementRate)}
                  precision={1}
                  prefix={recoveryStats.improvementRate >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  valueStyle={{ 
                    color: recoveryStats.improvementRate >= 0 ? '#52c41a' : '#f5222d' 
                  }}
                  suffix="%"
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <div className="stage-info">
                  <Title level={5}>当前康复阶段</Title>
                  <Space>
                    {currentStage.icon}
                    <Tag color={currentStage.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {currentStage.stage}
                    </Tag>
                    <Text>最新评分: {recoveryStats.lastScore.toFixed(1)}分</Text>
                  </Space>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="progress-info">
                  <Title level={5}>康复进度</Title>
                  <Progress
                    percent={Math.min((recoveryStats.lastScore / 20) * 100, 100)}
                    strokeColor={{
                      '0%': '#ff7875',
                      '50%': '#faad14',
                      '100%': '#52c41a',
                    }}
                    format={(percent) => `${recoveryStats.lastScore.toFixed(1)}/20`}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* 趋势分析图表 */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="评分趋势分析" className="chart-card">
                <Line {...trendConfig} />
                <div className="chart-description">
                  <Text type="secondary">
                    显示各动作类型在时间轴上的评分变化趋势，帮助了解康复进展情况
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="动作能力雷达图" className="chart-card">
                <Radar {...radarConfig} />
                <div className="chart-description">
                  <Text type="secondary">
                    展示当前各项面部动作的能力水平，便于识别需要重点训练的动作
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card title="动作对比分析" className="chart-card">
                <Column {...columnConfig} />
                <div className="chart-description">
                  <Text type="secondary">
                    对比各动作的首次评分、最新评分和平均评分，直观显示康复效果
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 详细分析表格 */}
          <Card title="详细分析数据" className="analysis-table-card">
            <Table
              dataSource={Object.entries(recoveryStats.actionStats).map(([actionType, stats]) => ({
                key: actionType,
                action: stats.name,
                count: stats.count,
                firstScore: stats.firstScore,
                lastScore: stats.lastScore,
                averageScore: stats.averageScore,
                improvement: stats.improvement,
                improvementRate: stats.improvementRate
              }))}
              columns={[
                {
                  title: '动作类型',
                  dataIndex: 'action',
                  key: 'action',
                  render: (text, record) => (
                    <Tag color="blue">{text}</Tag>
                  )
                },
                {
                  title: '检测次数',
                  dataIndex: 'count',
                  key: 'count',
                  align: 'center'
                },
                {
                  title: '首次评分',
                  dataIndex: 'firstScore',
                  key: 'firstScore',
                  align: 'center',
                  render: (score) => score.toFixed(1)
                },
                {
                  title: '最新评分',
                  dataIndex: 'lastScore',
                  key: 'lastScore',
                  align: 'center',
                  render: (score) => (
                    <Text strong style={{ color: '#52c41a' }}>
                      {score.toFixed(1)}
                    </Text>
                  )
                },
                {
                  title: '平均评分',
                  dataIndex: 'averageScore',
                  key: 'averageScore',
                  align: 'center',
                  render: (score) => score.toFixed(1)
                },
                {
                  title: '评分变化',
                  dataIndex: 'improvement',
                  key: 'improvement',
                  align: 'center',
                  render: (improvement) => (
                    <Space>
                      {improvement >= 0 ? <RiseOutlined style={{ color: '#52c41a' }} /> : <FallOutlined style={{ color: '#f5222d' }} />}
                      <Text style={{ color: improvement >= 0 ? '#52c41a' : '#f5222d' }}>
                        {improvement >= 0 ? '+' : ''}{improvement.toFixed(1)}
                      </Text>
                    </Space>
                  )
                },
                {
                  title: '改善率',
                  dataIndex: 'improvementRate',
                  key: 'improvementRate',
                  align: 'center',
                  render: (rate) => (
                    <Text style={{ color: rate >= 0 ? '#52c41a' : '#f5222d' }}>
                      {rate >= 0 ? '+' : ''}{rate.toFixed(1)}%
                    </Text>
                  )
                }
              ]}
              pagination={false}
              size="small"
            />
          </Card>

          {/* 康复建议 */}
          <Card title="康复建议" className="suggestions-card">
            <Alert
              message="个性化康复建议"
              description={
                <div>
                  <Paragraph>
                    根据 {recoveryStats.timeSpan} 天的康复数据分析，患者在面部功能恢复方面
                    {recoveryStats.improvement >= 0 ? '取得了积极进展' : '需要加强训练'}。
                  </Paragraph>

                  {recoveryStats.improvement >= 2 && (
                    <Paragraph>
                      <Text type="success">
                        ✓ 康复效果显著，评分提升了 {recoveryStats.improvement.toFixed(1)} 分，
                        建议继续保持当前的治疗方案和训练强度。
                      </Text>
                    </Paragraph>
                  )}

                  {recoveryStats.improvement < 0 && (
                    <Paragraph>
                      <Text type="warning">
                        ⚠ 评分出现下降趋势，建议调整治疗方案，增加训练频次，
                        并考虑结合物理治疗或其他辅助治疗方法。
                      </Text>
                    </Paragraph>
                  )}

                  {recoveryStats.improvement >= 0 && recoveryStats.improvement < 2 && (
                    <Paragraph>
                      <Text type="info">
                        ℹ 康复进展平稳，建议继续现有治疗方案，
                        可适当增加针对性训练来提升康复效果。
                      </Text>
                    </Paragraph>
                  )}

                  <Paragraph>
                    <Text strong>重点关注动作：</Text>
                    {Object.entries(recoveryStats.actionStats)
                      .filter(([_, stats]) => stats.lastScore < 12)
                      .map(([_, stats]) => stats.name)
                      .join('、') || '各项动作表现良好'}
                  </Paragraph>
                </div>
              }
              type={recoveryStats.improvement >= 2 ? 'success' : recoveryStats.improvement < 0 ? 'warning' : 'info'}
              showIcon
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default RecoveryAnalysis;
