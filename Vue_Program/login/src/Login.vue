<template>
    <div class="login-container" :class="{ 'sign-up-mode': isSignUp }">
        <div class="login-card">
            <!-- 顶部切换按钮 -->
            <div class="form-tabs">
                <button class="tab-btn" :class="{ active: !isSignUp }" @click="isSignUp = false">
                    Sign In
                </button>
                <button class="tab-btn" :class="{ active: isSignUp }" @click="isSignUp = true">
                    Sign Up
                </button>
            </div>

            <!-- 表单部分 -->
            <div class="forms-container">
                <!-- 登录表单 -->
                <div class="signin-form">
                    <h2>登录</h2>
                    <div class="input-group">
                        <input
                            type="text"
                            v-model="username"
                            placeholder="用户名"
                            :disabled="isLoading"
                            @keyup.enter="login"
                        />
                        <i class="fas fa-user"></i>
                    </div>

                    <div class="input-group">
                        <input
                            type="password"
                            v-model="password"
                            placeholder="密码"
                            :disabled="isLoading"
                            @keyup.enter="login"
                        />
                        <i class="fas fa-lock"></i>
                    </div>

                    <div class="remember-forgot">
                        <div class="remember-me">
                            <input type="checkbox" id="remember" v-model="rememberMe">
                            <label for="remember">记住我</label>
                        </div>
                        <div class="forgot-password">
                            <a href="#" @click.prevent="forgotPassword">忘记密码?</a>
                        </div>
                    </div>

                    <button
                        class="action-btn signin-btn"
                        @click="login"
                        :disabled="isLoading"
                    >
                        <span v-if="!isLoading">登录 <i class="fas fa-arrow-right"></i></span>
                        <span v-else><i class="fas fa-spinner fa-spin"></i> 登录中...</span>
                    </button>

                    <div v-if="loginError" class="error-message">
                        {{ loginError }}
                    </div>

                    <div class="divider">Sign In</div>
                </div>

                <!-- 注册表单 -->
                <div class="signup-form">
                    <h2>Sign Up</h2>
                    <div class="input-group">
                        <input
                            type="text"
                            v-model="registerUsername"
                            placeholder="用户名"
                            :disabled="isLoading"
                        />
                        <i class="fas fa-user"></i>
                    </div>

                    <div class="input-group">
                        <input
                            type="email"
                            v-model="email"
                            placeholder="邮箱"
                            :disabled="isLoading"
                        />
                        <i class="fas fa-envelope"></i>
                    </div>

                    <div class="input-group">
                        <input
                            type="password"
                            v-model="registerPassword"
                            placeholder="密码"
                            :disabled="isLoading"
                        />
                        <i class="fas fa-lock"></i>
                    </div>

                    <div class="input-group">
                        <input
                            type="password"
                            v-model="confirmPassword"
                            placeholder="确认密码"
                            :disabled="isLoading"
                            @keyup.enter="register"
                        />
                        <i class="fas fa-lock"></i>

                    </div>

                    <div class="terms-container">
                        <input type="checkbox" id="terms" v-model="agreeTerms">
                        <label for="terms">我已阅读并同意<a href="#" @click.prevent="showTerms">服务条款</a></label>
                    </div>

                    <button
                        class="action-btn signup-btn"
                        @click="register"
                        :disabled="isLoading"
                    >
                        <span v-if="!isLoading">注册 <i class="fas fa-arrow-right"></i></span>
                        <span v-else><i class="fas fa-spinner fa-spin"></i> 注册中...</span>
                    </button>

                    <div v-if="registerError" class="error-message">
                        {{ registerError }}
                    </div>

                    <div class="divider">sign up</div>
                </div>
            </div>

            <!-- 右侧面板 -->
            <div class="panel right-panel">
                <transition name="fade" mode="out-in">
                    <!-- 登录状态下显示的面板内容 -->
                    <div class="panel-content" v-if="!isSignUp" key="login">
                        <div class="rocket-image">
                            <img src="https://alley093.oss-cn-hangzhou.aliyuncs.com/assets/images/login_image.png" alt="Login Image" />
                        </div>
                        <p class="login-slogan">
                            Welcome back!<br />
                            Login to your account
                        </p>
                        <button class="toggle-btn" @click="toggleForm">Sign Up</button>
                    </div>
                    <!-- 注册状态下显示的面板内容 -->
                    <div class="panel-content" v-else key="signup">
                        <div class="rocket-image">
                            <img src="https://alley093.oss-cn-hangzhou.aliyuncs.com/assets/images/signup_image.png" alt="Sign Up Image" />
                        </div>
                        <p class="login-slogan">
                            Join us and start your journey<br />
                            Create your account now
                        </p>
                        <button class="toggle-btn" @click="toggleForm">Sign In</button>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

