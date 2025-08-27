import dayjs from 'dayjs';

/**
 * 日期工具函数集合
 * 用于优化日期计算性能，避免重复计算
 */

// 缓存今天的日期，避免重复计算
let todayCache = null;
let todayCacheTime = null;

/**
 * 获取今天的日期字符串 (YYYY-MM-DD)
 * 使用缓存机制，避免重复计算
 */
export const getToday = () => {
  const now = Date.now();
  // 如果缓存存在且在同一天内，直接返回缓存
  if (todayCache && todayCacheTime && (now - todayCacheTime) < 24 * 60 * 60 * 1000) {
    return todayCache;
  }
  
  todayCache = dayjs().format('YYYY-MM-DD');
  todayCacheTime = now;
  return todayCache;
};

/**
 * 计算两个日期之间的天数差
 * @param {string} targetDate - 目标日期 (YYYY-MM-DD)
 * @param {string} baseDate - 基准日期，默认为今天
 * @returns {number} 天数差（正数表示未来，负数表示过去）
 */
export const getDaysDiff = (targetDate, baseDate = null) => {
  if (!targetDate) return null;
  
  const base = baseDate ? dayjs(baseDate) : dayjs();
  const target = dayjs(targetDate);
  
  return target.diff(base, 'day');
};

/**
 * 判断是否为今天
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isToday = (date) => {
  return date === getToday();
};

/**
 * 判断是否为即将到来的日期（未来7天内）
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isUpcoming = (date) => {
  const diff = getDaysDiff(date);
  return diff !== null && diff >= 0 && diff <= 7;
};

/**
 * 判断是否为逾期日期
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @returns {boolean}
 */
export const isOverdue = (date) => {
  const diff = getDaysDiff(date);
  return diff !== null && diff < 0;
};

/**
 * 格式化随访状态显示
 * @param {string} followUpDate - 随访日期
 * @returns {object} { status: 'today'|'upcoming'|'overdue'|'normal', text: string, daysDiff: number }
 */
export const getFollowUpStatus = (followUpDate) => {
  if (!followUpDate) {
    return { status: 'normal', text: '暂未设置', daysDiff: null };
  }
  
  const diff = getDaysDiff(followUpDate);
  
  if (diff === 0) {
    return { status: 'today', text: '今日', daysDiff: diff };
  } else if (diff < 0) {
    return { status: 'overdue', text: `逾期 ${Math.abs(diff)} 天`, daysDiff: diff };
  } else if (diff <= 7) {
    return { status: 'upcoming', text: `${diff} 天后`, daysDiff: diff };
  } else {
    return { status: 'normal', text: followUpDate, daysDiff: diff };
  }
};

/**
 * 计算下次随访日期（默认3个月后）
 * @param {string} baseDate - 基准日期，默认为今天
 * @param {number} months - 月数，默认3个月
 * @returns {string} 下次随访日期 (YYYY-MM-DD)
 */
export const getNextFollowUpDate = (baseDate = null, months = 3) => {
  const base = baseDate ? dayjs(baseDate) : dayjs();
  return base.add(months, 'month').format('YYYY-MM-DD');
};
