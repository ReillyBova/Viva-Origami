import * as THREE from 'three';
import { SceneBase } from '../bases';
import { RusticStudio } from '../environments/RusticStudio';
import { Paper } from '../objects/Paper';

export class FoldingScene extends SceneBase {
    constructor(renderer: THREE.WebGLRenderer) {
        super(renderer);

        this.autoAddGroups(RusticStudio);
    }
}
