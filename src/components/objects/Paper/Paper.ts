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
        const geometry = new THREE.PlaneBufferGeometry(11, 8, 100, 100);
        geometry.rotateX(-Math.PI / 2);
        geometry.center();

        const positionAttribute = geometry.attributes
            .position as THREE.BufferAttribute;
        positionAttribute.setUsage(THREE.DynamicDrawUsage);

        const coordinateAttribute = positionAttribute.clone();
        geometry.setAttribute('coordinate', coordinateAttribute);

        // Set up paper material
        const material = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            side: THREE.DoubleSide,
            envMapIntensity: 1.0,
            displacementScale: 0.02,
            displacementBias: -0.015,
            metalness: 0,
            roughness: 1,
        });
        material.normalScale.set(0.15, 0.15);

        const loader = new THREE.TextureLoader();

        material.map = loader.load(DIFFUSE);
        material.normalMap = loader.load(NORMAL);
        material.displacementMap = loader.load(DISPLACE);
        material.roughnessMap = loader.load(ROUGH);

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.repeat.set(1, 1);
        material.normalMap.wrapS = THREE.RepeatWrapping;
        material.normalMap.repeat.set(1, 1);
        material.roughnessMap.wrapS = THREE.RepeatWrapping;
        material.roughnessMap.repeat.set(1, 1);
        material.displacementMap.wrapS = THREE.RepeatWrapping;
        material.displacementMap.repeat.set(1, 1);

        const paperMesh = new THREE.Mesh(geometry, material);
        paperMesh.castShadow = true;

        // Set up outlines
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
        const outlineMesh = new THREE.LineSegments(edgesGeometry, lineMaterial);

        const linesPositionAttribute = edgesGeometry.attributes
            .position as THREE.BufferAttribute;
        linesPositionAttribute.setUsage(THREE.DynamicDrawUsage);

        const linesCoordinateAttribute = linesPositionAttribute.clone();
        edgesGeometry.setAttribute('coordinate', linesCoordinateAttribute);

        // Add meshes
        this.add(paperMesh, outlineMesh);
        this.state.disposalList.push(
            geometry,
            edgesGeometry,
            material,
            material.map,
            material.normalMap,
            material.displacementMap,
            material.roughnessMap,
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

        const L = 5.5;
        const midCrease = L / 2;
        const touchdownPoint = L / 8;
        const minFoldedHeight = 0.05;
        const minRadius = 0.05;
        const target = Math.cos(timeStamp / 2000) * 5.5;

        if (target > L) {
            for (let i = 0; i < positionArray.length; i += 3) {
                const x = coordinateArray[i];
                const y = coordinateArray[i + 1];

                if (x > 0) {
                    positionArray[i] = x;
                    positionArray[i + 1] = y;
                }
            }
        } else if (target > midCrease) {
            const t = (target - midCrease) / midCrease;
            const r = (L / (2 * Math.PI)) * Math.pow(4, t);

            for (let i = 0; i < positionArray.length; i += 3) {
                const x = coordinateArray[i];
                const y = coordinateArray[i + 1];

                if (x > target) {
                    const theta = (x - target) / r;
                    positionArray[i] = target + Math.sin(theta) * r;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (x > 0) {
                    positionArray[i] = x;
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
                const x = coordinateArray[i];
                const y = coordinateArray[i + 1];

                if (x > L - foldLength) {
                    const maxTheta = (1 - t) * Math.PI;
                    const foldT = Math.min(
                        1 - (L - x) / (foldLength + 0.00001),
                        1
                    );
                    const theta = foldT * maxTheta;

                    if (theta < Math.PI / 2) {
                        positionArray[i] = flatBottom - Math.sin(theta) * r;
                        positionArray[i + 1] = y + r + Math.cos(theta) * r;
                    } else {
                        positionArray[i] =
                            flatBottom - 2 * r + Math.sin(theta) * r;
                        positionArray[i + 1] = Math.max(
                            y + r + Math.cos(theta) * r,
                            minFoldedHeight
                        );
                    }
                } else if (x > flatBottom) {
                    const theta = (Math.PI * (x - flatBottom)) / arcLength;
                    positionArray[i] = flatBottom + Math.sin(theta) * r;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (x > 0) {
                    positionArray[i] = x;
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
                const x = coordinateArray[i];
                const y = coordinateArray[i + 1];

                if (x > flatTopStart) {
                    positionArray[i] = adjustedTarget + (L - x);
                    positionArray[i + 1] = y + minFoldedHeight;
                } else if (x > flatBottom + arcLength) {
                    const foldT = 1 - (flatTopStart - x) / arcLength;
                    const theta = foldT * Math.PI;

                    if (theta < Math.PI / 2) {
                        positionArray[i] = flatBottom - Math.sin(theta) * r;
                        positionArray[i + 1] = y + r + Math.cos(theta) * r;
                    } else {
                        positionArray[i] =
                            flatBottom - 2 * r + Math.sin(theta) * r;
                        positionArray[i + 1] = Math.max(
                            y + r + Math.cos(theta) * r,
                            minFoldedHeight
                        );
                    }
                } else if (x > flatBottom) {
                    const theta = (Math.PI * (x - flatBottom)) / arcLength;
                    positionArray[i] = flatBottom + Math.sin(theta) * r;
                    positionArray[i + 1] = y + r - Math.cos(theta) * r;
                } else if (x > 0) {
                    positionArray[i] = x;
                    positionArray[i + 1] = y;
                }
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
    }
}
