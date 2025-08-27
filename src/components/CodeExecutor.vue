<template>
    <div class="code-executor">
        <div class="executor-toolbar">
            <div class="executor-info">
                <span class="executor-badge">执行环境</span>
                <span v-if="isExecuting" class="executing-badge">执行中...</span>
                <span v-else-if="hasError" class="error-badge">错误</span>
                <span v-else-if="hasResult" class="success-badge">完成</span>
                <span v-else class="ready-badge">就绪</span>
            </div>
            <div class="executor-actions">
                <button @click="executeCode" class="execute-button" :disabled="!canExecute" title="执行代码 (Ctrl+Enter)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    执行
                </button>
                <button @click="stopExecution" class="stop-button" :disabled="!isExecuting" title="停止执行">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" />
                    </svg>
                    停止
                </button>
                <button @click="resetEnvironment" class="reset-button" title="重置环境">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    重置
                </button>
                <select v-model="selectedExample" @change="loadExample" class="example-selector" title="加载示例">
                    <option value="">选择示例...</option>
                    <option v-for="example in examples" :key="example.id" :value="example.id">
                        {{ example.name }}
                    </option>
                </select>
            </div>
        </div>

        <div class="executor-content">
            <!-- 执行结果区域 -->
            <div class="execution-result">
                <div v-if="isExecuting" class="execution-loading">
                    <div class="loading-spinner"></div>
                    <p>正在执行代码...</p>
                    <div class="execution-progress">
                        <div class="progress-bar" :style="{ width: executionProgress + '%' }"></div>
                    </div>
                </div>

                <div v-else-if="hasError" class="execution-error">
                    <div class="error-icon">⚠️</div>
                    <h3>执行错误</h3>
                    <pre class="error-message">{{ executionError }}</pre>
                    <div class="error-stack" v-if="errorStack">
                        <h4>错误堆栈:</h4>
                        <pre>{{ errorStack }}</pre>
                    </div>
                    <div class="error-suggestions" v-if="errorSuggestions.length">
                        <h4>建议:</h4>
                        <ul>
                            <li v-for="suggestion in errorSuggestions" :key="suggestion">
                                {{ suggestion }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-else-if="hasResult" class="execution-success">
                    <div class="result-header">
                        <h3>执行结果</h3>
                        <div class="execution-metrics">
                            <span class="metric">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                {{ executionMetrics.executionTime }}ms
                            </span>
                            <span class="metric">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                {{ formatBytes(executionMetrics.memoryUsage) }}
                            </span>
                        </div>
                    </div>

                    <div class="result-content">
                        <div v-if="executionResult.output" class="output-section">
                            <h4>输出:</h4>
                            <pre class="output-content">{{ executionResult.output }}</pre>
                        </div>

                        <div v-if="executionResult.returnValue !== undefined" class="return-section">
                            <h4>返回值:</h4>
                            <pre class="return-content">{{ formatValue(executionResult.returnValue) }}</pre>
                        </div>
                    </div>
                </div>

                <div v-else class="execution-ready">
                    <div class="ready-icon">▶️</div>
                    <p>准备执行代码</p>
                    <p class="ready-hint">点击执行按钮或按 Ctrl+Enter 开始</p>
                </div>
            </div>

            <!-- 控制台输出 -->
            <div class="console-output" v-if="consoleLogs.length > 0">
                <div class="console-header">
                    <span class="console-title">控制台输出</span>
                    <button @click="clearConsole" class="console-clear">清空</button>
                </div>
                <div class="console-content" ref="consoleContent">
                    <div v-for="(log, index) in consoleLogs" :key="index" class="console-log"
                        :class="'console-' + log.level">
                        <span class="console-timestamp">{{ formatTime(log.timestamp) }}</span>
                        <span class="console-level">{{ log.level.toUpperCase() }}</span>
                        <span class="console-message">{{ log.message }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type {
    CodeExecutionContext,
    CodeExecutionLog,
    CodeExecutionMetrics,
    ConsoleLog
} from '@/types/editor'

interface CodeExample {
    id: string
    name: string
    description: string
    code: string
    language: string
}

interface Props {
    code: string
    language?: 'javascript' | 'typescript' | 'vue'
    timeout?: number
    memoryLimit?: number
    examples?: CodeExample[]
}

interface Emits {
    (e: 'executed', result: any): void
    (e: 'error', error: string): void
    (e: 'console', log: ConsoleLog): void
    (e: 'reset'): void
    (e: 'load-example', example: CodeExample): void
}

const props = withDefaults(defineProps<Props>(), {
    language: 'javascript',
    timeout: 5000,
    memoryLimit: 50 * 1024 * 1024, // 50MB
    examples: () => []
})

const emit = defineEmits<Emits>()

// 响应式状态
const isExecuting = ref(false)
const executionError = ref('')
const errorStack = ref('')
const executionResult = ref<any>(null)
const executionMetrics = ref<CodeExecutionMetrics>({
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    outputSize: 0,
    errorCount: 0,
    warningCount: 0
})
const consoleLogs = ref<ConsoleLog[]>([])
const consoleContent = ref<HTMLElement>()
const executionProgress = ref(0)
const selectedExample = ref('')

// 执行环境相关
let executionWorker: Worker | null = null
let executionTimeout: number | null = null
let progressInterval: number | null = null

// 计算属性
const hasError = computed(() => !!executionError.value)
const hasResult = computed(() => executionResult.value !== null)
const canExecute = computed(() => !isExecuting.value && props.code.trim().length > 0)

const errorSuggestions = computed(() => {
    if (!executionError.value) return []

    const suggestions: string[] = []
    const error = executionError.value.toLowerCase()

    if (error.includes('syntaxerror')) {
        suggestions.push('检查代码语法，如缺少分号、括号不匹配等')
    }
    if (error.includes('referenceerror')) {
        suggestions.push('检查变量或函数是否已定义')
    }
    if (error.includes('typeerror')) {
        suggestions.push('检查数据类型是否正确')
    }
    if (error.includes('timeout')) {
        suggestions.push('代码执行时间过长，检查是否有无限循环')
    }
    if (error.includes('memory')) {
        suggestions.push('内存使用过多，检查是否有内存泄漏')
    }

    return suggestions
})

// 监听代码变化，清除之前的结果
watch(() => props.code, () => {
    if (hasResult.value || hasError.value) {
        clearResults()
    }
})

// 组件挂载时初始化
onMounted(() => {
    initializeExecutionEnvironment()
})

// 组件卸载时清理
onUnmounted(() => {
    cleanupExecutionEnvironment()
})

// 初始化执行环境
function initializeExecutionEnvironment() {
    // 创建 Web Worker 用于安全执行代码
    try {
        const workerCode = createWorkerCode()
        const blob = new Blob([workerCode], { type: 'application/javascript' })
        const workerUrl = URL.createObjectURL(blob)

        executionWorker = new Worker(workerUrl)
        executionWorker.onmessage = handleWorkerMessage
        executionWorker.onerror = handleWorkerError

        URL.revokeObjectURL(workerUrl)
    } catch (error) {
        console.error('Failed to initialize execution environment:', error)
    }
}

// 清理执行环境
function cleanupExecutionEnvironment() {
    if (executionWorker) {
        executionWorker.terminate()
        executionWorker = null
    }

    if (executionTimeout) {
        clearTimeout(executionTimeout)
        executionTimeout = null
    }

    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }
}

// 创建 Worker 代码
function createWorkerCode(): string {
    return `
    // 安全的代码执行环境
    let executionStartTime = 0;
    let memoryUsage = 0;
    let consoleOutput = [];
    
    // 重写 console 方法来捕获输出
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    };
    
    ['log', 'info', 'warn', 'error'].forEach(method => {
      console[method] = function(...args) {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        consoleOutput.push({
          level: method,
          message: message,
          timestamp: new Date().toISOString()
        });
        
        // 发送控制台消息到主线程
        self.postMessage({
          type: 'console',
          level: method,
          message: message,
          timestamp: new Date().toISOString()
        });
        
        // 调用原始方法
        originalConsole[method](...args);
      };
    });
    
    // 监听主线程消息
    self.onmessage = function(e) {
      const { type, code, language, timeout } = e.data;
      
      if (type === 'execute') {
        executeCode(code, language, timeout);
      } else if (type === 'stop') {
        self.postMessage({ type: 'stopped' });
        self.close();
      }
    };
    
    // 执行代码
    function executeCode(code, language, timeout) {
      executionStartTime = performance.now();
      consoleOutput = [];
      
      try {
        let result;
        let output = '';
        
        // 设置执行超时
        const timeoutId = setTimeout(() => {
          throw new Error('代码执行超时 (' + timeout + 'ms)');
        }, timeout);
        
        // 根据语言类型执行代码
        if (language === 'javascript' || language === 'typescript') {
          // 创建安全的执行环境
          const safeGlobals = {
            console,
            setTimeout: (fn, delay) => setTimeout(fn, Math.min(delay, 1000)),
            setInterval: (fn, delay) => setInterval(fn, Math.max(delay, 100)),
            clearTimeout,
            clearInterval,
            Date,
            Math,
            JSON,
            Array,
            Object,
            String,
            Number,
            Boolean,
            RegExp,
            Promise,
            Map,
            Set,
            WeakMap,
            WeakSet
          };
          
          // 禁用危险的全局对象
          const restrictedGlobals = ['eval', 'Function', 'XMLHttpRequest', 'fetch', 'import'];
          
          // 创建安全的执行函数
          const safeFunction = new Function(
            ...Object.keys(safeGlobals),
            \`
            "use strict";
            \${restrictedGlobals.map(name => \`var \${name} = undefined;\`).join('\\n')}
            
            try {
              \${code}
            } catch (error) {
              throw error;
            }
            \`
          );
          
          result = safeFunction(...Object.values(safeGlobals));
        } else {
          throw new Error('不支持的语言: ' + language);
        }
        
        clearTimeout(timeoutId);
        
        const executionTime = performance.now() - executionStartTime;
        
        // 估算内存使用（简化版本）
        const memoryEstimate = JSON.stringify(consoleOutput).length + 
                              (result ? JSON.stringify(result).length : 0);
        
        self.postMessage({
          type: 'success',
          result: {
            returnValue: result,
            output: consoleOutput.map(log => log.message).join('\\n'),
            consoleOutput: consoleOutput
          },
          metrics: {
            executionTime: Math.round(executionTime),
            memoryUsage: memoryEstimate,
            cpuUsage: 0,
            outputSize: consoleOutput.length,
            errorCount: consoleOutput.filter(log => log.level === 'error').length,
            warningCount: consoleOutput.filter(log => log.level === 'warn').length
          }
        });
        
      } catch (error) {
        const executionTime = performance.now() - executionStartTime;
        
        self.postMessage({
          type: 'error',
          error: error.message,
          stack: error.stack,
          metrics: {
            executionTime: Math.round(executionTime),
            memoryUsage: 0,
            cpuUsage: 0,
            outputSize: consoleOutput.length,
            errorCount: consoleOutput.filter(log => log.level === 'error').length + 1,
            warningCount: consoleOutput.filter(log => log.level === 'warn').length
          }
        });
      }
    }
  `;
}

// 处理 Worker 消息
function handleWorkerMessage(event: MessageEvent) {
    const { type, result, error, stack, metrics, level, message, timestamp } = event.data

    switch (type) {
        case 'success':
            isExecuting.value = false
            executionResult.value = result
            executionMetrics.value = metrics
            emit('executed', result)
            break

        case 'error':
            isExecuting.value = false
            executionError.value = error
            errorStack.value = stack
            executionMetrics.value = metrics
            emit('error', error)
            break

        case 'console':
            const log: ConsoleLog = {
                level: level as 'log' | 'info' | 'warn' | 'error',
                message,
                timestamp: new Date(timestamp)
            }
            consoleLogs.value.push(log)
            emit('console', log)

            // 自动滚动到底部
            nextTick(() => {
                if (consoleContent.value) {
                    consoleContent.value.scrollTop = consoleContent.value.scrollHeight
                }
            })
            break

        case 'stopped':
            isExecuting.value = false
            break
    }

    // 清理进度更新
    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }
    executionProgress.value = 0
}

