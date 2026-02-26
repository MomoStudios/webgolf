# Web Golf 🏌️

A mini-golf web game prototype built with Three.js and Rapier.js physics.

## Features

- **3D Mini Golf Course**: Single hole with obstacles and walls
- **Realistic Physics**: Ball physics powered by Rapier.js WASM
- **Slingshot Controls**: Drag from ball to aim, release to putt
- **Visual Feedback**: Dotted aim line shows direction and power
- **Mobile Friendly**: Touch controls for mobile devices
- **Low-poly Art Style**: Flat shading with bold colors

## Tech Stack

- **Three.js** - 3D rendering and graphics
- **Rapier.js** - WASM physics simulation
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## How to Play

1. **Aim**: Drag back from the white ball to aim your shot
2. **Power**: The further you drag, the more power you apply
3. **Putt**: Release to hit the ball
4. **Goal**: Get the ball into the black hole in as few strokes as possible

## Controls

- **Mouse**: Click and drag from ball to aim and shoot
- **Touch**: Tap and drag from ball to aim and shoot (mobile)

The aim line color indicates power:
- 🟢 Green: Low power
- 🟡 Yellow: Medium power  
- 🔴 Red: High power

## Project Structure

```
src/
├── main.ts          # Entry point and game loop
├── scene.ts         # Three.js scene setup
├── physics.ts       # Rapier.js physics world
├── course.ts        # Golf course geometry
├── ball.ts          # Ball mesh and behavior
├── controls.ts      # Input handling (mouse/touch)
├── ui.ts            # UI elements (stroke counter, messages)
└── types.ts         # TypeScript type definitions
```

## Development

The game uses a component-based architecture:

- **SceneManager**: Handles Three.js rendering, camera, and lights
- **PhysicsManager**: Manages Rapier.js physics world and bodies
- **Course**: Creates visual geometry for the golf course
- **ControlsManager**: Handles mouse/touch input for aiming
- **UIManager**: Manages on-screen UI elements

## License

MIT License - feel free to use this code for your own projects!