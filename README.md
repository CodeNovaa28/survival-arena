# 🎮 Zone Breach

<div align="center">

![Zone Breach](https://img.shields.io/badge/Zone%20Breach-3D%20Survival%20Arena-red?style=for-the-badge&logo=gamepad)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=threedotjs)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A fast-paced 3D top-down survival arena shooter built with React Three Fiber.**
Survive waves of enemies, unlock powerful weapons, and dominate the arena across six unique maps.

[▶ Play Now](#installation) · [📖 Gameplay](#-gameplay-overview) · [🎮 Controls](#-controls) · [🗺️ Roadmap](#-future-plans)

</div>

---

## 📸 Overview

Zone Breach drops you into a relentless survival arena where each wave brings deadlier enemies. Master a growing arsenal of ranged and melee weapons, recruit AI companions, and fight through story-driven levels or endlessly grind for supremacy. Earn coins, gems, and rewards every day — then spend them on unlockable skins, maps, and gear.

---

## ✨ Features

### 🎯 Core Gameplay
- 🌊 **Wave-based survival** — enemies scale in difficulty with every wave
- 💥 **Multiple enemy types** — Chasers, Ranged, Speeders, Tanks, and Bombers
- 🗡️ **Melee combat** — get up close with swords, axes, and more
- 🔫 **Diverse arsenal** — Pistol, Burst Pistol, Assault Rifle, SMG, Shotgun, Sniper Rifle, Plasma Cannon, Minigun, Trident, and more
- ⚡ **Power-ups** — speed boosts, shields, rapid fire, and health pickups mid-wave
- 🤖 **AI Companions** — recruit allies that fight alongside you

### 🗺️ Game Modes
- 📖 **Story Mode** — progress through handcrafted levels with narrative cutscenes
- ♾️ **Endless Mode** — survive as long as you can with increasing difficulty
- 🎯 **Practice Mode** — sharpen your aim and movement without pressure

### 🌍 Maps
Six fully unique arenas to master:
| Map | Theme |
|-----|-------|
| 🏙️ Urban Arena | City streets and cover |
| 🧊 Ice Fortress | Slippery frozen stronghold |
| 🏜️ Desert Ruins | Ancient ruined landscape |
| 🌋 Volcano Crater | Molten environment |
| 🌑 Shadow Realm | Dark and eerie dimension |
| 🌆 Neon City | Cyberpunk cityscape |

### 🎨 Customization
- 🧑 **Character Skins** — Soldier, Shadow, Neon Striker, Crimson Guard, Arctic Wolf, Toxic, Gold Commander, Phantom, Inferno, Phoenix, War Commander, Cyber Runner, Ghost Squad, and more
- 🔫 **Weapon Skins** — cosmetic overlays for your favourite guns
- 🗡️ **Melee Weapons** — unlock and equip different melee options

### 💰 Progression & Economy
- 🪙 **Coins & 💎 Gems** — dual currency system earned through gameplay
- 📅 **Daily Rewards** — log in every day to claim escalating prizes
- 📋 **Daily Quests** — three fresh objectives every 24 hours
- 🎰 **Spin Wheel** — try your luck for bonus rewards
- 🔓 **Unlockables** — maps, skins, and weapons gated behind currency and progression
- 🏆 **Progression System** — level up and unlock new content as you play

---

## 🎮 Gameplay Overview

You spawn in a closed arena and face endless waves of enemies. Between waves you have a short breather to collect drops, activate power-ups, and reposition. Defeat enough enemies to trigger a **secret portal** that warps you to a hidden bonus level. Companions fight autonomously at your side, and melee finishers let you close the gap when ammo is scarce.

Coins and gems drop from enemies and chests on the map. Spend them in the **Customization Hub** to unlock new skins, the **map store** for new arenas, or blow them on the **Spin Wheel** for a chance at rare rewards.

---

## 🕹️ Controls

| Action | Input |
|--------|-------|
| Move | `W` `A` `S` `D` |
| Aim | Mouse cursor |
| Shoot | Left Mouse Button |
| Melee attack | `F` |
| Pause | `Escape` |
| Use ability | `Q` |

> 🎯 Aim is always relative to your mouse position — click toward an enemy to fire.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| ⚛️ **React 19** | UI framework & component tree |
| 🟦 **TypeScript 5.9** | Type-safe codebase |
| ⚡ **Vite 7** | Blazing-fast dev server & bundler |
| 🎲 **React Three Fiber** | Declarative Three.js for React |
| 🌐 **@react-three/drei** | R3F helpers (controls, shaders, etc.) |
| 🐻 **Zustand** | Global game state management |
| 💨 **Tailwind CSS** | HUD and menu styling |
| 🧩 **shadcn/ui** | UI component primitives |

---

## 🚀 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+

### Clone & Run

```bash
# Clone the repository
git clone https://github.com/CodeNovaa28/survival-arena.git
cd survival-arena

# Install dependencies
pnpm install

# Start the development server
pnpm --filter @workspace/3d-game run dev
```

Then open your browser at the address shown in the terminal (default: `http://localhost:PORT`).

### Build for Production

```bash
pnpm --filter @workspace/3d-game run build
```

---

## 🗺️ Future Plans

- [ ] 🌐 **Online multiplayer** — co-op and PvP arena modes
- [ ] 📱 **Mobile support** — touch controls and responsive layout
- [ ] 🗺️ **Map editor** — create and share custom arenas
- [ ] 🏆 **Leaderboards** — global and friends-only high score boards
- [ ] 🧬 **More enemy types** — bosses, swarms, and elite variants
- [ ] 🎵 **Dynamic soundtrack** — adaptive music that reacts to combat intensity
- [ ] 🌟 **Season pass** — limited-time exclusive skins and challenges
- [ ] 💾 **Cloud saves** — sync progression across devices

---

## 📄 License

```
MIT License

Copyright (c) 2026 Zone Breach Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

Made with ❤️ and ☕ · Built with React Three Fiber

⭐ Star this repo if you enjoy the game!

</div>
