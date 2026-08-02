'use client';

import type React from 'react';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Braces,
  Command,
  FilePlus,
  Github,
  HardDrive,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ProfileManager } from '@/components/profile/profile-manager';
import { KeyboardLayoutProvider } from '@/components/keyboard/keyboard-layout-context';
import type { KarabinerConfig } from '@/types/karabiner';
import type { KeyboardLayoutType } from '@/lib/keyboard-layout';
import { validateConfig, type ValidationError } from '@/lib/validation';
import { createMinimalKarabinerConfig } from '@/lib/default-config';
import { ExportPanel } from '@/components/export/export-panel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePersistedConfig } from '@/hooks/use-persisted-config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  'https://karabiner-config-editor.vercel.app';

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Karabiner Config Editor',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description:
    'Visual editor for Karabiner-Elements configuration files, including profile mappings, complex modifications, validation, and export.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Karabiner Config Editor used for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It helps you import, edit, validate, and export Karabiner-Elements configurations without manually editing karabiner.json.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I edit complex modifications visually?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The editor includes a complex modification builder with templates and validation checks before export.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool support existing karabiner.json files?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can upload or paste an existing karabiner.json file, edit it in the UI, and export it again.',
      },
    },
  ],
};

function normalizeConfigShape(value: unknown): KarabinerConfig {
  const config =
    typeof value === 'object' && value !== null
      ? (value as Partial<KarabinerConfig>)
      : {};

  return {
    ...config,
    global: config.global ?? {},
    profiles: Array.isArray(config.profiles) ? config.profiles : [],
  } as KarabinerConfig;
}

function getSelectedProfileKeyboardType(
  config: KarabinerConfig | null,
): KeyboardLayoutType {
  if (
    !config ||
    !Array.isArray(config.profiles) ||
    config.profiles.length === 0
  ) {
    return 'ansi';
  }

  const selectedProfile = config.profiles.find((profile) => profile.selected);
  const fallbackProfile = config.profiles[0];
  const keyboardType =
    selectedProfile?.virtual_hid_keyboard?.keyboard_type_v2 ??
    fallbackProfile?.virtual_hid_keyboard?.keyboard_type_v2;

  return keyboardType ?? 'ansi';
}

