/* script.js
   Auth UI behaviors:
   - Toggle signup/login
   - Basic client-side validation (confirm password)
   - Password show/hide toggles
   - Dummy handlers for Google buttons (wired later to Firebase)
   - Status messages
*/

document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabSignup = document.getElementById('tab-signup');
  const tabLogin  = document.getElementById('tab-login');
  const signupForm = document.getElementById('signup-form');
  const loginForm  = document.getElementById('login-form');
  const toSignupBtn = document.getElementById('to-signup');
  const statusEl = document.getElementById('status');

  function setMode(mode){
    if(mode === 'signup'){
      tabSignup.classList.add('active'); tabSignup.setAttribute('aria-selected','true');
      tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected','false');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
      document.getElementById('auth-heading').textContent = 'Join the Neat Customs crew';
      document.querySelector('.form-sub').textContent = 'Create an account or sign in to continue';
    } else {
      tabLogin.classList.add('active'); tabLogin.setAttribute('aria-selected','true');
      tabSignup.classList.remove('active'); tabSignup.setAttribute('aria-selected','false');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
      document.getElementById('auth-heading').textContent = 'Welcome back';
      document.querySelector('.form-sub').textContent = 'Sign in to your account';
    }
    // clear status
    statusEl.textContent = '';
  }

  tabSignup.addEventListener('click', () => setMode('signup'));
  tabLogin.addEventListener('click', () => setMode('login'));
  if(toSignupBtn) toSignupBtn.addEventListener('click', () => setMode('signup'));

  // Password toggles (handles multiple pw-toggle buttons)
  document.querySelectorAll('.pw-toggle').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const wrap = e.currentTarget.closest('.password-wrap');
      if(!wrap) return;
      const input = wrap.querySelector('input');
      if(!input) return;
      if(input.type === 'password'){
        input.type = 'text';
        e.currentTarget.textContent = '🙈';
        e.currentTarget.setAttribute('aria-pressed','true');
      } else {
        input.type = 'password';
        e.currentTarget.textContent = '👁';
        e.currentTarget.setAttribute('aria-pressed','false');
      }
      input.focus();
    });
  });

  // Signup validation
  const confirmInput = document.getElementById('su-confirm');
  const passwordInput = document.getElementById('su-password');
  const confirmError = document.getElementById('confirm-error');

  function validatePasswords(){
    if(!confirmInput || !passwordInput) return true;
    if(confirmInput.value === ''){ confirmError.textContent = ''; return false; }
    if(passwordInput.value !== confirmInput.value){
      confirmError.textContent = 'Passwords do not match';
      return false;
    } else {
      confirmError.textContent = '';
      return true;
    }
  }

  if(confirmInput){
    confirmInput.addEventListener('input', validatePasswords);
    passwordInput.addEventListener('input', validatePasswords);
  }

  // Signup submit
  signupForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    // basic validation
    const email = document.getElementById('su-email').value.trim();
    const fullname = document.getElementById('su-fullname').value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if(!email || !fullname || !password || !confirm){
      statusEl.textContent = 'Please complete all fields.';
      statusEl.style.color = '';
      return;
    }
    if(!validatePasswords()) {
      statusEl.textContent = 'Fix form errors before continuing.';
      statusEl.style.color = '#ff6b6b';
      return;
    }

    // TODO: integrate with Firebase createUserWithEmailAndPassword
    statusEl.textContent = 'Creating account... (example flow)';
    statusEl.style.color = varOr('#9E9E9E');

    // Simulate async success for UI demonstration (remove when integrating)
    setTimeout(()=> {
      statusEl.textContent = `Welcome, ${fullname.split(' ')[0]} — account created (demo).`;
      statusEl.style.color = '';
      signupForm.reset();
    }, 900);
  });

  // Login submit
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('li-email').value.trim();
    const password = document.getElementById('li-password').value;

    if(!email || !password){
      statusEl.textContent = 'Please enter email and password.';
      statusEl.style.color = '#ff6b6b';
      return;
    }

    // TODO: integrate Firebase signInWithEmailAndPassword
    statusEl.textContent = 'Signing in... (example flow)';
    statusEl.style.color = varOr('#9E9E9E');

    setTimeout(()=>{
      statusEl.textContent = `Signed in as ${email} (demo).`;
      statusEl.style.color = '';
      loginForm.reset();
    }, 900);
  });

  // Google button placeholders
  document.getElementById('google-btn').addEventListener('click', () => {
    statusEl.textContent = 'Google sign-in (configure with Firebase).';
    // In production: call firebase.auth().signInWithPopup(googleProvider) or the modular equivalent
  });
  document.getElementById('google-btn-login').addEventListener('click', () => {
    statusEl.textContent = 'Google sign-in (configure with Firebase).';
  });

  // Forgot password behaviour
  document.getElementById('forgot-link').addEventListener('click', (e)=>{
    e.preventDefault();
    const email = document.getElementById('li-email').value.trim();
    if(!email){
      statusEl.textContent = 'Enter your email above to reset password.';
      statusEl.style.color = '#ff6b6b';
      setMode('login');
      return;
    }
    // TODO: call firebase sendPasswordResetEmail(email)
    statusEl.textContent = `Password reset link sent to ${email} (demo).`;
    statusEl.style.color = '';
    // Provide next steps in UI or modal in production
  });

  // Utility: safe var color function
  function varOr(fallback){
    // return fallback color string
    return fallback;
  }

  // Accessibility: allow Enter to submit when in fields (native behavior preserved)
  // Initialize default mode
  setMode('signup');
});
