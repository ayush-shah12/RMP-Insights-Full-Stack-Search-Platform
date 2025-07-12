# React UI for Chrome Extension

This is a **refactored and cleaner version** of the original vanilla JavaScript frontend, rebuilt in **React with TypeScript**. The functionality remains the same, but the code is now more maintainable, type-safe, and follows modern React patterns.

## What This Is

- **Refactored version** of the legacy `frontend-legacy/` directory
- **Same functionality** as the original extension
- **React + TypeScript** for better code organization and type safety
- **Modern component architecture** with proper state management
- **Improved caching system** that matches the legacy implementation

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
cd frontend-react
npm install
```

### Development Server
```bash
npm start
```
This runs the app as a web application for development and testing.

## Building for Chrome Extension

### Build Command
```bash
npm run build
```

This command:
1. **Compiles TypeScript** to JavaScript
2. **Bundles React components** 
3. **Copies manifest.json** and other necessary extension files into build/ 
4. **Prepares the extension** for Chrome loading

### Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `frontend-react/build/` folder
5. The extension will appear in your extensions list
6. Click the extension icon to test

## Testing

### As Chrome Extension
- Build with `npm run build`
- Load the `build/` folder in Chrome extensions
- Test all functionality including school search

### As Web App
- Run `npm start` for development server
- **Important**: Comment out the Chrome API call in `SchoolSelector.tsx` to prevent crashes

#### Chrome API Fix for Web Testing
In `frontend-react/src/components/SchoolSelector.tsx`, find this line:
```typescript
fetch(chrome.runtime.getURL("schools.json"))
```

And comment it out or replace with:
```typescript
// fetch(chrome.runtime.getURL("schools.json")) // Chrome API - crashes in web
fetch("/schools.json") // Web-compatible version
```