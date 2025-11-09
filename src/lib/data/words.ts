/**
 * Word Lists for Mad-lib Style Name Generation
 *
 * Contains categorized word lists used to generate random song, artist, and album names.
 */

import type { Genre } from '../game/types';

// ============================================================================
// ADJECTIVES
// ============================================================================

export const ADJECTIVES = [
	'Electric',
	'Midnight',
	'Digital',
	'Neon',
	'Crystal',
	'Cosmic',
	'Velvet',
	'Golden',
	'Silver',
	'Wild',
	'Lost',
	'Broken',
	'Sweet',
	'Dark',
	'Bright',
	'Fading',
	'Rising',
	'Dancing',
	'Burning',
	'Frozen',
	'Endless',
	'Silent',
	'Distant',
	'Ancient',
	'Modern',
	'Shattered',
	'Perfect',
	'Twisted',
	'Sacred',
	'Wicked',
	'Gentle',
	'Savage',
	'Eternal',
	'Temporary',
	'Hidden',
	'Luminous',
	'Shadowy',
	'Crimson',
	'Azure',
	'Violet'
];

// ============================================================================
// NOUNS
// ============================================================================

export const NOUNS = [
	'Dreams',
	'Hearts',
	'Lights',
	'Shadows',
	'Echoes',
	'Nights',
	'Stars',
	'Waves',
	'Fire',
	'Thunder',
	'Memories',
	'Paradise',
	'Rain',
	'Sky',
	'Ocean',
	'Highway',
	'City',
	'Moon',
	'Sun',
	'Love',
	'Souls',
	'Angels',
	'Demons',
	'Ghosts',
	'Spirits',
	'Flowers',
	'Roses',
	'Thorns',
	'Wings',
	'Chains',
	'Mirrors',
	'Diamonds',
	'Secrets',
	'Promises',
	'Lies',
	'Truth',
	'Silence',
	'Noise',
	'Rhythm',
	'Melody',
	'Harmony',
	'Discord',
	'Revolution',
	'Rebellion',
	'Empire',
	'Kingdom',
	'Wasteland',
	'Garden',
	'Storm',
	'Calm'
];

// ============================================================================
// VERBS
// ============================================================================

export const VERBS = [
	'Dancing',
	'Running',
	'Flying',
	'Falling',
	'Walking',
	'Dreaming',
	'Singing',
	'Crying',
	'Laughing',
	'Burning',
	'Fading',
	'Rising',
	'Breaking',
	'Building',
	'Chasing',
	'Losing',
	'Finding',
	'Fighting',
	'Loving',
	'Hiding',
	'Seeking',
	'Waiting',
	'Believing',
	'Forgetting',
	'Remembering',
	'Wandering',
	'Escaping',
	'Returning',
	'Sailing',
	'Driving'
];

// ============================================================================
// EMOTIONS
// ============================================================================

export const EMOTIONS = [
	'Lonely',
	'Happy',
	'Sad',
	'Angry',
	'Peaceful',
	'Restless',
	'Hopeful',
	'Desperate',
	'Joyful',
	'Melancholy',
	'Ecstatic',
	'Anxious',
	'Calm',
	'Wild',
	'Tender',
	'Bitter',
	'Sweet',
	'Numb',
	'Alive',
	'Empty',
	'Full',
	'Broken',
	'Whole',
	'Lost',
	'Found'
];

// ============================================================================
// PLACES
// ============================================================================

export const PLACES = [
	'Tokyo',
	'Paradise',
	'California',
	'Vegas',
	'Memphis',
	'Nashville',
	'Brooklyn',
	'London',
	'Paris',
	'Berlin',
	'Heaven',
	'Hell',
	'Nowhere',
	'Yesterday',
	'Tomorrow',
	'Midnight',
	'Dawn',
	'Sunset',
	'The City',
	'The Country',
	'The Mountains',
	'The Valley',
	'The Ocean',
	'The Desert',
	'The Forest',
	'The Stars',
	'The Shadows',
	'The Light',
	'The Dark',
	'The End',
	'The Beginning',
	'The Edge',
	'The Center',
	'The Void',
	'Eternity'
];

// ============================================================================
// ARTIST NAME COMPONENTS
// ============================================================================

export const ARTIST_PREFIXES = [
	'DJ',
	'MC',
	'Lil',
	'Big',
	'Young',
	'Old',
	'Lady',
	'Lord',
	'The',
	'Professor',
	'Doctor',
	'Captain',
	'Major',
	'Saint'
];

export const ARTIST_NOUNS = [
	'Wolf',
	'Dragon',
	'Phoenix',
	'Raven',
	'Tiger',
	'Lion',
	'Eagle',
	'Serpent',
	'Shadow',
	'Ghost',
	'Angel',
	'Demon',
	'Prophet',
	'Poet',
	'Dreamer',
	'Wanderer',
	'Stranger',
	'Rebel',
	'King',
	'Queen',
	'Prince',
	'Princess',
	'Knight',
	'Warrior',
	'Sage',
	'Oracle',
	'Muse',
	'Siren',
	'Thunder',
	'Lightning',
	'Storm',
	'Rain',
	'Sun',
	'Moon',
	'Star',
	'Comet',
	'Nova',
	'Eclipse',
	'Void',
	'Chaos'
];

