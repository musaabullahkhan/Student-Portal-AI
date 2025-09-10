/* js/app.js - shared logic for register, login, dashboard */

/* ---- Helpers ---- */
const USERS_KEY = 'simpleAuth_users';
const LOGGED_KEY = 'simpleAuth_loggedIn';

/* get users array from localStorage */
function getUsers(){
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){
    return [];
  }
}
function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* SHA-256 hash using Web Crypto API -> hex string */
async function sha256(message){
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  return hashHex;
}

/* simple email test */
function validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* show message in an element (id 'msg') */
function showMsg(text, elId='msg'){
  const el = document.getElementById(elId);
  if(!el) return;
  el.innerText = text;
  el.style.display = 'block';
  setTimeout(()=> el.style.display = 'none', 4000);
}

/* ---- Register page logic ---- */
async function handleRegister(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const confirm = form.confirm.value;

    if(!name || !email || !password){
      return showMsg('Please fill every field.');
    }
    if(!validEmail(email)) return showMsg('Enter a valid email.');
    if(password.length < 6) return showMsg('Password must be 6+ chars.');
    if(password !== confirm) return showMsg('Passwords do not match.');

    const users = getUsers();
    if(users.find(u => u.email === email)){
      return showMsg('An account with this email already exists.');
    }

    const passHash = await sha256(password);
    users.push({
      name,
      email,
      passwordHash: passHash,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
    alert('Registration successful — please login.');
    window.location.href = 'login.html';
  });
}

/* ---- Login page logic ---- */
async function handleLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    if(!email || !password) return showMsg('Please enter email and password.');

    const users = getUsers();
    const user = users.find(u => u.email === email);
    if(!user) return showMsg('No account found with that email.');

    const passHash = await sha256(password);
    if(passHash !== user.passwordHash) return showMsg('Incorrect password.');

    localStorage.setItem(LOGGED_KEY, JSON.stringify({ email: user.email, name: user.name }));
    window.location.href = 'dashboard.html';
  });
}

/* ---- Dashboard logic ---- */
function handleDashboard(){
  const root = document.getElementById('dashboardRoot');
  if(!root) return;
  const loggedRaw = localStorage.getItem(LOGGED_KEY);
  if(!loggedRaw){
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(loggedRaw);
  document.getElementById('userName').innerText = user.name || user.email;
  setupNotes(user);

  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    localStorage.removeItem(LOGGED_KEY);
    window.location.href = 'login.html';
  });

  /* optional: button to clear all demo users (dev only) */
  const clearBtn = document.getElementById('clearBtn');
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      if(confirm('Clear all demo accounts? This deletes stored users.')){
        localStorage.removeItem(USERS_KEY);
        localStorage.removeItem(LOGGED_KEY);
        alert('All demo data removed. Redirecting to register page.');
        window.location.href = 'index.html';
      }
    });
  }
}

/* ---- Notes logic ---- */
function getNotes(email){
  const all = JSON.parse(localStorage.getItem('simpleAuth_notes') || '{}');
  return all[email] || [];
}
function saveNotes(email, notes){
  const all = JSON.parse(localStorage.getItem('simpleAuth_notes') || '{}');
  all[email] = notes;
  localStorage.setItem('simpleAuth_notes', JSON.stringify(all));
}
function renderNotes(user){
  const container = document.getElementById('notesList');
  if(!container) return;
  const notes = getNotes(user.email);
  container.innerHTML = '';
  if(notes.length === 0){
    container.innerHTML = '<p style="color:var(--muted)">No notes yet. Add your first note below.</p>';
    return;
  }
  notes.forEach((n,i)=>{
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `
      <h3>${n.title}</h3>
      <p>${n.content}</p>
      <button data-i="${i}">Delete</button>
    `;
    div.querySelector('button').addEventListener('click', ()=>{
      const arr = getNotes(user.email);
      arr.splice(i,1);
      saveNotes(user.email, arr);
      renderNotes(user);
    });
    container.appendChild(div);
  });
}
function setupNotes(user){
  const form = document.getElementById('noteForm');
  if(!form) return;
  renderNotes(user);
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const title = form.title.value.trim();
    const content = form.content.value.trim();
    if(!title || !content) return alert('Please enter title and content.');
    const arr = getNotes(user.email);
    arr.push({title, content, createdAt:new Date().toISOString()});
    saveNotes(user.email, arr);
    form.reset();
    renderNotes(user);
  });
}

/* Initialize page based on body id */
document.addEventListener('DOMContentLoaded', ()=>{
  const id = document.body.id;
  if(id === 'register') handleRegister();
  else if(id === 'login') handleLogin();
  else if(id === 'dashboard') handleDashboard();
});
