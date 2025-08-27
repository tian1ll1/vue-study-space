<template>
    <div class="code-preview">
        <div class="preview-toolbar">
            <div class="preview-info">
                <span class="preview-badge">预览</span>
                <span v-if="isLoading" class="loading-badge">编译中...</span>
                <span v-else-if="hasError" class="error-badge">错误</span>
                <span v-else class="success-badge">就绪</span>
            </div>
            <div class="preview-actions">
                <button @click="refreshPreview" class="refresh-button" :disabled="isLoading" title="刷新预览">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                </button>
                <button @click="clearPreview" class="clear-button" title="清空预览">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>
                <button @click="toggleConsole" class="console-button" :class="{ active: showConsole }" title="显示/隐藏控制台">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l1 1h8l1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 13l-3-3 3-3v2h3v2H7v2zm10-2h-3v-2h3V9l3 3-3 3v-2z" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="preview-content" :class="{ 'with-console': showConsole }">
            <!-- 预览区域 -->
            <div class="preview-area">
                <div v-if="isLoading" class="preview-loading">
                    <div class="loading-spinner"></div>
                    <p>正在编译代码...</p>
                </div>

                <div v-else-if="hasError" class="preview-error">
                    <div class="error-icon">⚠️</div>
                    <h3>编译错误</h3>
                    <pre class="error-message">{{ compilationError }}</pre>
                    <div class="error-suggestions" v-if="errorSuggestions.length">
                        <h4>建议:</h4>
                        <ul>
                            <li v-for="suggestion in errorSuggestions" :key="suggestion">
                                {{ suggestion }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-else class="preview-iframe-container">
                    <iframe ref="previewFrame" class="preview-iframe" :srcdoc="previewHtml"
                        sandbox="allow-scripts allow-same-origin allow-modals" @load="onIframeLoad"></iframe>
                </div>
            </div>

            <!-- 控制台区域 -->
            <div v-if="showConsole" class="console-area">
                <div class="console-header">
                    <span class="console-title">控制台</span>
                    <button @click="clearConsole" class="console-clear">清空</button>
                </div>
                <div class="console-content" ref="consoleContent">
                    <div v-for="(log, index) in consoleLogs" :key="index" class="console-log"
                        :class="'console-' + log.level">
                        <span class="console-timestamp">{{ formatTime(log.timestamp) }}</span>
                        <span class="console-level">{{ log.level.toUpperCase() }}</span>
                        <span class="console-message">{{ log.message }}</span>
                    </div>
                    <div v-if="consoleLogs.length === 0" class="console-empty">
                        控制台输出将显示在这里...
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { CodePreviewProps, CodePreviewEmits, ConsoleLog } from '@/types/editor'

const props = withDefaults(defineProps<CodePreviewProps>(), {
    language: 'vue',
    autoRefresh: true,
    componentProps: () => ({})
})

const emit = defineEmits<CodePreviewEmits>()

// 响应式状态
const isLoading = ref(false)
const compilationError = ref('')
const previewHtml = ref('')
const showConsole = ref(false)
const consoleLogs = ref<ConsoleLog[]>([])
const previewFrame = ref<HTMLIFrameElement>()
const consoleContent = ref<HTMLElement>()
const compiledComponent = ref<any>(null)

// 计算属性
const hasError = computed(() => !!compilationError.value)
const errorSuggestions = computed(() => {
    if (!compilationError.value) return []

    const suggestions: string[] = []
    const error = compilationError.value.toLowerCase()

    if (error.includes('unexpected token')) {
        suggestions.push('检查语法错误，如缺少分号、括号不匹配等')
    }
    if (error.includes('cannot resolve')) {
        suggestions.push('检查导入的模块或组件是否正确')
    }
    if (error.includes('template')) {
        suggestions.push('检查模板语法是否正确')
    }
    if (error.includes('script')) {
        suggestions.push('检查脚本部分的语法')
    }
    if (error.includes('style')) {
        suggestions.push('检查样式语法是否正确')
    }

    return suggestions
})

// 监听代码变化
watch(() => props.code, (newCode) => {
    if (props.autoRefresh && newCode.trim()) {
        compileCode()
    }
}, { immediate: true })

// 监听语言变化
watch(() => props.language, () => {
    if (props.code.trim()) {
        compileCode()
    }
})

// 组件挂载时设置消息监听
onMounted(() => {
    setupMessageListener()
})

onUnmounted(() => {
    removeMessageListener()
})

// 编译代码
async function compileCode() {
    if (!props.code.trim()) {
        clearPreview()
        return
    }

    isLoading.value = true
    compilationError.value = ''

    try {
        let compiledHtml = ''

        switch (props.language) {
            case 'vue':
                compiledHtml = await compileVueCode(props.code)
                break
            case 'javascript':
                compiledHtml = await compileJavaScriptCode(props.code)
                break
            case 'typescript':
                compiledHtml = await compileTypeScriptCode(props.code)
                break
            default:
                throw new Error('不支持的语言: ' + props.language)
        }

        previewHtml.value = compiledHtml
        emit('compiled', compiledComponent.value)

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        compilationError.value = errorMessage
        emit('error', errorMessage)
    } finally {
        isLoading.value = false
    }
}

// 编译Vue代码
async function compileVueCode(code: string): Promise<string> {
    try {
        // 解析Vue单文件组件
        const { template, script, style } = parseVueSFC(code)

        // 验证和转换脚本部分
        const compiledScript = await compileScript(script)

        // 生成预览HTML
        const html = generatePreviewHtml({
            template: template || '<div>Empty template</div>',
            script: compiledScript,
            style: style || '',
            props: props.componentProps
        })

        return html

    } catch (error) {
        throw new Error('Vue编译错误: ' + (error instanceof Error ? error.message : String(error)))
    }
}

// 编译JavaScript代码
async function compileJavaScriptCode(code: string): Promise<string> {
    try {
        // 基础的JavaScript代码验证
        validateJavaScript(code)

        // 生成执行环境
        const html = generateJavaScriptPreview(code)
        return html

    } catch (error) {
        throw new Error('JavaScript编译错误: ' + (error instanceof Error ? error.message : String(error)))
    }
}

// 编译TypeScript代码
async function compileTypeScriptCode(code: string): Promise<string> {
    try {
        // 简单的TypeScript到JavaScript转换
        const jsCode = transpileTypeScript(code)

        // 生成执行环境
        const html = generateJavaScriptPreview(jsCode)
        return html

    } catch (error) {
        throw new Error('TypeScript编译错误: ' + (error instanceof Error ? error.message : String(error)))
    }
}

// 解析Vue单文件组件
function parseVueSFC(code: string) {
    const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)

    return {
        template: templateMatch ? templateMatch[1].trim() : '',
        script: scriptMatch ? scriptMatch[1].trim() : '',
        style: styleMatch ? styleMatch[1].trim() : ''
    }
}

