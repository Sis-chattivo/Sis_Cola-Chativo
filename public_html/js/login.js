document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();

    if (username) {
        localStorage.setItem('username', username);
        window.location.href = 'main.html';
    }
});

// Redirigir si ya está logueado
window.onload = function() {
    if (localStorage.getItem('username')) {
        window.location.href = 'main.html';
    }
};