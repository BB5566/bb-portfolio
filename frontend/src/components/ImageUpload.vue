<template>
  <div class="image-upload">
    <!-- 圖片預覽 -->
    <div v-if="imageUrl" class="image-preview">
      <el-image
        :src="getFullImageUrl(imageUrl)"
        fit="cover"
        class="preview-image"
        :preview-src-list="[getFullImageUrl(imageUrl)]"
      />
      <div class="image-actions">
        <el-button type="danger" size="small" :icon="Delete" @click="handleRemove">移除</el-button>
      </div>
    </div>

    <!-- 上傳區域 -->
    <el-upload
      v-else
      class="upload-area"
      drag
      :action="uploadUrl"
      :headers="uploadHeaders"
      name="file"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      accept="image/*"
    >
      <el-icon class="upload-icon"><Upload /></el-icon>
      <div class="upload-text">拖曳圖片到這裡，或點擊上傳</div>
      <div class="upload-tip">自動優化為 WebP 格式 (最大 10MB)</div>
    </el-upload>

    <!-- 或手動輸入 URL -->
    <div class="manual-input">
      <el-input v-model="manualUrl" placeholder="或直接輸入圖片 URL" @blur="handleManualUrl">
        <template #prepend>URL</template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, watch, computed } from 'vue'
import { ElMessage, type UploadProps } from 'element-plus'
import { Upload, Delete } from '@element-plus/icons-vue'
import { getFullImageUrl } from '@/utils/image'
import { useAuthStore } from '@/stores/admin/auth'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const imageUrl = ref(props.modelValue)
const manualUrl = ref('')
const authStore = useAuthStore()

// 統一指向 Laravel 影像處理介面
const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/admin/upload-image`

// 加入認證 Header，確保只有管理員能上傳
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${authStore.token}`
}))

// 監聽外部變化
watch(
  () => props.modelValue,
  (newVal) => {
    imageUrl.value = newVal
  }
)

// 上傳前驗證
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上傳圖片檔案！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('圖片大小不能超過 5MB！')
    return false
  }
  return true
}

interface UploadResponse {
  success: boolean
  data?: { url: string }
  error?: string
}

// 上傳成功
const handleSuccess = (response: UploadResponse) => {
  if (response.success && response.data) {
    imageUrl.value = response.data.url
    emit('update:modelValue', response.data.url)
    ElMessage.success('圖片上傳成功')
  } else {
    ElMessage.error('上傳失敗：' + (response.error || '未知錯誤'))
  }
}

// 上傳失敗
const handleError = (error: Error) => {
  if (import.meta.env.DEV) {
    log.error('上傳失敗:', error)
  }
  ElMessage.error('圖片上傳失敗，請稍後再試')
}

// 移除圖片
const handleRemove = () => {
  imageUrl.value = ''
  manualUrl.value = ''
  emit('update:modelValue', '')
}

// 手動輸入 URL
const handleManualUrl = () => {
  if (manualUrl.value) {
    imageUrl.value = manualUrl.value
    emit('update:modelValue', manualUrl.value)
  }
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.image-preview {
  margin-bottom: var(--space-md);
}

.preview-image {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.image-actions {
  margin-top: var(--space-sm);
}

.upload-area {
  margin-bottom: var(--space-md);
}

:deep(.el-upload-dragger) {
  padding: var(--space-xl);
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
}

.upload-icon {
  font-size: 48px;
  color: var(--el-text-color-secondary);
  margin-bottom: var(--space-md);
}

.upload-text {
  font-size: var(--font-size-base);
  color: var(--el-text-color-regular);
  margin-bottom: var(--space-sm);
}

.upload-tip {
  font-size: var(--font-size-sm);
  color: var(--el-text-color-secondary);
}

.manual-input {
  margin-top: var(--space-md);
}
</style>
