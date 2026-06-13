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
    orbitsEnabled: true,
    flatLighting: false,
    shadingModel: 'Standard (PBR)',
    textureFilter: 'Linear (Smooth)',
    showAxes: false,
    showGrid: false,
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
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: false 
});
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
const sunLight = new THREE.PointLight(0xffffff, 1000, 1500, 1.2);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// Computer Graphics Coordinate Reference Helpers
const axesHelper = new THREE.AxesHelper(150);
axesHelper.visible = false;
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(400, 80, 0x00f0ff, 0x142035);
gridHelper.position.y = -0.1;
gridHelper.visible = false;
scene.add(gridHelper);

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

// Twinkling Starfield layer variables
let starsGlow1 = null;
let starsGlow2 = null;
let starsGlow3 = null;

/**
 * Environment: Multi-layered Space Stars & Colorful Nebula Dust
 */
const createSpaceEnvironment = () => {
    // 1. Classical Sparkle Starfield (split into 3 independent layers for dynamic glowing/twinkling animations)
    const createStarLayer = (count, size, opacity) => {
        const geom = new THREE.BufferGeometry();
        const verts = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 1800;
            const y = (Math.random() - 0.5) * 1800;
            const z = (Math.random() - 0.5) * 1800;
            verts.push(x, y, z);
        }
        geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
        const mat = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: size, 
            transparent: true, 
            opacity: opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const points = new THREE.Points(geom, mat);
        scene.add(points);
        return points;
    };
    
    starsGlow1 = createStarLayer(1000, 0.45, 0.4);
    starsGlow2 = createStarLayer(900, 0.75, 0.35);
    starsGlow3 = createStarLayer(700, 0.6, 0.5);

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
    return { nebulaGroup };
};

const env = createSpaceEnvironment();

/**
 * Create the Asteroid Belt between Mars and Jupiter
 */
const createAsteroidBelt = () => {
    const count = 1200;
    const geom = new THREE.BufferGeometry();
    const positions = [];
    
    // Mars is at a = 44, Jupiter is at a = 62. Belt fits beautifully at radius 50-56
    const minR = 50;
    const maxR = 56;
    
    for (let i = 0; i < count; i++) {
        const radius = minR + Math.random() * (maxR - minR);
        const angle = Math.random() * Math.PI * 2;
        
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = (Math.random() - 0.5) * 1.5; // Thin flat disk along solar plane
        
        positions.push(x, y, z);
    }
    
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
        color: 0x9c8f80,
        size: 0.28,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const belt = new THREE.Points(geom, mat);
    scene.add(belt);
    return belt;
};

let asteroidBelt = createAsteroidBelt();



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
const orbitLines = [];
const planets = [];

// Reusable function to build and register any planet (core or custom)
const createPlanet = (data, initialTheta = null) => {
    // Semi-minor axis b = a * sqrt(1 - e^2)
    const b = data.a * Math.sqrt(1 - Math.pow(data.e, 2));
    
    // Orbital Path line (Neon glowing)
    const curve = new THREE.EllipseCurve(0, 0, data.a, b, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(360);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: data.orbitColor || 0x00f0ff, 
        transparent: true, 
        opacity: 0.35 
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    orbitLines.push(orbitLine);
    
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
        color: typeof data.color === 'string' ? parseInt(data.color.replace('#', '0x')) : data.color, 
        metalness: 0.15, 
        roughness: 0.7 
    });

    if (data.texture && data.texture !== 'color') {
        const textureUrl = data.texture.startsWith('http') ? data.texture : (data.texture.endsWith('.jpg') ? data.texture : `${BASE_TEXTURE_URL}${data.texture}.jpg`);
        textureLoader.load(textureUrl, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.userData.textureMap = texture;
            if (CONFIG.texturesEnabled) {
                material.map = texture;
                material.color.set(0xffffff);
            } else {
                material.map = null;
                material.color.set(typeof data.color === 'string' ? parseInt(data.color.replace('#', '0x')) : data.color);
            }
            material.needsUpdate = true;
        });
    }

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
        theta: initialTheta !== null ? initialTheta : Math.random() * Math.PI * 2,
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
    if (data.name === 'Saturn' || data.hasRings) {
        const ringGeom = new THREE.RingGeometry(data.size + 0.8, data.size + 3.8, 128);
        const ringColor = data.name === 'Saturn' ? 0xa8926c : (typeof data.color === 'string' ? parseInt(data.color.replace('#', '0x')) : data.color);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: ringColor, 
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

        const moonTexture = textureLoader.load(BASE_TEXTURE_URL + 'moonmap1k.jpg');
        moonTexture.colorSpace = THREE.SRGBColorSpace;

        const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 32, 32),
            new THREE.MeshStandardMaterial({
                map: moonTexture,
                color: 0x8e9297,
                roughness: 0.9,
                metalness: 0.0
            })
        );

        moonMesh.position.x = 2.8;
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        moonOrbit.add(moonMesh);

        planets.push({
            mesh: moonMesh,
            isMoon: true,
            orbitGroup: moonOrbit,
            speed: 0.045
        });
    }

    planets.push(planetObj);
    return planetObj;
};

