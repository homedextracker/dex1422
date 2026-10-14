import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  WifiOff,
  Download,
  CheckCircle2,
  Trash2,
  RefreshCw,
  HardDrive,
  Smartphone,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { PokemonEntry } from '../data/pokemonData';
import {
  useOnlineStatus,
  getOfflineSyncQueue,
  flushOfflineSyncQueue,
  clearOfflineSyncQueue,
  getOfflinePackageMetadata,
  downloadFullOfflinePackage,
  clearOfflinePackage,
  type OfflinePackageMeta,
  type DownloadProgress,
  type SyncQueueAction,
} from '../utils/offlineManager';
import { type User } from '../firebase';

interface OfflineSettingsCardProps {
  dex: PokemonEntry[];
  user: User | null;
  trainerName: string;
  onSyncSuccess?: (syncedCount: number) => void;
}

export const OfflineSettingsCard: React.FC<OfflineSettingsCardProps> = ({
  dex,
  user,
  trainerName,
  onSyncSuccess,
}) => {
  const isOnline = useOnlineStatus();
  const [packageMeta, setPackageMeta] = useState<OfflinePackageMeta | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Download state
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Refresh status
  const refreshStatus = async () => {
    const meta = await getOfflinePackageMetadata();
    setPackageMeta(meta);
    setSyncQueue(getOfflineSyncQueue());
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle manual sync
  const handleManualSync = async () => {
    if (!isOnline) {
      setSyncMessage({
        text: 'Your device is currently offline. Connect to internet to sync changes.',
        type: 'error',
      });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await flushOfflineSyncQueue(user, trainerName);
      if (result.errors.length > 0) {
        setSyncMessage({
          text: `Synced ${result.syncedCount} changes, but some errors occurred: ${result.errors[0]}`,
          type: 'error',
        });
      } else if (result.syncedCount > 0) {
        setSyncMessage({
          text: `Successfully synced ${result.syncedCount} offline change${result.syncedCount > 1 ? 's' : ''} to HomeDex Cloud!`,
          type: 'success',
        });
        if (onSyncSuccess) onSyncSuccess(result.syncedCount);
      } else {
        setSyncMessage({
          text: 'All changes are already in sync with HomeDex Cloud.',
          type: 'info',
        });
      }
      refreshStatus();
    } catch (err: any) {
      setSyncMessage({
        text: `Sync failed: ${err?.message || 'Could not reach server'}`,
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Download Full Offline Package
  const handleStartDownload = async () => {
    if (!isOnline) {
      setSyncMessage({
        text: 'Cannot download offline package while device is offline.',
        type: 'error',
      });
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setDownloadProgress({
      current: 0,
      total: dex.length,
      percentage: 0,
      bytes: 0,
      status: 'downloading',
    });

    try {
      const result = await downloadFullOfflinePackage(
        dex,
        (progress) => {
          setDownloadProgress(progress);
        },
        abortController.signal
      );

      if (result.success) {
        setSyncMessage({
          text: `Full Offline Package downloaded! ${result.cachedCount} species information & sprite images are cached locally on your device.`,
          type: 'success',
        });
      }
      refreshStatus();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSyncMessage({
          text: `Download interrupted: ${err?.message || 'Network error'}`,
          type: 'error',
        });
      }
    } finally {
      abortControllerRef.current = null;
      setDownloadProgress(null);
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setDownloadProgress(null);
      setSyncMessage({
        text: 'Offline package download paused/cancelled.',
        type: 'info',
      });
    }
  };

  // Handle Clear Offline Cache
  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to remove the cached offline sprites and data from this device?')) {
      await clearOfflinePackage();
      await refreshStatus();
      setSyncMessage({
        text: 'Offline sprite cache cleared from local storage.',
        type: 'info',
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isOnline
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
          }`}>
            {isOnline ? <Wifi className="w-5 h-5 stroke-[2.5]" /> : <WifiOff className="w-5 h-5 stroke-[2.5]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                Offline Mode & Mobile Data
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
                isOnline
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Download sprite illustrations and Pokédex data to your mobile phone or tablet for uninterrupted offline tracking.
            </p>
          </div>
        </div>

        {/* Sync Now button */}
        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !isOnline
              ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
              : syncQueue.length > 0
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : syncQueue.length > 0 ? `Sync Offline Changes (${syncQueue.length})` : 'Sync Cloud Now'}</span>
        </button>
      </div>

      {/* Sync Message Notification */}
      {syncMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          syncMessage.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : syncMessage.type === 'error'
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            : 'bg-slate-900 border-slate-700 text-slate-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {syncMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{syncMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncMessage(null)}
            className="text-slate-400 hover:text-slate-200 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Offline Storage & Sprites Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Offline Data Package */}
        <div className="p-5 rounded-xl bg-[#0B0F17] border border-slate-800 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Full Offline Pokédex Package
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Downloads all 1,025 Pokémon species specifications, origin game availability, item requirements, and official artwork sprites to local cache.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Cached Sprites:</span>
              <span className="font-bold text-slate-200">
                {packageMeta?.cachedSpeciesCount || 0} / {packageMeta?.totalSpeciesCount || 1025}
              </span>
            </div>
            {packageMeta?.totalBytes ? (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Estimated Cache Size:</span>
                <span className="font-bold text-emerald-400">
                  {formatBytes(packageMeta.totalBytes)}
                </span>
              </div>
            ) : null}
            {packageMeta?.downloadedAt ? (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Last Download:</span>
                <span className="text-slate-300">
                  {new Date(packageMeta.downloadedAt).toLocaleDateString()}
                </span>
              </div>
            ) : null}
          </div>

          {/* Download progress UI */}
          {downloadProgress && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Downloading Sprites & Data...
                </span>
                <span className="text-amber-400 font-bold">
                  {downloadProgress.current} / {downloadProgress.total} ({downloadProgress.percentage}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2.5 transition-all duration-150"
                  style={{ width: `${downloadProgress.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{formatBytes(downloadProgress.bytes)} saved to CacheStorage</span>
                <button
                  type="button"
                  onClick={handleCancelDownload}
                  className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline"
                >
                  Cancel Download
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!downloadProgress && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleStartDownload}
                disabled={!isOnline}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  packageMeta?.isDownloaded
                    ? 'bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-300'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                } ${!isOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {packageMeta?.isDownloaded ? 'Update / Re-download All Data' : 'Download Full Offline Package'}
                </span>
              </button>

              {packageMeta?.cachedSpeciesCount && packageMeta.cachedSpeciesCount > 0 ? (
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cache</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Card 2: Offline Changes & Auto-Sync Queue */}
        <div className="p-5 rounded-xl bg-[#0B0F17] border border-slate-800 flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Offline Mutation Queue
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Any Pokémon catches, new POKEID registrations, and living box changes made while offline are queued safely in local browser storage and auto-sync when connection is restored.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Pending Changes in Queue:</span>
              <span className={`font-mono font-bold ${syncQueue.length > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {syncQueue.length} action{syncQueue.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Auto-Sync on Reconnect:</span>
              <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cloud Sync Target:</span>
              <span className="font-mono text-slate-300 font-semibold truncate max-w-[160px]">
                {user ? user.email || 'Cloud User' : 'Local Guest Account'}
              </span>
            </div>
          </div>

          {/* Mobile WebApp Advice */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
            <div className="text-xs text-slate-400 leading-tight">
              <strong className="text-slate-200">Mobile Tip:</strong> On Safari (iOS) tap <span className="text-amber-300 font-bold">Share → Add to Home Screen</span>. On Android tap <span className="text-amber-300 font-bold">Install</span> to run HomeDex fullscreen.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
