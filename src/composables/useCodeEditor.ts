import { ref, computed, type Ref } from 'vue'
import type { CodeEditorInstance } from '@/types/editor'

export interface UseCodeEditorOptions {
    initialCode?: string
    language?: string
    theme?: 'vs-dark' | 'vs-light'
    readonly?: boolean
}

export function useCodeEditor(options: UseCodeEditorOptions = {}) {
    const editorRef = ref<CodeEditorInstance>()
    const code = ref(options.initialCode || '')
    const language = ref(options.language || 'javascript')
    const theme = ref(options.theme || 'vs-dark')
    const readonly = ref(options.readonly || false)
    const isExecuting = ref(false)
    const executionResult = ref<any>(null)
    const executionError = ref<string | null>(null)

    // 计算属性
    const hasCode = computed(() => code.value.trim().length > 0)
    const canExecute = computed(() => hasCode.value && !readonly.value && !isExecuting.value)

    // 方法
    function updateCode(newCode: string) {
        code.value = newCode
    }

    function resetCode() {
        code.value = options.initialCode || ''
        executionResult.value = null
        executionError.value = null
    }

    function setLanguage(newLanguage: string) {
        language.value = newLanguage
    }

    function setTheme(newTheme: 'vs-dark' | 'vs-light') {
        theme.value = newTheme
    }

    function setReadonly(isReadonly: boolean) {
        readonly.value = isReadonly
    }

    function focusEditor() {
        editorRef.value?.focus()
    }

    function getEditorValue() {
        return editorRef.value?.getValue() || ''
    }

    function setEditorValue(value: string) {
        editorRef.value?.setValue(value)
        code.value = value
    }

    async function executeCode() {
        if (!canExecute.value) return

        isExecuting.value = true
        executionError.value = null

        try {
            const currentCode = getEditorValue()

            // 这里将在后续任务中实现实际的代码执行逻辑
            // 目前只是模拟执行过程
            await new Promise(resolve => setTimeout(resolve, 500))

            // 模拟执行结果
            executionResult.value = {
                output: '代码执行成功',
                timestamp: new Date(),
                code: currentCode
            }

        } catch (error) {
            executionError.value = error instanceof Error ? error.message : '执行出错'
        } finally {
            isExecuting.value = false
        }
    }

    function clearResults() {
        executionResult.value = null
        executionError.value = null
    }

    // 代码验证
    function validateCode(codeToValidate?: string): { isValid: boolean; errors: string[] } {
        const targetCode = codeToValidate || code.value
        const errors: string[] = []

        // 基础语法检查
        if (!targetCode.trim()) {
            errors.push('代码不能为空')
        }

        // JavaScript/TypeScript 基础语法检查
        if (language.value === 'javascript' || language.value === 'typescript') {
            // 检查是否有未闭合的括号
            const openBrackets = (targetCode.match(/[({[]/g) || []).length
            const closeBrackets = (targetCode.match(/[)}\]]/g) || []).length
            if (openBrackets !== closeBrackets) {
                errors.push('括号不匹配')
            }

            // 检查是否有基本的语法错误
            try {
                // 简单的语法检查，实际项目中应该使用更完善的解析器
                new Function(targetCode)
            } catch (error) {
                if (error instanceof SyntaxError) {
                    errors.push(`语法错误: ${error.message}`)
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // 代码格式化
    function formatCode(): string {
        const currentCode = getEditorValue()

        // 简单的代码格式化，实际项目中应该使用 Prettier 等工具
        let formatted = currentCode
            .replace(/;/g, ';\n')
            .replace(/{/g, '{\n')
            .replace(/}/g, '\n}')
            .replace(/,/g, ',\n')

        // 简单的缩进处理
        const lines = formatted.split('\n')
        let indentLevel = 0
        const indentSize = 2

        const formattedLines = lines.map(line => {
            const trimmed = line.trim()
            if (!trimmed) return ''

            if (trimmed.includes('}')) indentLevel--
            const indented = ' '.repeat(Math.max(0, indentLevel * indentSize)) + trimmed
            if (trimmed.includes('{')) indentLevel++

            return indented
        })

        return formattedLines.join('\n')
    }

    // 获取代码统计信息
    const codeStats = computed(() => {
        const currentCode = code.value
        return {
            lines: currentCode.split('\n').length,
            characters: currentCode.length,
            charactersNoSpaces: currentCode.replace(/\s/g, '').length,
            words: currentCode.split(/\s+/).filter(word => word.length > 0).length
        }
    })

    return {
        // Refs
        editorRef,
        code: readonly.value ? computed(() => code.value) : code,
        language,
        theme,
        readonly,
        isExecuting,
        executionResult,
        executionError,

        // Computed
        hasCode,
        canExecute,
        codeStats,

        // Methods
        updateCode,
        resetCode,
        setLanguage,
        setTheme,
        setReadonly,
        focusEditor,
        getEditorValue,
        setEditorValue,
        executeCode,
        clearResults,
        validateCode,
        formatCode
    }
}

// 预设的代码模板
export const codeTemplates = {
    javascript: {
        basic: `// JavaScript 基础示例
console.log('Hello, Vue 3!');

// 变量声明
const message = 'Welcome to Vue 3 Learning';
let count = 0;

// 函数定义
function increment() {
  count++;
  console.log('Count:', count);
}

increment();`,

        vue: `// Vue 3 组件示例
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);
    
    function increment() {
      count.value++;
    }
    
    return {
      count,
      doubleCount,
      increment
    };
  }
};`
    },

    typescript: {
        basic: `// TypeScript 基础示例
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'Vue Developer',
  age: 25
};

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

console.log(greetUser(user));`,

        vue: `// Vue 3 + TypeScript 组件示例
import { ref, computed, type Ref } from 'vue';

interface Props {
  initialCount?: number;
}

export default defineComponent({
  props: {
    initialCount: {
      type: Number,
      default: 0
    }
  },
  setup(props: Props) {
    const count: Ref<number> = ref(props.initialCount || 0);
    const isEven = computed(() => count.value % 2 === 0);
    
    function increment(): void {
      count.value++;
    }
    
    return {
      count,
      isEven,
      increment
    };
  }
});`
    },

    vue: {
        template: `<template>
  <div class="hello-vue">
    <h1>{{ message }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('Hello Vue 3!');
const count = ref(0);

function increment() {
  count.value++;
}
</script>

<style scoped>
.hello-vue {
  text-align: center;
  padding: 20px;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #369870;
}
</style>`
    }
}