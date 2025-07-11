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
- **Components**: Themed components in `/components/` with dark/light mode support
  - All components use `ThemedView` and `ThemedText` for consistent theming
  - Platform-specific implementations use `.ios.tsx` or `.android.tsx` extensions
- **Hooks**: Custom hooks in `/hooks/` for theme management and shared logic
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
3. **Theme System**: Automatic dark/light mode with `useColorScheme` hook
4. **Platform-Specific Code**: Use `.ios.tsx` or `.android.tsx` extensions for platform-specific implementations
5. **API Communication**: Always use Eden client in `/eden/` for API calls, never direct fetch

## Important Notes

- The project uses Bun as the backend runtime - use `bun` commands for backend operations
- Biome is used for formatting/linting - prefer `bun run check:fix` over manual formatting
- The API server must be running (`bun run start:api`) before starting the Expo app
- Environment variables are required - check `/utils/env.ts` for required vars
- All new components should support both light and dark themes using `useThemeColor`
- When adding new API endpoints, update both `/api/index.ts` and create corresponding Eden services

## Workflow Guidelines

- Whenever one task is completed, ask for approval to modify @CLAUDE.md