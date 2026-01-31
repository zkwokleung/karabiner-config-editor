'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ComplexModificationsEditor } from '@/components/complex-modifications/complex-modifications-editor';
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

  const handleProfileSelect = (value: string) => {
    if (value === '__new__') {
      addProfile();
    } else {
      setSelectedProfileIndex(Number(value));
    }
  };

  return (
    <Card className='p-6'>
      <Tabs defaultValue='simple' className='w-full'>
        <div className='flex items-start gap-4 mb-6'>
          <div className='flex items-center gap-2'>
            <Select
              value={String(selectedProfileIndex)}
              onValueChange={handleProfileSelect}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select profile' />
              </SelectTrigger>
              <SelectContent>
                {config.profiles.map((profile, index) => (
                  <SelectItem key={profile.name ?? index} value={String(index)}>
                    {profile.name}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value='__new__'>
                  <Plus className='h-4 w-4 mr-1' />
                  New Profile
                </SelectItem>
              </SelectContent>
            </Select>
            {config.profiles.length > 1 && (
              <Button
                size='icon'
                variant='ghost'
                className='h-9 w-9'
                onClick={() => deleteProfile(selectedProfileIndex)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            )}
          </div>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='profile-name' className='sr-only'>
              Profile Name
            </Label>
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
  );
}
