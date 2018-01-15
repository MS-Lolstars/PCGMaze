var camera = undefined;
var ZOOM_LEVEL_INITIAL = 3;
var ZOOM_LEVEL = ZOOM_LEVEL_INITIAL;

function createCamera() {
    var aspect = window.innerWidth/window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    camera.position.set(1, 1, ZOOM_LEVEL);
}

function updateCamera() {
    camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1;
    camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1;
    camera.position.z += (ZOOM_LEVEL - camera.position.z) * 0.1;
}

function initializeCamera() {
    camera.position.set(1, 1, ZOOM_LEVEL_INITIAL);
}