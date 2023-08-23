// In the renderer process
const { ipcRenderer } = require('electron');
const log = require('electron-log');

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Use the functions provided by preload.js to communicate with the main process.
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const isValid = await window.api.login(username, password);
    
    if (isValid) {
      loginMessage.textContent = 'Login successful!';
      log.info('Login successful!');
    } else {
      loginMessage.textContent = 'Login failed. Please check your credentials.';
      log.error('Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const username = formData.get('username');
  const password = formData.get('password');
  const passwordConfirm = formData.get('password-confirm');
  
  if (password !== passwordConfirm) {
    signupMessage.textContent = 'Passwords do not match.';
    return;
  }

  try {
    const isSuccess = await window.api.signup(username, password);

    if (isSuccess) {
      signupMessage.textContent = 'Sign-up successful!';
      log.info('Sign-up successful!');
    } else {
      signupMessage.textContent = 'Sign-up failed. Username already exists.';
      log.error('Sign-up failed. Username already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
