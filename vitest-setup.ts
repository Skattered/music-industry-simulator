/**
 * Vitest Setup
 *
 * Configures the test environment for Svelte 5 component testing
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Cleanup after each test
afterEach(() => {
	cleanup();
});
