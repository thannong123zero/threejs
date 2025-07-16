import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-solar-system-v2',
  imports: [],
  templateUrl: './three-solar-system-v2.component.html',
  styleUrl: './three-solar-system-v2.component.scss'
})
export class ThreeSolarSystemV2Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  //private objects: THREE.Mesh[] = [];
  private objects: any[] = [];
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Clean up geometries and materials
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove event listener
    window.removeEventListener('resize', this.onWindowResize);
  }

  private initScene(): void {
    const container = this.containerRef.nativeElement;

    // Scene
    this.scene = new THREE.Scene();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Camera
    const fov = 40;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, 50, 0);
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);

    // Light
    const color = 0xFFFFFF;
    const intensity = 500;
    const light = new THREE.PointLight(color, intensity);
    this.scene.add(light);
    // Create solar system object
    const solarSystem = new THREE.Object3D();
    this.scene.add(solarSystem);
    this.objects.push(solarSystem);
    // Create Earth orbit
    const earthOrbit = new THREE.Object3D();
    earthOrbit.position.x = 10;
    solarSystem.add(earthOrbit);
    this.objects.push(earthOrbit);

    // Sun
    const radius = 1;
    const widthSegments = 6;
    const heightSegments = 6;
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xFFFF00 });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);
    solarSystem.add(sunMesh);
    this.objects.push(sunMesh);

    const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233FF, emissive: 0x112244 });
    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.add(earthMesh);
    this.objects.push(earthMesh);

    // Create Moon orbit
    const moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit);

    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(.5, .5, .5);
    moonOrbit.add(moonMesh);
    this.objects.push(moonMesh);

    // add an AxesHelper to each node
    this.objects.forEach((node) => {
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      node.add(axes);
    });

    // Handle window resize
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  private animate = (time?: number) => {
    this.animationId = requestAnimationFrame(this.animate);

    if (time) {
      time *= 0.001; // Convert to seconds
    }

    // Check if renderer needs resize
    this.resizeRendererToDisplaySize();

    // Animate objects
    this.objects.forEach((obj) => {
      if (time) {
        obj.rotation.y = time;
      } else {
        obj.rotation.y = (obj.rotation.y + 0.01) % (Math.PI * 2);
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    this.resizeRendererToDisplaySize();
  }

  private resizeRendererToDisplaySize(): boolean {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    return needResize;
  }
}
