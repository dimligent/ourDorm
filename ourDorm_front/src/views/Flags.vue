<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { flagApi } from "../api";
import type { Flag } from "../types";

const router = useRouter();
const flags = ref<Flag[]>([]);
const showCreateModal = ref(false);
const showTrashModal = ref(false);
const deletedFlags = ref<Flag[]>([]);

const newFlag = ref({
  title: "",
  content: "",
  needCheckin: true,
  memberIds: [] as number[],
});

const loadFlags = async () => {
  try {
    const [activeRes, trashRes] = await Promise.all([
      flagApi.getFlags(),
      flagApi.getTrashFlags(),
    ]);
    if (activeRes.code === "200" && activeRes.data) {
      flags.value = activeRes.data;
    }
    if (trashRes.code === "200" && trashRes.data) {
      deletedFlags.value = trashRes.data;
    }
  } catch (error) {
    console.error("Failed to load flags:", error);
  }
};

const createFlag = async () => {
  try {
    const response = await flagApi.createFlag(newFlag.value);
    if (response.code === "200") {
      showCreateModal.value = false;
      newFlag.value = {
        title: "",
        content: "",
        needCheckin: true,
        memberIds: [],
      };
      await loadFlags();
    }
  } catch (error) {
    console.error("Failed to create flag:", error);
  }
};

const checkinFlag = async (flagId: number) => {
  try {
    const response = await flagApi.checkinFlag(flagId);
    if (response.code === "200") {
      await loadFlags();
    }
  } catch (error) {
    console.error("Failed to checkin flag:", error);
  }
};

const deleteFlag = async (id: number) => {
  try {
    const ok = window.confirm("确定要把这个 Flag 移入垃圾箱吗？");
    if (!ok) return;
    const response = await flagApi.deleteFlag(id);
    if (response.code === "200") {
      await loadFlags();
    }
  } catch (error) {
    console.error("Failed to delete flag:", error);
  }
};

const restoreFlag = async (id: number) => {
  try {
    const response = await flagApi.restoreFlag(id);
    if (response.code === "200") {
      await loadFlags();
    }
  } catch (error) {
    console.error("Failed to restore flag:", error);
  }
};

const viewFlagDetail = (flagId: number) => {
  router.push(`/flags/${flagId}`);
};

const toggleCheckin = async (flagId: number) => {
  await checkinFlag(flagId);
};

onMounted(() => {
  loadFlags();
});
</script>

<template>
  <div
    class="max-w-md mx-auto min-h-screen flex flex-col bg-white dark:bg-slate-900 shadow-sm"
  >
    <!-- Header -->
    <header class="px-6 pt-10 pb-6">
      <h1
        class="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
      >
        我的Flag
      </h1>
    </header>

    <!-- Body (Flag List) -->
    <main class="flex-1 px-6">
      <div class="space-y-1">
        <div
          v-if="flags.length === 0"
          class="text-center py-12 text-slate-500 dark:text-slate-400"
        >
          <p>还没有Flag，快去创建一个吧！</p>
        </div>

        <!-- Flag Items -->
        <div
          v-for="flag in flags"
          :key="flag.id"
          class="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800"
        >
          <p
            class="w-[80%] text-base text-slate-700 dark:text-slate-300 cursor-pointer"
            @click="viewFlagDetail(flag.id)"
          >
            {{ flag.title }}
          </p>
          <div class="flex items-center gap-3">
            <input
              v-if="flag.needCheckin"
              :checked="Boolean(flag.checkedInToday)"
              @change="toggleCheckin(flag.id)"
              class="custom-checkbox h-6 w-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
              type="checkbox"
            />
            <button
              class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 transition-colors"
              title="移入垃圾箱"
              @click.stop="deleteFlag(flag.id)"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Action Bar -->
    <footer class="p-6 pb-10">
      <div class="flex gap-4">
        <button
          class="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-3.5 rounded-lg font-semibold text-sm"
          @click="showCreateModal = true"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>发起Flag</span>
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors py-3.5 rounded-lg font-semibold text-sm"
          @click="showTrashModal = true"
        >
          <span class="material-symbols-outlined text-[20px]">delete</span>
          <span>垃圾箱</span>
        </button>
      </div>
    </footer>

    <!-- Create Flag Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          创建Flag
        </h2>

        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >Flag标题</label
            >
            <input
              v-model="newFlag.title"
              type="text"
              placeholder="例如：每天背50个单词"
              class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <label
              class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >Flag内容</label
            >
            <textarea
              v-model="newFlag.content"
              placeholder="详细描述你的Flag..."
              rows="4"
              class="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:border-primary focus:ring-0 transition-colors resize-none"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="newFlag.needCheckin"
              type="checkbox"
              id="needCheckin"
              class="h-5 w-5 rounded border-2 border-slate-200 dark:border-slate-700 bg-transparent text-white focus:ring-0 focus:ring-offset-0 transition-colors cursor-pointer"
            />
            <label
              for="needCheckin"
              class="text-sm text-slate-700 dark:text-slate-300"
              >需要每日打卡</label
            >
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 py-3.5 rounded-lg font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            @click="showCreateModal = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-3.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-colors"
            @click="createFlag"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- Trash Modal -->
    <div
      v-if="showTrashModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          垃圾箱
        </h2>

        <div class="max-h-80 overflow-y-auto space-y-3">
          <div
            v-if="deletedFlags.length === 0"
            class="text-center py-8 text-slate-500 dark:text-slate-400"
          >
            <p>垃圾箱是空的</p>
          </div>

          <div
            v-for="flag in deletedFlags"
            :key="flag.id"
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <span class="text-base text-slate-700 dark:text-slate-300">{{
              flag.title
            }}</span>
            <button
              class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              @click="restoreFlag(flag.id)"
            >
              恢复
            </button>
          </div>
        </div>

        <div class="mt-6">
          <button
            class="w-full py-3.5 rounded-lg font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            @click="showTrashModal = false"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.custom-checkbox:checked {
  background-color: #10b981;
  border-color: #10b981;
}

.custom-checkbox:checked::before {
  content: "✓";
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.custom-checkbox::before {
  content: "";
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}
</style>
