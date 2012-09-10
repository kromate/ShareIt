// SSL Certificates
var fs        = require('fs')
  , socket_io = require('socket.io');

var options = {key:  fs.readFileSync('../certs/privatekey.pem').toString(),
			   cert: fs.readFileSync('../certs/certificate.pem').toString(),
			   ca:   [fs.readFileSync('../certs/certrequest.csr').toString()]}

var PORT_HANDSHAKE = 8001
var PORT_PROXY     = 8002

// Handshake server
var server = require('https').createServer(options).listen(PORT_HANDSHAKE);
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({server: server})

//Array to store connections
wss.sockets = {}

wss.on('connection', function(socket)
{
    // Message received
    socket.onmessage = function(message)
    {
        var args = JSON.parse(message.data)

        var eventName = args[0]
        var socketId  = args[1]

        var soc = wss.sockets[socketId]
        if(soc)
        {
            if(eventName == 'connectTo')
            {
	            args[1] = socket.id

	            soc.send(JSON.stringify(args));
	        }
        }
        else
        {
            socket.send(JSON.stringify([eventName+'.error', socketId]));
            console.warn(eventName+': '+socket.id+' -> '+socketId);
        }
    }

    socket.id = id()
    wss.sockets[socket.id] = socket

    socket.send(JSON.stringify(['sessionId', socket.id]))
    console.log("Connected socket.id: "+socket.id)
})

// DataChannel proxy server
//var server = require('http').createServer().listen(PORT_PROXY);
var server = require('https').createServer(options).listen(PORT_PROXY);
var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: server})

//Array to store connections
wss.sockets = {}

wss.on('connection', function(socket)
{
    function connect_to(socketId)
    {
        // Find peer on socket connected peers
        var room = socket.rooms[socketId]

        // Socket is already connected to the peer on a room
        if(room != undefined)
        {
            socket.send(JSON.stringify(['connect_to.success', socketId, room]));
            return
        }

        var peer = io.sockets.sockets[socketId]
//        var peer = wss.sockets[socketId]

        // Peer is not found, raise error
        if(peer == undefiend)
        {
            socket.send(JSON.stringify(['connect_to.error', socketId]));
            return
        }

        // Peer have been found, create a room and connect them
    }

    // Message received
    socket.onmessage function(message)
    {
        console.log("socket.onmessage = '"+message.data+"'")
        var args = JSON.parse(message.data)

        var eventName = args[0]
        var socketId  = args[1]

        switch(eventName)
        {
            case 'connect_to':
                connect_to(socketId)
        }



        var soc = io.sockets.sockets[socketId]
//        var soc = wss.sockets[socketId]
        if(soc)
        {
            args[1] = socket.id

            soc.send(JSON.stringify(args));
        }
        else
        {
            socket.send(JSON.stringify([eventName+'.error', socketId]));
            console.warn(eventName+': '+socket.id+' -> '+socketId);
        }
    }
})

// generate a 4 digit hex code randomly
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// make a REALLY COMPLICATED AND RANDOM id, kudos to dennis
function id() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