// Initialize core planets from static data
PLANET_DATA.forEach(data => {
    createPlanet(data);
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
const planetViewBtn = document.getElementById('btn-planet-view');
let planetViewMode = false;
let planetViewPlanet = null;
const planetViewCameraOffset = new THREE.Vector3();
const planetViewLookTarget = new THREE.Vector3();
const planetViewBaseForward = new THREE.Vector3();
const planetViewBaseRight = new THREE.Vector3();
const planetViewBaseUp = new THREE.Vector3();
const planetViewLookDirection = new THREE.Vector3();
const planetViewYawQuat = new THREE.Quaternion();
const planetViewPitchQuat = new THREE.Quaternion();
let planetViewYaw = 0;
let planetViewPitch = 0;
let isPlanetViewDragging = false;
let lastPlanetViewPointer = { x: 0, y: 0 };
const PLANET_VIEW_MOUSE_SENSITIVITY = 0.0032;
const PLANET_VIEW_MAX_PITCH = THREE.MathUtils.degToRad(84);

function updateInfoPanel(data) {
    document.getElementById('planet-name').innerText = data.name.toUpperCase();
    document.getElementById('planet-type').innerText = data.type;
    document.getElementById('planet-distance').innerText = data.distance;
    document.getElementById('planet-period').innerText = data.period;
    document.getElementById('planet-diameter').innerText = data.diameter;
    updatePlanetViewButton();
    
    infoPanel.classList.remove('hidden');
}


function updatePlanetViewButton() {
    if (!planetViewBtn) return;

    if (planetViewMode && planetViewPlanet) {
        planetViewBtn.innerText = `EXIT ${planetViewPlanet.data.name.toUpperCase()} VIEW`;
        planetViewBtn.classList.add('active');
    } else {
        planetViewBtn.innerText = selectedPlanet
            ? `VIEW FROM ${selectedPlanet.data.name.toUpperCase()}`
            : 'VIEW FROM PLANET';
        planetViewBtn.classList.remove('active');
    }
}

function getPlanetViewPose(planet) {
    const planetPos = new THREE.Vector3();
    planet.mesh.getWorldPosition(planetPos);

    // Direction from the Solar System center to the planet.
    // The camera sits just above the surface that faces the inner Solar System.
    const fromSunToPlanet = planetPos.clone().normalize();
    if (fromSunToPlanet.lengthSq() === 0) fromSunToPlanet.set(1, 0, 0);

    const surfaceHeight = planet.data.size + Math.max(0.22, planet.data.size * 0.16);
    const cameraHeight = Math.max(0.18, planet.data.size * 0.08);
    const cameraPos = planetPos.clone()
        .sub(fromSunToPlanet.multiplyScalar(surfaceHeight))
        .add(new THREE.Vector3(0, cameraHeight, 0));

    const lookTarget = new THREE.Vector3(0, Math.max(0.8, planet.data.size * 0.5), 0);

    return { cameraPos, lookTarget };
}

function getPlanetViewBasis(planet, cameraPos, lookTarget) {
    planetViewBaseForward.copy(lookTarget).sub(cameraPos).normalize();
    if (planetViewBaseForward.lengthSq() === 0) planetViewBaseForward.set(0, 0, -1);

    const worldUp = new THREE.Vector3(0, 1, 0);
    planetViewBaseRight.crossVectors(planetViewBaseForward, worldUp).normalize();
    if (planetViewBaseRight.lengthSq() < 0.0001) planetViewBaseRight.set(1, 0, 0);

    planetViewBaseUp.crossVectors(planetViewBaseRight, planetViewBaseForward).normalize();
    return {
        forward: planetViewBaseForward,
        right: planetViewBaseRight,
        up: planetViewBaseUp
    };
}

function updatePlanetViewCamera({ immediate = false } = {}) {
    if (!planetViewMode || !planetViewPlanet) return;

    const { cameraPos, lookTarget } = getPlanetViewPose(planetViewPlanet);
    planetViewCameraOffset.copy(cameraPos);
    planetViewLookTarget.copy(lookTarget);

    if (immediate) {
        camera.position.copy(planetViewCameraOffset);
    } else {
        camera.position.lerp(planetViewCameraOffset, 0.28);
    }

    const { forward, right, up } = getPlanetViewBasis(planetViewPlanet, camera.position, planetViewLookTarget);
    planetViewYawQuat.setFromAxisAngle(up, planetViewYaw);

    planetViewLookDirection.copy(forward).applyQuaternion(planetViewYawQuat).normalize();
    const yawedRight = right.clone().applyQuaternion(planetViewYawQuat).normalize();
    planetViewPitchQuat.setFromAxisAngle(yawedRight, planetViewPitch);
    planetViewLookDirection.applyQuaternion(planetViewPitchQuat).normalize();

    camera.lookAt(camera.position.clone().add(planetViewLookDirection));
}

function setPlanetViewHostVisibility(planet, visible) {
    if (!planet || !planet.mesh) return;

    const materials = Array.isArray(planet.mesh.material) ? planet.mesh.material : [planet.mesh.material];
    materials.forEach((mat) => {
        if (!mat) return;
        if (!mat.userData.planetViewOriginal) {
            mat.userData.planetViewOriginal = {
                transparent: mat.transparent,
                opacity: mat.opacity,
                depthWrite: mat.depthWrite,
                colorWrite: mat.colorWrite,
            };
        }

        const original = mat.userData.planetViewOriginal;
        if (visible) {
            mat.transparent = original.transparent;
            mat.opacity = original.opacity;
            mat.depthWrite = original.depthWrite;
            mat.colorWrite = original.colorWrite;
        } else {
            // The viewer is still positioned on the surface, but the host sphere is
            // made non-rendering so turning around does not show a giant blocking wall.
            mat.transparent = true;
            mat.opacity = 0;
            mat.depthWrite = false;
            mat.colorWrite = false;
        }
        mat.needsUpdate = true;
    });

    planet.mesh.children.forEach((child) => {
        // Hide decorative atmosphere/ring meshes while keeping groups such as Earth's moon orbit visible.
        if (child.isMesh) child.visible = visible;
    });
}

function setupPlanetViewMouseLook() {
    renderer.domElement.addEventListener('pointerdown', (event) => {
        if (!planetViewMode) return;
        if (event.target.closest('#hud-overlay') || event.target.closest('#info-panel') || event.target.closest('.lil-gui')) return;

        isPlanetViewDragging = true;
        lastPlanetViewPointer = { x: event.clientX, y: event.clientY };
        renderer.domElement.setPointerCapture?.(event.pointerId);
    });

    renderer.domElement.addEventListener('pointermove', (event) => {
        if (!planetViewMode || !isPlanetViewDragging) return;

        const dx = event.clientX - lastPlanetViewPointer.x;
        const dy = event.clientY - lastPlanetViewPointer.y;
        lastPlanetViewPointer = { x: event.clientX, y: event.clientY };

        planetViewYaw -= dx * PLANET_VIEW_MOUSE_SENSITIVITY;
        planetViewPitch -= dy * PLANET_VIEW_MOUSE_SENSITIVITY;
        planetViewPitch = THREE.MathUtils.clamp(
            planetViewPitch,
            -PLANET_VIEW_MAX_PITCH,
            PLANET_VIEW_MAX_PITCH
        );
    });

    const stopPlanetViewDrag = (event) => {
        if (!isPlanetViewDragging) return;
        isPlanetViewDragging = false;
        renderer.domElement.releasePointerCapture?.(event.pointerId);
    };

    renderer.domElement.addEventListener('pointerup', stopPlanetViewDrag);
    renderer.domElement.addEventListener('pointercancel', stopPlanetViewDrag);
    renderer.domElement.addEventListener('pointerleave', () => {
        isPlanetViewDragging = false;
    });
}

setupPlanetViewMouseLook();

function enterPlanetView() {
    if (!selectedPlanet || selectedPlanet.isMoon) return;
    if (autopilotActive) toggleAutopilotMode();

    planetViewMode = true;
    planetViewPlanet = selectedPlanet;
    planetViewYaw = 0;
    planetViewPitch = 0;
    isPlanetViewDragging = false;

    targetReticle.visible = false;
    controls.enabled = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    setPlanetViewHostVisibility(planetViewPlanet, false);

    const { cameraPos, lookTarget } = getPlanetViewPose(planetViewPlanet);
    gsap.to(camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration: 1.0,
        ease: "power2.inOut",
        onUpdate: () => updatePlanetViewCamera({ immediate: true }),
        onComplete: () => updatePlanetViewCamera({ immediate: true })
    });
    gsap.to(controls.target, {
        x: lookTarget.x,
        y: lookTarget.y,
        z: lookTarget.z,
        duration: 1.0,
        ease: "power2.inOut"
    });

    updatePlanetViewButton();
}

function exitPlanetView({ keepSelection = true } = {}) {
    if (!planetViewMode) return;

    const planetToReturn = planetViewPlanet;
    setPlanetViewHostVisibility(planetToReturn, true);
    planetViewMode = false;
    planetViewPlanet = null;
    isPlanetViewDragging = false;
    controls.enabled = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    updatePlanetViewButton();

    if (keepSelection && planetToReturn) {
        selectPlanet(planetToReturn);
    }
}

function togglePlanetView() {
    if (planetViewMode) {
        exitPlanetView({ keepSelection: true });
    } else {
        enterPlanetView();
    }
}

function selectPlanet(planet) {
    if (planetViewMode && planetViewPlanet !== planet) {
        exitPlanetView({ keepSelection: false });
    }

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
    const previousPlanetViewPlanet = planetViewPlanet;
    setPlanetViewHostVisibility(previousPlanetViewPlanet, true);
    planetViewMode = false;
    planetViewPlanet = null;
    isPlanetViewDragging = false;
    controls.enabled = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    updatePlanetViewButton();

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
    // In surface-view mode, mouse drag is used for first-person looking, not picking planets.
    if (planetViewMode) return;

    // Guard clicks on GUI or HUD panel overlays
    if (event.target.closest('#hud-overlay') || 
        event.target.closest('#info-panel') || 
        event.target.closest('#constructor-panel') || 
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

planetViewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlanetView();
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
camFolder.add(CONFIG, 'near', 0.05, 5).onChange(v => {
    camera.near = v;
    camera.updateProjectionMatrix();
}).name('Near Range');
camFolder.add(CONFIG, 'far', 500, 4000).onChange(v => {
    camera.far = v;
    camera.updateProjectionMatrix();
}).name('Far Range');

const renderFolder = gui.addFolder('Shading & Materials');
renderFolder.add(CONFIG, 'renderMode', ['Solid', 'Wireframe']).onChange(updateRenderMode).name('Mesh Mode');
renderFolder.add(CONFIG, 'shadingModel', ['Standard (PBR)', 'Phong', 'Lambert', 'Normal (Pháp tuyến)', 'Basic (Unlit)']).onChange(updateShadingModel).name('Shading Model');
renderFolder.add(CONFIG, 'textureFilter', ['Linear (Smooth)', 'Nearest (Pixelated)']).onChange(updateTextureFiltering).name('Texture Filter');

const debugFolder = gui.addFolder('Space Diagnostics & Helpers');
debugFolder.add(CONFIG, 'lightsEnabled').onChange(updateLights).name('Glow Sources');
debugFolder.add(CONFIG, 'orbitsEnabled').onChange(updateOrbits).name('Planet Orbits');
debugFolder.add(CONFIG, 'flatLighting').onChange(updateFlatLighting).name('Flat Lighting');
debugFolder.add(CONFIG, 'showAxes').onChange(updateHelpers).name('Coordinate Axes');
debugFolder.add(CONFIG, 'showGrid').onChange(updateHelpers).name('Ecliptic Grid');


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

function updateOrbits() {
    orbitLines.forEach(line => {
        line.visible = CONFIG.orbitsEnabled;
    });
}

function updateFlatLighting() {
    // Disable shadow casting from Sun Light when Flat Lighting is active
    sunLight.castShadow = !CONFIG.flatLighting;
    
    planets.forEach(p => {
        if (!p.mesh) return;
        
        if (CONFIG.flatLighting) {
            // Save original standard material if not already saved
            if (!p.mesh.userData.originalMaterial) {
                p.mesh.userData.originalMaterial = p.mesh.material;
            }
            
            // Create a BasicMaterial (unlit) and transfer the texture map and color
            const basicMat = new THREE.MeshBasicMaterial({
                map: p.mesh.userData.originalMaterial.map,
                color: p.mesh.userData.originalMaterial.color,
                wireframe: CONFIG.renderMode === 'Wireframe'
            });
            
            p.mesh.material = basicMat;
            p.mesh.castShadow = false;
            p.mesh.receiveShadow = false;
        } else {
            // Restore original standard material
            if (p.mesh.userData.originalMaterial) {
                p.mesh.material = p.mesh.userData.originalMaterial;
                p.mesh.castShadow = true;
                p.mesh.receiveShadow = true;
            }
        }
        
        p.mesh.material.needsUpdate = true;
    });
}

function applyTextureFilter(texture) {
    if (CONFIG.textureFilter === 'Nearest (Pixelated)') {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
    } else {
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
    }
    texture.needsUpdate = true;
}

function updateTextureFiltering() {
    planets.forEach(p => {
        if (!p.mesh) return;
        
        if (p.mesh.material && p.mesh.material.map) {
            applyTextureFilter(p.mesh.material.map);
        }
        if (p.mesh.userData.originalMaterial && p.mesh.userData.originalMaterial.map) {
            applyTextureFilter(p.mesh.userData.originalMaterial.map);
        }
    });
}

function updateShadingModel() {
    planets.forEach(p => {
        if (!p.mesh) return;
        
        // Save original material if not already saved
        if (!p.mesh.userData.originalMaterial) {
            p.mesh.userData.originalMaterial = p.mesh.material;
        }
        
        const orig = p.mesh.userData.originalMaterial;
        let newMat;
        
        switch (CONFIG.shadingModel) {
            case 'Phong':
                newMat = new THREE.MeshPhongMaterial({
                    map: orig.map,
                    color: orig.color,
                    shininess: 80,
                    specular: 0x444444,
                    wireframe: CONFIG.renderMode === 'Wireframe'
                });
                break;
            case 'Lambert':
                newMat = new THREE.MeshLambertMaterial({
                    map: orig.map,
                    color: orig.color,
                    wireframe: CONFIG.renderMode === 'Wireframe'
                });
                break;
            case 'Normal (Pháp tuyến)':
                newMat = new THREE.MeshNormalMaterial({
                    wireframe: CONFIG.renderMode === 'Wireframe'
                });
                break;
            case 'Basic (Unlit)':
                newMat = new THREE.MeshBasicMaterial({
                    map: orig.map,
                    color: orig.color,
                    wireframe: CONFIG.renderMode === 'Wireframe'
                });
                break;
            case 'Standard (PBR)':
            default:
                newMat = orig;
                newMat.wireframe = CONFIG.renderMode === 'Wireframe';
                break;
        }
        
        if (newMat.map) {
            applyTextureFilter(newMat.map);
        }
        
        p.mesh.material = newMat;
        p.mesh.material.needsUpdate = true;
    });
}

function updateHelpers() {
    axesHelper.visible = CONFIG.showAxes;
    gridHelper.visible = CONFIG.showGrid;
}

/**
 * Animate the twinkling starfield layers using a cyclic opacity glow modulation
 */
function updateStarfieldGlow(time) {
    if (starsGlow1 && starsGlow2 && starsGlow3) {
        // Modulate star layers independently at different frequencies for organic twinkling feel
        starsGlow1.material.opacity = 0.32 + Math.sin(time * 3.2) * 0.18;
        starsGlow2.material.opacity = 0.28 + Math.cos(time * 2.2 + 0.8) * 0.18;
        starsGlow3.material.opacity = 0.35 + Math.sin(time * 4.6 + 1.8) * 0.15;
    }
}

/**
 * Animate the sun corona radiating glowing heat waves by pulsing physical scale and Fresnel shader values
 */
function updateSunGlowHeat(time) {
    if (sunGlow) {
        // Pulsate corona mesh scale to mimic thermal convective expansion/contraction
        const thermalPulse = 1.0 + Math.sin(time * 2.0) * 0.035;
        sunGlow.scale.set(thermalPulse, thermalPulse, thermalPulse);
        
        // Modulate Fresnel glow coefficient (c) and power (p) for solar energy fluctuations
        sunGlowMaterial.uniforms.c.value = 0.14 + Math.sin(time * 1.2) * 0.04;
        sunGlowMaterial.uniforms.p.value = 2.3 + Math.cos(time * 2.4) * 0.32;
    }
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
            p.mesh.rotation.y += 0.018 * CONFIG.revolutionSpeed;
            return;
        }

        const { a, data } = p;
        const e = data.e;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(p.theta));
        const angularVelocity = (p.speed * (a * a)) / (r * r);
        p.theta += angularVelocity * timeScale;

        p.mesh.position.x = r * Math.cos(p.theta);
        p.mesh.position.z = r * Math.sin(p.theta);

        p.mesh.rotation.y += 0.015 * CONFIG.revolutionSpeed;
    });

    // Planet surface point-of-view camera follow. This keeps the camera anchored
    // above the chosen planet while mouse movement controls the viewing angle.
    if (planetViewMode && planetViewPlanet) {
        updatePlanetViewCamera();
    }

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

    // Slowly rotate Asteroid Belt
    if (asteroidBelt) {
        asteroidBelt.rotation.y += 0.00025 * CONFIG.revolutionSpeed;
    }



    // Twinkle starfield and pulse sun thermal glow wave cycles
    const time = now / 1000;
    updateStarfieldGlow(time);
    updateSunGlowHeat(time);

    // Simulation Sol calendar progression
    updateSimCalendar(deltaSeconds);

    // Autotour timing trigger
    updateAutopilotTour(deltaSeconds);

    // Top Right Camera Coords Telemetry Sync
    document.getElementById('cam-coords').innerText = `[${Math.round(camera.position.x)}, ${Math.round(camera.position.y)}, ${Math.round(camera.position.z)}]`;

    if (!planetViewMode) controls.update();
    renderer.render(scene, camera);
}

