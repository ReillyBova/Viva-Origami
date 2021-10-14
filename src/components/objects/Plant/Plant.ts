import { GroupBase, IBaseState } from '../../bases';
import MODEL from './plant.glb';

export class Plant extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        this.importModel(MODEL, true, true);

        this.scale.set(18, 18, 18);
        this.position.set(10, -0.25, -5);

        this.freeze();
    }
}
