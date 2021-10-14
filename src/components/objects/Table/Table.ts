import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GroupBase, IBaseState } from '../../bases';
import MODEL from './table.glb';

export class Table extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        this.importModel(MODEL, false, false, (group: THREE.Group) => {
            group.scale.set(40, 40, 40);
            group.translateY(-22);
        });

        // Shadow map for top of table
        const tableTopGeometry = new THREE.PlaneGeometry(22, 18);
        tableTopGeometry.rotateX(-Math.PI / 2);

        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });

        const tableTopShadows = new THREE.Mesh(
            tableTopGeometry,
            shadowMaterial
        );

        tableTopShadows.position.y = -0.06;
        tableTopShadows.receiveShadow = true;

        this.add(tableTopShadows);
        this.state.disposalList.push(tableTopGeometry, shadowMaterial);

        this.rotateY(1.28);
        this.translateZ(3);

        this.freeze();
    }
}
