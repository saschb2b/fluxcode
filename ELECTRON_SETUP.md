# Electron Desktop Build Guide

This guide explains how to build desktop applications for Windows and Linux (including Steam Deck) using Electron.

## Prerequisites

1. **Node.js**: Ensure Node.js 18+ is installed
2. **Platform-specific tools**:
   - **Windows**: No additional tools required
   - **Linux**: `sudo apt-get install rpm` (for building on Linux)
   - **Cross-platform builds**: Build on the target platform for best results

## Installation

Install all dependencies:

\`\`\`bash
npm install
\`\`\`

## Development

Run the app in development mode:

\`\`\`bash
npm run electron:dev
\`\`\`

This will:
1. Start the Next.js dev server on port 3000
2. Wait for the server to be ready
3. Launch Electron with live reload

## Building for Production

### Build for Current Platform

\`\`\`bash
npm run electron:build
\`\`\`

### Build for Specific Platforms

**Windows only:**
\`\`\`bash
npm run electron:build:win
\`\`\`

**Linux only:**
\`\`\`bash
npm run electron:build:linux
\`\`\`

**Both platforms:**
\`\`\`bash
npm run electron:build:all
\`\`\`

## Output Files

Built applications are located in `dist-electron/`:

### Windows
- `Fluxcode Battle Game Setup X.X.X.exe` - Installer (NSIS)
- `Fluxcode Battle Game X.X.X.exe` - Portable version

### Linux
- `fluxcode-battle-game-X.X.X.AppImage` - Universal Linux binary (recommended for Steam Deck)
- `fluxcode-battle-game_X.X.X_amd64.deb` - Debian package
- `fluxcode-battle-game-X.X.X.tar.gz` - Tar archive

## Steam Distribution

### Recommended Build Targets

1. **Windows**: Use the NSIS installer (`*.exe`)
2. **Linux/Steam Deck**: Use the AppImage (`*.AppImage`)

### Steam Deck Specific Notes

- Steam Deck runs SteamOS (Arch Linux based)
- AppImage format works out of the box
- Test on Steam Deck gaming mode for best compatibility
- The app uses hardware acceleration for WebGL/Three.js

### Adding to Steam

1. Build your artifacts using `npm run electron:build:all`
2. Upload to Steamworks:
   - Navigate to your app's build page
   - Upload Windows build from `dist-electron/win-unpacked/`
   - Upload Linux build from `dist-electron/linux-unpacked/`
3. Set launch options in Steamworks for each platform
4. Test using Steam's testing tools

## Steam SDK Integration (Optional)

To integrate Steam features (achievements, leaderboards, overlay):

1. Install Steam SDK wrapper:
\`\`\`bash
npm install steamworks.js
\`\`\`

2. Initialize in `electron/main.js`:
\`\`\`javascript
const steamworks = require('steamworks.js');

if (app.isPackaged) {
  try {
    const client = steamworks.init(YOUR_STEAM_APP_ID);
    console.log('Steam initialized:', client.localplayer.getName());
  } catch (err) {
    console.error('Steam init failed:', err);
  }
}
\`\`\`

3. Expose Steam APIs through IPC in `electron/preload.js`

## Optimization Tips

### Performance
- Three.js renders using hardware acceleration by default
- If you encounter GPU issues on Steam Deck, uncomment the `app.disableHardwareAcceleration()` line in `electron/main.js`

### Bundle Size
- Current build includes only necessary files
- Consider code splitting for larger apps
- Images are already optimized with `unoptimized: true` in Next.js config

### Testing on Steam Deck
1. Enable SSH on Steam Deck
2. Transfer AppImage to Steam Deck
3. Make executable: `chmod +x *.AppImage`
4. Run directly or add to Steam as non-Steam game
5. Test in both Desktop and Gaming modes

## Troubleshooting

### "Module not found" errors
Ensure all dependencies are installed:
\`\`\`bash
npm install
\`\`\`

### Build fails on Linux
Install required system packages:
\`\`\`bash
sudo apt-get install rpm
\`\`\`

### WebGL not working
- Check if hardware acceleration is enabled
- Update graphics drivers
- Test in development mode first

### App won't start
- Check console logs in development mode
- Ensure Next.js build completed successfully
- Verify `out/` directory exists and contains index.html

## Multi-Platform Support Summary

You now have three build targets:
- **Mobile (Android)**: Use Capacitor (`npm run android`)
- **Desktop (Windows)**: Use Electron (`npm run electron:build:win`)
- **Desktop (Linux/Steam Deck)**: Use Electron (`npm run electron:build:linux`)

Each platform uses the same Next.js codebase but packages it differently for optimal performance.
