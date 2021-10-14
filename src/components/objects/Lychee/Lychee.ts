import { GroupBase, IBaseState } from '../../bases';
import MODEL from './lychee.glb';

export class Lychee extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        this.importModel(MODEL, true, true);

        this.scale.set(45, 45, 45);
        this.position.set(8.5, -0.05, -2.95);
        this.rotation.set(-6.64, 0, -0.14);

        this.freeze();
    }
}
