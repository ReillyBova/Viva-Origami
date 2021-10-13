import * as THREE from 'three';
import METAL from './textures/plastic_metal.png';
import DIFFUSE from './textures/plastic_diffuse.png';
import AO from './textures/plastic_ao.png';
import NORMAL from './textures/plastic_normal.png';
import ROUGH from './textures/plastic_rough.png';

export class TorusKnot extends THREE.Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const geometry = new THREE.TorusKnotGeometry(1.7, 0.6, 150, 20);
        const material = new THREE.MeshStandardMaterial({
            color: 0x862a16,
            metalness: 1,
            roughness: 1,
            envMapIntensity: 1,
        });

        const loader = new THREE.TextureLoader();

        material.map = loader.load(DIFFUSE);
        material.normalMap = loader.load(NORMAL);
        material.metalnessMap = loader.load(METAL);
        material.roughnessMap = loader.load(ROUGH);
        material.aoMap = loader.load(AO);

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.repeat.set(6, 1);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.repeat.set(6, 1);
        material.metalnessMap.wrapS = THREE.RepeatWrapping;
        material.metalnessMap.repeat.set(6, 1);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.repeat.set(6, 1);
        material.aoMap.wrapS = THREE.RepeatWrapping;
        material.aoMap.repeat.set(6, 1);

        const torusMesh = new THREE.Mesh(geometry, material);
        torusMesh.castShadow = true;
        torusMesh.receiveShadow = true;

        this.add(torusMesh);

        this.position.set(6, 1.4, 9.6);
        this.rotation.set(-4.75, 0, 0);

        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
