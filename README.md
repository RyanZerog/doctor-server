# 面瘫患者评估及康复治疗管理平台

面瘫患者评估及康复治疗管理平台，用于医生管理面瘫患者信息、评估康复进度、制定治疗方案及随访提醒。

## ✨ 功能特点

- **患者管理**：完整的患者信息管理，支持添加、编辑、删除患者
- **标签分类**：灵活的标签系统，支持患者分类管理
- **随访提醒**：智能随访提醒系统，默认三个月复查周期
- **数据统计**：直观的数据统计面板，展示患者概况
- **数据持久化**：本地存储支持，数据不会丢失
- **响应式设计**：适配各种设备屏幕
- **数据导出**：支持CSV和JSON格式数据导出

## 🚀 技术栈

- **前端框架**：React 18
- **路由管理**：React Router v6 (HashRouter)
- **UI组件库**：Ant Design 5.x
- **状态管理**：Zustand
- **日期处理**：Dayjs
- **构建工具**：Create React App

## 📦 项目结构

```
src/
├── components/          # 通用组件
│   ├── ErrorBoundary.js # 错误边界
│   ├── LoadingSpinner.js # 加载组件
│   └── EmptyState.js    # 空状态组件
├── hooks/              # 自定义Hooks
│   └── useResponsive.js # 响应式Hook
├── layouts/            # 布局组件
│   └── MainLayout.js   # 主布局
├── store/              # 状态管理
│   ├── usePatientStore.js # 患者数据
│   └── useTagStore.js     # 标签数据
├── utils/              # 工具函数
│   ├── dateUtils.js    # 日期工具
│   ├── searchUtils.js  # 搜索工具
│   ├── storage.js      # 存储工具
│   └── validation.js   # 验证工具
└── views/              # 页面组件
    ├── Dashboard.js    # 仪表盘
    ├── PatientList.js  # 患者列表
    ├── PatientDetail.js # 患者详情
    ├── TagManagement.js # 标签管理
    └── FollowUpReminders.js # 随访提醒
```

## 🛠️ 开发环境启动

确保已安装Node.js环境（建议使用v16+），然后执行：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 📦 构建和部署

### 构建生产版本
```bash
npm run build
```

### 部署到GitHub Pages
```bash
npm run deploy
```

构建后的文件将位于 `build` 文件夹中，可部署到任何静态文件服务器。

## 🔧 最近优化内容

### 代码质量优化
- ✅ 清理未使用的导入和变量
- ✅ 修复ESLint警告
- ✅ 统一代码风格

### 性能优化
- ✅ 使用useMemo优化列表过滤
- ✅ 使用useCallback优化事件处理
- ✅ 创建日期工具函数避免重复计算
- ✅ 优化组件渲染性能

### 用户体验优化
- ✅ 添加错误边界组件
- ✅ 创建统一的加载组件
- ✅ 改进空状态显示
- ✅ 添加响应式设计支持

### 功能完善
- ✅ 数据持久化（localStorage）
- ✅ 高级搜索功能
- ✅ 数据导出功能（CSV/JSON）
- ✅ 输入验证和数据清理

### 安全性和最佳实践
- ✅ 输入验证和清理
- ✅ XSS防护
- ✅ 数据大小限制检查
- ✅ 错误处理机制

## 🎯 使用说明

### 患者管理
1. 在患者管理页面可以添加新患者
2. 支持按姓名、电话、面瘫原因搜索
3. 可以为患者设置标签进行分类
4. 支持表格和卡片两种视图模式

### 随访管理
1. 系统会自动提醒今日需要随访的患者
2. 支持设置自定义随访日期
3. 可以标记随访完成，系统自动设置下次随访
4. 提供日历视图查看随访安排

### 数据导出
1. 在患者列表页面点击导出按钮
2. 支持导出为CSV格式（Excel可直接打开）
3. 支持导出为JSON格式（程序处理）

## 🔍 技术特性

- **HashRouter**：适配GitHub Pages部署
- **本地存储**：数据自动保存到浏览器
- **响应式设计**：支持手机、平板、桌面设备
- **错误处理**：完善的错误边界和提示
- **性能优化**：使用React最佳实践

## 📝 开发注意事项

1. 使用HashRouter而不是BrowserRouter（适配GitHub Pages）
2. 所有数据操作都会自动保存到localStorage
3. 组件使用memo和callback优化性能
4. 遵循Ant Design设计规范
5. 使用TypeScript类型检查（可选）

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
