// Authentication handling

let authModal = null;

function handleAuth() {
    // Check if user is already logged in
    const user = window.firebaseAuth.currentUser;
    
    if (user) {
        // User is logged in, show logout confirmation
        if (confirm('Are you sure you want to logout?')) {
            handleLogout();
        }
    } else {
        // User is not logged in, show login/signup modal
        showAuthModal();
    }
}

function handleLogout() {
    window.firebaseAuthFunctions.signOut(window.firebaseAuth)
        .then(() => {
            showToast('Logged out successfully', 'success');
            // Redirect to home if on saved recipes page
            if (window.location.pathname === '/saved') {
                window.location.href = '/';
            }
        })
        .catch((error) => {
            showToast('Error logging out: ' + error.message, 'error');
        });
}

function showAuthModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="authModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Authentication</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login-panel" type="button">
                                    Login
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="signup-tab" data-bs-toggle="tab" data-bs-target="#signup-panel" type="button">
                                    Sign Up
                                </button>
                            </li>
                        </ul>
                        
                        <div class="tab-content">
                            <!-- Login Panel -->
                            <div class="tab-pane fade show active" id="login-panel">
                                <form id="loginForm" onsubmit="handleLogin(event)">
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="loginEmail" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input type="password" class="form-control" id="loginPassword" required>
                                    </div>
                                    <div id="loginError" class="alert alert-danger" style="display: none;"></div>
                                    <button type="submit" class="btn btn-primary w-100">
                                        <i class="bi bi-box-arrow-in-right"></i> Login
                                    </button>
                                </form>
                            </div>
                            
                            <!-- Sign Up Panel -->
                            <div class="tab-pane fade" id="signup-panel">
                                <form id="signupForm" onsubmit="handleSignup(event)">
                                    <div class="mb-3">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-control" id="signupEmail" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input type="password" class="form-control" id="signupPassword" required minlength="6">
                                        <small class="text-muted">Minimum 6 characters</small>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Confirm Password</label>
                                        <input type="password" class="form-control" id="signupPasswordConfirm" required>
                                    </div>
                                    <div id="signupError" class="alert alert-danger" style="display: none;"></div>
                                    <button type="submit" class="btn btn-success w-100">
                                        <i class="bi bi-person-plus"></i> Create Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        errorDiv.style.display = 'none';
        const userCredential = await window.firebaseAuthFunctions.signInWithEmailAndPassword(
            window.firebaseAuth, 
            email, 
            password
        );
        
        showToast('Login successful!', 'success');
        authModal.hide();
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
        errorDiv.style.display = 'block';
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const errorDiv = document.getElementById('signupError');
    
    // Check if passwords match
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        errorDiv.style.display = 'none';
        const userCredential = await window.firebaseAuthFunctions.createUserWithEmailAndPassword(
            window.firebaseAuth, 
            email, 
            password
        );
        
        showToast('Account created successfully!', 'success');
        authModal.hide();
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
        errorDiv.style.display = 'block';
    }
}

function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password is too weak (minimum 6 characters)',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-primary';
    
    const toastHTML = `
        <div class="toast align-items-center text-white ${bgColor} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Make showToast globally available
window.showToast = showToast;
