<template>
    <div class="progress-tracker" :class="{ compact }">
        <div v-if="!compact" class="progress-header">
            <h3>学习进度</h3>
            <div class="progress-stats">
                <span class="stat">
                    <strong>{{ progressPercentage }}%</strong> 完成
                </span>
                <span class="stat">
                    <strong>{{ completedModulesCount }}</strong> 模块
                </span>
                <span class="stat">
                    <strong>{{ totalExercisesCompleted }}</strong> 练习
                </span>
            </div>
        </div>

        <div class="progress-bar-container">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
            </div>
            <span v-if="compact" class="progress-text">{{ progressPercentage }}%</span>
        </div>

        <div v-if="showDetails && !compact" class="progress-details">
            <div class="detail-section">
                <h4>学习统计</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="label">平均分数</span>
                        <span class="value">{{ averageScore }}分</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">学习时长</span>
                        <span class="value">{{ formatTime(totalTimeSpent) }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">连续天数</span>
                        <span class="value">{{ learningStreak.currentStreak }}天</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">最长连续</span>
                        <span class="value">{{ learningStreak.longestStreak }}天</span>
                    </div>
                </div>
            </div>

            <div v-if="moduleId" class="module-progress">
                <h4>当前模块进度</h4>
                <div class="module-exercises">
                    <div v-for="exercise in moduleExercises" :key="exercise.exerciseId" class="exercise-item"
                        :class="{ completed: exercise.completed }">
                        <div class="exercise-info">
                            <span class="exercise-name">练习 {{ exercise.exerciseId }}</span>
                            <span v-if="exercise.completed" class="exercise-score">
                                {{ exercise.bestScore }}分
                            </span>
                        </div>
                        <div class="exercise-status">
                            <span v-if="exercise.completed" class="status-icon completed">✓</span>
                            <span v-else class="status-icon pending">○</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="skill-assessment">
                <h4>技能评估</h4>
                <div class="skills-list">
                    <div v-for="skill in skillAssessment" :key="skill.skill" class="skill-item">
                        <span class="skill-name">{{ skill.skill }}</span>
                        <div class="skill-level">
                            <span class="level-text">{{ getLevelText(skill.level) }}</span>
                            <div class="confidence-bar">
                                <div class="confidence-fill" :style="{ width: `${skill.confidence * 10}%` }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="learning-analytics">
                <h4>学习分析</h4>
                <div class="analytics-summary">
                    <div v-if="analytics.strongAreas.length > 0" class="strong-areas">
                        <span class="label">擅长领域:</span>
                        <span class="areas">{{ analytics.strongAreas.join(', ') }}</span>
                    </div>
                    <div v-if="analytics.improvementAreas.length > 0" class="improvement-areas">
                        <span class="label">需要改进:</span>
                        <span class="areas">{{ analytics.improvementAreas.join(', ') }}</span>
                    </div>
                    <div class="learning-velocity">
                        <span class="label">学习速度:</span>
                        <span class="value">{{ analytics.learningVelocity }} 练习/小时</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!compact" class="progress-actions">
            <button @click="toggleDetails" class="btn-secondary">
                {{ showDetails ? '隐藏详情' : '显示详情' }}
            </button>
            <button @click="resetProgress" class="btn-danger" v-if="showDetails">
                重置进度
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useProgress } from '@/composables/useProgress'
import type { ProgressTrackerProps } from '@/types'

const props = withDefaults(defineProps<ProgressTrackerProps>(), {
    showDetails: false,
    compact: false
})

const showDetailsLocal = ref(props.showDetails)

const {
    progressPercentage,
    completedModulesCount,
    totalExercisesCompleted,
    averageScore,
    totalTimeSpent,
    learningStreak,
    getLearningAnalytics,
    getSkillAssessment,
    getExerciseProgress,
    resetProgress: resetProgressStore,
    initializeProgress
} = useProgress()

const analytics = computed(() => getLearningAnalytics())
const skillAssessment = computed(() => getSkillAssessment())

const moduleExercises = computed(() => {
    if (!props.moduleId) return []

    // Mock exercise IDs for the module - in real app this would come from exercises store
    const exerciseIds = [
        `${props.moduleId}-exercise-1`,
        `${props.moduleId}-exercise-2`,
        `${props.moduleId}-exercise-3`
    ]

    return exerciseIds.map(id => getExerciseProgress(id))
})

const showDetails = computed({
    get: () => showDetailsLocal.value,
    set: (value) => { showDetailsLocal.value = value }
})

function toggleDetails() {
    showDetails.value = !showDetails.value
}

function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
        resetProgressStore()
    }
}

function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
        return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
}

function getLevelText(level: string): string {
    const levelMap = {
        'novice': '新手',
        'beginner': '初学者',
        'intermediate': '中级',
        'advanced': '高级',
        'expert': '专家'
    }
    return levelMap[level as keyof typeof levelMap] || level
}

onMounted(() => {
    initializeProgress()
})
</script>

<style scoped>
.progress-tracker {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
}

.progress-tracker.compact {
    padding: 1rem;
}

.progress-header {
    margin-bottom: 1rem;
}

.progress-header h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1.25rem;
}

.progress-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.stat {
    color: #6b7280;
    font-size: 0.875rem;
}

.progress-bar-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s ease;
}

.progress-text {
    font-weight: 600;
    color: #059669;
    min-width: 3rem;
    text-align: right;
}

.progress-details {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
    margin-top: 1rem;
}

.detail-section {
    margin-bottom: 1.5rem;
}

.detail-section h4 {
    margin: 0 0 0.75rem 0;
    color: #374151;
    font-size: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 6px;
}

.stat-item .label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.stat-item .value {
    font-weight: 600;
    color: #1f2937;
}

.module-exercises {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.exercise-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 4px;
    border-left: 3px solid #d1d5db;
}

.exercise-item.completed {
    border-left-color: #10b981;
    background: #f0fdf4;
}

.exercise-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.exercise-name {
    font-size: 0.875rem;
    color: #374151;
}

.exercise-score {
    font-size: 0.75rem;
    color: #059669;
    font-weight: 600;
}

.status-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
}

.status-icon.completed {
    background: #10b981;
    color: white;
}

.status-icon.pending {
    background: #d1d5db;
    color: #6b7280;
}

.skills-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.skill-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skill-name {
    font-weight: 500;
    color: #374151;
}

.skill-level {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.level-text {
    font-size: 0.875rem;
    color: #6b7280;
    min-width: 4rem;
    text-align: right;
}

.confidence-bar {
    width: 60px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.confidence-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
}

.analytics-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.strong-areas,
.improvement-areas,
.learning-velocity {
    display: flex;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.strong-areas .label,
.improvement-areas .label,
.learning-velocity .label {
    color: #6b7280;
    min-width: 5rem;
}

.strong-areas .areas {
    color: #059669;
}

.improvement-areas .areas {
    color: #dc2626;
}

.learning-velocity .value {
    color: #3b82f6;
}

.progress-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-danger {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.btn-danger {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

.btn-danger:hover {
    background: #fee2e2;
}

@media (max-width: 640px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .progress-actions {
        flex-direction: column;
    }
}
</style>