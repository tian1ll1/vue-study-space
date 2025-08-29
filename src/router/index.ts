import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import type { LearningModule } from '../types/router'

export const learningModules: LearningModule[] = [
  {
    path: '/basic-syntax',
    name: 'basic-syntax',
    title: '基础语法',
    description: '学习Vue 3的模板语法、数据绑定和事件处理',
    difficulty: 'beginner',
    estimatedTime: 30
  },
  {
    path: '/components',
    name: 'components',
    title: '组件系统',
    description: '掌握Vue 3组件的创建、通信和生命周期',
    difficulty: 'beginner',
    prerequisites: ['basic-syntax'],
    estimatedTime: 45
  },
  {
    path: '/reactivity',
    name: 'reactivity',
    title: '响应式系统',
    description: '理解Vue 3的响应式原理和API',
    difficulty: 'intermediate',
    prerequisites: ['basic-syntax'],
    estimatedTime: 40
  },
  {
    path: '/composition-api',
    name: 'composition-api',
    title: 'Composition API',
    description: '掌握Vue 3的组合式API和现代开发方式',
    difficulty: 'intermediate',
    prerequisites: ['reactivity'],
    estimatedTime: 50
  },
  {
    path: '/router-state',
    name: 'router-state',
    title: '路由和状态管理',
    description: '学习Vue Router和Pinia状态管理',
    difficulty: 'intermediate',
    prerequisites: ['components'],
    estimatedTime: 60
  },
  {
    path: '/advanced',
    name: 'advanced',
    title: '高级特性',
    description: '探索Vue 3的高级功能和最佳实践',
    difficulty: 'advanced',
    prerequisites: ['composition-api'],
    estimatedTime: 70
  },
  {
    path: '/project',
    name: 'project',
    title: '项目实战',
    description: '构建完整的Vue 3应用项目',
    difficulty: 'advanced',
    prerequisites: ['router-state', 'advanced'],
    estimatedTime: 120
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Vue 3 学习中心'
    }
  },
  {
    path: '/basic-syntax',
    name: 'basic-syntax',
    component: () => import('../views/modules/BasicSyntax.vue'),
    meta: {
      title: '基础语法',
      description: '学习Vue 3的模板语法、数据绑定和事件处理',
      difficulty: 'beginner',
      estimatedTime: 30,
      requiresProgress: false
    }
  },
  {
    path: '/components',
    name: 'components',
    component: () => import('../views/modules/Components.vue'),
    meta: {
      title: '组件系统',
      description: '掌握Vue 3组件的创建、通信和生命周期',
      difficulty: 'beginner',
      prerequisites: ['basic-syntax'],
      estimatedTime: 45,
      requiresProgress: true
    }
  },
  {
    path: '/reactivity',
    name: 'reactivity',
    component: () => import('../views/modules/Reactivity.vue'),
    meta: {
      title: '响应式系统',
      description: '理解Vue 3的响应式原理和API',
      difficulty: 'intermediate',
      prerequisites: ['basic-syntax'],
      estimatedTime: 40,
      requiresProgress: true
    }
  },
  {
    path: '/composition-api',
    name: 'composition-api',
    component: () => import('../views/modules/CompositionAPI.vue'),
    meta: {
      title: 'Composition API',
      description: '掌握Vue 3的组合式API和现代开发方式',
      difficulty: 'intermediate',
      prerequisites: ['reactivity'],
      estimatedTime: 50,
      requiresProgress: true
    }
  },
  {
    path: '/router-state',
    name: 'router-state',
    component: () => import('../views/modules/RouterState.vue'),
    meta: {
      title: '路由和状态管理',
      description: '学习Vue Router和Pinia状态管理',
      difficulty: 'intermediate',
      prerequisites: ['components'],
      estimatedTime: 60,
      requiresProgress: true
    }
  },
  {
    path: '/advanced',
    name: 'advanced',
    component: () => import('../views/modules/Advanced.vue'),
    meta: {
      title: '高级特性',
      description: '探索Vue 3的高级功能和最佳实践',
      difficulty: 'advanced',
      prerequisites: ['composition-api'],
      estimatedTime: 70,
      requiresProgress: true
    }
  },
  {
    path: '/project',
    name: 'project',
    component: () => import('../views/modules/Project.vue'),
    meta: {
      title: '项目实战',
      description: '构建完整的Vue 3应用项目',
      difficulty: 'advanced',
      prerequisites: ['router-state', 'advanced'],
      estimatedTime: 120,
      requiresProgress: true
    }
  },
  {
    path: '/progress-demo',
    name: 'progress-demo',
    component: () => import('../views/ProgressDemo.vue'),
    meta: {
      title: 'Progress Tracking Demo',
      description: 'Test and demonstrate progress tracking functionality'
    }
  },
  {
    path: '/code-editor-demo',
    name: 'code-editor-demo',
    component: () => import('../views/CodeEditorDemo.vue'),
    meta: {
      title: '代码编辑器演示',
      description: '演示 Monaco Editor 集成功能'
    }
  },
  {
    path: '/code-preview-demo',
    name: 'code-preview-demo',
    component: () => import('../views/CodePreviewDemo.vue'),
    meta: {
      title: '代码预览演示',
      description: '演示代码预览组件的实时编译和预览功能'
    }
  },
  {
    path: '/code-executor-demo',
    name: 'code-executor-demo',
    component: () => import('../views/CodeExecutorDemo.vue'),
    meta: {
      title: '代码执行环境演示',
      description: '演示安全的代码执行环境和沙箱功能'
    }
  },
  {
    path: '/reactivity-test',
    name: 'reactivity-test',
    component: () => import('../views/modules/ReactivityTest.vue'),
    meta: {
      title: '响应式系统测试',
      description: '测试响应式系统的基本功能'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Vue 3 学习应用`
  }

  // Check prerequisites for learning modules
  if (to.meta.requiresProgress && to.meta.prerequisites) {
    // This will be enhanced when we implement progress tracking
    // For now, allow all navigation
    console.log(`导航到 ${to.meta.title}，前置要求: ${to.meta.prerequisites}`)
  }

  next()
})

router.afterEach((to, from) => {
  // Track navigation for analytics (placeholder)
  console.log(`从 ${String(from.name) || 'unknown'} 导航到 ${String(to.name)}`)
})

export default router
