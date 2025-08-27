<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { learningModules } from '../router'
import ModuleCard from '../components/ModuleCard.vue'

// Component name for ESLint multi-word rule
defineOptions({
  name: 'HomePage'
})

// Group modules by difficulty
const modulesByDifficulty = computed(() => {
  const grouped = {
    beginner: learningModules.filter(m => m.difficulty === 'beginner'),
    intermediate: learningModules.filter(m => m.difficulty === 'intermediate'),
    advanced: learningModules.filter(m => m.difficulty === 'advanced')
  }
  return grouped
})

const totalModules = computed(() => learningModules.length)
const totalEstimatedTime = computed(() =>
  learningModules.reduce((total, module) => total + module.estimatedTime, 0)
)

const getDifficultyTitle = (difficulty: string) => {
  const titles = {
    beginner: '初级模块',
    intermediate: '中级模块',
    advanced: '高级模块'
  }
  return titles[difficulty as keyof typeof titles] || difficulty
}

const getDifficultyDescription = (difficulty: string) => {
  const descriptions = {
    beginner: '适合Vue 3入门，建议按顺序学习',
    intermediate: '需要掌握基础概念后学习',
    advanced: '深入Vue 3高级特性和实战应用'
  }
  return descriptions[difficulty as keyof typeof descriptions] || ''
}
</script>

<template>
  <div class="home">
    <header class="hero">
      <h1>Vue 3 学习中心</h1>
      <p class="hero-subtitle">专为有Angular和React基础的开发者设计的Vue 3学习平台</p>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalModules }}</span>
          <span class="stat-label">学习模块</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ Math.round(totalEstimatedTime / 60) }}</span>
          <span class="stat-label">小时内容</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">3</span>
          <span class="stat-label">难度等级</span>
        </div>
      </div>
    </header>

    <main class="content">
      <!-- Learning Path Overview -->
      <section class="learning-path">
        <h2>学习路径</h2>
        <p>按照从基础到高级的顺序，逐步掌握Vue 3的核心概念和实战技能</p>
      </section>

      <!-- Module Sections by Difficulty -->
      <div v-for="(modules, difficulty) in modulesByDifficulty" :key="difficulty" class="difficulty-section">
        <div class="section-header">
          <h3 class="section-title">{{ getDifficultyTitle(difficulty) }}</h3>
          <p class="section-description">{{ getDifficultyDescription(difficulty) }}</p>
        </div>

        <div class="module-grid">
          <ModuleCard v-for="module in modules" :key="module.name" :module="module" />
        </div>
      </div>

      <!-- Quick Start Guide -->
      <section class="quick-start">
        <h2>快速开始</h2>
        <div class="quick-start-content">
          <div class="quick-start-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>从基础语法开始</h4>
              <p>如果你是Vue新手，建议从基础语法模块开始学习</p>
              <RouterLink to="/basic-syntax" class="start-button">开始学习</RouterLink>
            </div>
          </div>

          <div class="quick-start-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>实践中学习</h4>
              <p>每个模块都包含交互式示例和练习，边学边练</p>
            </div>
          </div>

          <div class="quick-start-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>对比学习</h4>
              <p>利用你的React/Angular经验，快速理解Vue概念</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  padding: 0;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Content */
.content {
  padding: 0 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Learning Path */
.learning-path {
  text-align: center;
  margin-bottom: 3rem;
}

.learning-path h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.learning-path p {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* Difficulty Sections */
.difficulty-section {
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #666;
  margin: 0;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Quick Start */
.quick-start {
  background: #f8f9fa;
  padding: 3rem 2rem;
  border-radius: 12px;
  margin-top: 4rem;
}

.quick-start h2 {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.quick-start-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.quick-start-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.step-content p {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.6;
}

.start-button {
  display: inline-block;
  background: #42b883;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.start-button:hover {
  background: #369870;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .stats {
    gap: 2rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .content {
    padding: 0 1rem 2rem;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .quick-start {
    padding: 2rem 1rem;
  }

  .quick-start-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats {
    flex-direction: column;
    gap: 1rem;
  }

  .quick-start-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
