import type {
  KarabinerConfig,
  Profile,
  Rule,
  Manipulator,
} from '@/types/karabiner';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validates a complete Karabiner configuration
 * Returns array of validation errors/warnings
 */
export function validateConfig(config: KarabinerConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate profiles exist
  if (!config.profiles || config.profiles.length === 0) {
    errors.push({
      path: 'profiles',
      message: 'At least one profile is required',
      severity: 'error',
    });
    return errors;
  }

  // Validate each profile
  config.profiles.forEach((profile, profileIndex) => {
    errors.push(...validateProfile(profile, profileIndex));
  });

  return errors;
}

/**
 * Validates a single profile
 */
function validateProfile(profile: Profile, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `profiles[${index}]`;

  // Validate profile name
  if (!profile.name || profile.name.trim() === '') {
    errors.push({
      path: `${path}.name`,
      message: 'Profile name cannot be empty',
      severity: 'error',
    });
  }

  // Validate simple modifications
  if (profile.simple_modifications) {
    profile.simple_modifications.forEach((mod, modIndex) => {
      if (
        !mod.from?.key_code &&
        !mod.from?.consumer_key_code &&
        !mod.from?.pointing_button
      ) {
        errors.push({
          path: `${path}.simple_modifications[${modIndex}].from`,
          message: 'From key must be specified',
          severity: 'error',
        });
      }
    });
  }

  // Validate complex modifications
  if (profile.complex_modifications?.rules) {
    profile.complex_modifications.rules.forEach((rule, ruleIndex) => {
      errors.push(
        ...validateRule(
          rule,
          `${path}.complex_modifications.rules[${ruleIndex}]`,
        ),
      );
    });
  }

  return errors;
}

/**
 * Validates a complex modification rule
 */
function validateRule(rule: Rule, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate rule description
  if (!rule.description || rule.description.trim() === '') {
    errors.push({
      path: `${path}.description`,
      message: 'Rule description should not be empty',
      severity: 'warning',
    });
  }

  // Validate manipulators
  if (!rule.manipulators || rule.manipulators.length === 0) {
    errors.push({
      path: `${path}.manipulators`,
      message: 'Rule must have at least one manipulator',
      severity: 'error',
    });
  } else {
    rule.manipulators.forEach((manipulator, manipulatorIndex) => {
      errors.push(
        ...validateManipulator(
          manipulator,
          `${path}.manipulators[${manipulatorIndex}]`,
        ),
      );
    });
  }

  return errors;
}

/**
 * Validates a manipulator
 */
function validateManipulator(
  manipulator: Manipulator,
  path: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate from event
  if (!manipulator.from) {
    errors.push({
      path: `${path}.from`,
      message: 'From event is required',
      severity: 'error',
    });
  } else {
    if (
      !manipulator.from.key_code &&
      !manipulator.from.consumer_key_code &&
      !manipulator.from.pointing_button
    ) {
      errors.push({
        path: `${path}.from`,
        message:
          'From event must specify key_code, consumer_key_code, or pointing_button',
        severity: 'error',
      });
    }
  }

  // Validate at least one to event exists
  const hasToEvent =
    manipulator.to ||
    manipulator.to_if_alone ||
    manipulator.to_if_held_down ||
    manipulator.to_after_key_up;

  if (!hasToEvent) {
    errors.push({
      path: `${path}`,
      message:
        "Manipulator should have at least one 'to' event (to, to_if_alone, to_if_held_down, or to_after_key_up)",
      severity: 'warning',
    });
  }

  // Validate conditions
  if (manipulator.conditions) {
    manipulator.conditions.forEach((condition, conditionIndex) => {
      if (!condition.type) {
        errors.push({
          path: `${path}.conditions[${conditionIndex}].type`,
          message: 'Condition type is required',
          severity: 'error',
        });
      }
    });
  }

  return errors;
}

/**
 * Checks for duplicate key mappings in simple modifications
 */
export function findDuplicateSimpleModifications(profile: Profile): string[] {
  const duplicates: string[] = [];
  const seen = new Set<string>();

  profile.simple_modifications?.forEach((mod) => {
    const key =
      mod.from.key_code ||
      mod.from.consumer_key_code ||
      mod.from.pointing_button;
    if (key) {
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    }
  });

  return duplicates;
}

/**
 * Checks for conflicting manipulators (same from key with same modifiers)
 * Returns array of conflict descriptions
 */
export function findConflictingManipulators(rules: Rule[]): string[] {
  const conflicts: string[] = [];
  const seen = new Map<
    string,
    { ruleIndex: number; manipulatorIndex: number; ruleDescription: string }
  >();

  rules.forEach((rule, ruleIndex) => {
    rule.manipulators.forEach((manipulator, manipulatorIndex) => {
      // Create a unique key for this manipulator based on from event
      const fromKey =
        manipulator.from.key_code ||
        manipulator.from.consumer_key_code ||
        manipulator.from.pointing_button;
      const mandatory =
        manipulator.from.modifiers?.mandatory?.sort().join('+') || '';
      const optional =
        manipulator.from.modifiers?.optional?.sort().join('+') || '';
      const uniqueKey = `${fromKey}|${mandatory}|${optional}`;

      if (seen.has(uniqueKey)) {
        const previous = seen.get(uniqueKey)!;
        // Same rule with same key is valid if conditions differ
        if (previous.ruleIndex !== ruleIndex) {
          const modifierText = mandatory
            ? ` + ${mandatory.replace(/\+/g, ' + ')}`
            : '';
          conflicts.push(
            `"${fromKey}${modifierText}" is mapped in both "${previous.ruleDescription}" (rule ${previous.ruleIndex + 1}) and "${rule.description || 'Unnamed rule'}" (rule ${ruleIndex + 1}). This may cause unexpected behavior.`,
          );
        }
      } else {
        seen.set(uniqueKey, {
          ruleIndex,
          manipulatorIndex,
          ruleDescription: rule.description || 'Unnamed rule',
        });
      }
    });
  });

  return conflicts;
}
