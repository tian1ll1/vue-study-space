<script setup lang="ts">
import { ref, reactive } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CodePreview from '@/components/CodePreview.vue'

defineOptions({
  name: 'BasicSyntaxModule'
})

// 当前选中的示例
const currentExample = ref('interpolation')

// 示例代码生成函数 - 参照 CodeExecutorDemo.vue 和 TROUBLESHOOTING.md 问题7
function getInterpolationExample(): string {
  const parts = [
    '<template>',
    '  <div class="demo-container">',
    '    <h3>插值语法示例</h3>',
    '    ',
    '    <!-- 基础文本插值 -->',
    '    <p>用户名: {{', ' username ', '}}</p>',
    '    <p>年龄: {{', ' age ', '}}</p>',
    '    ',
    '    <!-- 表达式计算 -->',
    '    <p>明年年龄: {{', ' age + 1 ', '}}</p>',
    '    <p>全名: {{', ' firstName + \' \' + lastName ', '}}</p>',
    '    ',
    '    <!-- 条件表达式 -->',
    '    <p>状态: {{', ' isActive ? \'在线\' : \'离线\' ', '}}</p>',
    '    ',
    '    <!-- 方法调用 -->',
    '    <p>格式化时间: {{', ' formatDate(currentDate) ', '}}</p>',
    '    ',
    '    <!-- HTML 插值 (v-html) -->',
    '    <div v-html="htmlContent"></div>',
    '  </div>',
    '</template>',
    '',
    '<script>',
    'const componentOptions = {',
    '  setup() {',
    '    const { ref } = Vue',
    '    ',
    '    const username = ref(\'张三\')',
    '    const age = ref(25)',
    '    const firstName = ref(\'张\')',
    '    const lastName = ref(\'三\')',
    '    const isActive = ref(true)',
    '    const currentDate = ref(new Date())',
    '    const htmlContent = ref(\'<strong style="color: blue;">这是HTML内容</strong>\')',
    '',
    '    function formatDate(date) {',
    '      return date.toLocaleDateString(\'zh-CN\')',
    '    }',
    '',
    '    return {',
    '      username,',
    '      age,',
    '      firstName,',
    '      lastName,',
    '      isActive,',
    '      currentDate,',
    '      htmlContent,',
    '      formatDate',
    '    }',
    '  }',
    '}',
    '</' + 'script>',  // 关键：使用字符串拼接避免被Vue编译器识别
    '',
    '<style scoped>',
    '.demo-container {',
    '  padding: 20px;',
    '  border: 1px solid #ddd;',
    '  border-radius: 8px;',
    '  background: #f9f9f9;',
    '}',
    '',
    '.demo-container h3 {',
    '  color: #2c3e50;',
    '  margin-bottom: 15px;',
    '}',
    '',
    '.demo-container p {',
    '  margin: 8px 0;',
    '  font-size: 16px;',
    '}',
    '</style>'
  ]
  return parts.join('\n')
}

