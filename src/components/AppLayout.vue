<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <h1>Vue 3 学习中心</h1>
          </router-link>
        </div>

        <!-- Mobile menu toggle -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <div class="main-container">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
        <nav class="navigation">
          <div class="nav-section">
            <h3 class="nav-title">学习模块</h3>
            <ul class="nav-list">
              <li v-for="module in learningModules" :key="module.name" class="nav-item">
                <router-link :to="module.path" class="nav-link" :class="{
                  'disabled': isModuleDisabled(module),
                  [`difficulty-${module.difficulty}`]: true
                }" @click="closeMobileMenu">
                  <div class="nav-link-content">
                    <span class="nav-link-title">{{ module.title }}</span>
                    <span class="nav-link-meta">
                      <span class="difficulty-badge" :class="`difficulty-${module.difficulty}`">
                        {{ getDifficultyText(module.difficulty) }}
                      </span>
                      <span class="time-estimate">{{ module.estimatedTime }}分钟</span>
                    </span>
                  </div>
                  <div v-if="module.prerequisites?.length" class="prerequisites">
                    前置: {{ getPrerequisiteNames(module.prerequisites).join(', ') }}
                  </div>
                </router-link>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <h3 class="nav-title">组件演示</h3>
            <ul class="nav-list">
              <li class="nav-item">
                <router-link to="/code-editor-demo" class="nav-link" @click="closeMobileMenu">
                  <div class="nav-link-content">
                    <span class="nav-link-title">代码编辑器</span>
                    <span class="demo-badge">演示</span>
                  </div>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/code-preview-demo" class="nav-link" @click="closeMobileMenu">
                  <div class="nav-link-content">
                    <span class="nav-link-title">代码预览</span>
                    <span class="demo-badge">演示</span>
                  </div>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/code-executor-demo" class="nav-link" @click="closeMobileMenu">
                  <div class="nav-link-content">
                    <span class="nav-link-title">代码执行环境</span>
                    <span class="demo-badge">演示</span>
                  </div>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/progress-demo" class="nav-link" @click="closeMobileMenu">
                  <div class="nav-link-content">
                    <span class="nav-link-title">进度跟踪</span>
                    <span class="demo-badge">演示</span>
                  </div>
                </router-link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <div class="content-wrapper">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile overlay -->
    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { learningModules } from '../router'
import type { LearningModule } from '../types/router'

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isModuleDisabled = (learningModule: LearningModule) => {
  // TODO: Implement actual progress checking when progress store is available
  return false
}

const getDifficultyText = (difficulty: string) => {
  const difficultyMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty
}

const getPrerequisiteNames = (prerequisites: string[]) => {
  return prerequisites.map(prereq => {
    const foundModule = learningModules.find(m => m.name === prereq)
    return foundModule?.title || prereq
  })
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: 0.3s;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* Main Container */
.main-container {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}

.navigation {
  position: sticky;
  top: 1rem;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: block;
  padding: 0.75rem;
  text-decoration: none;
  color: #495057;
  border-radius: 0.375rem;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.nav-link.router-link-active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.nav-link.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-link-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.nav-link-title {
  font-weight: 500;
}

.nav-link-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.difficulty-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.difficulty-beginner {
  background: #d4edda;
  color: #155724;
}

.difficulty-intermediate {
  background: #fff3cd;
  color: #856404;
}

.difficulty-advanced {
  background: #f8d7da;
  color: #721c24;
}

.time-estimate {
  font-size: 0.75rem;
  color: #6c757d;
}

.demo-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
}

.prerequisites {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* Content */
.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 800px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .sidebar {
    position: fixed;
    top: 60px;
    left: -300px;
    height: calc(100vh - 60px);
    z-index: 200;
    transition: left 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .mobile-overlay {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
  }

  .content {
    padding: 1rem;
  }

  .main-container {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 0.5rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .content {
    padding: 0.5rem;
  }

  .nav-link-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-link-meta {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>