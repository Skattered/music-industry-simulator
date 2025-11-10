import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import SettingsModal from './SettingsModal.svelte';
import { createNewGameState } from '../game/state';

describe('SettingsModal', () => {
	it('renders with game information', () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		expect(screen.getByText('Settings')).toBeTruthy();
		expect(screen.getByText('Game Information')).toBeTruthy();
		expect(screen.getByText('Save Management')).toBeTruthy();
		expect(screen.getByText('Danger Zone')).toBeTruthy();
	});

	it('displays game stats correctly', () => {
		const gameState = createNewGameState();
		gameState.money = 1000;
		gameState.fans = 500;
		gameState.phase = 2;
		gameState.prestigeCount = 3;

		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		expect(screen.getByText('$1K')).toBeTruthy();
		expect(screen.getByText('500')).toBeTruthy();
		expect(screen.getByText('2')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('calls onClose when close button is clicked', async () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		const closeButton = screen.getByText('Close');
		await fireEvent.click(closeButton);

		expect(onClose).toHaveBeenCalled();
	});

	it('shows confirmation dialog when hard reset is clicked', async () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		// Confirmation should not be visible initially
		expect(screen.queryByText('Are you absolutely sure?')).toBeNull();

		// Click hard reset button
		const resetButton = screen.getByText('Hard Reset Game');
		await fireEvent.click(resetButton);

		// Confirmation should now be visible
		expect(screen.getByText('Are you absolutely sure?')).toBeTruthy();
		expect(screen.getByText('All progress will be lost permanently!')).toBeTruthy();
	});

	it('cancels hard reset when cancel button is clicked', async () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		// Click hard reset button to show confirmation
		const resetButton = screen.getByText('Hard Reset Game');
		await fireEvent.click(resetButton);

		// Click cancel
		const cancelButton = screen.getByText('Cancel');
		await fireEvent.click(cancelButton);

		// Confirmation should be hidden
		expect(screen.queryByText('Are you absolutely sure?')).toBeNull();
		expect(onHardReset).not.toHaveBeenCalled();
	});

	it('calls onHardReset when confirmed', async () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		// Click hard reset button to show confirmation
		const resetButton = screen.getByText('Hard Reset Game');
		await fireEvent.click(resetButton);

		// Click confirm
		const confirmButton = screen.getByText('Yes, Delete Everything');
		await fireEvent.click(confirmButton);

		// onHardReset should be called
		expect(onHardReset).toHaveBeenCalled();
	});

	it('has export and import buttons', () => {
		const gameState = createNewGameState();
		const onClose = vi.fn();
		const onHardReset = vi.fn();

		render(SettingsModal, {
			props: { gameState, onClose, onHardReset }
		});

		expect(screen.getByText('Export Save File')).toBeTruthy();
		expect(screen.getByText('Import Save File')).toBeTruthy();
	});
});
