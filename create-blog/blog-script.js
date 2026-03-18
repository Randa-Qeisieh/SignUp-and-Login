document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.blog-form');
    const imageUrlInput = document.getElementById('image-url');
    const imageFileInput = document.getElementById('image-file');
    const urlSection = document.getElementById('url');
    const fileSection = document.getElementById('file');
    const previewDiv = document.getElementById('image-preview');

    // Radio toggle
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
            previewDiv.innerHTML = ''; // clear preview when switching
            previewDiv.style.display = 'none';
        });
    });
    fileSection.style.display = 'none';

    // LIVE PREVIEW - URL
    imageUrlInput.addEventListener('input', () => {
        const url = imageUrlInput.value.trim();
        if (url) {
            previewDiv.innerHTML = `<img src="${url}" alt="Preview">`;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.style.display = 'none';
        }
    });

    // LIVE PREVIEW - File
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Form Submit (unchanged except preview reset)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value;
        const content = document.getElementById('content').value.trim();

        if (!title || !category || !content) {
            alert('Please fill all required fields!');
            return;
        }

        let image = '';
        const imageType = document.querySelector('input[name="imageType"]:checked').value;

        if (imageType === 'url') {
            image = imageUrlInput.value.trim();
            if (!image) { alert('Please provide an image URL!'); return; }
        } else {
            const file = imageFileInput.files[0];
            if (!file) { alert('Please select an image file!'); return; }
            image = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const blog = {
            title: title,
            image: image,
            category: category,
            content: content,
            createdAt: new Date().toISOString()
        };

        let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        blogs.push(blog);
        localStorage.setItem('blogs', JSON.stringify(blogs));

        alert('🎉 Blog published successfully!');

        // Reset everything
        form.reset();
        imageUrlInput.value = '';
        imageFileInput.value = '';
        previewDiv.innerHTML = '';
        previewDiv.style.display = 'none';
        document.querySelector('input[value="url"]').checked = true;
        urlSection.style.display = 'block';
        fileSection.style.display = 'none';
    });
});