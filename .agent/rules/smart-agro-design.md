# Smart-Agro Design Rules (always follow)

- Never change routes, API calls, auth logic, state management, i18n keys (EN/HI/GU), or business logic. Visual layer only.
- Stack stays: React, Tailwind, Framer Motion, AOS, Chart.js, lucide-react. No heavy new libraries.
- Always Planning mode: produce an Implementation Plan artifact and wait for my approval before editing files.
- After every phase: run `npm run build` and the linter, fix all errors and warnings, and produce a Walkthrough artifact with screenshots.
- Visual verification is mandatory. Use the browser agent on the running dev server and screenshot at 320, 375, 768, 1024, 1440 px, in light and dark mode. Attach screenshots to the artifact. Never claim a UI is fixed without a screenshot.
- Zero horizontal overflow from 320 to 1920 px.
- Search the codebase before deleting or renaming anything. No new console warnings.
- Reuse the shared glass utilities. No duplicated style blobs.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Commit-sized changes: touch only the files the current phase needs.