// 获取元素
const loginForm = document.getElementById("login");
const registerForm = document.getElementById("register");
const btn = document.getElementById("btn");

// 登录函数
function login() {
  loginForm.style.left = "50px";
  registerForm.style.left = "450px";
  btn.style.left = "0";
}

// 注册函数
function register() {
  loginForm.style.left = "-400px";
  registerForm.style.left = "50px";
  btn.style.left = "110px";
}

// 显示错误消息
function showError(element, message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  element.appendChild(errorDiv);

  // 3秒后自动移除错误消息
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// 登录表单提交处理
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = this.querySelector('input[type="text"]').value;
  const password = this.querySelector('input[type="password"]').value;
  console.log(username);
  try {
    // 显示加载状态
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '登录中...';
    submitBtn.disabled = true;

    // 发送登录请求
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    // 检查响应状态码
    if (response.ok) {
      // 登录成功
      const data = await response.json(); // 尝试解析返回的 JSON 数据
      if (data) {
        // 如果返回了用户信息，存储用户信息
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 显示成功消息
      alert('登录成功！');

      // 跳转到主页或其他页面
      window.location.href = '/MainStudents.html';
    } else {
      // 登录失败
      showError(this, '用户名或密码错误');
    }
  } catch (error) {
    console.error('登录错误:', error);
    showError(this, '网络错误，请检查网络连接');
  } finally {
    // 恢复按钮状态
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.textContent = '登录';
    submitBtn.disabled = false;
  }
});

// 显示错误信息的函数
function showError(form, message) {
  const errorDiv = form.querySelector('.error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}

// 注册表单提交处理
// 添加倒计时功能
let countdown = 60;
let timer = null;

function startCountdown() {
  const sendCodeBtn = document.querySelector('.send-code-btn');
  sendCodeBtn.disabled = true;

  timer = setInterval(() => {
    if (countdown > 0) {
      sendCodeBtn.textContent = `${countdown}秒后重试`;
      countdown--;
    } else {
      clearInterval(timer);
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '发送验证码';
      countdown = 60;
    }
  }, 1000);
}

// 发送验证码
async function sendVerificationCode() {
  const emailInput = document.querySelector('#register input[type="email"]');
  const email = emailInput.value;

  if (!email) {
    showError(document.getElementById('register'), '请输入邮箱地址');
    return;
  }

  if (!isValidEmail(email)) {
    showError(document.getElementById('register'), '请输入有效的邮箱地址');
    return;
  }
  console.log(email);

  try {
    const response = await fetch('http://localhost:8080/api/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email:email })
    });

    const data = await response.json();

    if (data.success) {
      startCountdown();
      showSuccess(document.getElementById('register'), '验证码已发送到您的邮箱');
    } else {
      showError(document.getElementById('register'), data.message || '发送验证码失败');
    }
  } catch (error) {
    console.error('发送验证码错误:', error);
    showError(document.getElementById('register'), '发送验证码失败，请稍后重试');
  }
}

// 邮箱格式验证
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 显示成功消息
function showSuccess(element, message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  element.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// 修改注册表单提交处理
registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = this.querySelector('input[type="text"]').value;
  const email = this.querySelector('input[type="email"]').value;
  const password = this.querySelector('input[type="password"]').value;
  const verificationCode = this.querySelector('.verification-code').value;

  try {
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.textContent = '注册中...';
    submitBtn.disabled = true;

    const response = await fetch('http://localhost:8080/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: username,
        userEmail: email,
        user_password: password,
        verificationCode: verificationCode
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('注册成功！请登录');
      login();
    } else {
      showError(this, data.message || '注册失败');
    }
  } catch (error) {
    console.error('注册错误:', error);
    showError(this, '注册失败，请稍后重试');
  } finally {
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.textContent = '注册';
    submitBtn.disabled = false;
  }
});
