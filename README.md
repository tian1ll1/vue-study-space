# Vue 3 学习应用

专为有Angular和React基础的开发者设计的Vue 3学习平台。

## 项目特性

- 🚀 基于 Vue 3 + TypeScript + Vite
- 📱 响应式设计，支持移动端
- 🎯 渐进式学习模块
- 💡 实时代码编辑和预览
- 🔄 与React/Angular的对比说明
- 📊 学习进度跟踪

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **代码质量**: ESLint + Prettier

## 开发环境设置

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 学习模块

1. **基础语法** - Vue 3的模板语法、数据绑定和事件处理
2. **组件系统** - 组件化开发和组件通信
3. **响应式系统** - ref、reactive、computed、watch
4. **Composition API** - 现代Vue开发方式
5. **路由和状态管理** - Vue Router 4 + Pinia
6. **高级特性** - 自定义指令、Teleport、Suspense等
7. **项目实战** - 完整的Todo应用开发

## 项目结构

```
src/
├── components/           # 通用组件
├── views/               # 页面组件
│   ├── Home.vue        # 首页
│   └── modules/        # 学习模块
├── composables/         # 组合式函数
├── stores/             # Pinia stores
├── types/              # TypeScript类型定义
├── examples/           # 示例代码和练习
├── utils/              # 工具函数
└── assets/             # 静态资源
```

## 贡献指南

欢迎提交Issue和Pull Request来改进这个学习应用！

## 许可证

MIT License