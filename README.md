# create-react-ts

Scaffold a React + TypeScript + Vite app with ESLint, Prettier, Vitest, Husky, and commitlint already wired in.

## Usage

```bash
npx github:ideaspaper/create-react-ts my-app
```

The CLI copies the bundled `template/` directory into your new project and then updates the generated package name.

If you are working directly inside the bundled `template/` folder in this repository, run `npm install` there before using any npm scripts. The checked-in template does not include `node_modules`.

## What you get

- React 19 + Vite 8 + TypeScript 6
- ESLint 9 with TypeScript, React Hooks, import ordering, and Prettier integration
- Vitest 4 + Testing Library + jsdom 29
- Husky, lint-staged, and commitlint
- Path alias support via `@/`

## Generated app commands

- `npm run dev` starts the dev server
- `npm run build` creates a production build
- `npm run typecheck` runs TypeScript project references
- `npm run lint` checks lint rules
- `npm run lint:fix` fixes autofixable lint issues
- `npm run test` runs the test suite
- `npm run test:coverage` runs tests with coverage
- `npm run check` runs lint, tests, and build together
