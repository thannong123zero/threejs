import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-three-model-v1',
  templateUrl: './three-model-v1.html',
  styleUrls: ['./three-model-v1.scss'],
})
export class ThreeModelV1Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  // private cube!: THREE.Mesh;
  // private torus!: THREE.Mesh;
  // private sphere!: THREE.Mesh;
  private animationId!: number;
  private model: THREE.Object3D | null = null;
  public isAnimating = true;
  private mouseX = 0;
  private mouseY = 0;
  private windowHalfX = 0;
  private windowHalfY = 0;

  ngOnInit() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
  }

  ngAfterViewInit() {
    this.initThree();
    this.loadModel();
    this.animate();
    this.addEventListeners();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.removeEventListeners();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      800 / 600,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(800, 600);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      'assets/3DModels/sayuri_dans.glb', // Replace with your actual path
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
        // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    //this.addParticles();
  }
  // private createScene() {
  //   // Lighting
  //   const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  //   this.scene.add(ambientLight);

  //   const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  //   directionalLight.position.set(10, 10, 5);
  //   directionalLight.castShadow = true;
  //   directionalLight.shadow.mapSize.width = 2048;
  //   directionalLight.shadow.mapSize.height = 2048;
  //   this.scene.add(directionalLight);

  //   // Cube
  //   const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  //   const cubeMaterial = new THREE.MeshLambertMaterial({ 
  //     color: 0x00ff88,
  //     transparent: true,
  //     opacity: 0.8
  //   });
  //   this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  //   this.cube.position.x = -2;
  //   this.cube.castShadow = true;
  //   this.scene.add(this.cube);

  //   // Torus
  //   const torusGeometry = new THREE.TorusGeometry(0.7, 0.2, 16, 100);
  //   const torusMaterial = new THREE.MeshLambertMaterial({ 
  //     color: 0xff6b6b,
  //     wireframe: false
  //   });
  //   this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
  //   this.torus.position.x = 0;
  //   this.torus.castShadow = true;
  //   this.scene.add(this.torus);

  //   // Sphere
  //   const sphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
  //   const sphereMaterial = new THREE.MeshLambertMaterial({ 
  //     color: 0x4ecdc4,
  //     transparent: true,
  //     opacity: 0.9
  //   });
  //   this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  //   this.sphere.position.x = 2;
  //   this.sphere.castShadow = true;
  //   this.scene.add(this.sphere);

  //   // Ground plane
  //   const planeGeometry = new THREE.PlaneGeometry(20, 20);
  //   const planeMaterial = new THREE.MeshLambertMaterial({ 
  //     color: 0x333333,
  //     transparent: true,
  //     opacity: 0.5
  //   });
  //   const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  //   plane.rotation.x = -Math.PI / 2;
  //   plane.position.y = -2;
  //   plane.receiveShadow = true;
  //   this.scene.add(plane);

  //   // Particles
  //   this.addParticles();
  // }

  private addParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particlesMesh);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.isAnimating) {
      // Rotate objects
      // this.cube.rotation.x += 0.01;
      // this.cube.rotation.y += 0.01;

      // this.torus.rotation.x += 0.005;
      // this.torus.rotation.y += 0.02;

      // this.sphere.rotation.x += 0.008;
      // this.sphere.rotation.z += 0.01;

      // Camera movement based on mouse
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
      this.camera.lookAt(this.scene.position);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private addEventListeners() {
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  }

  private removeEventListeners() {
    document.removeEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
  }

  private onDocumentMouseMove(event: MouseEvent) {
    this.mouseX = (event.clientX - this.windowHalfX) / 100;
    this.mouseY = (event.clientY - this.windowHalfY) / 100;
  }

  public toggleAnimation() {
    this.isAnimating = !this.isAnimating;
  }

  public changeColor() {
    const colors = [0x00ff88, 0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xa8e6cf];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // (this.cube.material as THREE.MeshLambertMaterial).color.setHex(randomColor);
    // (this.torus.material as THREE.MeshLambertMaterial).color.setHex(colors[Math.floor(Math.random() * colors.length)]);
    // (this.sphere.material as THREE.MeshLambertMaterial).color.setHex(colors[Math.floor(Math.random() * colors.length)]);
  }

  public resetCamera() {
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    this.mouseX = 0;
    this.mouseY = 0;
  }
}