function getDirectivesExample(): string {
  const parts = [
    '<template>',
    '  <div class="demo-container">',
    '    <h3>Vue 指令示例</h3>',
    '    ',
    '    <!-- v-if 条件渲染 -->',
    '    <div class="section">',
    '      <h4>条件渲染 (v-if/v-else)</h4>',
    '      <button @click="showMessage = !showMessage">',
    '        {{', ' showMessage ? \'隐藏\' : \'显示\' ', '}}消息',
    '      </button>',
    '      <p v-if="showMessage" class="success">这是一条成功消息！</p>',
    '      <p v-else class="info">点击按钮显示消息</p>',
    '    </div>',
    '    ',
    '    <!-- v-show 显示/隐藏 -->',
    '    <div class="section">',
    '      <h4>显示控制 (v-show)</h4>',
    '      <button @click="isVisible = !isVisible">',
    '        {{', ' isVisible ? \'隐藏\' : \'显示\' ', '}}元素',
    '      </button>',
    '      <p v-show="isVisible" class="warning">这个元素使用v-show控制显示</p>',
    '    </div>',
    '    ',
    '    <!-- v-for 列表渲染 -->',
    '    <div class="section">',
    '      <h4>列表渲染 (v-for)</h4>',
    '      <ul>',
    '        <li v-for="(item, index) in items" :key="item.id">',
    '          {{', ' index + 1 ', '}}. {{', ' item.name ', '}} - {{', ' item.category ', '}}',
    '        </li>',
    '      </ul>',
    '    </div>',
    '    ',
    '    <!-- v-bind 属性绑定 -->',
    '    <div class="section">',
    '      <h4>属性绑定 (v-bind)</h4>',
    '      <img :src="imageUrl" :alt="imageAlt" :class="imageClass" />',
    '      <p :style="{ color: textColor, fontSize: fontSize + \'px\' }">',
    '        动态样式文本',
    '      </p>',
    '    </div>',
    '  </div>',
    '</template>',
    '',
    '<script>',
    'const componentOptions = {',
    '  setup() {',
    '    const { ref, reactive } = Vue',
    '    ',
    '    const showMessage = ref(false)',
    '    const isVisible = ref(true)',
    '    const textColor = ref(\'#e74c3c\')',
    '    const fontSize = ref(18)',
    '    const imageUrl = ref(\'https://via.placeholder.com/150x100/42b883/ffffff?text=Vue.js\')',
    '    const imageAlt = ref(\'Vue.js Logo\')',
    '    const imageClass = ref(\'vue-logo\')',
    '',
    '    const items = reactive([',
    '      { id: 1, name: \'Vue.js\', category: \'前端框架\' },',
    '      { id: 2, name: \'React\', category: \'前端框架\' },',
    '      { id: 3, name: \'Angular\', category: \'前端框架\' }',
    '    ])',
    '',
    '    return {',
    '      showMessage,',
    '      isVisible,',
    '      textColor,',
    '      fontSize,',
    '      imageUrl,',
    '      imageAlt,',
    '      imageClass,',
    '      items',
    '    }',
    '  }',
    '}',
    '</' + 'script>',
    '',
    '<style scoped>',
    '.demo-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }',
    '.section { margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 6px; background: white; }',
    '.section h4 { margin-top: 0; color: #2c3e50; }',
    '.success { color: #27ae60; font-weight: bold; }',
    '.info { color: #3498db; }',
    '.warning { color: #f39c12; font-weight: bold; }',
    '.vue-logo { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }',
    'button { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: pointer; transition: background 0.3s; }',
    'button:hover { background: #2980b9; }',
    'ul { list-style-type: none; padding: 0; }',
    'li { padding: 8px; margin: 4px 0; background: #ecf0f1; border-radius: 4px; }',
    '</style>'
  ]
  return parts.join('\n')
}

