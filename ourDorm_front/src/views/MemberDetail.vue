<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { memberApi } from "../api";
import type { Member } from "../types";

const route = useRoute();
const router = useRouter();

const member = ref<Member | null>(null);
const loading = ref(true);
const error = ref("");

const loadMember = async () => {
  loading.value = true;
  error.value = "";
  try {
    const memberId = Number(route.params.id);
    if (!Number.isFinite(memberId)) {
      error.value = "成员ID不合法";
      return;
    }
    const res = await memberApi.getMemberDetail(memberId);
    if (res.code === "200" && res.data) {
      member.value = res.data;
    } else {
      error.value = res.message || "获取成员信息失败";
    }
  } catch (e) {
    error.value = "获取成员信息失败";
  } finally {
    loading.value = false;
  }
};

onMounted(loadMember);
</script>

<template>
  <div class="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center gap-3 mb-6">
      <button
        class="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        @click="router.back()"
      >
        返回
      </button>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        成员介绍
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
    >
      <div v-if="loading" class="text-slate-500 dark:text-slate-400">
        加载中…
      </div>

      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <div v-else-if="member" class="space-y-5">
        <div class="flex items-center gap-4">
          <div
            class="size-14 rounded-full bg-primary/15 text-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-3xl">person</span>
          </div>
          <div>
            <div class="text-xl font-bold text-slate-900 dark:text-white">
              {{ member.name }}
            </div>
            <div class="text-sm text-slate-500 dark:text-slate-400">
              ID: {{ member.id }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div class="text-xs uppercase tracking-wider text-slate-500">
              角色
            </div>
            <div class="mt-1 text-slate-800 dark:text-slate-100">
              {{ member.role ?? "未填写" }}
            </div>
          </div>

          <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div class="text-xs uppercase tracking-wider text-slate-500">
              家乡
            </div>
            <div class="mt-1 text-slate-800 dark:text-slate-100">
              {{ member.hometown ?? "未填写" }}
            </div>
          </div>

          <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div class="text-xs uppercase tracking-wider text-slate-500">
              生日
            </div>
            <div class="mt-1 text-slate-800 dark:text-slate-100">
              {{ member.birthday ?? "未填写" }}
            </div>
          </div>

          <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div class="text-xs uppercase tracking-wider text-slate-500">
              爱好
            </div>
            <div class="mt-1 text-slate-800 dark:text-slate-100">
              {{ member.hobby ?? "未填写" }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-slate-500 dark:text-slate-400">
        未找到成员信息
      </div>
    </div>
  </div>
</template>

