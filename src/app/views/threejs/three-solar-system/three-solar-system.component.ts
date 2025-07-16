import { Component, ElementRef, ViewChild, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface CelestialBody {
  name: string;
  radius: number;
  distance: number;
  period: number;
  color: number;
  texture?: string;
  mesh?: THREE.Mesh;
  orbit?: THREE.Line;
  angle: number;
  speed: number;
  parent?: CelestialBody;
  satellites?: CelestialBody[];
  group?: THREE.Group;
}

@Component({
  selector: 'app-three-solar-system',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './three-solar-system.component.html',
  styleUrl: './three-solar-system.component.scss'
})
export class ThreeSolarSystemComponent implements OnInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private frameId: number = 0;
  private controls: any;

  // Solar system properties
  private sun!: THREE.Mesh;
  private earth!: CelestialBody;
  private moon!: CelestialBody;
  private celestialBodies: CelestialBody[] = [];
  private starField!: THREE.Points;
  
  // Animation properties
  public isAnimating = true;
  public animationSpeed = 1;
  public selectedBody: CelestialBody | null = null;

  // Celestial bodies data
  private sunData = {
    name: 'Sun',
    radius: 2,
    distance: 0,
    period: 0,
    color: 0xffff00,
    angle: 0,
    speed: 0
  };

  private earthData: CelestialBody = {
    name: 'Earth',
    radius: 0.4,
    distance: 8,
    period: 365,
    color: 0x6b93d6,
    angle: 0,
    speed: 0.017, // 365 days orbit
    satellites: []
  };

  private moonData: CelestialBody = {
    name: 'Moon',
    radius: 0.1,
    distance: 1.2, // Distance from Earth
    period: 27,
    color: 0xcccccc,
    angle: 0,
    speed: 0.23 // 27 days orbit around Earth
  };

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initThreeJS();
    this.createScene();
    this.setupEventListeners();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private initThreeJS(): void {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(12, 8, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private createScene(): void {
    this.createStarField();
    this.createSun();
    this.createPlanets();
    this.setupLighting();
    this.setupControls();
  }

  private createStarField(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
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
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    this.scene.add(corona);
  }

  private createPlanets(): void {
    // Create Earth
    this.earth = this.createCelestialBody(this.earthData);
    this.celestialBodies.push(this.earth);

    // Create Moon as Earth's satellite
    this.moonData.parent = this.earth;
    this.moon = this.createCelestialBody(this.moonData);
    this.earth.satellites = [this.moon];
    this.celestialBodies.push(this.moon);
  }

  private createCelestialBody(bodyData: CelestialBody): CelestialBody {
    // Create a group for the celestial body and its satellites
    const bodyGroup = new THREE.Group();
    this.scene.add(bodyGroup);

    // Create the main body mesh
    const geometry = new THREE.SphereGeometry(bodyData.radius, 32, 32);
    let material: THREE.Material;

    // Special materials for different bodies
    if (bodyData.name === 'Earth') {
      // Create Earth with continents and oceans
      material = new THREE.MeshLambertMaterial({ 
        color: bodyData.color,
        transparent: false
      });
      
      // Add Earth's continents as a darker overlay
      const continentGeometry = new THREE.SphereGeometry(bodyData.radius * 1.001, 32, 32);
      const continentMaterial = new THREE.MeshLambertMaterial({
        color: 0x228B22, // Forest green for continents
        transparent: true,
        opacity: 0.7
      });
      const continents = new THREE.Mesh(continentGeometry, continentMaterial);
      bodyGroup.add(continents);
      
      // Add Earth's atmosphere glow
      const atmosphereGeometry = new THREE.SphereGeometry(bodyData.radius * 1.08, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB, // Sky blue
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      bodyGroup.add(atmosphere);

      // Add clouds layer
      const cloudGeometry = new THREE.SphereGeometry(bodyData.radius * 1.02, 32, 32);
      const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      bodyGroup.add(clouds);
      
    } else if (bodyData.name === 'Moon') {
      // Moon with crater-like appearance
      material = new THREE.MeshLambertMaterial({ 
        color: bodyData.color,
        transparent: false
      });
      
      // Add subtle crater effect
      const craterGeometry = new THREE.SphereGeometry(bodyData.radius * 1.001, 16, 16);
      const craterMaterial = new THREE.MeshLambertMaterial({
        color: 0x999999,
        transparent: true,
        opacity: 0.3
      });
      const craters = new THREE.Mesh(craterGeometry, craterMaterial);
      bodyGroup.add(craters);
    } else {
      material = new THREE.MeshLambertMaterial({ color: bodyData.color });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { bodyData: bodyData };
    
    bodyGroup.add(mesh);

    // Position the body
    if (bodyData.parent) {
      // If it has a parent, position relative to parent
      mesh.position.x = bodyData.distance;
    } else {
      // If no parent, position relative to sun
      bodyGroup.position.x = bodyData.distance;
    }

    // Create orbit line
    if (bodyData.distance > 0) {
      const orbitGeometry = new THREE.RingGeometry(
        bodyData.distance - 0.02, 
        bodyData.distance + 0.02, 
        128
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: bodyData.name === 'Moon' ? 0x666666 : 0x444444, 
        transparent: true, 
        opacity: bodyData.name === 'Moon' ? 0.4 : 0.3,
        side: THREE.DoubleSide
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      
      if (bodyData.parent && bodyData.parent.group) {
        // Moon's orbit around Earth
        bodyData.parent.group.add(orbit);
      } else {
        // Earth's orbit around Sun
        this.scene.add(orbit);
      }
    }

    bodyData.mesh = mesh;
    bodyData.group = bodyGroup;
    return bodyData;
  }

  private setupLighting(): void {
    // Ambient light - very low to create realistic space environment
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    this.scene.add(ambientLight);

    // Main sun light - intense point light
    const sunLight = new THREE.PointLight(0xffffff, 3, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 50;
    this.scene.add(sunLight);

    // Additional warm light for atmospheric effect
    const warmLight = new THREE.PointLight(0xffaa44, 1, 50);
    warmLight.position.set(0, 0, 0);
    this.scene.add(warmLight);

    // Directional light for additional illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.scene.add(directionalLight.target);
  }

  private setupControls(): void {
    // Basic mouse controls for camera rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.canvasRef.nativeElement.addEventListener('mousedown', (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.canvasRef.nativeElement.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y
        };

        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    });

    this.canvasRef.nativeElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Zoom with mouse wheel
    this.canvasRef.nativeElement.addEventListener('wheel', (event) => {
      event.preventDefault();
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      this.camera.position.multiplyScalar(scale);
      
      // Limit zoom
      const distance = this.camera.position.length();
      if (distance < 5) {
        this.camera.position.normalize().multiplyScalar(5);
      } else if (distance > 100) {
        this.camera.position.normalize().multiplyScalar(100);
      }
    });

    // Click to select planets
    this.canvasRef.nativeElement.addEventListener('click', (event) => {
      this.onPlanetClick(event);
    });
  }

  private onPlanetClick(event: MouseEvent): void {
    const mouse = new THREE.Vector2();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children);
    
    for (const intersect of intersects) {
      if (intersect.object.userData && intersect.object.userData['bodyData']) {
        this.selectedBody = intersect.object.userData['bodyData'];
        break;
      }
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    this.ngZone.runOutsideAngular(() => {
      this.frameId = requestAnimationFrame(() => this.animate());

      if (this.isAnimating) {
        this.updatePlanets();
        this.rotateSun();
      }

      this.renderer.render(this.scene, this.camera);
    });
  }

  private updatePlanets(): void {
    this.celestialBodies.forEach(body => {
      if (body.mesh && body.group) {
        body.angle += body.speed * this.animationSpeed * 0.01;
        
        if (body.parent) {
          // Moon orbiting Earth
          if (body.parent.group) {
            body.mesh.position.x = Math.cos(body.angle) * body.distance;
            body.mesh.position.z = Math.sin(body.angle) * body.distance;
          }
        } else {
          // Earth orbiting Sun
          body.group.position.x = Math.cos(body.angle) * body.distance;
          body.group.position.z = Math.sin(body.angle) * body.distance;
        }
        
        // Rotate body on its axis
        if (body.name === 'Earth') {
          body.mesh.rotation.y += 0.05 * this.animationSpeed; // Earth rotates faster
        } else {
          body.mesh.rotation.y += 0.02 * this.animationSpeed;
        }
      }
    });
  }

  private rotateSun(): void {
    if (this.sun) {
      this.sun.rotation.y += 0.005 * this.animationSpeed;
    }
  }

  // Control methods
  public toggleAnimation(): void {
    this.isAnimating = !this.isAnimating;
  }

  public updateSpeed(speed: string): void {
    this.animationSpeed = parseFloat(speed);
  }

  public resetCamera(): void {
    this.camera.position.set(12, 8, 15);
    this.camera.lookAt(0, 0, 0);
    this.selectedBody = null;
  }
}
