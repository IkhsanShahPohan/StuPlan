/**
 * useSync.ts
 * React hook untuk mengelola sync operations dengan UI state
 * 
 * Features:
 * - Manage backup/restore state
 * - Progress tracking
 * - Error handling
 * - Easy integration dengan components
 */

import {
  backupToSupabase,
  checkInternetConnection,
  getLastBackupTimestamp,
  hasBackupData,
  restoreFromSupabase,
  SyncProgress,
  SyncResult,
} from "@/lib/syncService";
import { useCallback, useState } from "react";
import { useDrizzle } from "./useDrizzle";

export interface UseSyncReturn {
  // State
  isSyncing: boolean;
  progress: SyncProgress | null;
  error: string | null;
  lastBackupDate: Date | null;
  hasBackup: boolean;
  isOnline: boolean;

  // Actions
  backup: () => Promise<SyncResult>;
  restore: () => Promise<SyncResult>;
  checkBackupStatus: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
  resetError: () => void;
}

export const useSync = (userId: string): UseSyncReturn => {
  const db = useDrizzle();

  // State management
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<Date | null>(null);
  const [hasBackup, setHasBackup] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  /**
   * Check internet connection
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await checkInternetConnection();
      setIsOnline(connected);
      return connected;
    } catch (err) {
      setIsOnline(false);
      return false;
    }
  }, []);

  /**
   * Check backup status (has backup & last backup date)
   */
  const checkBackupStatus = useCallback(async () => {
    try {
      const [hasData, lastBackup] = await Promise.all([
        hasBackupData(userId),
        getLastBackupTimestamp(userId),
      ]);

      setHasBackup(hasData);
      setLastBackupDate(lastBackup);
    } catch (err) {
      console.error("Error checking backup status:", err);
    }
  }, [userId]);

  /**
   * Backup data to Supabase
   */
  const backup = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    setProgress(null);

    try {
      // Progress callback
      const onProgress = (prog: SyncProgress) => {
        setProgress(prog);
      };

      const result = await backupToSupabase(db, userId, onProgress);

      if (!result.success) {
        setError(result.message);
      } else {
        // Update backup status after successful backup
        await checkBackupStatus();
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal mencadangkan data";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    } finally {
      setIsSyncing(false);
      // Keep progress for a bit so user can see completion
      setTimeout(() => setProgress(null), 2000);
    }
  }, [db, userId, checkBackupStatus]);

  /**
   * Restore data from Supabase
   */
  const restore = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    setProgress(null);

    try {
      // Progress callback
      const onProgress = (prog: SyncProgress) => {
        setProgress(prog);
      };

      const result = await restoreFromSupabase(db, userId, onProgress);

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Gagal memulihkan data";
      setError(errorMsg);
      return {
        success: false,
        message: errorMsg,
        error: errorMsg,
      };
    } finally {
      setIsSyncing(false);
      // Keep progress for a bit so user can see completion
      setTimeout(() => setProgress(null), 2000);
    }
  }, [db, userId]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isSyncing,
    progress,
    error,
    lastBackupDate,
    hasBackup,
    isOnline,

    // Actions
    backup,
    restore,
    checkBackupStatus,
    checkConnection,
    resetError,
  };
};