function getUsers() { 
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } 
    catch { return []; } 
}

function getAllBlogs() {
    const users = getUsers();
    const approvedBlogs = [];
    users.forEach(user => {
        if (user.blogs) {
            user.blogs.forEach(blog => {
                if (blog.status === 'approved') {
                    approvedBlogs.push({
                        ...blog,
                        createdAt: blog.date || blog.createdAt || new Date().toISOString()
                    });
                }
            });
        }
    });
    return approvedBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// SHARED HELPER FUNCTIONS
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
    if (isNaN(date.getTime())) return "No date";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        window.location.href = `../single-blog/single-blog.html?id=${index}`;
    });

    return card;
}

//HOME PAGE
function loadHomeBlogs() {
    const container = document.getElementById('home-blogs-grid');
    if (!container) return;
    
    const blogs = getAllBlogs();  
    container.innerHTML = '';
    
    if (blogs.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;">No blogs yet. <a href="../create-blog/create.html">Create first →</a></p>';
        return;
    }
    
    blogs.slice(0, 4).forEach((blog, index) => {
        container.appendChild(createBlogCard(blog, index));
    });
}

//  ALL BLOGS PAGE 
function loadAllBlogs() {
    const container = document.getElementById('all-blogs-grid');
    if (!container) return;

    const allBlogs = getAllBlogs();

    const searchInput  = document.getElementById('search-input');
    const filterDropdown = document.getElementById('filter-dropdown');
    const sortDropdown   = document.getElementById('sort-dropdown');

    // Render blogs based on current control states
    function renderBlogs() {
        const query    = (searchInput?.value || '').trim().toLowerCase();
        const category = filterDropdown?.value || '';
        const sortBy   = sortDropdown?.value || 'newest';

        // Search — match title OR content
        let filtered = allBlogs.filter(blog => {
            if (!query) return true;
            return (
                blog.title.toLowerCase().includes(query) ||
                blog.content.toLowerCase().includes(query)
            );
        });

        // Filter by category
        if (category) {
            filtered = filtered.filter(blog => blog.category.toLowerCase() === category.toLowerCase());
        }

        // Sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
        });

        // Render
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <h3>No blogs found</h3>
                    <p>${query ? `No results for "<strong>${query}</strong>"` : 'No blogs match the selected filters.'}</p>
                    <button class="clear-filters-btn" onclick="clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        // Use the real index from getAllBlogs() so single-blog navigation works correctly
        filtered.forEach(blog => {
            const realIndex = allBlogs.indexOf(blog);
            container.appendChild(createBlogCard(blog, realIndex));
        });

        // Update results count badge
        updateResultsCount(filtered.length, allBlogs.length);
    }

    // Results count badge 
    function updateResultsCount(shown, total) {
        let badge = document.getElementById('results-count');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'results-count';
            badge.className = 'results-count';
            const header = document.querySelector('.all-blogs-header');
            if (header) header.after(badge);
        }

        const query    = (searchInput?.value || '').trim();
        const category = filterDropdown?.value || '';
        const sortBy   = sortDropdown?.value || '';

        const isFiltered = query || category || sortBy;
        badge.style.display = isFiltered ? 'flex' : 'none';
        badge.innerHTML = `
            <span class="results-text">
                Showing <strong>${shown}</strong> of <strong>${total}</strong> blogs
                ${query ? `· matching <em>"${query}"</em>` : ''}
                ${category ? `· category: <em>${category}</em>` : ''}
            </span>
            <button class="clear-filters-btn" onclick="clearFilters()">
                <i class="fa-solid fa-xmark"></i> Clear
            </button>
        `;
    }

    // Debounce helper — prevents firing on every keystroke
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // Wire up controls
    if (searchInput)   searchInput.addEventListener('input', debounce(renderBlogs, 250));
    if (filterDropdown) filterDropdown.addEventListener('change', renderBlogs);
    if (sortDropdown)   sortDropdown.addEventListener('change', renderBlogs);

    // Prevent the search form from doing a page reload
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', e => {
            e.preventDefault();
            renderBlogs();
        });
    }

    // Initial render
    renderBlogs();
}

function clearFilters() {
    const searchInput    = document.getElementById('search-input');
    const filterDropdown = document.getElementById('filter-dropdown');
    const sortDropdown   = document.getElementById('sort-dropdown');
    if (searchInput)    searchInput.value = '';
    if (filterDropdown) filterDropdown.value = '';
    if (sortDropdown)   sortDropdown.value = '';

    const badge = document.getElementById('results-count');
    if (badge) badge.style.display = 'none';

    // Re-trigger render
    const event = new Event('change');
    if (filterDropdown) filterDropdown.dispatchEvent(event);
}

