'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { KarabinerConfig } from '@/types/karabiner';

const DRAFT_VERSION = 1;
const SAVE_DEBOUNCE_MS = 400;

export const CONFIG_DRAFT_STORAGE_KEY =
  'karabiner-config-editor:config-draft:v1';

interface ConfigDraftEnvelope {
  version: typeof DRAFT_VERSION;
  savedAt: string;
  config: unknown;
}

interface UsePersistedConfigResult {
  config: KarabinerConfig | null;
  setConfig: Dispatch<SetStateAction<KarabinerConfig | null>>;
  discardDraft: () => boolean;
  hasStoredDraft: boolean;
  isHydrated: boolean;
  recoveredFromStorage: boolean;
  savedAt: string | null;
  storageError: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseDraft(rawDraft: string): ConfigDraftEnvelope {
  const value: unknown = JSON.parse(rawDraft);

  if (
    !isRecord(value) ||
    value.version !== DRAFT_VERSION ||
    typeof value.savedAt !== 'string' ||
    !isRecord(value.config)
  ) {
    throw new Error('The saved local draft has an unsupported format.');
  }

  return value as unknown as ConfigDraftEnvelope;
}

function assertRestorableConfig(config: KarabinerConfig): KarabinerConfig {
  if (
    !Array.isArray(config.profiles) ||
    config.profiles.some(
      (profile) => !isRecord(profile) || typeof profile.name !== 'string',
    )
  ) {
    throw new Error('The saved local draft contains invalid profile data.');
  }

  return config;
}

function getStorageErrorMessage(
  error: unknown,
  action: 'load' | 'save' | 'remove',
) {
  if (error instanceof Error && error.message) {
    if (action === 'load') {
      return `The local draft could not be restored: ${error.message}`;
    }
    if (action === 'remove') {
      return `The local draft could not be removed: ${error.message}`;
    }
    return `The current config could not be saved locally: ${error.message}`;
  }

  if (action === 'load') return 'The local draft could not be restored.';
  if (action === 'remove') return 'The local draft could not be removed.';
  return 'The current config could not be saved locally.';
}

export function usePersistedConfig(
  normalize: (value: unknown) => KarabinerConfig,
): UsePersistedConfigResult {
  const [config, setConfig] = useState<KarabinerConfig | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasStoredDraft, setHasStoredDraft] = useState(false);
  const [recoveredFromStorage, setRecoveredFromStorage] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const skipNextWriteRef = useRef(false);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(CONFIG_DRAFT_STORAGE_KEY);
      setHasStoredDraft(rawDraft !== null);

      if (rawDraft) {
        const draft = parseDraft(rawDraft);
        const restoredConfig = assertRestorableConfig(normalize(draft.config));
        skipNextWriteRef.current = true;
        setConfig(restoredConfig);
        setSavedAt(draft.savedAt);
        setRecoveredFromStorage(true);
      }
    } catch (error) {
      setStorageError(getStorageErrorMessage(error, 'load'));
    } finally {
      setIsHydrated(true);
    }
  }, [normalize]);

  useEffect(() => {
    if (!isHydrated || !config) {
      return;
    }

    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }

    let hasSaved = false;
    const saveDraft = () => {
      if (hasSaved) return;
      hasSaved = true;

      const nextSavedAt = new Date().toISOString();
      const draft: ConfigDraftEnvelope = {
        version: DRAFT_VERSION,
        savedAt: nextSavedAt,
        config,
      };

      try {
        window.localStorage.setItem(
          CONFIG_DRAFT_STORAGE_KEY,
          JSON.stringify(draft),
        );
        setHasStoredDraft(true);
        setSavedAt(nextSavedAt);
        setStorageError(null);
      } catch (error) {
        setStorageError(getStorageErrorMessage(error, 'save'));
      }
    };

    const timeoutId = window.setTimeout(saveDraft, SAVE_DEBOUNCE_MS);
    window.addEventListener('pagehide', saveDraft);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pagehide', saveDraft);
    };
  }, [config, isHydrated]);

  const discardDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(CONFIG_DRAFT_STORAGE_KEY);
      setStorageError(null);
    } catch (error) {
      setStorageError(getStorageErrorMessage(error, 'remove'));
      return false;
    }

    setConfig(null);
    setHasStoredDraft(false);
    setRecoveredFromStorage(false);
    setSavedAt(null);
    return true;
  }, []);

  return {
    config,
    setConfig,
    discardDraft,
    hasStoredDraft,
    isHydrated,
    recoveredFromStorage,
    savedAt,
    storageError,
  };
}
