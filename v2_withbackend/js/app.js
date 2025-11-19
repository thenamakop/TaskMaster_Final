/**
 * Core application functionality
 */
class AppCore {
  constructor() {
    this.data = null;
    this.currentPage = this._getCurrentPage();
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    await this.loadData();
    this.setupThemeToggle();
    this.setupSidebar();
    this.setupNotifications();
    this.renderUserProfile();
    
    // Initialize page-specific functionality
    this.initPageSpecific();
    this.updateTasksStatusWidget();
  }

  /**
   * Load application data from JSON
   */
  async loadData() {
    try {
      const response = await fetch('/data/app-data.json');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      this.data = await response.json();
      await this.loadTasksFromAPI();
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty data structure
      this.data = { user: {}, notifications: [], projects: [], roadmap: {}, tasks: [] };
    }
  }

  async loadTasksFromAPI() {
    try {
      const base = (window.location.origin && window.location.origin.startsWith('http')) ? '' : 'http://localhost:3000';
      const res = await fetch(`${base}/api/tasks`);
      if (!res.ok) throw new Error('Failed tasks');
      const tasks = await res.json();
      this.data.tasks = tasks.map(t => ({
        id: t._id || t.id,
        title: t.title,
        priority: t.priority || 'Medium',
        status: t.status || 'backlog',
        assignee: t.assignee || ''
      }));
    } catch (e) {
      if (!this.data.tasks) this.data.tasks = [];
    }
  }

