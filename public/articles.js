// Articles functionality

// DOM Elements
let featuredArticleContainer;
let categoryFiltersContainer;
let articlesGrid;
let loadMoreBtn;
let noArticlesMessage;
let articleModal;
let closeModalBtn;

// Articles data
let articles = [];
let featuredArticle = null;
let filteredArticles = [];
let selectedCategory = "All";
let visibleCount = 6;

// Initialize articles page
function initArticles() {
  // Get DOM elements
  featuredArticleContainer = document.getElementById('featured-article');
  categoryFiltersContainer = document.getElementById('category-filters');
  articlesGrid = document.getElementById('articles-grid');
  loadMoreBtn = document.getElementById('load-more-btn');
  noArticlesMessage = document.getElementById('no-articles');
  articleModal = document.getElementById('article-modal');
  closeModalBtn = document.getElementById('close-modal');
  
  // Load articles data
  loadArticlesData();
  
  // Add event listeners
  addEventListeners();
}

// Load articles data from API
async function loadArticlesData() {
  try {
    const response = await fetch('/api/articles');
    articles = await response.json();
    
    // Set featured article (first article or random)
    featuredArticle = articles[0];
    
    // Get unique categories
    const categories = ["All", ...new Set(articles.map(article => article.category))];
    
    // Initialize filtered articles
    filteredArticles = articles.filter(article => article.id !== featuredArticle.id);
    
    // Render UI
    loadFeaturedArticle();
    loadCategories(categories);
    displayArticles();
  } catch (error) {
    console.error('Error loading articles:', error);
    articlesGrid.innerHTML = '<div class="error-message">Failed to load articles. Please try again later.</div>';
  }
}

// Load category filters
function loadCategories(categories) {
  categoryFiltersContainer.innerHTML = '';
  
  categories.forEach(category => {
    const categoryBtn = document.createElement('button');
    categoryBtn.className = 'category-pill';
    categoryBtn.textContent = category;
    
    if (category === selectedCategory) {
      categoryBtn.classList.add('active');
    }
    
    categoryBtn.addEventListener('click', () => {
      // Update active class
      document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.remove('active');
      });
      categoryBtn.classList.add('active');
      
      // Update selected category
      selectedCategory = category;
      
      // Reset visible count
      visibleCount = 6;
      
      // Filter articles
      filterArticles();
    });
    
    categoryFiltersContainer.appendChild(categoryBtn);
  });
}

// Load featured article
function loadFeaturedArticle() {
  if (featuredArticle) {
    const featuredHtml = `
      <div class="featured-img-container">
        <img src="${featuredArticle.image}" alt="${featuredArticle.title}" class="featured-img">
      </div>
      <div class="featured-content">
        <span class="featured-category">${featuredArticle.category}</span>
        <h3 class="featured-title">${featuredArticle.title}</h3>
        <p class="featured-excerpt">${featuredArticle.excerpt}</p>
        <div class="featured-meta">
          <div class="read-time">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            <span>${featuredArticle.readTime} read</span>
          </div>
          <a href="#" class="read-more" data-id="${featuredArticle.id}">Read more →</a>
        </div>
      </div>
    `;
    
    featuredArticleContainer.innerHTML = featuredHtml;
    
    // Add event listener to the "Read more" link
    featuredArticleContainer.querySelector('.read-more').addEventListener('click', (event) => {
      event.preventDefault();
      const articleId = event.target.getAttribute('data-id');
      openArticleDetail(articleId);
    });
  }
}

// Filter articles based on selected category
function filterArticles() {
  // Filter articles
  filteredArticles = articles.filter(article => {
    if (featuredArticle && article.id === featuredArticle.id) {
      return false; // Exclude featured article
    }
    
    return selectedCategory === "All" || article.category === selectedCategory;
  });
  
  // Display articles
  displayArticles();
}

// Display articles in the grid
function displayArticles() {
  // Clear grid
  articlesGrid.innerHTML = '';
  
  // Check if there are any articles to display
  if (filteredArticles.length === 0) {
    noArticlesMessage.style.display = 'block';
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  // Hide no articles message
  noArticlesMessage.style.display = 'none';
  
  // Display articles up to visible count
  const articlesToShow = filteredArticles.slice(0, visibleCount);
  
  articlesToShow.forEach(article => {
    const articleCard = document.createElement('div');
    articleCard.className = 'article-card';
    
    articleCard.innerHTML = `
      <div class="article-img-container">
        <img src="${article.image}" alt="${article.title}" class="article-img">
      </div>
      <div class="article-content">
        <span class="article-category">${article.category}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-meta">
          <div class="read-time">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            <span>${article.readTime} read</span>
          </div>
          <a href="#" class="read-more" data-id="${article.id}">Read more →</a>
        </div>
      </div>
    `;
    
    articlesGrid.appendChild(articleCard);
    
    // Add event listener to the "Read more" link
    articleCard.querySelector('.read-more').addEventListener('click', (event) => {
      event.preventDefault();
      const articleId = event.target.getAttribute('data-id');
      openArticleDetail(articleId);
    });
  });
  
  // Show/hide load more button
  if (articlesToShow.length < filteredArticles.length) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// Open article detail modal
function openArticleDetail(articleId) {
  const article = articles.find(a => a.id === articleId);
  
  if (article) {
    const modalContent = document.getElementById('article-modal-content');
    
    modalContent.innerHTML = `
      <div class="article-detail-header">
        <span class="article-category">${article.category}</span>
        <h2 class="article-title">${article.title}</h2>
        <div class="article-meta">
          <div class="read-time">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            <span>${article.readTime} read</span>
          </div>
        </div>
      </div>
      <div class="article-detail-img-container">
        <img src="${article.image}" alt="${article.title}" class="article-detail-img">
      </div>
      <div class="article-detail-content">
        ${formatContent(article.content)}
      </div>
      <div class="article-detail-footer">
        <a href="#" id="close-detail" class="back-to-articles">← Back to Articles</a>
      </div>
    `;
    
    // Show modal
    articleModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Add event listener to the "Back to Articles" button
    document.getElementById('close-detail').addEventListener('click', (event) => {
      event.preventDefault();
      closeArticleDetail();
    });
  }
}

// Format article content with paragraphs
function formatContent(content) {
  if (!content) return '';
  return content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('');
}

// Close article detail modal
function closeArticleDetail() {
  articleModal.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}

// Add global event listeners
function addEventListeners() {
  // Load more articles
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += 3;
      displayArticles();
    });
  }
  
  // Close modal when clicking the X
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeArticleDetail);
  }
  
  // Close modal when clicking outside of content
  if (articleModal) {
    window.addEventListener('click', (event) => {
      if (event.target === articleModal) {
        closeArticleDetail();
      }
    });
  }
  
  // Close modal with Escape key
  if (articleModal) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && articleModal.style.display === 'block') {
        closeArticleDetail();
      }
    });
  }
  
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput) {
        alert(`Thank you for subscribing with ${emailInput.value}! You'll receive our next newsletter soon.`);
        emailInput.value = '';
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initArticles);