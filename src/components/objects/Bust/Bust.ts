import { GroupBase, IBaseState } from '../../bases';

import MODEL from './bust.glb';

export class Bust extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        this.importModel(MODEL, true, true);

        this.scale.set(8, 8, 8);
        this.position.set(7.23, -0.05, 5.93);
        this.rotation.set(0, -1.87, 0);

        this.freeze();
    }
}
