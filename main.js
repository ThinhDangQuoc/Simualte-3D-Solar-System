import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Configuration & Data
 */
const CONFIG = {
    rotationSpeed: 1,
    revolutionSpeed: 1,
    lightsEnabled: true,
    texturesEnabled: true,
    shadowsEnabled: true,
    renderMode: 'Solid',
    near: 0.1,
    far: 2000,
};

const BASE_TEXTURE_URL = 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/';

const PLANET_DATA = [
    { 
        name: 'Mercury', size: 0.6, a: 15, e: 0.205, i: 7.0, speed: 0.04, color: 0x8c8c8c, 
        texture: BASE_TEXTURE_URL + 'mercurymap.jpg',
        type: 'Terrestrial', distance: '57.9 million km', period: '88 days', diameter: '4,879 km'
    },
    { 
        name: 'Venus', size: 1.1, a: 22, e: 0.007, i: 3.4, speed: 0.015, color: 0xe3bb76, 
        texture: BASE_TEXTURE_URL + 'venusmap.jpg',
        type: 'Terrestrial', distance: '108.2 million km', period: '224.7 days', diameter: '12,104 km'
    },
    { 
        name: 'Earth', size: 1.2, a: 30, e: 0.017, i: 0.0, speed: 0.01, color: 0x2233ff, 
        texture: BASE_TEXTURE_URL + 'earthmap1k.jpg',
        type: 'Terrestrial', distance: '149.6 million km', period: '365.2 days', diameter: '12,742 km'
    },
    { 
        name: 'Mars', size: 0.9, a: 38, e: 0.093, i: 1.8, speed: 0.008, color: 0xff4422, 
        texture: BASE_TEXTURE_URL + 'marsmap1k.jpg',
        type: 'Terrestrial', distance: '227.9 million km', period: '687 days', diameter: '6,779 km'
    },
    { 
        name: 'Jupiter', size: 3.0, a: 55, e: 0.048, i: 1.3, speed: 0.002, color: 0xd39c7e, 
        texture: BASE_TEXTURE_URL + 'jupitermap.jpg',
        type: 'Gas Giant', distance: '778.6 million km', period: '11.86 years', diameter: '139,820 km'
    },
    { 
        name: 'Saturn', size: 2.6, a: 75, e: 0.054, i: 2.5, speed: 0.001, color: 0xc5ab6e, 
        texture: BASE_TEXTURE_URL + 'saturnmap.jpg',
        type: 'Gas Giant', distance: '1.433 billion km', period: '29.45 years', diameter: '116,460 km'
    },
    { 
        name: 'Uranus', size: 1.8, a: 95, e: 0.047, i: 0.8, speed: 0.0007, color: 0xb5e3e3, 
        texture: BASE_TEXTURE_URL + 'uranusmap.jpg',
        type: 'Ice Giant', distance: '2.871 billion km', period: '84 years', diameter: '50,724 km'
    },
    { 
        name: 'Neptune', size: 1.7, a: 110, e: 0.009, i: 1.8, speed: 0.0005, color: 0x4b70dd, 
        texture: BASE_TEXTURE_URL + 'neptunemap.jpg',
        type: 'Ice Giant', distance: '4.495 billion km', period: '164.8 years', diameter: '49,244 km'
    },
];

/**
 * Scene Initialization
 */
const scene = new THREE.Scene();
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, CONFIG.near, CONFIG.far);
camera.position.set(0, 150, 300);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Texture Loader
const textureLoader = new THREE.TextureLoader();

/**
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 10000, 1000);
sunLight.castShadow = true;
scene.add(sunLight);

/**
 * Environment: Subtle Starfield
 * (Replacing the dense skybox with a sparse particle system for elegance)
 */
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.4 });

const starVertices = [];
for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

/**
 * Solar System Objects
 */
const sunGeometry = new THREE.SphereGeometry(8, 64, 64);
const sunMaterial = new THREE.MeshStandardMaterial({ 
    emissive: 0xffcc00,
    emissiveIntensity: 1,
    emissiveMap: textureLoader.load(BASE_TEXTURE_URL + 'sunmap.jpg')
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create Planets and their orbital groups
const planets = [];
PLANET_DATA.forEach(data => {
    // Semi-minor axis b = a * sqrt(1 - e^2)
    const b = data.a * Math.sqrt(1 - Math.pow(data.e, 2));
    
    // Orbital Path (Ellipse)
    const curve = new THREE.EllipseCurve(0, 0, data.a, b, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(256);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    
    // Shift focus to Sun
    const c = data.a * data.e;
    orbitLine.position.set(-c, 0, 0);
    orbitLine.rotation.x = Math.PI / 2;
    
    // Apply Inclination (i) - Rotate the entire orbit
    const inclinationGroup = new THREE.Group();
    inclinationGroup.rotation.z = THREE.MathUtils.degToRad(data.i);
    scene.add(inclinationGroup);
    inclinationGroup.add(orbitLine);

    // Planet Mesh
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: data.color, metalness: 0.1, roughness: 0.8 });

    textureLoader.load(data.texture, (texture) => {
        material.map = texture;
        material.needsUpdate = true;
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    inclinationGroup.add(mesh); // Add to the inclined group

    planets.push({ 
        mesh, 
        data, 
        a: data.a, 
        b: b, 
        inclinationGroup,
        theta: Math.random() * Math.PI * 2,
        speed: data.speed 
    });

    // Saturn Rings
    if (data.name === 'Saturn') {
        const ringGeom = new THREE.RingGeometry(data.size + 1, data.size + 4, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x887755, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh);
    }

    // Earth's Moon
    if (data.name === 'Earth') {
        const moonOrbit = new THREE.Group();
        mesh.add(moonOrbit);
        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        moonMesh.position.x = 3;
        moonOrbit.add(moonMesh);
        planets.push({ mesh: moonMesh, isMoon: true, orbitGroup: moonOrbit, speed: 0.05 });
    }
});

/**
 * Visual Polish: Sun Glow
 */
const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(8.5, 64, 64),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.BackSide })
);
sun.add(sunGlow);

