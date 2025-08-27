/**
 * 本地存储工具函数
 * 提供数据持久化功能
 */

const STORAGE_KEYS = {
  PATIENTS: 'doctor_system_patients',
  TAGS: 'doctor_system_tags',
  SETTINGS: 'doctor_system_settings',
  ASSESSMENTS: 'doctor_system_assessments',
  REHABILITATION_PLANS: 'doctor_system_rehabilitation_plans'
};

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键
 * @param {any} data - 要存储的数据
 */
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('保存数据到本地存储失败:', error);
    return false;
  }
};

/**
 * 从localStorage读取数据
 * @param {string} key - 存储键
 * @param {any} defaultValue - 默认值
 * @returns {any} 读取的数据或默认值
 */
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('从本地存储读取数据失败:', error);
    return defaultValue;
  }
};

/**
 * 删除localStorage中的数据
 * @param {string} key - 存储键
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除本地存储数据失败:', error);
    return false;
  }
};

/**
 * 清空所有应用数据
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
};

/**
 * 导出数据为JSON文件
 * @param {string} filename - 文件名
 * @param {object} data - 要导出的数据
 */
export const exportToJSON = (filename, data) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('导出数据失败:', error);
    return false;
  }
};

/**
 * 导出患者数据为CSV文件
 * @param {Array} patients - 患者数据
 * @param {Array} tags - 标签数据
 */
export const exportPatientsToCSV = (patients, tags) => {
  try {
    // CSV头部
    const headers = [
      '姓名', '性别', '年龄', '电话', '面瘫原因', 
      '初诊日期', '下次随访', '标签', '备注'
    ];
    
    // 转换数据
    const csvData = patients.map(patient => {
      const patientTags = patient.tags
        .map(tagId => tags.find(t => t.id === tagId)?.name)
        .filter(Boolean)
        .join('; ');
      
      return [
        patient.name,
        patient.gender,
        patient.age,
        patient.phone,
        patient.cause,
        patient.visitDate,
        patient.nextFollowUp || '未设置',
        patientTags,
        patient.notes || ''
      ];
    });
    
    // 组合CSV内容
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // 添加BOM以支持中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `患者数据_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('导出CSV失败:', error);
    return false;
  }
};

export { STORAGE_KEYS };
