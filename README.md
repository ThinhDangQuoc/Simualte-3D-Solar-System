# 3D Solar System Simulation

A high-performance, interactive 3D Solar System simulation built with Three.js, designed for a Computer Graphics course.

## Features
- **Hierarchical Motion**: Planets revolve around the Sun and moons revolve around planets.
- **Interactive UI**: Real-time control of rendering modes, lighting, shadows, and animation speeds using `lil-gui`.
- **Core CG Primitives**: Includes Sphere (planets), Cube, Cone, and Cylinder with configurable properties.
- **3D Model Loading**: Integrates external GLTF models.
- **Lighting & Shadows**: Ambient, Point (Sun), and Directional lighting with soft shadow mapping.
- **Affine Transformations**: Keyboard-based manipulation (W/A/S/D/Q/E/R/F) for objects in the scene.

## Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm (v7+)

## How to Run Locally

1.  **Extract/Clone** the project files to a local directory.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**: Navigate to `http://localhost:5173` (or the port shown in your terminal).

## Interaction Controls
- **Mouse**: Orbit (Left Click), Zoom (Scroll), Pan (Right Click).
- **Keyboard (on Cube)**:
    - `W / S`: Move Forward/Backward (Z-axis).
    - `A / D`: Move Left/Right (X-axis).
    - `Q / E`: Rotate around Y-axis.
    - `R / F`: Scale Up/Down.
- **GUI (Top Right)**: Toggle Rendering Mode, Textures, Lighting, Shadows, and Speeds.
# Simualte-3D-Solar-System
