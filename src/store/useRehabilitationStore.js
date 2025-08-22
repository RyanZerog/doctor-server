import { create } from 'zustand';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

// 康复计划状态
export const PlanStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

// 训练频次选项
export const FrequencyOptions = {
  DAILY: '每日1次',
  TWICE_DAILY: '每日2次',
  THREE_TIMES_DAILY: '每日3次',
  EVERY_OTHER_DAY: '隔日1次',
  THREE_TIMES_WEEK: '每周3次',
  CUSTOM: '自定义'
};

// 训练项目类型
export const TrainingTypes = {
  FACIAL_MASSAGE: '面部按摩',
  MUSCLE_TRAINING: '肌肉训练',
  EXPRESSION_PRACTICE: '表情练习',
  BREATHING_EXERCISE: '呼吸训练',
  PHYSICAL_THERAPY: '物理治疗',
  MEDICATION: '药物治疗',
  OTHER: '其他'
};

// 默认康复计划数据
const defaultPlans = [
  {
    id: 'plan_1',
    patientId: '1',
    name: '急性期康复计划',
    description: '针对急性期面瘫患者的基础康复训练',
    startDate: '2023-12-01',
    endDate: '2024-01-01',
    frequency: FrequencyOptions.TWICE_DAILY,
    status: PlanStatus.ACTIVE,
    createdAt: 1701388800000,
    updatedAt: 1701388800000,
    items: [
      {
        id: 'item_1',
        name: '面部按摩',
        type: TrainingTypes.FACIAL_MASSAGE,
        description: '轻柔按摩面部肌肉，促进血液循环',
        duration: 15,
        frequency: '每日2次',
        completed: true,
        createdAt: 1701388800000,
        updatedAt: 1701388800000
      },
      {
        id: 'item_2',
        name: '抬眉训练',
        type: TrainingTypes.MUSCLE_TRAINING,
        description: '练习抬眉动作，增强额肌力量',
        duration: 10,
        frequency: '每日2次',
        completed: true,
        createdAt: 1701388800000,
        updatedAt: 1701388800000
      },
      {
        id: 'item_3',
        name: '微笑练习',
        type: TrainingTypes.EXPRESSION_PRACTICE,
        description: '练习微笑表情，改善口角功能',
        duration: 10,
        frequency: '每日2次',
        completed: false,
        createdAt: 1701388800000,
        updatedAt: 1701388800000
      }
    ]
  },
  {
    id: 'plan_2',
    patientId: '2',
    name: '恢复期强化训练',
    description: '针对恢复期患者的强化康复训练',
    startDate: '2023-11-15',
    endDate: '2023-12-15',
    frequency: FrequencyOptions.THREE_TIMES_DAILY,
    status: PlanStatus.COMPLETED,
    createdAt: 1700006400000,
    updatedAt: 1700006400000,
    items: [
      {
        id: 'item_4',
        name: '综合表情训练',
        type: TrainingTypes.EXPRESSION_PRACTICE,
        description: '综合练习各种面部表情',
        duration: 20,
        frequency: '每日3次',
        completed: true,
        createdAt: 1700006400000,
        updatedAt: 1700006400000
      },
      {
        id: 'item_5',
        name: '电刺激治疗',
        type: TrainingTypes.PHYSICAL_THERAPY,
        description: '低频电刺激促进神经恢复',
        duration: 30,
        frequency: '每日1次',
        completed: true,
        createdAt: 1700006400000,
        updatedAt: 1700006400000
      }
    ]
  }
];

