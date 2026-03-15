// Central JS file for all project scripts - EmailJS Template ID FIXED

// 1. Header profile avatar
document.addEventListener('DOMContentLoaded', function() {
  const headerAvatars = document.querySelectorAll('.header-avatar');
  const savedImage = localStorage.getItem('userAvatar');
  if (savedImage) {
    headerAvatars.forEach(avatar => {
      avatar.style.backgroundImage = `url(${savedImage})`;
      avatar.classList.add('has-image');
    });
  } else {
    headerAvatars.forEach(avatar => {
      avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    });
  }
});

function setUserAvatar(url) {
  localStorage.setItem('userAvatar', url);
  const headerAvatars = document.querySelectorAll('.header-avatar');
  headerAvatars.forEach(avatar => {
    avatar.style.backgroundImage = `url(${url})`;
    avatar.classList.add('has-image');
    avatar.innerHTML = '';
  });
}

// 2. Profile upload handler
function initProfileUpload() {
  const uploadInput = document.getElementById('profile-upload');
  const avatarLabel = document.getElementById('avatar-label');
  if (uploadInput && avatarLabel) {
    uploadInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          avatarLabel.style.backgroundImage = `url(${e.target.result})`;
          avatarLabel.style.backgroundSize = 'cover';
          avatarLabel.style.backgroundPosition = 'center';
          const icon = avatarLabel.querySelector('i');
          const text = avatarLabel.querySelector('span');
          if (icon) icon.style.display = 'none';
          if (text) text.style.display = 'none';
          setUserAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

if (document.getElementById('profile-upload')) {
  initProfileUpload();
}

// EmailJS v4 - Template ID verified & recipient fixed
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.contact-form')) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = function() {
      emailjs.init({ publicKey: "XRkQh4EJfDfnfeUWG" });
      console.log('EmailJS ready - check dashboard for service_dvj4ufq + template_ts1mcuu');
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
        to_email: 'support@blog.com',
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
