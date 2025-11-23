let currentUser = '';
let currentGroup = null;
let groups = {};
let messages = {};

window.onload = function() {
    const username = localStorage.getItem('username');
    if (!username) return window.location.href = 'login.html';
    currentUser = username;
    document.getElementById('username').textContent = username;

    const savedGroups = localStorage.getItem('chattivo_groups');
    const savedMessages = localStorage.getItem('chattivo_messages');
    if (savedGroups) groups = JSON.parse(savedGroups);
    if (savedMessages) messages = JSON.parse(savedMessages);

    renderGroups();
};

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem('chattivo_groups', JSON.stringify(groups));
    localStorage.setItem('chattivo_messages', JSON.stringify(messages));
}

// Renderizar lista de grupos
function renderGroups() {
    const list = document.getElementById('groupsList');
    const userGroups = Object.keys(groups).filter(id => groups[id].members.includes(currentUser));
    if (!userGroups.length) return list.innerHTML = '<p>No tienes grupos aún</p>';

    list.innerHTML = userGroups.map(id => {
        const group = groups[id];
        return `<div class="group-item ${currentGroup===id ? 'active' : ''}" onclick="selectGroup('${id}')">
            ${group.name}
        </div>`;
    }).join('');
}

// Seleccionar grupo
function selectGroup(id) {
    currentGroup = id;
    renderGroups();
    renderMessages();
    document.getElementById('chatHeader').textContent = groups[id].name;
    document.getElementById('inputContainer').style.display = 'flex';
}

// Renderizar mensajes
function renderMessages() {
    const container = document.getElementById('messagesContainer');
    const msgs = messages[currentGroup] || [];
    if (!msgs.length) {
        container.innerHTML = '<p>No hay mensajes aún</p>';
        return;
    }

    container.innerHTML = msgs.map(m => `
        <div class="message ${m.sender===currentUser?'sent':'received'}">
            <strong>${m.sender}</strong>: ${m.text}
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

// Enviar mensaje
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', e => {
    if(e.key==='Enter') sendMessage();
});

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentGroup) return;

    if (!messages[currentGroup]) messages[currentGroup] = [];
    messages[currentGroup].push({sender: currentUser, text});
    input.value = '';
    saveData();
    renderMessages();
    renderGroups();
}

// Crear/Unirse grupo
document.getElementById('createGroupBtn').addEventListener('click', () => openModal('create'));
document.getElementById('joinGroupBtn').addEventListener('click', () => openModal('join'));

function openModal(type) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    const input = document.getElementById('modalInput');
    const confirm = document.getElementById('modalConfirm');

    title.textContent = type==='create'?'Crear Grupo':'Unirse a Grupo';
    confirm.onclick = type==='create'? createGroup : joinGroup;

    modal.classList.add('active');
    input.value='';
}

document.getElementById('modalCancel').addEventListener('click', closeModal);
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function createGroup() {
    const name = document.getElementById('modalInput').value.trim();
    if (!name) return alert('Ingresa un nombre');
    const id = 'group_'+Date.now();
    groups[id] = {name, members:[currentUser]};
    saveData();
    renderGroups();
    closeModal();
    selectGroup(id);
}

function joinGroup() {
    const name = document.getElementById('modalInput').value.trim();
    const id = Object.keys(groups).find(i => groups[i].name.toLowerCase()===name.toLowerCase());
    if (!id) return alert('Grupo no encontrado');
    if (!groups[id].members.includes(currentUser)) groups[id].members.push(currentUser);
    saveData();
    renderGroups();
    closeModal();
    selectGroup(id);
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});