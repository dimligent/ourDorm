<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { memberApi } from "../api";
import type { Member } from "../types";

const router = useRouter();

const members = ref<Member[]>([]);
const loadingMembers = ref(true);
const membersError = ref("");

const membersToShow = computed(() => members.value.slice(0, 4));

const goToMember = (memberId: number) => {
  router.push(`/members/${memberId}`);
};

const goToFlags = () => {
  router.push("/flags");
};

const goToCountdown = () => {
  router.push("/countdown");
};

const goToLogs = () => {
  router.push("/logs");
};

const loadMembers = async () => {
  loadingMembers.value = true;
  membersError.value = "";
  try {
    const res = await memberApi.getMembers();
    if (res.code === "200" && res.data) {
      members.value = res.data;
    } else {
      members.value = [];
      membersError.value = res.message || "获取成员列表失败";
    }
  } catch (e) {
    members.value = [];
    membersError.value =
      "无法连接后端，请确认后端已启动（ourDorm_back: npm run dev:local）且 VITE_API_BASE_URL 指向正确地址";
  } finally {
    loadingMembers.value = false;
  }
};

onMounted(loadMembers);
</script>

<template>
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Left Section: Dormitory Members (70%) -->
      <section class="w-full lg:w-[70%]">
        <div
          class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px] flex flex-col"
        >
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
              Dormitory Residents
            </h2>
            <p class="text-slate-500 dark:text-slate-400 mt-1">
              Select a member to view their profile and activity.
            </p>
          </div>

          <div class="flex-1 flex items-center justify-center">
            <div
              v-if="loadingMembers"
              class="text-slate-500 dark:text-slate-400"
            >
              加载中…
            </div>

            <div
              v-else-if="members.length === 0"
              class="text-slate-500 dark:text-slate-400 text-center"
            >
              <div>暂无成员</div>
              <div v-if="membersError" class="mt-2 text-xs text-red-600">
                {{ membersError }}
              </div>
            </div>

            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl"
            >
              <!-- Members -->
              <button
                v-for="member in membersToShow"
                :key="member.id"
                class="group relative flex flex-col items-center justify-center p-8 rounded-xl bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/20 hover:border-primary transition-all"
                @click="goToMember(member.id)"
              >
                <div
                  class="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform"
                >
                  <span class="material-symbols-outlined text-3xl">{{
                    "person"
                  }}</span>
                </div>
                <span
                  class="text-lg font-bold text-slate-800 dark:text-slate-100"
                  >{{ member.name }}</span
                >
                <span
                  class="text-xs uppercase tracking-widest text-primary font-semibold mt-1"
                  >{{ member.role ?? member.hometown ?? "Member" }}</span
                >
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Section: Tools (30%) -->
      <aside class="w-full lg:w-[30%] flex flex-col gap-4">
        <div
          class="p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <h3
            class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2"
          >
            Quick Access Tools
          </h3>

          <div class="flex flex-col gap-4">
            <!-- Flag Tracker -->
            <button
              class="group flex items-center gap-4 p-4 w-full bg-white dark:bg-slate-900 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              @click="goToFlags"
            >
              <div
                class="size-12 rounded-full bg-primary/10 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-colors"
              >
                <span class="material-symbols-outlined">flag</span>
              </div>
              <div class="text-left">
                <p class="font-bold text-base">Flag Tracker</p>
                <p
                  class="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80"
                >
                  Manage penalty points
                </p>
              </div>
            </button>

            <!-- Countdown Day -->
            <button
              class="group flex items-center gap-4 p-4 w-full bg-white dark:bg-slate-900 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              @click="goToCountdown"
            >
              <div
                class="size-12 rounded-full bg-primary/10 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-colors"
              >
                <span class="material-symbols-outlined">event</span>
              </div>
              <div class="text-left">
                <p class="font-bold text-base">Countdown Day</p>
                <p
                  class="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80"
                >
                  Upcoming events
                </p>
              </div>
            </button>

            <!-- Dormitory Log -->
            <button
              class="group flex items-center gap-4 p-4 w-full bg-white dark:bg-slate-900 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              @click="goToLogs"
            >
              <div
                class="size-12 rounded-full bg-primary/10 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-colors"
              >
                <span class="material-symbols-outlined">history_edu</span>
              </div>
              <div class="text-left">
                <p class="font-bold text-base">Dormitory Log</p>
                <p
                  class="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80"
                >
                  Daily activity records
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Small Info Card -->
        <div
          class="relative overflow-hidden p-6 rounded-xl bg-primary text-white"
        >
          <div class="relative z-10">
            <h4 class="font-bold mb-2">Notice Board</h4>
            <p class="text-sm text-white/90">
              General cleaning is scheduled for this Sunday at 10:00 AM. Please
              ensure all common areas are tidy.
            </p>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-10">
            <span class="material-symbols-outlined text-[100px]"
              >notifications</span
            >
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>
