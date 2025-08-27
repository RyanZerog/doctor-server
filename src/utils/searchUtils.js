/**
 * 搜索工具函数
 * 提供高级搜索和过滤功能
 */

/**
 * 高级搜索函数
 * @param {Array} data - 要搜索的数据数组
 * @param {string} searchText - 搜索文本
 * @param {Array} searchFields - 要搜索的字段数组
 * @param {object} filters - 过滤条件
 * @returns {Array} 过滤后的数据
 */
export const advancedSearch = (data, searchText = '', searchFields = [], filters = {}) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    // 文本搜索
    let textMatch = true;
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      textMatch = searchFields.some(field => {
        const fieldValue = getNestedValue(item, field);
        return fieldValue && fieldValue.toString().toLowerCase().includes(searchLower);
      });
    }
    
    // 过滤条件
    let filterMatch = true;
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        const itemValue = getNestedValue(item, filterKey);
        
        if (Array.isArray(filterValue)) {
          // 数组过滤（如标签）
          filterMatch = filterValue.some(val => 
            Array.isArray(itemValue) ? itemValue.includes(val) : itemValue === val
          );
        } else {
          // 单值过滤
          filterMatch = itemValue === filterValue;
        }
        
        if (!filterMatch) break;
      }
    }
    
    return textMatch && filterMatch;
  });
};

/**
 * 获取嵌套对象的值
 * @param {object} obj - 对象
 * @param {string} path - 路径，如 'user.name'
 * @returns {any} 值
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

/**
 * 患者专用搜索函数
 * @param {Array} patients - 患者数据
 * @param {string} searchText - 搜索文本
 * @param {object} filters - 过滤条件
 * @returns {Array} 过滤后的患者数据
 */
export const searchPatients = (patients, searchText = '', filters = {}) => {
  const searchFields = [
    'name',           // 姓名
    'phone',          // 电话
    'cause',          // 面瘫原因
    'notes'           // 备注
  ];
  
  return advancedSearch(patients, searchText, searchFields, filters);
};

/**
 * 按日期范围过滤
 * @param {Array} data - 数据数组
 * @param {string} dateField - 日期字段名
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Array} 过滤后的数据
 */
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const itemDate = getNestedValue(item, dateField);
    if (!itemDate) return false;
    
    const date = new Date(itemDate);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    return date >= start && date <= end;
  });
};

/**
 * 按年龄范围过滤
 * @param {Array} patients - 患者数据
 * @param {number} minAge - 最小年龄
 * @param {number} maxAge - 最大年龄
 * @returns {Array} 过滤后的患者数据
 */
export const filterByAgeRange = (patients, minAge, maxAge) => {
  return patients.filter(patient => {
    const age = patient.age;
    const min = minAge !== null && minAge !== undefined ? minAge : 0;
    const max = maxAge !== null && maxAge !== undefined ? maxAge : 150;
    return age >= min && age <= max;
  });
};

/**
 * 排序函数
 * @param {Array} data - 要排序的数据
 * @param {string} field - 排序字段
 * @param {string} order - 排序顺序 'asc' | 'desc'
 * @returns {Array} 排序后的数据
 */
export const sortData = (data, field, order = 'asc') => {
  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);
    
    // 处理null/undefined值
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // 数字排序
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // 日期排序
    if (isDateString(aValue) && isDateString(bValue)) {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // 字符串排序
    const strA = aValue.toString().toLowerCase();
    const strB = bValue.toString().toLowerCase();
    
    if (order === 'asc') {
      return strA.localeCompare(strB, 'zh-CN');
    } else {
      return strB.localeCompare(strA, 'zh-CN');
    }
  });
};

/**
 * 检查是否为日期字符串
 * @param {string} str - 字符串
 * @returns {boolean} 是否为日期
 */
const isDateString = (str) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str));
};

/**
 * 高亮搜索关键词
 * @param {string} text - 原文本
 * @param {string} searchText - 搜索关键词
 * @returns {string} 高亮后的HTML
 */
export const highlightSearchText = (text, searchText) => {
  if (!searchText.trim() || !text) return text;
  
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