function getDataBindingExample(): string {
  const parts = [
    '<template>',
    '  <div class="demo-container">',
    '    <h3>数据绑定示例</h3>',
    '    ',
    '    <!-- 单向数据绑定 -->',
    '    <div class="section">',
    '      <h4>单向数据绑定</h4>',
    '      <div class="binding-demo">',
    '        <p>数据源: {{', ' message ', '}}</p>',
    '        <button @click="message = \'数据已更新!\'">更新数据</button>',
    '        <button @click="message = \'Hello Vue 3!\'">重置数据</button>',
    '      </div>',
    '    </div>',
    '    ',
    '    <!-- 双向数据绑定 -->',
    '    <div class="section">',
    '      <h4>双向数据绑定</h4>',
    '      <div class="form-group">',
    '        <label>用户名:</label>',
    '        <input v-model="username" type="text" placeholder="请输入用户名" />',
    '        <p>实时值: <strong>{{', ' username ', '}}</strong></p>',
    '      </div>',
    '      ',
    '      <div class="form-group">',
    '        <label>自我介绍:</label>',
    '        <textarea v-model="bio" placeholder="请介绍一下自己"></textarea>',
    '        <p>字符数: {{', ' bio.length ', '}}/200</p>',
    '      </div>',
    '    </div>',
    '    ',
    '    <!-- 表单控件绑定 -->',
    '    <div class="section">',
    '      <h4>表单控件绑定</h4>',
    '      ',
    '      <!-- 单选框 -->',
    '      <div class="form-group">',
    '        <label>性别:</label>',
    '        <div class="radio-group">',
    '          <label><input type="radio" v-model="gender" value="male" /> 男</label>',
    '          <label><input type="radio" v-model="gender" value="female" /> 女</label>',
    '        </div>',
    '        <p>选择的性别: {{', ' gender || \'未选择\' ', '}}</p>',
    '      </div>',
    '      ',
    '      <!-- 复选框 -->',
    '      <div class="form-group">',
    '        <label>兴趣爱好:</label>',
    '        <div class="checkbox-group">',
    '          <label><input type="checkbox" v-model="hobbies" value="reading" /> 阅读</label>',
    '          <label><input type="checkbox" v-model="hobbies" value="music" /> 音乐</label>',
    '          <label><input type="checkbox" v-model="hobbies" value="sports" /> 运动</label>',
    '        </div>',
    '        <p>已选择: {{', ' hobbies.join(\', \') || \'无\' ', '}}</p>',
    '      </div>',
    '      ',
    '      <!-- 下拉选择 -->',
    '      <div class="form-group">',
    '        <label>所在城市:</label>',
    '        <select v-model="city">',
    '          <option value="">请选择城市</option>',
    '          <option value="beijing">北京</option>',
    '          <option value="shanghai">上海</option>',
    '          <option value="guangzhou">广州</option>',
    '        </select>',
    '        <p>选择的城市: {{', ' city || \'未选择\' ', '}}</p>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</template>',
    '',
    '<script>',
    'const componentOptions = {',
    '  setup() {',
    '    const { ref } = Vue',
    '    ',
    '    const message = ref(\'Hello Vue 3!\')',
    '    const username = ref(\'\')',
    '    const bio = ref(\'\')',
    '    const gender = ref(\'\')',
    '    const hobbies = ref([])',
    '    const city = ref(\'\')',
    '',
    '    return {',
    '      message, username, bio, gender, hobbies, city',
    '    }',
    '  }',
    '}',
    '</' + 'script>',
    '',
    '<style scoped>',
    '.demo-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }',
    '.section { margin: 25px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; }',
    '.section h4 { margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }',
    '.binding-demo { display: flex; flex-direction: column; gap: 10px; }',
    '.binding-demo button { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; background: #3498db; color: white; cursor: pointer; }',
    '.form-group { margin: 15px 0; }',
    '.form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #34495e; }',
    '.form-group input[type="text"], .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }',
    '.form-group textarea { height: 80px; resize: vertical; }',
    '.radio-group, .checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; }',
    '.radio-group label, .checkbox-group label { display: flex; align-items: center; gap: 5px; font-weight: normal; cursor: pointer; }',
    '</style>'
  ]
  return parts.join('\n')
}

