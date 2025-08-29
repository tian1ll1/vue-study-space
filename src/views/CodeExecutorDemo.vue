<template>
    <div class="code-executor-demo">
        <div class="demo-header">
            <h1>代码执行环境演示</h1>
            <p>这是一个安全的代码执行环境，支持 JavaScript、TypeScript 和 Vue 代码的实时执行。</p>
        </div>

        <div class="demo-content">
            <div class="editor-section">
                <div class="section-header">
                    <h2>代码编辑器</h2>
                    <div class="editor-controls">
                        <select v-model="currentLanguage" @change="onLanguageChange" class="language-selector">
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="vue">Vue</option>
                        </select>
                        <button @click="formatCode" class="format-button" title="格式化代码">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            格式化
                        </button>
                    </div>
                </div>

                <CodeEditor ref="editorRef" v-model="code" :language="currentLanguage" :height="'400px'"
                    @run="executeCode" @reset="resetCode" />

                <div class="code-validation" v-if="validationResult">
                    <div v-if="validationResult.isValid" class="validation-success">
                        ✅ 代码语法正确
                    </div>
                    <div v-else class="validation-errors">
                        <div class="error-title">❌ 发现语法错误:</div>
                        <ul>
                            <li v-for="error in validationResult.errors" :key="error">{{ error }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="executor-section">
                <div class="section-header">
                    <h2>执行环境</h2>
                    <div class="execution-stats">
                        <span class="stat">
                            <span class="stat-label">总执行次数:</span>
                            <span class="stat-value">{{ totalExecutions }}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-label">成功:</span>
                            <span class="stat-value success">{{ successfulExecutions }}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-label">失败:</span>
                            <span class="stat-value error">{{ failedExecutions }}</span>
                        </span>
                    </div>
                </div>

                <CodeExecutor ref="executorRef" :code="code" :language="currentLanguage" :examples="examples"
                    @executed="onExecuted" @error="onError" @console="onConsole" @reset="onReset"
                    @load-example="onLoadExample" />
            </div>
        </div>

        <div class="demo-features">
            <div class="feature-section">
                <h3>功能特性</h3>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h4>安全沙箱</h4>
                        <p>代码在安全的沙箱环境中执行，防止恶意代码访问系统资源</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h4>实时执行</h4>
                        <p>支持 JavaScript、TypeScript 和 Vue 代码的实时编译和执行</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🐛</div>
                        <h4>错误捕获</h4>
                        <p>自动捕获运行时错误，提供详细的错误信息和修复建议</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h4>性能监控</h4>
                        <p>实时监控代码执行时间、内存使用等性能指标</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h4>控制台输出</h4>
                        <p>完整的控制台支持，包括 log、info、warn、error 等输出</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔄</div>
                        <h4>示例加载</h4>
                        <p>内置丰富的代码示例，支持一键加载和重置</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodeExecutor from '@/components/CodeExecutor.vue'
import { useCodeExecution, type CodeExample } from '@/composables/useCodeExecution'

// 使用代码执行组合式函数
const {
    isExecuting,
    executionResult,
    executionError,
    executionMetrics,
    consoleLogs,
    executionHistory,
    examples,
    hasResult,
    hasError,
    canExecute,
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    executeCode: executeCodeComposable,
    clearResults,
    clearConsole,
    clearHistory,
    reset,
    validateCode,
    formatCode: formatCodeComposable
} = useCodeExecution({
    timeout: 5000,
    memoryLimit: 50 * 1024 * 1024,
    enableConsole: true,
    enableMetrics: true
})

// 组件状态
const editorRef = ref()
const executorRef = ref()
const currentLanguage = ref<'javascript' | 'typescript' | 'vue'>('javascript')
const validationResult = ref<{ isValid: boolean; errors: string[] } | null>(null)

// 代码示例生成函数
function getJavaScriptExample(): string {
    return [
        '// JavaScript 示例',
        'console.log("Hello, JavaScript!");',
        '',
        'const numbers = [1, 2, 3, 4, 5];',
        'const doubled = numbers.map(n => n * 2);',
        '',
        'console.log("原数组:", numbers);',
        'console.log("翻倍后:", doubled);',
        '',
        'return doubled;'
    ].join('\n')
}

function getTypeScriptExample(): string {
    return [
        '// TypeScript 示例',
        'interface User {',
        '  name: string;',
        '  age: number;',
        '}',
        '',
        'const user: User = {',
        '  name: "Vue Developer",',
        '  age: 25',
        '};',
        '',
        'function greetUser(user: User): string {',
        '  return "Hello, " + user.name + "! You are " + user.age + " years old.";',
        '}',
        '',
        'const greeting = greetUser(user);',
        'console.log(greeting);',
        '',
        'return { user, greeting };'
    ].join('\n')
}

function getVueExample(): string {
    const parts = [
        '<template>',
        '  <div class="hello">',
        '    <h1>{{', ' message ', '}}</h1>',
        '    <p>Count: {{', ' count ', '}}</p>',
        '    <button @click="', 'increment', '">Increment</button>',
        '  </div>',
        '</template>',
        '',
        '<script setup lang="ts">',
        'import { ref } from \'vue\';',
        '',
        'const message = ref(\'Hello Vue 3!\');',
        'const count = ref(0);',
        '',
        'function increment() {',
        '  count.value++;',
        '  console.log(\'Count updated:\', count.value);',
        '}',
        '',
        'console.log(\'Vue component initialized\');',
        '</' + 'script>'
    ]

    return parts.join('\n')
}

// 初始化代码
const code = ref(getJavaScriptExample())

// 监听代码变化，进行实时验证
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(code, (newCode) => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        if (newCode.trim()) {
            validationResult.value = validateCode(newCode, currentLanguage.value)
        } else {
            validationResult.value = null
        }
    }, 500)
})