// 编译脚本部分
async function compileScript(script: string): Promise<string> {
    if (!script) return ''

    try {
        // 转换 ES6 模块导入为全局变量访问
        let transformedScript = script

        // 处理 Vue 相关的导入 - 只注释掉，不重新声明（因为在 HTML 中已经全局声明了）
        transformedScript = transformedScript.replace(
            /import\s*{\s*([^}]+)\s*}\s*from\s*['"]vue['"]/g,
            (match) => {
                return `// ${match} (已在全局作用域中可用)`
            }
        )

        // 处理其他常见的导入（可以根据需要扩展）
        transformedScript = transformedScript.replace(
            /import\s+.*\s+from\s+['"][^'"]+['"];?\s*/g,
            (match) => `// ${match.trim()}`
        )

        // 处理 export default
        transformedScript = transformedScript.replace(
            /export\s+default\s+/g,
            'const componentOptions = '
        )

        // 如果是 script setup 语法，需要特殊处理
        if (script.includes('<script setup')) {
            // 对于 script setup，我们需要将所有的响应式变量和函数收集起来
            // 这是一个简化的处理，实际项目中需要更复杂的 AST 解析
            const setupVars = []
            const varMatches = transformedScript.match(/const\s+(\w+)\s*=/g)
            const funcMatches = transformedScript.match(/function\s+(\w+)/g)

            if (varMatches) {
                varMatches.forEach(match => {
                    const varName = match.match(/const\s+(\w+)/)?.[1]
                    if (varName && !varName.includes('componentOptions')) {
                        setupVars.push(varName)
                    }
                })
            }

            if (funcMatches) {
                funcMatches.forEach(match => {
                    const funcName = match.match(/function\s+(\w+)/)?.[1]
                    if (funcName) {
                        setupVars.push(funcName)
                    }
                })
            }

            // 如果没有显式的 export default，为 script setup 创建一个
            if (!transformedScript.includes('componentOptions')) {
                const returnObj = setupVars.length > 0
                    ? `{ ${setupVars.join(', ')} }`
                    : '{}'
                transformedScript += `\n\nconst componentOptions = {\n  setup() {\n    return ${returnObj};\n  }\n};`
            }
        }

        // 基础的语法验证（跳过 import/export 语句）
        const testScript = transformedScript
            .replace(/\/\/.*$/gm, '') // 移除注释
            .replace(/const\s+{\s*[^}]+\s*}\s*=\s*Vue;/g, '') // 移除 Vue 解构

        if (testScript.trim()) {
            new Function(testScript)
        }

        return transformedScript
    } catch (error) {
        throw new Error('脚本语法错误: ' + (error instanceof Error ? error.message : String(error)))
    }
}

