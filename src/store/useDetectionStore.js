import { create } from 'zustand';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

// 面部动作类型
export const FaceActionTypes = {
  STILL: 'STILL',
  RAISE_EYEBROWS: 'RAISE_EYEBROWS',
  WRINKLE_NOSE: 'WRINKLE_NOSE',
  SMILE: 'SMILE',
  PUCKER_LIPS: 'PUCKER_LIPS',
  CLOSE_EYES: 'CLOSE_EYES'
};

// 动作类型显示名称
export const ActionTypeNames = {
  [FaceActionTypes.STILL]: '静止',
  [FaceActionTypes.RAISE_EYEBROWS]: '抬眉',
  [FaceActionTypes.WRINKLE_NOSE]: '耸鼻',
  [FaceActionTypes.SMILE]: '微笑',
  [FaceActionTypes.PUCKER_LIPS]: '撅嘴',
  [FaceActionTypes.CLOSE_EYES]: '闭眼'
};

// 默认检测记录数据
const defaultDetectionRecords = [
  {
    id: 'record_1',
    patientId: '1',
    actionType: FaceActionTypes.STILL,
    imageUri: 'https://via.placeholder.com/200x200/f0f0f0/999999?text=特征点标注',
    originalImageUri: 'https://via.placeholder.com/200x200/e6f7ff/1890ff?text=原始图像',
    edgeImageUri: 'https://via.placeholder.com/200x200/fff2e8/fa8c16?text=边缘检测',
    faceLandmarkData: [], // 468个面部特征点数据
    score: 12.5,
    timestamp: 1703145600000, // 2023-12-21 10:00:00
    notes: '静止状态检测，左侧面部轻度不对称',
    
    // 面部对称性评分详情（静止动作专用）
    facialSymmetryScore: {
      eyeScore: 0,      // 眼部得分 0-1
      cheekScore: 1,    // 面颊得分 0-2  
      mouthScore: 1,    // 嘴部得分 0-1
      totalScore: 2,    // 总分
      staticScore: 10,  // 静态分 = 总分 × 5
      eyeOption: '正常',
      cheekOption: '轻度不对称',
      mouthOption: '轻度不对称'
    }
  },
  {
    id: 'record_2',
    patientId: '1',
    actionType: FaceActionTypes.RAISE_EYEBROWS,
    imageUri: 'https://via.placeholder.com/200x200/f0f0f0/999999?text=特征点标注',
    originalImageUri: 'https://via.placeholder.com/200x200/e6f7ff/1890ff?text=原始图像',
    edgeImageUri: 'https://via.placeholder.com/200x200/fff2e8/fa8c16?text=边缘检测',
    faceLandmarkData: [],
    score: 16.0,
    timestamp: 1703145900000, // 2023-12-21 10:05:00
    notes: '抬眉动作，右侧运动幅度明显小于左侧',
    
    // 动态动作评分详情
    dynamicActionScore: {
      symmetryScore: 4,  // 对称性得分 1-5
      linkageScore: 0,   // 联动评分 0-3
      totalScore: 16,    // 总分 = 对称性×4 + 联动
      symmetryOption: '轻度不对称',
      linkageOption: '没有联动'
    }
  },
  {
    id: 'record_3',
    patientId: '1',
    actionType: FaceActionTypes.SMILE,
    imageUri: 'https://via.placeholder.com/200x200/f0f0f0/999999?text=特征点标注',
    originalImageUri: 'https://via.placeholder.com/200x200/e6f7ff/1890ff?text=原始图像',
    edgeImageUri: 'https://via.placeholder.com/200x200/fff2e8/fa8c16?text=边缘检测',
    faceLandmarkData: [],
    score: 14.0,
    timestamp: 1703146200000, // 2023-12-21 10:10:00
    notes: '微笑动作，嘴角上扬不对称',
    
    dynamicActionScore: {
      symmetryScore: 3,
      linkageScore: 2,
      totalScore: 14,
      symmetryOption: '中度不对称',
      linkageOption: '轻度联动'
    }
  },
  {
    id: 'record_4',
    patientId: '2',
    actionType: FaceActionTypes.STILL,
    imageUri: 'https://via.placeholder.com/200x200/f0f0f0/999999?text=特征点标注',
    originalImageUri: 'https://via.placeholder.com/200x200/e6f7ff/1890ff?text=原始图像',
    edgeImageUri: 'https://via.placeholder.com/200x200/fff2e8/fa8c16?text=边缘检测',
    faceLandmarkData: [],
    score: 8.0,
    timestamp: 1703232000000, // 2023-12-22 10:00:00
    notes: '静止状态检测，右侧面部明显下垂',
    
    facialSymmetryScore: {
      eyeScore: 0,
      cheekScore: 0,
      mouthScore: 1,
      totalScore: 1,
      staticScore: 5,
      eyeOption: '明显不对称',
      cheekOption: '明显不对称',
      mouthOption: '轻度不对称'
    }
  },
  {
    id: 'record_5',
    patientId: '3',
    actionType: FaceActionTypes.CLOSE_EYES,
    imageUri: 'https://via.placeholder.com/200x200/f0f0f0/999999?text=特征点标注',
    originalImageUri: 'https://via.placeholder.com/200x200/e6f7ff/1890ff?text=原始图像',
    edgeImageUri: 'https://via.placeholder.com/200x200/fff2e8/fa8c16?text=边缘检测',
    faceLandmarkData: [],
    score: 18.0,
    timestamp: 1703318400000, // 2023-12-23 10:00:00
    notes: '闭眼动作，恢复良好',
    
    dynamicActionScore: {
      symmetryScore: 4,
      linkageScore: 2,
      totalScore: 18,
      symmetryOption: '轻度不对称',
      linkageOption: '中度联动'
    }
  }
];

