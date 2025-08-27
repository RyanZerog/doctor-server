import { create } from 'zustand';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

// 默认患者数据
const defaultPatients = [
    {
      id: '1',
      name: '张三',
      gender: '男',
      age: 45,
      phone: '13800138000',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-15',
      nextFollowUp: '2025-09-15',
      tags: ['1', '3'],
      notes: '患者左侧面部表情肌无力，嘴角下垂，左眼闭合不全。'
    },
    {
      id: '2',
      name: '李四',
      gender: '女',
      age: 28,
      phone: '13900139000',
      cause: '外伤',
      visitDate: '2023-07-01',
      nextFollowUp: '2025-08-29',
      tags: ['1'],
      notes: '车祸导致右侧颅底骨折，面神经损伤。'
    },
    {
      id: '3',
      name: '王五',
      gender: '男',
      age: 62,
      phone: '13700137000',
      cause: '肿瘤',
      visitDate: '2023-05-20',
      nextFollowUp: '2025-10-12',
      tags: ['2'],
      notes: '面神经鞘瘤术后，右侧面部轻度下垂。'
    },
    // 新增患者样本
    {
      id: '4',
      name: '陆淳',
      gender: '男',
      age: 34,
      phone: '13512345678',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-07-10',
      nextFollowUp: '2025-08-27',
      tags: ['1', '2'],
      notes: '右侧面瘫，伴随耳后疼痛，一周前突发。口眼歪斜明显，无法皱眉。'
    },
    {
      id: '5',
      name: '沈菁',
      gender: '女',
      age: 29,
      phone: '13567891234',
      cause: '医源性',
      visitDate: '2023-08-05',
      nextFollowUp: '2025-11-05',
      tags: ['1'],
      notes: '颌面部手术后出现左侧面瘫，无法闭合左眼，嘴角歪斜。'
    },
    {
      id: '6',
      name: '许丽丽',
      gender: '女',
      age: 42,
      phone: '13812345678',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-28',
      nextFollowUp: '2025-09-28',
      tags: ['3'],
      notes: '左侧面瘫，发病前有感冒症状，面部感觉异常，无法做出表情。'
    },
    {
      id: '7',
      name: '姚丽苹',
      gender: '女',
      age: 31,
      phone: '13998765432',
      cause: '先天性',
      visitDate: '2023-05-15',
      nextFollowUp: '2025-08-30',
      tags: ['2'],
      notes: '先天性面瘫，伴随听力障碍，右侧面部肌肉萎缩明显。'
    },
    {
      id: '8',
      name: '王海艳',
      gender: '女',
      age: 51,
      phone: '13587654321',
      cause: '肿瘤',
      visitDate: '2023-07-22',
      nextFollowUp: '2025-10-22',
      tags: ['1', '3'],
      notes: '听神经瘤压迫引起的右侧面瘫，同时伴有耳鸣、眩晕症状。'
    },
    {
      id: '9',
      name: '吴思涵',
      gender: '男',
      age: 24,
      phone: '13923456789',
      cause: '外伤',
      visitDate: '2023-08-12',
      nextFollowUp: '2025-11-12',
      tags: ['1'],
      notes: '摩托车事故导致颅底骨折，面神经受损，左侧面瘫明显。'
    },
    {
      id: '10',
      name: '袁月娟',
      gender: '女',
      age: 45,
      phone: '13876543210',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-03',
      nextFollowUp: '2025-09-03',
      tags: ['2'],
      notes: '右侧面瘫，伴随味觉障碍，发病前有受凉史。'
    },
    {
      id: '11',
      name: '陈海青',
      gender: '男',
      age: 38,
      phone: '13734567890',
      cause: '不明原因/其他',
      visitDate: '2023-07-05',
      nextFollowUp: '2025-10-05',
      tags: ['3'],
      notes: '双侧面部表情肌无力，进行性加重，怀疑可能是系统性疾病。'
    },
    {
      id: '12',
      name: '曹淑婷',
      gender: '女',
      age: 27,
      phone: '13645678901',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-08-01',
      nextFollowUp: '2025-11-01',
      tags: ['1'],
      notes: '左侧面瘫，发病前有感冒，面部麻木感，无法闭合左眼。'
    },
    {
      id: '13',
      name: '唐燕',
      gender: '女',
      age: 36,
      phone: '13556789012',
      cause: '医源性',
      visitDate: '2023-05-28',
      nextFollowUp: '2025-08-31',
      tags: ['2', '3'],
      notes: '耳部手术后出现右侧面瘫，伴有听力下降。'
    },
    {
      id: '14',
      name: '王雪梅',
      gender: '女',
      age: 49,
      phone: '13667890123',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-07-18',
      nextFollowUp: '2025-10-18',
      tags: ['1'],
      notes: '左侧面瘫，在受凉后突发，面部肌肉控制困难。'
    },
    {
      id: '15',
      name: '马帅',
      gender: '男',
      age: 33,
      phone: '13778901234',
      cause: '外伤',
      visitDate: '2023-06-20',
      nextFollowUp: '2025-09-20',
      tags: ['3'],
      notes: '工伤事故导致面部外伤，右侧面神经受损，面部表情不对称。'
    },
    {
      id: '16',
      name: '缪琼华',
      gender: '女',
      age: 57,
      phone: '13889012345',
      cause: '肿瘤',
      visitDate: '2023-08-08',
      nextFollowUp: '2025-11-08',
      tags: ['2'],
      notes: '脑干胶质瘤压迫面神经导致右侧面瘫，伴随头痛和平衡问题。'
    },
    {
      id: '17',
      name: '孙会',
      gender: '女',
      age: 41,
      phone: '13990123456',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-05-10',
      nextFollowUp: '2025-09-10',
      tags: ['1', '3'],
      notes: '右侧面瘫，面部肌肉无力，口眼歪斜，无法做出微笑表情。'
    },
    {
      id: '18',
      name: '段凌燕',
      gender: '女',
      age: 30,
      phone: '13501234567',
      cause: '先天性',
      visitDate: '2023-07-12',
      nextFollowUp: '2025-10-12',
      tags: ['2'],
      notes: '先天性面神经发育不全，左侧面部肌肉发育不良，面部不对称。'
    },
    {
      id: '19',
      name: '张美',
      gender: '女',
      age: 26,
      phone: '13612345678',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-30',
      nextFollowUp: '2025-09-30',
      tags: ['1'],
      notes: '突发性右侧面瘫，伴有耳后痛，面部感觉异常。'
    },
    {
      id: '20',
      name: '汤国栋',
      gender: '男',
      age: 54,
      phone: '13723456789',
      cause: '肿瘤',
      visitDate: '2023-08-15',
      nextFollowUp: '2025-11-15',
      tags: ['3'],
      notes: '面神经通路肿瘤压迫导致左侧面瘫，逐渐加重。'
    },
    {
      id: '21',
      name: '闻娜',
      gender: '女',
      age: 32,
      phone: '13834567890',
      cause: '不明原因/其他',
      visitDate: '2023-05-25',
      nextFollowUp: '2025-09-05',
      tags: ['2'],
      notes: '右侧面部肌肉无力，原因不明，可能与自身免疫疾病有关。'
    },
    {
      id: '22',
      name: '林常胜',
      gender: '男',
      age: 47,
      phone: '13945678901',
      cause: '外伤',
      visitDate: '2023-07-28',
      nextFollowUp: '2025-10-28',
      tags: ['1', '3'],
      notes: '车祸导致颅底骨折，左侧面神经损伤，面部运动障碍明显。'
    },
    {
      id: '23',
      name: '潘静',
      gender: '女',
      age: 35,
      phone: '13856789012',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-08',
      nextFollowUp: '2025-09-08',
      tags: ['1'],
      notes: '左侧面瘫，面部无法做出表情，眼睑闭合不全，口角歪斜。'
    },
    {
      id: '24',
      name: '顾琼',
      gender: '女',
      age: 39,
      phone: '13967890123',
      cause: '医源性',
      visitDate: '2023-08-20',
      nextFollowUp: '2025-11-20',
      tags: ['2', '3'],
      notes: '牙科手术后出现右侧面瘫，可能与局部麻醉有关。'
    },
    {
      id: '25',
      name: '王燕',
      gender: '女',
      age: 43,
      phone: '13578901234',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-05-30',
      nextFollowUp: '2025-08-27',
      tags: ['1'],
      notes: '右侧面瘫，伴有流泪增多，面部疼痛，发病前有感冒症状。'
    },
    {
      id: '26',
      name: '许艳芳',
      gender: '女',
      age: 31,
      phone: '13689012345',
      cause: '外伤',
      visitDate: '2023-07-15',
      nextFollowUp: '2025-10-15',
      tags: ['2'],
      notes: '面部撞伤导致面神经损伤，左侧面瘫，伴有局部肿胀。'
    },
    {
      id: '27',
      name: '程玉晶晶',
      gender: '女',
      age: 25,
      phone: '13790123456',
      cause: 'BELL面瘫（面神经炎）',
      visitDate: '2023-06-25',
      nextFollowUp: '2025-09-25',
      tags: ['1', '3'],
      notes: '突发左侧面瘫，口眼歪斜，无法皱眉，味觉异常。'
    },
    {
      id: '28',
      name: '钱秋鸣',
      gender: '男',
      age: 52,
      phone: '13601234567',
      cause: '肿瘤',
      visitDate: '2023-08-10',
      nextFollowUp: '2025-11-10',
      tags: ['2', '3'],
      notes: '颅内肿瘤压迫导致面神经功能障碍，右侧面瘫，进行性加重。'
    },
    {
      id: '29',
      name: '吴运渠',
      gender: '男',
      age: 50,
      phone: '13712345678',
      cause: '不明原因/其他',
      visitDate: '2023-05-18',
      nextFollowUp: '2025-08-27',
      tags: ['1'],
      notes: '双侧轻度面瘫，原因不明，疑似代谢性疾病引起。'
    }
  ];

