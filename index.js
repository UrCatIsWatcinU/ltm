const fs = require('fs');

const express = require('express');
const app = express();

app.set("view engine", "ejs");
app.use('/static', express.static(__dirname + "/static"));

let messages = require('./messages.json');
let lastId = 0;
if(messages && messages.length){
    lastId = Math.max(...messages.map(m => m.id));
}

app.get('/', (req, res) => {
    res.render('index', {
        messages: messages
    });
});

const io = require('socket.io')(app.listen(require('./conf').port));

io.sockets.on('connection', socket => {
    console.log('Connected');
    socket.emit('all', messages)

    socket.on('new', message => {
        message.id = ++lastId;
        message.date = Date.now();

        messages.push(message);

        io.sockets.emit('new', message);
        
        fs.writeFileSync('./messages.json', JSON.stringify(messages));
    });
    
    socket.on('delete', id => {
        messages = messages.filter(m => m.id != id);
        fs.writeFileSync('./messages.json', JSON.stringify(messages));
        
        io.sockets.emit('delete' + id);
    });
});