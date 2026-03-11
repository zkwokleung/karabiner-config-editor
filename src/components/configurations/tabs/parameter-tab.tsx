import {
  PARAMETER_FIELDS,
  PROFILE_PARAMETER_DEFAULTS,
  type ProfileParameterKey,
} from '@/components/configurations/constants';
import { ParameterInputField } from '@/components/configurations/fields/parameter-input-field';
import { Card } from '@/components/ui/card';
import type { Parameters } from '@/types/karabiner';

interface ParameterTabProps {
  profileParameters: Parameters;
  onProfileParameterChange: (
    key: ProfileParameterKey,
    value: number | undefined,
  ) => void;
}

export function ParameterTab({
  profileParameters,
  onProfileParameterChange,
}: ParameterTabProps) {
  const basicFields = PARAMETER_FIELDS.filter(
    (field) => field.section === 'basic',
  );
  const mouseMotionFields = PARAMETER_FIELDS.filter(
    (field) => field.section === 'mouse-motion-to-scroll',
  );

  return (
    <Card className='p-4 space-y-6'>
      <div>
        <h3 className='text-sm font-semibold'>Profile Parameters</h3>
        <p className='text-sm text-muted-foreground'>
          Tune timing and behavior for complex modifications in this profile.
        </p>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>Basic Parameters</h4>
        <div className='space-y-3'>
          {basicFields.map((field) => (
            <ParameterInputField
              key={field.id}
              id={field.id}
              label={field.label}
              description={field.description}
              step={field.step}
              unitLabel={field.unitLabel}
              defaultValue={PROFILE_PARAMETER_DEFAULTS[field.key]}
              value={profileParameters[field.key]}
              onValueChange={(value) =>
                onProfileParameterChange(field.key, value)
              }
            />
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>
          Mouse Motion to Scroll Parameters
        </h4>
        <div className='space-y-3'>
          {mouseMotionFields.map((field) => (
            <ParameterInputField
              key={field.id}
              id={field.id}
              label={field.label}
              description={field.description}
              step={field.step}
              unitLabel={field.unitLabel}
              defaultValue={PROFILE_PARAMETER_DEFAULTS[field.key]}
              value={profileParameters[field.key]}
              onValueChange={(value) =>
                onProfileParameterChange(field.key, value)
              }
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
