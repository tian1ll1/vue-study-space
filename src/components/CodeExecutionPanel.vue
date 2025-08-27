<template>
    <div class="code-execution-panel">
        <div class="execution-toolbar">
            <div class="execution-info">
                <span class="status-badge" :class="statusClass">
                    {{ statusText }}
                </span>
                <span v-if="executionTime" class="execution-time">
                    执行时间: {{ executionTime }}ms
                </span>
            </div>
            <div class="execution-actions">
                <button @click="executeCode" class="execute-button" :disabled="!canExecute">
                    <span v-if="isExecuting">执行中...</span>
                    <span v-else>执行代码</span>
                </button>
                <button @click="clearResults" class="clear-button">
                    清空结果
                </button>
                <button @click="showHistory = !showHistory" class="history-button">
                    历史记录 ({{ executionStats.totalExecutions }})
                </button>
            </div>
        </div>

        <!-- 代码验证警告 -->
        <div v-if="codeValidation && !codeValidation.isValid" class="validation-panel">
            <h4>代码验证</h4>
            <div v-if="codeValidation.errors.length > 0" class="validation-errors">
                <h5>错误:</h5>
                <ul>
                    <li v-for="error in codeValidation.errors" :key="error">{{ error }}</li>
                </ul>
            </div>
            <div v-if="codeValidation.warnings.length > 0" class="validation-warnings">
                <h5>警告:</h5>
                <ul>
                    <li v-for="warning in codeValidation.warnings" :key="warning">{{ warning }}</li>
                </ul>
            </div>
        </div>

        <!-- 性能分析 -->
        <div v-if="performanceAnalysis && performanceAnalysis.suggestions.length > 0" class="performance-panel">
            <h4>性能分析 (复杂度: {{ performanceAnalysis.complexity }})</h4>
            <ul>
                <li v-for="suggestion in performanceAnalysis.suggestions" :key="suggestion">
                    {{ suggestion }}
                </li>
            </ul>
        </div>

        <!-- 执行结果 -->
        <div v-if="hasResult" class="execution-results">
            <div class="results-header">
                <h3>执行结果</h3>
                <div class="result-meta">
                    <span>耗时: {{ executionResult?.executionTime }}ms</span>
                    <span>状态: {{ executionResult?.success ? '成功' : '失败' }}</span>
                </div>
            </div>

            <!-- 错误信息 -->
            <div v-if="hasError" class="error-section">
                <h4>错误信息</h4>
                <pre class="error-message">{{ executionResult?.error }}</pre>
            </div>

            <!-- 控制台输出 -->
            <div v-if="hasOutput" class="output-section">
                <h4>控制台输出</h4>
                <div class="console-output">
                    <div v-for="(output, index) in executionResult?.output" :key="index" class="console-line"
                        :class="`console-${output.type}`">
                        <span class="console-timestamp">{{ formatTime(output.timestamp) }}</span>
                        <span class="console-type">{{ output.type.toUpperCase() }}</span>
                        <span class="console-content">{{ formatOutput(output.args) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 执行历史 -->
        <div v-if="showHistory" class="history-panel">
            <div class="history-header">
                <h3>执行历史</h3>
                <div class="history-stats">
                    <span>总计: {{ executionStats.totalExecutions }}</span>
                    <span>成功: {{ executionStats.successfulExecutions }}</span>
                    <span>失败: {{ executionStats.failedExecutions }}</span>
                    <span>平均耗时: {{ Math.round(executionStats.averageExecutionTime) }}ms</span>
                </div>
                <button @click="clearHistory" class="clear-history-button">清空历史</button>
            </div>

            <div class="history-list">
                <div v-for="(result, index) in recentResults" :key="index" class="history-item"
                    :class="{ 'history-success': result.success, 'history-error': !result.success }"
                    @click="selectHistoryItem(result)">
                    <div class="history-meta">
                        <span class="history-index">#{{ executionHistory.length - index }}</span>
                        <span class="history-time">{{ formatTime(new Date()) }}</span>
                        <span class="history-duration">{{ result.executionTime }}ms</span>
                    </div>
                    <div class="history-status">
                        {{ result.success ? '成功' : '失败' }}
                        <span v-if="!result.success" class="history-error-preview">
                            {{ result.error?.substring(0, 50) }}...
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 代码示例 -->
        <div v-if="showExamples" class="examples-panel">
            <div class="examples-header">
                <h3>代码示例</h3>
                <button @click="showExamples = false" class="close-examples">关闭</button>
            </div>

            <div class="examples-grid">
                <div v-for="(example, key) in availableExamples" :key="key" class="example-card"
                    @click="loadExample(example)">
                    <h4>{{ example.title }}</h4>
                    <p>{{ example.description }}</p>
                    <div class="example-preview">
                        <code>{{ example.code.substring(0, 100) }}...</code>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="bottom-actions">
            <button @click="showExamples = !showExamples" class="examples-button">
                {{ showExamples ? '隐藏' : '显示' }}示例
            </button>
            <button @click="analyzeCode" class="analyze-button">
                性能分析
            </button>
            <button @click="validateCurrentCode" class="validate-button">
                验证代码
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCodeExecution, codeExamples } from '@/composables/useCodeExecution'
import type { ExecutionResult } from '@/utils/codeExecutor'

interface Props {
    code: string
    language?: 'javascript' | 'vue'
    autoExecute?: boolean
    showValidation?: boolean
    showPerformanceAnalysis?: boolean
}

interface Emits {
    (e: 'executed', result: ExecutionResult): void
    (e: 'error', error: string): void
    (e: 'load-example', code: string): void
}

const props = withDefaults(defineProps<Props>(), {
    language: 'javascript',
    autoExecute: false,
    showValidation: true,
    showPerformanceAnalysis: true
})

const emit = defineEmits<Emits>()

// 使用代码执行组合式函数
const {
    isExecuting,
    executionResult,
    executionHistory,
    hasResult,
    hasError,
    hasOutput,
    canExecute,
    executionStats,
    executeCode: execCode,
    executeVueCode,
    clearResults,
    clearHistory,
    getRecentResults,
    validateCode,
    analyzePerformance
} = useCodeExecution({
    executorType: props.language,
    autoExecute: props.autoExecute
})

// 本地状态
const showHistory = ref(false)
const showExamples = ref(false)
const codeValidation = ref<ReturnType<typeof validateCode> | null>(null)
const performanceAnalysis = ref<ReturnType<typeof analyzePerformance> | null>(null)

// 计算属性
const statusClass = computed(() => {
    if (hasError.value) return 'error'
    if (isExecuting.value) return 'executing'
    if (hasResult.value) return 'success'
    return 'idle'
})

const statusText = computed(() => {
    if (hasError.value) return '执行失败'
    if (isExecuting.value) return '执行中...'
    if (hasResult.value) return '执行成功'
    return '待执行'
})

const executionTime = computed(() => executionResult.value?.executionTime || 0)

const recentResults = computed(() => getRecentResults(10))

const availableExamples = computed(() => {
    const examples = codeExamples[props.language] || {}
    return Object.entries(examples).map(([key, code]) => ({
        key,
        title: getExampleTitle(key),
        description: getExampleDescription(key),
        code
    }))
})

// 监听代码变化
watch(() => props.code, (newCode) => {
    if (props.showValidation) {
        codeValidation.value = validateCode(newCode)
    }

    if (props.showPerformanceAnalysis) {
        performanceAnalysis.value = analyzePerformance(newCode)
    }
}, { immediate: true })

// 方法
async function executeCode() {
    try {
        const result = props.language === 'vue'
            ? await executeVueCode(props.code)
            : await execCode(props.code)

        emit('executed', result)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        emit('error', errorMessage)
    }
}

function validateCurrentCode() {
    codeValidation.value = validateCode(props.code)
}

function analyzeCode() {
    performanceAnalysis.value = analyzePerformance(props.code)
}

function selectHistoryItem(result: ExecutionResult) {
    // 可以在这里实现选择历史项的逻辑
    console.log('Selected history item:', result)
}

function loadExample(example: { code: string }) {
    emit('load-example', example.code)
    showExamples.value = false
}

function formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString()
}