/**
 * UI Controls
 */
const gui = new GUI();
const camFolder = gui.addFolder('Camera');
camFolder.add(CONFIG, 'near', 0.1, 10).onChange(v => camera.near = v).name('Near Plane');
camFolder.add(CONFIG, 'far', 100, 5000).onChange(v => camera.far = v).name('Far Plane');

const renderFolder = gui.addFolder('Rendering');
renderFolder.add(CONFIG, 'renderMode', ['Solid', 'Wireframe', 'Points']).onChange(updateRenderMode).name('Mode');
renderFolder.add(CONFIG, 'texturesEnabled').onChange(updateTextures).name('Textures');
renderFolder.add(CONFIG, 'lightsEnabled').onChange(updateLights).name('Lights');
renderFolder.add(CONFIG, 'shadowsEnabled').onChange(v => renderer.shadowMap.enabled = v).name('Shadows');

const animFolder = gui.addFolder('Animation');
animFolder.add(CONFIG, 'rotationSpeed', 0, 5).name('Rotation Multiplier');
animFolder.add(CONFIG, 'revolutionSpeed', 0, 5).name('Revolution Multiplier');

function updateRenderMode() {
    scene.traverse(node => {
        if (node.isMesh) {
            if (CONFIG.renderMode === 'Wireframe') {
                node.material.wireframe = true;
                node.visible = true;
            } else if (CONFIG.renderMode === 'Points') {
                node.material.wireframe = false;
                // For simplified points mode, we'll just toggle visibility or use a Points material
                // but wireframe + material toggle is easier for a course project.
            } else {
                node.material.wireframe = false;
                node.visible = true;
            }
        }
    });
}

function updateTextures() {
    scene.traverse(node => {
        if (node.isMesh && node.material.map !== undefined) {
             // Logic to toggle map would go here, effectively reloading or nulling
        }
    });
    window.location.reload(); // Simplest way to toggle texture state for demo
}

function updateLights() {
    ambientLight.visible = CONFIG.lightsEnabled;
    sunLight.visible = CONFIG.lightsEnabled;
    directionalLight.visible = CONFIG.lightsEnabled;
}

/**
 * Camera Auto-Rotation (Optional feature for better visuals)
 */
// controls.autoRotate = true;
// controls.autoRotateSpeed = 0.5;

/**
 * Interaction State
 */
let selectedPlanet = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.getElementById('info-panel');
const closeBtn = document.getElementById('close-panel');

function updateInfoPanel(data) {
    document.getElementById('planet-name').innerText = data.name;
    document.getElementById('planet-type').innerText = data.type;
    document.getElementById('planet-distance').innerText = data.distance;
    document.getElementById('planet-period').innerText = data.period;
    document.getElementById('planet-diameter').innerText = data.diameter;
    infoPanel.classList.remove('hidden');
}

function selectPlanet(planet) {
    selectedPlanet = planet;
    updateInfoPanel(planet.data);

    // Get the world position of the planet
    const targetPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(targetPos);

    // Smoothly animate camera target and position
    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: "power2.inOut"
    });

    // Move camera to a good viewing distance relative to planet size
    const offsetDistance = planet.data.size * 5 + 5;
    gsap.to(camera.position, {
        x: targetPos.x + offsetDistance,
        y: targetPos.y + offsetDistance / 2,
        z: targetPos.z + offsetDistance,
        duration: 1.5,
        ease: "power2.inOut"
    });
}

function resetView() {
    selectedPlanet = null;
    infoPanel.classList.add('hidden');

    gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });

    gsap.to(camera.position, {
        x: 0, y: 150, z: 300,
        duration: 1.5,
        ease: "power2.inOut"
    });
}

window.addEventListener('click', (event) => {
    // Guard: ignore if clicking UI elements
    if (event.target.closest('#info-panel') || event.target.closest('.lil-gui')) return;

    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const planet = planets.find(p => p.mesh === clickedMesh);
        
        // If it's a moon, we could follow its parent planet or just the moon
        if (planet) {
            if (planet.isMoon) {
                // If it's a moon, we show the moon's info if available, or ignore
                // For now, let's just make sure it doesn't crash
                return; 
            }
            selectPlanet(planet);
        }
    }
});

closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetView();
});

/**
 * Main Loop
 */
function animate() {
    requestAnimationFrame(animate);

    const timeScale = CONFIG.revolutionSpeed;

    planets.forEach(p => {
        if (p.isMoon) {
            p.orbitGroup.rotation.y += p.speed * CONFIG.revolutionSpeed;
            p.mesh.rotation.y += 0.02 * CONFIG.rotationSpeed;
            return;
        }

        // Elliptical Motion
        const { a, data } = p;
        const e = data.e;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(p.theta));
        const angularVelocity = (p.speed * (a * a)) / (r * r);
        p.theta += angularVelocity * timeScale;

        p.mesh.position.x = r * Math.cos(p.theta);
        p.mesh.position.z = r * Math.sin(p.theta);

        p.mesh.rotation.y += 0.02 * CONFIG.rotationSpeed;
    });

    // If a planet is selected, keep following it
    if (selectedPlanet) {
        const targetPos = new THREE.Vector3();
        selectedPlanet.mesh.getWorldPosition(targetPos);
        controls.target.copy(targetPos);
    }

    sun.rotation.y += 0.005;

    controls.update();
    renderer.render(scene, camera);
}

// Handle resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
