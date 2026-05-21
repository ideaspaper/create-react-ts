# create-react-ts

Scaffold a modern React + TypeScript + Vite app with configurable extras instead of one fixed setup.

## What the base starter includes

- React 19 + Vite 8 + TypeScript 6
- ESLint flat config with TypeScript, React Hooks, React Refresh, and import sorting
- Prettier as a separate formatter
- Vitest + Testing Library + jsdom
- `@/` imports via Vite's native tsconfig path support

## Presets

- `minimal` — core toolchain only
- `standard` — core toolchain + coverage support
- `team` — coverage + `simple-git-hooks` + `commitlint` + Playwright

Default preset: `standard`

## Usage

```bash
npx github:ideaspaper/create-react-ts my-app
```

### Common examples

```bash
# Lean starter
npx github:ideaspaper/create-react-ts my-app --preset minimal

# Default starter with pnpm-flavoured docs
npx github:ideaspaper/create-react-ts my-app --pm pnpm

# Team-oriented setup, then install immediately
npx github:ideaspaper/create-react-ts my-app --preset team --pm pnpm --install

# Pick features manually
npx github:ideaspaper/create-react-ts my-app \
  --hooks husky \
  --commitlint \
  --coverage \
  --vitest-ui \
  --e2e playwright
```

## CLI options

- `--preset <minimal|standard|team>`
- `--pm <npm|pnpm|yarn>`
- `--hooks <none|simple-git-hooks|husky>`
- `--commitlint` / `--no-commitlint`
- `--coverage` / `--no-coverage`
- `--vitest-ui` / `--no-vitest-ui`
- `--e2e <none|playwright>`
- `--playwright` shortcut for `--e2e playwright`
- `--install` install dependencies after scaffolding
- `--git` / `--no-git` initialize a git repository
- `-h, --help`
- `-v, --version`

## Notes

- No lockfile is bundled in the template.
- Git is initialized automatically when hooks are enabled.
- The generated app README is customized to the selected package manager and enabled features.
- If you enable Playwright, run the generated `test:e2e:install` script once to download browsers.
