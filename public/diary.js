// Diary functionality

// Get user email from localStorage
let userEmail = localStorage.getItem('email');

// Initialize the diary page
function initDiary() {
  // Set email field if available
  if (userEmail) {
    document.getElementById('userEmail').value = userEmail;
    loadHistory(userEmail);
  }

  // Add event listeners
  document.getElementById('userEmail').addEventListener('change', function() {
    userEmail = this.value;
    localStorage.setItem('email', userEmail);
    loadHistory(userEmail);
  });
  
  // Load user profile information
  loadUserProfile();
}

// Load user profile information
function loadUserProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    const fullName = user.name || 'User';
    const firstName = fullName.split(" ")[0];
    const initials = fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();

    // Update user avatar and name in the sidebar
    if (document.getElementById("user-avatar")) {
      document.getElementById("user-avatar").textContent = initials;
    }
    if (document.getElementById("user-avatar-sidebar")) {
      document.getElementById("user-avatar-sidebar").textContent = initials;
    }
    if (document.getElementById("sidebar-user-name")) {
      document.getElementById("sidebar-user-name").textContent = fullName;
    }

    // Update depression level
    const score = user.quizScore || 0;
    let level = "Unknown";

    if (score <= 10) level = "No Depression";
    else if (score <= 20) level = "Mild Depression";
    else if (score <= 35) level = "Moderate Depression";
    else if (score <= 50) level = "Moderately Severe Depression";
    else level = "Severe Depression";

    if (document.getElementById("depression-level")) {
      document.getElementById("depression-level").textContent = level;
    }
  } else {
    // Redirect to login if no user is found
    window.location.href = "index.html";
  }
}

// Submit diary entry
async function submitEntry() {
  const email = document.getElementById('userEmail').value;
  const text = document.getElementById('diaryText').value;

  if (!email || !text) {
    alert('Please enter both email and diary text');
    return;
  }

  try {
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, text })
    });

    const data = await res.json();

    if (data.reframed) {
      document.getElementById('reframedOutput').innerText = data.reframed;
      document.getElementById('diaryText').value = '';
      loadHistory(email);
    } else {
      alert(data.error || "An error occurred.");
    }
  } catch (err) {
    console.error(err);
    alert("Could not connect to the server.");
  }
}

// Load diary history
async function loadHistory(email) {
  if (!email) return;
  
  try {
    const res = await fetch(`/api/diary/${email}`);
    const data = await res.json();
    const list = document.getElementById('history');
    list.innerHTML = "";

    if (data.entries && data.entries.length > 0) {
      data.entries.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="label">🕒 ${new Date(entry.date).toLocaleString()}</div>
          <div><span class="label">Original:</span><br>${entry.original}</div>
          <div><span class="label">Reframed:</span><br><span class="reframed">${entry.reframed}</span></div>
        `;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>No diary entries found.</li>";
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Could not load diary history.</li>";
  }
}

// Mobile menu functionality
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    // Toggle menu when clicking the menu button
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a nav link (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside (mobile)
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navMenu.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initDiary();
  setupMobileMenu();
});

// Export functions for global access
window.submitEntry = submitEntry;
window.loadHistory = loadHistory;