function getEventHandlingExample(): string {
  const parts = [
    '<template>',
    '  <div class="demo-container">',
    '    <h3>事件处理示例</h3>',
    '    ',
    '    <!-- 基础事件处理 -->',
    '    <div class="section">',
    '      <h4>基础事件处理</h4>',
    '      <div class="event-demo">',
    '        <p>点击次数: {{', ' clickCount ', '}}</p>',
    '        <button @click="handleClick">点击我</button>',
    '        <button @click="clickCount++">直接增加</button>',
    '        <button @click="resetCount">重置计数</button>',
    '      </div>',
    '    </div>',
    '    ',
    '    <!-- 事件修饰符 -->',
    '    <div class="section">',
    '      <h4>事件修饰符</h4>',
    '      ',
    '      <!-- .prevent 修饰符 -->',
    '      <div class="modifier-demo">',
    '        <h5>.prevent - 阻止默认行为</h5>',
    '        <form @submit.prevent="handleSubmit">',
    '          <input v-model="formData" placeholder="输入内容" />',
    '          <button type="submit">提交 (不会刷新页面)</button>',
    '        </form>',
    '        <p>提交的内容: {{', ' submittedData ', '}}</p>',
    '      </div>',
    '      ',
    '      <!-- .stop 修饰符 -->',
    '      <div class="modifier-demo">',
    '        <h5>.stop - 阻止事件冒泡</h5>',
    '        <div class="outer-box" @click="handleOuterClick">',
    '          <p>外层容器 (点击会触发)</p>',
    '          <div class="inner-box" @click.stop="handleInnerClick">',
    '            <p>内层容器 (点击不会冒泡)</p>',
    '          </div>',
    '        </div>',
    '        <p>事件日志: {{', ' eventLog.join(\' → \') ', '}}</p>',
    '      </div>',
    '      ',
    '      <!-- 按键修饰符 -->',
    '      <div class="modifier-demo">',
    '        <h5>按键修饰符</h5>',
    '        <input v-model="keyInput" @keyup.enter="handleEnter" @keyup.esc="clearInput" placeholder="按 Enter 确认, Esc 清空" />',
    '        <p>输入内容: {{', ' keyInput ', '}}</p>',
    '        <p>操作记录: {{', ' keyLog ', '}}</p>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</template>',
    '',
    '<script>',
    'const componentOptions = {',
    '  setup() {',
    '    const { ref } = Vue',
    '    ',
    '    const clickCount = ref(0)',
    '    const formData = ref(\'\')',
    '    const submittedData = ref(\'\')',
    '    const eventLog = ref([])',
    '    const keyInput = ref(\'\')',
    '    const keyLog = ref(\'\')',
    '',
    '    function handleClick() {',
    '      clickCount.value++',
    '      console.log(\'按钮被点击了!\')',
    '    }',
    '',
    '    function resetCount() { clickCount.value = 0 }',
    '    function handleSubmit() { submittedData.value = formData.value; formData.value = \'\' }',
    '    function handleOuterClick() { eventLog.value = [\'外层点击\'] }',
    '    function handleInnerClick() { eventLog.value = [\'内层点击\'] }',
    '    function handleEnter() { keyLog.value = \'按下了 Enter 键: \' + keyInput.value }',
    '    function clearInput() { keyInput.value = \'\'; keyLog.value = \'按下了 Esc 键，已清空输入\' }',
    '',
    '    return {',
    '      clickCount, handleClick, resetCount, formData, submittedData, eventLog,',
    '      handleSubmit, handleOuterClick, handleInnerClick, keyInput, keyLog, handleEnter, clearInput',
    '    }',
    '  }',
    '}',
    '</' + 'script>',
    '',
    '<style scoped>',
    '.demo-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }',
    '.section { margin: 25px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: white; }',
    '.section h4 { margin-top: 0; color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 8px; }',
    '.event-demo { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; }',
    '.event-demo button { margin: 5px; padding: 8px 16px; border: none; border-radius: 4px; background: #e74c3c; color: white; cursor: pointer; }',
    '.modifier-demo { margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 6px; border-left: 4px solid #3498db; }',
    '.modifier-demo h5 { margin-top: 0; color: #2c3e50; }',
    '.outer-box { padding: 20px; background: #e8f5e8; border: 2px solid #27ae60; border-radius: 8px; cursor: pointer; }',
    '.inner-box { padding: 15px; background: #fff3e0; border: 2px solid #f39c12; border-radius: 6px; margin: 10px 0; }',
    'input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }',
    '</style>'
  ]
  return parts.join('\n')
}

// 示例代码对象
const examples = reactive({
  interpolation: {
    title: '插值语法 (Interpolation)',
    description: '学习Vue的文本插值、表达式计算和过滤器使用',
    code: getInterpolationExample()
  },

  directives: {
    title: '指令 (Directives)',
    description: '学习Vue的内置指令：v-if、v-for、v-show、v-bind等',
    code: getDirectivesExample()
  },

  dataBinding: {
    title: '数据绑定 (Data Binding)',
    description: '学习Vue的双向数据绑定、表单控件绑定和数据流向',
    code: getDataBindingExample()
  },

  eventHandling: {
    title: '事件处理 (Event Handling)',
    description: '学习Vue的事件监听、事件修饰符和与React/Angular的对比',
    code: getEventHandlingExample()
  }
})

// 当前编辑的代码
const currentCode = ref(examples.interpolation.code)

// 切换示例
function selectExample(exampleKey: string) {
  currentExample.value = exampleKey
  currentCode.value = examples[exampleKey as keyof typeof examples].code
}