// 康复计划存储
const useRehabilitationStore = create((set, get) => ({
  // 康复计划列表
  plans: loadFromStorage(STORAGE_KEYS.REHABILITATION_PLANS, defaultPlans),
  
  // 获取所有计划
  getAllPlans: () => {
    return get().plans;
  },
  
  // 获取特定患者的计划
  getPlansByPatient: (patientId) => {
    return get().plans.filter(plan => plan.patientId === patientId);
  },
  
  // 获取单个计划
  getPlanById: (planId) => {
    return get().plans.find(plan => plan.id === planId);
  },
  
  // 添加康复计划
  addPlan: (plan) => set((state) => {
    const newPlan = {
      ...plan,
      id: plan.id || `plan_${Date.now()}`,
      items: plan.items || [],
      createdAt: plan.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    const newPlans = [...state.plans, newPlan];
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 更新康复计划
  updatePlan: (planId, updatedPlan) => set((state) => {
    const newPlans = state.plans.map(plan =>
      plan.id === planId 
        ? { ...plan, ...updatedPlan, updatedAt: Date.now() }
        : plan
    );
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 删除康复计划
  deletePlan: (planId) => set((state) => {
    const newPlans = state.plans.filter(plan => plan.id !== planId);
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 添加计划项目
  addPlanItem: (planId, item) => set((state) => {
    const newItem = {
      ...item,
      id: item.id || `item_${Date.now()}`,
      completed: item.completed || false,
      createdAt: item.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    const newPlans = state.plans.map(plan =>
      plan.id === planId
        ? { 
            ...plan, 
            items: [...(plan.items || []), newItem],
            updatedAt: Date.now()
          }
        : plan
    );
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 更新计划项目
  updatePlanItem: (planId, itemId, updatedItem) => set((state) => {
    const newPlans = state.plans.map(plan =>
      plan.id === planId
        ? {
            ...plan,
            items: (plan.items || []).map(item =>
              item.id === itemId
                ? { ...item, ...updatedItem, updatedAt: Date.now() }
                : item
            ),
            updatedAt: Date.now()
          }
        : plan
    );
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 删除计划项目
  deletePlanItem: (planId, itemId) => set((state) => {
    const newPlans = state.plans.map(plan =>
      plan.id === planId
        ? {
            ...plan,
            items: (plan.items || []).filter(item => item.id !== itemId),
            updatedAt: Date.now()
          }
        : plan
    );
    saveToStorage(STORAGE_KEYS.REHABILITATION_PLANS, newPlans);
    return { plans: newPlans };
  }),
  
  // 获取计划统计
  getPlanStats: (patientId) => {
    const patientPlans = get().getPlansByPatient(patientId);
    const totalPlans = patientPlans.length;
    const activePlans = patientPlans.filter(plan => plan.status === PlanStatus.ACTIVE).length;
    const completedPlans = patientPlans.filter(plan => plan.status === PlanStatus.COMPLETED).length;
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
  },
  
  // 获取今日待完成项目
  getTodayTasks: (patientId) => {
    const patientPlans = get().getPlansByPatient(patientId);
    const activePlans = patientPlans.filter(plan => plan.status === PlanStatus.ACTIVE);
    
    const todayTasks = [];
    activePlans.forEach(plan => {
      (plan.items || []).forEach(item => {
        if (!item.completed) {
          todayTasks.push({
            ...item,
            planId: plan.id,
            planName: plan.name
          });
        }
      });
    });
    
    return todayTasks;
  },
  
  // 获取康复进度趋势
  getProgressTrend: (patientId, days = 30) => {
    const patientPlans = get().getPlansByPatient(patientId);
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const trend = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      let completedTasks = 0;
      let totalTasks = 0;
      
      patientPlans.forEach(plan => {
        (plan.items || []).forEach(item => {
          const itemDate = new Date(item.updatedAt).toISOString().split('T')[0];
          if (itemDate === dateStr) {
            totalTasks++;
            if (item.completed) {
              completedTasks++;
            }
          }
        });
      });
      
      if (totalTasks > 0) {
        trend.push({
          date: dateStr,
          completionRate: (completedTasks / totalTasks) * 100,
          completedTasks,
          totalTasks
        });
      }
    }
    
    return trend;
  }
}));

export default useRehabilitationStore;
