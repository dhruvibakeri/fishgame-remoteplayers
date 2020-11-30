const net = require('net'); 
const PORT = 1234, HOST = 'localhost'; 



const connectClients = (num : number) => {
    for(let i = 0; i < num; i++) {
        var client = new net.Socket();
        client.connect(PORT, '127.0.0.1', function() {
            console.log('Connected');
        });

        client.on('data', function(data : any) {
            console.log('Received: ' + data);
        });
    }
}

connectClients(10);