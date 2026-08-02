# Validation and Limitations

## Validation Overview

The editor performs runtime checks before export. Validation returns:

- `error`: must be fixed before export
- `warning`: should be reviewed but does not block export

## Current Validation Rules

Implemented in `src/lib/validation.ts`:

- At least one profile must exist
- Profile name should not be empty
- Simple modification `from` must specify a valid source key field
- Complex rule must include at least one manipulator
- Manipulator `from` must be present and valid
- Missing `to*` actions are flagged as warnings
- Missing condition type is an error
- Duplicate simple mappings are detected per scope
- Conflicting complex manipulator sources are detected across rules

## Duplicate and Conflict Detection

### Simple Modifications

- Duplicate `from` keys are detected separately for:
  - profile-wide mappings
  - each device-specific mapping list

### Complex Modifications

- Potential conflicts are detected when multiple rules map the same source key
  with matching modifier signatures.

## Known Limitations

- Validation is intentionally lightweight and does not fully model every
  Karabiner schema edge case.
- Some advanced Karabiner constructs may require manual JSON review.
- Visual keyboard geometry follows Karabiner-Elements' ANSI, ISO, and JIS
  keyboard types. QWERTY, Dvorak, and Colemak are supported as independent
  logical legends; arbitrary split, ortholinear, gaming, and other custom
  physical geometries are not rendered.
- Legend selection is display-only. Karabiner `key_code` identities remain
  physical positions, so exported mappings do not change when the legend
  preference changes.
- No automated test suite is currently included.
- TypeScript errors are not enforced by Next build unless type-check is run
  explicitly (`pnpm exec tsc --noEmit`).

## Recommended Validation Procedure Before Applying Config

1. Run local checks:
   - `pnpm lint`
   - `pnpm format:check`
   - `pnpm exec tsc --noEmit`
   - `pnpm build`
2. Export JSON from UI.
3. Validate and test behavior incrementally in Karabiner-Elements.
