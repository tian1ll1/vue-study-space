<template>
    <div class="test-container">
        <h1>响应式系统测试</h1>

        <div class="demo-section">
            <h2>ref 测试</h2>
            <p>计数: {{ refCount }}</p>
            <button @click="incrementRefCount">ref 计数 +1</button>

            <p>消息: {{ refMessage }}</p>
            <button @click="updateRefMessage">更新 ref 消息</button>
        </div>

        <div class="demo-section">
            <h2>reactive 测试</h2>
            <p>计数: {{ reactiveState.count }}</p>
            <button @click="incrementReactiveCount">reactive 计数 +1</button>

            <p>消息: {{ reactiveState.message }}</p>
            <button @click="updateReactiveMessage">更新 reactive 消息</button>
        </div>

        <div class="demo-section">
            <h2>computed 测试</h2>
            <p>原始消息: {{ computedMessage }}</p>
            <p>反转消息: {{ reversedMessage }}</p>
            <button @click="updateComputedMessage">更新消息</button>
        </div>

        <div class="demo-section">
            <h2>变化日志</h2>
            <button @click="clearLog">清空日志</button>
            <div class="log-content">
                <div v-for="(log, index) in changeLog" :key="index">
                    {{ log }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ref 示例数据
const refCount = ref(0)
const refMessage = ref('Hello Vue 3!')

// reactive 示例数据
const reactiveState = reactive({
    count: 0,
    message: 'Hello Reactive!'
})

// computed 示例数据
const computedMessage = ref('Hello Computed!')

// 变化日志
const changeLog = ref<string[]>([])

// computed 计算属性
const reversedMessage = computed(() => {
    return computedMessage.value.split('').reverse().join('')
})

// 日志函数
function logChange(type: string, property: string, oldValue: any, newValue: any) {
    const timestamp = new Date().toLocaleTimeString()
    changeLog.value.unshift(`[${timestamp}] ${type}.${property}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`)
    if (changeLog.value.length > 10) {
        changeLog.value = changeLog.value.slice(0, 10)
    }
}

// ref 操作函数
function incrementRefCount() {
    const oldValue = refCount.value
    refCount.value++
    logChange('ref', 'count', oldValue, refCount.value)
}

function updateRefMessage() {
    const oldValue = refMessage.value
    refMessage.value = refMessage.value === 'Hello Vue 3!' ? 'Message Updated!' : 'Hello Vue 3!'
    logChange('ref', 'message', oldValue, refMessage.value)
}

// reactive 操作函数
function incrementReactiveCount() {
    const oldValue = reactiveState.count
    reactiveState.count++
    logChange('reactive', 'count', oldValue, reactiveState.count)
}

function updateReactiveMessage() {
    const oldValue = reactiveState.message
    reactiveState.message = reactiveState.message === 'Hello Reactive!' ? 'Reactive Updated!' : 'Hello Reactive!'
    logChange('reactive', 'message', oldValue, reactiveState.message)
}

// computed 操作函数
function updateComputedMessage() {
    const oldValue = computedMessage.value
    computedMessage.value = computedMessage.value === 'Hello Computed!' ? 'Computed Updated!' : 'Hello Computed!'
    logChange('ref', 'computedMessage', oldValue, computedMessage.value)
}

// 清空日志
function clearLog() {
    changeLog.value = []
}
</script>

<style scoped>
.test-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.demo-section {
    margin: 2rem 0;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
}

.demo-section h2 {
    color: #2c3e50;
    margin-top: 0;
}

button {
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #42b883;
    color: white;
    cursor: pointer;
}

button:hover {
    background: #369870;
}

.log-content {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 1rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
    max-height: 200px;
    overflow-y: auto;
}

.log-content div {
    padding: 0.25rem 0;
    border-bottom: 1px solid #34495e;
}

.log-content div:last-child {
    border-bottom: none;
}
</style>