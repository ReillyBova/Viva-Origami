import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './plant.glb';

export class Plant extends THREE.Group {
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

        this.scale.set(18, 18, 18);
        this.position.set(10, -0.25, -5);

        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
