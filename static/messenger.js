const socket = io();

const colors = {
    'body-bgc': '#333',
    'main-bgc': '#444',
    'main-c': '#2E8075',
    'text-c': '#' + 'e5'.repeat(3)
}
const cssProps = {
    ff: 'Arial, Helvetica, sans-serif'
}

const sendMsg = () => {
    const field = document.querySelector('#msg');
    if(!field || !field.value.trim()) return;
    
    socket.emit('new', {
        body: field.value,
        user: localStorage.getItem('user'),
    });
    field.value = '';
}
const createMessage = (message) => {
    if(document.querySelector('#m' + message.id)) return;

    const msgElem = setClassName(document.createElement('div'), 'message__cont' + (message.user == localStorage.getItem('user') ? ' message_my' : ''));
    msgElem.id = 'm' + message.id;
    msgElem.innerHTML = `
    <div class="message">
        <div class="message__content">
            <span class="message__user"></span><br>
            <div class="message__body"></div>
        </div>
        <span class="message__date">${message.date ? (new Date(message.date)).toLocaleDateString() : ''}</span>
    </div>`;
    msgElem.querySelector('.message__user').innerText = message.user;
    msgElem.querySelector('.message__body').innerText = message.body;
    
    const messages = document.querySelector('.messages');
    messages.append(msgElem);
    messages.scrollTop = messages.scrollHeight;
    
    const msgId = msgElem.id.replace('m', '')
    socket.on('delete' + msgId, () => msgElem.remove());
    
    if(message.user == localStorage.getItem('user')){
        const deleteBtn = setClassName(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), 'message__delete');
        deleteBtn.innerHTML = '<line x1="50%" y1="0%" x2="50%" y2="100%"></line><line x1="0%" y1="50%" x2="100%" y2="50%"></line>';
        msgElem.append(deleteBtn);

        deleteBtn.onclick = () => socket.emit('delete', msgId);
    }
}

const login = () => {
    if(localStorage.getItem('user')) return;

    const loginWindow = setClassName(document.createElement('div'), 'login');
    loginWindow.innerHTML = `
    <div class="login__content">
        <h2 class="login__title">Enter name</h2>
        <input class="login__form" id="user" type="text"><br>
        <button class="login__submit">Save</button>
    </div>`;

    loginWindow.querySelector('#user').onchange = (evt) => {
        localStorage.setItem('user', evt.target.value);
    }
    loginWindow.querySelector('.login__submit').onclick = () => loginWindow.remove();

    document.body.append(loginWindow);
}

const main = () => {
    // боди ровно под окно
    document.body.style.height = document.documentElement.clientHeight + 'px';
    window.onresize = () => {
        document.body.style.height = document.documentElement.clientHeight + 'px';
    }
    
    for(let prop in Object.assign(colors, cssProps)){
        document.body.style.setProperty('--' + prop, colors[prop]);
    }
    const messages = document.querySelector('.messages');
    messages.style.height = (document.querySelector('.app__content').offsetHeight - document.querySelector('.form').offsetHeight) + 'px'

    socket.on('all', (msgs) => {
        msgs.forEach(createMessage);
        messages.scrollTop = messages.scrollHeight;
    });

    const sendBtn = document.querySelector('.form__send');
    sendBtn.innerHTML = `<path d="${roundPathCorners("M 95 50 L 5 95 L 5 5 Z", .05, true)}" />`;
    sendBtn.onclick = sendMsg;
    document.querySelector('#msg').onkeypress = (evt) => {
        if(evt.key == 'Enter' && !evt.shiftKey){
            evt.preventDefault();
            sendMsg();
        }
    }
    

    login();
    
    socket.on('new', createMessage);
}

document.addEventListener('DOMContentLoaded', main);