// SINGLE BLOG PAGE
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

    const readingTime  = Math.ceil((blog.content || '').split(' ').length / 200);
    const likeCount    = getLikes(blog.id).count;
    const commentCount = getComments(blog.id).length;

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
                <span class="dot">•</span>
                <span class="meta-stat">
                    <i class="fa-solid fa-heart meta-icon"></i>
                    <span id="meta-like-count">${likeCount}</span>
                </span>
                <span class="dot">•</span>
                <span class="meta-stat">
                    <i class="fa-regular fa-comment meta-icon"></i>
                    <span id="meta-comment-count">${commentCount}</span>
                </span>
            </div>

            <div class="single-blog-body">
                ${blog.content || ''}
            </div>
        </article>
    `;

    initLikes(blog.id);
    initComments(blog.id);
}

// comments
function commentsKey(blogId) {
    return `comments_${blogId}`;
}

// Load comments array for a blog from localStorage
function getComments(blogId) {
    try {
        return JSON.parse(localStorage.getItem(commentsKey(blogId)) || '[]');
    } catch {
        return [];
    }
}

// Save comments array for a blog to localStorage
function saveComments(blogId, comments) {
    localStorage.setItem(commentsKey(blogId), JSON.stringify(comments));
}

function renderComments(blogId) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    const comments    = getComments(blogId);
    const currentUser = getCurrentUser();

    const users  = getUsers();
    const avatarMap = {};
    users.forEach(u => { if (u.name && u.avatar) avatarMap[u.name] = u.avatar; });
    if (currentUser && currentUser.avatar) avatarMap[currentUser.name] = currentUser.avatar;

    if (comments.length === 0) {
        list.innerHTML = `<p class="no-comments-msg">No comments yet. Be the first!</p>`;
        return;
    }

    list.innerHTML = comments.map(comment => {
        // Look up the avatar by the comment author's name from the live map
        const avatarUrl  = avatarMap[comment.author] || null;
        const avatarHtml = avatarUrl
            ? `<div class="comment-avatar" style="background-image:url('${avatarUrl}');background-size:cover;background-position:center;"></div>`
            : `<div class="comment-avatar"><i class="fa-solid fa-user"></i></div>`;

        return `
        <div class="comment-card" data-id="${comment.id}">
            <div class="comment-header">
                ${avatarHtml}
                <div class="comment-meta">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${formatDate(comment.date)}</span>
                </div>
                ${currentUser && currentUser.name === comment.author
                    ? `<button class="comment-delete-btn" onclick="deleteComment('${blogId}', '${comment.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>`
                    : ''}
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
    `;
    }).join('');
}


function initComments(blogId) {
    // Comments section and form now exist in static HTML — just render 
    renderComments(blogId);

    const form = document.getElementById('comment-form');
    if (!form) return;

    form.replaceWith(form.cloneNode(true));
    const freshForm = document.getElementById('comment-form');

    freshForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textarea = document.getElementById('comment-input');
        const text = textarea.value.trim();
        if (!text) return;

        const currentUser = getCurrentUser();
        const author    = currentUser ? currentUser.name    : 'Anonymous';
        const avatarUrl = currentUser ? currentUser.avatar  : null;

        const comment = {
            id: Date.now().toString(),
            author,
            avatarUrl,
            text,
            date: new Date().toISOString()
        };

        const comments = getComments(blogId);
        comments.push(comment);
        saveComments(blogId, comments);

        textarea.value = '';
        renderComments(blogId);

        const metaCount = document.getElementById('meta-comment-count');
        if (metaCount) metaCount.textContent = comments.length;
    });
}

// Delete a comment by id 
function deleteComment(blogId, commentId) {
    Swal.fire({
        title: 'Delete comment?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        confirmButtonColor: '#ef4444'
    }).then(result => {
        if (!result.isConfirmed) return;
        const updated = getComments(blogId).filter(c => c.id !== commentId);
        saveComments(blogId, updated);
        renderComments(blogId);

        const metaCount = document.getElementById('meta-comment-count');
        if (metaCount) metaCount.textContent = updated.length;

        Swal.fire('Deleted!', 'Comment removed.', 'success');
    });
}

// Helper needed by comment author display
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
}

// likes

// Storage key for a blog's likes
function likesKey(blogId) {
    return `likes_${blogId}`;
}

// Returns { count, likedBy: [] } for a blog
function getLikes(blogId) {
    try {
        return JSON.parse(localStorage.getItem(likesKey(blogId)) || '{"count":0,"likedBy":[]}');
    } catch {
        return { count: 0, likedBy: [] };
    }
}

// Save the likes object back to localStorage
function saveLikes(blogId, likesObj) {
    localStorage.setItem(likesKey(blogId), JSON.stringify(likesObj));
}

function initLikes(blogId) {
    const btn       = document.getElementById('like-button');
    const countSpan = document.getElementById('like-count');
    if (!btn || !countSpan) return;

    const currentUser = getCurrentUser();
    const userId      = currentUser ? currentUser.id : null;

    function refresh() {
        const likes   = getLikes(blogId);
        const liked   = userId && likes.likedBy.includes(userId);

        // Update the visible count on the button and in the meta row
        countSpan.textContent = `${likes.count} ${likes.count === 1 ? 'Like' : 'Likes'}`;
        const metaLike = document.getElementById('meta-like-count');
        if (metaLike) metaLike.textContent = likes.count;

        // Toggle the active class so CSS can style the filled/unfilled heart
        btn.classList.toggle('liked', liked);
        // Swap the icon between filled and outline heart
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
    }

    btn.addEventListener('click', () => {
        if (!currentUser) {
            Swal.fire('Hold on!', 'You need to be logged in to like a blog.', 'info');
            return;
        }

        const likes = getLikes(blogId);

        if (likes.likedBy.includes(userId)) {
            // User already liked — remove the like 
            likes.count--;
            likes.likedBy = likes.likedBy.filter(id => id !== userId);
        } else {
            // New like
            likes.count++;
            likes.likedBy.push(userId);
        }

        saveLikes(blogId, likes);
        refresh();
    });

    // Set initial state on page load
    refresh();
}

// PROFILE PAGE
function loadProfileBlogs() {
    const container = document.querySelector('.myblogs-container');
    if (!container) return;

    showProfileNotifications();
    
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.blogs || user.blogs.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;">No blogs yet. <a href="../create-blog/create.html">Create first →</a></p>';
        return;
    }

    const userBlogs = [...user.blogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';
    container.style.cssText = 'max-width:1400px;margin:0 auto;padding:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:2.5rem;';

    userBlogs.forEach(blog => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        // flex-direction:column so the image+text section and the button row stack vertically
        card.style.cssText = 'position:relative;padding:0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);display:flex;flex-direction:column;cursor:default;height:350px;';

        const statusColors = {
            approved: { bg: '#d1e7dd', color: '#0f5132', label: '✅ Published' },
            pending:  { bg: '#fff3cd', color: '#856404', label: '⏳ Pending'  },
        };
        const statusStyle = statusColors[blog.status] || { bg: '#f8d7da', color: '#842029', label: '❌ Rejected' };

        card.innerHTML = `
            <div class="blog-card-grid" style="display:grid;grid-template-columns:1.6fr 1fr;flex:1;min-height:0;">
                <div class="blog-card-left" style="padding:1.2rem 1.5rem;overflow:hidden;display:flex;flex-direction:column;gap:6px;">
                    <span class="profile-status-badge" style="background:${statusStyle.bg};color:${statusStyle.color};">
                        ${statusStyle.label}
                    </span>
                    <h3 style="font-size:1rem;color:#1f2937;margin:0;">${blog.title}</h3>
                    <p style="color:#64748b;font-size:0.82rem;line-height:1.5;margin:0;">${blog.content.slice(0, 80)}${blog.content.length > 80 ? '...' : ''}</p>
                    <div class="meta" style="font-size:0.78rem;color:#94a3b8;margin-top:auto;">${formatDate(blog.date)}</div>
                </div>
                <div class="blog-card-right" style="position:relative;overflow:hidden;border-radius:0 12px 0 0;">
                    <img src="${blog.image || 'https://via.placeholder.com/300x200'}" alt="${blog.title}" style="width:100%;height:100%;object-fit:cover;">
                    <span style="position:absolute;bottom:0.8rem;right:0.8rem;background:${getCategoryColor(blog.category)};color:white;padding:0.25rem 0.7rem;border-radius:6px;font-size:0.75rem;font-weight:500;">
                        ${blog.category}
                    </span>
                </div>
            </div>
            <div class="profile-card-actions">
                <button class="profile-action-btn edit-action-btn" onclick="openEditModal('${blog.id}')">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
                <button class="profile-action-btn delete-action-btn" onclick="deleteBlog('${blog.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function deleteBlog(blogId) {
    Swal.fire({
        title: 'Delete this blog?',
        text: 'This cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        confirmButtonColor: '#ef4444'
    }).then(result => {
        if (!result.isConfirmed) return;

        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        user.blogs = (user.blogs || []).filter(b => b.id !== blogId);
        localStorage.setItem('currentUser', JSON.stringify(user));

        const users = getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx].blogs = (users[idx].blogs || []).filter(b => b.id !== blogId);
            localStorage.setItem('users', JSON.stringify(users));
        }

        Swal.fire('Deleted!', 'Your blog has been removed.', 'success').then(() => loadProfileBlogs());
    });
}

// Save the blog id into sessionStorage then redirect to the create page
// blog-script.js will detect this on load and prefill the form
function openEditModal(blogId) {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const blog = (user.blogs || []).find(b => b.id === blogId);
    if (!blog) return;

    sessionStorage.setItem('editBlog', JSON.stringify(blog));
    window.location.href = '../create-blog/create.html';
}

function showProfileNotifications() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.id) return;

    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const unread = notifications.filter(n => n.userId === user.id && !n.read);
    if (unread.length === 0) return;

    let i = 0;
    function showNext() {
        if (i >= unread.length) return;
        Swal.fire({ title: 'Blog Update', text: unread[i].message, icon: 'warning' }).then(() => {
            i++;
            showNext();
        });
    }
    showNext();

    notifications.forEach(n => { if (n.userId === user.id) n.read = true; });
    localStorage.setItem('notifications', JSON.stringify(notifications));
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
    else if (path.includes('profile.html')) {
        loadProfileBlogs();
    }
});