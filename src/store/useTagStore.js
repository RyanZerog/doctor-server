import { create } from 'zustand';

// 标签管理的状态存储
const useTagStore = create((set) => ({
  // 标签列表
  tags: [
    { id: '1', name: '新患者', color: '#108ee9' },
    { id: '2', name: '复诊', color: '#87d068' },
    { id: '3', name: '重点关注', color: '#f50' },
  ],
  
  // 添加标签
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, { ...tag, id: Date.now().toString() }]
  })),
  
  // 编辑标签
  editTag: (id, updatedTag) => set((state) => ({
    tags: state.tags.map((tag) => (tag.id === id ? { ...tag, ...updatedTag } : tag))
  })),
  
  // 删除标签
  deleteTag: (id) => set((state) => ({
    tags: state.tags.filter((tag) => tag.id !== id)
  })),
}));

export default useTagStore; 