// 处理 Worker 错误
function handleWorkerError(error: ErrorEvent) {
    isExecuting.value = false
    executionError.value = 'Worker执行错误: ' + error.message
    emit('error', executionError.value)
}

// 执行代码
async function executeCode() {
    if (!canExecute.value || !executionWorker) return

    // 清除之前的结果
    clearResults()

    isExecuting.value = true
    executionProgress.value = 0

    // 启动进度更新
    progressInterval = setInterval(() => {
        if (executionProgress.value < 90) {
            executionProgress.value += Math.random() * 10
        }
    }, 100) as unknown as number

    // 设置执行超时
    executionTimeout = setTimeout(() => {
        stopExecution()
        executionError.value = '代码执行超时'
        isExecuting.value = false
        emit('error', executionError.value)
    }, props.timeout) as unknown as number

    // 发送执行消息到 Worker
    executionWorker.postMessage({
        type: 'execute',
        code: props.code,
        language: props.language,
        timeout: props.timeout
    })
}

// 停止执行
function stopExecution() {
    if (executionWorker && isExecuting.value) {
        executionWorker.postMessage({ type: 'stop' })
    }

    if (executionTimeout) {
        clearTimeout(executionTimeout)
        executionTimeout = null
    }

    if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
    }

    isExecuting.value = false
    executionProgress.value = 0
}