// 处理代码变化
function handleCodeChange(newCode: string) {
  currentCode.value = newCode
}

// 运行代码
function handleRunCode(code: string) {
  console.log('运行代码:', code)
}
</script>

<template>
  <div class="module-container">
    <div class="module-header">
      <h1>Vue 3 基础语法</h1>
      <p class="module-description">
        学习Vue 3的核心模板语法，包括插值、指令和条件渲染。通过实际示例掌握Vue的声明式渲染方式。
      </p>
    </div>

    <!-- 示例选择器 -->
    <div class="example-selector">
      <h2>选择学习内容</h2>
      <div class="example-tabs">
        <button v-for="(example, key) in examples" :key="key" :class="{ active: currentExample === key }"
          @click="selectExample(key)" class="example-tab">
          {{ example.title }}
        </button>
      </div>
    </div>

    <!-- 当前示例信息 -->
    <div class="current-example-info">
      <h3>{{ examples[currentExample as keyof typeof examples].title }}</h3>
      <p>{{ examples[currentExample as keyof typeof examples].description }}</p>
    </div>

    <!-- 代码编辑和预览区域 -->
    <div class="editor-preview-container">
      <!-- 代码编辑器 -->
      <div class="editor-section">
        <h4>编辑代码</h4>
        <CodeEditor v-model="currentCode" language="vue" height="500px" @change="handleCodeChange"
          @run="handleRunCode" />
      </div>

      <!-- 代码预览 -->
      <div class="preview-section">
        <h4>实时预览</h4>
        <CodePreview :code="currentCode" language="vue" :auto-refresh="true" />
      </div>
    </div>
    
    <!-- 学习要点 -->
    <div class="learning-points">
      <h3>学习要点</h3>
      <div class="points-grid">
        <div class="point-card">
          <h4>🔤 插值语法</h4>
          <ul>
            <li>使用 <code>{{ }}</code> 进行文本插值</li>
            <li>支持JavaScript表达式</li>
            <li>使用 <code>v-html</code> 插入HTML</li>
            <li>避免在插值中使用复杂逻辑</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>📋 指令系统</h4>
          <ul>
            <li><code>v-bind</code> 绑定属性</li>
            <li><code>v-if/v-else</code> 条件渲染</li>
            <li><code>v-for</code> 列表渲染</li>
            <li><code>v-show</code> 显示控制</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>🔗 数据绑定</h4>
          <ul>
            <li><code>v-model</code> 双向数据绑定</li>
            <li>表单控件绑定</li>
            <li>数据流向理解</li>
            <li>响应式数据更新</li>
          </ul>
        </div>

        <div class="point-card">
          <h4>⚡ 事件处理</h4>
          <ul>
            <li><code>@click</code> 事件监听</li>
            <li>事件修饰符使用</li>
            <li>事件参数传递</li>
            <li>与其他框架对比</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.module-header {
  text-align: center;
  margin-bottom: 2rem;
}

.module-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.module-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.example-selector {
  margin-bottom: 2rem;
}

.example-selector h2 {
  color: #34495e;
  margin-bottom: 1rem;
}

.example-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  background: white;
  color: #5a6c7d;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.example-tab:hover {
  border-color: #42b883;
  color: #42b883;
}

.example-tab.active {
  background: #42b883;
  border-color: #42b883;
  color: white;
}

.current-example-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #42b883;
}

.current-example-info h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.current-example-info p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

.editor-preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.editor-section,
.preview-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.editor-section h4,
.preview-section h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.learning-points {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.learning-points h3 {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.point-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.point-card h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.point-card ul {
  margin: 0;
  padding-left: 1.2rem;
}

.point-card li {
  color: #5a6c7d;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.point-card code {
  background: #e8f4fd;
  color: #0366d6;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-preview-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .module-container {
    padding: 1rem;
  }

  .module-header h1 {
    font-size: 2rem;
  }

  .example-tabs {
    flex-direction: column;
  }

  .example-tab {
    text-align: center;
  }

  .points-grid {
    grid-template-columns: 1fr;
  }
}
</style>