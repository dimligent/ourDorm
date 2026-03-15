<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { flagApi } from "../api";
import type { Flag } from "../types";

const route = useRoute();
const router = useRouter();
const flag = ref<Flag | null>(null);
const loading = ref(true);

const loadFlagDetail = async () => {
  try {
    const flagId = Number(route.params.id);
    const response = await flagApi.getFlagDetail(flagId);
    if (response.code === "200" && response.data) {
      flag.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load flag detail:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFlagDetail();
});
</script>

<template>
  <div class="flag-detail-container">
    <div class="header">
      <button class="back-btn" @click="router.back()">← 返回</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="flag" class="flag-detail">
      <h1 class="flag-title">{{ flag.title }}</h1>
      <p class="flag-content">{{ flag.content }}</p>

      <div v-if="flag.members && flag.members.length > 0" class="section">
        <h2>参与成员</h2>
        <div class="members-list">
          <div
            v-for="member in flag.members"
            :key="member.id"
            class="member-item"
          >
            <span class="member-name">{{ member.name }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="flag.checkinLogs && flag.checkinLogs.length > 0"
        class="section"
      >
        <h2>打卡记录</h2>
        <div class="checkin-list">
          <div
            v-for="(log, index) in flag.checkinLogs"
            :key="index"
            class="checkin-item"
          >
            <span class="checkin-member">{{ log.member }}</span>
            <span class="checkin-date">{{ log.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flag-detail-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.header {
  padding: 20px 0;
}

.back-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.flag-detail {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.flag-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
}

.flag-content {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.member-item {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.checkin-member {
  font-weight: 600;
  color: #333;
}

.checkin-date {
  color: #666;
}
</style>
