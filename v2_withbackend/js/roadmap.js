/**
 * Roadmap page specific functionality
 */
class RoadmapPage {
  constructor() {
    this.init();
  }

  init() {
    // Initialize once app core is loaded
    if (window.app && window.app.data) {
      this.setupRoadmapCards();
      this.setupFilters();
    } else {
      // Wait for app core to initialize
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.init(), 100);
      });
    }
  }

  setupRoadmapCards() {
    const roadmapCards = document.querySelectorAll('.roadmap-card');
    
    roadmapCards.forEach(card => {
      // Add click event to show details
      card.addEventListener('click', () => {
        const initiativeId = card.dataset.id;
        if (initiativeId) {
          this.showInitiativeDetails(initiativeId);
        }
      });
    });
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll('.roadmap-filter');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active filter
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply filter
        const filter = button.dataset.filter || 'all';
        this.filterInitiatives(filter);
      });
    });
  }

  filterInitiatives(filter) {
    const cards = document.querySelectorAll('.roadmap-card');
    
    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = '';
      } else {
        const status = card.querySelector('.status-pill')?.textContent.toLowerCase();
        card.style.display = (status === filter) ? '' : 'none';
      }
    });
  }

  showInitiativeDetails(initiativeId) {
    // Find initiative data
    let initiative = null;
    if (window.app && window.app.data && window.app.data.roadmap) {
      for (const quarter in window.app.data.roadmap) {
        const found = window.app.data.roadmap[quarter].initiatives.find(
          i => i.id === initiativeId
        );
        if (found) {
          initiative = found;
          break;
        }
      }
    }
    
    if (!initiative) return;
    
    // Create modal for initiative details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${initiative.title}</h2>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="initiative-details">
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="status-pill ${initiative.status}">${initiative.status}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <p>${initiative.description || 'No description available.'}</p>
            </div>
            <div class="detail-row">
              <span class="detail-label">Owner:</span>
              <span>${initiative.owner || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Add close functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    // Close when clicking outside modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Initialize the roadmap page
document.addEventListener('DOMContentLoaded', () => {
  window.roadmapPage = new RoadmapPage();
});