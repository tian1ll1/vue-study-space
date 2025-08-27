// 安全的代码执行环境
export interface ExecutionResult {
    success: boolean
    output: any[]
    error: string | null
    executionTime: number
    memoryUsage?: number
}

export interface ExecutionOptions {
    timeout?: number // 毫秒
    maxMemory?: number // 字节
    allowedGlobals?: string[]
    disallowedPatterns?: RegExp[]
}

export class CodeExecutor {
    private defaultOptions: ExecutionOptions = {
        timeout: 5000, // 5秒超时
        maxMemory: 50 * 1024 * 1024, // 50MB
        allowedGlobals: ['console', 'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean'],
        disallowedPatterns: [
            /eval\s*\(/,
            /Function\s*\(/,
            /setTimeout\s*\(/,
            /setInterval\s*\(/,
            /XMLHttpRequest/,
            /fetch\s*\(/,
            /import\s*\(/,
            /require\s*\(/,
            /process\./,
            /global\./,
            /window\./,
            /document\./,
            /location\./,
            /history\./,
            /navigator\./
        ]
    }

    private consoleOutput: any[] = []
    private originalConsole: any = {}

    constructor(private options: ExecutionOptions = {}) {
        this.options = { ...this.defaultOptions, ...options }
    }

    async execute(code: string, options?: Partial<ExecutionOptions>): Promise<ExecutionResult> {
        const execOptions = { ...this.options, ...options }
        const startTime = Date.now()

        try {
            // 安全性检查
            this.validateCode(code, execOptions)

            // 准备执行环境
            this.setupSandbox()

            // 执行代码
            const result = await this.runCode(code, execOptions)

            return {
                success: true,
                output: this.consoleOutput,
                error: null,
                executionTime: Date.now() - startTime,
                ...result
            }
        } catch (error) {
            return {
                success: false,
                output: this.consoleOutput,
                error: error instanceof Error ? error.message : String(error),
                executionTime: Date.now() - startTime
            }
        } finally {
            this.cleanup()
        }
    }

    private validateCode(code: string, options: ExecutionOptions): void {
        // 检查禁用的模式
        if (options.disallowedPatterns) {
            for (const pattern of options.disallowedPatterns) {
                if (pattern.test(code)) {
                    throw new Error(`代码包含不允许的操作: ${pattern.source}`)
                }
            }
        }

        // 检查代码长度
        if (code.length > 100000) {
            throw new Error('代码长度超过限制')
        }

        // 基础语法检查
        try {
            new Function(code)
        } catch (error) {
            throw new Error(`语法错误: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    private setupSandbox(): void {
        // 备份原始console
        this.originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        }

        // 重置输出
        this.consoleOutput = []

        // 拦截console输出
        console.log = (...args) => {
            this.consoleOutput.push({ type: 'log', args, timestamp: new Date() })
            this.originalConsole.log(...args)
        }

        console.info = (...args) => {
            this.consoleOutput.push({ type: 'info', args, timestamp: new Date() })
            this.originalConsole.info(...args)
        }

        console.warn = (...args) => {
            this.consoleOutput.push({ type: 'warn', args, timestamp: new Date() })
            this.originalConsole.warn(...args)
        }

        console.error = (...args) => {
            this.consoleOutput.push({ type: 'error', args, timestamp: new Date() })
            this.originalConsole.error(...args)
        }
    }

    private async runCode(code: string, options: ExecutionOptions): Promise<Partial<ExecutionResult>> {
        return new Promise((resolve, reject) => {
            // 设置超时
            const timeoutId = setTimeout(() => {
                reject(new Error(`代码执行超时 (${options.timeout}ms)`))
            }, options.timeout)

            try {
                // 创建安全的执行上下文
                const safeGlobals = this.createSafeGlobals(options.allowedGlobals || [])

                // 构建安全的函数
                const safeFunction = new Function(
                    ...Object.keys(safeGlobals),
                    `
          "use strict";
          try {
            ${code}
          } catch (error) {
            console.error('运行时错误:', error.message);
            throw error;
          }
          `
                )

                // 执行代码
                const result = safeFunction(...Object.values(safeGlobals))

                clearTimeout(timeoutId)
                resolve({})
            } catch (error) {
                clearTimeout(timeoutId)
                reject(error)
            }
        })
    }

    private createSafeGlobals(allowedGlobals: string[]): Record<string, any> {
        const safeGlobals: Record<string, any> = {}

        // 添加允许的全局对象
        for (const globalName of allowedGlobals) {
            switch (globalName) {
                case 'console':
                    safeGlobals.console = {
                        log: console.log,
                        info: console.info,
                        warn: console.warn,
                        error: console.error
                    }
                    break
                case 'Math':
                    safeGlobals.Math = Math
                    break
                case 'Date':
                    safeGlobals.Date = Date
                    break
                case 'JSON':
                    safeGlobals.JSON = JSON
                    break
                case 'Array':
                    safeGlobals.Array = Array
                    break
                case 'Object':
                    safeGlobals.Object = Object
                    break
                case 'String':
                    safeGlobals.String = String
                    break
                case 'Number':
                    safeGlobals.Number = Number
                    break
                case 'Boolean':
                    safeGlobals.Boolean = Boolean
                    break
                default:
                    // 忽略未知的全局对象
                    break
            }
        }

        return safeGlobals
    }

    private cleanup(): void {
        // 恢复原始console
        if (this.originalConsole.log) {
            console.log = this.originalConsole.log
            console.info = this.originalConsole.info
            console.warn = this.originalConsole.warn
            console.error = this.originalConsole.error
        }
    }

    // 获取执行统计信息
    getStats(): { outputCount: number; lastExecution: Date | null } {
        return {
            outputCount: this.consoleOutput.length,
            lastExecution: this.consoleOutput.length > 0
                ? this.consoleOutput[this.consoleOutput.length - 1].timestamp
                : null
        }
    }

    // 清空输出
    clearOutput(): void {
        this.consoleOutput = []
    }
}

// Vue组件执行器
export class VueComponentExecutor extends CodeExecutor {
    constructor(options?: ExecutionOptions) {
        super({
            ...options,
            allowedGlobals: [
                ...(options?.allowedGlobals || []),
                'Vue', 'ref', 'reactive', 'computed', 'watch', 'onMounted', 'onUnmounted'
            ]
        })
    }

    async executeVueComponent(code: string, options?: Partial<ExecutionOptions>): Promise<ExecutionResult & { component?: any }> {
        try {
            // 预处理Vue组件代码
            const processedCode = this.preprocessVueCode(code)

            // 执行代码
            const result = await this.execute(processedCode, options)

            return {
                ...result,
                component: result.success ? this.extractComponent(processedCode) : null
            }
        } catch (error) {
            return {
                success: false,
                output: [],
                error: error instanceof Error ? error.message : String(error),
                executionTime: 0
            }
        }
    }

    private preprocessVueCode(code: string): string {
        // 简单的Vue代码预处理
        // 在实际项目中，这里应该使用更完善的Vue编译器

        // 如果是完整的Vue组件，提取script部分
        const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
        if (scriptMatch) {
            return scriptMatch[1]
        }

        // 如果是纯JavaScript代码，直接返回
        return code
    }

    private extractComponent(code: string): any {
        // 尝试提取Vue组件定义
        try {
            // 这是一个简化的实现，实际项目中需要更复杂的解析
            if (code.includes('export default')) {
                const match = code.match(/export\s+default\s+({[\s\S]*})/)
                if (match) {
                    return new Function('return ' + match[1])()
                }
            }

            if (code.includes('defineComponent')) {
                const match = code.match(/defineComponent\s*\(\s*({[\s\S]*})\s*\)/)
                if (match) {
                    return new Function('return ' + match[1])()
                }
            }

            return null
        } catch (error) {
            console.warn('Failed to extract Vue component:', error)
            return null
        }
    }
}

// 默认执行器实例
export const defaultExecutor = new CodeExecutor()
export const vueExecutor = new VueComponentExecutor()

// 便捷函数
export async function executeCode(code: string, options?: Partial<ExecutionOptions>): Promise<ExecutionResult> {
    return defaultExecutor.execute(code, options)
}

export async function executeVueCode(code: string, options?: Partial<ExecutionOptions>): Promise<ExecutionResult & { component?: any }> {
    return vueExecutor.executeVueComponent(code, options)
}