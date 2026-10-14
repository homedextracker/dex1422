import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  Shield,
  Layers,
  ArrowRight,
  Share2,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';
import {
  GAMES,
  DLC_PACKS,
  GAME_GENERATION_GROUPS,
  ALL_GAME_IDS,
  type PokemonEntry,
  type GameId,
  type DlcId,
  type GameCatchesMap,
} from '../data/pokemonData';
import { GameLogoBadge } from './GameLogoBadge';
import { ExportStatsView } from './ExportStatsView';
import { OfflineSettingsCard } from './OfflineSettingsCard';
import type { User } from '../firebase';

interface SettingsViewProps {
  dex: PokemonEntry[];
  caughtSet: Set<number>;
  shinySet: Set<number>;
  livingSet: Set<number>;
  ownedGames: GameId[];
  ownedDlcs: DlcId[];
  gameCatches: GameCatchesMap;
  user?: User | null;
  onSyncSuccess?: (syncedCount: number) => void;
  onToggleOwnedGame: (gameId: GameId) => void;
  onSetAllOwnedGames: (games: GameId[]) => void;
  onToggleOwnedDlc: (dlcId: DlcId) => void;
  onSetAllOwnedDlcs: (dlcs: DlcId[]) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (theme: 'dark' | 'light') => void;
  trainerName: string;
  isCloudSynced: boolean;
  isPublic: boolean;
  onTogglePublic: (nextPublic: boolean) => void;
  publicShareUrl: string | null;
  tallyGames: GameId[];
  onToggleTallyGame: (gameId: GameId) => void;
  onSetAllTallyGames: (games: GameId[]) => void;
  includePokemonGoInSuggestions: boolean;
  onToggleIncludePokemonGoInSuggestions: () => void;
  onOpenPublicPreview: () => void;
  onImportProgress: (
    data: {
      caughtIds: number[];
      shinyIds: number[];
      livingIds: number[];
      ownedDlcs?: DlcId[];
      trainerName?: string;
    },
    mode: 'merge' | 'replace'
  ) => void;
  onResetAllProgress: () => void;
  onNavigateToTracker: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  dex,
  caughtSet,
  shinySet,
  livingSet,
  ownedGames,
  ownedDlcs,
  gameCatches,
  onToggleOwnedGame,
  onSetAllOwnedGames,
  onToggleOwnedDlc,
  onSetAllOwnedDlcs,
  tallyGames,
  onToggleTallyGame,
  onSetAllTallyGames,
  includePokemonGoInSuggestions,
  onToggleIncludePokemonGoInSuggestions,
  theme,
  onToggleTheme,
  trainerName,
  isCloudSynced,
  isPublic,
  onTogglePublic,
  publicShareUrl,
  onOpenPublicPreview,
  user,
  onSyncSuccess,
  onResetAllProgress,
  onNavigateToTracker,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [showExportSection, setShowExportSection] = useState(true);

  const switchGameIds: GameId[] = ['lgpe', 'swsh', 'bdsp', 'pla', 'sv'];
  const allDlcIds: DlcId[] = [
    'sv-teal-mask',
    'sv-indigo-disk',
    'swsh-isle-of-armor',
    'swsh-crown-tundra',
  ];

  const handleSelectAllGames = () => {
    onSetAllOwnedGames([...ALL_GAME_IDS]);
    onSetAllOwnedDlcs([...allDlcIds]);
  };

  const handleSelectSwitchOnly = () => {
    onSetAllOwnedGames([...switchGameIds, 'pogo']);
    onSetAllOwnedDlcs([...allDlcIds]);
  };

  const handleSelectNone = () => {
    onSetAllOwnedGames([]);
    onSetAllOwnedDlcs([]);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono-tabular font-semibold text-amber-300 uppercase tracking-wider">
              Trainer Preferences & Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Settings & Trainer Card Export
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage your owned games library, generate your global Trainer Card, export backups, customize appearance, and configure cloud synchronization.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToTracker}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-lg cursor-pointer"
        >
          <span>Open Pokédex Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SECTION 1: TRAINER CARD & PROGRESS EXPORT (Moved under Settings as requested) */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Trainer Card & Export
              </h2>
              <p className="text-xs text-slate-400">
                Official Trainer Card PNG generator, CSV data sheets, and JSON backups.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExportSection((v) => !v)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
          >
            {showExportSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showExportSection && (
          <ExportStatsView
            dex={dex}
            caughtSet={caughtSet}
            shinySet={shinySet}
            livingSet={livingSet}
            ownedGames={ownedGames}
            ownedDlcs={ownedDlcs}
            gameCatches={gameCatches}
            trainerName={trainerName}
            isCloudSynced={isCloudSynced}
            isPublic={isPublic}
            onTogglePublic={onTogglePublic}
            publicShareUrl={publicShareUrl}
            onOpenPublicPreview={onOpenPublicPreview}
            onImportProgress={onImportProgress}
          />
        )}
      </section>

