import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Configuration & Simulation Data
 */
const CONFIG = {
    rotationSpeed: 0.8,
    revolutionSpeed: 1.0,
    lightsEnabled: true,
    texturesEnabled: true,
    shadowsEnabled: true,
    renderMode: 'Solid',
    near: 0.1,
    far: 3000,
};

const BASE_TEXTURE_URL = 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/';

const PLANET_DATA = [
    { 
        name: 'Mercury', size: 0.6, a: 16, e: 0.205, i: 7.0, speed: 0.035, color: 0x8a9296, 
        orbitColor: 0x6e767a, texture: BASE_TEXTURE_URL + 'mercurymap.jpg',
        type: 'Terrestrial', distance: '57.9M km', period: '88 days', diameter: '4,879 km'
    },
    { 
        name: 'Venus', size: 1.1, a: 24, e: 0.007, i: 3.4, speed: 0.018, color: 0xe3bb76, 
        orbitColor: 0xd4a35c, texture: BASE_TEXTURE_URL + 'venusmap.jpg',
        type: 'Terrestrial', distance: '108.2M km', period: '224.7 days', diameter: '12,104 km'
    },
    { 
        name: 'Earth', size: 1.2, a: 34, e: 0.017, i: 0.0, speed: 0.012, color: 0x2b82c9, 
        orbitColor: 0x00f0ff, texture: BASE_TEXTURE_URL + 'earthmap1k.jpg',
        type: 'Terrestrial', distance: '149.6M km', period: '365.2 days', diameter: '12,742 km'
    },
    { 
        name: 'Mars', size: 0.9, a: 44, e: 0.093, i: 1.8, speed: 0.009, color: 0xe05638, 
        orbitColor: 0xff3b30, texture: BASE_TEXTURE_URL + 'marsmap1k.jpg',
        type: 'Terrestrial', distance: '227.9M km', period: '687 days', diameter: '6,779 km'
    },
    { 
        name: 'Jupiter', size: 3.0, a: 62, e: 0.048, i: 1.3, speed: 0.004, color: 0xd39c7e, 
        orbitColor: 0xe5a687, texture: BASE_TEXTURE_URL + 'jupitermap.jpg',
        type: 'Gas Giant', distance: '778.6M km', period: '11.86 years', diameter: '139,820 km'
    },
    { 
        name: 'Saturn', size: 2.6, a: 82, e: 0.054, i: 2.5, speed: 0.002, color: 0xc5ab6e, 
        orbitColor: 0xeedda7, texture: BASE_TEXTURE_URL + 'saturnmap.jpg',
        type: 'Gas Giant', distance: '1.433B km', period: '29.45 years', diameter: '116,460 km'
    },
    { 
        name: 'Uranus', size: 1.8, a: 102, e: 0.047, i: 0.8, speed: 0.0009, color: 0x93e6e6, 
        orbitColor: 0x5df5f5, texture: BASE_TEXTURE_URL + 'uranusmap.jpg',
        type: 'Ice Giant', distance: '2.871B km', period: '84 years', diameter: '50,724 km'
    },
    { 
        name: 'Neptune', size: 1.7, a: 120, e: 0.009, i: 1.8, speed: 0.0006, color: 0x4b70dd, 
        orbitColor: 0x3366ff, texture: BASE_TEXTURE_URL + 'neptunemap.jpg',
        type: 'Ice Giant', distance: '4.495B km', period: '164.8 years', diameter: '49,244 km'
    },
];

/**
 * Scene Initialization
 */
const scene = new THREE.Scene();
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, CONFIG.near, CONFIG.far);
camera.position.set(0, 180, 320);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 800;
controls.minDistance = 15;

// Texture Loader
const textureLoader = new THREE.TextureLoader();

/**
 * Lighting System
 */
const ambientLight = new THREE.AmbientLight(0x0c1220, 1.5);
scene.add(ambientLight);

// The glowing sun light
const sunLight = new THREE.PointLight(0xffffff, 8000, 1500, 1.2);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

/**
 * Shaders: Custom Fresnel Glow Shader for Space Atmosphere & Sun Corona
 */
const FresnelGlowShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 glowColor;
        uniform float c;
        uniform float p;
        void main() {
            float intensity = pow(c - dot(vNormal, normalize(vViewPosition)), p);
            gl_FragColor = vec4(glowColor, intensity);
        }
    `
};

/**
 * Environment: Multi-layered Space Stars & Colorful Nebula Dust
 */
const createSpaceEnvironment = () => {
    // 1. Classical Sparkle Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.6, 
        transparent: true, 
        opacity: 0.5,
        depthWrite: false 
    });
    
    const starVertices = [];
    for (let i = 0; i < 2500; i++) {
        const x = (Math.random() - 0.5) * 1600;
        const y = (Math.random() - 0.5) * 1600;
        const z = (Math.random() - 0.5) * 1600;
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 2. Cosmic Nebula Particle Clouds (Cyan, Magenta & Amber layers)
    const nebulaColors = [0x00f0ff, 0xd946ef, 0xf59e0b];
    const nebulaCount = [900, 700, 500];
    const nebulaSizes = [1.8, 2.2, 1.5];
    const nebulaOpacities = [0.15, 0.08, 0.12];

    const nebulaGroup = new THREE.Group();
    for (let i = 0; i < nebulaColors.length; i++) {
        const geom = new THREE.BufferGeometry();
        const verts = [];
        
        for (let j = 0; j < nebulaCount[i]; j++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 600;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            const y = (Math.random() - 0.5) * 120; // Flattened disk along the solar ecliptic
            verts.push(x, y, z);
        }
        
        geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        const mat = new THREE.PointsMaterial({
            color: nebulaColors[i],
            size: nebulaSizes[i],
            transparent: true,
            opacity: nebulaOpacities[i],
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const nebPoints = new THREE.Points(geom, mat);
        nebulaGroup.add(nebPoints);
    }
    scene.add(nebulaGroup);
    return { starPoints, nebulaGroup };
};

const env = createSpaceEnvironment();

/**
 * Solar System Objects Setup
 */
const sunGeometry = new THREE.SphereGeometry(8.2, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffe259,
    map: textureLoader.load(BASE_TEXTURE_URL + 'sunmap.jpg')
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Sun corona atmospheric glow
const sunGlowMaterial = new THREE.ShaderMaterial({
    vertexShader: FresnelGlowShader.vertexShader,
    fragmentShader: FresnelGlowShader.fragmentShader,
    uniforms: {
        c: { type: 'f', value: 0.1 },
        p: { type: 'f', value: 2.2 },
        glowColor: { type: 'c', value: new THREE.Color(0xff8c00) }
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
});
const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(10.2, 64, 64), sunGlowMaterial);
sun.add(sunGlow);

// Create Planets and orbital paths
const planets = [];
PLANET_DATA.forEach(data => {
    // Semi-minor axis b = a * sqrt(1 - e^2)
    const b = data.a * Math.sqrt(1 - Math.pow(data.e, 2));
    
    // Orbital Path line (Neon glowing)
    const curve = new THREE.EllipseCurve(0, 0, data.a, b, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(360);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: data.orbitColor, 
        transparent: true, 
        opacity: 0.35 
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    
    // Shift focus to Sun
    const c = data.a * data.e;
    orbitLine.position.set(-c, 0, 0);
    orbitLine.rotation.x = Math.PI / 2;
    
    // Apply Inclination (i)
    const inclinationGroup = new THREE.Group();
    inclinationGroup.rotation.z = THREE.MathUtils.degToRad(data.i);
    scene.add(inclinationGroup);
    inclinationGroup.add(orbitLine);

    // Planet Mesh
    const geometry = new THREE.SphereGeometry(data.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        metalness: 0.15, 
        roughness: 0.7 
    });

    textureLoader.load(data.texture, (texture) => {
        material.map = texture;
        material.needsUpdate = true;
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    inclinationGroup.add(mesh);

    const planetObj = { 
        mesh, 
        data, 
        a: data.a, 
        b: b, 
        inclinationGroup,
        theta: Math.random() * Math.PI * 2,
        speed: data.speed 
    };

    // Custom atmosphere glow for Earth and Venus
    if (data.name === 'Earth' || data.name === 'Venus') {
        const glowColorVal = data.name === 'Earth' ? 0x00a8ff : 0xe89b53;
        const atmGlowMat = new THREE.ShaderMaterial({
            vertexShader: FresnelGlowShader.vertexShader,
            fragmentShader: FresnelGlowShader.fragmentShader,
            uniforms: {
                c: { type: 'f', value: 0.35 },
                p: { type: 'f', value: 3.5 },
                glowColor: { type: 'c', value: new THREE.Color(glowColorVal) }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const atmGlow = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.3, 32, 32), atmGlowMat);
        mesh.add(atmGlow);
    }

    // Saturn Rings with elegant aesthetic texture map details
    if (data.name === 'Saturn') {
        const ringGeom = new THREE.RingGeometry(data.size + 0.8, data.size + 3.8, 128);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xa8926c, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.52 
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        mesh.add(ringMesh);
    }

    // Earth's Moon
    if (data.name === 'Earth') {
        const moonOrbit = new THREE.Group();
        mesh.add(moonOrbit);
        const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 32, 32), 
            new THREE.MeshStandardMaterial({ color: 0x8e9297, roughness: 0.9 })
        );
        moonMesh.position.x = 2.8;
        moonOrbit.add(moonMesh);
        
        planets.push({ 
            mesh: moonMesh, 
            isMoon: true, 
            orbitGroup: moonOrbit, 
            speed: 0.045 
        });
    }

    planets.push(planetObj);
});

/**
 * 3D Holographic Target Reticle for scanned objects
 */
let targetReticle = null;
let reticleInner = null;
let reticleOuter = null;

const createTargetReticle = () => {
    targetReticle = new THREE.Group();
    targetReticle.visible = false;

    // Inner dashed ring
    const innerGeom = new THREE.RingGeometry(1.2, 1.25, 32);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    reticleInner = new THREE.Mesh(innerGeom, innerMat);
    reticleInner.rotation.x = Math.PI / 2;
    targetReticle.add(reticleInner);

    // Outer bracket ring segment corners
    const outerGroup = new THREE.Group();
    const bracketAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    bracketAngles.forEach(ang => {
        const segGeom = new THREE.RingGeometry(1.42, 1.5, 32, 1, ang - 0.12, 0.24);
        const segMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });
        const segMesh = new THREE.Mesh(segGeom, segMat);
        segMesh.rotation.x = Math.PI / 2;
        outerGroup.add(segMesh);
    });
    reticleOuter = outerGroup;
    targetReticle.add(reticleOuter);

    scene.add(targetReticle);
};
createTargetReticle();

/**
 * Interactive Simulation Calendar System
 */
let simYear = 2026;
let simSol = 148;

const updateSimCalendar = (deltaSeconds) => {
    if (CONFIG.revolutionSpeed === 0) return;
    
    // Progress Sol (Space Days). 1X speed progresses roughly 1 Sol per real-world second.
    const solIncrement = deltaSeconds * CONFIG.revolutionSpeed * 1.5;
    simSol += solIncrement;
    
    if (simSol >= 365.25) {
        const addedYears = Math.floor(simSol / 365.25);
        simYear += addedYears;
        simSol = simSol % 365.25;
    }
    
    document.getElementById('hud-date').innerText = `YEAR ${simYear} - SOL ${Math.floor(simSol)}`;
};

/**
 * Autopilot Cinematic Autotour Configuration
 */
let autopilotActive = false;
let autopilotTimer = 0;
let currentAutopilotIdx = -1;

const updateAutopilotTour = (deltaSeconds) => {
    if (!autopilotActive) return;

    autopilotTimer += deltaSeconds;
    if (autopilotTimer >= 10.0) {
        autopilotTimer = 0;
        nextAutopilotTarget();
    }
};

const nextAutopilotTarget = () => {
    const filterPlanets = planets.filter(p => !p.isMoon);
    currentAutopilotIdx = (currentAutopilotIdx + 1) % filterPlanets.length;
    const targetPlanet = filterPlanets[currentAutopilotIdx];
    
    if (targetPlanet) {
        // Space travel hyperdrive warp camera effect
        gsap.to(camera, {
            fov: 70,
            duration: 0.5,
            ease: 'power2.in',
            onUpdate: () => camera.updateProjectionMatrix(),
            onComplete: () => {
                selectPlanet(targetPlanet);
                gsap.to(camera, {
                    fov: 45,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: () => camera.updateProjectionMatrix()
                });
            }
        });
    }
};

const toggleAutopilotMode = () => {
    autopilotActive = !autopilotActive;
    const btn = document.getElementById('btn-autopilot');
    const label = document.getElementById('status-autopilot');
    
    if (autopilotActive) {
        btn.classList.add('autopilot-active');
        label.innerText = 'ON';
        label.className = 'status-on';
        autopilotTimer = 8.5; // Trigger first planet selection shortly after activation
    } else {
        btn.classList.remove('autopilot-active');
        label.innerText = 'OFF';
        label.className = 'status-off';
        resetView();
    }
};

/**
 * UI Integration & HUD Data Generator
 */
const buildPlanetSelectionDock = () => {
    const listContainer = document.getElementById('hud-planet-list');
    listContainer.innerHTML = ''; // Clean old entries
    
    planets.forEach(p => {
        if (p.isMoon) return;
        
        const btn = document.createElement('button');
        btn.className = 'hud-btn';
        btn.id = `btn-fleet-${p.data.name}`;
        btn.innerHTML = `
            <span>${p.data.name.toUpperCase()}</span>
            <span class="planet-distance-small">${p.data.distance}</span>
        `;
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (autopilotActive) {
                // Disable autopilot if user manually selects a planet
                toggleAutopilotMode();
            }
            selectPlanet(p);
        });
        
        listContainer.appendChild(btn);
    });
};
buildPlanetSelectionDock();

const syncHUDSelection = (planetName) => {
    // Deactivate all sidebar planet list buttons
    document.querySelectorAll('.planet-list .hud-btn').forEach(btn => btn.classList.remove('active'));
    
    if (planetName) {
        const activeBtn = document.getElementById(`btn-fleet-${planetName}`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Hide GUI to prevent cluttering details
        const guiElem = document.querySelector('.lil-gui');
        if (guiElem) guiElem.classList.add('hidden');
    } else {
        const guiElem = document.querySelector('.lil-gui');
        if (guiElem) guiElem.classList.remove('hidden');
    }
};

/**
 * Time Dock Controls
 */
const setupTimeChronosDock = () => {
    const btns = document.querySelectorAll('.hud-time-controls .time-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const speed = parseFloat(btn.getAttribute('data-speed'));
            CONFIG.revolutionSpeed = speed;
        });
    });
};
setupTimeChronosDock();

/**
 * Camera View Navigation & Planetary Lock telemetries
 */
let selectedPlanet = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.getElementById('info-panel');
const closeBtn = document.getElementById('close-panel');

function updateInfoPanel(data) {
    document.getElementById('planet-name').innerText = data.name.toUpperCase();
    document.getElementById('planet-type').innerText = data.type;
    document.getElementById('planet-distance').innerText = data.distance;
    document.getElementById('planet-period').innerText = data.period;
    document.getElementById('planet-diameter').innerText = data.diameter;
    
    infoPanel.classList.remove('hidden');
}

function selectPlanet(planet) {
    selectedPlanet = planet;
    updateInfoPanel(planet.data);
    syncHUDSelection(planet.data.name);

    const targetPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(targetPos);

    // Smoothly lock controls target and sweep camera
    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.4,
        ease: "power2.inOut"
    });

    const viewOffset = planet.data.size * 4 + 8;
    gsap.to(camera.position, {
        x: targetPos.x + viewOffset,
        y: targetPos.y + viewOffset / 1.8,
        z: targetPos.z + viewOffset,
        duration: 1.4,
        ease: "power2.inOut"
    });

    // Bring up the Hologram targeting reticle lock
    targetReticle.visible = true;
    const reticleScale = planet.data.size * 1.35;
    targetReticle.scale.set(reticleScale, reticleScale, reticleScale);
}

function resetView() {
    selectedPlanet = null;
    infoPanel.classList.add('hidden');
    syncHUDSelection(null);
    targetReticle.visible = false;

    gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.3,
        ease: "power2.inOut"
    });

    gsap.to(camera.position, {
        x: 0, 
        y: 180, 
        z: 320,
        duration: 1.3,
        ease: "power2.inOut"
    });
}

// Raycasting planet mesh click selectors
window.addEventListener('click', (event) => {
    // Guard clicks on GUI or HUD panel overlays
    if (event.target.closest('#hud-overlay') || 
        event.target.closest('#info-panel') || 
        event.target.closest('.lil-gui')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Only intersect visible planetary meshes (excluding atmospheric mesh glow, Saturn rings, moons)
    const activePlanetMeshes = planets.filter(p => !p.isMoon).map(p => p.mesh);
    const intersects = raycaster.intersectObjects(activePlanetMeshes);

    if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const planet = planets.find(p => p.mesh === hitMesh);
        
        if (planet) {
            if (autopilotActive) toggleAutopilotMode(); // Stop autopilot
            selectPlanet(planet);
        }
    }
});

closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetView();
});

document.getElementById('btn-autopilot').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAutopilotMode();
});

/**
 * lil-gui System Diagnostics Controller Setup
 */
const gui = new GUI({ title: 'HUD Diagnostics' });

const camFolder = gui.addFolder('Camera Telemetry');
camFolder.add(CONFIG, 'near', 0.05, 5).onChange(v => camera.near = v).name('Near Range');
camFolder.add(CONFIG, 'far', 500, 4000).onChange(v => camera.far = v).name('Far Range');

const renderFolder = gui.addFolder('System Visuals');
renderFolder.add(CONFIG, 'renderMode', ['Solid', 'Wireframe']).onChange(updateRenderMode).name('Mesh Mode');
renderFolder.add(CONFIG, 'lightsEnabled').onChange(updateLights).name('Glow Sources');

const animFolder = gui.addFolder('Time Multipliers');
animFolder.add(CONFIG, 'rotationSpeed', 0, 5).name('Axial Rotate');

function updateRenderMode() {
    scene.traverse(node => {
        if (node.isMesh && node !== sun && node !== sunGlow && !node.geometry.type.includes('Ring')) {
            node.material.wireframe = CONFIG.renderMode === 'Wireframe';
        }
    });
}

function updateLights() {
    ambientLight.visible = CONFIG.lightsEnabled;
    sunLight.visible = CONFIG.lightsEnabled;
    
    // Toggle atmosphere glow layers
    planets.forEach(p => {
        p.mesh.children.forEach(child => {
            if (child.material && child.material.type === 'ShaderMaterial') {
                child.visible = CONFIG.lightsEnabled;
            }
        });
    });
}

/**
 * Space Simulation Main Engine Loop
 */
let lastFrameTime = performance.now();
let fpsInterval = 0;
let fpsCounterElem = document.getElementById('fps-counter');

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const deltaSeconds = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    // FPS Telemetry Calculator
    fpsInterval += deltaSeconds;
    if (fpsInterval >= 0.5) {
        const fps = Math.round(1 / deltaSeconds);
        fpsCounterElem.innerText = `${fps} FPS`;
        fpsInterval = 0;
    }

    const timeScale = CONFIG.revolutionSpeed;

    // Update planetary physics positions (Keplerian semi-ellipses)
    planets.forEach(p => {
        if (p.isMoon) {
            p.orbitGroup.rotation.y += p.speed * CONFIG.revolutionSpeed;
            p.mesh.rotation.y += 0.018 * CONFIG.rotationSpeed;
            return;
        }

        const { a, data } = p;
        const e = data.e;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(p.theta));
        const angularVelocity = (p.speed * (a * a)) / (r * r);
        p.theta += angularVelocity * timeScale;

        p.mesh.position.x = r * Math.cos(p.theta);
        p.mesh.position.z = r * Math.sin(p.theta);

        p.mesh.rotation.y += 0.015 * CONFIG.rotationSpeed;
    });

    // Reticle HUD follow lock target
    if (selectedPlanet && targetReticle.visible) {
        const targetPos = new THREE.Vector3();
        selectedPlanet.mesh.getWorldPosition(targetPos);
        
        targetReticle.position.copy(targetPos);
        controls.target.copy(targetPos);
        
        // Rotate HUD ring segments in opposite directions
        reticleInner.rotation.z -= 0.005;
        reticleOuter.rotation.z += 0.01;
    }

    // Slowly rotate background nebulae dust for space dynamic feel
    env.nebulaGroup.rotation.y += 0.00015;
    sun.rotation.y += 0.002;

    // Simulation Sol calendar progression
    updateSimCalendar(deltaSeconds);

    // Autotour timing trigger
    updateAutopilotTour(deltaSeconds);

    // Top Right Camera Coords Telemetry Sync
    document.getElementById('cam-coords').innerText = `[${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}, ${Math.round(camera.position.z)}]`;

    controls.update();
    renderer.render(scene, camera);
}

// Window Responsive Scaler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Run Simulation
animate();
