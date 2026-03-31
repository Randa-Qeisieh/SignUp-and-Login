document.addEventListener('DOMContentLoaded', initAuth);

function initAuth() {
  // Auto-redirect if not logged in on protected pages
  const protectedPages = ['../home/home.html', '../profile.html', '../create-blog/create.html', '../all-blogs/all-blogs.html', '../single-blog/single-blog.html'];
  if (protectedPages.some(page => location.pathname.includes(page)) && !isLoggedIn()) {
      window.location.href = 'login.html';
      return;
  }

  // Signup form
  const signupBtn = document.querySelector('form:has(#confirm_password) .button, a.button[href*="home"]');
  if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSignup();
    });
  }

  // Login form
  const loginBtn = document.querySelector('.form-container .button');
  if (loginBtn && loginBtn.textContent.trim().includes('Login')) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Logout buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('button') && e.target.textContent.includes('Logout')) {
      e.preventDefault();
      logout();
    }
  });

  // Blog form
  const blogForm = document.querySelector('.blog-form');
  if (blogForm) {
    blogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePublishBlog();
    });

    const imageTypeRadios = document.querySelectorAll('input[name="imageType"]');
    for (let radio of imageTypeRadios) radio.addEventListener('change', toggleImageInput);
    document.getElementById('image-file').addEventListener('change', previewImage);
    document.getElementById('image-url').addEventListener('input', previewUrlImage);
  }

  loadUserData();
  updateHeaderAuth();
}

