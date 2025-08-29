import { ref, type Ref } from 'vue'

/**
 * 切换状态组合式函数
 * 演示简单的布尔状态管理
 */
export function useToggle(initialValue = false): [Ref<boolean>, () => void, (value?: boolean) => void] {
    const state = ref(initialValue)

    function toggle() {
        state.value = !state.value
    }

    function setState(value?: boolean) {
        if (typeof value === 'boolean') {
            state.value = value
        } else {
            toggle()
        }
    }

    return [state, toggle, setState]
}

/**
 * 多状态切换组合式函数
 * 演示更复杂的状态切换逻辑
 */
export function useMultiToggle<T>(options: T[], initialIndex = 0) {
    const currentIndex = ref(initialIndex)

    const current = ref(options[initialIndex]) as Ref<T>

    function next() {
        currentIndex.value = (currentIndex.value + 1) % options.length
        current.value = options[currentIndex.value]
    }

    function previous() {
        currentIndex.value = currentIndex.value === 0 ? options.length - 1 : currentIndex.value - 1
        current.value = options[currentIndex.value]
    }

    function setIndex(index: number) {
        if (index >= 0 && index < options.length) {
            currentIndex.value = index
            current.value = options[index]
        }
    }

    function setValue(value: T) {
        const index = options.indexOf(value)
        if (index !== -1) {
            setIndex(index)
        }
    }

    return {
        current,
        currentIndex,
        next,
        previous,
        setIndex,
        setValue,
        options
    }
}