/**
 * Inbox page specific functionality
 */
class InboxPage {
  constructor() {
    this.init();
  }

  init() {
    // Initialize once app core is loaded
    if (window.app && window.app.data) {
      this.setupTabSwitching();
      this.setupActionButtons();
    } else {
      // Wait for app core to initialize
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.init(), 100);
      });
    }
  }

  setupTabSwitching() {
    const tabs = document.querySelectorAll('.inbox-tab');
    const notificationItems = document.querySelectorAll('.notification-item');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter notifications
        const filter = tab.getAttribute('data-filter') || 'all';
        this.filterNotifications(filter, notificationItems);
      });
    });
  }

  filterNotifications(filter, items) {
    items = items || document.querySelectorAll('.notification-item');
    
    items.forEach(item => {
      switch(filter) {
        case 'all':
          item.style.display = '';
          break;
        case 'unread':
          item.style.display = item.classList.contains('unread') ? '' : 'none';
          break;
        case 'mentions':
          item.style.display = item.dataset.type === 'mention' ? '' : 'none';
          break;
        case 'assigned':
          item.style.display = item.dataset.type === 'assigned' ? '' : 'none';
          break;
        default:
          item.style.display = '';
      }
    });
  }

  setupActionButtons() {
    // Mark all as read button
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        unreadItems.forEach(item => {
          item.classList.remove('unread');
        });
        
        // Update app data if available
        if (window.app && window.app.data && window.app.data.notifications) {
          window.app.data.notifications.forEach(notification => {
            notification.isRead = true;
          });
        }
      });
    }
    
    // Individual notification action buttons
    document.querySelectorAll('.notification-item').forEach(item => {
      // Mark as read button
      const readBtn = item.querySelector('button[title="Mark as read"]');
      if (readBtn) {
        readBtn.addEventListener('click', () => {
          item.classList.remove('unread');
          
          // Update app data if available
          if (window.app && window.app.data && window.app.data.notifications) {
            const notificationId = item.dataset.id;
            const notification = window.app.data.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.isRead = true;
            }
          }
        });
      }
      
      // Delete button
      const deleteBtn = item.querySelector('button[title="Delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          // Add fade-out animation
          item.classList.add('fade-out');
          
          // Remove after animation completes
          setTimeout(() => {
            item.remove();
            
            // Update app data if available
            if (window.app && window.app.data && window.app.data.notifications) {
              const notificationId = item.dataset.id;
              window.app.data.notifications = window.app.data.notifications.filter(
                n => n.id !== notificationId
              );
            }
            
            // Check if we need to show empty state
            const remainingItems = document.querySelectorAll('.notification-item');
            if (remainingItems.length === 0) {
              this.showEmptyState();
            }
          }, 300);
        });
      }
    });
  }
  
  showEmptyState() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" fill="currentColor"></path>
        </svg>
        <h3>No notifications</h3>
        <p>You're all caught up!</p>
      </div>
    `;
  }
}

// Initialize the inbox page
document.addEventListener('DOMContentLoaded', () => {
  window.inboxPage = new InboxPage();
});