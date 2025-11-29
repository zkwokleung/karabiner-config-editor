'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ComplexModificationsEditor } from '@/components/complex-modifications-editor';
import type { KarabinerConfig, Profile, Rule } from '@/types/karabiner';
import type { DeviceTargetOption } from '@/types/profile';
import { SimpleModificationsEditor } from '@/components/profile/simple-modifications-editor';
import { ProfileFnKeysEditor } from '@/components/profile/profile-fn-keys-editor';
import { buildDeviceLabelLookup } from '@/components/profile/utils';

interface ProfileManagerProps {
  config: KarabinerConfig;
  setConfig: (config: KarabinerConfig) => void;
}

export function ProfileManager({ config, setConfig }: ProfileManagerProps) {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProfileIndex >= config.profiles.length) {
      setSelectedProfileIndex(Math.max(0, config.profiles.length - 1));
    }
  }, [config.profiles.length, selectedProfileIndex]);

  const selectedProfile = config.profiles[selectedProfileIndex];

  const deviceLabelLookup = useMemo(() => {
    return buildDeviceLabelLookup(selectedProfile?.devices);
  }, [selectedProfile?.devices]);

  const deviceOptions = useMemo<DeviceTargetOption[]>(() => {
    const options: DeviceTargetOption[] = [
      {
        label: 'All devices',
        value: 'profile',
        target: { type: 'profile' },
      },
    ];

    deviceLabelLookup.forEach((label, index) => {
      options.push({
        label,
        value: `device-${index}`,
        target: { type: 'device', deviceIndex: index },
      });
    });

    return options;
  }, [deviceLabelLookup]);

  if (!selectedProfile) {
    return null;
  }

  const replaceProfile = (nextProfile: Profile) => {
    const profiles = config.profiles.map((profile, index) =>
      index === selectedProfileIndex ? nextProfile : profile,
    );
    setConfig({ ...config, profiles });
  };

  const updateProfile = (updater: (profile: Profile) => Profile) => {
    const nextProfile = updater(selectedProfile);
    replaceProfile(nextProfile);
  };

  const updateProfileName = (name: string) => {
    updateProfile((profile) => ({
      ...profile,
      name,
    }));
  };

  const addProfile = () => {
    const newProfile: Profile = {
      name: `Profile ${config.profiles.length + 1}`,
      selected: false,
      simple_modifications: [],
      fn_function_keys: [],
      devices: [],
      complex_modifications: {
        rules: [],
      },
    };

    setConfig({
      ...config,
      profiles: [...config.profiles, newProfile],
    });

    setSelectedProfileIndex(config.profiles.length);

    toast({
      title: 'Profile added',
      description: 'New profile created successfully',
    });
  };

  const deleteProfile = (index: number) => {
    if (config.profiles.length === 1) {
      toast({
        title: 'Cannot delete',
        description: 'At least one profile is required',
        variant: 'destructive',
      });
      return;
    }

    const nextProfiles = config.profiles.filter(
      (_, profileIndex) => profileIndex !== index,
    );
    setConfig({ ...config, profiles: nextProfiles });
    setSelectedProfileIndex(Math.max(0, index - 1));

    toast({
      title: 'Profile deleted',
      description: 'Profile removed successfully',
    });
  };

  const updateComplexModifications = (rules: Rule[]) => {
    updateProfile((profile) => ({
      ...profile,
      complex_modifications: {
        ...(profile.complex_modifications ?? { parameters: {}, rules: [] }),
        rules,
      },
    }));
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[250px_1fr]'>
      <Card className='p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold text-sm'>Profiles</h3>
          <Button
            size='sm'
            variant='outline'
            className='cursor-pointer bg-transparent h-8 w-8 p-0'
            onClick={addProfile}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
        <ScrollArea className='lg:h-[500px]'>
          <div className='space-y-2'>
            {config.profiles.map((profile, index) => (
              <div
                key={profile.name ?? index}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProfileIndex === index
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedProfileIndex(index)}
              >
                <span className='text-sm font-medium truncate'>
                  {profile.name}
                </span>
                {config.profiles.length > 1 && (
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-6 w-6'
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteProfile(index);
                    }}
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className='p-6'>
        <Tabs defaultValue='simple' className='w-full'>
          <div className='space-y-4 mb-6'>
            <div className='space-y-2'>
              <Label htmlFor='profile-name'>Profile Name</Label>
              <Input
                id='profile-name'
                value={selectedProfile.name}
                onChange={(event) => updateProfileName(event.target.value)}
                placeholder='Profile name'
              />
            </div>
          </div>

          <TabsList className='grid w-full grid-cols-3 mb-6'>
            <TabsTrigger value='simple' className='cursor-pointer'>
              Simple
            </TabsTrigger>
            <TabsTrigger value='fn' className='cursor-pointer'>
              Fn Keys
            </TabsTrigger>
            <TabsTrigger value='complex' className='cursor-pointer'>
              Complex
            </TabsTrigger>
          </TabsList>

          <TabsContent value='simple'>
            <SimpleModificationsEditor
              profile={selectedProfile}
              profileIndex={selectedProfileIndex}
              onProfileChange={replaceProfile}
              deviceOptions={deviceOptions}
              deviceLabelLookup={deviceLabelLookup}
            />
          </TabsContent>

          <TabsContent value='fn'>
            <ProfileFnKeysEditor
              profile={selectedProfile}
              profileIndex={selectedProfileIndex}
              onProfileChange={replaceProfile}
              deviceOptions={deviceOptions}
            />
          </TabsContent>

          <TabsContent value='complex'>
            <ComplexModificationsEditor
              rules={selectedProfile.complex_modifications?.rules || []}
              onRulesChange={updateComplexModifications}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
