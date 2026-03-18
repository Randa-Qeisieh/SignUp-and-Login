document.addEventListener('DOMContentLoaded', function() {
  // 1. Load saved avatar into ALL header avatars on EVERY page
  const headerAvatars = document.querySelectorAll('.header-avatar');
  const savedImage = localStorage.getItem('userAvatar');
  if (savedImage) {
    headerAvatars.forEach(avatar => {
      avatar.style.backgroundImage = `url(${savedImage})`;
      avatar.classList.add('has-image');
      avatar.innerHTML = ''; // Clear default icon
    });
  } else {
    // Default gradient + user icon
    headerAvatars.forEach(avatar => {
      avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
      avatar.classList.remove('has-image');
    });
  }

  // 2. Profile upload handler (only on profile.html)
  const uploadInput = document.getElementById('profile-upload');
  const avatarLabel = document.getElementById('avatar-label');
  if (uploadInput && avatarLabel) {
    uploadInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const imageUrl = e.target.result;
          
          // Update profile avatar display
          avatarLabel.style.backgroundImage = `url(${imageUrl})`;
          avatarLabel.style.backgroundSize = 'cover';
          avatarLabel.style.backgroundPosition = 'center';
          
          // Hide icon and text
          const icon = avatarLabel.querySelector('i');
          const text = avatarLabel.querySelector('span');
          if (icon) icon.style.display = 'none';
          if (text) text.style.display = 'none';
          
          // Save to localStorage and update ALL headers
          localStorage.setItem('userAvatar', imageUrl);
          updateAllHeaders(imageUrl);
          
          console.log('✅ Profile picture uploaded & synced!');
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file.');
      }
    });
  }
});

// Function to update ALL header avatars (called after upload)
function updateAllHeaders(imageUrl) {
  const headerAvatars = document.querySelectorAll('.header-avatar');
  headerAvatars.forEach(avatar => {
    avatar.style.backgroundImage = `url(${imageUrl})`;
    avatar.classList.add('has-image');
    avatar.innerHTML = '';
  });
}

// Auto-load saved image to profile avatar (run once on profile page)
const savedImage = localStorage.getItem('userAvatar');
const avatarLabel = document.getElementById('avatar-label');
if (savedImage && avatarLabel) {
  avatarLabel.style.backgroundImage = `url(${savedImage})`;
  avatarLabel.style.backgroundSize = 'cover';
  avatarLabel.style.backgroundPosition = 'center';
  const icon = avatarLabel.querySelector('i');
  const text = avatarLabel.querySelector('span');
  if (icon) icon.style.display = 'none';
  if (text) text.style.display = 'none';
}

// EmailJS v4 - Template ID verified & recipient fixed
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.contact-form')) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function() {
      emailjs.init({ publicKey: "XRkQh4EJfDfnfeUWG" });
      console.log('EmailJS ready - check dashboard for service_dvj4ufq + template_2mgglp4');
    };
    document.head.appendChild(script);
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      const formData = {
        from_name: this.name.value || 'Anonymous',
        from_email: this.email.value || '',
        message: this.message.value || '',
        to_email: 'randak832@gmail.com',
        'user_email': this.email.value
      };
      try {
        await emailjs.send('service_dvj4ufq', 'template_2mgglp4', formData);
        alert('✅ Sent!');
        this.reset();
      } catch (error) {
        console.error(error);
        alert(`❌ Template/service mismatch. Dashboard check:\nService: service_dvj4ufq\nTemplate: template_ts1mcuu\nError: ${error.text || error.message}`);
      }
    });
  }

  // Demo other forms
  document.querySelectorAll('form:not(.contact-form)').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      console.log('Demo:', data);
      alert('Demo submit');
    });
  });
});
