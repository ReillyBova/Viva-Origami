import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GroupBase, IBaseState } from '../bases';
import { OverheadLight } from '../lights';
import { Bust, Lychee, Plant, Table, TorusKnot } from '../objects';
import { Paper } from '../objects/Paper';

import ENV_TEXTURE from './studio.exr';

export class RusticStudio extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        this.initializeBackground();

        this.autoAddGroups(
            OverheadLight,
            Table,
            Plant,
            Lychee,
            Bust,
            TorusKnot,
            Paper
        );
    }

    private initializeBackground() {
        const pmremGenerator = new THREE.PMREMGenerator(this.state.renderer);
        pmremGenerator.compileEquirectangularShader();

        new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load(ENV_TEXTURE, (rawTexture) => {
                const exrCubeRenderTarget =
                    pmremGenerator.fromEquirectangular(rawTexture);
                const exrBackground = exrCubeRenderTarget.texture;

                this.state.scene.environment = exrBackground;

                rawTexture.wrapS = THREE.RepeatWrapping;
                rawTexture.repeat.x = -1;

                let geometry = new THREE.SphereBufferGeometry(100, 100, 100);
                let material = new THREE.MeshBasicMaterial({
                    side: THREE.BackSide,
                    map: rawTexture,
                });

                const envBackground = new THREE.Mesh(geometry, material);
                this.add(envBackground);

                this.state.disposalList.push(
                    exrCubeRenderTarget,
                    geometry,
                    material
                );

                rawTexture.dispose();
                exrCubeRenderTarget.texture.dispose();
                pmremGenerator.dispose();
            });
    }
}