function formatOutput(args: any[]): string {
    return args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2)
            } catch {
                return String(arg)
            }
        }
        return String(arg)
    }).join(' ')
}

function getExampleTitle(key: string): string {
    const titles: Record<string, string> = {
        basic: '基础示例',
        advanced: '高级功能',
        algorithms: '算法演示',
        reactive: '响应式系统'
    }
    return titles[key] || key
}

function getExampleDescription(key: string): string {
    const descriptions: Record<string, string> = {
        basic: '基础语法和常用功能演示',
        advanced: '高级特性和复杂逻辑示例',
        algorithms: '常见算法实现',
        reactive: 'Vue 3 响应式系统演示'
    }
    return descriptions[key] || '代码示例'
}

// 暴露方法给父组件
defineExpose({
    execute: executeCode,
    clear: clearResults,
    validate: validateCurrentCode,
    analyze: analyzeCode
})
</script>

<style scoped>
.code-execution-panel {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    background: white;
}

.execution-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
}

.execution-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.idle {
    background: #6c757d;
    color: white;
}

.status-badge.executing {
    background: #ffc107;
    color: #212529;
}

.status-badge.success {
    background: #28a745;
    color: white;
}

.status-badge.error {
    background: #dc3545;
    color: white;
}

.execution-time {
    font-size: 12px;
    color: #6c757d;
}

