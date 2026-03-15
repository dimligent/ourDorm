<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";

const router = useRouter();

const isLoggedIn = computed(() => {
  return !!localStorage.getItem("Authorization");
});

const handleLogout = () => {
  localStorage.removeItem("Authorization");
  router.push("/auth");
};

const goToHome = () => {
  router.push("/");
};

const goToAuth = () => {
  router.push("/auth");
};

const goToAbout = () => {
  console.log("Go to about page");
};
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-2 cursor-pointer" @click="goToHome">
            <div
              class="size-8 bg-primary rounded-lg flex items-center justify-center text-white"
            >
              <span class="material-symbols-outlined">apartment</span>
            </div>
            <span
              class="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
              >DormHub</span
            >
          </div>
          <nav class="hidden md:flex items-center gap-6">
            <a
              class="text-sm font-semibold text-primary cursor-pointer"
              @click="goToHome"
              >Home</a
            >
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <template v-if="isLoggedIn">
            <button
              class="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
              @click="handleLogout"
            >
              <span>Logout</span>
            </button>
          </template>
          <template v-else>
            <button
              class="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90"
              @click="goToAuth"
            >
              <span>Register/Login</span>
            </button>
          </template>
          <button
            class="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            @click="goToAbout"
          >
            <span>About Author</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