// Window Responsive Scaler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * ==========================================================================
 * Interactive Planet Constructor & Placement System
 * ==========================================================================
 */

// State for custom planet genesis builder
let constructorPlanetData = {
    name: 'Planet Genesis',
    size: 1.0,
    e: 0.05,
    i: 2.0,
    speed: 0.010,
    color: '#00f0ff',
    texture: 'color',
    rings: false
};

let placementMode = false;
let placementPreviewMesh = null;
let placementPreviewOrbit = null;
let placementPreviewGroup = null;
let placementCurrentA = 34; // default orbit radius preview
let placementCurrentTheta = 0;

// Intersection math plane (horizontal plane at Y = 0)
const placementPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const placementRaycaster = new THREE.Raycaster();
const placementMouse = new THREE.Vector2();

// Helper to convert hex number to HTML color string
const hexToHtmlColor = (colorNum) => {
    return '#' + colorNum.toString(16).padStart(6, '0');
};

// Enter mouse placement mode
const enterPlacementMode = () => {
    // Hide panel constructor
    document.getElementById('constructor-panel').classList.add('hidden');
    
    // Disable normal orbit controls
    controls.enabled = false;
    
    // Show placement instruction prompt
    document.getElementById('placement-prompt').classList.remove('hidden');
    
    placementMode = true;
    
    // Create new preview parent group for inclination angle (i)
    placementPreviewGroup = new THREE.Group();
    placementPreviewGroup.rotation.z = THREE.MathUtils.degToRad(constructorPlanetData.i);
    scene.add(placementPreviewGroup);
    
    // Holographic preview mesh (wireframe)
    const previewGeo = new THREE.SphereGeometry(constructorPlanetData.size, 32, 32);
    const previewMat = new THREE.MeshBasicMaterial({ 
        color: constructorPlanetData.color, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.7 
    });
    placementPreviewMesh = new THREE.Mesh(previewGeo, previewMat);
    placementPreviewGroup.add(placementPreviewMesh);
    
    // Holographic preview orbit line (dashed)
    const b = placementCurrentA * Math.sqrt(1 - Math.pow(constructorPlanetData.e, 2));
    const curve = new THREE.EllipseCurve(0, 0, placementCurrentA, b, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(120);
    const previewOrbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const previewOrbitMat = new THREE.LineDashedMaterial({ 
        color: constructorPlanetData.color, 
        dashSize: 1.5, 
        gapSize: 1.5, 
        transparent: true, 
        opacity: 0.5 
    });
    placementPreviewOrbit = new THREE.Line(previewOrbitGeo, previewOrbitMat);
    placementPreviewOrbit.computeLineDistances();
    
    const c = placementCurrentA * constructorPlanetData.e;
    placementPreviewOrbit.position.set(-c, 0, 0);
    placementPreviewOrbit.rotation.x = Math.PI / 2;
    placementPreviewGroup.add(placementPreviewOrbit);
};

// Update holographic previews in real-time based on mouse coords
const updatePlacementPreview = () => {
    if (!placementMode) return;
    
    placementRaycaster.setFromCamera(placementMouse, camera);
    const targetPoint = new THREE.Vector3();
    placementRaycaster.ray.intersectPlane(placementPlane, targetPoint);
    
    // Distance from Sun is the semi-major axis (a). Clamp to safe orbits (12 - 150)
    placementCurrentA = Math.max(12, Math.min(150, targetPoint.length()));
    
    // Recompute preview ellipse
    const e = constructorPlanetData.e;
    const b = placementCurrentA * Math.sqrt(1 - Math.pow(e, 2));
    const curve = new THREE.EllipseCurve(0, 0, placementCurrentA, b, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(120);
    
    placementPreviewOrbit.geometry.setFromPoints(points);
    placementPreviewOrbit.geometry.attributes.position.needsUpdate = true;
    placementPreviewOrbit.computeLineDistances();
    
    const c = placementCurrentA * e;
    placementPreviewOrbit.position.set(-c, 0, 0);
    
    // Position preview mesh on the orbit aligned with mouse vector angle
    placementCurrentTheta = Math.atan2(targetPoint.z, targetPoint.x);
    const r = (placementCurrentA * (1 - e * e)) / (1 + e * Math.cos(placementCurrentTheta));
    
    placementPreviewMesh.position.x = r * Math.cos(placementCurrentTheta);
    placementPreviewMesh.position.z = r * Math.sin(placementCurrentTheta);
    placementPreviewMesh.position.y = 0;
};

// Construct and spawn the actual planet in simulation scene
const placePlanet = () => {
    if (!placementMode) return;
    
    const size = constructorPlanetData.size;
    const e = constructorPlanetData.e;
    const i = constructorPlanetData.i;
    const speed = constructorPlanetData.speed;
    const color = constructorPlanetData.color;
    
    // Non-linear interpolation based on standard planet dataset for perfect match
    const getAstrophysicalDistance = (a) => {
        const refs = [
            { a: 16, d: 57.9 },
            { a: 24, d: 108.2 },
            { a: 34, d: 149.6 },
            { a: 44, d: 227.9 },
            { a: 62, d: 778.6 },
            { a: 82, d: 1433.0 },
            { a: 102, d: 2871.0 },
            { a: 120, d: 4495.0 }
        ];
        
        if (a <= refs[0].a) {
            const slope = (refs[1].d - refs[0].d) / (refs[1].a - refs[0].a);
            const dist = refs[0].d + slope * (a - refs[0].a);
            return Math.max(10, dist);
        }
        
        if (a >= refs[refs.length - 1].a) {
            const last = refs[refs.length - 1];
            const prev = refs[refs.length - 2];
            const slope = (last.d - prev.d) / (last.a - prev.a);
            return last.d + slope * (a - last.a);
        }
        
        for (let idx = 0; idx < refs.length - 1; idx++) {
            if (a >= refs[idx].a && a <= refs[idx+1].a) {
                const t = (a - refs[idx].a) / (refs[idx+1].a - refs[idx].a);
                return refs[idx].d + t * (refs[idx+1].d - refs[idx].d);
            }
        }
        return a * 4.4;
    };
    
    const realDistance = getAstrophysicalDistance(placementCurrentA);
    const distanceStr = realDistance >= 1000 ? 
        (realDistance / 1000).toFixed(3) + 'B km' : 
        realDistance.toFixed(1) + 'M km';
        
    const realDiameter = Math.round(size * 10600);
    const diameterStr = realDiameter.toLocaleString() + ' km';
    
    const realPeriodDays = Math.round(365.25 * (0.012 / speed));
    const periodStr = realPeriodDays >= 365 ? 
        (realPeriodDays / 365.25).toFixed(2) + ' years' : 
        realPeriodDays + ' days';

    const customPlanetConfig = {
        name: document.getElementById('const-name').value.trim() || 'Planet Genesis',
        size: size,
        a: placementCurrentA,
        e: e,
        i: i,
        speed: speed,
        color: color,
        orbitColor: color,
        texture: constructorPlanetData.texture,
        hasRings: constructorPlanetData.rings,
        type: 'Custom Planet',
        distance: distanceStr,
        diameter: diameterStr,
        period: periodStr
    };
    
    // Build and add the planet to Three.js scene
    const newPlanet = createPlanet(customPlanetConfig, placementCurrentTheta);
    
    // Re-build fleet selection dock to include new planet
    buildPlanetSelectionDock();
    
    // Auto-focus camera on the new planet for satisfying UX feedback!
    if (autopilotActive) toggleAutopilotMode();
    selectPlanet(newPlanet);
    
    // Exit placement mode
    exitPlacementMode();
};

// Destroy preview objects and unlock camera
const exitPlacementMode = () => {
    if (placementPreviewGroup) {
        placementPreviewGroup.remove(placementPreviewMesh);
        placementPreviewGroup.remove(placementPreviewOrbit);
        scene.remove(placementPreviewGroup);
    }
    
    placementPreviewMesh = null;
    placementPreviewOrbit = null;
    placementPreviewGroup = null;
    
    document.getElementById('placement-prompt').classList.add('hidden');
    controls.enabled = true;
    placementMode = false;
};

// Event Listeners for UI interaction
document.getElementById('btn-construct-panel').addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('constructor-panel');
    panel.classList.toggle('hidden');
    
    // If opening constructor, make sure to hide info-panel to prevent clutter
    if (!panel.classList.contains('hidden')) {
        document.getElementById('info-panel').classList.add('hidden');
        resetView();
    }
});

