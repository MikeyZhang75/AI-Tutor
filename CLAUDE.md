# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered tutoring mobile application built with Expo (React Native) and Elysia (Bun-based web framework). The app analyzes student solutions through image recognition and provides educational feedback.

## Commands

### Development

```bash
# Install dependencies
bun install  # or npm install

# Start API server (with hot reload)
bun run start:api

# Start Expo development server
npm start

# Platform-specific development
npm run android  # Android development
npm run ios      # iOS development
npm run web      # Web development

# Format and lint code
bun run check:fix  # Run Biome formatter/linter with auto-fix
npm run lint       # Run ESLint
```

### Project Reset

```bash
npm run reset-project  # Reset to blank Expo project
```

## Architecture

### Frontend Structure (Expo/React Native)

- **Navigation**: File-based routing via Expo Router in `/app/`
  - `(tabs)/_layout.tsx` - Tab navigation layout
  - `(tabs)/index.tsx` - Home tab
  - `(tabs)/explore.tsx` - Explore tab
  - `(tabs)/draw.tsx` - Draw tab for handwritten input
- **Styling**: NativeWind v4 for utility-first styling
  - `tailwind.config.js` - Tailwind configuration with custom theme colors
  - `global.css` - Global styles import
  - All components use NativeWind classes instead of StyleSheet
  - Dark mode support via NativeWind's `dark:` variant
- **Components**: Themed components in `/components/` with dark/light mode support
  - All components use `ThemedView` and `ThemedText` for consistent theming
  - `ThemedView` and `ThemedText` support both NativeWind classes and custom colors
  - Platform-specific implementations use `.ios.tsx` or `.android.tsx` extensions
  - `DrawingCanvas` - Touch-enabled drawing component with:
    - Multi-stroke support with persistent storage
    - Smooth curve rendering using quadratic Bezier paths
    - Clear button to reset the canvas
    - Save button to export drawing as PNG to photo library
    - Theme-aware styling and borders
    - Uses react-native-view-shot for image capture
    - Uses expo-media-library for saving to device photo library
- **Hooks**: Custom hooks in `/hooks/` for theme management and shared logic
  - `useColorScheme` - Uses NativeWind's color scheme hook
- **Constants**: Design tokens in `/constants/Colors.ts`

### Backend Structure (Elysia API)

- **API Server**: `/api/index.ts` - Main API server with OpenAPI documentation
  - POST `/api/verify-solution` - Analyzes student solution images
  - GET `/api/swagger` - API documentation
- **Services**: `/api/services/ai.ts` - OpenAI integration for solution analysis
- **Type-Safe Client**: `/eden/` directory contains Eden client for type-safe API calls
  - `/eden/client.ts` - Eden client instance
  - `/eden/services/solutionService.ts` - Solution verification service

### Key Patterns

1. **Type Safety**: End-to-end type safety using Elysia Eden between frontend and backend
2. **Environment Variables**: Validated using envalid in `/utils/env.ts`
3. **Theme System**: Automatic dark/light mode with NativeWind and `useColorScheme` hook
4. **Styling**: Use NativeWind utility classes for all styling (no StyleSheet.create)
   - Use className prop for NativeWind classes
   - Use style prop only for dynamic values or when necessary
   - Theme colors defined in tailwind.config.js
5. **Platform-Specific Code**: Use `.ios.tsx` or `.android.tsx` extensions for platform-specific implementations
6. **API Communication**: Always use Eden client in `/eden/` for API calls, never direct fetch

## Important Notes

- The project uses Bun as the backend runtime - use `bun` commands for backend operations
- Biome is used for formatting/linting - prefer `bun run check:fix` over manual formatting
- The API server must be running (`bun run start:api`) before starting the Expo app
- Environment variables are required - check `/utils/env.ts` for required vars
- All new components should support both light and dark themes using NativeWind's `dark:` variant
- Use NativeWind classes for styling - avoid creating new StyleSheet objects
- When adding new API endpoints, update both `/api/index.ts` and create corresponding Eden services
- The DrawingCanvas component uses react-native-svg for rendering strokes - ensure proper platform setup
- DrawingCanvas uses useRef for stable stroke references to prevent closure issues during gesture handling
- NativeWind v4 is configured with:
  - Custom theme colors matching the app's design system
  - Babel and Metro configuration for proper compilation
  - TypeScript support via nativewind-env.d.ts

## Workflow Guidelines

- Whenever one task is completed, ask for approval to modify @CLAUDE.md

## Git Workflow

- When user says "commit", read all git changes and generate a commit message then commit
