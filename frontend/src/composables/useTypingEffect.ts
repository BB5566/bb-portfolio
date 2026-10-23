import { onMounted, onUnmounted, ref, type Ref } from 'vue'

interface TypingEffectOptions {
  messages: string[]
  typingSpeed?: number // 打字速度（毫秒）
  deletingSpeed?: number // 刪除速度（毫秒）
  pauseTime?: number // 訊息顯示暫停時間（毫秒）
}

export function useTypingEffect(options: TypingEffectOptions) {
  const {
    messages: initialMessages,
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseTime = 2000
  } = options

  const messages = ref([...initialMessages])
  const displayText: Ref<string> = ref('')
  const isDeleting: Ref<boolean> = ref(false)
  const currentMessageIndex: Ref<number> = ref(0)

  let timeoutId: number | null = null

  const type = () => {
    const currentMessage = messages.value[currentMessageIndex.value]
    if (!currentMessage) return

    if (isDeleting.value) {
      // 刪除模式
      displayText.value = currentMessage.substring(0, displayText.value.length - 1)

      if (displayText.value === '') {
        isDeleting.value = false
        currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.value.length
        timeoutId = window.setTimeout(type, 500)
      } else {
        timeoutId = window.setTimeout(type, deletingSpeed)
      }
    } else {
      // 打字模式
      displayText.value = currentMessage.substring(0, displayText.value.length + 1)

      if (displayText.value === currentMessage) {
        // 訊息打完，暫停後開始刪除
        timeoutId = window.setTimeout(() => {
          isDeleting.value = true
          type()
        }, pauseTime)
      } else {
        timeoutId = window.setTimeout(type, typingSpeed)
      }
    }
  }

  const start = () => {
    type()
  }

  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const updateMessages = (newMessages: string[]) => {
    // 先清掉舊的 pending timeout，避免新舊計時器同時跑造成文字錯亂
    stop()
    messages.value = [...newMessages]
    // 重置到第一條訊息
    currentMessageIndex.value = 0
    displayText.value = ''
    isDeleting.value = false
    // 以新訊息重新啟動打字流程
    start()
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    displayText,
    isDeleting,
    start,
    stop,
    updateMessages
  }
}