export const ARTIST_ADJECTIVES = [
	'Dark',
	'Bright',
	'Wild',
	'Tame',
	'Lost',
	'Found',
	'Broken',
	'Fixed',
	'Twisted',
	'Straight',
	'Electric',
	'Acoustic',
	'Digital',
	'Analog',
	'Neon',
	'Shadow',
	'Golden',
	'Silver',
	'Crimson',
	'Azure',
	'Violet',
	'Scarlet',
	'Midnight',
	'Dawn'
];

// ============================================================================
// ALBUM NAME COMPONENTS
// ============================================================================

export const ALBUM_ADJECTIVES = [
	'Greatest',
	'Lost',
	'Final',
	'First',
	'Last',
	'Best',
	'Essential',
	'Complete',
	'Definitive',
	'Ultimate',
	'Perfect',
	'Broken',
	'Unfinished',
	'Forgotten',
	'Legendary',
	'Infamous',
	'Secret',
	'Hidden',
	'Forbidden',
	'Sacred'
];

export const ALBUM_NOUNS = [
	'Collection',
	'Anthology',
	'Chronicles',
	'Sessions',
	'Recordings',
	'Works',
	'Pieces',
	'Movements',
	'Symphonies',
	'Stories',
	'Tales',
	'Legends',
	'Myths',
	'Dreams',
	'Visions',
	'Reflections',
	'Memories',
	'Moments',
	'Years',
	'Days',
	'Nights'
];

// ============================================================================
// GENRE-SPECIFIC MODIFIERS
// ============================================================================

export const GENRE_WORDS: Record<Genre, { adjectives: string[]; nouns: string[]; verbs: string[] }> = {
	'pop': {
		adjectives: ['Sweet', 'Bright', 'Happy', 'Shiny', 'Perfect', 'Candy', 'Sugar', 'Neon'],
		nouns: ['Love', 'Hearts', 'Dreams', 'Stars', 'Feelings', 'Vibes', 'Moments', 'Summer'],
		verbs: ['Dancing', 'Loving', 'Shining', 'Celebrating', 'Living', 'Feeling']
	},
	'hip-hop': {
		adjectives: ['Real', 'Street', 'Hood', 'Wild', 'Raw', 'True', 'Hard', 'Fresh'],
		nouns: ['Streets', 'City', 'Hustle', 'Money', 'Game', 'Life', 'Dreams', 'Empire'],
		verbs: ['Running', 'Chasing', 'Fighting', 'Rising', 'Grinding', 'Building']
	},
	'rock': {
		adjectives: ['Wild', 'Loud', 'Hard', 'Heavy', 'Raging', 'Burning', 'Electric', 'Rebel'],
		nouns: ['Thunder', 'Fire', 'Storm', 'Revolution', 'Riot', 'Rebellion', 'Chaos', 'Rage'],
		verbs: ['Breaking', 'Burning', 'Fighting', 'Screaming', 'Raging', 'Destroying']
	},
	'electronic': {
		adjectives: ['Digital', 'Electric', 'Neon', 'Cyber', 'Synthetic', 'Virtual', 'Future', 'Tech'],
		nouns: ['Pulse', 'Signal', 'Circuit', 'Matrix', 'Grid', 'Wave', 'Frequency', 'Data'],
		verbs: ['Processing', 'Computing', 'Transmitting', 'Syncing', 'Loading', 'Connecting']
	},
	'country': {
		adjectives: ['Lonesome', 'Country', 'Southern', 'Dusty', 'Simple', 'Honest', 'Heartland', 'Backroad'],
		nouns: ['Highway', 'Road', 'Home', 'Heart', 'Memories', 'Tears', 'Whiskey', 'Rain'],
		verbs: ['Driving', 'Walking', 'Leaving', 'Missing', 'Crying', 'Remembering']
	},
	'jazz': {
		adjectives: ['Smooth', 'Cool', 'Blue', 'Velvet', 'Midnight', 'Elegant', 'Sophisticated', 'Mellow'],
		nouns: ['Melody', 'Harmony', 'Rhythm', 'Blues', 'Soul', 'Swing', 'Groove', 'Mood'],
		verbs: ['Swinging', 'Grooving', 'Flowing', 'Improvising', 'Jamming', 'Vibing']
	},
	'classical': {
		adjectives: ['Eternal', 'Sacred', 'Grand', 'Noble', 'Divine', 'Majestic', 'Timeless', 'Sublime'],
		nouns: ['Symphony', 'Sonata', 'Concerto', 'Prelude', 'Requiem', 'Nocturne', 'Etude', 'Opus'],
		verbs: ['Composing', 'Conducting', 'Performing', 'Ascending', 'Transcending', 'Echoing']
	},
	'indie': {
		adjectives: ['Indie', 'Alternative', 'Dreamy', 'Hazy', 'Nostalgic', 'Vintage', 'Lo-fi', 'Ambient'],
		nouns: ['Bedroom', 'Cassette', 'Vinyl', 'Echo', 'Reverb', 'Fuzz', 'Garage', 'Basement'],
		verbs: ['Drifting', 'Floating', 'Wandering', 'Dreaming', 'Fading', 'Reflecting']
	}
};
