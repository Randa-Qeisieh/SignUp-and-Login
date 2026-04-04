document.addEventListener('DOMContentLoaded', () => {
    const form          = document.querySelector('.blog-form');
    const titleInput    = document.getElementById('title');
    const contentInput  = document.getElementById('content');
    const categorySelect = document.getElementById('category-dropdown');
    const imageUrlInput  = document.getElementById('image-url');
    const imageFileInput = document.getElementById('image-file');
    const imageTypeRadios = document.querySelectorAll('input[name="imageType"]');
    const imagePreview   = document.getElementById('image-preview');
    const submitBtn      = form.querySelector('button[type="submit"]');
    const pageTitle      = document.querySelector('.blog-header h2');

    //  CHECK IF WE ARE IN EDIT MODE 
    const editData = sessionStorage.getItem('editBlog');
    const editBlog = editData ? JSON.parse(editData) : null;

    if (editBlog) {
        // Switch the page into edit mode visually
        if (pageTitle) pageTitle.textContent = 'Edit Your Blog';
        submitBtn.textContent = 'Save Changes';

        // Prefill all fields with the existing blog's values
        titleInput.value    = editBlog.title;
        contentInput.value  = editBlog.content;
        categorySelect.value = editBlog.category;

        // If the blog has an image URL, switch to URL mode and prefill it
        if (editBlog.image && !editBlog.image.startsWith('data:')) {
            // It's a URL — select the URL radio and show the URL input
            document.querySelector('input[value="url"]').checked = true;
            document.getElementById('url').style.display  = 'block';
            document.getElementById('file').style.display = 'none';
            imageUrlInput.value = editBlog.image;
            // Show the current image as a preview
            imagePreview.innerHTML = `<img src="${editBlog.image}" alt="Current image">`;
            imagePreview.style.display = 'block';
        } else if (editBlog.image && editBlog.image.startsWith('data:')) {
            document.querySelector('input[value="url"]').checked = true;
            document.getElementById('url').style.display  = 'block';
            document.getElementById('file').style.display = 'none';
            imageUrlInput.value = editBlog.image;
            imagePreview.innerHTML = `<img src="${editBlog.image}" alt="Current image">`;
            imagePreview.style.display = 'block';
        }
    }

    //  IMAGE TYPE TOGGLE
    imageTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleImageType);
    });

    function handleImageType() {
        const isUrl = document.querySelector('input[value="url"]').checked;
        document.getElementById('url').style.display  = isUrl ? 'block' : 'none';
        document.getElementById('file').style.display = isUrl ? 'none'  : 'block';
        imagePreview.style.display = 'none';
    }

    //  IMAGE PREVIEW
    imageUrlInput.addEventListener('input', updatePreview);
    imageFileInput.addEventListener('change', updatePreview);

    function updatePreview() {
        const isUrl = document.querySelector('input[value="url"]').checked;
        if (isUrl && imageUrlInput.value) {
            imagePreview.innerHTML = `<img src="${imageUrlInput.value}" alt="Preview">`;
            imagePreview.style.display = 'block';
        } else if (!isUrl && imageFileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(imageFileInput.files[0]);
        }
    }

    //  FORM SUBMIT
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title    = titleInput.value.trim();
        const content  = contentInput.value.trim();
        const category = categorySelect.value;

        if (!title || !content || !category) {
            Swal.fire('Error', 'Please fill all fields!', 'error');
            return;
        }

        const isUrl = document.querySelector('input[value="url"]').checked;
        let image = '';

        if (isUrl && imageUrlInput.value) {
            image = imageUrlInput.value;
        } else if (!isUrl && imageFileInput.files[0]) {
            // File upload: read as base64 so it persists in localStorage
            const reader = new FileReader();
            reader.onload = (ev) => {
                editBlog
                    ? updateBlog(title, content, category, ev.target.result)
                    : saveBlog(title, content, category, ev.target.result);
            };
            reader.readAsDataURL(imageFileInput.files[0]);
            return;
        } else if (editBlog) {
            image = editBlog.image;
        }

        const finalImage = image || 'https://via.placeholder.com/400x250?text=No+Image';
        editBlog
            ? updateBlog(title, content, category, finalImage)
            : saveBlog(title, content, category, finalImage);
    });

    // save a new blog
    function saveBlog(title, content, category, image) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) {
            Swal.fire('Error', 'You must be logged in to submit a blog.', 'error');
            return;
        }

        const newBlog = {
            id:         Date.now().toString(),
            authorId:   currentUser.id,
            authorName: currentUser.name,
            title,
            content,
            category,
            image,
            date:   new Date().toISOString(),
            status: 'pending'   // always starts pending for admin approval
        };

        // Save into currentUser
        currentUser.blogs = currentUser.blogs || [];
        currentUser.blogs.push(newBlog);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Also save into the users array so the admin dashboard can see it
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].blogs = users[userIndex].blogs || [];
            users[userIndex].blogs.push(newBlog);
            localStorage.setItem('users', JSON.stringify(users));
        }

        Swal.fire('Submitted!', 'Blog sent for admin approval!', 'success');
        form.reset();
        imagePreview.style.display = 'none';
    }

    // ── EDIT MODE: update the existing blog in localStorage ───────────────────
    function updateBlog(title, content, category, image) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) {
            Swal.fire('Error', 'You must be logged in.', 'error');
            return;
        }

        // Build the updated blog — preserve id, authorId, authorName, date, status
        const updatedBlog = {
            ...editBlog,    // keep everything that wasn't changed
            title,
            content,
            category,
            image
        };

        // Update in currentUser
        currentUser.blogs = (currentUser.blogs || []).map(b =>
            b.id === editBlog.id ? updatedBlog : b
        );
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update in the users array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].blogs = (users[userIndex].blogs || []).map(b =>
                b.id === editBlog.id ? updatedBlog : b
            );
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Clear the edit session so the page resets to create mode next time
        sessionStorage.removeItem('editBlog');

        Swal.fire('Updated!', 'Your blog has been saved.', 'success').then(() => {
            // Go back to profile so the user can see the updated card
            window.location.href = '../profile.html';
        });
    }
});