// 验证JavaScript代码
function validateJavaScript(code: string) {
    try {
        new Function(code)
    } catch (error) {
        throw new Error('JavaScript语法错误: ' + (error instanceof Error ? error.message : String(error)))
    }
}

// 简单的TypeScript转换
function transpileTypeScript(code: string): string {
    // 这是一个简化的TypeScript转换，实际项目中应该使用TypeScript编译器
    return code
        // 移除接口定义
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        // 移除类型别名
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
        // 移除变量声明中的类型注解 (const name: Type = ...)
        .replace(/(const|let|var)\s+(\w+):\s*\w+(\[\])?(\s*=)/g, '$1 $2$4')
        // 移除函数参数中的类型注解 (param: Type) - 只在函数参数列表中
        .replace(/\(([^)]*)\)/g, (match, params) => {
            const cleanParams = params.replace(/(\w+):\s*\w+(\[\])?/g, '$1')
            return `(${cleanParams})`
        })
        // 移除函数返回类型注解 (function name(): Type)
        .replace(/\):\s*\w+(\[\])?(\s*{)/g, ')$2')
        // 移除类型断言
        .replace(/as\s+\w+/g, '')
}

// 生成预览HTML
function generatePreviewHtml({ template, script, style, props }: {
    template: string
    script: string
    style: string
    props: Record<string, any>
}): string {
    const propsScript = Object.keys(props).length > 0
        ? 'const componentProps = ' + JSON.stringify(props) + ';'
        : 'const componentProps = {};'

    const htmlParts = [
        '<!DOCTYPE html>',
        '<html lang="zh-CN">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Vue Preview</title>',
        '  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>',
        '  <style>',
        '    body {',
        '      margin: 0;',
        '      padding: 16px;',
        '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        '      background: #f8f9fa;',
        '    }',
        '    .preview-container {',
        '      background: white;',
        '      border-radius: 8px;',
        '      padding: 16px;',
        '      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);',
        '    }',
        '    ' + style,
        '  </style>',
        '</head>',
        '<body>',
        '  <div id="app" class="preview-container">',
        '    ' + template,
        '  </div>',
        '',
        '  <script>',
        '    const originalConsole = { ...console };',
        '    ["log", "info", "warn", "error"].forEach(method => {',
        '      console[method] = function(...args) {',
        '        originalConsole[method](...args);',
        '        window.parent.postMessage({',
        '          type: "console",',
        '          level: method,',
        '          message: args.map(arg => ',
        '            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)',
        '          ).join(" "),',
        '          timestamp: new Date().toISOString()',
        '        }, "*");',
        '      };',
        '    });',
        '',
        '    window.addEventListener("error", (event) => {',
        '      window.parent.postMessage({',
        '        type: "console",',
        '        level: "error",',
        '        message: "Runtime Error: " + event.message + " at line " + event.lineno,',
        '        timestamp: new Date().toISOString()',
        '      }, "*");',
        '    });',
        '',
        '    try {',
        '      ' + propsScript,
        '      // 首先从 Vue 全局对象中解构所有常用的 API',
        '      const { createApp, ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } = Vue;',
        '      ',
        '      ' + script,
        '      ',
        '      // 创建 Vue 应用',
        '      let appConfig;',
        '      if (typeof componentOptions !== "undefined") {',
        '        appConfig = componentOptions;',
        '      } else {',
        '        // 如果没有 export default，尝试从 setup 函数创建组件',
        '        appConfig = { setup() { return {}; } };',
        '      }',
        '      ',
        '      createApp(appConfig).mount("#app");',
        '    } catch (error) {',
        '      console.error("Vue应用初始化错误:", error.message);',
        '      document.getElementById("app").innerHTML = ',
        '        "<div style=\\"color: red; padding: 16px; border: 1px solid red; border-radius: 4px; background: #ffeaea;\\">" +',
        '          "<h3>运行时错误</h3>" +',
        '          "<pre>" + error.message + "</pre>" +',
        '        "</div>";',
        '    }',
        '  <\/script>',
        '</body>',
        '</html>'
    ]

    return htmlParts.join('\n')
}

