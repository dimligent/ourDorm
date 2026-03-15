<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { logApi } from "../api";
import type { DormLog } from "../types";

const logs = ref<DormLog[]>([]);
const showAddModal = ref(false);
const showCategoryModal = ref(false);
const selectedCategory = ref("all");

const newLog = ref({
  title: "",
  content: "",
  images: [] as string[],
  type: "日常",
});

const categories = ["日常", "聚餐", "出游", "学习", "其他"];

const loadLogs = async () => {
  try {
    const response = await logApi.getLogs();
    if (response.code === "200" && response.data) {
      logs.value = Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (error) {
    console.error("Failed to load logs:", error);
  }
};

const createLog = async () => {
  try {
    const response = await logApi.createLog(newLog.value);
    if (response.code === "200") {
      showAddModal.value = false;
      newLog.value = { title: "", content: "", images: [], type: "日常" };
      await loadLogs();
    }
  } catch (error) {
    console.error("Failed to create log:", error);
  }
};

const deleteLog = async (id: number) => {
  try {
    const response = await logApi.deleteLog(id);
    if (response.code === "200") {
      await loadLogs();
    }
  } catch (error) {
    console.error("Failed to delete log:", error);
  }
};

const filteredLogs = computed(() => {
  if (selectedCategory.value === "all") {
    return logs.value;
  }
  return logs.value.filter((log) => log.type === selectedCategory.value);
});

onMounted(() => {
  loadLogs();
});
</script>

<template>
  <div class="logs-container">
    <div class="header">
      <h1 class="title">宿舍日志</h1>
    </div>

    <div class="logs-list">
      <div v-if="filteredLogs.length === 0" class="empty-state">
        <p>还没有日志，快去添加一条吧！</p>
      </div>

      <div v-for="log in filteredLogs" :key="log.id" class="log-item">
        <div class="log-header">
          <h3 class="log-title">{{ log.title }}</h3>
          <span class="log-type">{{ log.type }}</span>
        </div>
        <p class="log-content">{{ log.content }}</p>
        <div v-if="log.images && log.images.length > 0" class="log-images">
          <img
            v-for="(image, index) in log.images"
            :key="index"
            :src="image"
            :alt="log.title"
          />
        </div>
        <div class="log-footer">
          <span class="log-date">{{
            new Date(log.createTime).toLocaleDateString()
          }}</span>
          <button class="delete-btn" @click="deleteLog(log.id)">删除</button>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="action-btn primary" @click="showAddModal = true">
        添加日志
      </button>
      <button class="action-btn secondary" @click="showCategoryModal = true">
        类别
      </button>
    </div>

    <div
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="showAddModal = false"
    >
      <div class="modal">
        <h2>添加日志</h2>
        <div class="form-group">
          <label>标题</label>
          <input v-model="newLog.title" type="text" placeholder="日志标题" />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea
            v-model="newLog.content"
            placeholder="记录美好时刻..."
          ></textarea>
        </div>
        <div class="form-group">
          <label>类型</label>
          <select v-model="newLog.type">
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>图片（可选）</label>
          <input type="file" multiple accept="image/*" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="createLog">添加</button>
        </div>
      </div>
    </div>

    <div
      v-if="showCategoryModal"
      class="modal-overlay"
      @click.self="showCategoryModal = false"
    >
      <div class="modal">
        <h2>选择类别</h2>
        <div class="category-list">
          <div
            class="category-item"
            :class="{ active: selectedCategory === 'all' }"
            @click="
              selectedCategory = 'all';
              showCategoryModal = false;
            "
          >
            全部
          </div>
          <div
            v-for="category in categories"
            :key="category"
            class="category-item"
            :class="{ active: selectedCategory === category }"
            @click="
              selectedCategory = category;
              showCategoryModal = false;
            "
          >
            {{ category }}
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showCategoryModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logs-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  padding: 20px 0;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.logs-list {
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.log-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.log-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.log-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.log-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.log-images img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.log-date {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  padding: 6px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-btn {
  padding: 15px 40px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #4caf50;
  color: white;
}

.action-btn.primary:hover {
  background: #45a049;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #333;
}

.action-btn.secondary:hover {
  background: #e0e0e0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-confirm {
  background: #4caf50;
  color: white;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: #e0e0e0;
}

.category-item.active {
  background: #4caf50;
  color: white;
}
</style>