  /**
   * Set up theme toggle functionality
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
      themeToggle.checked = true;
    }

    // Handle theme toggle
    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  /**
   * Set up sidebar functionality
   */
  setupSidebar() {
    // Highlight active nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .section-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    const newTaskButtons = Array.from(document.querySelectorAll('.button.button-primary'))
      .filter(b => b.textContent.trim() === '+ New Task');
    newTaskButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentPage === 'tasks') {
          this.openTaskModal();
        } else {
          window.location.href = 'tasks.html#new';
        }
      });
    });
  }

  /**
   * Set up notifications functionality
   */
  setupNotifications() {
    const notificationButton = document.querySelector('button[aria-label="Notifications"]');
    if (!notificationButton) return;
    
    // Update notification count
    const unreadCount = this.data?.notifications?.filter(n => !n.isRead).length || 0;
    
    if (unreadCount > 0) {
      // Create or update notification badge
      let badge = notificationButton.querySelector('.notification-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        notificationButton.appendChild(badge);
      }
      badge.textContent = unreadCount;
    }
    
    // Add click handler to navigate to inbox
    notificationButton.addEventListener('click', () => {
      window.location.href = 'inbox.html';
    });
  }

  /**
   * Render user profile information
   */
  renderUserProfile() {
    if (!this.data?.user) return;
    
    const profileNameElements = document.querySelectorAll('.profile-name');
    const profileEmailElements = document.querySelectorAll('.profile-email');
    const avatarElements = document.querySelectorAll('.avatar');
    
    profileNameElements.forEach(el => {
      el.textContent = this.data.user.name;
    });
    
    profileEmailElements.forEach(el => {
      el.textContent = this.data.user.email;
    });
    
    avatarElements.forEach(el => {
      el.textContent = this.data.user.avatar;
    });
  }

  /**
   * Initialize page-specific functionality
   */
  initPageSpecific() {
    switch (this.currentPage) {
      case 'index':
        this.initIndexTasks();
        break;
      case 'inbox':
        this.initInboxPage();
        break;
      case 'tasks':
        this.initTasksPage();
        this.updateTasksStatusWidget();
        break;
      case 'roadmap':
        this.initRoadmapPage();
        break;
      case 'projects':
        this.initProjectsPage();
        break;
      // Add other pages as needed
    }
  }

  initIndexTasks() {
    const board = document.querySelector('.tasks-board');
    if (board) this._renderBoard(board);
    this.updateTasksStatusWidget();
    this.renderRecentActivity();
    this.setupQuickAdd();
    this.renderPinnedTasks();
    this.setupScratchpad();
  }

  /**
   * Initialize inbox page functionality
   */
  initInboxPage() {
    if (this.currentPage !== 'inbox') return;
    
    // Render notifications
    this.renderNotifications();
    
    // Set up tab switching
    const tabs = document.querySelectorAll('.inbox-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Filter notifications based on tab
        const filter = tab.textContent.trim().toLowerCase();
        this.filterNotifications(filter);
      });
    });
    
    // Set up mark all as read functionality
    const markAllReadButton = document.querySelector('.mark-all-read');
    if (markAllReadButton) {
      markAllReadButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.markAllNotificationsAsRead();
      });
    }
  }

  /**
   * Render notifications on the inbox page
   */
  renderNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList || !this.data?.notifications) return;
    
    // Clear existing notifications
    notificationsList.innerHTML = '';
    
    if (this.data.notifications.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="currentColor"></path>
        </svg>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      `;
      notificationsList.appendChild(emptyState);
      return;
    }
    
    // Render each notification
    this.data.notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = `notification-item${notification.isRead ? '' : ' unread'}`;
      notificationItem.dataset.id = notification.id;
      notificationItem.dataset.type = notification.type;
      
      notificationItem.innerHTML = `
        <div class="notification-avatar">${notification.sender.avatar}</div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-sender">${notification.sender.name}</span>
            <span class="notification-action">${notification.action}</span>
            ${notification.type ? `<span class="notification-badge">${notification.type}</span>` : ''}
          </div>
          <div class="notification-message">
            ${notification.message}
          </div>
          <div class="notification-meta">
            <div class="notification-info">
              <span class="notification-time">${notification.time}</span>
              <span class="notification-project">${notification.project}</span>
            </div>
            <div class="notification-actions">
              <button title="Mark as read">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </button>
              <button title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners for notification actions
      const readButton = notificationItem.querySelector('button[title="Mark as read"]');
      if (readButton) {
        readButton.addEventListener('click', () => {
          this.markNotificationAsRead(notification.id);
        });
      }
      
      const deleteButton = notificationItem.querySelector('button[title="Delete"]');
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          this.deleteNotification(notification.id);
        });
      }
      
      notificationsList.appendChild(notificationItem);
    });
  }

  /**
   * Filter notifications based on tab selection
   */
  filterNotifications(filter) {
    const notificationItems = document.querySelectorAll('.notification-item');
    
    notificationItems.forEach(item => {
      if (filter === 'all') {
        item.style.display = '';
      } else if (filter === 'unread') {
        item.style.display = item.classList.contains('unread') ? '' : 'none';
      } else if (filter === 'mentions') {
        item.style.display = item.dataset.type === 'mention' ? '' : 'none';
      } else if (filter === 'assigned') {
        item.style.display = item.dataset.type === 'assigned' ? '' : 'none';
      }
    });
  }

  /**
   * Mark a notification as read
   */
  markNotificationAsRead(id) {
    // Update data model
    const notification = this.data.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    
    // Update UI
    const notificationItem = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (notificationItem) {
      notificationItem.classList.remove('unread');
    }
    
    // Update notification count
    this.setupNotifications();
  }

  /**
   * Delete a notification
   */
  deleteNotification(id) {
    // Update data model
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    
    // Update UI
    const notificationItem = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (notificationItem) {
      notificationItem.remove();
    }
    
    // Check if we need to show empty state
    if (this.data.notifications.length === 0) {
      this.renderNotifications();
    }
    
    // Update notification count
    this.setupNotifications();
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead() {
    // Update data model
    this.data.notifications.forEach(notification => {
      notification.isRead = true;
    });
    
    // Update UI
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
      item.classList.remove('unread');
    });
    
    // Update notification count
    this.setupNotifications();
  }

  /**
   * Initialize roadmap page functionality
   */
  initRoadmapPage() {
    if (this.currentPage !== 'roadmap' || !this.data?.roadmap) return;
    
    // Render roadmap data
    Object.entries(this.data.roadmap).forEach(([quarter, data]) => {
      const quarterElement = document.querySelector(`.quarter[data-quarter="${quarter}"]`);
      if (!quarterElement) return;
      
      // Update progress bar
      const progressBar = quarterElement.querySelector('.progress-bar span');
      if (progressBar) {
        progressBar.style.width = `${data.completion}%`;
      }
      
      // Update progress label
      const progressLabel = quarterElement.querySelector('.progress-label');
      if (progressLabel) {
        progressLabel.textContent = `${data.completion}% Complete`;
      }
      
      // Render initiatives
      const quarterBody = quarterElement.querySelector('.quarter-body');
      if (quarterBody && data.initiatives) {
        data.initiatives.forEach(initiative => {
          const card = document.createElement('div');
          card.className = 'roadmap-card';
          card.dataset.id = initiative.id;
          
          card.innerHTML = `
            <div class="card-top">
              <div class="card-top-left">
                <div class="roadmap-icon">${initiative.id.charAt(0).toUpperCase()}</div>
                <div>
                  <div class="card-title">${initiative.title}</div>
                </div>
              </div>
              <div class="status-pill ${initiative.status}">${initiative.status}</div>
            </div>
          `;
          
          quarterBody.appendChild(card);
        });
      }
    });
  }

  /**
   * Initialize projects page functionality
   */
  initProjectsPage() {
    if (this.currentPage !== 'projects' || !this.data?.projects) return;
    
    // Render projects data
    const projectsList = document.querySelector('.projects-list');
    if (!projectsList) return;
    
    this.data.projects.forEach(project => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.dataset.id = project.id;
      
      projectCard.innerHTML = `
        <div class="project-header">
          <h3 class="project-title">${project.name}</h3>
          <div class="project-status">${project.status}</div>
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.completion}%"></div>
          </div>
          <div class="progress-text">${project.completion}%</div>
        </div>
      `;
      
      projectsList.appendChild(projectCard);
    });
  }

  /**
   * Initialize tasks page functionality
   */
  initTasksPage() {
    if (this.currentPage !== 'tasks') return;
    if (!this.data?.tasks) this.data.tasks = [];

    const board = document.querySelector('.tasks-board');
    if (!board) return;
    this._renderBoard(board);

    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const cancel = document.getElementById('task-cancel');
    const openFromHash = () => {
      if (window.location.hash === '#new') this.openTaskModal();
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);

    cancel?.addEventListener('click', () => {
      this.closeTaskModal();
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const priority = document.getElementById('task-priority').value;
      const status = document.getElementById('task-status').value;
      const assignee = document.getElementById('task-assignee').value.trim();
      if (!title) return;
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, priority, status, assignee })
        });
        if (!res.ok) throw new Error('Failed to create');
        const created = await res.json();
        const createdAt = created.createdAt || Date.now();
        this.data.tasks.push({
          id: created._id || created.id,
          title: created.title,
          priority: created.priority,
          status: created.status,
          assignee: created.assignee,
          createdAt
        });
        this.closeTaskModal();
        const board = document.querySelector('.tasks-board');
        if (board) this._renderBoard(board);
        this.updateTasksStatusWidget();
        this.renderRecentActivity();
      } catch (err) {
      }
    });

    this.updateTasksStatusWidget();
  }

  _renderBoard(board) {
    const columns = board.querySelectorAll('.kanban-column');
    const byStatus = { 'backlog': [], 'in-progress': [], 'review': [], 'done': [] };
    (this.data?.tasks || []).forEach(task => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.dataset.id = task.id;
      card.draggable = true;
      card.innerHTML = `
        <div class="card-title">${task.title}</div>
        <div class="card-meta">Priority • ${task.priority}${task.assignee ? ` • ${task.assignee}` : ''}</div>
        <button class="star-button${task.starred ? ' active' : ''}" title="Pin"></button>
      `;
      const starBtn = card.querySelector('.star-button');
      starBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const next = !task.starred;
        task.starred = next;
        starBtn.classList.toggle('active', next);
        this.renderPinnedTasks();
        try {
          const base = (window.location.origin && window.location.origin.startsWith('http')) ? '' : 'http://localhost:3000';
          await fetch(`${base}/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ starred: next }) });
        } catch (_) {}
      });
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', String(task.id));
        requestAnimationFrame(() => card.classList.add('dragging'));
      });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); });
      const group = byStatus[task.status] || byStatus['backlog'];
      group.push(card);
    });
    columns.forEach(col => {
      const status = col.getAttribute('data-status');
      const body = col.querySelector('.column-body');
      const countEl = col.querySelector('.count');
      const cards = byStatus[status] || [];
      body.innerHTML = '';
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drop-highlight');
        body.classList.add('drop-target');
        this.updateTasksStatusWidget();
      });
      col.addEventListener('dragleave', () => {
        col.classList.remove('drop-highlight');
        body.classList.remove('drop-target');
      });
      col.addEventListener('drop', async (e) => {
        e.preventDefault();
        col.classList.remove('drop-highlight');
        body.classList.remove('drop-target');
        const id = e.dataTransfer.getData('text/plain');
        const task = (this.data?.tasks || []).find(t => String(t.id) === String(id));
        if (!task || task.status === status) return;
        const prev = task.status;
        task.status = status;
        const cardEl = board.querySelector(`.kanban-card[data-id="${CSS.escape(String(id))}"]`);
        if (cardEl) { cardEl.classList.add('card-in'); body.appendChild(cardEl); }
        this._updateColumnCounts(board);
        this.updateTasksStatusWidget();
        try {
          const base = (window.location.origin && window.location.origin.startsWith('http')) ? '' : 'http://localhost:3000';
          await fetch(`${base}/api/tasks/${id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
          });
        } catch (err) {
          task.status = prev;
          const prevCol = board.querySelector(`.kanban-column[data-status="${prev}"] .column-body`);
          const cardEl2 = board.querySelector(`.kanban-card[data-id="${CSS.escape(String(id))}"]`);
          if (prevCol && cardEl2) prevCol.appendChild(cardEl2);
          this._updateColumnCounts(board);
          this.updateTasksStatusWidget();
        }
      });
      cards.forEach(c => { c.classList.add('card-in'); body.appendChild(c); });
      if (countEl) countEl.textContent = String(cards.length);
    });
  }

  setupQuickAdd() {
    const input = document.getElementById('quick-add-title');
    const prioritySel = document.getElementById('quick-add-priority');
    const btn = document.getElementById('quick-add-button');
    if (!input || !btn) return;
    const submit = async () => {
      const title = input.value.trim();
      const priority = prioritySel?.value || 'Medium';
      if (!title) return;
      try {
        const base = (window.location.origin && window.location.origin.startsWith('http')) ? '' : 'http://localhost:3000';
        const res = await fetch(`${base}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, priority, status: 'backlog' }) });
        if (!res.ok) return;
        const created = await res.json();
        this.data.tasks.push({ id: created._id || created.id, title: created.title, priority: created.priority, status: created.status, assignee: created.assignee || '', starred: created.starred || false, createdAt: created.createdAt || Date.now() });
        input.value = '';
        const board = document.querySelector('.tasks-board');
        if (board) this._renderBoard(board);
        this.updateTasksStatusWidget();
        this.renderRecentActivity();
        this.renderPinnedTasks();
      } catch (_) {}
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  }

  renderPinnedTasks() {
    const container = document.getElementById('pinned-list');
    if (!container) return;
    const items = (this.data?.tasks || []).filter(t => t.starred).slice(0,6);
    container.innerHTML = '';
    items.forEach(t => {
      const div = document.createElement('div');
      div.className = 'pinned-card';
      div.innerHTML = `<div class="title">${t.title}</div><div class="meta">Priority • ${t.priority}${t.assignee ? ` • ${t.assignee}` : ''}</div>`;
      container.appendChild(div);
    });
  }

  setupScratchpad() {
    const ta = document.getElementById('scratchpad');
    const status = document.getElementById('scratchpad-status');
    if (!ta) return;
    const key = 'scratchpad';
    ta.value = localStorage.getItem(key) || '';
    const save = () => {
      localStorage.setItem(key, ta.value);
      if (status) status.textContent = 'Saved';
      setTimeout(() => { if (status) status.textContent = ''; }, 1000);
    };
    ta.addEventListener('input', () => { save(); });
  }

  renderRecentActivity() {
    const list = document.querySelector('.activity-list');
    if (!list) return;
    const items = (this.data?.tasks || []).slice().sort((a,b) => (b.createdAt||0) - (a.createdAt||0)).slice(0,5);
    list.innerHTML = '';
    items.forEach(t => {
      const li = document.createElement('li');
      li.className = 'activity-item';
      li.innerHTML = `
        <span class="bullet"></span>
        <div class="activity-content">
          <div class="title">Added: ${t.title}</div>
          <div class="meta">${this._timeAgo(t.createdAt)} • ${t.assignee || 'Unassigned'}</div>
        </div>
      `;
      list.appendChild(li);
    });
  }

  _timeAgo(ts) {
    const d = typeof ts === 'number' ? ts : Date.parse(ts);
    const diff = Math.max(0, Date.now() - (d||Date.now()));
    const m = Math.floor(diff/60000), h = Math.floor(m/60), d2 = Math.floor(h/24);
    if (d2 > 0) return `${d2}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  }

  updateTasksStatusWidget() {
    const stacks = document.querySelectorAll('.chart.stacked .stack');
    if (!stacks.length) return;
    let count;
    const board = document.querySelector('.tasks-board');
    if (board) {
      // Prefer live DOM counts when tasks board is present
      count = {
        backlog: board.querySelectorAll('.kanban-column[data-status="backlog"] .kanban-card').length,
        progress: board.querySelectorAll('.kanban-column[data-status="in-progress"] .kanban-card').length,
        review: board.querySelectorAll('.kanban-column[data-status="review"] .kanban-card').length,
        done: board.querySelectorAll('.kanban-column[data-status="done"] .kanban-card').length,
      };
    } else {
      // Fallback to data model counts
      if (!this.data?.tasks) return;
      count = {
        backlog: this.data.tasks.filter(t => t.status === 'backlog').length,
        progress: this.data.tasks.filter(t => t.status === 'in-progress').length,
        review: this.data.tasks.filter(t => t.status === 'review').length,
        done: this.data.tasks.filter(t => t.status === 'done').length,
      };
    }
    const total = Math.max(1, (count.backlog + count.progress + count.review + count.done));
    stacks.forEach(chart => {
      const segBacklog = chart.querySelector('.stack-segment.backlog');
      const segProgress = chart.querySelector('.stack-segment.progress');
      const segReview = chart.querySelector('.stack-segment.review');
      const segDone = chart.querySelector('.stack-segment.done');
      if (segBacklog) segBacklog.style.width = `${Math.round((count.backlog/total)*100)}%`;
      if (segProgress) segProgress.style.width = `${Math.round((count.progress/total)*100)}%`;
      if (segReview) segReview.style.width = `${Math.round((count.review/total)*100)}%`;
      if (segDone) segDone.style.width = `${Math.round((count.done/total)*100)}%`;
    });
  }

  _updateColumnCounts(board) {
    const cols = board.querySelectorAll('.kanban-column');
    cols.forEach(c => {
      const countEl = c.querySelector('.count');
      const num = c.querySelectorAll('.column-body .kanban-card').length;
      if (countEl) countEl.textContent = String(num);
    });
  }

  openTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.style.display = 'flex';
  }

  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('task-form');
    form?.reset();
    history.replaceState(null, '', 'tasks.html');
  }

  /**
   * Get current page name from URL
   */
  _getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (!filename || filename === '' || filename === '/') {
      return 'index';
    }
    
    return filename.replace('.html', '');
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppCore();
});