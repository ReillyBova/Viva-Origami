import * as THREE from 'three';
import { Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { IBaseState } from './SceneBase';

export class GroupBase extends THREE.Group {
    protected state: IBaseState;
    private parentState: IBaseState;

    constructor(parentState: IBaseState) {
        super();

        this.state = {
            gui: parentState.gui,
            scene: parentState.scene,
            renderer: parentState.renderer,
            disposalList: [],
        };

        parentState.disposalList.push(this);
    }

    public dispose() {
        this.state?.disposalList?.forEach((item) => item?.dispose?.());
        this.removeFromParent();
    }

    protected importModel(
        url: string,
        receiveShadow: boolean,
        castShadow: boolean,
        callback?: (group: THREE.Group) => void
    ) {
        const loader = new GLTFLoader();

        loader.load(url, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.type === 'Mesh') {
                    const childMesh = child as THREE.Mesh;
                    childMesh.receiveShadow = receiveShadow;
                    childMesh.castShadow = castShadow;

                    this.state.disposalList.push(
                        childMesh.geometry,
                        childMesh.material
                    );

                    if (
                        (childMesh.material as THREE.Material).type ===
                        'MeshStandardMaterial'
                    ) {
                        const childMaterial =
                            childMesh.material as THREE.MeshStandardMaterial;
                        const textures = [
                            childMaterial.alphaMap,
                            childMaterial.aoMap,
                            childMaterial.bumpMap,
                            childMaterial.displacementMap,
                            childMaterial.emissiveMap,
                            childMaterial.envMap,
                            childMaterial.lightMap,
                            childMaterial.map,
                            childMaterial.metalnessMap,
                            childMaterial.normalMap,
                            childMaterial.roughnessMap,
                        ].filter((item) => !!item);

                        this.state.disposalList.push(...textures);
                    }
                }
            });

            callback?.(gltf.scene);
            this.add(gltf.scene);
        });
    }

    protected enableControls() {
        const controlState = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };

        this.state.scene.addToUpdateList(() => {
            const { x, y, z, rx, ry, rz } = controlState;
            this.position.set(x, y, z);
            this.rotation.set(rx, ry, rz);
        });

        this.state.gui.add(controlState, 'x', -25, 25, 0.01);
        this.state.gui.add(controlState, 'y', -25, 25, 0.01);
        this.state.gui.add(controlState, 'z', -25, 25, 0.01);
        this.state.gui.add(controlState, 'rx', -3.14, 3.14, 0.01);
        this.state.gui.add(controlState, 'ry', -3.14, 3.14, 0.01);
        this.state.gui.add(controlState, 'rz', -3.14, 3.14, 0.01);
    }

    protected autoAddGroups(...args: typeof GroupBase[]) {
        const instances = args.map((group) => new group(this.state));

        this.add(...instances);
        this.state.disposalList.push(...instances);
    }

    protected freeze() {
        this.updateMatrix();
        this.matrixAutoUpdate = false;
    }
}
