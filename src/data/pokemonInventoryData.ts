import type { GameId } from './pokemonData';
import { GAMES } from './pokemonData';

export type PokemonGender = 'male' | 'female' | 'genderless';

export interface PokemonInstance {
  pokeId: string; // 12-char unique identifier: starts with "ID" followed by 10 alphanumeric chars (e.g. "ID8F3K9L2M4P")
  pokemonId: number; // 1 to 1025
  nickname: string; // User-assigned nickname (max 10 chars) or blank (defaults to species name)
  level: number; // 1 to 100 (mandatory)
  gender: PokemonGender;
  variantId: string; // e.g. "25:base", "25:female", "37:alola", "6:gmax"
  variantName: string;
  isShiny: boolean;
  gameId?: GameId; // Origin game (MUST be undefined if isHomeGift is true)
  isHomeGift: boolean; // Tagged as Gifted from Pokémon HOME
  isTraded: boolean; // Received via Trade
  storedInHome: boolean; // Whether specimen is deposited into Pokémon HOME
  isInLivingBox: boolean; // Whether specimen is placed in Living Dex Box slot
  livingBoxNumber?: number; // 1 to 35
  livingBoxSlot?: number; // 1 to 30
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Generates an automatically unique, non-sequential 12-digit POKEID:
 * Starts with "ID" followed by 10 alphanumeric characters (uppercase letters and digits).
 * Guaranteed to be non-sequential and unique.
 */
export function generatePokeId(existingIds?: Set<string>): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing glyphs
  let result = '';
  do {
    let randomPart = '';
    for (let i = 0; i < 10; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result = `ID${randomPart}`;
  } while (existingIds && existingIds.has(result));
  return result;
}

/**
 * Validates a user-assigned nickname:
 * Up to 10 characters allowed. If blank, returns the Pokémon's official species name.
 */
export function sanitizeNickname(nickname: string | undefined, defaultSpeciesName: string): string {
  if (!nickname || !nickname.trim()) {
    return defaultSpeciesName;
  }
  return nickname.trim().slice(0, 10);
}

/**
 * Formats origin information for display on information screens (Living Dex, Public Boxes, Inventory):
 * - If gifted from home and not traded: "Gifted from Home"
 * - If gifted from home and traded: "Regifted from HOME"
 * - If traded and from a game: "Traded from [Game Title]"
 * - Standard: "[Game Title]" (or "Gifted from Home" if home gift)
 */
export function formatOriginSourceLabel(
  instance: Pick<PokemonInstance, 'isHomeGift' | 'isTraded' | 'gameId'>,
  gameTitle?: string
): string {
  if (instance.isHomeGift) {
    if (instance.isTraded) {
      return 'Regifted from HOME';
    }
    return 'Gifted from Home';
  }
  const effectiveGameName =
    gameTitle || (instance.gameId ? instance.gameId.toUpperCase() : 'Unknown Game');
  if (instance.isTraded) {
    return `Traded from ${effectiveGameName}`;
  }
  return effectiveGameName;
}

/**
 * Storage location status string:
 * - If stored in Pokémon HOME: "Stored in Pokémon HOME"
 * - If NOT stored in Pokémon HOME: "(stored in [console of the pokemon's caught game])"
 */
export function formatStorageLocationLabel(
  instance: Pick<PokemonInstance, 'storedInHome' | 'isHomeGift' | 'gameId'>,
  customPlatform?: string
): string {
  if (instance.storedInHome || instance.isHomeGift) {
    return 'Stored in Pokémon HOME';
  }
  let platform = customPlatform;
  if (!platform && instance.gameId) {
    const g = GAMES.find((game) => game.id === instance.gameId);
    if (g) platform = g.platform;
  }
  const consoleName = platform || 'Original Console';
  return `(stored in ${consoleName})`;
}

/**
 * Determines if a Pokémon is unable to transfer to Pokémon HOME from that game by any means.
 * If true, the option for "Stored in Home" MUST NOT be available.
 */
export function isTransferToHomePermanentlyBlocked(
  pokemonId: number,
  gameId?: GameId,
  variantId?: string
): { isBlocked: boolean; reason?: string } {
  // Spinda from BDSP is blocked from Pokémon HOME due to spot encoding mismatch
  if (pokemonId === 327 && gameId === 'bdsp') {
    return {
      isBlocked: true,
      reason: 'Spinda caught in Brilliant Diamond & Shining Pearl cannot be transferred to Pokémon HOME due to spot pattern encryption mismatch.',
    };
  }
  // Spinda from Pokémon GO cannot use GO Transporter
  if (pokemonId === 327 && gameId === 'pogo') {
    return {
      isBlocked: true,
      reason: 'Spinda caught in Pokémon GO cannot be sent to Pokémon HOME via GO Transporter.',
    };
  }
  // Partner Pikachu from LGPE
  if (pokemonId === 25 && variantId?.includes('partner')) {
    return {
      isBlocked: true,
      reason: "Partner Pikachu from Let's Go, Pikachu! cannot be transferred to Pokémon HOME.",
    };
  }
  // Partner Eevee from LGPE
  if (pokemonId === 133 && variantId?.includes('partner')) {
    return {
      isBlocked: true,
      reason: "Partner Eevee from Let's Go, Eevee! cannot be transferred to Pokémon HOME.",
    };
  }
  // Ride Form Koraidon / Miraidon
  if ((pokemonId === 1007 || pokemonId === 1008) && variantId?.includes('ride')) {
    return {
      isBlocked: true,
      reason: 'Story Ride Form cannot be deposited into Pokémon HOME.',
    };
  }
  return { isBlocked: false };
}
