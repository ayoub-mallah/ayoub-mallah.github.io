document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://your-blog-api.up.railway.app"; // swap for your real deployed URL
let blogLoaded = false;

async function loadBlogPosts() {
  const container = document.getElementById('blog-posts');
  const status = document.getElementById('blog-status');
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const posts = await res.json();

    if (posts.length === 0) {
      container.textContent = "No posts yet.";
      status.textContent = "0 object(s)";
      return;
    }

    container.innerHTML = posts.map(post => {
      const date = new Date(post.created_at).toLocaleDateString();
      const body = escapeHtml(post.body);
      return `${date}\n${body}\n\n${'—'.repeat(30)}\n\n`;
    }).join('').trim();

    status.textContent = `${posts.length} object(s)`;
  } catch (err) {
    container.textContent = "Couldn't load posts right now.";
    console.error(err);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
  const windows = document.querySelectorAll('.window');
  const taskbarWindows = document.getElementById('taskbar-windows');
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const shutdownScreen = document.getElementById('shutdown-screen');
  let zTop = 10;
  const taskbarButtons = {};

  function windowIdFor(key) { return document.getElementById('window-' + key); }

  function focusWindow(win) {
    windows.forEach(w => w.classList.remove('active'));
    win.classList.add('active');
    zTop += 1;
    win.style.zIndex = zTop;
    Object.values(taskbarButtons).forEach(b => b.classList.remove('active'));
    const key = win.id.replace('window-', '');
    if (taskbarButtons[key]) taskbarButtons[key].classList.add('active');
  }

  function centerWindow(win) {
    if (win.dataset.positioned) return;
    win.dataset.positioned = 'true';
    win.style.visibility = 'hidden';
    win.style.display = 'flex';
    const w = win.offsetWidth;
    const h = win.offsetHeight;
    win.style.visibility = '';
    const deskW = window.innerWidth;
    const deskH = window.innerHeight - 30;
    const openCount = document.querySelectorAll('.window.open').length;
    const offset = Math.min(openCount, 6) * 24;
    let left = (deskW - w) / 2 + offset;
    let top = (deskH - h) / 2 + offset;
    left = Math.max(8, Math.min(left, deskW - w - 8));
    top = Math.max(8, Math.min(top, deskH - h - 8));
    win.style.left = left + 'px';
    win.style.top = top + 'px';
  }

  function openWindow(key) {
  const win = windowIdFor(key);
  if (!win) return;
  if (!win.classList.contains('open')) {
    win.classList.add('open');
    addTaskbarButton(key, win);
  }
  centerWindow(win);
  win.style.display = 'flex';
  focusWindow(win);

  if (key === 'blog' && !blogLoaded) {
    blogLoaded = true;
    loadBlogPosts();
  }
}

  function closeWindow(key) {
    const win = windowIdFor(key);
    if (!win) return;
    win.classList.remove('open');
    win.classList.remove('maximized');
    win.style.display = 'none';
    if (taskbarButtons[key]) {
      taskbarButtons[key].remove();
      delete taskbarButtons[key];
    }
  }

  function minimizeWindow(key) {
    const win = windowIdFor(key);
    if (!win) return;
    win.style.display = 'none';
    if (taskbarButtons[key]) taskbarButtons[key].classList.remove('active');
  }

  function toggleMaximize(key) {
    const win = windowIdFor(key);
    if (!win) return;
    win.classList.toggle('maximized');
  }

  function addTaskbarButton(key, win) {
    if (taskbarButtons[key]) return;
    const btn = document.createElement('div');
    btn.className = 'taskbar-item';
    const label = win.querySelector('.title-text').textContent.trim();
    btn.textContent = label;
    btn.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex';
        focusWindow(win);
      } else if (win.classList.contains('active')) {
        minimizeWindow(key);
      } else {
        focusWindow(win);
      }
    });
    taskbarWindows.appendChild(btn);
    taskbarButtons[key] = btn;
  }

  // Desktop icons: click to select, double-click (or second click) to open.
  // On touch/mobile, single tap opens directly for usability.
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  document.querySelectorAll('.icon').forEach(icon => {
    const key = icon.dataset.window;

    if (isTouch) {
      icon.addEventListener('click', () => openWindow(key));
    } else {
      icon.addEventListener('click', () => {
        document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
      });
      icon.addEventListener('dblclick', () => openWindow(key));
    }
  });

  // Start menu items also open windows
  document.querySelectorAll('.start-item[data-window]').forEach(item => {
    item.addEventListener('click', () => {
      openWindow(item.dataset.window);
      startMenu.classList.remove('open');
      startBtn.classList.remove('active');
    });
  });

  // Window chrome buttons + focus-on-click
  windows.forEach(win => {
    const key = win.id.replace('window-', '');
    win.addEventListener('mousedown', () => focusWindow(win));
    win.querySelector('.close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(key);
    });
    win.querySelector('.min-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(key);
    });
    win.querySelector('.max-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize(key);
    });
  });

  // Open the About window by default so the desktop isn't empty on load
  openWindow('about');

  // Start button / menu
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('open');
    startBtn.classList.toggle('active');
  });
  document.addEventListener('click', () => {
    startMenu.classList.remove('open');
    startBtn.classList.remove('active');
  });
  startMenu.addEventListener('click', (e) => e.stopPropagation());

  // Shut down
  document.getElementById('shutdown-item').addEventListener('click', () => {
    startMenu.classList.remove('open');
    startBtn.classList.remove('active');
    shutdownScreen.classList.add('open');
  });
  document.getElementById('restart-btn').addEventListener('click', () => {
    shutdownScreen.classList.remove('open');
  });

  // Clock
  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000 * 15);
});
