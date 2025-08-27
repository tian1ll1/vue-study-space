<template>
    <div class="code-preview-demo">
        <div class="demo-header">
            <h1>代码预览组件演示</h1>
            <p>这个页面演示了 CodePreview 组件的功能，包括实时编译、错误处理和安全沙箱机制。</p>
        </div>

        <div class="demo-content">
            <div class="editor-section">
                <div class="section-header">
                    <h2>代码编辑器</h2>
                    <div class="controls">
                        <select v-model="selectedLanguage" @change="onLanguageChange">
                            <option value="vue">Vue</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                        </select>
                        <button @click="clearCode" class="clear-btn">清空</button>
                    </div>
                </div>

                <CodeEditor v-model="code" :language="selectedLanguage" :height="'400px'" @change="onCodeChange" />
            </div>

            <div class="preview-section">
                <div class="section-header">
                    <h2>实时预览</h2>
                    <div class="preview-stats">
                        <span class="stat">行数: {{ codeStats.lines }}</span>
                        <span class="stat">字符: {{ codeStats.characters }}</span>
                        <span v-if="errorCount > 0" class="stat error">错误: {{ errorCount }}</span>
                        <span v-if="warningCount > 0" class="stat warning">警告: {{ warningCount }}</span>
                    </div>
                </div>

                <CodePreview ref="previewRef" :code="code" :language="selectedLanguage" :auto-refresh="autoRefresh"
                    :component-props="componentProps" @compiled="onCompiled" @error="onError" @console="onConsole" />
            </div>
        </div>

        <div class="demo-features">
            <div class="feature-section">
                <h3>功能特性</h3>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h4>实时编译</h4>
                        <p>代码修改后自动编译和预览，支持 Vue、JavaScript 和 TypeScript</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h4>安全沙箱</h4>
                        <p>在安全的 iframe 环境中运行代码，防止恶意代码影响主页面</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🐛</div>
                        <h4>错误处理</h4>
                        <p>自动捕获编译错误和运行时错误，提供详细的错误信息</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <h4>控制台输出</h4>
                        <p>完整的控制台支持，实时显示 log、warn、error 等输出</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodePreview from '@/components/CodePreview.vue'

// 组件状态
const selectedLanguage = ref<'vue' | 'javascript' | 'typescript'>('vue')
const autoRefresh = ref(true)
const componentProps = ref({})
const previewRef = ref()
const errorCount = ref(0)
const warningCount = ref(0)

// 代码示例定义 - 使用数组拼接避免Vue模板语法解析问题
const createVueExample = () => {
    const parts = [
        '<template>',
        '  <div class="hello">',
        '    <h1>{{', ' message ', '}}</h1>',
        '    <p>Count: {{', ' count ', '}}</p>',
        '    <button @click="', 'increment', '">Click me</button>',
        '  </div>',
        '</template>',
        '',
        '<script>',
        'import { ref } from \'vue\'',
        '',
        'export default {',
        '  setup() {',
        '    const message = ref(\'Hello Vue 3!\')',
        '    const count = ref(0)',
        '    ',
        '    function increment() {',
        '      count.value++',
        '      console.log(\'Count updated:\', count.value)',
        '    }',
        '    ',
        '    return {',
        '      message,',
        '      count,',
        '      increment',
        '    }',
        '  }',
        '}',
        '</' + 'script>',
        '',
        '<style scoped>',
        '.hello {',
        '  text-align: center;',
        '  padding: 20px;',
        '}',
        '',
        'button {',
        '  background: #42b883;',
        '  color: white;',
        '  border: none;',
        '  padding: 10px 20px;',
        '  border-radius: 4px;',
        '  cursor: pointer;',
        '  margin-top: 10px;',
        '}',
        '',
        'button:hover {',
        '  background: #369870;',
        '}',
        '</' + 'style>'
    ]

    return parts.join('\n')
}

const javascriptExample = [
    '// JavaScript 示例',
    'console.log(\'Hello, JavaScript!\');',
    '',
    'const numbers = [1, 2, 3, 4, 5];',
    'const doubled = numbers.map(n => n * 2);',
    '',
    'console.log(\'原数组:\', numbers);',
    'console.log(\'翻倍后:\', doubled);',
    '',
    '// 创建一个简单的计数器',
    'let count = 0;',
    'function increment() {',
    '  count++;',
    '  console.log(\'Count:\', count);',
    '  return count;',
    '}',
    '',
    '// 调用函数',
    'increment();',
    'increment();',
    'increment();'
].join('\n')

const createTypeScriptExample = () => {
    const parts = [
        '// TypeScript 示例',
        'interface User {',
        '  name: string;',
        '  age: number;',
        '  email?: string;',
        '}',
        '',
        'const user: User = {',
        '  name: \'Vue Developer\',',
        '  age: 25,',
        '  email: \'developer@vue.js\'',
        '};',
        '',
        'function greetUser(user: User): string {',
        '  const greeting = "Hello, " + user.name + "! You are " + user.age + " years old.";',
        '  console.log(greeting);',
        '  return greeting;',
        '}',
        '',
        'function processUsers(users: User[]): User[] {',
        '  return users.filter(user => user.age >= 18);',
        '}',
        '',
        'const greeting = greetUser(user);',
        'const users: User[] = [user, { name: \'Alice\', age: 17 }, { name: \'Bob\', age: 30 }];',
        'const adults = processUsers(users);',
        '',
        'console.log(\'Adults:\', adults);'
    ]

    return parts.join('\n')
}

// 初始化代码
const code = ref(createVueExample())

// 计算属性
const codeStats = computed(() => {
    const lines = code.value.split('\n').length
    const characters = code.value.length
    const charactersNoSpaces = code.value.replace(/\s/g, '').length
    const words = code.value.split(/\s+/).filter(word => word.length > 0).length

    return {
        lines,
        characters,
        charactersNoSpaces,
        words
    }
})

// 事件处理函数
function onLanguageChange() {
    switch (selectedLanguage.value) {
        case 'vue':
            code.value = createVueExample()
            break
        case 'javascript':
            code.value = javascriptExample
            break
        case 'typescript':
            code.value = createTypeScriptExample()
            break
    }
}

function onCodeChange(newCode: string) {
    // 代码变化时的处理
    console.log('Code changed:', newCode.length, 'characters')
}

function clearCode() {
    code.value = ''
}

function onCompiled(component: any) {
    console.log('Component compiled successfully:', component)
    errorCount.value = 0
}

function onError(error: string) {
    console.error('Compilation error:', error)
    errorCount.value++
}

function onConsole(log: any) {
    console.log('Console output:', log)
    if (log.level === 'warn') {
        warningCount.value++
    } else if (log.level === 'error') {
        errorCount.value++
    }
}
</script>

<style scoped>
.code-preview-demo {
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
.preview-section {
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

.controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.controls select {
    padding: 6px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    background: white;
    cursor: pointer;
}

.controls select:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.clear-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: #dc3545;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.clear-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
}

.preview-stats {
    display: flex;
    gap: 16px;
    font-size: 14px;
}

.stat {
    color: #6c757d;
}

.stat.error {
    color: #dc3545;
    font-weight: 600;
}

.stat.warning {
    color: #ffc107;
    font-weight: 600;
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
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
}

@media (max-width: 768px) {
    .code-preview-demo {
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

    .controls {
        justify-content: center;
    }

    .preview-stats {
        justify-content: space-around;
    }

    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .features-grid {
        grid-template-columns: 1fr;
    }
}
</style>