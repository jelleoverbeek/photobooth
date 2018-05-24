// (function () {
    const socket = io();

    var test = 'test';

    document.querySelector(".emit").addEventListener("click", function (ev) {
        socket.emit("test", "hallo jesse");
    });

    socket.on('testAgain', function (msg) {
        console.log("test:", msg);
    });

    const player = document.getElementById('player');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');

    const constraints = {
        video: true,
    };

    const camera = {
        devices: null,
        device: null,
        track: null,
        imageCapture: null,
        photoCapabilities: null,
        enableTorch: function () {
            console.log("torch enabled");

            this.track.applyConstraints({
                advanced: [{torch: true}]
            });
        },
        disableTorch: function () {
            console.log("torch disabled");

            this.track.applyConstraints({
                advanced: [{torch: false}]
            });
        },
        emitTorchState: function (state) {
            console.log('emit', state);

            socket.emit('torch', state);
        },
        onEmitTorchState: function () {
            const _this = this;

            socket.on('torchToggle', function (state) {
                if(state) {
                    _this.enableTorch();
                } else {
                    _this.disableTorch();
                }
            });
        },
        addTorchEvent: function() {
            const _this = this;

            //todo: check if camera has a torch

            //let there be light!
            const btn = document.querySelector('.switch');

            btn.addEventListener('click', function(){
                context.drawImage(player, 0, 0, canvas.width, canvas.height);

                _this.emitTorchState(true);

                setTimeout(function () {
                    _this.emitTorchState(false);
                }, 500);
            });
        },
        connect: function () {

            const _this = this;

            //Test browser support
            const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

            if (SUPPORTS_MEDIA_DEVICES) {
                //Get the environment camera (usually the second one)
                navigator.mediaDevices.enumerateDevices().then(devices => {

                    _this.devices = devices.filter((device) => device.kind === 'videoinput');

                    if (_this.devices.length === 0) {
                        throw 'No camera found on this device.';
                    }

                    _this.device = _this.devices[_this.devices.length - 1];

                    // Create stream and get video track
                    navigator.mediaDevices.getUserMedia({

                        video: {
                            deviceId: _this.device.deviceId,
                            facingMode: ['user', 'environment'],
                            height: {ideal: 1080},
                            width: {ideal: 1920}
                        }

                    }).then(stream => {
                        _this.track = stream.getVideoTracks()[0];

                        player.srcObject = stream;

                        //Create image capture object and get camera capabilities
                        _this.imageCapture = new ImageCapture(_this.track);
                        _this.photoCapabilities = _this.imageCapture.getPhotoCapabilities().then(() => {
                            _this.addTorchEvent();
                        });
                    });
                });

                //The light will be on as long the track exists
            }
        },
        init: function () {
            this.connect();
            this.onEmitTorchState();
        }
    };

    const app = {
        init: function () {
            camera.init();
            console.log('init');
        }
    };

    app.init();
// })();