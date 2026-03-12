import type { Parameters } from '@/types/karabiner';

export const PROFILE_PARAMETER_DEFAULTS: Required<Parameters> = {
  'basic.simultaneous_threshold_milliseconds': 500,
  'basic.to_delayed_action_delay_milliseconds': 500,
  'basic.to_if_alone_timeout_milliseconds': 1000,
  'basic.to_if_held_down_threshold_milliseconds': 500,
  'mouse_motion_to_scroll.speed': 100,
};

export const MOUSE_KEY_XY_SCALE_DEFAULT = 100;

export type ProfileParameterKey = keyof Parameters;

export interface ParameterFieldDefinition {
  id: string;
  key: ProfileParameterKey;
  label: string;
  description: string;
  step: number;
  unitLabel?: string;
  section: 'basic' | 'mouse-motion-to-scroll';
}

export const PARAMETER_FIELDS: ParameterFieldDefinition[] = [
  {
    id: 'param-simultaneous-threshold',
    key: 'basic.simultaneous_threshold_milliseconds',
    label: 'Simultaneous Key Press Threshold',
    description:
      'Maximum interval allowed between key presses for Karabiner to treat them as a simultaneous chord.',
    step: 10,
    unitLabel: 'ms',
    section: 'basic',
  },
  {
    id: 'param-delayed-action-delay',
    key: 'basic.to_delayed_action_delay_milliseconds',
    label: 'Delayed Action Delay',
    description:
      'Wait time before executing to_delayed_action when a delayed action is configured in a manipulator.',
    step: 10,
    unitLabel: 'ms',
    section: 'basic',
  },
  {
    id: 'param-to-if-alone-timeout',
    key: 'basic.to_if_alone_timeout_milliseconds',
    label: 'Tap Timeout',
    description:
      'Maximum time a key can be held and still trigger to_if_alone behavior.',
    step: 100,
    unitLabel: 'ms',
    section: 'basic',
  },
  {
    id: 'param-to-if-held-down-threshold',
    key: 'basic.to_if_held_down_threshold_milliseconds',
    label: 'Hold Threshold',
    description:
      'Minimum hold duration before to_if_held_down behavior is triggered.',
    step: 10,
    unitLabel: 'ms',
    section: 'basic',
  },
  {
    id: 'param-mouse-motion-speed',
    key: 'mouse_motion_to_scroll.speed',
    label: 'Scroll Conversion Speed',
    description:
      'Multiplier used when converting mouse motion to scroll events; higher values scroll faster.',
    step: 10,
    unitLabel: '%',
    section: 'mouse-motion-to-scroll',
  },
];
