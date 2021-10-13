import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './lychee.glb';

export class Lychee extends THREE.Group {
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

        this.scale.set(45, 45, 45);
        this.position.set(8.5, -0.05, -2.95);
        this.rotation.set(-6.64, 0, -0.14);

        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
