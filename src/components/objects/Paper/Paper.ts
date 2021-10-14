import * as THREE from 'three';
import { GroupBase, IBaseState } from '../../bases';

import DIFFUSE from './textures/paper_diffuse.jpg';
import DISPLACE from './textures/paper_displace.jpg';
import NORMAL from './textures/paper_normal.jpg';
import ROUGH from './textures/paper_rough.jpg';

export class Paper extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        const geometry = new THREE.PlaneBufferGeometry(11, 8, 100, 100);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            side: THREE.DoubleSide,
            envMapIntensity: 1.0,
            displacementScale: 0.03,
            metalness: 0,
            roughness: 1,
        });
        material.normalScale.set(0.15, 0.15);

        const loader = new THREE.TextureLoader();

        material.map = loader.load(DIFFUSE);
        material.normalMap = loader.load(NORMAL);
        material.displacementMap = loader.load(DISPLACE);
        material.roughnessMap = loader.load(ROUGH);

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.repeat.set(1, 1);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.repeat.set(1, 1);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.repeat.set(1, 1);
        material.displacementMap.wrapS = THREE.RepeatWrapping;
        material.displacementMap.repeat.set(1, 1);

        const paperMesh = new THREE.Mesh(geometry, material);
        paperMesh.castShadow = true;

        this.add(paperMesh);
        this.state.disposalList.push(
            geometry,
            material,
            material.map,
            material.normalMap,
            material.displacementMap,
            material.roughnessMap
        );

        this.position.set(0.7, -0.05, 0.3);
        this.rotateY(-0.02);
    }
}
