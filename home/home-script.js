
function getUsers() { 
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } 
    catch { return []; } 
}

//api calling using fetch with async await
async function fetchNews() {
    const url = 'https://newsapi.org/v2/everything?q=tesla&from=2026-02-28&sortBy=publishedAt&apiKey=d80a80ae0e9646ddbe424534ef3299b7';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
            const newsBlogs = result.articles.slice(0,8).map(article => ({
            title: article.title,
            content: article.content || article.description,
            createdAt: article.publishedAt,
            image: article.urlToImage || 'https://www.shutterstock.com/search/breaking-news',
            category: 'news'
            }));
        localStorage.setItem('newsBlogs', JSON.stringify(newsBlogs));
        console.log('📰 Added', newsBlogs.length, 'news blogs');
        console.log(result);
        } 
        catch (error) {
            console.error(error.message);
        }
}

function getAllBlogs() {
    // Get news blogs
    const newsBlogs = JSON.parse(localStorage.getItem('newsBlogs') || '[]');
    
    // Get user blogs
    const users = getUsers();
    const userBlogs = [];
    users.forEach(user => {
        if (user.blogs) {
            user.blogs.forEach(blog => {
                userBlogs.push({
                    ...blog,
                    createdAt: blog.date || blog.createdAt || new Date().toISOString()
                });
            });
        }
    });
    
    // Combine + Sort newest first
    const all = newsBlogs.concat(userBlogs);
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

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
    if (!dateStr) return "No date";

    const date = new Date(dateStr);
    
    // If the date is invalid, show a fallback
    if (isNaN(date.getTime())) {
        return "No date";
    }

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
                <div class="meta">${formatDate(blog.createdAt || blog.date)}</div>
            </div>
            <div class="blog-card-right">
                <img src="${blog.image}" alt="${blog.title}">
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

// PART 1: HOME PAGE CODE 
function loadHomeBlogs() {
    const container = document.getElementById('home-blogs-grid');
    if (!container) return;
    
    const blogs = getAllBlogs();  
    container.innerHTML = '';
    
    if (blogs.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;">No blogs yet. <a href="../create-blog/create.html">Create first →</a></p>';
        return;
    }
    
    else blogs.slice(0, 4).forEach((blog, index) => {  // Top 4 newest (from getAllBlogs sort)
        container.appendChild(createBlogCard(blog, index));
    });
}

// PART 2: ALL BLOGS PAGE CODE (blogs.html)
function loadAllBlogs() {
    const container = document.getElementById('all-blogs-grid');
    if (!container) return;

    const blogs = getAllBlogs(); 
    container.innerHTML = '';

    if (blogs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#64748b;">No blogs available.</p>';
        return;
    }

    else blogs.forEach((blog, index) => container.appendChild(createBlogCard(blog, index)));
}


// PART 3: SINGLE BLOG PAGE CODE (single-blog.html)
function loadSingleBlog() {
    const container = document.getElementById('single-blog-content');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const index = parseInt(urlParams.get('id'));
    const blogs = getAllBlogs();
    const blog = blogs[index];


    if (!blog) {
        container.innerHTML = `<h2 style="text-align:center;color:#ef4444;">Blog not found 😕</h2>`;
        return;
    }

    const readingTime = Math.ceil((blog.content || '').split(' ').length / 200);

    container.innerHTML = `
        <article class="single-blog">
            <div class="single-blog-hero">
                <img src="${blog.image}" alt="${blog.title}">
                <div class="hero-overlay">
                    <span class="category-badge" style="background:${getCategoryColor(blog.category)}">
                        ${blog.category}
                    </span>
                    <h1>${blog.title}</h1>
                </div>
            </div>

            <div class="single-blog-meta">
                <span>${formatDate(blog.createdAt || blog.date)}</span>
                <span class="dot">•</span>
                <span>${readingTime} min read</span>
            </div>

            <div class="single-blog-body">
                ${blog.content || ''}
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
    // Ensure news fetched before loading home blogs
    async function initHomePage() {
        await fetchNews();
        loadHomeBlogs();
    }
    if (path.includes('home.html') || path.endsWith('/') || path === '') {
        initHomePage();
    } 
    else if (path.includes('all-blogs.html')) {
        loadAllBlogs();
    } 
    else if (path.includes('single-blog.html')) {
        loadSingleBlog();
    }
});