/*
 * Shooter game example
 *
 * Touch screen to move our ship. The bullets are fired automatically.
 */
var alloy = require('co.lanica.platino');

function MainScene(window, game) {

    var debug = true;

    var updateTimerID = 0;

    // Create scene
    var self = alloy.createScene();

    var track = null;
    var titleScreen = null;

    var titleScreenTransform = null;
    var trackTransform = null;

    var lookAtTransform  = null;
    var zoomOutTransform = null;

    var cars = [];

    var DEFAULT_CAR_SPEED = 5;
    var DEFAULT_CAR_SPEED_WITH_BRAKE = 3;
    var carSpeed = DEFAULT_CAR_SPEED;

    var started = false;

    var updateTimer = function(e) {
        for (var i in cars) {
            cars[i].x += cars[i].velX;
            cars[i].y += cars[i].velY;

            if (cars[i].x > track.width + cars[i].width && cars[i].velX > 0) {
                cars[i].x = -100;
            }

            if (cars[i].x < -100 && cars[i].velX < 0) {
                cars[i].x = track.width + cars[i].width + 100;
            }
        }
    };

    var zoomOutCompleted = function(e) {
        setInterval(updateTimer, 33);
    };

    var titleScreenTransformCompleted = function(e) {
        started = true;

        track.show();

        track.duration = 1500;
        track.transform(trackTransform);
    };

    var handleTouch = function(_e) {
        var e =  {type:_e.type, source:_e.source};
        e.x = _e.x * game.touchScaleX;
        e.y = _e.y * game.touchScaleY;

        if (e.type == "touchstart") {
            if (!started) {
                if (titleScreen.alpha == 1) {
                    titleScreenTransform.duration = 1000;
                    titleScreenTransform.alpha = 0;
                    titleScreen.transform(titleScreenTransform);
                }
            }
        }
    };

    self.addEventListener('onloadsprite', function(e) {
        Ti.API.info("onloadsprite: " + e.tag);
        if (e.tag == "TRACK") {
            game.unloadTexture(e.tag);
        } else if (e.tag == "TITLE_SCREEN") {
            game.unloadTexture(e.tag);

            var t = alloy.createTransform();
            t.duration = 1500;
            t.alpha = 1;

            titleScreen.transform(t);
        }
    });

    function zoomOut() {
        var defaultCamera = game.defaultCamera;

        zoomOutTransform.duration = 1;
        zoomOutTransform.easing = alloy.ANIMATION_CURVE_EASE_IN;
        zoomOutTransform.lookAt_centerX = track.width  * 0.5;
        zoomOutTransform.lookAt_centerY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeX = track.width  * 0.5;
        zoomOutTransform.lookAt_eyeY = track.height * 0.5;
        zoomOutTransform.lookAt_eyeZ = defaultCamera.eyeZ;

        game.moveCamera(zoomOutTransform);
    }

    self.addEventListener('activated', function(e) {
        Ti.API.info("main scene is activated");

        cars = [];
        started = false;

        cars[0] = alloy.createSprite({image:'graphics/car1.png'});
        cars[0].velX = DEFAULT_CAR_SPEED;
        cars[0].velY = 0;
        cars[0].x = -cars[0].width;
        cars[0].y = 550;

        cars[1] = alloy.createSprite({image:'graphics/car2.png'});
        cars[1].velX = -DEFAULT_CAR_SPEED;
        cars[1].velY = 0;
        cars[1].x = -cars[0].width;
        cars[1].y = 250;
        cars[1].angle = 180;


        if (updateTimerID > 0) {
            clearInterval(updateTimerID);
            updateTimerID = 0;
        }

        if (track === null) {
            track = alloy.createSprite({image:'graphics/basictrack.png'});
            track.tag = "TRACK";
        }

        if (titleScreen === null) {
            titleScreen = alloy.createSprite({image:'graphics/titlescreen.png'});
            titleScreen.tag = "TITLE_SCREEN";
        }

        if (lookAtTransform === null) {
            lookAtTransform = alloy.createTransform();
        }

        if (zoomOutTransform === null) {
            zoomOutTransform = alloy.createTransform();
        }

        if (titleScreenTransform === null) {
            titleScreenTransform = alloy.createTransform();
        }

        if (trackTransform === null) {
            trackTransform = alloy.createTransform();
        }

        zoomOutTransform.addEventListener('complete', zoomOutCompleted);
        titleScreenTransform.addEventListener('complete', titleScreenTransformCompleted);
        trackTransform.addEventListener('complete', zoomOut);

        track.hide();

        self.add(titleScreen);
        self.add(track);

        for (var i in cars) {
            cars[i].rotationCenter = {x:cars[i].width * 0.5, y:cars[i].height * 0.5};
            cars[i].z = track.z + 1;
            self.add(cars[i]);
        }

        game.addEventListener('touchstart', handleTouch);
        game.addEventListener('touchmove',  handleTouch);
        game.addEventListener('touchend',   handleTouch);

        game.startCurrentScene();
    });

    self.addEventListener('deactivated', function(e) {
        Ti.API.info("main scene is deactivated");

        if (track !== null) {
            self.remove(track);
            track = null;
        }

        game.removeEventListener('touchstart', handleTouch);
        game.removeEventListener('touchmove',  handleTouch);
        game.removeEventListener('touchend',   handleTouch);
    });

    // Stop update timer before app is closed
    window.addEventListener('android:back', function(e) {
        clearInterval(updateTimerID);
    });

    return self;
}

module.exports = MainScene;
