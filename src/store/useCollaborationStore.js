import { create } from 'zustand';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';
import dayjs from 'dayjs';

// 扩展存储键
const COLLABORATION_KEYS = {
  ...STORAGE_KEYS,
  ASSESSMENTS: 'collaboration_assessments',
  REHABILITATION_PLANS: 'collaboration_rehabilitation_plans'
};

// 面部动作类型
export const FACE_ACTIONS = [
  { key: 'still', name: '静止', color: 'default' },
  { key: 'raise_eyebrows', name: '抬眉', color: 'blue' },
  { key: 'wrinkle_nose', name: '耸鼻', color: 'green' },
  { key: 'smile', name: '微笑', color: 'orange' },
  { key: 'pucker_lips', name: '撅嘴', color: 'purple' },
  { key: 'close_eyes', name: '闭眼', color: 'red' }
];

// 康复训练动作库
export const REHABILITATION_EXERCISES = [
  {
    id: 'exercise_1',
    name: '抬眉训练',
    description: '锻炼额肌，改善抬眉功能',
    difficulty: '简单',
    duration: '5分钟',
    instructions: [
      '坐直，放松面部肌肉',
      '缓慢抬起双眉，保持3秒',
      '缓慢放下，休息2秒',
      '重复10-15次'
    ],
    targetMuscles: ['额肌'],
    frequency: '每日3次'
  },
  {
    id: 'exercise_2',
    name: '微笑练习',
    description: '训练口角上提，恢复微笑功能',
    difficulty: '中等',
    duration: '3分钟',
    instructions: [
      '对着镜子，放松面部',
      '缓慢上提口角，形成微笑',
      '保持微笑5秒钟',
      '缓慢恢复自然状态',
      '重复8-12次'
    ],
    targetMuscles: ['颧大肌', '颧小肌'],
    frequency: '每日5次'
  },
  {
    id: 'exercise_3',
    name: '闭眼训练',
    description: '加强眼轮匝肌力量',
    difficulty: '简单',
    duration: '4分钟',
    instructions: [
      '自然坐立，眼睛平视前方',
      '轻轻闭合双眼',
      '用力闭眼，保持5秒',
      '缓慢睁开眼睛',
      '重复12-15次'
    ],
    targetMuscles: ['眼轮匝肌'],
    frequency: '每日4次'
  },
  {
    id: 'exercise_4',
    name: '撅嘴练习',
    description: '训练口轮匝肌，改善口唇功能',
    difficulty: '中等',
    duration: '3分钟',
    instructions: [
      '面对镜子，放松唇部',
      '将嘴唇向前撅起',
      '保持撅嘴状态3秒',
      '缓慢恢复自然状态',
      '重复10-12次'
    ],
    targetMuscles: ['口轮匝肌'],
    frequency: '每日3次'
  },
  {
    id: 'exercise_5',
    name: '鼓腮训练',
    description: '锻炼颊肌，改善面部对称性',
    difficulty: '困难',
    duration: '6分钟',
    instructions: [
      '闭合嘴唇，深吸一口气',
      '将空气充满双颊',
      '保持鼓腮状态8秒',
      '缓慢呼出空气',
      '重复6-8次'
    ],
    targetMuscles: ['颊肌'],
    frequency: '每日2次'
  },
  {
    id: 'exercise_6',
    name: '皱眉练习',
    description: '训练皱眉肌，恢复眉间表情',
    difficulty: '简单',
    duration: '2分钟',
    instructions: [
      '放松面部，眼睛平视',
      '缓慢皱起眉头',
      '保持皱眉状态3秒',
      '缓慢放松眉头',
      '重复8-10次'
    ],
    targetMuscles: ['皱眉肌', '降眉肌'],
    frequency: '每日3次'
  }
];

// 默认评估数据（模拟移动端数据）
const generateMockAssessments = (patients) => {
  const assessments = [];
  const actions = FACE_ACTIONS.map(action => action.name);
  
  patients.slice(0, 10).forEach((patient, patientIndex) => {
    actions.forEach((action, actionIndex) => {
      const recordCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < recordCount; i++) {
        assessments.push({
          id: `assessment_${patientIndex}_${actionIndex}_${i}`,
          patientId: patient.id,
          patientName: patient.name,
          action: action,
          score: Math.floor(Math.random() * 10) + 1,
          symmetryScore: Math.floor(Math.random() * 100) + 1,
          synkinesisScore: Math.floor(Math.random() * 4),
          timestamp: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
          imageUrl: '/api/placeholder/300/200',
          landmarkData: Array.from({length: 468}, (_, i) => ({
            x: Math.random(),
            y: Math.random(),
            z: Math.random()
          })),
          notes: i % 3 === 0 ? '检测到轻微异常联动' : '',
          deviceInfo: {
            platform: 'Android',
            version: '1.0.0',
            deviceModel: 'Pixel 6'
          }
        });
      }
    });
  });
  
  return assessments.sort((a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix());
};

