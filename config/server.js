const express = require('express');
const fileUpload = require('express-fileupload');
const socketIO = require('socket.io');
const { disconnect } = require('../socket/socket');

class Server {

    // io = socketIO.Server; 

    constructor() {

        this.app = express();
        this.port = process.env.PORT;
        this.server = require('http').createServer(this.app);

        this.io = socketIO(this.server
            ,{
                // path: '/socket.io',
                // serveClient: false
                cors: {
                    origin: [
                        "http://localhost:8080",
                        "https://web-myzmiles.onrender.com"
                    ],
                    credentials: true,
                    methods: ["GET", "POST", "PUT"]
                }
            }
        );

        this.middlewares();

        this.routes();

        this.sockets();

    }

    middlewares() {
        this.app.use((req, res, next) => {

            const origenes = [
                "http://localhost:8080",
                "https://web-myzmiles.onrender.com"
            ];

            // console.log(req.headers.origin);
            // console.log(origenes.includes(req.headers.origin));

            if (origenes.includes(req.headers.origin)) {
                res.header('Access-Control-Allow-Origin', req.headers.origin);
            }

            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
            next();


        });

        this.app.use(express.json({ limit: '50000mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static('public'));
        this.app.use(fileUpload());
    };

    routes() {
        //zoho
        this.app.use('/api/zoho', require('../routes/zoho'));
    }

    sockets(){
        
        console.log(`Escuchando conexiones - sockets`);

        this.io.on('connection', customer => {
            // ${customer} - ${this.io}.
            console.log(`customer connect: ${ customer.id }`);
            
            disconnect( customer );

        });

    };

    listen() {
        // Server Web / socket
        this.server.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto: ${ this.port }`);
        });

    };

}

module.exports = Server;