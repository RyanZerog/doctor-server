/**
 * 数据验证工具函数
 * 提供输入验证和数据清理功能
 */

/**
 * 验证手机号码
 * @param {string} phone - 手机号码
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证姓名
 * @param {string} name - 姓名
 * @returns {boolean} 是否有效
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 20;
};

/**
 * 验证年龄
 * @param {number} age - 年龄
 * @returns {boolean} 是否有效
 */
export const validateAge = (age) => {
  return Number.isInteger(age) && age >= 0 && age <= 150;
};

/**
 * 验证日期格式
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean} 是否有效
 */
export const validateDate = (date) => {
  if (!date || typeof date !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * 验证颜色值
 * @param {string} color - 颜色值 (#RRGGBB)
 * @returns {boolean} 是否有效
 */
export const validateColor = (color) => {
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorRegex.test(color);
};

/**
 * 清理和转义HTML内容
 * @param {string} input - 输入字符串
 * @returns {string} 清理后的字符串
 */
export const sanitizeHTML = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 验证患者数据
 * @param {object} patient - 患者数据
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validatePatient = (patient) => {
  const errors = [];
  
  if (!validateName(patient.name)) {
    errors.push('姓名必须是2-20个字符');
  }
  
  if (!patient.gender || !['男', '女'].includes(patient.gender)) {
    errors.push('请选择正确的性别');
  }
  
  if (!validateAge(patient.age)) {
    errors.push('年龄必须是0-150之间的整数');
  }
  
  if (!validatePhone(patient.phone)) {
    errors.push('请输入正确的手机号码');
  }
  
  if (!patient.cause || patient.cause.trim().length === 0) {
    errors.push('请选择面瘫原因');
  }
  
  if (patient.visitDate && !validateDate(patient.visitDate)) {
    errors.push('初诊日期格式不正确');
  }
  
  if (patient.nextFollowUp && !validateDate(patient.nextFollowUp)) {
    errors.push('随访日期格式不正确');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证标签数据
 * @param {object} tag - 标签数据
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateTag = (tag) => {
  const errors = [];
  
  if (!tag.name || tag.name.trim().length === 0) {
    errors.push('标签名称不能为空');
  } else if (tag.name.trim().length > 20) {
    errors.push('标签名称不能超过20个字符');
  }
  
  if (!validateColor(tag.color)) {
    errors.push('请选择正确的颜色');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 深度清理对象，移除危险字符
 * @param {any} obj - 要清理的对象
 * @returns {any} 清理后的对象
 */
export const deepSanitize = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = deepSanitize(value);
    }
    return cleaned;
  }
  
  return obj;
};

/**
 * 检查数据大小限制
 * @param {any} data - 数据
 * @param {number} maxSizeKB - 最大大小（KB）
 * @returns {boolean} 是否超出限制
 */
export const checkDataSize = (data, maxSizeKB = 1024) => {
  try {
    const jsonString = JSON.stringify(data);
    const sizeKB = new Blob([jsonString]).size / 1024;
    return sizeKB <= maxSizeKB;
  } catch (error) {
    console.error('检查数据大小失败:', error);
    return false;
  }
};
