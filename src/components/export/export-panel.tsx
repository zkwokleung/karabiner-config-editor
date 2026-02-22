'use client';

import { AlertCircle, Copy, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExportKeyboardPreview } from '@/components/export/export-keyboard-preview';
import type { ValidationError } from '@/lib/validation';
import type { KarabinerConfig } from '@/types/karabiner';

interface ExportPanelProps {
  config: KarabinerConfig;
  validationErrors: ValidationError[];
  onExport: () => void;
  onCopy: () => void;
  onConfigChange: (next: KarabinerConfig) => void;
}

export function ExportPanel({
  config,
  validationErrors,
  onExport,
  onCopy,
  onConfigChange,
}: ExportPanelProps) {
  const hasCriticalErrors = validationErrors.some(
    (e) => e.severity === 'error',
  );

  return (
    <div className='space-y-6'>
      {validationErrors.length > 0 && (
        <Card className='p-4'>
          <h3 className='font-semibold mb-3 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-500' />
            Validation Issues ({validationErrors.length})
          </h3>
          <ScrollArea className='max-h-[300px]'>
            <div className='space-y-2'>
              {validationErrors.map((error, index) => (
                <Alert
                  key={index}
                  variant={
                    error.severity === 'error' ? 'destructive' : 'default'
                  }
                  className={
                    error.severity === 'warning'
                      ? 'border-yellow-500 dark:border-yellow-600'
                      : ''
                  }
                >
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle className='text-sm font-medium'>
                    {error.severity === 'error' ? 'Error' : 'Warning'}:{' '}
                    {error.path}
                  </AlertTitle>
                  <AlertDescription className='text-xs'>
                    {error.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Export Config</h2>
        <div className='flex gap-4'>
          <Button onClick={onExport} disabled={hasCriticalErrors}>
            <Download className='mr-2 h-4 w-4' />
            Download JSON
          </Button>
          <Button onClick={onCopy} variant='outline'>
            <Copy className='mr-2 h-4 w-4' />
            Copy to Clipboard
          </Button>
        </div>
        {hasCriticalErrors && (
          <p className='text-sm text-destructive mt-2'>
            Fix all errors before exporting
          </p>
        )}
      </Card>

      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Keyboard Mapping Preview</h2>
        <ExportKeyboardPreview
          config={config}
          onConfigChange={onConfigChange}
        />
      </Card>

      <Card className='p-6'>
        <h2 className='text-lg font-semibold mb-4'>Preview</h2>
        <Textarea
          value={JSON.stringify(config, null, 2)}
          readOnly
          className='font-mono text-sm min-h-[400px]'
        />
      </Card>
    </div>
  );
}
