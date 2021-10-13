import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './table.glb';

export class Table extends THREE.Group {
    constructor() {
        super();

        const loader = new GLTFLoader();

        loader.load(MODEL, (gltf) => {
            gltf.scene.scale.set(40, 40, 40);
            gltf.scene.translateY(-22);
            this.add(gltf.scene);
        });

        // Shadow map for top of table
        const tableTopGeometry = new THREE.PlaneGeometry(22, 18);
        tableTopGeometry.rotateX(-Math.PI / 2);

        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.08 });

        const tableTopShadows = new THREE.Mesh(
            tableTopGeometry,
            shadowMaterial
        );

        tableTopShadows.position.y = -0.05;
        tableTopShadows.receiveShadow = true;

        this.add(tableTopShadows);

        this.rotateY(1.28);
        this.translateZ(3);

        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