export default function KarabinerEditor() {
  const { resolvedTheme, setTheme } = useTheme();
  const {
    config,
    setConfig,
    discardDraft,
    hasStoredDraft,
    isHydrated,
    recoveredFromStorage,
    savedAt,
    storageError,
  } = usePersistedConfig(normalizeConfigShape);
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState('import');
  const [isDefaultConfirmationOpen, setIsDefaultConfirmationOpen] =
    useState(false);
  const validationErrors = useMemo<ValidationError[]>(
    () => (config ? validateConfig(config) : []),
    [config],
  );
  const { toast } = useToast();
  const selectedProfileKeyboardType = getSelectedProfileKeyboardType(config);

  useEffect(() => {
    if (recoveredFromStorage) {
      setActiveTab('edit');
    }
  }, [recoveredFromStorage]);

  const updateConfig = (newConfig: KarabinerConfig) => {
    setConfig(newConfig);
  };

  const handleDiscardDraft = () => {
    if (!discardDraft()) {
      return;
    }

    setJsonInput('');
    setActiveTab('import');
    toast({
      title: 'Local draft discarded',
      description: 'The saved config was removed from this browser.',
    });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = normalizeConfigShape(JSON.parse(content));
        updateConfig(parsed);
        setJsonInput(JSON.stringify(parsed, null, 2));
        setActiveTab('edit');
        toast({
          title: 'Config loaded',
          description: 'Successfully loaded Karabiner config file',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Invalid JSON file',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const applyDefaultConfig = () => {
    const minimalConfig = createMinimalKarabinerConfig();
    updateConfig(minimalConfig);
    setJsonInput(JSON.stringify(minimalConfig, null, 2));
    setActiveTab('edit');
    toast({
      title: 'Default config ready',
      description: 'Loaded a minimal Karabiner config to get you started.',
    });
  };

  const handleStartWithDefault = () => {
    if (config) {
      setIsDefaultConfirmationOpen(true);
      return;
    }

    applyDefaultConfig();
  };

  const handleJsonPaste = () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste a config first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const parsed = normalizeConfigShape(JSON.parse(jsonInput));
      updateConfig(parsed);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setActiveTab('edit');
      toast({
        title: 'Config loaded',
        description: 'Successfully parsed JSON config',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Invalid JSON format. Please check your syntax.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    if (!config) return;

    const criticalErrors = validationErrors.filter(
      (e) => e.severity === 'error',
    );
    if (criticalErrors.length > 0) {
      toast({
        title: 'Cannot export',
        description: 'Please fix all errors before exporting',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karabiner.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Config exported',
      description: 'Downloaded karabiner.json',
    });
  };

  const handleCopy = () => {
    if (!config) return;

    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({
      title: 'Copied',
      description: 'Config copied to clipboard',
    });
  };

  return (
    <div className='min-h-screen bg-background bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_32rem)]'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Toaster />

      <AlertDialog
        open={isDefaultConfirmationOpen}
        onOpenChange={setIsDefaultConfirmationOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace the current config?</AlertDialogTitle>
            <AlertDialogDescription>
              Starting with the default config will replace the config open in
              the editor and its saved local draft. This cannot be undone after
              the replacement is saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current config</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={applyDefaultConfig}
            >
              Replace with default
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className='sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl'>
        <div className='container mx-auto flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-3'>
            <Image
              src='/app-icon.png'
              alt=''
              width={48}
              height={48}
              priority
              className='h-11 w-11 rounded-[14px] shadow-md ring-1 ring-black/10 dark:ring-white/10'
            />
            <div>
              <h1 className='text-base font-semibold tracking-tight text-foreground sm:text-lg'>
                Karabiner Config Editor
              </h1>
              <p className='hidden text-xs text-muted-foreground sm:block'>
                See every remap before it reaches your keyboard.
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              asChild
              variant='outline'
              size='icon'
              className='rounded-xl bg-background/70'
            >
              <a
                href='https://github.com/zkwokleung/karabiner-config-editor'
                target='_blank'
                rel='noreferrer noopener'
                aria-label='Open GitHub repository'
              >
                <Github className='h-5 w-5' />
              </a>
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={toggleTheme}
              className='rounded-xl bg-background/70'
              aria-label='Toggle color theme'
            >
              <Moon className='h-5 w-5 dark:hidden' />
              <Sun className='hidden h-5 w-5 dark:block' />
            </Button>
          </div>
        </div>
      </header>

      <main className='container mx-auto max-w-7xl px-4 py-8 sm:py-10'>
        <section className='mb-8 grid items-center gap-8 overflow-hidden rounded-3xl border border-border/70 bg-card/75 p-6 shadow-sm backdrop-blur-sm md:grid-cols-[1.25fr_0.75fr] md:p-10'>
          <div className='max-w-2xl'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
              <ShieldCheck className='h-3.5 w-3.5' />
              Visual, validated, reversible
            </div>
            <h2 className='text-balance text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl'>
              Remap with confidence,
              <span className='text-primary'> not guesswork.</span>
            </h2>
            <p className='mt-4 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base'>
              Turn Karabiner’s JSON into a workspace you can see. Build
              profiles, trace complex rules, catch conflicts, and export a clean
              config.
            </p>
          </div>

          <div className='relative mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-6 shadow-inner'>
            <div className='absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-primary/10 via-primary/50 to-emerald-400/50' />
            <div className='relative grid h-20 w-24 place-items-center rounded-2xl border border-primary/30 bg-primary/10 shadow-sm'>
              <div className='text-center'>
                <Command className='mx-auto mb-1 h-5 w-5 text-primary' />
                <span className='font-mono text-[10px] font-semibold uppercase tracking-wider text-primary'>
                  caps lock
                </span>
              </div>
            </div>
            <div className='relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-background shadow-sm'>
              <ArrowRight className='h-4 w-4 text-primary' />
            </div>
            <div className='relative grid h-20 w-24 place-items-center rounded-2xl border border-emerald-400/40 bg-emerald-400/10 shadow-sm'>
              <div className='text-center'>
                <Braces className='mx-auto mb-1 h-5 w-5 text-emerald-500' />
                <span className='font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                  hyper
                </span>
              </div>
            </div>
          </div>
        </section>

        {isHydrated && storageError && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <span>{storageError}</span>
              {!config && hasStoredDraft && (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='shrink-0'
                  onClick={handleDiscardDraft}
                >
                  Remove unreadable draft
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isHydrated && config && hasStoredDraft && (
          <div className='mb-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3'>
              <HardDrive className='mt-0.5 h-4 w-4 shrink-0 text-primary' />
              <div>
                <p className='text-sm font-medium text-foreground'>
                  {recoveredFromStorage
                    ? 'Local draft restored'
                    : 'Config saved locally'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {savedAt
                    ? `Saved ${new Date(savedAt).toLocaleString()}`
                    : 'Changes are kept in this browser for your next visit.'}
                </p>
              </div>
            </div>
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='shrink-0'
              onClick={handleDiscardDraft}
            >
              Discard local draft
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='mx-auto mb-8 grid h-10 w-full max-w-xl grid-cols-3 rounded-2xl border border-border/70 bg-card/80 p-1 shadow-sm'>
            <TabsTrigger
              value='import'
              className='h-full cursor-pointer rounded-xl py-0 leading-none'
            >
              Import
            </TabsTrigger>
            <TabsTrigger
              value='edit'
              disabled={!config}
              className='h-full cursor-pointer rounded-xl py-0 leading-none'
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value='export'
              disabled={!config}
              className='h-full cursor-pointer rounded-xl py-0 leading-none'
            >
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value='import' className='space-y-6'>
            <Card className='border-primary/15 bg-card/90 p-6 shadow-sm'>
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-2'>
                  <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <FilePlus className='h-5 w-5 text-primary' />
                    Start with a clean config
                  </h2>
                </div>
                <Button onClick={handleStartWithDefault} className='shrink-0'>
                  Start editing
                </Button>
              </div>
            </Card>

            <Card className='bg-card/90 p-6 shadow-sm'>
              <h2 className='mb-1 text-lg font-semibold'>Open your config</h2>
              <p className='mb-4 text-sm text-muted-foreground'>
                Import your existing file and keep every profile intact.
              </p>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                  <input
                    type='file'
                    accept='.json'
                    onChange={handleFileUpload}
                    className='hidden'
                    id='file-upload'
                  />
                  <label htmlFor='file-upload'>
                    <Button asChild variant='outline'>
                      <span className='cursor-pointer'>
                        <Upload className='mr-2 h-4 w-4' />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <span className='text-sm text-muted-foreground'>
                    Upload your karabiner.json file
                  </span>
                </div>
              </div>
            </Card>

            <Card className='bg-card/90 p-6 shadow-sm'>
              <h2 className='mb-1 text-lg font-semibold'>Paste JSON</h2>
              <p className='mb-4 text-sm text-muted-foreground'>
                Useful for quick edits, reviews, and config snippets.
              </p>
              <div className='space-y-4'>
                <Textarea
                  placeholder='Paste your Karabiner config JSON here...'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className='font-mono text-sm min-h-[300px]'
                />
                <Button onClick={handleJsonPaste}>Load Config</Button>
              </div>
            </Card>
          </TabsContent>

          <KeyboardLayoutProvider keyboardTypeV2={selectedProfileKeyboardType}>
            <TabsContent value='edit'>
              {config && (
                <ProfileManager config={config} setConfig={updateConfig} />
              )}
            </TabsContent>

            <TabsContent value='export'>
              {config && (
                <ExportPanel
                  config={config}
                  validationErrors={validationErrors}
                  onExport={handleExport}
                  onCopy={handleCopy}
                  onConfigChange={updateConfig}
                />
              )}
            </TabsContent>
          </KeyboardLayoutProvider>
        </Tabs>
      </main>
    </div>
  );
}
