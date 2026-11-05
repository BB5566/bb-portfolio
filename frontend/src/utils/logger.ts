/**
 * Logger 系統 - 統一管理應用程式日誌
 *
 * 特色：
 * - 環境感知：生產環境自動隱藏 debug/info 級別日誌
 * - 彩色輸出：不同級別的日誌使用不同顏色
 * - 模組標記：支援模組名稱標記，方便定位問題
 * - 時間戳記：自動添加時間戳
 * - 錯誤堆疊：錯誤日誌自動顯示堆疊資訊
 * - 可擴展：易於集成外部日誌服務（如 Sentry）
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

interface LoggerConfig {
  level: LogLevel
  enableTimestamp: boolean
  enableColors: boolean
  enableModuleName: boolean
}

class Logger {
  private config: LoggerConfig = {
    level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.NONE,
    enableTimestamp: true,
    enableColors: true,
    enableModuleName: true
  }

  // 顏色定義
  private colors = {
    debug: 'color: #6B7280; font-weight: normal;',
    info: 'color: #3B82F6; font-weight: normal;',
    warn: 'color: #F59E0B; font-weight: bold;',
    error: 'color: #EF4444; font-weight: bold;',
    module: 'color: #8B5CF6; font-weight: bold;',
    timestamp: 'color: #6B7280; font-style: italic;'
  }

  /**
   * 設定 Logger 配置
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 取得目前時間戳
   */
  private getTimestamp(): string {
    const now = new Date()
    const parts = now.toISOString().split('T')
    const timePart = parts[1]
    if (!timePart) return ''
    return timePart.slice(0, -1)
  }

  /**
   * 格式化訊息
   */
  private formatMessage(level: string, module: string | undefined, message: string): string[] {
    const parts: string[] = []
    const styles: string[] = []

    // 時間戳
    if (this.config.enableTimestamp) {
      parts.push(`[${this.getTimestamp()}]`)
      styles.push(this.colors.timestamp)
    }

    // 級別
    parts.push(`[${level.toUpperCase()}]`)
    styles.push(this.colors[level.toLowerCase() as keyof typeof this.colors] || '')

    // 模組名稱
    if (this.config.enableModuleName && module) {
      parts.push(`[${module}]`)
      styles.push(this.colors.module)
    }

    // 訊息
    parts.push(message)
    styles.push('color: inherit;')

    return [parts.map((_, i) => `%c${parts[i]}`).join(' '), ...styles]
  }

  /**
   * Debug 級別日誌
   */
  debug(message: string, module?: string, ...args: unknown[]) {
    if (import.meta.env.PROD) return
    if (this.config.level > LogLevel.DEBUG) return

    const [formatted, ...styles] = this.formatMessage('debug', module, message)

    if (this.config.enableColors && console.log) {
      console.log(formatted, ...styles, ...args)
    } else if (console.log) {
      console.log(`[DEBUG]${module ? ` [${module}]` : ''} ${message}`, ...args)
    }
  }

  /**
   * Info 級別日誌
   */
  info(message: string, module?: string, ...args: unknown[]) {
    if (import.meta.env.PROD) return
    if (this.config.level > LogLevel.INFO) return

    const [formatted, ...styles] = this.formatMessage('info', module, message)

    if (this.config.enableColors && console.info) {
      console.info(formatted, ...styles, ...args)
    } else if (console.info) {
      console.info(`[INFO]${module ? ` [${module}]` : ''} ${message}`, ...args)
    }
  }

  /**
   * Warning 級別日誌
   */
  warn(message: string, module?: string, ...args: unknown[]) {
    if (import.meta.env.PROD) return
    if (this.config.level > LogLevel.WARN) return

    const [formatted, ...styles] = this.formatMessage('warn', module, message)

    if (this.config.enableColors && console.warn) {
      console.warn(formatted, ...styles, ...args)
    } else if (console.warn) {
      console.warn(`[WARN]${module ? ` [${module}]` : ''} ${message}`, ...args)
    }
  }

  /**
   * Error 級別日誌
   */
  error(message: string, error?: Error | unknown, module?: string) {
    if (import.meta.env.PROD) return
    if (this.config.level > LogLevel.ERROR) return

    const [formatted, ...styles] = this.formatMessage('error', module, message)

    if (this.config.enableColors && console.error) {
      console.error(formatted, ...styles)
    } else if (console.error) {
      console.error(`[ERROR]${module ? ` [${module}]` : ''} ${message}`)
    }

    // 顯示錯誤詳情
    if (error) {
      if (error instanceof Error) {
        console.error('Error Details:', {
          message: error.message,
          stack: error.stack
        })
      } else {
        console.error('Error Details:', error)
      }
    }

    // 在生產環境可以在這裡整合錯誤追蹤服務
    if (!import.meta.env.DEV && error) {
      // 例如：Sentry.captureException(error)
      this.reportToExternalService(message, error, module)
    }
  }

  /**
   * 群組日誌（用於相關日誌的分組）
   */
  group(label: string) {
    if (console.group) {
      console.group(label)
    }
  }

  /**
   * 結束群組
   */
  groupEnd() {
    if (console.groupEnd) {
      console.groupEnd()
    }
  }

  /**
   * 表格日誌（用於顯示結構化數據）
   */
  table(data: unknown, columns?: string[]) {
    if (console.table) {
      console.table(data, columns)
    }
  }

  /**
   * 效能測量開始
   */
  time(label: string) {
    if (this.config.level <= LogLevel.DEBUG && console.time) {
      console.time(label)
    }
  }

  /**
   * 效能測量結束
   */
  timeEnd(label: string) {
    if (this.config.level <= LogLevel.DEBUG && console.timeEnd) {
      console.timeEnd(label)
    }
  }

  /**
   * 清除控制台
   */
  clear() {
    if (console.clear) {
      console.clear()
    }
  }

  /**
   * 回報錯誤到外部服務
   */
  private reportToExternalService(_message: string, _error: unknown, _module?: string) {
    // 這裡可以整合 Sentry、LogRocket 等錯誤追蹤服務
    // 範例：
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { module },
    //     extra: { message }
    //   })
    // }
    // 或發送到自訂的日誌收集端點
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     level: 'error',
    //     message,
    //     error: error instanceof Error ? error.stack : String(error),
    //     module,
    //     timestamp: new Date().toISOString(),
    //     userAgent: navigator.userAgent,
    //     url: window.location.href
    //   })
    // }).catch(() => {
    //   // 忽略日誌上報失敗
    // })
  }
}

// 建立單例實例
const logger = new Logger()

// 匯出便利方法
export const log = {
  debug: (message: string, module?: string, ...args: unknown[]) =>
    logger.debug(message, module, ...args),

  info: (message: string, module?: string, ...args: unknown[]) =>
    logger.info(message, module, ...args),

  warn: (message: string, module?: string, ...args: unknown[]) =>
    logger.warn(message, module, ...args),

  error: (message: string, error?: Error | unknown, module?: string) =>
    logger.error(message, error, module),

  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
  table: (data: unknown, columns?: string[]) => logger.table(data, columns),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  clear: () => logger.clear(),
  configure: (config: Partial<LoggerConfig>) => logger.configure(config)
}

// 預設匯出
export default logger
