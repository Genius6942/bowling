import * as THREE from '../../modules/three/three.module.js';

class Person extends THREE.Group {
	constructor(manager, curveFunction) {
		super();
		this.color = 'green';

		// create body
		this.body = new THREE.Mesh(new THREE.CylinderGeometry(Person.Constants.body.radius, Person.Constants.body.radius, Person.Constants.body.height, 32, true), new THREE.MeshStandardMaterial({ color: this.color || 'green' }));
		const sphereTop = new THREE.Mesh(new THREE.SphereGeometry(Person.Constants.body.radius, 32, 16, Math.PI/2,  Math.PI*2, 0, Math.PI), new THREE.MeshStandardMaterial({ color: this.color || 'green' }));
		this.body.add(sphereTop);
		sphereTop.position.y = Person.Constants.body.height / 2;
		const sphereBottom = sphereTop.clone();
		this.body.add(sphereBottom);
		sphereBottom.position.y = -Person.Constants.body.height / 2;
		sphereBottom.rotation.x = Math.PI;
		this.add(this.body);

		// create legs
		this.legs = {
			left: new THREE.Mesh(new THREE.CylinderGeometry(Person.Constants.leg.radius, Person.Constants.leg.radius, Person.Constants.heightAboveGround - Person.Constants.body.height / 2, 32), new THREE.MeshStandardMaterial({ color: Person.Constants.leg.color })),
			right: new THREE.Mesh(new THREE.CylinderGeometry(Person.Constants.leg.radius, Person.Constants.leg.radius, Person.Constants.heightAboveGround - Person.Constants.body.height / 2, 32), new THREE.MeshStandardMaterial({ color: Person.Constants.leg.color })),
		};

		this.add(this.legs.left);
		this.add(this.legs.right);
		this.legs.left.position.set(Person.Constants.body.radius * 2 / 3.5, -Person.Constants.body.height / 2 - (Person.Constants.heightAboveGround - Person.Constants.body.height / 2) / 2, 0);
		this.legs.right.position.set(-Person.Constants.body.radius * 2 / 3.5, -Person.Constants.body.height / 2 - (Person.Constants.heightAboveGround - Person.Constants.body.height / 2) / 2, 0);

		// amrs

		this.arms = {
			left: new THREE.Mesh(new THREE.CylinderGeometry(Person.Constants.arm.radius, Person.Constants.arm.radius, Person.Constants.arm.length, 32), new THREE.MeshStandardMaterial({ color: Person.Constants.arm.color })),
		};

		const armSphereTop = new THREE.Mesh(new THREE.SphereGeometry(Person.Constants.arm.radius, 32, 16), new THREE.MeshStandardMaterial({ color: Person.Constants.arm.color }));
		this.arms.left.add(armSphereTop);
		armSphereTop.position.y = Person.Constants.arm.length / 2;
		const armsphereBottom = armSphereTop.clone();
		this.arms.left.add(armsphereBottom);
		armsphereBottom.position.y = -Person.Constants.arm.length / 2;

		this.arms.right = this.arms.left.clone();

		this.add(this.arms.left, this.arms.right);
		this.arms.right.position.x = -Person.Constants.arm.gap - Person.Constants.body.radius;
		this.arms.left.position.x = Person.Constants.arm.gap + Person.Constants.body.radius;
		

		// head
		this.head = new THREE.Mesh(new THREE.SphereGeometry(Person.Constants.body.radius * Person.Constants.head.multiplier, 32, 16), new THREE.MeshStandardMaterial({ color: Person.Constants.head.color }));
		this.add(this.head);

		this.head.position.y = Person.Constants.body.height / 2 + Person.Constants.body.radius + Person.Constants.head.neckLength + Person.Constants.body.radius * Person.Constants.head.multiplier;
		

		// eyes
		this.eyes = {
			left: new THREE.Mesh(new THREE.SphereGeometry(Person.Constants.head.eye.multiplier * Person.Constants.head.multiplier * Person.Constants.body.radius, 32, 16), new THREE.MeshStandardMaterial({ color: Person.Constants.head.eye.color })),
			right: new THREE.Mesh(new THREE.SphereGeometry(Person.Constants.head.eye.multiplier * Person.Constants.head.multiplier * Person.Constants.body.radius, 32, 16), new THREE.MeshStandardMaterial({ color: Person.Constants.head.eye.color })),
		};

		this.head.add(this.eyes.left, this.eyes.right);

		const headRadius = Person.Constants.body.radius * Person.Constants.head.multiplier;
		this.eyes.left.position.copy(Person.Constants.head.eye.position);
		this.eyes.right.position.copy(Person.Constants.head.eye.position);
		this.eyes.left.position.multiplyScalar(headRadius);
		this.eyes.right.position.multiplyScalar(headRadius);
		this.eyes.right.position.x *= -1;
		//this.blink();

		// mouth

		this.mouth = new THREE.Mesh(curveFunction((headRadius + Person.Constants.head.mouth.thickness / 2) / 2, (headRadius - Person.Constants.head.mouth.thickness / 2) / 2, Person.Constants.head.mouth.height, Person.Constants.head.mouth.angle), new THREE.MeshStandardMaterial({ color: Person.Constants.head.mouth.color }));
		this.head.add(this.mouth);
		this.mouth.position.copy(Person.Constants.head.mouth.position);
		this.mouth.position.multiplyScalar(headRadius);
		this.mouth.rotation.x =  - THREE.MathUtils.degToRad(30);

		this.head.rotation.y = Math.PI;
	}

	async blink () {
		this.eyes.left.material.color = new THREE.Color('black');
		this.eyes.right.material.color = new THREE.Color('black');
		this.eyes.left.needsUpdate = true;
		this.eyes.right.needsUpdate = true;

		await new Promise(r=>setTimeout(r, Person.Constants.head.eye.blinkTime));

		this.eyes.left.material.color = new THREE.Color('white');
		this.eyes.right.material.color = new THREE.Color('white');
		this.eyes.left.needsUpdate = true;
		this.eyes.right.needsUpdate = true;

		setTimeout(this.blink.bind(this), Person.Constants.head.eye.blinkWait);
	}



	static Constants = {
		heightAboveGround: .8,

		body: {
			radius: 0.2132,
			height: .4,
		},

		leg: {
			radius: .05,
			//height: .7,
			color: '#dddddd',
		},

		arm: {
			radius: .05,
			length: .5,
			color: '#dddddd',
			gap: .05,
		},

		head: {
			multiplier: 1.1,
			color: 'green', // '#dddddd',
			neckLength: .1,
			eye: {
				position: new THREE.Vector3(-.3, .1, -.95),
				multiplier: .2,
				color: '#dddddd',
				blinkWait: 2000,
				blinkTime: 100,
			},

			mouth: {
				position: new THREE.Vector3(0, - .3, -.95),
				color: '#dddddd',
				angle: THREE.MathUtils.degToRad(180),
				thickness: .03,
				height: .02,
			}
		},
	}
}

export default Person;