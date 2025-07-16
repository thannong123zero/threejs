import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-three-model',
  imports: [CommonModule],
  templateUrl: './three-model.html',
  styleUrl: './three-model.scss'
})
export class ThreeModelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modelCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Three.js core objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId!: number;
  
  // Model loading
  private gltfLoader = new GLTFLoader();
  private fbxLoader = new FBXLoader();
  private objLoader = new OBJLoader();
  private loadedModel: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: THREE.AnimationClip[] = [];
  private clock = new THREE.Clock();
  
  // UI state
  public isLoading = false;
  public loadingProgress = 0;
  public error: string | null = null;
  public modelInfo: string = '';
  public availableAnimations: string[] = [];
  public currentAnimation: string | null = null;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.setupScene();
    this.animate();
    
    // Load a sample model
    this.loadSampleModel();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2c3e50);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: canvas, 
      antialias: true 
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    
    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupScene(): void {
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    this.scene.add(gridHelper);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  // Model loading methods
  public loadGLTFModel(url: string): void {
    this.clearCurrentModel();
    this.isLoading = true;
    this.error = null;
    this.loadingProgress = 0;
    
    this.gltfLoader.load(
      url,
      (gltf) => this.onModelLoaded(gltf.scene, gltf.animations, 'GLTF'),
      (progress) => this.onLoadProgress(progress),
      (error) => this.onLoadError(error)
    );
  }

  public loadFBXModel(url: string): void {
    this.clearCurrentModel();
    this.isLoading = true;
    this.error = null;
    this.loadingProgress = 0;
    
    this.fbxLoader.load(
      url,
      (fbx) => this.onModelLoaded(fbx, fbx.animations, 'FBX'),
      (progress) => this.onLoadProgress(progress),
      (error) => this.onLoadError(error)
    );
  }

  public loadOBJModel(url: string): void {
    this.clearCurrentModel();
    this.isLoading = true;
    this.error = null;
    this.loadingProgress = 0;
    
    this.objLoader.load(
      url,
      (obj) => this.onModelLoaded(obj, [], 'OBJ'),
      (progress) => this.onLoadProgress(progress),
      (error) => this.onLoadError(error)
    );
  }

  private onModelLoaded(model: THREE.Object3D, animations: THREE.AnimationClip[], format: string): void {
    this.isLoading = false;
    this.loadedModel = model;
    
    // Enable shadows for all meshes
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Center and scale the model
    this.centerAndScaleModel(model);
    
    // Add to scene
    this.scene.add(model);
    
    // Setup animations if available
    if (animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model);
      this.animations = animations;
      this.availableAnimations = animations.map((clip, index) => 
        clip.name || `Animation ${index + 1}`
      );
      
      // Play first animation
      if (animations[0]) {
        const action = this.mixer.clipAction(animations[0]);
        action.play();
        this.currentAnimation = this.availableAnimations[0];
      }
    } else {
      this.animations = [];
      this.availableAnimations = [];
      this.currentAnimation = null;
    }
    
    // Update model info
    this.updateModelInfo(model, format);
    
    // Adjust camera position
    this.adjustCameraToModel(model);
  }

  private centerAndScaleModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    model.position.sub(center);
    
    // Scale the model to fit nicely in the scene
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDimension; // Target size of 3 units
    model.scale.setScalar(scale);
  }

  private adjustCameraToModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    const distance = maxDimension * 2;
    this.camera.position.set(distance, distance * 0.8, distance);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  private updateModelInfo(model: THREE.Object3D, format: string): void {
    let meshCount = 0;
    let vertexCount = 0;
    let faceCount = 0;
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        if (child.geometry) {
          const positions = child.geometry.attributes.position;
          if (positions) {
            vertexCount += positions.count;
            if (child.geometry.index) {
              faceCount += child.geometry.index.count / 3;
            } else {
              faceCount += positions.count / 3;
            }
          }
        }
      }
    });
    
    this.modelInfo = `Format: ${format} | Meshes: ${meshCount} | Vertices: ${vertexCount} | Faces: ${Math.floor(faceCount)}`;
  }

  private onLoadProgress(progress: ProgressEvent): void {
    if (progress.lengthComputable) {
      this.loadingProgress = (progress.loaded / progress.total) * 100;
    }
  }

  private onLoadError(error: any): void {
    this.isLoading = false;
    this.error = `Failed to load model: ${error.message || error}`;
    console.error('Model loading error:', error);
  }

  private clearCurrentModel(): void {
    if (this.loadedModel) {
      this.scene.remove(this.loadedModel);
      this.loadedModel = null;
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.animations = [];
    this.availableAnimations = [];
    this.currentAnimation = null;
    this.modelInfo = '';
  }

  // Animation control
  public playAnimation(animationName: string): void {
    if (this.mixer && this.animations.length > 0) {
      this.mixer.stopAllAction();
      
      const clip = this.animations.find((clip: THREE.AnimationClip) => 
        (clip.name || '') === animationName
      );
      
      if (clip) {
        const action = this.mixer.clipAction(clip);
        action.play();
        this.currentAnimation = animationName;
      }
    }
  }

  // Sample model loading
  public loadSampleModel(): void {
    // Create a sample model procedurally since we might not have external models
    this.createSampleModel();
  }

  private createSampleModel(): void {
    const group = new THREE.Group();
    
    // Create a robot-like figure
    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2;
    head.castShadow = true;
    group.add(head);
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4ecdc4 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x45b7d1 });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 0.8, 0);
    leftArm.castShadow = true;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 0.8, 0);
    rightArm.castShadow = true;
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.3, 1.2, 0.3);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x6c5ce7 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.8, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.8, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);
    
    this.loadedModel = group;
    this.scene.add(group);
    
    this.modelInfo = 'Format: Procedural | Meshes: 5 | Sample Robot Model';
    
    // Create a simple animation
    this.createSampleAnimation(group);
  }

  private createSampleAnimation(model: THREE.Object3D): void {
    // Create a simple rotation animation
    this.mixer = new THREE.AnimationMixer(model);
    
    const rotationTrack = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      [0, 2, 4],
      [
        0, 0, 0, 1,
        0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4),
        0, 0, 0, 1
      ]
    );
    
    const clip = new THREE.AnimationClip('Rotate', 4, [rotationTrack]);
    this.animations = [clip];
    const action = this.mixer.clipAction(clip);
    action.play();
    
    this.availableAnimations = ['Rotate'];
    this.currentAnimation = 'Rotate';
  }

  // File input handling
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      switch (extension) {
        case 'gltf':
        case 'glb':
          this.loadGLTFModel(url);
          break;
        case 'fbx':
          this.loadFBXModel(url);
          break;
        case 'obj':
          this.loadOBJModel(url);
          break;
        default:
          this.error = 'Unsupported file format. Please use GLTF, FBX, or OBJ files.';
      }
    }
  }
}
