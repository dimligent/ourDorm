import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/Home.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/members/:id",
      name: "member-detail",
      component: () => import("../views/MemberDetail.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/Auth.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/flags",
      name: "flags",
      component: () => import("../views/Flags.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/flags/:id",
      name: "flag-detail",
      component: () => import("../views/FlagDetail.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/countdown",
      name: "countdown",
      component: () => import("../views/Countdown.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/logs",
      name: "logs",
      component: () => import("../views/Logs.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("Authorization");
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !token) {
    next("/auth");
  } else {
    next();
  }
});

export default router;
