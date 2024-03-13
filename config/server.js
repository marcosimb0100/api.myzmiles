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
                        "capacitor://localhost",
                        "ionic://localhost",
                        "http://localhost",
                        "http://localhost:8200",
                        "http://127.0.0.1:8200",
                        "http://localhost:8100",
                        "http://127.0.0.1:8100",
                        "http://localhost:8080",
                        "http://localhost:8030",
                        "https://zmilesprovone.dev-jskarma.net",
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
                "capacitor://localhost",
                "ionic://localhost",
                "https://cdemos.ddns.net",
                "http://localhost",
                "http://localhost:8200",
                "http://127.0.0.1:8200",
                "http://localhost:8100",
                "http://127.0.0.1:8100",
                "http://localhost:8081",
                "http://127.0.0.1:8081",
                "http://localhost:8080",
                "http://localhost:8030",
                "https://zmilesprovone.dev-jskarma.net",
                "*"
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