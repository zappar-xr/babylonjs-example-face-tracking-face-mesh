/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import * as BABYLON from 'babylonjs';
import * as ZapparBabylon from '@zappar/zappar-babylonjs';

const faceMeshTexture = new URL('../assets/faceMeshTemplate.png', import.meta.url).href;

import 'babylonjs-loaders';
import './index.css';

// The SDK is supported on many different browsers, but there are some that
// don't provide camera access. This function detects if the browser is supported
// For more information on support, check out the readme over at
// https://www.npmjs.com/package/@zappar/zappar-babylonjs
if (ZapparBabylon.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparBabylon.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error('Unsupported browser');
}

// Setup BabylonJS in the usual way
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const engine = new BABYLON.Engine(canvas, true);

export const scene = new BABYLON.Scene(engine);
// eslint-disable-next-line no-unused-vars
const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

// Setup a Zappar camera instead of one of Babylon's cameras
export const camera = new ZapparBabylon.Camera('ZapparCamera', scene);

// Request the necessary permission from the user
ZapparBabylon.permissionRequestUI().then((granted) => {
  if (granted) camera.start(true);
  else ZapparBabylon.permissionDeniedUI();
});

const faceTracker = new ZapparBabylon.FaceTrackerLoader().load();
const trackerTransformNode = new ZapparBabylon.FaceTrackerTransformNode('tracker', camera, faceTracker, scene);

trackerTransformNode.setEnabled(false);
faceTracker.onVisible.bind(() => {
  trackerTransformNode.setEnabled(true);
});
faceTracker.onNotVisible.bind(() => {
  trackerTransformNode.setEnabled(false);
});

const material = new BABYLON.StandardMaterial('mat', scene);
material.diffuseTexture = new BABYLON.Texture(faceMeshTexture, scene);

const faceMesh = new ZapparBabylon.FaceMeshGeometry('mesh', scene);
faceMesh.parent = trackerTransformNode;
faceMesh.material = material;

window.addEventListener('resize', () => {
  engine.resize();
});

// Set up our render loop
engine.runRenderLoop(() => {
  faceMesh.updateFromFaceTracker(faceTracker);
  camera.updateFrame();
  scene.render();
});
