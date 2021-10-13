import * as Dat from 'dat.gui';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { Plant, Lychee, Bust, Table, TorusKnot } from 'objects';
import { BasicLights } from 'lights';

import ENV_TEXTURE from './studio.exr';

export class BaseScene extends THREE.Scene {
    constructor(renderer) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            updateList: [],
        };

        this.initBackground(renderer);

        // Add meshes to scene
        const lights = new BasicLights();
        const table = new Table();
        const plant = new Plant();
        const lychee = new Lychee();
        const bust = new Bust();
        const torus = new TorusKnot();
        this.add(table, plant, lychee, bust, torus, lights);
    }

    initBackground(renderer) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const scene = this;

        new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load(ENV_TEXTURE, function (texture) {
                const exrCubeRenderTarget =
                    pmremGenerator.fromEquirectangular(texture);
                const exrBackground = exrCubeRenderTarget.texture;

                scene.environment = exrBackground;

                texture.wrapS = THREE.RepeatWrapping;
                texture.repeat.x = -1;

                let geometry = new THREE.SphereBufferGeometry(100, 100, 100);
                let material = new THREE.MeshBasicMaterial({
                    side: THREE.BackSide,
                    map: texture,
                });

                const torusMesh = new THREE.Mesh(geometry, material);
                scene.add(torusMesh);

                texture.dispose();
                pmremGenerator.dispose();
            });
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}
