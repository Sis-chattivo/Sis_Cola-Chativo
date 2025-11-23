let currentUser = '';
let currentGroup = null;
let groups = {};
let messages = {};
let deleteMsgMode = false;
let deleteGroupMode = false;
let pendingDelete = null; // Para guardar qué se va a eliminar

window.onload = function() {
    const username = localStorage.getItem('username');
    if (!username) return window.location.href = 'login.html';
    currentUser = username;
    document.getElementById('username').textContent = username;

    const savedGroups = localStorage.getItem('chattivo_groups');
    const savedMessages = localStorage.getItem('chattivo_messages');
    if (savedGroups) groups = JSON.parse(savedGroups);
    if (savedMessages) messages = JSON.parse(savedMessages);

// Evento para modo eliminar mensajes
    document.getElementById('deleteMsgModeBtn').addEventListener('click', toggleDeleteMsgMode);
    
    // Evento para modo eliminar grupos
    document.getElementById('deleteGroupModeBtn').addEventListener('click', toggleDeleteGroupMode);
    
    // Click en lista de grupos
    document.getElementById('groupsList').addEventListener('click', handleGroupClick);
    
    // Click en mensajes
    document.getElementById('messagesContainer').addEventListener('click', handleMessageClick);

 // Confirmar eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (!pendingDelete) return;
        
        if (pendingDelete.type === 'message') {
            // Eliminar mensaje
            messages[currentGroup].splice(pendingDelete.index, 1);
            saveData();
            renderMessages();
        } else if (pendingDelete.type === 'group') {
            // Eliminar grupo
            const groupId = pendingDelete.id;
            delete groups[groupId];
            delete messages[groupId];
            saveData();
            
            if (currentGroup === groupId) {
                currentGroup = null;
                document.getElementById('chatHeader').querySelector('span').textContent = 'Selecciona un grupo';
                document.getElementById('messagesContainer').innerHTML = '<p class="empty-chat">Selecciona un grupo para comenzar a chatear</p>';
                document.getElementById('inputContainer').style.display = 'none';
            }

    renderGroups();
}
// Cerrar modal
        document.getElementById('confirmDeleteModal').classList.remove('active');
        pendingDelete = null;
    });

    // Cancelar eliminación
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('confirmDeleteModal').classList.remove('active');
        pendingDelete = null;
    });
    renderGroups(); // Mostrar grupos al cargar
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
         return `<div class="group-item ${currentGroup===id ? 'active' : ''} ${deleteGroupMode ? 'delete-mode' : ''}" data-group="${id}">
        <span>${group.name}</span> 
        </div>`;
    }).join('');
}

// Modo eliminar MENSAJES
function toggleDeleteMsgMode() {
    deleteMsgMode = !deleteMsgMode;
    document.getElementById('deleteMsgModeBtn').classList.toggle('active');
    document.getElementById('deleteIndicator').style.display = deleteMsgMode ? 'block' : 'none';
    
    const messagesList = document.querySelectorAll('.message');
    messagesList.forEach(msg => {
        if (deleteMsgMode) {
            msg.classList.add('delete-mode');
        } else {
            msg.classList.remove('delete-mode');
        }
    });
}

// Modo eliminar GRUPOS
function toggleDeleteGroupMode() {
    deleteGroupMode = !deleteGroupMode;
    document.getElementById('deleteGroupModeBtn').classList.toggle('active');
    renderGroups();
}

// Manejar click en grupos
function handleGroupClick(e) {
    const groupItem = e.target.closest('.group-item');
    if (!groupItem) return;
    
    const groupId = groupItem.dataset.group;
    
    if (deleteGroupMode) {
        // ELIMINAR grupo
        pendingDelete = {type: 'group', id: groupId};
        document.getElementById('confirmDeleteMessage').textContent = 
            `¿Estás seguro de eliminar el grupo "${groups[groupId].name}"? Se perderán todos los mensajes.`;
        document.getElementById('confirmDeleteModal').classList.add('active');
    } else {
        // SELECCIONAR grupo
        selectGroup(groupId);
    }
}

// Manejar click en mensajes
function handleMessageClick(e) {
    const message = e.target.closest('.message');
    if (!message || !deleteMsgMode) return;
    
    const index = parseInt(message.dataset.index);
    pendingDelete = {type: 'message', index: index};
    document.getElementById('confirmDeleteMessage').textContent = '¿Estás seguro de eliminar este mensaje?';
    document.getElementById('confirmDeleteModal').classList.add('active');
}

// Seleccionar grupo
function selectGroup(id) {
    currentGroup = id;
    renderGroups();
    renderMessages();
    document.getElementById('chatHeader').querySelector('span').textContent = groups[id].name;
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

    container.innerHTML = msgs.map((m, index) => `
    <div class="message ${m.sender===currentUser?'sent':'received'} ${deleteMsgMode ? 'delete-mode' : ''}" data-index="${index}">
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