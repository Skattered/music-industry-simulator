# Music Industry Simulator

An idle/incremental game where you're an AI music creator progressing from zero to total music industry domination. Build your empire through increasingly sophisticated AI tools and questionable business practices.

## 🎵 About

This game explores the intersection of AI, capitalism, and music creation. Starting with basic AI tools and a few dollars, you'll build a music empire that eventually controls the entire industry. The game is a satirical reflection on content volume over quality and industry exploitation mechanics.

**Target Play Time:** 8-12 hours  
**Complexity:** Easy to understand, linear progression  
**Theme:** Building an AI music empire through increasingly gross capitalist tactics

## 🎮 Gameplay Overview

- **Generate Songs**: Use AI to create music that generates passive income from streams
- **Upgrade Technology**: Progress through 7+ tech tiers from web services to custom AI agents
- **Exploit Systems**: Unlock marketing, physical sales, concerts, and industry monopolies
- **Prestige System**: Start new artists with bonuses while legacy artists continue earning
- **Industry Control**: Fill the progress bar to 100% and dominate the music industry

## 📖 Documentation

- **[Game Design](game-details.md)** - Complete game design document with mechanics and progression
- **[Technical Specification](tech-details.md)** - Implementation details and architecture
- **[Agent Guide](AGENTS.md)** - Comprehensive guide for AI agents building this project

## 🛠️ Technology Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4+
- **Build Tool**: Vite 6.x
- **Testing**: Vitest 2.x + @testing-library/svelte 5.x
- **Deployment**: GitHub Pages via static site generation

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

```bash
# Clone the repository
git clone https://github.com/Skattered/music-industry-simulator.git
cd music-industry-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

```bash
# Type check
npm run check

# Build static site
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 Development

This project uses Svelte 5's new runes system (`$state`, `$derived`, `$effect`) for reactive state management. All game state is stored in the browser's localStorage - no backend required.

### Key Principles

- **Client-side only**: No server, no database, no authentication
- **Svelte 5 Runes**: Modern reactivity with `$state`, `$derived`, `$effect`
- **TypeScript strict mode**: Full type safety throughout
- **Minimal dependencies**: Lean and focused on core functionality
- **10 TPS game loop**: Frame-independent logic using deltaTime

### Project Structure

```
src/
├── routes/              # SvelteKit pages
├── lib/
│   ├── game/           # Core game engine and state
│   ├── systems/        # Game mechanics (songs, income, etc.)
│   ├── components/     # Svelte UI components
│   └── data/           # Word lists and content
```

## 🤝 Contributing

This project is designed to be built collaboratively by AI agents. See [AGENTS.md](AGENTS.md) for the complete implementation guide.

### Multi-Agent Workflow

1. Check [AGENTS.md](AGENTS.md) for module assignments
2. Create an issue with appropriate label (`system:songs`, `ui:component`, etc.)
3. Work only on assigned files to avoid conflicts
4. Submit focused PRs with one feature each
5. Wait for review before merging

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Status

This is an active development project. The game design and technical specifications are complete. Implementation is in progress.

### Roadmap

- [x] Game design documentation
- [x] Technical architecture specification  
- [x] AI agent implementation guide
- [ ] Core game loop and engine
- [ ] Song generation system
- [ ] Tech progression and upgrades
- [ ] Prestige/reset mechanics
- [ ] Physical albums and tours
- [ ] Industry monopoly systems
- [ ] UI components and polish
- [ ] Testing and deployment

## 🎨 Features

### Phase 1: Streaming (Early Game)
- Song generation with queue system
- Passive income from streams
- Tech upgrades reduce costs and generation time
- Bot streams and playlist placement

### Phase 2: Physical Sales (Mid Game)
- Album releases with variants
- Limited editions and artificial scarcity
- Merch bundles and re-releases

### Phase 3: Tours & Concerts (Mid-Late Game)
- Automated tour system
- Ticket scalping and dynamic pricing
- Venue ownership

### Phase 4: Platform Ownership (Late Game)
- Own streaming platforms
- Control the algorithm
- Buy Billboard and Grammys

### Phase 5: Total Automation (End Game)
- AI agents manage everything
- Training data monopolies
- 100% industry control = Victory!

## 💡 Development Notes

- Game uses mad-lib style name generation for songs and artists
- All state persists in localStorage with backup system
- Export/import saves for manual backups
- Offline progress can be added as enhancement
- Target: 70%+ test coverage on game logic

## 📞 Questions?

For implementation questions:
1. Check the [Game Design](game-details.md) document
2. Review the [Technical Specification](tech-details.md)
3. Read the [Agent Guide](AGENTS.md)
4. Create a GitHub issue with appropriate labels

---

**Remember**: When in doubt, check if you're using Svelte 5 runes correctly - that's the #1 source of confusion! 🎵