# AI Tutor

## Introduction

AI Tutor is an innovative mobile application that leverages artificial intelligence to provide personalized educational support. Built with React Native (Expo) and powered by advanced AI models, this app helps students learn more effectively through interactive problem-solving and real-time feedback.

## Roadmap

### Question Set Workflow

- [x] Users will answer questions in sequential sets
- [x] Real-time background verification of submitted answers
- [x] Seamless progression through questions without waiting for results
- [x] Database updates happen asynchronously as users progress
- [x] By the time users complete all questions, most answers will already be verified

### Key Features

1. [x] **Sequential Question Sets**: Questions presented one at a time with smooth transitions
2. [x] **Background Processing**: Answer verification happens silently while users continue
3. [x] **Progress Tracking**: Database reflects verification status in real-time
4. [x] **Optimized UX**: No waiting screens - users can focus on answering questions

## Changelog

### 2025-07-12

- Features:
  - Implement complete question set workflow with background verification
  - Add SafeAreaView to all screens for proper safe area handling
  - Integrate Neon PostgreSQL database for question sets
  - Implement drawing persistence and improve question navigation
- Refactoring:
  - Simplify DrawingCanvas component and button hover states
  - Streamline question navigation and submission flow
  - Simplify question navigation by removing questionId from route
  - Remove analyse tab and disable pull-to-refresh across all screens
- Fixes:
  - Replace StyleSheet with NativeWind classes in MathView and disable zoom gestures
  - Prevent question set reloading during exit and optimize MathView performance
- Style:
  - Standardize button rounded corners to rounded-lg

### 2025-07-11

- Features:
  - Initial AI-powered tutoring app with Expo frontend and Elysia backend
  - Drawing functionality with touch-enabled canvas
  - Save functionality to export drawings to device photo library
  - Copy button for DrawingCanvas with clipboard functionality
  - Transform draw tab into analyse tab with math problem solving
  - Undo button to replace save/copy buttons in DrawingCanvas
  - LaTeX math rendering for mathematical expressions
  - Improved drawing canvas UX with placeholder text
- Refactoring:
  - Migrate entire project to NativeWind v4 for utility-first styling
  - Update API response structure and rename mathpix service
  - Add React Native Reusables components
  - Migrate hooks from @hooks to @lib directory
  - Simplify DrawingCanvas component and button hover states
- Fixes:
  - Replace StyleSheet with NativeWind classes in MathView
  - Disable zoom gestures in MathView
- Build & Tooling:
  - Add pre-commit linting step to git workflow
  - Add API compilation script and ignore dist directory
- Style:
  - Standardize button rounded corners to rounded-lg across all components
