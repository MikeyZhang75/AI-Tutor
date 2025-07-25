# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered tutoring mobile application built with Expo (React Native) and Elysia (Bun-based web framework). The app analyzes student solutions through image recognition and provides educational feedback.

### Current Features

- **Math Problem Solving**: Students can solve math problems by writing their solutions on a touch-enabled canvas
- **AI-Powered Analysis**: Solutions are analyzed using OpenAI's vision model to determine correctness
- **Real-time Feedback**: Modern modal-based feedback with success/error states and animations
- **Drawing Tools**: Canvas with clear, undo, and save functionality
- **Photo Library Integration**: Save drawings to device photo library for later reference
- **Question Set System**: Sequential question sets with background answer verification
- **Progress Tracking**: Persistent storage of user progress and answers across sessions
- **Asynchronous Verification**: Answers are verified in the background while users continue to next questions
- **Drawing Persistence**: User drawings are saved and restored when navigating between questions

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

## Architecture

### Frontend Structure (Expo/React Native)

- **Navigation**: File-based routing via Expo Router in `/app/`
  - `(tabs)/_layout.tsx` - Tab navigation layout
  - `(tabs)/index.tsx` - Home tab showing available question sets
  - `(tabs)/storage.tsx` - Storage debug tab for viewing saved progress data
    - Includes clipboard copy functionality to export storage data
  - `question-set/[id].tsx` - Question set detail and start screen
  - `question/[setId].tsx` - Individual question solving screen
  - `results/[setId].tsx` - Results screen showing scores and answer feedback
    - Live updates for pending verifications via progress polling
    - Dynamic score calculation as verifications complete
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
    - Undo button to remove the last drawn stroke
    - Save button to export drawings to device photo library (creates "AI Tutor Drawings" album)
    - Theme-aware styling and borders
    - Full-width responsive layout
    - Uses react-native-view-shot for image capture with base64 output
    - Supports ref forwarding with `captureCanvas`, `hasStrokes`, `clear`, and `getStrokes` methods
    - Integrates expo-media-library for photo saving functionality
    - Self-contained state management without external coupling
    - Supports loading initial strokes via `initialStrokes` prop for answer persistence
  - `Button` - UI component with consistent rounded corners (rounded-lg) across all size variants
  - `QuestionSetCard` - Card component for displaying question set info on home screen
  - `MathView` - Component for rendering LaTeX math formulas using KaTeX
    - Memoized with React.memo for performance optimization
    - Uses useMemo for expression processing and style generation to prevent unnecessary recalculations
    - Handles mixed text/LaTeX content with proper escaping and formatting
- **Hooks**: All hooks have been migrated to `/lib/` directory
  - `useColorScheme` - Returns object with colorScheme, isDarkColorScheme, setColorScheme, and toggleColorScheme
  - `useThemeColor` - Returns theme-aware colors based on current color scheme
  - `useVerificationPolling` - Manages polling for answer verification status in background
  - `useProgressPolling` - Polls for progress updates on results screen to show real-time verification status
- **Context**: State management for question flow
  - `QuestionContext` - Manages current question set state, progress, and answer submission
    - Uses reducer pattern with `questionReducer` for centralized state management
    - Provides actions for question navigation, answer submission, and progress tracking
    - Handles stroke persistence for drawing answers
    - Integrates with verification polling for background answer checks
    - Manages error states and loading indicators
- **Reducers**: State management logic in `/lib/reducers/`
  - `questionReducer` - Centralized state management for question flow
    - Handles all question-related state updates
    - Manages loading, error, and exit states
    - Updates progress and answer tracking
- **Storage**: Persistent data storage using AsyncStorage
  - `/lib/storage/progressStorage.ts` - Manages saving/loading user progress
  - `/lib/storage/mockStorage.ts` - Mock implementation for API responses
- **Services**: Business logic and API integration
  - `/lib/services/verificationService.ts` - Background answer verification with retry logic
    - Immediate verification start without queuing
    - Race condition prevention for status updates
