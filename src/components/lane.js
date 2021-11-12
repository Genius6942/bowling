import * as THREE from '../../modules/three/three.module.js';
import { GLTFLoader } from '../../modules/three/GLTFLoader.js';
import * as CANNON from '../../modules/cannon-es/cannon-es.js';
import Person from './person.js';

class Lane extends THREE.Group {
	constructor(loadManager) {
		super();

		// loader setup
		this.loader = new THREE.TextureLoader(loadManager);
		this.gltfLoader = new GLTFLoader(loadManager);

		// create whole room / alley
		this.alley = new THREE.Mesh(new THREE.BoxBufferGeometry(Lane.Constants.room.length, Lane.Constants.room.height, Lane.Constants.room.length), new THREE.MeshStandardMaterial());
		this.loader.load(
			Lane.Constants.urls.wall,

			(texture) => {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				this.alley.material = new THREE.MeshStandardMaterial({
					map: texture,
					side: THREE.DoubleSide,
				});
				this.add(this.alley);
			}
		);

		// create main wood floor
		this.main = new THREE.Mesh(new THREE.BoxBufferGeometry(Lane.Constants.lane.width, Lane.Constants.lane.height, Lane.Constants.lane.length), new THREE.MeshStandardMaterial());
		this.loader.load(
			Lane.Constants.urls.lane,

			(texture) => {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				this.main.material = new THREE.MeshStandardMaterial({
					map: texture,
				});
				this.alley.add(this.main);
				
				const floor = new THREE.Mesh(new THREE.BoxBufferGeometry(Lane.Constants.floor.height, Lane.Constants.lane.height + Lane.Constants.gutter.thickness, Lane.Constants.floor.width), new THREE.MeshStandardMaterial({ map: texture }));
				floor.position.y = -Lane.Constants.lane.height / 2 - Lane.Constants.gutter.thickness / 2;
				floor.position.z = -Lane.Constants.lane.length / 2 - Lane.Constants.floor.height / 2;
				this.alley.add(floor);
			}
		);

		this.main.position.y = -Lane.Constants.lane.height / 2

		// create gutters
		let createGutterGeometry = (outerRadius, innerRadius, height, deg = 180) => {
			var R =  outerRadius;
			var r =  innerRadius;
			var cx = 0;
			var cy = 0;
			var clockwise  = false;
			var sAngle = THREE.MathUtils.degToRad(0);
			var eAngle = THREE.MathUtils.degToRad(180);

			let shape = new THREE.Shape();

			shape.absarc(cx, cy, R, sAngle, eAngle, true);
			shape.absarc(cx, cy, r, eAngle, sAngle);

			return new THREE.ExtrudeBufferGeometry(shape, {depth: height, bevelEnabled: false});
		}

		this.gutters = {
			left: new THREE.Mesh(createGutterGeometry(Lane.Constants.lane.height + Lane.Constants.gutter.thickness, Lane.Constants.lane.height, Lane.Constants.lane.length), new THREE.MeshStandardMaterial({ color: Lane.Constants.gutter.color })),
			right: new THREE.Mesh(createGutterGeometry(Lane.Constants.lane.height + Lane.Constants.gutter.thickness, Lane.Constants.lane.height, Lane.Constants.lane.length), new THREE.MeshStandardMaterial({ color: Lane.Constants.gutter.color })),
		};

		this.alley.add(this.gutters.left);
		this.alley.add(this.gutters.right);
		this.gutters.left.position.set(Lane.Constants.lane.width / 2 + Lane.Constants.lane.height + .05, 0, -Lane.Constants.lane.length / 2);
		this.gutters.right.position.set(-Lane.Constants.lane.width / 2 - Lane.Constants.lane.height - .05, 0, -Lane.Constants.lane.length / 2);

		// load pins
		this.pins = [];
		this.gltfLoader.load(
			'../../assets/pin.glb',
			(gltf) => {
				this.bowlingPinGLTF = gltf.scene;
				let boundingBox = new THREE.Box3();
				boundingBox.setFromObject(gltf.scene);
				this.bowlingPinGLTF.scale.set(Lane.Constants.pin.height / (boundingBox.max.y - boundingBox.min.y), Lane.Constants.pin.height / (boundingBox.max.y - boundingBox.min.y), Lane.Constants.pin.height / (boundingBox.max.y - boundingBox.min.y));
				this.resetBowlingPins(this.bowlingPinGLTF);
			},
			undefined,
			(error) => {
				console.error(error);
			}
		);

		this.person = new Person(this.loadManager, createGutterGeometry);
		this.alley.add(this.person);
		this.person.position.set(0, Person.Constants.heightAboveGround, -Lane.Constants.lane.length / 2 - Lane.Constants.floor.height / 2);

	}

	static Constants = {
		lane: {
			length: 10, // 18.288,
			width: 1.0668,
			height: .1,
		},
		
		room: {
			length: 30,
			width: 20,
			height: 20,
		},

		gutter: {
			color: '#0000ff',
			thickness: .05,
		},

		pin: {
			height: 0.381,
			rows: 4,
		},

		floor: {
			width: 3,
			height: 3,
		},

		urls: {
			lane: '../../assets/wood.jpg',
			wall: '../../assets/wall.jpg',
		}
	}

	resetBowlingPins(mesh) {
		const space = Lane.Constants.lane.width / Lane.Constants.pin.rows;
		let startingLeft = space / 2;
		const zIncrement = Math.sqrt(3) / 2 * space;


		for (let i = Lane.Constants.pin.rows; i > 0; i--) {
			for (let j = 0; j < i; j++) {
				const pin = mesh.clone();
				pin.position.set(startingLeft + j * space - Lane.Constants.lane.width / 2, 0, -zIncrement - (Lane.Constants.pin.rows - i) * zIncrement + Lane.Constants.lane.length / 2);
				this.alley.add(pin);
			}
			startingLeft += space / 2;
		}
	}

}

export default Lane;