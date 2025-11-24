
import { supabaseClient } from "./database.js";// Alternar entre mostrar y ocultar la contraseña

document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('svg');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // Cambiar a ícono de ojo con línea (ocultar)
        icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        passwordInput.type = 'password';
        // Cambiar a ícono de ojo normal (mostrar)
        icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Verificar que usuario y contraseña terminen en "dev"
    if (!username || !password) {
        showError('Debe completar todos los campos.');
        return;
    }

// Buscar usuario en Supabase tabla 'personal'
    const { data, error } = await supabaseClient
        .from('personal')
        .select('*')
        .eq('usuario', username)
        .eq('password', password)
        .maybeSingle();


console.log("DATA:", data);
console.log("ERROR:", error);

    
    if (error || !data) {
        showError('Usuario o contraseña incorrectos.');
        return;
    }

    // Guardar sesión
    localStorage.setItem('username', username);

    // Redirigir
    window.location.href = 'main.html';
});

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

// Redirigir si ya está logueado
window.onload = function() {
    if (localStorage.getItem('username')) {
        window.location.href = 'main.html';
    }
};