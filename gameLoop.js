var gameState = undefined;
var escaped = false;
var notcaught = true;

function gameLoop() {
    function initializeGame() {
        function setLevel() {
            var level = Math.floor((mazeDimension-1)/2 - 4);
            $('#level').html('Difficulty ' + level);
        }
        maze = generateSquareMaze(mazeDimension);
        //maze[mazeDimension-1][mazeDimension-2] = false;
        timer_duration = mazeDimension * 4;
        chests = createChests(maze);
        notSpawned = true;
        createPhysicsWorld();
        createRenderWorld();
        assignControls();
        initializeCamera();
        initializeLighting();
        setLevel();
        escaped = false;
        notcaught = true;
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
            if(mazeX <= mazeDimension && mazeY <= mazeDimension && chests[mazeX][mazeY] != null) {
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
        if (timeToSpawnEnemy()){
            writeToTextField("He is coming for you...", "red");
            createEnemyBody(1,1);
            generateEnemyMesh(1,1);
            scene.add(EnemyMesh);

        }
        updatePhysicsWorld();
        updateRenderWorld();
        renderer.render(scene, camera);
        if (isVictory()) {
            if(!escaped) {
                playEndSound();
                writeToTextField("You escaped! Increasing difficulty...", "green");
                removeControls();
                clearPietimer();
                setTimeout(function(){
                    mazeDimension += 2;
                    gameState = 'fade out';
                }, 1200);
                var score = Math.floor((mazeDimension-1)/2 - 4);
                if(score > localStorage.getItem("highscore")) {
                    localStorage.setItem("highscore", score);
                }
                escaped=true;
            }
        }
        else if(isTimeout()) {
            writeToTextField("You are out of time!", "red", 2);
            playDeathSound();
            var score = Math.floor((mazeDimension-1)/2 - 4);
            if(score > localStorage.getItem("highscore")) {
                localStorage.setItem("highscore", score);
            }
            removeControls();
            setTimeout(function(){
                gameState = 'fade out';
                mazeDimension = parseInt(localStorage.getItem("startDifficulty"));
            }, 1000);
        }
        else {
            if (!escaped) {
                checkForChests();
                if (localStorage.getItem("atmosphere") == "horror") {
                    backgroundNoise();
                }
            }
        }

        if (notSpawned == false)
        {
            if (caughtByEnemy())
            {
                writeToTextField("YOU DIED", "red", 2);
                if (notcaught)
                {
                    notcaught = false;
                   playSlam();
                }

                var score = Math.floor((mazeDimension - 1) / 2 - 4);
                if (score > localStorage.getItem("highscore")) {
                    localStorage.setItem("highscore", score);
                }
                removeControls();
                setTimeout(function () {
                    gameState = 'fade out';
                    mazeDimension = parseInt(localStorage.getItem("startDifficulty"));
                }, 500);

            }
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
    if(localStorage.getItem("atmosphere") == "horror"){
        createTorch();
        scene.add(torch);
    }
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
    if (notSpawned == false)
    {
        var enemyPath = findNextStep();
        moveEnemyToCoordinate(enemyPath[0], enemyPath[1]);
    }
    physicsWorld.Step(1/60, 8, 3);
}

function updateRenderWorld() {
    updatePlayerMesh();
    if (notSpawned == false) {
        updateEnemyMesh();
    }
    updateCamera();
    updateLight();
}