import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  templateUrl: './three-scene.html',
  styleUrls: ['./three-scene.scss'],
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  private initScene(): void {
    const container = this.containerRef.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(0xeeeeee);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Cube
    const geometry = new THREE.DodecahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88,
      flatShading: true
     });
    this.cube = new THREE.Mesh(geometry, material);
    //this.cube.position.x = 0;
    this.scene.add(this.cube);


  const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
      });
    const wireframeCube = new THREE.Mesh(geometry, wireMaterial);
    // wireframeCube.position.copy(this.cube.position);
    // wireframeCube.scale.copy(this.cube.scale);
    this.cube.add(wireframeCube);


    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);


    //this.renderer.render(this.scene, this.camera);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate cube
    this.cube.rotation.x += 0.004;
    this.cube.rotation.y += 0.004;

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
