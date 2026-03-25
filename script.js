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
        Swal.fire('Error', 'Please select a valid image file!', 'error');
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

// EmailJS

// Init EmailJS once 
emailjs.init({ publicKey: "XRkQh4EJfDfnfeUWG" });

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page reload

            // Disable button & show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';

            // Get & validate form data
            const params = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim(),
            };

            // Validation
            if (!params.name || !params.email || !params.subject || !params.message) {
                Swal.fire('Error', 'Please fill in all fields!', 'error');
                resetButton();
                return;
            }
            if (!/\S+@\S+\.\S+/.test(params.email)) {
                Swal.fire('Error', 'Please enter a valid email address!', 'error');
                resetButton();
                return;
            }

            try {
                // Send via EmailJS
                await emailjs.send('service_bm4wl8v', 'template_7opo10p', params);
                Swal.fire('Success!', '✅ Message sent successfully! We\'ll get back to you soon.', 'success');                contactForm.reset(); // Clear form
            } catch (error) {
                console.error('EmailJS error:', error);
                Swal.fire('Error!', '❌ Failed to send message. Please try again or email us directly at radnak832@gmail.com', 'error');
            } finally {
                resetButton();
            }
        });
    }

    // Helper: Reset submit button
    function resetButton() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send message';
    }
});