// 重置环境
function resetEnvironment() {
    stopExecution()
    clearResults()
    clearConsole()

    // 重新初始化 Worker
    cleanupExecutionEnvironment()
    initializeExecutionEnvironment()

    emit('reset')
}

// 清除结果
function clearResults() {
    executionResult.value = null
    executionError.value = ''
    errorStack.value = ''
    executionMetrics.value = {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        outputSize: 0,
        errorCount: 0,
        warningCount: 0
    }
}

// 清空控制台
function clearConsole() {
    consoleLogs.value = []
}

// 加载示例
function loadExample() {
    if (!selectedExample.value) return

    const example = props.examples.find(ex => ex.id === selectedExample.value)
    if (example) {
        emit('load-example', example)
        selectedExample.value = ''
    }
}

// 格式化字节数
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化值
function formatValue(value: any): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
}

// 格式化时间
function formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    })
}

// 暴露方法给父组件
defineExpose({
    execute: executeCode,
    stop: stopExecution,
    reset: resetEnvironment,
    clearResults,
    clearConsole,
    isExecuting: () => isExecuting.value,
    hasError: () => hasError.value,
    hasResult: () => hasResult.value
})
</script>
<style scoped>
.code-executor {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.executor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    flex-shrink: 0;
}

.executor-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.executor-badge {
    background: #6f42c1;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.executing-badge {
    background: #fd7e14;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    animation: pulse 1.5s ease-in-out infinite;
}

