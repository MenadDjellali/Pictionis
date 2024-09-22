const app = require('express')();
const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['*'],
      allowedHeaders: ['*'],
    }
  });
  let currentData = {
    username : '',
    roomId: '',
    word: '',
  }

io.on('connection', (socket) => {
  console.log("A user connected :", socket.id);

  // Écoutez les événements du client pour envoyer et recevoir des données de dessin
  socket.on('draw', (data) => {
    // Émettez l'événement "draw" à tous les autres clients
    socket.broadcast.emit('draw', data);
  });

  socket.on('deleteDrawing', (data) => {
    // Diffusez ce message de suppression à tous les autres utilisateurs connectés (à l'exception de l'émetteur)
    socket.broadcast.emit('drawingDeleted', data);
  });

  socket.on('CREATE_ROOM', (data) => {
    // Diffusez ce message de suppression à tous les autres utilisateurs connectés (à l'exception de l'émetteur)
    currentData.username = data.username
    currentData.roomId = data.roomId
    currentData.word = data.word
    socket.broadcast.emit('CREATE_ROOM', data);
  });

  socket.on('ROOM_EXISTS', (data) => {
    socket.emit('EXISTING_ROOM', currentData);
  });

  socket.on('chatMessage', (data) => {
    console.log(data)
    socket.broadcast.emit('Message', data);
  });
  socket.on('gameState', (data) => {
    console.log(data)
    socket.broadcast.emit('Game', data);
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
  socket.on('error', (error) => {
    console.error('Erreur de connexion au serveur Socket.io', error);
  });
});

server.listen(3000, () => {
  console.log('Serveur en cours d\'exécution sur le port 3000');
});
