const API = fetch("appSettings.json")
  .then(response => response.json())
  .then(data => data.ApiBaseUrl)
  .catch(error => {
    console.error("Error fetching API base URL:", error);
    return "http://localhost:5000"; // Fallback API URL
  });

const API_TIMEOUT = 10000; // 10 seconds timeout

const RegisterBtn = document.getElementById("RegisterBtn");
const RegisterForm = document.getElementById("RegisterForm");
const NameInput = document.getElementById("Name");
const EmailInput = document.getElementById("Email");
const PhoneInput = document.getElementById("Phone");
const PasswordInput = document.getElementById("Password");
const ConfirmPasswordInput = document.getElementById("ConfirmPassword");
const ProfileImageInput = document.getElementById("ProfileImage");

// Form validation state
let isSubmitting = false;

// Validation functions
function validateName(name) {
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  return nameRegex.test(name.trim());
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validatePhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.trim());
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
}

function validatePasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

function validateImage(file) {
  if (!file) return true; // Image is optional
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

function showFieldError(field, message) {
  field.classList.add('is-invalid');
  const feedback = field.nextElementSibling;
  if (feedback && feedback.classList.contains('invalid-feedback')) {
    feedback.textContent = message;
  }
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  field.classList.add('is-valid');
}

function clearAllErrors() {
  [NameInput, EmailInput, PhoneInput, PasswordInput, ConfirmPasswordInput, ProfileImageInput].forEach(field => {
    field.classList.remove('is-invalid', 'is-valid');
  });
}

function showLoadingState() {
  RegisterBtn.disabled = true;
  RegisterBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating Account...';
}

function resetButtonState() {
  RegisterBtn.disabled = false;
  RegisterBtn.innerHTML = 'Create Account';
}

function showAlert(message, type = 'danger') {
  // Remove existing alerts
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  RegisterForm.parentNode.insertBefore(alertDiv, RegisterForm.nextSibling);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Real-time validation
NameInput.addEventListener('blur', () => {
  const name = NameInput.value.trim();
  if (!name) {
    showFieldError(NameInput, 'Full name is required');
  } else if (!validateName(name)) {
    showFieldError(NameInput, 'Please enter a valid name (letters and spaces only, 2-50 characters)');
  } else {
    clearFieldError(NameInput);
  }
});

EmailInput.addEventListener('blur', () => {
  const email = EmailInput.value.trim();
  if (!email) {
    showFieldError(EmailInput, 'Email is required');
  } else if (!validateEmail(email)) {
    showFieldError(EmailInput, 'Please enter a valid email address');
  } else {
    clearFieldError(EmailInput);
  }
});

PhoneInput.addEventListener('blur', () => {
  const phone = PhoneInput.value.trim();
  if (phone && !validatePhone(phone)) {
    showFieldError(PhoneInput, 'Please enter a valid phone number');
  } else {
    clearFieldError(PhoneInput);
  }
});

PasswordInput.addEventListener('blur', () => {
  const password = PasswordInput.value;
  if (!password) {
    showFieldError(PasswordInput, 'Password is required');
  } else if (!validatePassword(password)) {
    showFieldError(PasswordInput, 'Password must be at least 8 characters with uppercase, lowercase, and number');
  } else {
    clearFieldError(PasswordInput);
  }
  
  // Check password match if confirm password has value
  if (ConfirmPasswordInput.value) {
    if (!validatePasswordMatch(password, ConfirmPasswordInput.value)) {
      showFieldError(ConfirmPasswordInput, 'Passwords do not match');
    } else {
      clearFieldError(ConfirmPasswordInput);
    }
  }
});

ConfirmPasswordInput.addEventListener('blur', () => {
  const password = PasswordInput.value;
  const confirmPassword = ConfirmPasswordInput.value;
  
  if (!confirmPassword) {
    showFieldError(ConfirmPasswordInput, 'Please confirm your password');
  } else if (!validatePasswordMatch(password, confirmPassword)) {
    showFieldError(ConfirmPasswordInput, 'Passwords do not match');
  } else {
    clearFieldError(ConfirmPasswordInput);
  }
});

ProfileImageInput.addEventListener('change', () => {
  const file = ProfileImageInput.files[0];
  if (file && !validateImage(file)) {
    showFieldError(ProfileImageInput, 'Please select a valid image (JPEG, PNG, GIF) under 2MB');
  } else {
    clearFieldError(ProfileImageInput);
  }
});

// Clear validation on input
[NameInput, EmailInput, PhoneInput, PasswordInput, ConfirmPasswordInput, ProfileImageInput].forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('is-invalid', 'is-valid');
  });
});

