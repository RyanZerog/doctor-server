import { create } from 'zustand';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

// 默认标签数据
const defaultTags = [
  { id: '1', name: '新患者', color: '#108ee9' },
  { id: '2', name: '复诊', color: '#87d068' },
  { id: '3', name: '重点关注', color: '#f50' },
];

// 标签管理的状态存储
const useTagStore = create((set) => ({
  // 标签列表 - 从本地存储加载，如果没有则使用默认数据
  tags: loadFromStorage(STORAGE_KEYS.TAGS, defaultTags),
  
  // 添加标签
  addTag: (tag) => set((state) => {
    const newTags = [...state.tags, { ...tag, id: Date.now().toString() }];
    saveToStorage(STORAGE_KEYS.TAGS, newTags);
    return { tags: newTags };
  }),

  // 编辑标签
  editTag: (id, updatedTag) => set((state) => {
    const newTags = state.tags.map((tag) => (tag.id === id ? { ...tag, ...updatedTag } : tag));
    saveToStorage(STORAGE_KEYS.TAGS, newTags);
    return { tags: newTags };
  }),

  // 删除标签
  deleteTag: (id) => set((state) => {
    const newTags = state.tags.filter((tag) => tag.id !== id);
    saveToStorage(STORAGE_KEYS.TAGS, newTags);
    return { tags: newTags };
  }),
}));

export default useTagStore; 