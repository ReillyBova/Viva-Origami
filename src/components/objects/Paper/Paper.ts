import * as THREE from 'three';
import { GroupBase, IBaseState } from '../../bases';

import DIFFUSE from './textures/paper_diffuse.jpg';
import DISPLACE from './textures/paper_displace.jpg';
import NORMAL from './textures/paper_normal.jpg';
import ROUGH from './textures/paper_rough.jpg';

export class Paper extends GroupBase {
    constructor(parentState: IBaseState) {
        super(parentState);

        // Set up paper geometry
        const geometry = new THREE.PlaneBufferGeometry(11, 8, 220, 160);
        geometry.rotateX(-Math.PI / 2);
        geometry.center();

        const positionAttribute = geometry.attributes
            .position as THREE.BufferAttribute;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        const coordinateAttribute = positionAttribute.clone();
        geometry.setAttribute('coordinate', coordinateAttribute);

        // Set up paper material
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            side: THREE.FrontSide,
            envMapIntensity: 1,
            displacementScale: 0.02,
            displacementBias: -0.015,
            metalness: 0,
            roughness: 1,
        });
        topMaterial.normalScale.set(0.15, 0.15);

        const loader = new THREE.TextureLoader();

        topMaterial.map = loader.load(DIFFUSE);
        topMaterial.normalMap = loader.load(NORMAL);
        topMaterial.displacementMap = loader.load(DISPLACE);
        topMaterial.roughnessMap = loader.load(ROUGH);

        topMaterial.map.wrapS = THREE.RepeatWrapping;
        topMaterial.map.repeat.set(1, 1);
        topMaterial.normalMap.wrapS = THREE.RepeatWrapping;
        topMaterial.normalMap.repeat.set(1, 1);
        topMaterial.roughnessMap.wrapS = THREE.RepeatWrapping;
        topMaterial.roughnessMap.repeat.set(1, 1);
        topMaterial.displacementMap.wrapS = THREE.RepeatWrapping;
        topMaterial.displacementMap.repeat.set(1, 1);

        // Duplicate material for different top / bottom
        const bottomMaterial = topMaterial.clone();
        bottomMaterial.side = THREE.BackSide;
        bottomMaterial.color = new THREE.Color(0x3b186f);
        bottomMaterial.roughness = 0.8;

        const paperTopMesh = new THREE.Mesh(geometry, topMaterial);
        const paperBottomMesh = new THREE.Mesh(geometry, bottomMaterial);
        paperTopMesh.castShadow = true;
        paperBottomMesh.castShadow = true;

        // Set up outlines
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
        const outlineMesh = new THREE.LineSegments(edgesGeometry, lineMaterial);

        const linesPositionAttribute = edgesGeometry.attributes
            .position as THREE.BufferAttribute;
        linesPositionAttribute.setUsage(THREE.DynamicDrawUsage);

        const linesCoordinateAttribute = linesPositionAttribute.clone();
        edgesGeometry.setAttribute('coordinate', linesCoordinateAttribute);

        // Add meshes
        this.add(paperTopMesh, paperBottomMesh, outlineMesh);
        this.state.disposalList.push(
            geometry,
            edgesGeometry,
            topMaterial,
            topMaterial.map,
            topMaterial.normalMap,
            topMaterial.displacementMap,
            topMaterial.roughnessMap,
            bottomMaterial,
            lineMaterial
        );

        this.position.set(0.7, -0.05, 0.3);
        this.rotateY(-0.02);

        this.state.scene.addToUpdateList((timeStamp) => {
            this.updateGeometry(timeStamp, geometry);
            this.updateGeometry(timeStamp, edgesGeometry);
        });
    }

    private updateGeometry(timeStamp: number, geometry: THREE.BufferGeometry) {
        const positionArray = geometry.attributes.position
            .array as Float32Array;
        const coordinateArray = geometry.attributes.coordinate.array;

        const L = 6.8;
        const midCrease = L / 2;
        const touchdownPoint = L / 8;
        const minFoldedHeight = 0.03;
        const minRadius = 0.03;
        const target = Math.cos(timeStamp / 2000) * 6.8;

        const angle = (Math.cos(timeStamp / 3000) * Math.PI) / 2;

        if (target > L) {
            for (let i = 0; i < positionArray.length; i += 3) {
                positionArray[i] = coordinateArray[i];
                positionArray[i + 2] = coordinateArray[i + 2];
                positionArray[i + 1] = coordinateArray[i + 1];
            }
        } else if (target > midCrease) {
            const t = (target - midCrease) / midCrease;
            const r = (L / (2 * Math.PI)) * Math.pow(4, t);

            for (let i = 0; i < positionArray.length; i += 3) {
                const [u, v] = this.toUV(
                    angle,
                    coordinateArray[i],
                    coordinateArray[i + 2]
                );
                const y = coordinateArray[i + 1];

                if (u > target) {
                    const theta = (u - target) / r;

                    const [x, z] = this.fromUV(
                        angle,
                        target + Math.sin(theta) * r,
                        v
                    );
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (u > 0) {
                    const [x, z] = this.fromUV(angle, u, v);
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y;
                } else {
                    positionArray[i] = coordinateArray[i];
                    positionArray[i + 2] = coordinateArray[i + 2];
                    positionArray[i + 1] = y;
                }
            }
        } else if (target > touchdownPoint) {
            const t = (target - touchdownPoint) / (midCrease - touchdownPoint);
            const tPrime = t ** 2;
            const r =
                (tPrime * L) / (2 * Math.PI) +
                ((1 - tPrime) * (L - touchdownPoint)) / (2 + 2 * Math.PI);

            const arcLength = Math.PI * r;
            const foldLength = (1 - t) * arcLength;
            const flatBottom = L - arcLength - foldLength;

            for (let i = 0; i < positionArray.length; i += 3) {
                const [u, v] = this.toUV(
                    angle,
                    coordinateArray[i],
                    coordinateArray[i + 2]
                );
                const y = coordinateArray[i + 1];

                if (u > L - foldLength) {
                    const maxTheta = (1 - t) * Math.PI;
                    const foldT = Math.min(
                        1 - (L - u) / (foldLength + 0.00001),
                        1
                    );
                    const theta = foldT * maxTheta;

                    if (theta < Math.PI / 2) {
                        const [x, z] = this.fromUV(
                            angle,
                            flatBottom - Math.sin(theta) * r,
                            v
                        );
                        positionArray[i] = x;
                        positionArray[i + 2] = z;
                        positionArray[i + 1] = y + r + Math.cos(theta) * r;
                    } else {
                        const [x, z] = this.fromUV(
                            angle,
                            flatBottom - 2 * r + Math.sin(theta) * r,
                            v
                        );
                        positionArray[i] = x;
                        positionArray[i + 2] = z;
                        positionArray[i + 1] = Math.max(
                            y + r + Math.cos(theta) * r,
                            minFoldedHeight + y
                        );
                    }
                } else if (u > flatBottom) {
                    const theta = (Math.PI * (u - flatBottom)) / arcLength;

                    const [x, z] = this.fromUV(
                        angle,
                        flatBottom + Math.sin(theta) * r,
                        v
                    );
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (u > 0) {
                    const [x, z] = this.fromUV(angle, u, v);
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y;
                } else {
                    positionArray[i] = coordinateArray[i];
                    positionArray[i + 2] = coordinateArray[i + 2];
                    positionArray[i + 1] = y;
                }
            }
        } else if (target < touchdownPoint) {
            const adjustedTarget = Math.max(target, -L);
            const t =
                1 - (adjustedTarget - touchdownPoint) / (-L - touchdownPoint);
            const r =
                (t * (L - touchdownPoint)) / (2 + 2 * Math.PI) +
                (1 - t) * minRadius;

            const arcLength = Math.PI * r;
            const flatBottom = Math.max(
                (L + 2 * r + adjustedTarget) / 2 - arcLength,
                0
            );
            const flatTopStart = flatBottom + 2 * arcLength;

            for (let i = 0; i < positionArray.length; i += 3) {
                const [u, v] = this.toUV(
                    angle,
                    coordinateArray[i],
                    coordinateArray[i + 2]
                );
                const y = coordinateArray[i + 1];

                if (u > flatTopStart) {
                    const [x, z] = this.fromUV(
                        angle,
                        adjustedTarget + (L - u),
                        v
                    );
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y + minFoldedHeight;
                } else if (u > flatBottom + arcLength) {
                    const foldT = 1 - (flatTopStart - u) / arcLength;
                    const theta = foldT * Math.PI;

                    if (theta < Math.PI / 2) {
                        const [x, z] = this.fromUV(
                            angle,
                            flatBottom - Math.sin(theta) * r,
                            v
                        );
                        positionArray[i] = x;
                        positionArray[i + 2] = z;
                        positionArray[i + 1] = y + r + Math.cos(theta) * r;
                    } else {
                        const [x, z] = this.fromUV(
                            angle,
                            flatBottom - 2 * r + Math.sin(theta) * r,
                            v
                        );
                        positionArray[i] = x;
                        positionArray[i + 2] = z;
                        positionArray[i + 1] = Math.max(
                            y + r + Math.cos(theta) * r,
                            minFoldedHeight + y
                        );
                    }
                } else if (u > flatBottom) {
                    const theta = (Math.PI * (u - flatBottom)) / arcLength;

                    const [x, z] = this.fromUV(
                        angle,
                        flatBottom + Math.sin(theta) * r,
                        v
                    );
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (u > 0) {
                    const [x, z] = this.fromUV(angle, u, v);
                    positionArray[i] = x;
                    positionArray[i + 2] = z;
                    positionArray[i + 1] = y;
                } else {
                    positionArray[i] = coordinateArray[i];
                    positionArray[i + 2] = coordinateArray[i + 2];
                    positionArray[i + 1] = y;
                }
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
    }

    private toUV(angle: number, x: number, z: number): [number, number] {
        return [
            x * Math.cos(angle) - z * Math.sin(angle),
            x * Math.sin(angle) + z * Math.cos(angle),
        ];
    }

    private fromUV(angle: number, u: number, v: number) {
        return [
            u * Math.cos(-angle) - v * Math.sin(-angle),
            u * Math.sin(-angle) + v * Math.cos(-angle),
        ];
    }
}