//HELPERS 
function toRoot() {
  const path = window.location.pathname;
  const depth = path.split('/').filter(Boolean).length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

//AUTH FUNCTIONS 
function isLoggedIn() {
  try {
    return !!JSON.parse(localStorage.getItem('currentUser'));
  } catch {
    return false;
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function valid(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function nameValid(name) {
  const pattern = /^[A-Za-z]+(?:\s+[A-Za-z]+){2}$/;
  return pattern.test(name);
}

function phoneValid(phone) {
  const pattern = /^07[789]\d{7}$/;
  return pattern.test(phone);
}

function passwordValid(password) {
  const pattern =  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  return pattern.test(password);
}

function handleSignup() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;

  if (!name || !email || !password || !confirmPassword || !phone) {
    Swal.fire('Error!', 'Please fill all fields', 'error');
    return;
  }
  if (!valid(email)) {
    Swal.fire('Error!', 'Invalid email format', 'error');
    return;
  }
  if (!nameValid(name)) {
    Swal.fire('Error!', 'Name must be 3 words (first, middle, last)', 'error');
    return;
  } 
  if (!phoneValid(phone)) {
    Swal.fire('Error!', 'Phone must start 07[789]xxxxxxx', 'error');
    return;
  }
  if (!passwordValid(password)) {
    Swal.fire('Error!', 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character', 'error');
    return;
  }
  if (password !== confirmPassword) {
    Swal.fire('Error!', 'Passwords do not match', 'error');
    return;
  }
  
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    Swal.fire('Error!', 'Email already exists', 'error');
    return;
  }

  const user = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    avatar: null,
    blogs: []
  };

  localStorage.setItem('currentUser', JSON.stringify(user));
  users.push(user);
  saveUsers(users);

  Swal.fire('Success!', 'Account created! Redirecting...', 'success').then(() => {
    window.location.href = `${toRoot()}home/home.html`;
  });
}

function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value;

  if (!email || !phone) {
    Swal.fire('Error!', 'Please fill email & phone number', 'error');
    return;
  }
  if (!valid(email)) {
    Swal.fire('Error!', 'Invalid email', 'error');
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.phone === phone);

  if (!user) {
    Swal.fire('Error!', 'Invalid credentials', 'error');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(user));
  Swal.fire('Welcome!', `Hello ${user.name}!`, 'success').then(() => {
    window.location.href = `${toRoot()}home/home.html`;
  });
}

// HEADER AUTH
function updateHeaderAuth() {
  const profileLink = document.querySelector('.header-profile');
  const createBlogLink = document.querySelector('a[href*="../create-blog/create.html"]');
  if (!profileLink) return;

  const user = getCurrentUser();
  const root = toRoot();
  const currentPage = window.location.pathname;

  // Hide the button entirely on auth pages
  const authPages = ['index.html', 'login.html'];
  const onAuthPage = authPages.some(page => currentPage.endsWith(page));

  if (onAuthPage) {
    profileLink.style.display = 'none';
    return;
  }

  if (!user) {
    profileLink.style.display = '';
    profileLink.innerHTML = '<span>Sign Up</span>';
    profileLink.href = `${root}index.html`;
    profileLink.classList.add('signup-mode');
    profileLink.classList.remove('logged-mode');

    if (createBlogLink) {
      createBlogLink.style.display = 'none';
    }

  } else {
    profileLink.style.display = '';
    profileLink.innerHTML = '<div class="header-avatar"></div>';
    profileLink.href = `${root}profile.html`;
    profileLink.classList.add('logged-mode');
    profileLink.classList.remove('signup-mode');
    loadAvatarsToHeaders();
  }
}

// AVATAR 
function updateUserAvatar(imageUrl) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  let users = getUsers();
  const userIndex = users.findIndex(u => u.id === currentUser.id);

  if (userIndex !== -1) {
    users[userIndex].avatar = imageUrl;
    saveUsers(users);
    currentUser.avatar = imageUrl;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
}

function loadAvatarsToHeaders() {
  const currentUser = getCurrentUser();
  const avatarUrl = currentUser ? currentUser.avatar : null;

  document.querySelectorAll('.header-avatar').forEach(avatar => {
    if (avatarUrl) {
      avatar.style.backgroundImage = `url(${avatarUrl})`;
      avatar.classList.add('has-image');
      avatar.innerHTML = '';
    } else {
      avatar.style.backgroundImage = '';
      avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
      avatar.classList.remove('has-image');
    }
  });
}

function loadProfileAvatar() {
  const avatarLabel = document.getElementById('avatar-label');
  if (!avatarLabel) return;

  const currentUser = getCurrentUser();
  const avatarUrl = currentUser ? currentUser.avatar : null;

  if (avatarUrl) {
    avatarLabel.style.backgroundImage = `url(${avatarUrl})`;
    avatarLabel.style.backgroundSize = 'cover';
    avatarLabel.style.backgroundPosition = 'center';
    avatarLabel.querySelectorAll('i, span').forEach(el => el.style.display = 'none');
  } else {
    avatarLabel.style.backgroundImage = '';
    avatarLabel.querySelectorAll('i, span').forEach(el => el.style.display = 'block');
  }
}

// PROFILE PICTURE UPLOAD 
document.addEventListener('DOMContentLoaded', function () {
  const uploadInput = document.getElementById('profile-upload');
  const avatarLabel = document.getElementById('avatar-label');

  if (uploadInput && avatarLabel) {
    uploadInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageUrl = e.target.result;

          avatarLabel.style.backgroundImage = `url(${imageUrl})`;
          avatarLabel.style.backgroundSize = 'cover';
          avatarLabel.style.backgroundPosition = 'center';
          avatarLabel.querySelectorAll('i, span').forEach(el => el.style.display = 'none');

          updateUserAvatar(imageUrl);
          loadAvatarsToHeaders();

          Swal.fire('Success', 'Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  loadAvatarsToHeaders();
  loadProfileAvatar();
});

function blogTitleValid(title) {
  const pattern =  /^.{5,}$/;
  return pattern.test(title);
}

// BLOG FUNCTIONS 
function handlePublishBlog() {
  if (!isLoggedIn()) {
    Swal.fire('Login Required!', 'Please login first', 'warning');
    window.location.href = `${toRoot()}login.html`;
    return;
  }

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category-dropdown').value;
  const content = document.getElementById('content').value.trim();

  if (!title || !category || !content) {
    Swal.fire('Error!', 'Title, category & content required', 'error');
    return;
  }

  if (!blogTitleValid(title)) {
    Swal.fire('Error!', 'Title must be 5-500 chars, letters/numbers/punctuation only', 'error');
    return;
  }

  const imageUrlInput = document.getElementById('image-url').value.trim();
  const imageFile = document.getElementById('image-file').files[0];

  let image = null;
  if (imageUrlInput) {
    image = imageUrlInput;
  } else if (imageFile) {
    const reader = new FileReader();
    reader.onload = () => publishBlog(reader.result);
    reader.readAsDataURL(imageFile);
    return;
  }

  publishBlog(image);
}

function publishBlog(imageData) {
  const user = getCurrentUser();
  const blog = {
    id: Date.now().toString(),
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category-dropdown').value,
    image: imageData,
    content: document.getElementById('content').value.trim(),
    date: new Date().toISOString(),
    views: 0,
    likes: 0,
    comments: []
  };

  user.blogs.push(blog);

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    saveUsers(users);
  }

  localStorage.setItem('currentUser', JSON.stringify(user));

  document.querySelector('.blog-form').reset();
  document.getElementById('image-preview').innerHTML = '';

  Swal.fire('Success!', 'Blog published & saved!', 'success');
}

function toggleImageInput() {
  const urlDiv = document.getElementById('url');
  const fileDiv = document.getElementById('file');
  const selected = document.querySelector('input[name="imageType"]:checked').value;

  urlDiv.style.display = selected === 'url' ? 'block' : 'none';
  fileDiv.style.display = selected === 'file' ? 'block' : 'none';
}

function previewImage() {
  const file = document.getElementById('image-file').files[0];
  const preview = document.getElementById('image-preview');
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px; max-height:200px;">`;
    };
    reader.readAsDataURL(file);
  }
}

function previewUrlImage() {
  const url = document.getElementById('image-url').value.trim();
  const preview = document.getElementById('image-preview');
  if (url) {
    preview.innerHTML = `<img src="${url}" style="max-width:200px; max-height:200px;" onerror="this.style.display='none'">`;
  }
}

//  USER DATA 
function loadUserData() {
  if (!isLoggedIn()) return;

  const user = getCurrentUser();

  const profileName = document.querySelector('h2');
  const profileEmail = document.querySelector('.profile-text p');
  if (profileName && (profileName.textContent.includes('Lexi Bob') || profileName.textContent === 'Your Name')) profileName.textContent = user.name;
  if (profileEmail) profileEmail.textContent = user.email;

  const blogsEl = document.querySelector('.blogs-number');
  if (blogsEl) blogsEl.textContent = user.blogs.length;

  //using console log for confirming everything is working
  console.log(`✅ Loaded: ${user.name} (${user.blogs.length} blogs)`);
}

//  LOGOUT 
function logout() {
  localStorage.removeItem('currentUser');
  Swal.fire('Logged Out!', 'All set!', 'info').then(() => {
    window.location.href = `${toRoot()}index.html`;
  });
}