.error-badge {
    background: #dc3545;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.success-badge {
    background: #28a745;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.ready-badge {
    background: #6c757d;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.executor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.execute-button,
.stop-button,
.reset-button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.execute-button {
    background: #28a745;
    color: white;
}

.execute-button:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
}

.execute-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

.stop-button {
    background: #dc3545;
    color: white;
}

.stop-button:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-1px);
}

.stop-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

.reset-button {
    background: #6c757d;
    color: white;
}

.reset-button:hover {
    background: #5a6268;
    transform: translateY(-1px);
}

.example-selector {
    padding: 4px 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 12px;
    background: white;
    cursor: pointer;
    min-width: 120px;
}

.example-selector:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.executor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.execution-result {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    overflow-y: auto;
}

.execution-loading {
    text-align: center;
    color: #6c757d;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e9ecef;
    border-top: 3px solid #fd7e14;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.execution-progress {
    width: 200px;
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 16px;
}

.progress-bar {
    height: 100%;
    background: #fd7e14;
    border-radius: 2px;
    transition: width 0.3s ease;
}

.execution-error {
    text-align: center;
    color: #dc3545;
    max-width: 600px;
}

.error-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.error-message {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 16px;
    margin: 16px 0;
    text-align: left;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    overflow-x: auto;
    max-height: 200px;
}

