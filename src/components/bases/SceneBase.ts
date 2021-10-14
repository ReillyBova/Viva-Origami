import * as THREE from 'three';
import * as DAT from 'dat.gui';
import { GroupBase } from '.';

export interface IBaseState {
    gui: DAT.GUI;
    scene: SceneBase;
    renderer: THREE.WebGLRenderer;
    disposalList: any[];
}

interface ISceneState extends IBaseState {
    updateList: ((timeStamp: number) => void)[];
}

export class SceneBase extends THREE.Scene {
    protected state: ISceneState;

    constructor(renderer: THREE.WebGLRenderer) {
        super();

        this.state = {
            gui: new DAT.GUI(),
            scene: this,
            renderer: renderer,
            updateList: [],
            disposalList: [],
        };
    }

    public addToUpdateList(updateFunction: (timeStamp: number) => void) {
        this.state?.updateList?.push(updateFunction);
    }

    public update(timeStamp: number) {
        this.state?.updateList?.forEach((updateFunc) =>
            updateFunc?.(timeStamp)
        );
    }

    public dispose() {
        this.state?.disposalList?.forEach((item) => item?.dispose?.());
    }

    protected autoAddGroups(...args: typeof GroupBase[]) {
        const instances = args.map((group) => new group(this.state));

        this.add(...instances);
        this.state.disposalList.push(...instances);
    }
}
