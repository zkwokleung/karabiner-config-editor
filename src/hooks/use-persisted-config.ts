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

function getStorageErrorMessage(error: unknown, action: 'load' | 'save') {
  if (error instanceof Error && error.message) {
    return action === 'load'
      ? `The local draft could not be restored: ${error.message}`
      : `The current config could not be saved locally: ${error.message}`;
  }

  return action === 'load'
    ? 'The local draft could not be restored.'
    : 'The current config could not be saved locally.';
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
        skipNextWriteRef.current = true;
        setConfig(normalize(draft.config));
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
  }, [config, isHydrated]);

  const discardDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(CONFIG_DRAFT_STORAGE_KEY);
      setStorageError(null);
    } catch (error) {
      setStorageError(getStorageErrorMessage(error, 'save'));
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
