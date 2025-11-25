import { useSyncManager } from "@/lib/useSyncManager";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useSync(userId: string | null) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor network status

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
      // Auto sync when coming online
      if (state.isConnected && userId) {
        handleSync();
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleSync = async () => {
    if (!userId || isSyncing) return;

    setIsSyncing(true);
    try {
      await useSyncManager.fullSync(userId);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    syncNow: handleSync,
  };
}
