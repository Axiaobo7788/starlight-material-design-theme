# Design Collaboration Workflow

This folder keeps the project from drifting into generic template UI.

## Roles

- Gemini: Material Design 3 visual reviewer.
- Codex: repository implementer and verification runner.
- User: final design judge.

## Files

- `MATERIAL_BRIEF.md`: product and design goal.
- `TOKEN_CONTRACT.md`: rules for MD3 tokens, state layers, shape, density, and motion.
- `SELECTOR_MAP.md`: Starlight selector and file map.
- `VISUAL_CHECKLIST.md`: review checklist and required Gemini output format.
- `COMPONENT_STATUS.md`: current module status.
- `DECISIONS.md`: accepted and proposed design decisions.

## First Review Target

Start with Sidebar and TOC.

Generate the Gemini packet:

```sh
node scripts/context-sidebar.mjs > /tmp/sidebar-context.md
```

Send Gemini:

- `/tmp/sidebar-context.md`
- the listed screenshot files from `tests/theme-screenshots.spec.ts-snapshots/`

Ask Gemini to review only Sidebar and TOC unless a broader review is requested.

## Patch Rule

Gemini should produce a patch spec, not full code.

Codex will then:

1. select the parts that match the project constraints
2. apply a small patch
3. run validation
4. update screenshots if the visual change is intentional
5. record accepted decisions in `DECISIONS.md`
