var gameState = undefined;

function gameLoop() {
    function initializeGame() {
        function setLevel() {
            var level = Math.floor((mazeDimension-1)/2 - 4);
            $('#level').html('Difficulty ' + level);
        }
        maze = generateSquareMaze(mazeDimension);
        maze[mazeDimension-1][mazeDimension-2] = false;
        timer_duration = mazeDimension * 4;
        chests = createChests(maze);
        createPhysicsWorld();
        createRenderWorld();
        KeyboardJS.unbind.key("left");
        KeyboardJS.unbind.key("right");
        KeyboardJS.unbind.key("down");
        KeyboardJS.unbind.key("up");
        KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey);
        initializeCamera();
        initializeLighting();
        setLevel();
        gameState = 'fade in';
    }
    function fadeGameIn() {
        increaseLighting();
        renderer.render(scene, camera);
        if (lightingIsOn()) {
            setLightingMaxIntensity();
            gameState = 'play';
            startTimer();
        }
    }
    function playGame() {
        function isVictory() {
            var mazeX = Math.floor(headMesh.position.x + 0.5);
            var mazeY = Math.floor(headMesh.position.y + 0.5);
            return mazeX == mazeDimension && mazeY == mazeDimension - 2
        }
        function isTimeout() {
            return timer_duration < 0;
        }
        function checkForChests() {
            var mazeX = Math.floor(headMesh.position.x + 0.5);
            var mazeY = Math.floor(headMesh.position.y + 0.5);
            if(chests[mazeX][mazeY] != null) {
                handleChest(mazeX, mazeY);
            }
        }
        function backgroundNoise()
        {
             var rng = Math.floor(Math.random()*10000);
             if (rng <= 5 ) {
                playBackgroundSound();
             }
        }
        updatePhysicsWorld();
        updateRenderWorld();
        renderer.render(scene, camera);
        if (isVictory()) {
            mazeDimension += 2;
            gameState = 'fade out';
        }
        else if(isTimeout()) {
            writeToTextField("Time's up! You got caught!", "red", 2);
            gameState = 'fade out';
        }
        else {
            checkForChests();
            backgroundNoise();
            }


    }
    function fadeGameOut() {
        if(timer) {
            clearInterval(timer);
        }
        updatePhysicsWorld();
        updateRenderWorld();
        decreaseLighting();
        renderer.render(scene, camera);
        if (lightingIsOff()) {
            setLightingIntensity(0.0);
            renderer.render(scene, camera);
            gameState = 'initialize'
        }
    }

    switch(gameState) {
        case 'initialize': initializeGame();break;
        case 'fade in': fadeGameIn();break;
        case 'play': playGame();break;
        case 'fade out': fadeGameOut();break;
    }
    requestAnimationFrame(gameLoop);
}

function createPhysicsWorld() {
    physicsWorld = new b2World(new b2Vec2(0, 0), true);
    createPlayerBody(1,1);
    createMazeBody();
}

function createRenderWorld() {
    scene = new THREE.Scene();
    createLight();
    scene.add(light);
    createTorch();
    scene.add(torch);
    createCamera();
    scene.add(camera);
    generatePlayerMesh();
    scene.add(playerMesh);
    generateHeadMesh();
    scene.add(headMesh);
    scene.add(generateMazeMesh(maze));
    chestMesh = generateChestMesh(maze);
    scene.add(chestMesh);
    createGround();
    scene.add(groundMesh);
    playBackground();
}

function updatePhysicsWorld() {
    movePlayer();
    physicsWorld.Step(1/60, 8, 3);
}

function updateRenderWorld() {
    updatePlayerMesh();
    updateCamera();
    updateLight();
}