- **Constants**: Design tokens in `/constants/Colors.ts`
- **Types**: TypeScript type definitions in `/types/`
  - `question.types.ts` - Types for questions, progress, and verification
    - Added `Stroke` and `Point` types for drawing persistence
    - Extended `Answer` type to include optional strokes array

### Backend Structure (Elysia API)

- **API Server**: `/api/index.ts` - Main API server with OpenAPI documentation
  - GET `/api/question-sets` - Retrieves all available question sets from database
  - GET `/api/question-sets/:id/questions` - Retrieves all questions for a specific question set
  - POST `/api/verify-solution` - Analyzes student solution images using OpenAI vision model
    - Returns both correctness status and feedback message in the response
  - GET `/api/swagger` - API documentation
  - Uses Zod schema validation for response parsing
- **Database**: Neon PostgreSQL integration with Drizzle ORM
  - `/database/neon.ts` - Database connection configuration
  - `/database/schema.ts` - Database schema definitions (question sets and questions tables)
  - `/drizzle.config.ts` - Drizzle configuration for migrations
- **Type-Safe Client**: `/eden/` directory contains Eden client for type-safe API calls
  - `/eden/clients/eden.client.ts` - Eden client instance
  - `/eden/services/analyse.service.ts` - Solution verification service
  - `/eden/services/question.service.ts` - Question set and questions fetching service

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
7. **Hooks Location**: All custom hooks should be in `/lib/` directory, not `/hooks/`
8. **Background Processing**: Answer verification happens asynchronously while users continue
   - Verification service manages retries and error handling
   - Progress is saved immediately to prevent data loss
   - Results are updated in storage when verification completes
9. **State Persistence**: All user progress is saved to AsyncStorage
   - Progress survives app restarts
   - Users can resume question sets from where they left off

## Important Notes

- The project uses Bun as the backend runtime - use `bun` commands for backend operations
- Biome is used for formatting/linting - prefer `bun run check:fix` over manual formatting
- The API server must be running (`bun run start:api`) before starting the Expo app
- Environment variables are required - check `/utils/env.ts` for required vars
- Database connection uses Neon PostgreSQL - requires `DATABASE_URL` environment variable
- All new components should support both light and dark themes using NativeWind's `dark:` variant
- Use NativeWind classes for styling - avoid creating new StyleSheet objects
- When adding new API endpoints, update both `/api/index.ts` and create corresponding Eden services
- The DrawingCanvas component uses react-native-svg for rendering strokes - ensure proper platform setup
- DrawingCanvas uses useRef for stable stroke references to prevent closure issues during gesture handling
- NativeWind v4 is configured with:
  - Custom theme colors matching the app's design system
  - Babel and Metro configuration for proper compilation
  - TypeScript support via nativewind-env.d.ts
- Question sets and questions are now loaded from PostgreSQL database instead of mock data
- Database schema uses snake_case for column names (e.g., `total_questions`, `estimated_time`)

## Git Workflow

- When user says "update changelog" or "generate changelog":
  1. Use `TZ=Australia/Melbourne git log --since="$(date +%Y-%m-%d) 00:00:00" --until="$(date +%Y-%m-%d) 23:59:59" --pretty=format:"%h - %s (%cr)" --reverse` to get commits for today (if no date specified)
  2. Or use `TZ=Australia/Melbourne git log --since="YYYY-MM-DD 00:00:00" --until="YYYY-MM-DD 23:59:59" --pretty=format:"%h - %s (%cr)" --reverse` if a specific date is provided
  3. Or use `TZ=Australia/Melbourne git log --pretty=format:"%h - %s (%ad)" --date=short-local` to see commits with dates
  4. Read the README.md file to understand the current changelog structure
  5. Organize commits by category: Features, Refactoring, Fixes, Build & Tooling, Style, Documentation
  6. Update the changelog section in README.md with the categorized commits
  7. Use clear, concise descriptions based on the commit messages
