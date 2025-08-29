# Technology Stack

## Core Framework
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety and better developer experience
- **Vite** as the build tool and development server

## Key Dependencies
- **Vue Router 4** for client-side routing
- **Pinia** for state management
- **Monaco Editor** for interactive code editing
- **@monaco-editor/loader** for Monaco integration

## Development Tools
- **ESLint** with Vue and TypeScript configurations
- **Prettier** for code formatting (single quotes, no semicolons, 100 char width)
- **Vue DevTools** plugin for debugging

## Build Configuration
- Node.js version: ^20.19.0 || >=22.12.0
- Module type: ESM
- Path alias: `@` points to `src/` directory
- TypeScript project references for better compilation

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run preview      # Preview production build locally
```

### Build & Type Checking
```bash
npm run build        # Full production build with type checking
npm run build-only   # Build without type checking
npm run type-check   # Run TypeScript compiler check
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

## Code Style Standards
- 2-space indentation
- Single quotes for strings
- No semicolons
- 100 character line limit
- LF line endings
- UTF-8 encoding
- Trailing newlines required