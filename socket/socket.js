const { Socket } = require('socket.io');


const disconnect = ( customer = new Socket(), io ) => {

    customer.on('disconnect', () => {
        console.log(`customer disconnect: ${ customer.id }.`);
    } );

};


module.exports = {
    disconnect
};