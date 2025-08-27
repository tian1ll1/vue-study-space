<template>
  <RouterLink :to="module.path" class="module-card" :class="cardClasses">
    <div class="card-header">
      <h3 class="card-title">{{ module.title }}</h3>
      <div class="card-badges">
        <span class="difficulty-badge" :class="`difficulty-${module.difficulty}`">
          {{ getDifficultyText(module.difficulty) }}
        </span>
      </div>
    </div>
    
    <p class="card-description">{{ module.description }}</p>
    
    <div class="card-meta">
      <div class="time-estimate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
        </svg>
        {{ module.estimatedTime }} 分钟
      </div>
      
      <div v-if="hasPrerequisites" class="prerequisites">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
        </svg>
        需要: {{ prerequisiteNames.join(', ') }}
      </div>
    </div>
    
    <!-- Progress indicator (placeholder for future implementation) -->
    <div class="progress-indicator">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <span class="progress-text">{{ progressText }}</span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { learningModules } from '../router'
import type { LearningModule } from '../types/router'

interface Props {
  module: LearningModule
}

const props = defineProps<Props>()

const hasPrerequisites = computed(() => 
  props.module.prerequisites && props.module.prerequisites.length > 0
)

const prerequisiteNames = computed(() => {
  if (!props.module.prerequisites) return []
  
  return props.module.prerequisites.map(prereq => {
    const module = learningModules.find(m => m.name === prereq)
    return module?.title || prereq
  })
})

const cardClasses = computed(() => ({
  [`difficulty-${props.module.difficulty}`]: true,
  'has-prerequisites': hasPrerequisites.value,
  'completed': isCompleted.value
}))

// Placeholder for progress tracking (will be implemented with progress store)
const progressPercentage = computed(() => {
  // TODO: Get actual progress from store
  return 0
})

const isCompleted = computed(() => progressPercentage.value === 100)

const progressText = computed(() => {
  if (isCompleted.value) return '已完成'
  if (progressPercentage.value > 0) return `进度 ${progressPercentage.value}%`
  return '未开始'
})

const getDifficultyText = (difficulty: string) => {
  const difficultyMap = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty
}
</script>

<style scoped>
.module-card {
  display: block;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.module-card.completed {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #f0fff4 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

.card-badges {
  display: flex;
  gap: 0.5rem;
}

.difficulty-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
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

.card-description {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-estimate,
.prerequisites {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.time-estimate svg,
.prerequisites svg {
  opacity: 0.7;
}

.progress-indicator {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.module-card.completed .progress-fill {
  background: linear-gradient(90deg, #28a745, #1e7e34);
}

.progress-text {
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
}

.module-card.completed .progress-text {
  color: #28a745;
}

/* Difficulty-specific hover effects */
.module-card.difficulty-beginner:hover {
  border-color: #28a745;
}

.module-card.difficulty-intermediate:hover {
  border-color: #ffc107;
}

.module-card.difficulty-advanced:hover {
  border-color: #dc3545;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-badges {
    align-self: flex-start;
  }

  .card-meta {
    gap: 0.25rem;
  }

  .time-estimate,
  .prerequisites {
    font-size: 0.8rem;
  }
}
</style>