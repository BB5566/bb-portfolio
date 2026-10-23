<template>
  <div class="gallery-manager">
    <div class="gallery-header">
      <h4>專案圖庫</h4>
      <el-button type="primary" size="small" :icon="Plus" @click="handleAdd">新增圖片</el-button>
    </div>

    <!-- 圖片列表 -->
    <div class="gallery-list">
      <div v-for="(item, index) in galleries" :key="item.id || index" class="gallery-item">
        <el-image
          :src="getFullImageUrl(item.image_url)"
          fit="cover"
          class="gallery-image"
          :preview-src-list="[getFullImageUrl(item.image_url)]"
        />
        <div class="gallery-info">
          <el-input
            v-model="item.caption"
            placeholder="圖片說明（選填）"
            size="small"
            @blur="handleUpdate(item)"
          />
          <div class="gallery-actions">
            <el-button
              size="small"
              :icon="ArrowUp"
              :disabled="index === 0"
              @click="handleMoveUp(index)"
            />
            <el-button
              size="small"
              :icon="ArrowDown"
              :disabled="index === galleries.length - 1"
              @click="handleMoveDown(index)"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(index, item)"
            />
          </div>
        </div>
      </div>

      <div v-if="galleries.length === 0" class="empty-state">
        <p>尚無圖庫圖片</p>
      </div>
    </div>

    <!-- 新增圖片對話框 -->
    <el-dialog v-model="dialogVisible" title="新增圖庫圖片" width="500px">
      <ImageUpload v-model="newImageUrl" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'
import { getFullImageUrl } from '@/utils/image'
import ImageUpload from './ImageUpload.vue'

interface GalleryItem {
  id: number | null
  image_url: string
  caption: string | null
  sort_order: number
}

const props = defineProps<{
  modelValue: GalleryItem[]
  projectId?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GalleryItem[]): void
}>()

const galleries = ref<GalleryItem[]>(props.modelValue || [])
const dialogVisible = ref(false)
const newImageUrl = ref('')

// 監聽外部變化
watch(
  () => props.modelValue,
  (newVal) => {
    galleries.value = newVal || []
  },
  { deep: true }
)

// 監聽內部變化，同步到外部
watch(
  galleries,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const handleAdd = () => {
  newImageUrl.value = ''
  dialogVisible.value = true
}

const handleConfirmAdd = () => {
  if (!newImageUrl.value) {
    ElMessage.warning('請選擇或輸入圖片')
    return
  }

  galleries.value.push({
    id: null, // 新圖片暫時沒有 ID
    image_url: newImageUrl.value,
    caption: null,
    sort_order: galleries.value.length
  })

  dialogVisible.value = false
  ElMessage.success('圖片已新增')
}

const handleUpdate = (_item: GalleryItem) => {
  // 更新會自動透過 watch 同步
}

const handleMoveUp = (index: number) => {
  if (index > 0) {
    const temp = galleries.value[index]!
    galleries.value[index] = galleries.value[index - 1]!
    galleries.value[index - 1] = temp

    // 更新排序
    galleries.value.forEach((item, idx) => {
      item.sort_order = idx
    })
  }
}

const handleMoveDown = (index: number) => {
  if (index < galleries.value.length - 1) {
    const temp = galleries.value[index]!
    galleries.value[index] = galleries.value[index + 1]!
    galleries.value[index + 1] = temp

    // 更新排序
    galleries.value.forEach((item, idx) => {
      item.sort_order = idx
    })
  }
}

const handleDelete = (index: number, _item: GalleryItem) => {
  galleries.value.splice(index, 1)

  // 更新排序
  galleries.value.forEach((galleryItem, idx) => {
    galleryItem.sort_order = idx
  })

  ElMessage.success('圖片已移除')
}

// getFullImageUrl 已從 @/utils/image 導入，不需要重複定義
</script>

<style scoped>
.gallery-manager {
  width: 100%;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.gallery-header h4 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.gallery-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.gallery-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.gallery-image {
  width: 120px;
  height: 90px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.gallery-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.gallery-actions {
  display: flex;
  gap: var(--space-sm);
}

.empty-state {
  padding: var(--space-xl);
  text-align: center;
  color: var(--el-text-color-secondary);
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
}
</style>