      {/* SECTION 2: APPEARANCE & THEME (Light Mode / Dark Mode) */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="border-b border-slate-800/80 pb-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Theme & Appearance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between Dark Mode and crisp Light Mode.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => onToggleTheme('dark')}
            className={`rounded-xl border p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Dark Mode (Default)</div>
                <div className="text-xs text-slate-400">Slate & obsidian dark theme</div>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-amber-400" />}
          </div>

          <div
            onClick={() => onToggleTheme('light')}
            className={`rounded-xl border p-4 flex items-center justify-between gap-4 cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">Light Mode</div>
                <div className="text-xs text-slate-400">Crisp high-contrast theme</div>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-amber-400" />}
          </div>
        </div>
      </section>

      {/* SECTION 3: OWNED GAMES & DLC EXPANSIONS */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Select Owned Games & DLC Expansions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Currently owning <strong className="text-emerald-400">{ownedGames.length}</strong> / {ALL_GAME_IDS.length} Games and <strong className="text-amber-300">{ownedDlcs.length}</strong> / {allDlcIds.length} DLCs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllGames}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Own All Games & DLC
            </button>
            <button
              type="button"
              onClick={handleSelectSwitchOnly}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              Switch + GO Only
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Grouped by Generation */}
        <div className="flex flex-col gap-6">
          {GAME_GENERATION_GROUPS.map((group) => (
            <div
              key={group.gen}
              className="border border-slate-800/80 rounded-xl bg-[#0B0F17] overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {group.title}
                </span>
                <span className="text-[11px] font-mono-tabular text-slate-400">
                  {group.games.filter((g) => ownedGames.includes(g)).length} / {group.games.length} Owned
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.games.map((gameId) => {
                  const game = GAMES.find((g) => g.id === gameId)!;
                  const isOwned = ownedGames.includes(gameId);
                  const gameDlcs = DLC_PACKS.filter((p) => p.gameId === gameId);

                  return (
                    <div
                      key={gameId}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all ${
                        isOwned
                          ? 'bg-slate-900/80 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                          : 'bg-slate-950/50 border-slate-800/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <GameLogoBadge gameId={gameId} size="md" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-100 truncate">
                              {game.title}
                            </h3>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {game.platform} • Region: {game.region}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleOwnedGame(gameId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                            isOwned
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isOwned ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                          <span>{isOwned ? 'Game Owned' : 'Not Owned'}</span>
                        </button>
                      </div>

                      {/* DLC Expansion Checkboxes */}
                      {gameDlcs.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/70 flex flex-col gap-2">
                          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                            <span>DLC Expansions:</span>
                            <span className="font-mono-tabular text-[10px] text-amber-400">
                              {gameDlcs.filter((d) => ownedDlcs.includes(d.id)).length} / {gameDlcs.length} Owned
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {gameDlcs.map((dlc) => {
                              const isDlcOwned = ownedDlcs.includes(dlc.id);
                              return (
                                <button
                                  key={dlc.id}
                                  type="button"
                                  onClick={() => onToggleOwnedDlc(dlc.id)}
                                  className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-left ${
                                    isDlcOwned
                                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  <span className="truncate">{dlc.shortName}</span>
                                  {isDlcOwned ? (
                                    <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3B: RUNNING TOTAL TALLY CONFIGURATION */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Running Total Tally Game Selection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose which of your <strong className="text-emerald-400">{ownedGames.length} owned games</strong> appear in the top stats bar Running Total. (Currently <strong className="text-amber-300">{ownedGames.filter((g) => tallyGames.includes(g)).length}</strong> included).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSetAllTallyGames([...ownedGames])}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold text-amber-300 cursor-pointer"
            >
              Include All Owned Games
            </button>
            <button
              type="button"
              onClick={() => onSetAllTallyGames([])}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        {ownedGames.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
            You currently have no owned games selected above. Mark games as owned first to include them in the running total tally.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ownedGames.map((gameId) => {
              const game = GAMES.find((g) => g.id === gameId);
              if (!game) return null;
              const isIncluded = tallyGames.includes(gameId);

              return (
                <button
                  key={gameId}
                  type="button"
                  onClick={() => onToggleTallyGame(gameId)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                    isIncluded
                      ? 'bg-amber-500/10 border-amber-400/60 shadow-sm'
                      : 'bg-[#0B0F17] border-slate-800/80 hover:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GameLogoBadge gameId={gameId} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">
                        {game.shortTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {game.platform}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isIncluded ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3C: CATCH & LIVING DEX SUGGESTIONS PREFERENCES */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Catch & Living Dex Suggestions Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize how HomeDex advises you on uncaught Pokémon and Living Dex quality upgrades.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex flex-col gap-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">
                Include Pokemon GO in suggestions
              </span>
              {includePokemonGoInSuggestions ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  Enabled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                  Excluded (Default)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When disabled, encounter suggestions prioritize authentic console games you own (Scarlet/Violet, Legends Arceus, Sword/Shield, etc.) and exclude mobile Pokémon GO methods. When enabled, Pokémon GO spawns and raids are also recommended as encounter options.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleIncludePokemonGoInSuggestions}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              includePokemonGoInSuggestions
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {includePokemonGoInSuggestions ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Enabled</span>
              </>
            ) : (
              <span>Disabled</span>
            )}
          </button>
        </div>
      </section>

      {/* SECTION 4: DATA RESET */}
      <section className="bg-[#0F1522] border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex flex-col gap-1 border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            Trainer Data Management
          </h2>
          <p className="text-xs text-slate-400">
            Active Trainer: <span className="text-slate-200 font-semibold">{trainerName}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div>
            <div className="text-sm font-bold text-rose-300">Delete All Stored Pokédex Data</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Permanently wipe all caught Pokémon, specimen inventory instances, nicknames, and living box assignments.
            </div>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAllProgress();
                  setConfirmReset(false);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Confirm Delete All
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Delete All Pokédex Data</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
