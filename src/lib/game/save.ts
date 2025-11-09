/**
 * Save/Load System for Music Empire Game
 *
 * Provides localStorage-based persistence with:
 * - Automatic backups of previous saves
 * - Validation of save structure before loading
 * - Graceful handling of quota errors
 * - Export/import for manual backups
 */

import type { GameState, SaveFile } from './types';
import { SAVE_KEY, BACKUP_KEY, GAME_VERSION } from './config';

/**
 * Maximum size in bytes for localStorage (approximate)
 * Most browsers support 5-10MB, we'll be conservative
 */
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Creates a SaveFile object from the current game state
 *
 * @param state - The current game state
 * @returns A SaveFile object with timestamp and version
 */
function createSaveFile(state: GameState): SaveFile {
	return {
		state,
		savedAt: Date.now(),
		version: GAME_VERSION
	};
}

/**
 * Saves the game state to localStorage with automatic backup
 *
 * @param state - The current game state to save
 * @returns true if save was successful, false otherwise
 */
export function saveGame(state: GameState): boolean {
	try {
		// First, backup the existing save (if it exists)
		const existingSave = localStorage.getItem(SAVE_KEY);
		if (existingSave) {
			try {
				localStorage.setItem(BACKUP_KEY, existingSave);
			} catch (backupError) {
				console.warn('Failed to create backup, but continuing with save:', backupError);
				// Continue with save even if backup fails
			}
		}

		// Create save file structure
		const saveFile = createSaveFile(state);

		// Serialize to JSON
		const serialized = JSON.stringify(saveFile);

		// Check approximate size (use actual byte size)
		if (new Blob([serialized]).size > MAX_STORAGE_SIZE) {
			console.error('Save data exceeds maximum storage size');
			return false;
		}

		// Attempt to save
		localStorage.setItem(SAVE_KEY, serialized);
		return true;
	} catch (error) {
		// Handle quota exceeded errors
		if (error instanceof DOMException && (
			error.name === 'QuotaExceededError' ||
			error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
		)) {
			console.error('localStorage quota exceeded. Unable to save game.');
			// Attempt to clear backup and retry once
			try {
				localStorage.removeItem(BACKUP_KEY);
				localStorage.setItem(SAVE_KEY, serialized);
				return true;
			} catch (retryError) {
				console.error('Save failed even after clearing backup:', retryError);
				return false;
			}
		}

		console.error('Failed to save game:', error);
		return false;
	}
}

/**
 * Loads the game state from localStorage
 *
 * @returns The saved game state, or null if no valid save exists
 */
export function loadGame(): GameState | null {
	try {
		const saved = localStorage.getItem(SAVE_KEY);
		if (!saved) {
			return null;
		}

		// Parse JSON
		const parsed = JSON.parse(saved);

		// Validate structure
		if (!validateSave(parsed)) {
			console.warn('Primary save file is invalid, attempting to load backup...');
			return loadBackup();
		}

		// Return the game state
		return parsed.state;
	} catch (error) {
		console.error('Failed to load game, attempting backup:', error);
		return loadBackup();
	}
}

/**
 * Loads the backup save from localStorage
 *
 * @returns The backup game state, or null if no valid backup exists
 */
export function loadBackup(): GameState | null {
	try {
		const backup = localStorage.getItem(BACKUP_KEY);
		if (!backup) {
			console.warn('No backup save found');
			return null;
		}

		// Parse JSON
		const parsed = JSON.parse(backup);

		// Validate structure
		if (!validateSave(parsed)) {
			console.error('Backup save file is also invalid');
			return null;
		}

		console.log('Successfully loaded backup save');
		return parsed.state;
	} catch (error) {
		console.error('Failed to load backup save:', error);
		return null;
	}
}

/**
 * Type guard to validate save file structure
 *
 * @param data - The data to validate
 * @returns true if data is a valid SaveFile with valid GameState
 */