// 登录表单数据绑定
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginError = ref('');

// 注册表单数据绑定
const registerUsername = ref('');
const email = ref('');
const registerPassword = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);
const registerError = ref('');

// 控制当前是登录模式还是注册模式
const isSignUp = ref(false);
const isLoading = ref(false);

// 邮箱验证正则表达式
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 切换登录/注册状态的函数
const toggleForm = () => {
    isSignUp.value = !isSignUp.value;
    loginError.value = '';
    registerError.value = '';
};

// 忘记密码处理
const forgotPassword = () => {
    if (!email.value) {
        ElMessage.warning('请先在注册表单中填写您的邮箱，然后再点击忘记密码');
        isSignUp.value = true;
        return;
    }
    ElMessage.info('密码重置功能仅做界面展示');
};

// 显示服务条款
const showTerms = () => {
    ElMessage.info('服务条款内容仅做界面展示');
};

/**
 * 处理登录请求
 */
function login() {
    loginError.value = '';

    // 前端验证
    if (!username.value || !password.value) {
        loginError.value = '用户名和密码不能为空';
        return;
    }

    isLoading.value = true;

    // 模拟登录过程
    setTimeout(() => {
        console.log('登录表单提交:', {
            username: username.value,
            password: '******',
            rememberMe: rememberMe.value
        });

        ElMessage.success('登录成功（仅做界面展示）');

        isLoading.value = false;
    }, 1000);
}

/**
 * 处理注册请求
 */
function register() {
    registerError.value = '';

    // 基础前端验证
    if (!registerUsername.value) {
        registerError.value = '用户名不能为空';
        return;
    }
    if (!email.value) {
        registerError.value = '邮箱不能为空';
        return;
    }
    if (!emailRegex.test(email.value)) {
        registerError.value = '请输入有效的邮箱地址';
        return;
    }
    if (!registerPassword.value) {
        registerError.value = '密码不能为空';
        return;
    }
    if (registerPassword.value.length < 6) {
        registerError.value = '密码长度至少为6位';
        return;
    }
    if (registerPassword.value !== confirmPassword.value) {
        registerError.value = '两次输入的密码不一致';
        return;
    }
    if (!agreeTerms.value) {
        registerError.value = '请阅读并同意服务条款';
        return;
    }

    isLoading.value = true;

    // 模拟注册过程
    setTimeout(() => {
        console.log('注册表单提交:', {
            username: registerUsername.value,
            email: email.value,
            password: '******'
        });

        ElMessage.success('注册成功（仅做界面展示），请登录');

        // 清空注册表单
        registerUsername.value = '';
        email.value = '';
        registerPassword.value = '';
        confirmPassword.value = '';
        agreeTerms.value = false;

        // 注册成功后切换到登录状态
        isSignUp.value = false;

        isLoading.value = false;
    }, 1500);
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
@import './assets/login.css';

body {
    background-image: url(./assets/background.jpg);
    background-size: cover; /* 使背景图片覆盖整个元素，保持图片比例且不拉伸 */
    background-repeat: no-repeat; /* 防止背景图片重复 */
    background-attachment: fixed; /* 固定背景图片，使其不随页面滚动而移动 */
    overflow: hidden;
    margin: 0;
}
/* 可在此处添加额外的 CSS 样式以完善页面展示 */
.error-message {
    color: #ff4d4f;
    margin-top: 10px;
    font-size: 0.9rem;
}
.terms-container {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 0.9rem;
}
.terms-container input {
    margin-right: 5px;
}
.terms-container a {
    color: #1890ff;
    text-decoration: none;
}
.terms-content {
    max-height: 300px;
    overflow-y: auto;
}
.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 0.9rem;
}

/* 输入框焦点发光效果 */
.input-group input:focus {
    border-color: #aec0f8;
    box-shadow: 0 0 16px rgba(226, 253, 234, 0.6);
    outline: none;
    transition: all 0.3s ease;
}

</style>        