// 检测记录存储
const useDetectionStore = create((set, get) => ({
  // 检测记录列表
  detectionRecords: loadFromStorage(STORAGE_KEYS.DETECTION_RECORDS, defaultDetectionRecords),
  
  // 获取所有检测记录
  getAllRecords: () => {
    return get().detectionRecords;
  },
  
  // 获取特定患者的检测记录
  getRecordsForPatient: (patientId) => {
    return get().detectionRecords.filter(record => record.patientId === patientId);
  },
  
  // 获取特定动作类型的记录
  getRecordsByActionType: (actionType) => {
    return get().detectionRecords.filter(record => record.actionType === actionType);
  },
  
  // 获取单个检测记录
  getRecordById: (recordId) => {
    return get().detectionRecords.find(record => record.id === recordId);
  },
  
  // 添加检测记录
  addRecord: (record) => set((state) => {
    const newRecord = {
      ...record,
      id: record.id || Date.now().toString(),
      timestamp: record.timestamp || Date.now()
    };
    const newRecords = [...state.detectionRecords, newRecord];
    saveToStorage(STORAGE_KEYS.DETECTION_RECORDS, newRecords);
    return { detectionRecords: newRecords };
  }),
  
  // 更新检测记录
  updateRecord: (recordId, updatedRecord) => set((state) => {
    const newRecords = state.detectionRecords.map(record =>
      record.id === recordId ? { ...record, ...updatedRecord } : record
    );
    saveToStorage(STORAGE_KEYS.DETECTION_RECORDS, newRecords);
    return { detectionRecords: newRecords };
  }),
  
  // 删除检测记录
  deleteRecord: (recordId) => set((state) => {
    const newRecords = state.detectionRecords.filter(record => record.id !== recordId);
    saveToStorage(STORAGE_KEYS.DETECTION_RECORDS, newRecords);
    return { detectionRecords: newRecords };
  }),
  
  // 批量删除检测记录
  deleteRecords: (recordIds) => set((state) => {
    const newRecords = state.detectionRecords.filter(record => !recordIds.includes(record.id));
    saveToStorage(STORAGE_KEYS.DETECTION_RECORDS, newRecords);
    return { detectionRecords: newRecords };
  }),
  
  // 获取患者的最新检测记录
  getLatestRecordForPatient: (patientId) => {
    const records = get().getRecordsForPatient(patientId);
    return records.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  },
  
  // 获取患者的康复进度数据
  getRecoveryProgress: (patientId) => {
    const records = get().getRecordsForPatient(patientId)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return records.map(record => ({
      date: new Date(record.timestamp).toLocaleDateString(),
      score: record.score,
      actionType: record.actionType,
      actionName: ActionTypeNames[record.actionType]
    }));
  },
  
  // 获取动作类型统计
  getActionTypeStats: () => {
    const records = get().detectionRecords;
    const stats = {};
    
    Object.values(FaceActionTypes).forEach(actionType => {
      const actionRecords = records.filter(record => record.actionType === actionType);
      stats[actionType] = {
        count: actionRecords.length,
        averageScore: actionRecords.length > 0 
          ? actionRecords.reduce((sum, record) => sum + record.score, 0) / actionRecords.length 
          : 0,
        name: ActionTypeNames[actionType]
      };
    });
    
    return stats;
  }
}));

export default useDetectionStore;
