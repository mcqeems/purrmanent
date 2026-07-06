// ponytail: shadcn CLI generates components importing `cn` from `@/lib/utils`
// (per components.json's `utils` alias). The project's real implementation
// lives at `@/lib/utils/cn` — re-export it here so vendor files resolve
// without patching every generated component.
export { cn } from './utils/cn';