document.getElementById('btn-const-cancel').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('constructor-panel').classList.add('hidden');
});

// Sync slider movements with UI text values
const syncSliderVal = (sliderId, valId, suffix = '') => {
    const slider = document.getElementById(sliderId);
    const valElem = document.getElementById(valId);
    
    slider.addEventListener('input', () => {
        valElem.innerText = Number(slider.value).toFixed(sliderId === 'const-speed' ? 3 : (sliderId === 'const-ecc' ? 2 : 1)) + suffix;
        
        // Convert Preset select back to custom since values have been modified
        document.getElementById('const-preset').value = 'custom';
        
        // Update live data state
        const prop = sliderId.replace('const-', '');
        constructorPlanetData[prop === 'inc' ? 'i' : (prop === 'ecc' ? 'e' : prop)] = parseFloat(slider.value);
    });
};

syncSliderVal('const-size', 'val-const-size');
syncSliderVal('const-ecc', 'val-const-ecc');
syncSliderVal('const-inc', 'val-const-inc', '°');
syncSliderVal('const-speed', 'val-const-speed');

// Handle Color picker and texture updates
document.getElementById('const-color').addEventListener('change', (e) => {
    constructorPlanetData.color = e.target.value;
    document.getElementById('const-preset').value = 'custom';
});