// 默认康复方案数据
const generateMockRehabilitationPlans = (patients) => {
  return patients.slice(0, 8).map((patient, index) => ({
    id: `plan_${patient.id}`,
    patientId: patient.id,
    patientName: patient.name,
    planName: `${patient.name}的康复治疗方案`,
    status: ['active', 'completed', 'paused'][index % 3],
    startDate: dayjs().subtract(Math.floor(Math.random() * 60), 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(Math.floor(Math.random() * 90) + 30, 'day').format('YYYY-MM-DD'),
    progress: Math.floor(Math.random() * 100),
    totalSessions: 30,
    completedSessions: Math.floor(Math.random() * 30),
    exercises: REHABILITATION_EXERCISES.slice(0, 4).map(exercise => ({
      exerciseId: exercise.id,
      name: exercise.name,
      frequency: exercise.frequency,
      duration: exercise.duration,
      completed: Math.floor(Math.random() * 10),
      target: 15
    })),
    notes: index % 2 === 0 ? '患者配合度良好，进展顺利' : '',
    createdBy: '张医生',
    createdAt: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD HH:mm:ss'),
    lastUpdated: dayjs().subtract(Math.floor(Math.random() * 7), 'day').format('YYYY-MM-DD HH:mm:ss')
  }));
};

// 医患协同数据存储
const useCollaborationStore = create((set, get) => ({
  // 评估数据
  assessments: [],
  
  // 康复方案数据
  rehabilitationPlans: [],
  
  // 训练动作库
  exercises: REHABILITATION_EXERCISES,
  
  // 初始化数据
  initializeData: (patients) => {
    const existingAssessments = loadFromStorage(COLLABORATION_KEYS.ASSESSMENTS, []);
    const existingPlans = loadFromStorage(COLLABORATION_KEYS.REHABILITATION_PLANS, []);
    
    // 如果没有现有数据，生成模拟数据
    const assessments = existingAssessments.length > 0 ? 
      existingAssessments : generateMockAssessments(patients);
    const rehabilitationPlans = existingPlans.length > 0 ? 
      existingPlans : generateMockRehabilitationPlans(patients);
    
    set({ assessments, rehabilitationPlans });
    
    // 保存到本地存储
    saveToStorage(COLLABORATION_KEYS.ASSESSMENTS, assessments);
    saveToStorage(COLLABORATION_KEYS.REHABILITATION_PLANS, rehabilitationPlans);
  },
  
  // 添加评估记录
  addAssessment: (assessment) => set((state) => {
    const newAssessments = [assessment, ...state.assessments];
    saveToStorage(COLLABORATION_KEYS.ASSESSMENTS, newAssessments);
    return { assessments: newAssessments };
  }),
  
  // 更新评估记录
  updateAssessment: (id, updatedAssessment) => set((state) => {
    const newAssessments = state.assessments.map(assessment =>
      assessment.id === id ? { ...assessment, ...updatedAssessment } : assessment
    );
    saveToStorage(COLLABORATION_KEYS.ASSESSMENTS, newAssessments);
    return { assessments: newAssessments };
  }),
  
  // 删除评估记录
  deleteAssessment: (id) => set((state) => {
    const newAssessments = state.assessments.filter(assessment => assessment.id !== id);
    saveToStorage(COLLABORATION_KEYS.ASSESSMENTS, newAssessments);
    return { assessments: newAssessments };
  }),
  
  // 添加康复方案
  addRehabilitationPlan: (plan) => set((state) => {
    const newPlans = [...state.rehabilitationPlans, { ...plan, id: Date.now().toString() }];
    saveToStorage(COLLABORATION_KEYS.REHABILITATION_PLANS, newPlans);
    return { rehabilitationPlans: newPlans };
  }),
  
  // 更新康复方案
  updateRehabilitationPlan: (id, updatedPlan) => set((state) => {
    const newPlans = state.rehabilitationPlans.map(plan =>
      plan.id === id ? { ...plan, ...updatedPlan, lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss') } : plan
    );
    saveToStorage(COLLABORATION_KEYS.REHABILITATION_PLANS, newPlans);
    return { rehabilitationPlans: newPlans };
  }),
  
  // 删除康复方案
  deleteRehabilitationPlan: (id) => set((state) => {
    const newPlans = state.rehabilitationPlans.filter(plan => plan.id !== id);
    saveToStorage(COLLABORATION_KEYS.REHABILITATION_PLANS, newPlans);
    return { rehabilitationPlans: newPlans };
  }),
  
  // 获取患者的评估统计
  getPatientAssessmentStats: (patientId) => {
    const { assessments } = get();
    const patientAssessments = assessments.filter(a => a.patientId === patientId);
    
    if (patientAssessments.length === 0) {
      return {
        totalAssessments: 0,
        averageScore: 0,
        averageSymmetry: 0,
        recentTrend: 'stable'
      };
    }
    
    const totalAssessments = patientAssessments.length;
    const averageScore = patientAssessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments;
    const averageSymmetry = patientAssessments.reduce((sum, a) => sum + a.symmetryScore, 0) / totalAssessments;
    
    // 计算最近趋势（比较最近5次和之前5次的平均分）
    const recent = patientAssessments.slice(0, 5);
    const previous = patientAssessments.slice(5, 10);
    
    let recentTrend = 'stable';
    if (recent.length >= 3 && previous.length >= 3) {
      const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
      const previousAvg = previous.reduce((sum, a) => sum + a.score, 0) / previous.length;
      
      if (recentAvg > previousAvg + 0.5) recentTrend = 'improving';
      else if (recentAvg < previousAvg - 0.5) recentTrend = 'declining';
    }
    
    return {
      totalAssessments,
      averageScore: Math.round(averageScore * 10) / 10,
      averageSymmetry: Math.round(averageSymmetry * 10) / 10,
      recentTrend
    };
  },
  
  // 获取康复方案统计
  getRehabilitationStats: () => {
    const { rehabilitationPlans } = get();
    
    const total = rehabilitationPlans.length;
    const active = rehabilitationPlans.filter(p => p.status === 'active').length;
    const completed = rehabilitationPlans.filter(p => p.status === 'completed').length;
    const paused = rehabilitationPlans.filter(p => p.status === 'paused').length;
    
    const averageProgress = total > 0 ? 
      rehabilitationPlans.reduce((sum, p) => sum + p.progress, 0) / total : 0;
    
    return {
      total,
      active,
      completed,
      paused,
      averageProgress: Math.round(averageProgress * 10) / 10
    };
  }
}));

export default useCollaborationStore;