async function handleRegistration() {
  if (isSubmitting) return;

  // Clear previous errors
  clearAllErrors();
  
  const name = NameInput.value.trim();
  const email = EmailInput.value.trim();
  const phone = PhoneInput.value.trim();
  const password = PasswordInput.value;
  const confirmPassword = ConfirmPasswordInput.value;
  const imageFile = ProfileImageInput.files[0];

  // Client-side validation
  let hasErrors = false;

  if (!name || !validateName(name)) {
    showFieldError(NameInput, 'Please enter a valid full name');
    hasErrors = true;
  }

  if (!email || !validateEmail(email)) {
    showFieldError(EmailInput, 'Please enter a valid email address');
    hasErrors = true;
  }

  if (phone && !validatePhone(phone)) {
    showFieldError(PhoneInput, 'Please enter a valid phone number');
    hasErrors = true;
  }

  if (!password || !validatePassword(password)) {
    showFieldError(PasswordInput, 'Password must be at least 8 characters with uppercase, lowercase, and number');
    hasErrors = true;
  }

  if (!confirmPassword || !validatePasswordMatch(password, confirmPassword)) {
    showFieldError(ConfirmPasswordInput, 'Passwords do not match');
    hasErrors = true;
  }

  if (imageFile && !validateImage(imageFile)) {
    showFieldError(ProfileImageInput, 'Please select a valid image (JPEG, PNG, GIF) under 2MB');
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  isSubmitting = true;
  showLoadingState();

  try {
    const apiUrl = await API;
    const formData = new FormData();
    
    // Append all form data
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (phone) formData.append('phone', phone);
    if (imageFile) formData.append('image', imageFile);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
    });

   
    const fetchPromise = fetch(`${apiUrl}/clients`, {
      method: "POST",
      body: formData
     
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();

    showAlert('Registration successful! Please log in with your new account.', 'success');
    
    // Clear form
    RegisterForm.reset();
    clearAllErrors();
    
    // Redirect to login page after a delay
    setTimeout(() => {
      window.location.href = "Login.html";
    }, 2000);
    
  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = 'An error occurred. Please try again later.';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your internet connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.message.includes('Email already registered') || 
               error.message.includes('already exists')) {
      errorMessage = 'This email is already registered. Please use a different email.';
    } else if (error.message.includes('Invalid') || 
               error.message.includes('validation')) {
      errorMessage = 'Invalid registration data. Please check your information.';
    } else {
      errorMessage = error.message;
    }
    
    showAlert(errorMessage, 'danger');
    
  } finally {
    isSubmitting = false;
    resetButtonState();
  }
}

// Event listeners
RegisterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleRegistration();
});

RegisterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleRegistration();
});

// Add keyboard support
RegisterForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleRegistration();
  }
});

// Password strength indicator
function createPasswordStrengthIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'password-strength';
  indicator.className = 'mt-1';
  PasswordInput.parentNode.appendChild(indicator);
  return indicator;
}

PasswordInput.addEventListener('input', () => {
  const password = PasswordInput.value;
  const strengthIndicator = document.getElementById('password-strength') || createPasswordStrengthIndicator();
  
  let strength = 0;
  let message = '';
  let color = 'danger';
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  
  switch (strength) {
    case 0:
    case 1:
      message = 'Very Weak';
      color = 'danger';
      break;
    case 2:
      message = 'Weak';
      color = 'warning';
      break;
    case 3:
      message = 'Good';
      color = 'primary';
      break;
    case 4:
      message = 'Strong';
      color = 'success';
      break;
  }
  
  strengthIndicator.innerHTML = `
    <div class="progress" style="height: 5px;">
      <div class="progress-bar bg-${color}" style="width: ${(strength / 4) * 100}%"></div>
    </div>
    <small class="text-${color}">${message}</small>
  `;
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem("LoggedIn") === "true";
  if (isLoggedIn) {
    window.location.href = "index.html";
  }
});
