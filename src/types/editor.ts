// Code editor and execution environment types

export interface EditorTheme {
    name: string
    displayName: string
    type: 'light' | 'dark'
    colors: {
        background: string
        foreground: string
        selection: string
        lineHighlight: string
        cursor: string
    }
}

export interface EditorSettings {
    theme: string
    fontSize: number
    fontFamily: string
    tabSize: number
    insertSpaces: boolean
    wordWrap: 'on' | 'off' | 'wordWrapColumn'
    lineNumbers: 'on' | 'off' | 'relative'
    minimap: boolean
    folding: boolean
    autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
    autoClosingQuotes: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
    formatOnSave: boolean
    formatOnType: boolean
}

export interface CodeSnippet {
    id: string
    name: string
    description: string
    language: string
    code: string
    tags: string[]
    category: string
    insertText: string
    documentation?: string
}

export interface CodeCompletion {
    label: string
    kind: 'function' | 'variable' | 'class' | 'interface' | 'module' | 'property' | 'method' | 'keyword'
    detail?: string
    documentation?: string
    insertText: string
    sortText?: string
    filterText?: string
}

export interface DiagnosticMessage {
    severity: 'error' | 'warning' | 'info' | 'hint'
    message: string
    startLineNumber: number
    startColumn: number
    endLineNumber: number
    endColumn: number
    source?: string
    code?: string
}

export interface CodeExecutionContext {
    id: string
    language: 'javascript' | 'typescript' | 'vue'
    code: string
    dependencies: Record<string, string>
    timeout: number // milliseconds
    memoryLimit: number // bytes
}

export interface ExecutionEnvironment {
    id: string
    name: string
    description: string
    supportedLanguages: string[]
    defaultTimeout: number
    maxMemory: number
    availableLibraries: string[]
    securityLevel: 'sandbox' | 'restricted' | 'full'
}

export interface CodeExecutionLog {
    timestamp: Date
    level: 'log' | 'info' | 'warn' | 'error'
    message: string
    source?: string
    line?: number
    column?: number
}

export interface CodeExecutionMetrics {
    executionTime: number // milliseconds
    memoryUsage: number // bytes
    cpuUsage: number // percentage
    outputSize: number // bytes
    errorCount: number
    warningCount: number
}

export interface CodeValidationRule {
    id: string
    name: string
    description: string
    severity: 'error' | 'warning' | 'info'
    pattern?: RegExp
    validator?: (code: string) => boolean
    message: string
    fixSuggestion?: string
}

export interface CodeFormatter {
    name: string
    language: string
    format: (code: string, options?: any) => Promise<string>
    options: Record<string, any>
}

export interface CodeDiff {
    oldCode: string
    newCode: string
    changes: CodeChange[]
}

export interface CodeChange {
    type: 'insert' | 'delete' | 'modify'
    startLine: number
    endLine: number
    oldText?: string
    newText?: string
}

export interface EditorAction {
    id: string
    label: string
    keybinding?: string
    contextMenuGroup?: string
    run: (editor: any) => void | Promise<void>
}

export interface EditorCommand {
    id: string
    title: string
    category?: string
    handler: (...args: any[]) => void | Promise<void>
}

export interface FileSystemEntry {
    name: string
    type: 'file' | 'directory'
    path: string
    size?: number
    lastModified?: Date
    content?: string
    children?: FileSystemEntry[]
}

export interface ProjectStructure {
    name: string
    description: string
    files: FileSystemEntry[]
    dependencies: Record<string, string>
    scripts: Record<string, string>
    configuration: Record<string, any>
}

export interface CodeTemplate {
    id: string
    name: string
    description: string
    language: string
    category: string
    template: string
    variables: TemplateVariable[]
    preview?: string
}

export interface TemplateVariable {
    name: string
    description: string
    type: 'string' | 'number' | 'boolean' | 'select'
    defaultValue?: any
    options?: string[] // for select type
    required: boolean
}

// CodeEditor component interfaces
export interface CodeEditorProps {
    modelValue: string
    language?: 'javascript' | 'typescript' | 'vue' | 'html' | 'css'
    theme?: 'vs-dark' | 'vs-light'
    readonly?: boolean
    height?: string
    placeholder?: string
}

export interface CodeEditorEmits {
    'update:modelValue': [value: string]
    'change': [value: string]
    'run': [code: string]
    'reset': []
}

export interface CodeEditorInstance {
    getValue: () => string
    setValue: (value: string) => void
    focus: () => void
    getEditor: () => any
}

// CodePreview component interfaces
export interface CodePreviewProps {
    code: string
    language?: 'vue' | 'javascript' | 'typescript'
    autoRefresh?: boolean
    componentProps?: Record<string, any>
}

export interface CodePreviewEmits {
    compiled: [component: any]
    error: [error: string]
    console: [log: ConsoleLog]
}

export interface ConsoleLog {
    level: 'log' | 'info' | 'warn' | 'error'
    message: string
    timestamp: Date
}

export interface CodePreviewInstance {
    refresh: () => void
    clear: () => void
    getComponent: () => any
    hasError: () => boolean
    getError: () => string
}