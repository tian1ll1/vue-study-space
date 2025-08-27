<template>
  <div class="code-editor" :style="{ height }">
    <div class="editor-toolbar">
      <div class="editor-info">
        <span class="language-badge">{{ language }}</span>
        <span v-if="readonly" class="readonly-badge">只读</span>
      </div>
      <div class="editor-actions">
        <button 
          v-if="!readonly" 
          @click="runCode" 
          class="run-button"
          :disabled="!modelValue.trim()"
        >
          运行代码
        </button>
        <button @click="resetCode" class="reset-button">
          重置
        </button>
      </div>
    </div>
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import loader from '@monaco-editor/loader'

interface Props {
  modelValue: string
  language?: 'javascript' | 'typescript' | 'vue' | 'html' | 'css'
  theme?: 'vs-dark' | 'vs-light'
  readonly?: boolean
  height?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'run', code: string): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  theme: 'vs-dark',
  readonly: false,
  height: '400px',
  placeholder: '// 在这里编写代码...'
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null
const originalCode = ref(props.modelValue)

// 配置Monaco Editor
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
})

onMounted(async () => {
  await initializeEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})

// 监听语言变化
watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, getMonacoLanguage(newLanguage))
    }
  }
})

async function initializeEditor() {
  if (!editorContainer.value) return

  try {
    // 等待Monaco Editor加载
    const monacoInstance = await loader.init()
    
    // 注册Vue语言支持
    registerVueLanguage(monacoInstance)
    
    // 创建编辑器实例
    editor = monacoInstance.editor.create(editorContainer.value, {
      value: props.modelValue || props.placeholder,
      language: getMonacoLanguage(props.language),
      theme: props.theme,
      readOnly: props.readonly,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      glyphMargin: false,
      contextmenu: true,
      mouseWheelZoom: true,
      smoothScrolling: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      matchBrackets: 'always'
    })

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || ''
      emit('update:modelValue', value)
      emit('change', value)
    })

    // 添加快捷键
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      runCode()
    })

    // 保存原始代码
    originalCode.value = props.modelValue

  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error)
  }
}

function getMonacoLanguage(lang: string): string {
  const languageMap: Record<string, string> = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'vue': 'html', // Vue文件使用HTML语法高亮
    'html': 'html',
    'css': 'css'
  }
  return languageMap[lang] || 'javascript'
}

function registerVueLanguage(monacoInstance: typeof monaco) {
  // 为Vue文件注册基础的语法高亮
  monacoInstance.languages.register({ id: 'vue' })
  
  monacoInstance.languages.setMonarchTokensProvider('vue', {
    tokenizer: {
      root: [
        [/<template[^>]*>/, 'tag'],
        [/<\/template>/, 'tag'],
        [/<script[^>]*>/, 'tag'],
        [/<\/script>/, 'tag'],
        [/<style[^>]*>/, 'tag'],
        [/<\/style>/, 'tag'],
        [/{{[^}]*}}/, 'variable'],
        [/v-[a-zA-Z-]+/, 'attribute.name'],
        [/@[a-zA-Z-]+/, 'attribute.name'],
        [/:[a-zA-Z-]+/, 'attribute.name']
      ]
    }
  })
}

function runCode() {
  if (editor && !props.readonly) {
    const code = editor.getValue()
    emit('run', code)
  }
}

function resetCode() {
  if (editor) {
    editor.setValue(originalCode.value)
    emit('reset')
  }
}

// 暴露方法给父组件
defineExpose({
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  getEditor: () => editor
})
</script>

<style scoped>
.code-editor {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  background: #1e1e1e;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
}

.editor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-badge {
  background: #007acc;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.readonly-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.run-button, .reset-button {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.run-button {
  background: #28a745;
  color: white;
}

.run-button:hover:not(:disabled) {
  background: #218838;
}

.run-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-button {
  background: #6c757d;
  color: white;
}

.reset-button:hover {
  background: #5a6268;
}

.editor-container {
  height: calc(100% - 45px);
  min-height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .editor-actions {
    justify-content: center;
  }
}
</style>