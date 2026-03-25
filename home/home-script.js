// SHARED HELPER FUNCTIONS (used by all pages)
function getCategoryColor(category) {
    const colors = {
        technology: '#3b82f6',
        lifestyle: '#ec4899',
        travel: '#f59e0b',
        food: '#10b981',
        health: '#ef4444'
    };
    return colors[category.toLowerCase()] || '#6366f1';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function createBlogCard(blog, index) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
        <div class="blog-card-grid">
            <div class="blog-card-left">
                <h3>${blog.title}</h3>
                <p>${blog.content.slice(0, 100)}${blog.content.length > 100 ? '...' : ''}</p>
                <div class="meta">${formatDate(blog.createdAt)}</div>
            </div>
            <div class="blog-card-right">
                <img src="${blog.image || 'https://picsum.photos/400/300'}" alt="${blog.title}">
                <span class="category" style="background:${getCategoryColor(blog.category)}">
                    ${blog.category}
                </span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
    console.log("Clicked blog #" + index);
    window.location.href = `../single-blog/single-blog.html?id=${index}`;
});

    return card;
}

// PART 1: HOME PAGE CODE (index.html)
function loadHomeBlogs() {
    const container = document.getElementById('home-blogs-grid');
    if (!container) return;

    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];

    container.innerHTML = '';

    if (blogs.length === 0) {
        container.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #64748b; font-size: 1.1rem;">
                No blogs available yet.<br>
                <a href="/create-blog/create.html" style="color:#6366f1;">Create your first blog →</a>
            </p>`;
        return;
    }

    // Show only 4 blogs on home
    blogs.slice(0, 4).forEach((blog, index) => {
        container.appendChild(createBlogCard(blog, index));
    });
}

// PART 2: ALL BLOGS PAGE CODE (blogs.html)
function loadAllBlogs() {
    const container = document.getElementById('all-blogs-grid');
    if (!container) return;

    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];

    container.innerHTML = '';

    if (blogs.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: #64748b; font-size: 1.1rem;">
                No blogs available yet.
            </p>`;
        return;
    }

    blogs.forEach((blog, index) => {
        container.appendChild(createBlogCard(blog, index));
    });
}

// PART 3: SINGLE BLOG PAGE CODE (single-blog.html)
function loadSingleBlog() {
    const container = document.getElementById('single-blog-content');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const blog = blogs[id];

    if (!blog) {
        container.innerHTML = `<h2 style="text-align:center;color:#ef4444;">Blog not found 😕</h2>`;
        return;
    }

    const readingTime = Math.ceil(blog.content.split(' ').length / 200);

    container.innerHTML = `
        <article class="single-blog">
            <div class="single-blog-hero">
                <img src="${blog.image || 'https://picsum.photos/1400/800'}" alt="${blog.title}">
                <div class="hero-overlay">
                    <span class="category-badge" style="background:${getCategoryColor(blog.category)}">
                        ${blog.category}
                    </span>
                    <h1>${blog.title}</h1>
                </div>
            </div>

            <div class="single-blog-meta">
                <span>${formatDate(blog.createdAt)}</span>
                <span class="dot">•</span>
                <span>${readingTime} min read</span>
            </div>

            <div class="single-blog-body">
                ${blog.content}
            </div>

            <button onclick="history.back()" class="back-button">
                ← Back to Blogs
            </button>
        </article>
    `;
}

// RUN THE CORRECT PART BASED ON CURRENT PAGE
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('home.html') || path.endsWith('/') || path === '') {
        loadHomeBlogs();
    } 
    else if (path.includes('all-blogs.html')) {
        loadAllBlogs();
    } 
    else if (path.includes('single-blog.html')) {
        loadSingleBlog();
    }
});