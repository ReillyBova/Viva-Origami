import * as THREE from 'three';

class BasicLights extends THREE.Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 0);

        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1600;
        directionalLight.shadow.mapSize.height = 1600;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.updateProjectionMatrix();

        this.add(directionalLight);
    }
}

export default BasicLights;