// 生成JavaScript预览HTML
function generateJavaScriptPreview(code: string): string {
    const htmlParts = [
        '<!DOCTYPE html>',
        '<html lang="zh-CN">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>JavaScript Preview</title>',
        '  <style>',
        '    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8f9fa; }',
        '    .output-container { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); min-height: 200px; }',
        '    .output-title { margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; }',
        '  </style>',
        '</head>',
        '<body>',
        '  <div class="output-container">',
        '    <h2 class="output-title">JavaScript 执行结果</h2>',
        '    <div id="output"></div>',
        '  </div>',
        '  <script>',
        '    const originalConsole = { ...console };',
        '    const outputDiv = document.getElementById("output");',
        '    ["log", "info", "warn", "error"].forEach(method => {',
        '      console[method] = function(...args) {',
        '        originalConsole[method](...args);',
        '        const message = args.map(arg => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)).join(" ");',
        '        const logElement = document.createElement("div");',
        '        const bgColor = method === "error" ? "#ffeaea" : method === "warn" ? "#fff3cd" : "#f8f9fa";',
        '        const textColor = method === "error" ? "#d32f2f" : method === "warn" ? "#f57c00" : "#333";',
        '        const borderColor = method === "error" ? "#d32f2f" : method === "warn" ? "#f57c00" : "#007acc";',
        '        logElement.style.cssText = "margin: 4px 0; padding: 8px; border-radius: 4px; font-family: \\"Courier New\\", monospace; font-size: 14px; background: " + bgColor + "; color: " + textColor + "; border-left: 4px solid " + borderColor + ";";',
        '        logElement.textContent = "[" + method.toUpperCase() + "] " + message;',
        '        outputDiv.appendChild(logElement);',
        '        window.parent.postMessage({ type: "console", level: method, message: message, timestamp: new Date().toISOString() }, "*");',
        '      };',
        '    });',
        '    window.addEventListener("error", (event) => { console.error("Runtime Error: " + event.message + " at line " + event.lineno); });',
        '    try { ' + code + ' } catch (error) { console.error("代码执行错误:", error.message); }',
        '  <\/script>',
        '</body>',
        '</html>'
    ]

    return htmlParts.join('\n')
}

// 设置消息监听器
function setupMessageListener() {
    window.addEventListener('message', handleMessage)
}

// 移除消息监听器
function removeMessageListener() {
    window.removeEventListener('message', handleMessage)
}

// 处理来自iframe的消息
function handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'console') {
        const log: ConsoleLog = {
            level: event.data.level,
            message: event.data.message,
            timestamp: new Date(event.data.timestamp)
        }

        consoleLogs.value.push(log)
        emit('console', log)

        // 自动滚动到底部
        nextTick(() => {
            if (consoleContent.value) {
                consoleContent.value.scrollTop = consoleContent.value.scrollHeight
            }
        })
    }
}

// iframe加载完成
function onIframeLoad() {
    // iframe加载完成后的处理
}

// 刷新预览
function refreshPreview() {
    compileCode()
}

// 清空预览
function clearPreview() {
    previewHtml.value = ''
    compilationError.value = ''
    compiledComponent.value = null
    clearConsole()
}

// 切换控制台显示
function toggleConsole() {
    showConsole.value = !showConsole.value
}

// 清空控制台
function clearConsole() {
    consoleLogs.value = []
}

// 格式化时间
function formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',

    })
}

// 暴露方法给父组件
defineExpose({
    refresh: refreshPreview,
    clear: clearPreview,
    getComponent: () => compiledComponent.value,
    hasError: () => hasError.value,
    getError: () => compilationError.value
})
</script>

<style scoped>
.code-preview {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.preview-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
    flex-shrink: 0;
}

.preview-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.preview-badge {
    background: #007acc;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.loading-badge {
    background: #f59e0b;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
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

.preview-actions {
    display: flex;
    gap: 4px;
}

.refresh-button,
.clear-button,
.console-button {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: #ffffff;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.refresh-button:hover:not(:disabled),
.clear-button:hover,
.console-button:hover {
    background: #e9ecef;
    color: #495057;
}

.refresh-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.console-button.active {
    background: #007acc;
    color: white;
}

.preview-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-content.with-console {
    flex-direction: row;
}

.preview-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.preview-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6c757d;
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e9ecef;
    border-top: 3px solid #007acc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.preview-error {
    padding: 24px;
    text-align: center;
    color: #dc3545;
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
}

.error-suggestions {
    text-align: left;
    margin-top: 16px;
}

.error-suggestions h4 {
    margin: 0 0 8px 0;
    color: #495057;
}

.error-suggestions ul {
    margin: 0;
    padding-left: 20px;
}

.error-suggestions li {
    margin: 4px 0;
    color: #6c757d;
}

.preview-iframe-container {
    flex: 1;
    overflow: hidden;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

.console-area {
    width: 300px;
    border-left: 1px solid #e1e5e9;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
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
    background: #f8f9fa;
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

.console-empty {
    color: #6c757d;
    font-style: italic;
    text-align: center;
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .preview-content.with-console {
        flex-direction: column;
    }

    .console-area {
        width: 100%;
        height: 200px;
        border-left: none;
        border-top: 1px solid #e1e5e9;
    }

    .preview-toolbar {
        flex-wrap: wrap;
        gap: 8px;
    }
}
</style>