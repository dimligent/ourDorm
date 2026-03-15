<script setup lang="ts">
import { ref, onMounted } from "vue";
import { countdownApi } from "../api";
import type { Countdown } from "../types";

const countdowns = ref<Countdown[]>([]);
const showAddModal = ref(false);
const showDeleteModal = ref(false);

const newCountdown = ref({
  title: "",
  targetDate: "",
});

const editingCountdown = ref<Countdown | null>(null);

const loadCountdowns = async () => {
  try {
    const response = await countdownApi.getCountdowns();
    if (response.code === "200" && response.data) {
      countdowns.value = response.data.sort(
        (a, b) => a.orderIndex - b.orderIndex,
      );
    }
  } catch (error) {
    console.error("Failed to load countdowns:", error);
  }
};

const createCountdown = async () => {
  try {
    const response = await countdownApi.createCountdown(newCountdown.value);
    if (response.code === "200") {
      showAddModal.value = false;
      newCountdown.value = { title: "", targetDate: "" };
      await loadCountdowns();
    }
  } catch (error) {
    console.error("Failed to create countdown:", error);
  }
};

const updateCountdown = async () => {
  if (!editingCountdown.value) return;

  try {
    const response = await countdownApi.updateCountdown({
      id: editingCountdown.value.id,
      title: editingCountdown.value.title,
      targetDate: editingCountdown.value.date,
    });
    if (response.code === "200") {
      editingCountdown.value = null;
      await loadCountdowns();
    }
  } catch (error) {
    console.error("Failed to update countdown:", error);
  }
};

const deleteCountdown = async (id: number) => {
  try {
    const response = await countdownApi.deleteCountdown(id);
    if (response.code === "200") {
      await loadCountdowns();
    }
  } catch (error) {
    console.error("Failed to delete countdown:", error);
  }
};

const getDaysColor = (days: number) => {
  if (days > 30) return "#4caf50";
  if (days >= 7) return "#ff9800";
  return "#f44336";
};

onMounted(() => {
  loadCountdowns();
});
</script>

<template>
  <div class="countdown-container">
    <div class="header">
      <h1 class="title">倒数日</h1>
    </div>

    <div class="countdown-list">
      <div v-if="countdowns.length === 0" class="empty-state">
        <p>还没有倒数日，快去添加一个吧！</p>
      </div>

      <div
        v-for="countdown in countdowns"
        :key="countdown.id"
        class="countdown-item"
      >
        <div
          class="countdown-info"
          @click="editingCountdown = { ...countdown }"
        >
          <div class="countdown-title">距离{{ countdown.title }}还有</div>
        </div>
        <div
          class="countdown-days"
          :style="{ backgroundColor: getDaysColor(countdown.daysLeft) }"
        >
          {{ countdown.daysLeft }}天
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button class="action-btn primary" @click="showAddModal = true">
        添加倒数日
      </button>
      <button class="action-btn secondary" @click="showDeleteModal = true">
        删除
      </button>
    </div>

    <div
      v-if="showAddModal"
      class="modal-overlay"
      @click.self="showAddModal = false"
    >
      <div class="modal">
        <h2>添加倒数日</h2>
        <div class="form-group">
          <label>事件名称</label>
          <input
            v-model="newCountdown.title"
            type="text"
            placeholder="例如：英语六级考试"
          />
        </div>
        <div class="form-group">
          <label>目标日期</label>
          <input v-model="newCountdown.targetDate" type="date" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="createCountdown">添加</button>
        </div>
      </div>
    </div>

    <div
      v-if="editingCountdown"
      class="modal-overlay"
      @click.self="editingCountdown = null"
    >
      <div class="modal">
        <h2>编辑倒数日</h2>
        <div class="form-group">
          <label>事件名称</label>
          <input v-model="editingCountdown.title" type="text" />
        </div>
        <div class="form-group">
          <label>目标日期</label>
          <input v-model="editingCountdown.date" type="date" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="editingCountdown = null">
            取消
          </button>
          <button class="btn-confirm" @click="updateCountdown">保存</button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="modal">
        <h2>删除倒数日</h2>
        <div class="delete-list">
          <div v-if="countdowns.length === 0" class="empty-state">
            <p>没有可删除的倒数日</p>
          </div>
          <div
            v-for="countdown in countdowns"
            :key="countdown.id"
            class="delete-item"
          >
            <span>{{ countdown.title }}</span>
            <button class="delete-btn" @click="deleteCountdown(countdown.id)">
              删除
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown-container {
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

.countdown-list {
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.countdown-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.countdown-item:hover {
  transform: translateY(-2px);
}

.countdown-info {
  flex: 1;
  cursor: pointer;
}

.countdown-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.countdown-days {
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 20px;
  font-weight: bold;
  min-width: 100px;
  text-align: center;
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

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
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

.delete-list {
  max-height: 300px;
  overflow-y: auto;
}

.delete-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 10px;
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
</style>
