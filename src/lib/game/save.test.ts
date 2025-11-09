/**
 * Unit tests for the save/load system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	saveGame,
	loadGame,
	loadBackup,
	validateSave,
	deleteSave,
	exportSave,
	importSave
} from './save';
import type { GameState, SaveFile } from './types';
import { SAVE_KEY, BACKUP_KEY, GAME_VERSION } from './config';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

// Setup localStorage mock
Object.defineProperty(global, 'localStorage', {
	value: localStorageMock,
	writable: true
});

// Helper function to create a minimal valid GameState
function createValidGameState(): GameState {
	return {
		money: 100,
		songs: [],
		fans: 0,
		gpu: 0,
		phase: 1,
		industryControl: 0,
		currentArtist: {
			name: 'Test Artist',
			songs: 0,
			fans: 0,
			peakFans: 0,
			createdAt: Date.now()
		},
		legacyArtists: [],
		songQueue: [],
		songGenerationSpeed: 30000,
		currentTrendingGenre: null,
		techTier: 1,
		techSubTier: 0,
		upgrades: {},
		activeBoosts: [],
		physicalAlbums: [],
		tours: [],
		ownedPlatforms: [],
		prestigeCount: 0,
		experienceMultiplier: 1.0,
		unlockedSystems: {
			trendResearch: false,
			physicalAlbums: false,
			tours: false,
			platformOwnership: false,
			monopoly: false,
			prestige: false,
			gpu: false
		},
		lastUpdate: Date.now(),
		createdAt: Date.now(),
		version: '1.0.0'
	};
}

// Helper function to create a valid SaveFile
function createValidSaveFile(): SaveFile {
	return {
		state: createValidGameState(),
		savedAt: Date.now(),
		version: GAME_VERSION
	};
}

describe('Save/Load System', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	describe('validateSave', () => {
		it('should validate a correct save file', () => {
			const validSave = createValidSaveFile();
			expect(validateSave(validSave)).toBe(true);
		});

		it('should reject null or undefined', () => {
			expect(validateSave(null)).toBe(false);
			expect(validateSave(undefined)).toBe(false);
		});

		it('should reject non-object values', () => {
			expect(validateSave('string')).toBe(false);
			expect(validateSave(123)).toBe(false);
			expect(validateSave(true)).toBe(false);
		});

		it('should reject save without savedAt', () => {
			const invalidSave = createValidSaveFile();
			delete (invalidSave as any).savedAt;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save without version', () => {
			const invalidSave = createValidSaveFile();
			delete (invalidSave as any).version;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save without state', () => {
			const invalidSave = { savedAt: Date.now(), version: '1.0.0' };
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid money type', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state as any).money = 'not a number';
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid fans type', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state as any).fans = 'not a number';
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid phase value', () => {
			const invalidSave = createValidSaveFile();
			invalidSave.state.phase = 0 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);

			invalidSave.state.phase = 6 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid techTier value', () => {
			const invalidSave = createValidSaveFile();
			invalidSave.state.techTier = 0 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);

			invalidSave.state.techTier = 8 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid techSubTier value', () => {
			const invalidSave = createValidSaveFile();
			invalidSave.state.techSubTier = -1 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);

			invalidSave.state.techSubTier = 3 as any; // Out of range
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with non-array songs', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state as any).songs = 'not an array';
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with missing currentArtist', () => {
			const invalidSave = createValidSaveFile();
			delete (invalidSave.state as any).currentArtist;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid currentArtist name', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state.currentArtist as any).name = 123;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with missing upgrades object', () => {
			const invalidSave = createValidSaveFile();
			delete (invalidSave.state as any).upgrades;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with missing unlockedSystems', () => {
			const invalidSave = createValidSaveFile();
			delete (invalidSave.state as any).unlockedSystems;
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should reject save with invalid unlockedSystems boolean', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state.unlockedSystems as any).trendResearch = 'not a boolean';
			expect(validateSave(invalidSave)).toBe(false);
		});

		it('should accept save with null currentTrendingGenre', () => {
			const validSave = createValidSaveFile();
			validSave.state.currentTrendingGenre = null;
			expect(validateSave(validSave)).toBe(true);
		});

		it('should accept save with valid currentTrendingGenre', () => {
			const validSave = createValidSaveFile();
			validSave.state.currentTrendingGenre = 'pop';
			expect(validateSave(validSave)).toBe(true);
		});

		it('should reject save with numeric currentTrendingGenre', () => {
			const invalidSave = createValidSaveFile();
			(invalidSave.state as any).currentTrendingGenre = 123;
			expect(validateSave(invalidSave)).toBe(false);
		});
	});

	describe('saveGame', () => {
		it('should save game state to localStorage', () => {
			const state = createValidGameState();
			const result = saveGame(state);

			expect(result).toBe(true);
			expect(localStorage.getItem(SAVE_KEY)).toBeTruthy();
		});

		it('should create a backup of existing save', () => {
			const state1 = createValidGameState();
			state1.money = 100;
			saveGame(state1);

			const state2 = createValidGameState();
			state2.money = 200;
			saveGame(state2);

			const backup = localStorage.getItem(BACKUP_KEY);
			expect(backup).toBeTruthy();

			const parsedBackup = JSON.parse(backup!);
			expect(parsedBackup.state.money).toBe(100);
		});

		it('should include version and timestamp', () => {
			const state = createValidGameState();
			saveGame(state);

			const saved = localStorage.getItem(SAVE_KEY);
			const parsed = JSON.parse(saved!);

			expect(parsed.version).toBe(GAME_VERSION);
			expect(typeof parsed.savedAt).toBe('number');
		});

		it('should handle localStorage quota errors gracefully', () => {
			const originalSetItem = localStorage.setItem;
			const mockSetItem = vi.fn().mockImplementation((key: string) => {
				if (key === SAVE_KEY) {
					const error = new DOMException('Quota exceeded', 'QuotaExceededError');
					throw error;
				}
			});

			localStorage.setItem = mockSetItem;

			const state = createValidGameState();
			const result = saveGame(state);

			expect(result).toBe(false);

			localStorage.setItem = originalSetItem;
		});
	});

	describe('loadGame', () => {
		it('should load saved game state', () => {
			const state = createValidGameState();
			state.money = 500;
			saveGame(state);

			const loaded = loadGame();

			expect(loaded).toBeTruthy();
			expect(loaded!.money).toBe(500);
		});

		it('should return null if no save exists', () => {
			const loaded = loadGame();
			expect(loaded).toBeNull();
		});

		it('should fall back to backup if primary save is invalid', () => {
			// First save creates initial save
			const state1 = createValidGameState();
			state1.money = 300;
			saveGame(state1);

			// Second save creates a backup of the first
			const state2 = createValidGameState();
			state2.money = 400;
			saveGame(state2);

			// Corrupt the primary save
			localStorage.setItem(SAVE_KEY, '{"invalid": "data"}');

			const loaded = loadGame();

			// Should load the backup (state1 with money 300)
			expect(loaded).toBeTruthy();
			expect(loaded!.money).toBe(300);
		});

		it('should handle JSON parse errors', () => {
			localStorage.setItem(SAVE_KEY, 'not valid json');

			const loaded = loadGame();

			expect(loaded).toBeNull();
		});
	});

	describe('loadBackup', () => {
		it('should load backup save', () => {
			const state = createValidGameState();
			state.money = 100;
			saveGame(state);

			const state2 = createValidGameState();
			state2.money = 200;
			saveGame(state2);

			const backup = loadBackup();

			expect(backup).toBeTruthy();
			expect(backup!.money).toBe(100);
		});

		it('should return null if no backup exists', () => {
			const backup = loadBackup();
			expect(backup).toBeNull();
		});

		it('should return null if backup is invalid', () => {
			localStorage.setItem(BACKUP_KEY, '{"invalid": "data"}');

			const backup = loadBackup();
			expect(backup).toBeNull();
		});
	});

	describe('deleteSave', () => {
		it('should delete both primary and backup saves', () => {
			const state = createValidGameState();
			saveGame(state);
			saveGame(state); // Creates backup

			deleteSave();

			expect(localStorage.getItem(SAVE_KEY)).toBeNull();
			expect(localStorage.getItem(BACKUP_KEY)).toBeNull();
		});
	});

	describe('exportSave', () => {
		it('should export save as data URL', () => {
			const state = createValidGameState();
			saveGame(state);

			// Mock URL.createObjectURL
			const mockUrl = 'blob:http://localhost/test-blob';
			global.URL.createObjectURL = vi.fn(() => mockUrl);

			const result = exportSave();

			expect(result).toBe(mockUrl);
			expect(URL.createObjectURL).toHaveBeenCalled();
		});

		it('should return null if no save exists', () => {
			const result = exportSave();
			expect(result).toBeNull();
		});

		it('should return null if save is invalid', () => {
			localStorage.setItem(SAVE_KEY, '{"invalid": "data"}');

			const result = exportSave();
			expect(result).toBeNull();
		});
	});

	describe('importSave', () => {
		it('should import valid save file', () => {
			const saveFile = createValidSaveFile();
			const jsonString = JSON.stringify(saveFile);

			const result = importSave(jsonString);

			expect(result).toBe(true);
			expect(localStorage.getItem(SAVE_KEY)).toBeTruthy();
		});

		it('should backup current save before importing', () => {
			const state1 = createValidGameState();
			state1.money = 100;
			saveGame(state1);

			const state2 = createValidGameState();
			state2.money = 200;
			const saveFile = createValidSaveFile();
			saveFile.state = state2;

			importSave(JSON.stringify(saveFile));

			const backup = loadBackup();
			expect(backup).toBeTruthy();
			expect(backup!.money).toBe(100);
		});

		it('should reject invalid JSON', () => {
			const result = importSave('not valid json');
			expect(result).toBe(false);
		});

		it('should reject invalid save structure', () => {
			const invalidSave = { invalid: 'structure' };
			const result = importSave(JSON.stringify(invalidSave));

			expect(result).toBe(false);
		});

		it('should handle localStorage quota errors', () => {
			const originalSetItem = localStorage.setItem;
			const mockSetItem = vi.fn().mockImplementation((key: string) => {
				if (key === SAVE_KEY) {
					const error = new DOMException('Quota exceeded', 'QuotaExceededError');
					throw error;
				}
			});

			localStorage.setItem = mockSetItem;

			const saveFile = createValidSaveFile();
			const result = importSave(JSON.stringify(saveFile));

			expect(result).toBe(false);

			localStorage.setItem = originalSetItem;
		});
	});

	describe('Integration tests', () => {
		it('should handle complete save/load cycle', () => {
			const state = createValidGameState();
			state.money = 1000;
			state.fans = 500;
			state.currentArtist.name = 'Integration Test Artist';

			// Save
			const saveResult = saveGame(state);
			expect(saveResult).toBe(true);

			// Load
			const loaded = loadGame();
			expect(loaded).toBeTruthy();
			expect(loaded!.money).toBe(1000);
			expect(loaded!.fans).toBe(500);
			expect(loaded!.currentArtist.name).toBe('Integration Test Artist');
		});

		it('should handle export/import cycle', async () => {
			const state = createValidGameState();
			state.money = 2000;
			saveGame(state);

			// Mock URL methods
			global.URL.createObjectURL = vi.fn((blob: Blob) => {
				// Return a mock URL, actual reading will be handled below
				return 'blob:mock-url';
			});

			// Export and read blob content asynchronously
			const blobContent: string = await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result as string);
				};
				// The exportSave function should trigger a download with a Blob.
				// We need to get the blob that was passed to createObjectURL.
				// Since exportSave likely creates a Blob and calls createObjectURL,
				// we can spy on the call to get the blob.
				let blobArg: Blob | undefined;
				const origCreateObjectURL = global.URL.createObjectURL;
				global.URL.createObjectURL = vi.fn((blob: Blob) => {
					blobArg = blob;
					return origCreateObjectURL(blob);
				});
				exportSave();
				global.URL.createObjectURL = origCreateObjectURL;
				if (blobArg) {
					reader.readAsText(blobArg);
				}
			});

			// Clear localStorage
			deleteSave();

			// Import
			const importResult = importSave(blobContent);
			expect(importResult).toBe(true);

			const loaded = loadGame();
			expect(loaded).toBeTruthy();
			expect(loaded!.money).toBe(2000);
		});

		it('should maintain backup integrity across multiple saves', () => {
			// Save 1
			const state1 = createValidGameState();
			state1.money = 100;
			saveGame(state1);

			// Save 2 (creates backup of save 1)
			const state2 = createValidGameState();
			state2.money = 200;
			saveGame(state2);

			// Save 3 (creates backup of save 2)
			const state3 = createValidGameState();
			state3.money = 300;
			saveGame(state3);

			// Current save should be save 3
			const current = loadGame();
			expect(current!.money).toBe(300);

			// Backup should be save 2
			const backup = loadBackup();
			expect(backup!.money).toBe(200);
		});
	});
});