// 患者数据的状态存储
const usePatientStore = create((set, get) => ({
  // 患者列表 - 从本地存储加载，如果没有则使用默认数据
  patients: loadFromStorage(STORAGE_KEYS.PATIENTS, defaultPatients),
  
  // 面瘫原因分类
  causesOptions: [
    '先天性',
    'BELL面瘫（面神经炎）',
    '外伤',
    '肿瘤',
    '医源性',
    '不明原因/其他'
  ],
  
  // 添加患者
  addPatient: (patient) => set((state) => {
    const newPatients = [...state.patients, { ...patient, id: Date.now().toString() }];
    saveToStorage(STORAGE_KEYS.PATIENTS, newPatients);
    return { patients: newPatients };
  }),
  
  // 编辑患者
  updatePatient: (id, updatedPatient) => set((state) => {
    const newPatients = state.patients.map((patient) =>
      patient.id === id ? { ...patient, ...updatedPatient } : patient
    );
    saveToStorage(STORAGE_KEYS.PATIENTS, newPatients);
    return { patients: newPatients };
  }),

  // 删除患者
  deletePatient: (id) => set((state) => {
    const newPatients = state.patients.filter((patient) => patient.id !== id);
    saveToStorage(STORAGE_KEYS.PATIENTS, newPatients);
    return { patients: newPatients };
  }),

  // 更新患者标签
  updatePatientTags: (patientId, tagIds) => set((state) => {
    const newPatients = state.patients.map((patient) =>
      patient.id === patientId ? { ...patient, tags: tagIds } : patient
    );
    saveToStorage(STORAGE_KEYS.PATIENTS, newPatients);
    return { patients: newPatients };
  }),

  // 设置随访日期
  setFollowUpDate: (patientId, date) => set((state) => {
    const newPatients = state.patients.map((patient) =>
      patient.id === patientId ? { ...patient, nextFollowUp: date } : patient
    );
    saveToStorage(STORAGE_KEYS.PATIENTS, newPatients);
    return { patients: newPatients };
  }),
}));

export default usePatientStore; 