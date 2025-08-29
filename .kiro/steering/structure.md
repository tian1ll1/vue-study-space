# Project Structure

## Root Directory Organization
```
├── src/                 # Main source code
├── public/              # Static assets served directly
├── dist/                # Build output (generated)
├── .kiro/               # Kiro IDE configuration and specs
├── .vscode/             # VS Code workspace settings
└── node_modules/        # Dependencies (generated)
```

## Source Code Structure (`src/`)
```
src/
├── components/          # Reusable Vue components
├── views/               # Page-level components and route views
│   └── modules/         # Learning module components
├── composables/         # Composition API reusable logic
├── stores/              # Pinia state management stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── router/              # Vue Router configuration
├── assets/              # Static assets (images, styles)
├── examples/            # Code examples and exercises
├── App.vue              # Root application component
└── main.ts              # Application entry point
```

## Key Architectural Patterns

### Component Organization
- **components/**: Generic, reusable components (CodeEditor, AppLayout, ModuleCard)
- **views/**: Page-specific components that correspond to routes
- **views/modules/**: Learning module components (BasicSyntax, Reactivity, etc.)

### Composition API Structure
- **composables/**: Shared reactive logic (useCodeEditor, useProgress)
- Use `use*` naming convention for composables
- Export composables as named exports

### State Management
- **stores/**: Pinia stores for global state
- One store per domain (progress, examples, user settings)
- Use `defineStore` with setup syntax

### Type Safety
- **types/**: Centralized TypeScript definitions
- Interface naming: PascalCase (e.g., `LearningProgress`)
- Separate types by domain (router.ts, progress.ts)

### Routing Convention
- Route paths match learning module progression
- Nested routes for sub-modules when needed
- Route components in `views/` directory

## File Naming Conventions
- **Components**: PascalCase (e.g., `CodeEditor.vue`, `ModuleCard.vue`)
- **Views**: PascalCase (e.g., `Home.vue`, `CompositionAPI.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useCodeEditor.ts`)
- **Stores**: camelCase (e.g., `progress.ts`, `examples.ts`)
- **Types**: camelCase (e.g., `router.ts`, `progress.ts`)
- **Utils**: camelCase (e.g., `progressVerification.ts`)

## Import Path Conventions
- Use `@/` alias for src imports: `import { useProgress } from '@/composables/useProgress'`
- Relative imports for same-directory files
- Group imports: Vue/framework first, then libraries, then local imports