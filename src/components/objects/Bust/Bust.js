import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './bust.glb';

export class Bust extends THREE.Group {
    constructor() {
        super();

        // Load object
        const loader = new GLTFLoader();

        loader.load(MODEL, (gltf) => {
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    child.receiveShadow = true;
                    child.castShadow = true;
                }
            });

            this.add(gltf.scene);
        });

        this.scale.set(8, 8, 8);
        this.position.set(7.23, -0.05, 5.93);
        this.rotation.set(0, -1.87, 0);

        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
