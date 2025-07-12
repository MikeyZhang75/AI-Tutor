# Commit Command

Run below todo list.

1. Run `bun run check:fix` to ensure code quality and fix linting/formatting issues
2. Run `bun run check-types` to verify no TypeScript errors exist
3. Add all files by `git add -A`
4. Read all git changes with `git diff --staged`
5. Update @CLAUDE.md documentation based on the changed files' code:
   - **ALWAYS** check if changes include:
     - New navigation routes or screens in `/app/`
     - New components in `/components/`
     - New hooks, contexts, or services in `/lib/`
     - New storage mechanisms or types
     - New API endpoints or services
     - Changes to existing architectural patterns
   - If ANY of the above are true, you MUST update the relevant sections in CLAUDE.md
   - Even if unsure, err on the side of updating the documentation
   - Review the existing CLAUDE.md structure to ensure new items are added to the correct sections
6. Add the updated @CLAUDE.md to git with `git add @CLAUDE.md`
7. Generate a descriptive commit message based on the changes
8. Commit changes with the generated message