// 监听语言变化
watch(currentLanguage, (newLanguage) => {
    if (code.value.trim()) {
        validationResult.value = validateCode(code.value, newLanguage)
    }
})

// 组件挂载时的初始化
onMounted(() => {
    // 初始验证
    if (code.value.trim()) {
        validationResult.value = validateCode(code.value, currentLanguage.value)
    }
})

// 事件处理函数
async function executeCode() {
    if (!canExecute.value) return

    try {
        await executeCodeComposable(code.value, currentLanguage.value)
    } catch (error) {
        console.error('执行失败:', error)
    }
}

function onLanguageChange() {
    // 根据语言切换示例代码
    switch (currentLanguage.value) {
        case 'javascript':
            code.value = getJavaScriptExample()
            break
        case 'typescript':
            code.value = getTypeScriptExample()
            break
        case 'vue':
            code.value = getVueExample()
            break
    }
}

function formatCode() {
    const formatted = formatCodeComposable(code.value)
    code.value = formatted
}

function resetCode() {
    onLanguageChange()
    clearResults()
}

function loadExample(example: CodeExample) {
    code.value = example.code
    currentLanguage.value = example.language as 'javascript' | 'typescript' | 'vue'
}

function onExecuted(result: any) {
    console.log('代码执行成功:', result)
}

function onError(error: string) {
    console.error('代码执行失败:', error)
}

function onConsole(log: any) {
    console.log('控制台输出:', log)
}

function onReset() {
    reset()
}

function onLoadExample(example: CodeExample) {
    loadExample(example)
}
</script>
<style sc oped>
.code-executor-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.demo-header {
    text-align: center;
    margin-bottom: 32px;
}

.demo-header h1 {
    color: #2c3e50;
    margin-bottom: 16px;
    font-size: 2.5rem;
    font-weight: 700;
}

.demo-header p {
    color: #6c757d;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
}

.demo-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 48px;
}

.editor-section,
.executor-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.25rem;
    font-weight: 600;
}

.editor-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.language-selector {
    padding: 6px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
}

.language-selector:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.format-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: #007acc;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.format-button:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.execution-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
}

.stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.stat-label {
    color: #6c757d;
    font-size: 12px;
}

.stat-value {
    font-weight: 600;
    color: #2c3e50;
}

.stat-value.success {
    color: #28a745;
}

.stat-value.error {
    color: #dc3545;
}

.code-validation {
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
}

.validation-success {
    color: #28a745;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.validation-errors {
    color: #dc3545;
    font-size: 14px;
}

.error-title {
    margin-bottom: 8px;
    font-weight: 600;
}

.validation-errors ul {
    margin: 0;
    padding-left: 20px;
}

.validation-errors li {
    margin: 4px 0;
}

.demo-features {
    margin-top: 48px;
}

.feature-section h3 {
    color: #2c3e50;
    margin-bottom: 24px;
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.feature-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
}

.feature-card h4 {
    color: #2c3e50;
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    font-weight: 600;
}

.feature-card p {
    color: #6c757d;
    margin: 0;
    line-height: 1.5;
    font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .demo-content {
        grid-template-columns: 1fr;
    }

    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}

@media (max-width: 768px) {
    .code-executor-demo {
        padding: 16px;
    }

    .demo-header h1 {
        font-size: 2rem;
    }

    .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }

    .editor-controls {
        justify-content: center;
    }

    .execution-stats {
        justify-content: space-around;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .demo-header h1 {
        font-size: 1.75rem;
    }

    .demo-header p {
        font-size: 1rem;
    }

    .feature-card {
        padding: 20px 16px;
    }
}
</style>