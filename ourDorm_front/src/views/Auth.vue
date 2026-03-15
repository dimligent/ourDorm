<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../api";

const router = useRouter();
const isLogin = ref(true);
const username = ref("");
const password = ref("");
const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  try {
    if (isLogin.value) {
      const response = await authApi.login(username.value, password.value);
      if (response.code === "200") {
        localStorage.setItem("Authorization", response.JWT);
        router.push("/");
      } else {
        error.value = response.message;
      }
    } else {
      const response = await authApi.register(username.value, password.value);
      if (response.code === "200") {
        isLogin.value = true;
        error.value = "注册成功，请登录";
      } else {
        error.value = response.message;
      }
    }
  } catch (err) {
    error.value = "操作失败，请重试";
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = "";
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">{{ isLogin ? "登录" : "注册" }}</h1>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="submit-btn">
          {{ isLogin ? "登录" : "注册" }}
        </button>
      </form>

      <div class="toggle-mode">
        <span>{{ isLogin ? "还没有账号？" : "已有账号？" }}</span>
        <button @click="toggleMode" class="toggle-btn">
          {{ isLogin ? "去注册" : "去登录" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.auth-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 0 0 30px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  padding: 12px;
  background: #ffebee;
  color: #f44336;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.toggle-mode {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.toggle-btn:hover {
  text-decoration: underline;
}
</style>
