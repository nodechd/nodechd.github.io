# Knowledge Structure (SCHEME)

This repository uses a strict, boring hierarchy for the knowledge content to keep things consistent and easy to navigate.

Rules

- Top-level route: `/knowledge` (root index file is `public/knowledge/index.md`).
- Maximum depth: 3 path segments under `/knowledge` (topic → sub → sub-sub). Total levels: root + 3.
- Ordering prefix: use a three-digit prefix like `001-` to control order at every level. The prefix is ignored in labels and URLs.
- Filenames: lowercase letters, numbers, and hyphens only. Files must be `index.md` or `{name}.md` and may optionally start with a prefix like `001-overview.md`.
- Directory names: lowercase letters, numbers, and hyphens only, and may optionally start with a prefix like `001-platform`.
- Assets: place images or diagrams in `public/knowledge/<...>/assets/` and reference them by relative path in markdown (they will resolve to `/knowledge/...` URLs).

Examples

- `public/knowledge/index.md` → `/knowledge`
- `public/knowledge/001-platform/001-getting-started.md` → `/knowledge/platform/getting-started`
- `public/knowledge/002-tools/001-cli/001-overview.md` → `/knowledge/tools/cli/overview`

Why

- Small predictable surface area for navigation and static export.
- Easier automation to scan, index, and build site navigation.

If a file or folder doesn't match these rules it will be ignored by the site builder.