.error-stack {
    text-align: left;
    margin-top: 16px;
}

.error-stack h4 {
    margin: 0 0 8px 0;
    color: #495057;
    font-size: 14px;
}

.error-stack pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 12px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    overflow-x: auto;
    max-height: 150px;
}

.error-suggestions {
    text-align: left;
    margin-top: 16px;
}

.error-suggestions h4 {
    margin: 0 0 8px 0;
    color: #495057;
    font-size: 14px;
}

.error-suggestions ul {
    margin: 0;
    padding-left: 20px;
}

.error-suggestions li {
    margin: 4px 0;
    color: #6c757d;
    font-size: 13px;
}

.execution-success {
    width: 100%;
    max-width: 800px;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e9ecef;
}

.result-header h3 {
    margin: 0;
    color: #28a745;
    font-size: 18px;
}

.execution-metrics {
    display: flex;
    gap: 16px;
}

.metric {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6c757d;
}

.metric svg {
    color: #28a745;
}

.result-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.output-section,
.return-section {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 16px;
}

.output-section h4,
.return-section h4 {
    margin: 0 0 8px 0;
    color: #495057;
    font-size: 14px;
}

.output-content,
.return-content {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    white-space: pre-wrap;
    margin: 0;
    color: #212529;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;
}

.execution-ready {
    text-align: center;
    color: #6c757d;
}

.ready-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.ready-hint {
    font-size: 14px;
    color: #adb5bd;
    margin-top: 8px;
}

.console-output {
    border-top: 1px solid #e1e5e9;
    background: #f8f9fa;
    max-height: 200px;
    display: flex;
    flex-direction: column;
}

.console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #e9ecef;
    border-bottom: 1px solid #dee2e6;
    flex-shrink: 0;
}

.console-title {
    font-size: 12px;
    font-weight: 600;
    color: #495057;
}

.console-clear {
    padding: 2px 8px;
    border: none;
    border-radius: 3px;
    background: #6c757d;
    color: white;
    font-size: 11px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.console-clear:hover {
    background: #5a6268;
}

.console-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
}

.console-log {
    display: flex;
    gap: 8px;
    margin: 2px 0;
    padding: 4px 8px;
    border-radius: 3px;
    word-break: break-all;
}

.console-log.console-log {
    background: #ffffff;
    color: #495057;
}

.console-log.console-info {
    background: #e3f2fd;
    color: #1976d2;
}

.console-log.console-warn {
    background: #fff3e0;
    color: #f57c00;
}

.console-log.console-error {
    background: #ffebee;
    color: #d32f2f;
}

.console-timestamp {
    color: #6c757d;
    font-size: 10px;
    flex-shrink: 0;
    min-width: 80px;
}

.console-level {
    font-weight: 600;
    flex-shrink: 0;
    min-width: 40px;
}

.console-message {
    flex: 1;
    white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .executor-toolbar {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }

    .executor-actions {
        justify-content: center;
        flex-wrap: wrap;
    }

    .execution-result {
        padding: 16px;
    }

    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .execution-metrics {
        align-self: stretch;
        justify-content: space-around;
    }
}

@media (max-width: 480px) {
    .executor-actions {
        flex-direction: column;
    }

    .execute-button,
    .stop-button,
    .reset-button,
    .example-selector {
        width: 100%;
        justify-content: center;
    }
}
</style>