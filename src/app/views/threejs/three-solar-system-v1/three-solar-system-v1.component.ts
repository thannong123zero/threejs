import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-solar-system-v1',
  imports: [],
  templateUrl: './three-solar-system-v1.component.html',
  styleUrl: './three-solar-system-v1.component.scss'
})
export class ThreeSolarSystemV1Component implements AfterViewInit, OnDestroy  {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sun!: THREE.Mesh;
  private glowMeshes: THREE.Mesh[] = [];
  private corona!: THREE.Mesh;
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.createSun();
    //this.animate();
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
    //this.scene.background = new THREE.Color(0xeeeeee);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 15;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);   
  }

  private createSun(): void {
   const sunGeometry = new THREE.SphereGeometry(2, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });

    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.castShadow = false;
    this.scene.add(this.sun);

    // Add multiple sun glow layers for better effect
    const glowLayers = [
      { radius: 2.1, color: 0xffaa00, opacity: 0.3 },
      { radius: 2.3, color: 0xff6600, opacity: 0.2 },
      { radius: 2.6, color: 0xff3300, opacity: 0.1 }
    ];

    glowLayers.forEach(layer => {
      const glowGeometry = new THREE.SphereGeometry(layer.radius, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      this.glowMeshes.push(glow);
      this.scene.add(glow);
    });

    // Add corona effect
    const coronaGeometry = new THREE.SphereGeometry(3, 32, 32);
    const coronaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    this.corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    this.scene.add(this.corona);

    this.renderer.render(this.scene, this.camera);

    // Handle window resize
    // this.onWindowResize = this.onWindowResize.bind(this);
    // window.addEventListener('resize', this.onWindowResize);
  }
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate sun
    this.sun.rotation.x += 0.004;
    this.sun.rotation.y += 0.004;

    // Animate glow layers with different speeds
    this.glowMeshes.forEach((glow, index) => {
      glow.rotation.x += 0.002 * (index + 1);
      glow.rotation.y += 0.003 * (index + 1);
    });

    // Animate corona
    if (this.corona) {
      this.corona.rotation.x += 0.001;
      this.corona.rotation.y += 0.002;
    }

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
