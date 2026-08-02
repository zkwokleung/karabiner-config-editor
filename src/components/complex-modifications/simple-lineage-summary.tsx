'use client';

import { Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Manipulator, Profile } from '@/types/karabiner';
import {
  getCharacterWithKeyCodeLabel,
  type KeyboardLegendType,
} from '@/lib/keyboard-layout';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import {
  resolveSimpleModificationLineage,
  type KeyIdentity,
} from '@/lib/simple-modification-lineage';
import { cn } from '@/lib/utils';

interface SimpleLineageSummaryProps {
  profile: Profile;
  manipulator: Manipulator;
  deviceLabelLookup: Map<number, string>;
  className?: string;
}

export function SimpleLineageSummary({
  profile,
  manipulator,
  deviceLabelLookup,
  className,
}: SimpleLineageSummaryProps) {
  const { keyboardTypeV2, legendType } = useKeyboardLayout();
  const lineage = resolveSimpleModificationLineage(profile, manipulator);
  const affectedScopes =
    lineage?.scopes.filter((scope) => scope.affected) || [];

  if (!lineage || affectedScopes.length === 0) return null;

  return (
    <div
      className={cn(
        'space-y-1.5 rounded-md border border-sky-500/20 bg-sky-500/5 p-2.5',
        className,
      )}
    >
      <div className='flex items-center gap-1.5 text-xs font-medium text-foreground'>
        <Route className='h-3.5 w-3.5 text-sky-600' />
        Simple modification lineage
      </div>
      {affectedScopes.map((scope) => {
        const scopeLabel =
          scope.label ??
          (scope.kind === 'device'
            ? deviceLabelLookup.get(scope.deviceIndex ?? -1) ||
              `Device ${(scope.deviceIndex ?? 0) + 1}`
            : profile.devices?.length
              ? 'All other devices'
              : 'All devices');

        return (
          <div
            key={`${scope.kind}-${scope.deviceIndex ?? 'profile'}`}
            className='flex flex-wrap items-center gap-1.5 text-xs'
          >
            <span className='mr-1 text-muted-foreground'>{scopeLabel}:</span>
            {scope.physicalSources.length > 0 ? (
              scope.physicalSources.map((source) => (
                <Badge
                  key={`${source.field}:${source.value}`}
                  variant='outline'
                  className='font-mono text-[11px]'
                >
                  {formatIdentity(source, keyboardTypeV2, legendType)}
                </Badge>
              ))
            ) : (
              <span className='italic text-muted-foreground'>
                no physical source
              </span>
            )}
            <span className='text-muted-foreground'>→ post-simple</span>
            <Badge variant='secondary' className='font-mono text-[11px]'>
              {formatIdentity(
                lineage.postSimpleInput,
                keyboardTypeV2,
                legendType,
              )}
            </Badge>
          </div>
        );
      })}
      <p className='text-[11px] text-muted-foreground'>
        One pass only; simple mappings are not recursively chained.
      </p>
    </div>
  );
}

function formatIdentity(
  identity: KeyIdentity,
  keyboardType: 'ansi' | 'iso' | 'jis',
  legendType: KeyboardLegendType,
): string {
  const keyLabel = getCharacterWithKeyCodeLabel(
    identity.value,
    keyboardType,
    legendType,
  );
  if (identity.field === 'key_code') return keyLabel;
  return `${keyLabel} · ${IDENTITY_FIELD_LABELS[identity.field]}`;
}

const IDENTITY_FIELD_LABELS: Record<
  Exclude<KeyIdentity['field'], 'key_code'>,
  string
> = {
  consumer_key_code: 'consumer',
  pointing_button: 'pointing',
  apple_vendor_top_case_key_code: 'top case',
  apple_vendor_keyboard_key_code: 'Apple keyboard',
  generic_desktop: 'generic desktop',
};
