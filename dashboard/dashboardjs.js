// Admin Dashboard — Blog Approval System

document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboard();
});

function isLoggedIn() {
    try { return !!JSON.parse(localStorage.getItem('currentUser')); } catch { return false; }
}
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
}
function getUsers() {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; }
}
function toRoot() {
    const path = window.location.pathname;
    const depth = path.split('/').filter(Boolean).length - 1;
    return depth > 0 ? '../'.repeat(depth) : './';
}

function loadAdminDashboard() {
    if (!isLoggedIn()) {
        window.location.href = `${toRoot()}login.html`;
        return;
    }
    const user = getCurrentUser();
    if (user.name.toLowerCase().split(' ')[0] !== 'admin') {
        window.location.href = `${toRoot()}home/home.html`;
        return;
    }
    loadPendingBlogs();
}

function loadPendingBlogs() {
    const container = document.getElementById('pending-blogs-container');
    if (!container) return;

    // Collect all pending blogs from every user
    const users = getUsers();
    const pendingBlogs = [];
    users.forEach(user => {
        (user.blogs || []).forEach(blog => {
            if (blog.status === 'pending') {
                pendingBlogs.push({ ...blog, authorEmail: user.email });
            }
        });
    });

    if (pendingBlogs.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#95B2BF;font-style:italic;padding:40px;">No blogs pending approval.</p>';
        return;
    }

    container.innerHTML = '';
    container.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(350px,1fr));gap:2rem;padding:20px;';

    pendingBlogs.forEach(blog => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.style.cssText = 'position:relative;padding:0;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);display:flex;flex-direction:column;';

        card.innerHTML = `
            <div class="blog-card-grid" style="display:grid;grid-template-columns:1.6fr 1fr;flex:1;">
                <div class="blog-card-left" style="padding:1.5rem;">
                    <h3 style="font-size:1.1rem;margin-bottom:0.5rem;color:#1f2937;">${blog.title}</h3>
                    <p style="color:#64748b;line-height:1.5;margin-bottom:0.8rem;font-size:0.9rem;">${blog.content.slice(0, 120)}${blog.content.length > 120 ? '...' : ''}</p>
                    <div style="font-size:0.85rem;color:#94a3b8;">
                        <div>By: <strong>${blog.authorName}</strong></div>
                        <div>${blog.authorEmail}</div>
                        <div>${new Date(blog.date).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="blog-card-right" style="position:relative;">
                    <img src="${blog.image || 'https://via.placeholder.com/300x200'}" alt="${blog.title}" style="width:100%;height:100%;object-fit:cover;">
                    <span style="position:absolute;bottom:0.8rem;right:0.8rem;background:${getCategoryColor(blog.category)};color:white;padding:0.25rem 0.7rem;border-radius:6px;font-size:0.8rem;font-weight:500;">
                        ${blog.category}
                    </span>
                </div>
            </div>
            <div class="approval-actions">
                <button class="approve-btn button" onclick="approveBlog('${blog.id}')">
                    <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="reject-btn button" onclick="rejectBlog('${blog.id}')">
                    <i class="fa-solid fa-xmark"></i> Reject
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function approveBlog(blogId) {
    Swal.fire({
        title: 'Approve Blog?',
        text: 'This will make it visible to everyone!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, approve!'
    }).then(result => {
        if (!result.isConfirmed) return;
        updateBlogStatus(blogId, 'approved');
        Swal.fire('Approved!', 'Blog is now published!', 'success').then(() => loadPendingBlogs());
    });
}

function rejectBlog(blogId) {
    Swal.fire({
        title: 'Reject Blog?',
        text: 'The blog will be deleted and the user will be notified.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reject',
        confirmButtonColor: '#ef4444'
    }).then(result => {
        if (!result.isConfirmed) return;

        // Find the blog before removing it so we can store the notification
        const users = getUsers();
        let authorId = null;
        let blogTitle = '';
        for (const user of users) {
            const found = (user.blogs || []).find(b => b.id === blogId);
            if (found) {
                authorId = user.id;
                blogTitle = found.title;
                break;
            }
        }

        // Remove blog entirely from the user's list
        updateBlogStatus(blogId, 'deleted');

        // Store a notification so the user sees it on next page load
        if (authorId) {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.push({
                userId: authorId,
                message: `Your blog "${blogTitle}" was reviewed and rejected by the admin.`,
                date: new Date().toISOString(),
                read: false
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }

        Swal.fire('Rejected!', 'Blog removed and user notified.', 'warning').then(() => loadPendingBlogs());
    });
}

// Updates blog status in the users array.
// Pass status 'deleted' to remove the blog entirely (used for rejection).
function updateBlogStatus(blogId, status) {
    const users = getUsers();
    for (let user of users) {
        if (!user.blogs) continue;
        const blogIndex = user.blogs.findIndex(b => b.id === blogId);
        if (blogIndex !== -1) {
            if (status === 'deleted') {
                user.blogs.splice(blogIndex, 1);
            } else {
                user.blogs[blogIndex].status = status;
            }
            localStorage.setItem('users', JSON.stringify(users));

            // Keep currentUser in sync if it's their blog
            const currentUser = getCurrentUser();
            if (currentUser && currentUser.id === user.id) {
                currentUser.blogs = user.blogs;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            break;
        }
    }
}

function getCategoryColor(category) {
    const colors = {
        technology: '#3b82f6',
        lifestyle: '#ec4899',
        travel: '#f59e0b',
        food: '#10b981',
        health: '#ef4444'
    };
    return colors[category?.toLowerCase()] || '#6366f1';
}