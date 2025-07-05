let API ;

async function  getApiBaseUrl () {
   return fetch("appSettings.json")
  .then(response => response.json())
  .then(data => data.ApiBaseUrl)
  .catch(error => {
    console.error("Error fetching API base URL:", error);
  });
}
const API_TIMEOUT = 10000; // 10 seconds timeout

const LoginBtn = document.getElementById("LoginBtn");
const LoginForm = document.getElementById("LoginForm");
const EmailInput = document.getElementById("Email");
const PasswordInput = document.getElementById("Password");

// Form validation state
let isSubmitting = false;

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
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
  [EmailInput, PasswordInput].forEach(field => {
    field.classList.remove('is-invalid', 'is-valid');
  });
}

function showLoadingState() {
  LoginBtn.disabled = true;
  LoginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
}

function resetButtonState() {
  LoginBtn.disabled = false;
  LoginBtn.innerHTML = 'Login';
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
  
  LoginForm.parentNode.insertBefore(alertDiv, LoginForm.nextSibling);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

// Real-time validation
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

PasswordInput.addEventListener('blur', () => {
  const password = PasswordInput.value;
  if (!password) {
    showFieldError(PasswordInput, 'Password is required');
  } else if (!validatePassword(password)) {
    showFieldError(PasswordInput, 'Password must be at least 6 characters long');
  } else {
    clearFieldError(PasswordInput);
  }
});

// Clear validation on input
[EmailInput, PasswordInput].forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('is-invalid', 'is-valid');
  });
});

async function handleLogin() {
    if (!API) {
    API = await getApiBaseUrl();
    if (!API) {
      showAlert("API base URL is not available", "danger");
      return;
    }
  }
  if (isSubmitting) return;

  // Clear previous errors
  clearAllErrors();
  
  const email = EmailInput.value.trim();
  const password = PasswordInput.value;

  // Client-side validation
  let hasErrors = false;

  if (!email) {
    showFieldError(EmailInput, 'Email is required');
    hasErrors = true;
  } else if (!validateEmail(email)) {
    showFieldError(EmailInput, 'Please enter a valid email address');
    hasErrors = true;
  }

  if (!password) {
    showFieldError(PasswordInput, 'Password is required');
    hasErrors = true;
  } else if (!validatePassword(password)) {
    showFieldError(PasswordInput, 'Password must be at least 6 characters long');
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  isSubmitting = true;
  showLoadingState();

  try 
  {
   // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), API_TIMEOUT);
    });

    // Build query parameters
    const params = new URLSearchParams();
    params.append('email', email);  // From your form
    params.append('password', password);  // From your form

    // Create fetch promise
    const fetchPromise = fetch(`${API}/clients?${params.toString()}`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Client not found');
        } else if (response.status === 401) {
            throw new Error('Invalid credentials');
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    }

    const data = await response.json();

    // Adjust for your Flask API's response structure
    if (data && data.email) {  // Check for expected fields
        localStorage.setItem("LoggedIn", "true");
        localStorage.setItem("user_id",data.id);
        localStorage.setItem("user_name", data.name || '');
        localStorage.setItem("user_email", data.email);
        
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    } else {
        throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error("Login error:", error);
    
    let errorMessage = 'An error occurred. Please try again later.';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your internet connection.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.message.includes('Invalid email or password')) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Too many login attempts')) {
      errorMessage = error.message;
    } else if (error.message.includes('Server error')) {
      errorMessage = 'Server is temporarily unavailable. Please try again later.';
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
LoginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  handleLogin();
});

LoginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin();
});

// Add keyboard support
LoginForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleLogin();
  }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
  API = await getApiBaseUrl();
  if (!API) return;
  const isLoggedIn = localStorage.getItem("LoggedIn") === "true";
  if (isLoggedIn) {
    // Check if login is still valid (24 hours)
    const loginTimestamp = localStorage.getItem("login_timestamp");
    const now = Date.now();
    const loginTime = parseInt(loginTimestamp) || 0;
    
    if (now - loginTime < 24 * 60 * 60 * 1000) { // 24 hours
      window.location.href = "index.html";
      return;
    } else {
      // Clear expired session
      localStorage.removeItem("LoggedIn");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("login_timestamp");
    }
  }
});
