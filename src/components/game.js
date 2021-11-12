import * as THREE from '../../modules/three/three.module.js';
import * as CANNON from '../../modules/cannon-es/cannon-es.js';
import { OrbitControls } from '../../modules/three/OrbitControls.js';
import Lane from './lane.js';

class Game {
	constructor() {
		window.THREE = THREE;
		window.CANNON = CANNON;

		$('#load-container .percent').innerHTML = 'Loading files: 0%';

		this.initPhysics();

		// create threejs scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xff0000);

		// create camera
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(0, 1.1, -7.5);
		this.camera.lookAt(0, 0, 0);
		this.scene.add(this.camera);

		// create light
		this.mainLight = new THREE.DirectionalLight('white', .5);
		this.mainLight.position.set(10, 10, 10);
		this.scene.add(this.mainLight);
		this.otherLight = new THREE.AmbientLight('white', .5);
		this.scene.add(this.otherLight);

		// create renderer
		this.container = document.getElementById('container');
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.container.appendChild(this.renderer.domElement);
		this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

		// initilize loading bar
		this.setLoadingBar = (percent) => {
			$('#load-container').style.cssText = '--percent:' + percent.toString() + '%';
			$('#load-container .percent').innerHTML = 'Loading files: ' + Math.round(percent).toString() + '%';
		}

		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.onProgress = (url, loaded, total) => {
			this.setLoadingBar(loaded / total * 100);
			if (loaded / total === 1) {
				setTimeout(() => { $('#load-container').style.top = '-' + window.innerHeight.toString() + 'px'; }, 500);
			}
		};


		// create bowling lane
		this.lane = new Lane(this.loadingManager);
		this.scene.add(this.lane);

		// resizing:
		window.addEventListener('resize', this.resize.bind(this));
		this.resize();

		// start rendering loop
		this.loop = false;
		this.frame = 0;
		this.start();
	}

	resize() {
		this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
	}

	render(time) {
		// render scene
		this.renderer.render(this.scene, this.camera);

		// repeat
		if (this.loop) {
			this.frame = requestAnimationFrame(this.render.bind(this));
		}
	}

	start() {
		this.loop = true;
		this.frame = requestAnimationFrame(this.render.bind(this))
	}

	stop() {
		this.loop = false;
		cancelAnimationFrame(this.frame);
	}

	initPhysics() {
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
		});
		this.lastCallTime = performance.now();
	}

	static Constants = {
		frameRate: 1 / 60,
	}
}

export default Game;