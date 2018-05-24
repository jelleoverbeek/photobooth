// (function () {
    const socket = io();

    var test = 'test';

    const app = {
        emit: function () {
            socket.emit('test', test);
        },
        init: function () {

            console.log('init');
        }
    };

    app.init();
// })();