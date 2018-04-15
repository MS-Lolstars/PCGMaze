var groundMesh = undefined;
var groundTexture =  getAtmosphere(localStorage.getItem("atmosphere"),localStorage.getItem("sound"), "ground_texture");

function createGround() {
    g = new THREE.PlaneGeometry(mazeDimension*10, mazeDimension*10, mazeDimension, mazeDimension);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(mazeDimension*5, mazeDimension*5);
    m = new THREE.MeshPhongMaterial({map:groundTexture});
    groundMesh = new THREE.Mesh(g, m);
    groundMesh.position.set((mazeDimension-1)/2, (mazeDimension-1)/2, 0);
    groundMesh.rotation.set(Math.PI/2, 0, 0);
}