document.getElementById('const-texture').addEventListener('change', (e) => {
    constructorPlanetData.texture = e.target.value;
    document.getElementById('const-preset').value = 'custom';
});

document.getElementById('const-rings').addEventListener('change', (e) => {
    constructorPlanetData.rings = e.target.checked;
    document.getElementById('const-preset').value = 'custom';
});

// Launch planet into placement mode
document.getElementById('btn-const-launch').addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Collect settings
    constructorPlanetData.name = document.getElementById('const-name').value.trim() || 'Planet Genesis';
    constructorPlanetData.size = parseFloat(document.getElementById('const-size').value);
    constructorPlanetData.e = parseFloat(document.getElementById('const-ecc').value);
    constructorPlanetData.i = parseFloat(document.getElementById('const-inc').value);
    constructorPlanetData.speed = parseFloat(document.getElementById('const-speed').value);
    constructorPlanetData.color = document.getElementById('const-color').value;
    constructorPlanetData.texture = document.getElementById('const-texture').value;
    constructorPlanetData.rings = document.getElementById('const-rings').checked;
    
    enterPlacementMode();
});

// Handle preset template cloning
document.getElementById('const-preset').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'custom') return;
    
    // Find static matching planet
    const preset = PLANET_DATA.find(p => p.name === val);
    if (!preset) return;
    
    // Auto-populate form elements
    document.getElementById('const-name').value = preset.name + ' Twin';
    
    document.getElementById('const-size').value = preset.size;
    document.getElementById('val-const-size').innerText = preset.size.toFixed(1);
    
    document.getElementById('const-ecc').value = preset.e;
    document.getElementById('val-const-ecc').innerText = preset.e.toFixed(2);
    
    document.getElementById('const-inc').value = preset.i;
    document.getElementById('val-const-inc').innerText = preset.i.toFixed(1) + '°';
    
    document.getElementById('const-speed').value = preset.speed;
    document.getElementById('val-const-speed').innerText = preset.speed.toFixed(3);
    
    const presetHexColor = hexToHtmlColor(preset.color);
    document.getElementById('const-color').value = presetHexColor;
    
    // Map texture filenames back to select values
    const textureName = preset.texture.substring(preset.texture.lastIndexOf('/') + 1).replace('.jpg', '').replace('1k', '');
    document.getElementById('const-texture').value = textureName;
    
    const isSaturn = preset.name === 'Saturn';
    document.getElementById('const-rings').checked = isSaturn;
    
    // Update data state
    constructorPlanetData = {
        name: preset.name + ' Twin',
        size: preset.size,
        e: preset.e,
        i: preset.i,
        speed: preset.speed,
        color: presetHexColor,
        texture: textureName,
        rings: isSaturn
    };
});

// Listen for mousemove, click and ESC key press for interactive placement
window.addEventListener('mousemove', (event) => {
    if (!placementMode) return;
    
    placementMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    placementMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    updatePlacementPreview();
});

window.addEventListener('click', (event) => {
    if (!placementMode) return;
    
    // Guard click if clicking on the placement overlay alert panel
    if (event.target.closest('#placement-prompt')) return;
    
    placePlanet();
});

// Cancel placement mode on ESC key press
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && placementMode) {
        exitPlacementMode();
        // Re-open constructor panel for convenience
        document.getElementById('constructor-panel').classList.remove('hidden');
    }
});

// Run Simulation
animate();