.execution-actions {
    display: flex;
    gap: 8px;
}

.execute-button,
.clear-button,
.history-button {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.execute-button {
    background: #28a745;
    color: white;
}

.execute-button:hover:not(:disabled) {
    background: #218838;
}

.execute-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.clear-button,
.history-button {
    background: #6c757d;
    color: white;
}

.clear-button:hover,
.history-button:hover {
    background: #5a6268;
}

.validation-panel,
.performance-panel {
    padding: 15px;
    border-bottom: 1px solid #e1e5e9;
}

.validation-panel {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
}

.performance-panel {
    background: #d1ecf1;
    border-left: 4px solid #17a2b8;
}

.validation-errors ul,
.validation-warnings ul,
.performance-panel ul {
    margin: 8px 0 0 20px;
    padding: 0;
}

.validation-errors {
    color: #721c24;
}

.validation-warnings {
    color: #856404;
}

.execution-results {
    padding: 15px;
}

.results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.result-meta {
    display: flex;
    gap: 15px;
    font-size: 14px;
    color: #6c757d;
}

.error-section {
    margin-bottom: 20px;
}

.error-message {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    padding: 10px;
    color: #721c24;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    margin: 0;
}

.console-output {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 13px;
}

.console-line {
    display: flex;
    gap: 10px;
    padding: 4px 10px;
    border-bottom: 1px solid #e9ecef;
}

.console-line:hover {
    background: #f1f3f4;
}

.console-timestamp {
    color: #6c757d;
    min-width: 80px;
}

.console-type {
    min-width: 50px;
    font-weight: 500;
}

.console-log .console-type {
    color: #28a745;
}

.console-info .console-type {
    color: #17a2b8;
}

.console-warn .console-type {
    color: #ffc107;
}

.console-error .console-type {
    color: #dc3545;
}

.console-content {
    flex: 1;
    white-space: pre-wrap;
}

.history-panel,
.examples-panel {
    border-top: 1px solid #e1e5e9;
    background: #f8f9fa;
}

.history-header,
.examples-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #e1e5e9;
}

.history-stats {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #6c757d;
}

.clear-history-button,
.close-examples {
    background: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}

.history-list {
    max-height: 200px;
    overflow-y: auto;
}

.history-item {
    padding: 8px 15px;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: background-color 0.2s;
}

.history-item:hover {
    background: #e9ecef;
}

.history-success {
    border-left: 3px solid #28a745;
}

.history-error {
    border-left: 3px solid #dc3545;
}

.history-meta {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: #6c757d;
    margin-bottom: 4px;
}

.history-error-preview {
    font-size: 11px;
    color: #dc3545;
}

.examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    padding: 15px;
}

.example-card {
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 4px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s;
}

.example-card:hover {
    border-color: #007bff;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.example-preview {
    margin-top: 10px;
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #6c757d;
}

.bottom-actions {
    display: flex;
    gap: 8px;
    padding: 10px 15px;
    background: #f8f9fa;
    border-top: 1px solid #e1e5e9;
}

.examples-button,
.analyze-button,
.validate-button {
    padding: 6px 12px;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.examples-button:hover,
.analyze-button:hover,
.validate-button:hover {
    background: #007bff;
    color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .execution-toolbar {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }

    .execution-actions {
        justify-content: center;
    }

    .results-header {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }

    .history-header,
    .examples-header {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }

    .examples-grid {
        grid-template-columns: 1fr;
    }

    .bottom-actions {
        flex-direction: column;
    }
}
</style>