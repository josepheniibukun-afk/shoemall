const form = document.getElementById('login-form');
const username = document.getElementById('username');
const password = document.getElementById('password');
const message = document.getElementById('message');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const user = username.value.trim();
  const pass = password.value.trim();

  if (user === '' || pass === '') {
    message.style.color = 'red';
    message.textContent = 'Please fill in both fields.';
    return;
  }

  // Example check (replace with real authentication later)
  if (user === 'admin' && pass === '12345') {
    message.style.color = 'lime';
    message.textContent = 'signup successful! Redirecting...';

    // Fade and redirect
    document.body.style.transition = 'opacity 0.6s';
    document.body.style.opacity = '0.4';

    setTimeout(() => {
      window.location.href = 'login.html'; // or your payment page
    }, 1000);
  } else {
    message.style.color = 'red';
    message.textContent = 'account already exist';
  }
});