export function validateSave(data: any): data is SaveFile {
	// Check if data exists and is an object
	if (!data || typeof data !== 'object') {
		return false;
	}

	// Check SaveFile structure
	if (typeof data.savedAt !== 'number' || typeof data.version !== 'string') {
		return false;
	}

	// Check if state exists
	if (!data.state || typeof data.state !== 'object') {
		return false;
	}

	const state = data.state;

	// Validate required primitive fields
	if (typeof state.money !== 'number' || !Number.isFinite(state.money)) return false;
	if (typeof state.fans !== 'number' || !Number.isFinite(state.fans)) return false;
	if (typeof state.gpu !== 'number' || !Number.isFinite(state.gpu)) return false;
	if (typeof state.phase !== 'number' || !Number.isFinite(state.phase)) return false;
	if (typeof state.industryControl !== 'number' || !Number.isFinite(state.industryControl)) return false;
	if (typeof state.songGenerationSpeed !== 'number' || !Number.isFinite(state.songGenerationSpeed)) return false;
	if (typeof state.techTier !== 'number' || !Number.isFinite(state.techTier)) return false;
	if (typeof state.techSubTier !== 'number' || !Number.isFinite(state.techSubTier)) return false;
	if (typeof state.prestigeCount !== 'number' || !Number.isFinite(state.prestigeCount)) return false;
	if (typeof state.experienceMultiplier !== 'number' || !Number.isFinite(state.experienceMultiplier)) return false;
	if (typeof state.lastUpdate !== 'number' || !Number.isFinite(state.lastUpdate)) return false;
	if (typeof state.createdAt !== 'number' || !Number.isFinite(state.createdAt)) return false;
	if (typeof state.version !== 'string') return false;

	// Validate arrays
	if (!Array.isArray(state.songs)) return false;
	if (!Array.isArray(state.legacyArtists)) return false;
	if (!Array.isArray(state.songQueue)) return false;
	if (!Array.isArray(state.activeBoosts)) return false;
	if (!Array.isArray(state.physicalAlbums)) return false;
	if (!Array.isArray(state.tours)) return false;
	if (!Array.isArray(state.ownedPlatforms)) return false;

	// Validate currentArtist object
	if (!state.currentArtist || typeof state.currentArtist !== 'object') return false;
	if (typeof state.currentArtist.name !== 'string') return false;
	if (typeof state.currentArtist.songs !== 'number' || !Number.isFinite(state.currentArtist.songs)) return false;
	if (typeof state.currentArtist.fans !== 'number' || !Number.isFinite(state.currentArtist.fans)) return false;
	if (typeof state.currentArtist.peakFans !== 'number' || !Number.isFinite(state.currentArtist.peakFans)) return false;
	if (typeof state.currentArtist.createdAt !== 'number' || !Number.isFinite(state.currentArtist.createdAt)) return false;

	// Validate upgrades object
	if (!state.upgrades || typeof state.upgrades !== 'object') return false;

	// Validate unlockedSystems object
	if (!state.unlockedSystems || typeof state.unlockedSystems !== 'object') return false;
	if (typeof state.unlockedSystems.trendResearch !== 'boolean') return false;
	if (typeof state.unlockedSystems.physicalAlbums !== 'boolean') return false;
	if (typeof state.unlockedSystems.tours !== 'boolean') return false;
	if (typeof state.unlockedSystems.platformOwnership !== 'boolean') return false;
	if (typeof state.unlockedSystems.monopoly !== 'boolean') return false;
	if (typeof state.unlockedSystems.prestige !== 'boolean') return false;
	if (typeof state.unlockedSystems.gpu !== 'boolean') return false;

	// Validate currentTrendingGenre (can be null or string)
	if (state.currentTrendingGenre !== null && typeof state.currentTrendingGenre !== 'string') {
		return false;
	}

	// Validate phase range (1-5)
	if (state.phase < 1 || state.phase > 5) return false;

	// Validate techTier range (1-7)
	if (state.techTier < 1 || state.techTier > 7) return false;

	// Validate techSubTier range (0-2)
	if (state.techSubTier < 0 || state.techSubTier > 2) return false;

	// If all checks pass, it's valid
	return true;
}

/**
 * Deletes both the primary save and backup from localStorage
 */
export function deleteSave(): void {
	try {
		localStorage.removeItem(SAVE_KEY);
		localStorage.removeItem(BACKUP_KEY);
		console.log('Save data deleted successfully');
	} catch (error) {
		console.error('Failed to delete save data:', error);
	}
}

/**
 * Exports the current save as a blob URL for download
 *
 * @returns A blob URL string referencing the save file JSON, or null if export fails
 */
export function exportSave(): string | null {
	try {
		const saved = localStorage.getItem(SAVE_KEY);
		if (!saved) {
			console.warn('No save file to export');
			return null;
		}

		// Validate before export
		const parsed = JSON.parse(saved);
		if (!validateSave(parsed)) {
			console.error('Cannot export invalid save file');
			return null;
		}

		// Create a formatted JSON string (pretty-printed for readability)
		const formatted = JSON.stringify(parsed, null, 2);

		// Create data URL
		const blob = new Blob([formatted], { type: 'application/json' });
		const dataUrl = URL.createObjectURL(blob);

		return dataUrl;
	} catch (error) {
		console.error('Failed to export save:', error);
		return null;
	}
}

/**
 * Imports a save file from JSON string
 *
 * @param fileContent - The JSON string content from the imported file
 * @returns true if import was successful and save was loaded, false otherwise
 */
export function importSave(fileContent: string): boolean {
	try {
		// Parse the JSON
		const parsed = JSON.parse(fileContent);

		// Validate the structure
		if (!validateSave(parsed)) {
			console.error('Imported file is not a valid save file');
			return false;
		}

		// Backup current save before importing
		const currentSave = localStorage.getItem(SAVE_KEY);
		if (currentSave) {
			try {
				localStorage.setItem(BACKUP_KEY, currentSave);
			} catch (backupError) {
				console.warn('Failed to backup current save before import:', backupError);
			}
		}

		// Save the imported data
		localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
		console.log('Save file imported successfully');
		return true;
	} catch (error) {
		if (error instanceof SyntaxError) {
			console.error('Imported file is not valid JSON');
		} else if (error instanceof DOMException && (
			error.name === 'QuotaExceededError' ||
			error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
		)) {
			console.error('localStorage quota exceeded during import');
		} else {
			console.error('Failed to import save:', error);
		}
		return false;
	}
}
