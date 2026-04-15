# 3D Solar System Simulation

An interactive, high-fidelity 3D Solar System simulation built with **Three.js**, **Vite**, and **GSAP**. This project satisfies the requirements of a Computer Graphics course by demonstrating primitive shapes, hierarchical transformations, elliptical orbits (Keplerian mechanics), lighting, textures, and interactive camera controls.

## 🚀 Features

- **Interactive Selection**: Click any planet to smoothly zoom in and view detailed information.
- **Realistic Orbits**: Planets follow elliptical paths with real-world inclinations and variable orbital speeds (Kepler's Second Law).
- **Premium UI**: Glassmorphic info panels and a functional `lil-gui` for real-time scene manipulation.
- **Aesthetic Environment**: A subtle, elegant starfield and high-resolution celestial textures.
- **Rendering Modes**: Switch between Solid, Wireframe, and Points modes.

## 🛠 Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your system.

## 🏃 Running the Project

1. **Clone or Extract** the project directory.
2. **Open a terminal** in the project folder.
3. **Install all dependencies** (Vite, Three.js, GSAP, lil-gui):
   ```bash
   npm install
   ```
   *Note: If you are setting up a new project from scratch, you would install the core dependencies like this:*
   ```bash
   # Core 3D engine and utilities
   npm install three gsap lil-gui

   # Development tool (Vite)
   npm install --save-dev vite
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. **Open your browser** to the URL provided in the terminal (usually `http://localhost:5173`).

## 🎮 Controls

- **Mouse Drag**: Rotate the camera.
- **Mouse Wheel / Pinch**: Zoom in/out.
- **Click on Planet**: Smoothly zoom to the planet and show info.
- **'Close' Button**: Reset the camera to the global view.
- **GUI (Top Right)**: Adjust camera planes, rendering modes, and animation speeds.

## 📦 Tech Stack

- **Three.js**: 3D Engine.
- **Vite**: Rapid development environmental and build tool.
- **GSAP**: Smooth camera animations.
- **lil-gui**: Real-time control interface.
