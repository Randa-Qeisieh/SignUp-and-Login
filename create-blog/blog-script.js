// create-blog/new-blog-script.js - NEW WORKING SCRIPT (copy-paste to replace blog-script.js)
// Fixes: Publish button now works (uses 'submit' event), saves to localStorage 'blogs'

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.blog-form');
    const imageUrlInput = document.getElementById('image-url');
    const imageFileInput = document.getElementById('image-file');
    const urlSection = document.getElementById('url');
    const fileSection = document.getElementById('file');
    const previewDiv = document.getElementById('image-preview');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Radio toggle (URL vs File)
    const radios = document.querySelectorAll('input[name="imageType"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'url') {
                urlSection.style.display = 'block';
                fileSection.style.display = 'none';
                imageFileInput.value = '';
            } else {
                urlSection.style.display = 'none';
                fileSection.style.display = 'block';
                imageUrlInput.value = '';
            }
            previewDiv.innerHTML = '';
            previewDiv.style.display = 'none';
        });
    });
    // Default: hide file section
    fileSection.style.display = 'none';

    // LIVE PREVIEW - URL input
    imageUrlInput.addEventListener('input', () => {
        const url = imageUrlInput.value.trim();
        if (url) {
            previewDiv.innerHTML = `<img src="${url}" alt="Preview" style="max-width:100%;max-height:200px;">`;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    });

    // LIVE PREVIEW - File select
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%;max-height:200px;">`;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewDiv.style.display = 'none';
        }
    });

    // FIXED FORM SUBMIT HANDLER ('submit' event, not 'publish')
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable button during save
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';

        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category-dropdown').value; // Note: ID is category-dropdown
        const content = document.getElementById('content').value.trim();

        // Validation
        if (!title || !category || !content) {
            Swal.fire('Error', 'Please fill all required fields: title, category, content!', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish';
            return;
        }

        let image = '';
        const imageType = document.querySelector('input[name="imageType"]:checked').value;

        try {
            if (imageType === 'url') {
                image = imageUrlInput.value.trim();
                if (!image) {
                    Swal.fire('Error', 'Please provide an image URL!', 'error');
                    return;
                }
            } else {
                const file = imageFileInput.files[0];
                if (!file) {
                    Swal.fire('Error', 'Please select an image file!', 'error');
                    return;
                }
                // Async FileReader for base64
                image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            // Create blog object
            const blog = {
                id: Date.now(), // Unique ID
                title,
                image,
                category,
                content,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage
            let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
            blogs.push(blog);
            localStorage.setItem('blogs', JSON.stringify(blogs));

            Swal.fire('Success!', '🎉 Blog published successfully! Check All Blogs page.', 'success');

            // Reset form
            form.reset();
            imageUrlInput.value = '';
            imageFileInput.value = '';
            previewDiv.innerHTML = '';
            previewDiv.style.display = 'none';
            document.querySelector('input[value="url"]').checked = true;
            urlSection.style.display = 'block';
            fileSection.style.display = 'none';

        } catch (error) {
            Swal.fire('Error', 'Error saving blog: ' + error.message, 'error');
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish';
        }
    });
});
