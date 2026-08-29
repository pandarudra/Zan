# Project Development Rules

## Before Writing Code

- Always analyze the existing codebase before making changes.
- Understand the current architecture, routing, state management, styling system, and reusable components.
- Do not rewrite existing working architecture unnecessarily.
- Reuse existing components, hooks, utilities, types, and dependencies whenever possible.

## UI Development

- Rebuild the provided UI as accurately as possible.
- Prioritize visual hierarchy, spacing, alignment, typography, responsiveness, and interaction details.
- Follow the existing design system and component patterns.
- Avoid unnecessary abstraction.
- Avoid creating components that are only used once unless they improve readability.
- Keep components focused and reasonably sized.
- Do not add dependencies unless absolutely necessary.

## Code Quality

- Use TypeScript correctly.
- Avoid any unless unavoidable.
- Keep business logic separate from presentation logic.
- Avoid duplicate code.
- Prefer existing utilities and patterns.
- Keep files organized according to the existing project architecture.
- Do not introduce a new architecture without a clear reason.

## State Management

- Reuse the existing state management solution.
- For UI-only work, mock API behavior where appropriate.
- Keep API integration points clearly separated from mock implementations.
- Do not introduce global state unless multiple parts of the application genuinely need it.

## Validation

- Use the existing validation library and patterns.
- Do not duplicate validation logic.

## Before Completing Work

- Review the changed files.
- Remove dead code.
- Remove unused imports.
- Check TypeScript errors.
- Check responsive behavior.
- Ensure accessibility is not degraded.
- Keep the implementation as simple as possible.

## Important

Before implementing a task:

1. Analyze the relevant code.
2. Explain the implementation plan briefly.
3. Identify reusable code.
4. Only then make changes.

Do not immediately start rewriting files without understanding the existing implementation.
