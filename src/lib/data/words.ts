/**
 * Word lists for procedurally generating song and artist names
 * Each category contains hundreds of words for maximum variety
 */

import type { Genre } from '../game/types';

export const ADJECTIVES = [
  // Musical & Sonic
  "Electric", "Acoustic", "Sonic", "Melodic", "Harmonic", "Rhythmic", "Symphonic", "Lyrical",
  "Ambient", "Digital", "Analog", "Synth", "Bass", "Treble", "Alto", "Soprano",
  "Distorted", "Reverb", "Echo", "Phaser", "Chorus", "Delay", "Compressed", "Amplified",
  "Modulated", "Synthesized", "Sampled", "Looped", "Quantized", "Mastered", "Mixed", "Remixed",

  // Time & Era
  "Midnight", "Dawn", "Dusk", "Twilight", "Eternal", "Timeless", "Ancient", "Modern",
  "Future", "Retro", "Vintage", "Classic", "Contemporary", "Progressive", "Revolutionary", "Evolutionary",
  "Prehistoric", "Medieval", "Renaissance", "Victorian", "Edwardian", "Roaring", "Atomic", "Space-Age",
  "Millennial", "Gen-X", "Boomer", "Zoomer", "Tomorrow's", "Yesterday's", "Today's", "Forever",

  // Nature & Elements
  "Velvet", "Crystal", "Diamond", "Gold", "Silver", "Platinum", "Bronze", "Iron",
  "Steel", "Titanium", "Neon", "Laser", "Plasma", "Nuclear", "Solar", "Lunar",
  "Cosmic", "Stellar", "Astral", "Celestial", "Orbital", "Galactic", "Universal", "Quantum",
  "Atomic", "Molecular", "Elemental", "Primal", "Savage", "Wild", "Feral", "Untamed",
  "Natural", "Organic", "Synthetic", "Artificial", "Virtual", "Digital", "Cyber", "Meta",

  // Weather & Sky
  "Thunder", "Lightning", "Storm", "Hurricane", "Tornado", "Cyclone", "Typhoon", "Tempest",
  "Rain", "Snow", "Hail", "Sleet", "Frost", "Ice", "Frozen", "Arctic",
  "Tropical", "Desert", "Sahara", "Tundra", "Jungle", "Forest", "Ocean", "Marine",
  "Cloudy", "Foggy", "Misty", "Hazy", "Clear", "Sunny", "Bright", "Shining",

  // Size & Scale
  "Tiny", "Small", "Mini", "Micro", "Nano", "Pico", "Large", "Big",
  "Huge", "Massive", "Giant", "Colossal", "Enormous", "Gigantic", "Titanic", "Mammoth",
  "Vast", "Infinite", "Endless", "Limitless", "Boundless", "Cosmic", "Microscopic",
  "Miniature", "Compact", "Dense", "Sparse", "Thick", "Thin", "Wide", "Narrow",

  // Speed & Motion
  "Fast", "Quick", "Rapid", "Swift", "Speedy", "Lightning", "Bullet", "Rocket",
  "Slow", "Lazy", "Sluggish", "Languid", "Gradual", "Creeping", "Crawling", "Drifting",
  "Flying", "Soaring", "Gliding", "Floating", "Hovering", "Orbiting", "Spinning", "Rotating",
  "Racing", "Rushing", "Dashing", "Sprinting", "Zooming", "Blazing", "Streaking", "Flashing",

  // Light & Dark
  "Bright", "Dark", "Luminous", "Radiant", "Glowing", "Brilliant", "Dazzling", "Sparkling",
  "Dim", "Shadowy", "Murky", "Gloomy", "Dusky", "Twilight", "Dawn", "Dusk",
  "Neon", "Fluorescent", "Phosphorescent", "Bioluminescent", "Incandescent", "Iridescent", "Opalescent", "Pearlescent",
  "Black", "White", "Gray", "Silver", "Gold", "Platinum", "Bronze", "Copper",

  // Emotion & Mood
  "Happy", "Sad", "Angry", "Calm", "Wild", "Peaceful", "Chaotic", "Serene",
  "Melancholy", "Joyful", "Euphoric", "Depressed", "Anxious", "Relaxed", "Tense", "Mellow",
  "Aggressive", "Gentle", "Fierce", "Tender", "Harsh", "Soft", "Hard", "Smooth",
  "Sweet", "Bitter", "Sour", "Spicy", "Savory", "Bland", "Rich", "Plain",

  // Mystery & Magic
  "Mystic", "Mysterious", "Enigmatic", "Cryptic", "Arcane", "Esoteric", "Occult", "Secret",
  "Hidden", "Forbidden", "Sacred", "Holy", "Divine", "Blessed", "Cursed", "Damned",
  "Magical", "Enchanted", "Bewitched", "Charmed", "Hexed", "Jinxed", "Haunted", "Possessed",
  "Supernatural", "Paranormal", "Psychic", "Telepathic", "Clairvoyant", "Prophetic", "Oracular", "Visionary",

  // Military & Combat
  "Tactical", "Strategic", "Combat", "Battle", "War", "Peace", "Militant", "Pacifist",
  "Armored", "Armed", "Weaponized", "Defensive", "Offensive", "Aggressive", "Passive", "Neutral",
  "Soldier", "Warrior", "Fighter", "Champion", "Gladiator", "Samurai", "Ninja",
  "Commando", "Ranger", "Sniper", "Scout", "Recon", "Infantry", "Cavalry", "Artillery",

  // Ocean & Water
  "Oceanic", "Marine", "Aquatic", "Naval", "Maritime", "Nautical", "Seafaring", "Coastal",
  "Wave", "Tide", "Current", "Undertow", "Tsunami", "Whirlpool", "Vortex", "Maelstrom",
  "Deep", "Shallow", "Surface", "Abyss", "Trench", "Reef", "Coral", "Pearl",
  "Salty", "Briny", "Fresh", "Clear", "Murky", "Turbulent", "Calm", "Stormy",

  // Fire & Heat
  "Burning", "Blazing", "Flaming", "Fiery", "Scorching", "Searing", "Smoldering", "Smoking",
  "Hot", "Warm", "Cool", "Cold", "Freezing", "Boiling", "Steaming", "Sizzling",
  "Molten", "Lava", "Magma", "Volcanic", "Explosive", "Combustible", "Flammable", "Incendiary",
  "Ash", "Ember", "Spark", "Flame", "Inferno", "Bonfire", "Wildfire", "Hellfire",
];

export const NOUNS = [
  // Celestial & Space
  "Star", "Moon", "Sun", "Planet", "Comet", "Asteroid", "Meteor", "Galaxy",
  "Nebula", "Quasar", "Pulsar", "Supernova", "Black Hole", "White Dwarf", "Red Giant", "Neutron Star",
  "Constellation", "Orbit", "Eclipse", "Solstice", "Equinox", "Aurora", "Cosmos", "Universe",
  "Void", "Infinity", "Eternity", "Singularity", "Event Horizon", "Wormhole", "Dimension", "Parallel",

  // Emotions & Feelings
  "Love", "Hate", "Fear", "Hope", "Joy", "Sorrow", "Anger", "Peace",
  "Dream", "Nightmare", "Memory", "Fantasy", "Reality", "Illusion", "Delusion", "Vision",
  "Desire", "Passion", "Obsession", "Addiction", "Craving", "Longing", "Yearning", "Hunger",
  "Bliss", "Ecstasy", "Rapture", "Euphoria", "Melancholy", "Despair", "Anguish", "Torment",

  // Urban & City
  "City", "Street", "Avenue", "Boulevard", "Highway", "Alley", "Corner", "Square",
  "Building", "Skyscraper", "Tower", "Spire", "Roof", "Basement", "Subway", "Metro",
  "Neon", "Lights", "Signs", "Billboards", "Graffiti", "Pavement", "Concrete", "Asphalt",
  "Crowd", "Masses", "Traffic", "Rush", "Chaos", "Order", "System", "Grid",

  // Nature & Landscape
  "Mountain", "Valley", "River", "Ocean", "Desert", "Forest", "Jungle", "Tundra",
  "Island", "Peninsula", "Archipelago", "Continent", "Beach", "Shore", "Coast", "Harbor",
  "Canyon", "Plateau", "Mesa", "Butte", "Peak", "Summit", "Ridge", "Cliff",
  "Waterfall", "Rapids", "Stream", "Lake", "Pond", "Marsh", "Swamp", "Bog",

  // Weather & Atmosphere
  "Storm", "Rain", "Thunder", "Lightning", "Wind", "Breeze", "Gale", "Hurricane",
  "Snow", "Hail", "Sleet", "Fog", "Mist", "Cloud", "Sky", "Atmosphere",
  "Frost", "Ice", "Freeze", "Thaw", "Heat", "Cold", "Warmth", "Chill",
  "Pressure", "Front", "System", "Pattern", "Cycle", "Season", "Climate", "Element",

  // Time & Existence
  "Time", "Moment", "Instant", "Second", "Minute", "Hour", "Day", "Night",
  "Week", "Month", "Year", "Decade", "Century", "Millennium", "Era", "Epoch",
  "Past", "Present", "Future", "Now", "Then", "When", "Forever", "Never",
  "Beginning", "End", "Start", "Finish", "Birth", "Death", "Life", "Existence",

  // Abstract Concepts
  "Truth", "Lie", "Reality", "Fantasy", "Fact", "Fiction", "Myth", "Legend",
  "Power", "Force", "Energy", "Strength", "Weakness", "Courage", "Fear", "Bravery",
  "Freedom", "Captivity", "Liberty", "Bondage", "Independence", "Dependence", "Autonomy", "Control",
  "Chaos", "Order", "Structure", "Randomness", "Pattern", "System", "Method", "Madness",

  // Music & Sound
  "Melody", "Harmony", "Rhythm", "Beat", "Tempo", "Pitch", "Tone", "Note",
  "Chord", "Scale", "Key", "Mode", "Octave", "Interval", "Frequency", "Vibration",
  "Echo", "Reverb", "Distortion", "Feedback", "Noise", "Signal", "Wave", "Sound",
  "Song", "Tune", "Anthem", "Ballad", "Chorus", "Verse", "Refrain", "Hook",

  // Technology & Digital
  "Machine", "Robot", "Cyborg", "Android", "AI", "Algorithm", "Code", "Data",
  "Network", "Server", "Cloud", "Mainframe", "Terminal", "Interface", "Portal", "Gateway",
  "Circuit", "Chip", "Processor", "Memory", "Storage", "Cache", "Buffer", "Register",
  "Pixel", "Byte", "Bit", "Megabyte", "Gigabyte", "Terabyte", "Bandwidth", "Throughput",

  // Mythology & Legend
  "Dragon", "Phoenix", "Unicorn", "Griffin", "Basilisk", "Hydra", "Chimera", "Sphinx",
  "Titan", "Giant", "Cyclops", "Minotaur", "Centaur", "Satyr", "Nymph", "Dryad",
  "God", "Goddess", "Deity", "Divine", "Immortal", "Mortal", "Hero", "Villain",
  "Prophet", "Oracle", "Seer", "Mystic", "Sage", "Wizard", "Sorcerer", "Mage",

  // Money & Commerce
  "Dollar", "Euro", "Pound", "Yen", "Franc", "Mark", "Ruble", "Peso",
  "Cash", "Coin", "Bill", "Note", "Check", "Credit", "Debit", "Charge",
  "Price", "Cost", "Value", "Worth", "Fee", "Rate", "Tax",
  "Market", "Exchange", "Trade", "Deal", "Bargain", "Sale", "Auction", "Bid",

  // War & Conflict
  "Battle", "War", "Conflict", "Fight", "Struggle", "Combat", "Duel", "Clash",
  "Weapon", "Sword", "Gun", "Knife", "Bomb", "Missile", "Rocket", "Bullet",
  "Army", "Navy", "Airforce", "Marines", "Legion", "Regiment", "Battalion", "Squad",
  "Victory", "Defeat", "Triumph", "Loss", "Win", "Failure", "Success", "Glory",

  // Games & Play
  "Game", "Play", "Sport", "Match", "Tournament", "Championship", "League", "Season",
  "Dice", "Card", "Chess", "Poker", "Roulette", "Slot", "Jackpot", "Prize",
  "Player", "Gamer", "Champion", "Rookie", "Veteran", "Pro", "Amateur", "Master",
  "Level", "Stage", "Round", "Turn", "Move", "Strategy", "Tactic", "Gambit",
];

export const PLACES = [
  // Major Cities
  "Tokyo", "Paris", "London", "New York", "Los Angeles", "Chicago", "Berlin", "Rome",
  "Moscow", "Dubai", "Mumbai", "Shanghai", "Beijing", "Seoul", "Bangkok", "Singapore",
  "Sydney", "Melbourne", "Toronto", "Vancouver", "Montreal", "Mexico City", "Buenos Aires", "Rio",
  "Istanbul", "Athens", "Amsterdam", "Copenhagen", "Stockholm", "Oslo", "Helsinki", "Prague",

  // US Cities
  "Miami", "Boston", "Seattle", "Portland", "Austin", "Nashville", "Memphis", "Detroit",
  "Minneapolis", "Denver", "Phoenix", "Vegas", "Reno", "San Francisco", "San Diego", "Houston",
  "Dallas", "Atlanta", "Philadelphia", "Baltimore", "DC", "Brooklyn", "Manhattan", "Queens",
  "Bronx", "Cleveland", "Pittsburgh", "Cincinnati", "Milwaukee", "Kansas City", "St Louis", "Indianapolis",

  // Exotic Locations
  "Bali", "Fiji", "Maldives", "Seychelles", "Tahiti", "Morocco", "Egypt", "Kenya",
  "Madagascar", "Iceland", "Greenland", "Antarctica", "Arctic", "Siberia", "Mongolia", "Tibet",
  "Nepal", "Bhutan", "Burma", "Cambodia", "Laos", "Vietnam", "Philippines", "Indonesia",
  "Peru", "Chile", "Bolivia", "Ecuador", "Colombia", "Venezuela", "Cuba", "Jamaica",

  // Natural Wonders
  "Everest", "Alps", "Himalayas", "Andes", "Rockies", "Amazon", "Sahara", "Gobi",
  "Mojave", "Atacama", "Patagonia", "Yellowstone", "Yosemite", "Zion", "Bryce", "Arches",
  "Canyon", "Crater", "Volcano", "Glacier", "Fjord", "Geyser", "Hot Spring", "Rapids",
  "Reef", "Trench", "Ridge", "Valley", "Basin", "Delta", "Plateau", "Mesa",

  // Fictional/Metaphorical Places
  "Paradise", "Heaven", "Hell", "Purgatory", "Limbo", "Nirvana", "Valhalla", "Elysium",
  "Hades", "Olympus", "Asgard", "Atlantis", "Shangri-La", "Avalon", "Camelot", "Eden",
  "Babylon", "Sodom", "Gomorrah", "Pompeii", "Troy", "Sparta", "Thebes", "Carthage",
  "Utopia", "Dystopia", "Nowhere", "Anywhere", "Somewhere", "Everywhere", "Beyond", "Void",

  // Underground/Hidden
  "Catacombs", "Sewers", "Tunnels", "Caverns", "Caves", "Mines", "Shafts", "Vaults",
  "Bunker", "Shelter", "Hideout", "Lair", "Den", "Nest", "Burrow", "Warren",
  "Dungeon", "Prison", "Cell", "Cage", "Pit", "Abyss", "Depths", "Underworld",
  "Subway", "Metro", "Underground", "Basement", "Cellar", "Crypt", "Tomb", "Grave",

  // Sky & Above
  "Clouds", "Stratosphere", "Ionosphere", "Atmosphere", "Ozone", "Jet Stream", "Air",
  "Skies", "Heavens", "Firmament", "Zenith", "Apex", "Summit", "Peak", "Heights",
  "Tower", "Spire", "Steeple", "Pinnacle", "Crest", "Crown", "Top", "Roof",
  "Orbit", "Space", "Cosmos", "Universe", "Galaxy", "Nebula", "Void", "Infinity",

  // Water Bodies
  "Pacific", "Atlantic", "Indian", "Arctic", "Mediterranean", "Caribbean", "Baltic", "Aegean",
  "Adriatic", "Red Sea", "Black Sea", "Dead Sea", "Caspian", "Superior", "Michigan", "Erie",
  "Ontario", "Huron", "Baikal", "Tanganyika", "Victoria", "Titicaca", "Geneva", "Como",
  "Channel", "Strait", "Sound", "Bay", "Gulf", "Inlet", "Lagoon", "Estuary",

  // Establishments
  "Club", "Bar", "Lounge", "Tavern", "Pub", "Saloon", "Casino", "Theater",
  "Cinema", "Arena", "Stadium", "Coliseum", "Amphitheater", "Forum", "Hall", "Venue",
  "Hotel", "Motel", "Inn", "Lodge", "Resort", "Spa", "Retreat", "Sanctuary",
  "Mall", "Plaza", "Market", "Bazaar", "Arcade", "Gallery", "Museum", "Library",

  // Directions & Compass
  "North", "South", "East", "West", "Northwest", "Northeast", "Southwest", "Southeast",
  "Pole", "Equator", "Tropics", "Arctic Circle", "Meridian", "Parallel", "Latitude", "Longitude",
  "Horizon", "Edge", "Border", "Boundary", "Frontier", "Crossroads", "Junction", "Intersection",
  "Path", "Road", "Trail", "Route", "Way", "Highway", "Street", "Lane",
];

export const VERBS = [
  // Movement
  "Running", "Walking", "Dancing", "Flying", "Falling", "Rising", "Jumping", "Climbing",
  "Crawling", "Swimming", "Diving", "Surfing", "Skating", "Sliding", "Gliding", "Soaring",
  "Drifting", "Floating", "Sinking", "Drowning", "Racing", "Chasing", "Fleeing", "Escaping",
  "Wandering", "Roaming", "Traveling", "Journeying", "Exploring", "Discovering", "Finding", "Seeking",

  // Action & Combat
  "Fighting", "Battling", "Warring", "Clashing", "Dueling", "Sparring", "Brawling", "Scrapping",
  "Attacking", "Defending", "Protecting", "Guarding", "Shielding", "Blocking", "Parrying", "Dodging",
  "Striking", "Hitting", "Punching", "Kicking", "Slashing", "Stabbing", "Shooting", "Blasting",
  "Destroying", "Breaking", "Smashing", "Crushing", "Demolishing", "Wrecking", "Ruining", "Devastating",

  // Creation & Building
  "Building", "Creating", "Making", "Crafting", "Forging", "Molding", "Shaping", "Forming",
  "Constructing", "Assembling", "Erecting", "Raising", "Establishing", "Founding", "Starting", "Beginning",
  "Designing", "Planning", "Plotting", "Scheming", "Devising", "Inventing", "Innovating", "Engineering",
  "Growing", "Cultivating", "Nurturing", "Developing", "Evolving", "Progressing", "Advancing", "Improving",

  // Sound & Music
  "Singing", "Humming", "Whistling", "Chanting", "Shouting", "Screaming", "Yelling", "Crying",
  "Playing", "Performing", "Jamming", "Rocking", "Grooving", "Vibing", "Flowing", "Freestyling",
  "Drumming", "Strumming", "Plucking", "Picking", "Bowing", "Blowing", "Striking", "Beating",
  "Harmonizing", "Improvising", "Composing", "Arranging", "Mixing", "Mastering", "Producing", "Recording",

  // Emotion & Thought
  "Thinking", "Dreaming", "Imagining", "Visualizing", "Fantasizing", "Wondering", "Pondering", "Contemplating",
  "Feeling", "Sensing", "Experiencing", "Living", "Breathing", "Existing", "Being", "Becoming",
  "Loving", "Hating", "Fearing", "Hoping", "Wishing", "Wanting", "Needing", "Desiring",
  "Remembering", "Forgetting", "Recalling", "Reminiscing", "Nostalgia", "Longing", "Yearning", "Craving",

  // Destruction & Chaos
  "Burning", "Blazing", "Scorching", "Melting", "Vaporizing", "Disintegrating", "Exploding", "Imploding",
  "Collapsing", "Crumbling", "Decaying", "Rotting", "Withering", "Dying", "Perishing", "Vanishing",
  "Fading", "Disappearing", "Dissolving", "Evaporating", "Dispersing", "Scattering", "Fragmenting", "Shattering",
  "Corrupting", "Poisoning", "Infecting", "Spreading", "Consuming", "Devouring", "Absorbing", "Assimilating",

  // Light & Visibility
  "Shining", "Glowing", "Gleaming", "Glittering", "Sparkling", "Shimmering", "Flickering", "Flashing",
  "Fading", "Dimming", "Darkening", "Brightening", "Illuminating", "Lighting", "Blinding", "Dazzling",
  "Appearing", "Disappearing", "Vanishing", "Emerging", "Materializing", "Dissolving", "Evaporating",
  "Hiding", "Revealing", "Showing", "Concealing", "Exposing", "Uncovering", "Masking", "Unveiling",

  // Social & Connection
  "Meeting", "Greeting", "Welcoming", "Embracing", "Hugging", "Kissing", "Touching", "Holding",
  "Talking", "Speaking", "Chatting", "Conversing", "Discussing", "Debating", "Arguing", "Fighting",
  "Laughing", "Smiling", "Grinning", "Frowning", "Crying", "Weeping", "Sobbing", "Mourning",
  "Celebrating", "Partying", "Dancing", "Rejoicing", "Cheering", "Applauding", "Praising", "Honoring",

  // Technology & Digital
  "Computing", "Processing", "Calculating", "Analyzing", "Synthesizing", "Digitizing", "Encoding", "Decoding",
  "Streaming", "Downloading", "Uploading", "Sharing", "Posting", "Tweeting", "Scrolling", "Clicking",
  "Hacking", "Coding", "Programming", "Debugging", "Compiling", "Executing", "Running", "Crashing",
  "Connecting", "Networking", "Linking", "Syncing", "Backing Up", "Restoring", "Updating", "Upgrading",

  // Nature & Weather
  "Raining", "Snowing", "Hailing", "Storming", "Thundering", "Lightning", "Flooding", "Drizzling",
  "Blooming", "Blossoming", "Flowering", "Budding", "Sprouting", "Growing", "Wilting", "Withering",
  "Rustling", "Swaying", "Bending", "Breaking", "Cracking", "Splitting", "Splintering", "Shattering",
  "Flowing", "Rushing", "Gushing", "Trickling", "Dripping", "Pouring", "Streaming", "Cascading",

  // Control & Power
  "Ruling", "Controlling", "Commanding", "Ordering", "Directing", "Leading", "Guiding", "Managing",
  "Dominating", "Conquering", "Subjugating", "Enslaving", "Oppressing", "Liberating", "Freeing", "Releasing",
  "Deciding", "Choosing", "Selecting", "Picking", "Opting", "Determining", "Resolving", "Concluding",
  "Forcing", "Compelling", "Coercing", "Pressuring", "Pushing", "Pulling", "Dragging", "Hauling",
];

export const EMOTIONS = [
  // Positive
  "Joy", "Happiness", "Bliss", "Ecstasy", "Euphoria", "Delight", "Pleasure", "Contentment",
  "Love", "Affection", "Passion", "Desire", "Lust", "Adoration", "Devotion", "Infatuation",
  "Excitement", "Thrill", "Rush", "Adrenaline", "Energy", "Vigor", "Vitality", "Life",
  "Hope", "Optimism", "Faith", "Belief", "Trust", "Confidence", "Courage", "Bravery",

  // Negative
  "Sadness", "Sorrow", "Grief", "Mourning", "Melancholy", "Depression", "Despair", "Anguish",
  "Anger", "Rage", "Fury", "Wrath", "Hatred", "Loathing", "Disgust", "Contempt",
  "Fear", "Terror", "Horror", "Dread", "Anxiety", "Worry", "Panic", "Paranoia",
  "Jealousy", "Envy", "Resentment", "Bitterness", "Spite", "Malice", "Venom", "Poison",

  // Mixed/Complex
  "Nostalgia", "Longing", "Yearning", "Homesickness", "Wanderlust", "Fernweh", "Sehnsucht", "Saudade",
  "Ambivalence", "Confusion", "Doubt", "Uncertainty", "Hesitation", "Indecision", "Dilemma", "Conflict",
  "Irony", "Paradox", "Contradiction", "Oxymoron", "Juxtaposition", "Contrast", "Duality", "Dichotomy",
  "Catharsis", "Epiphany", "Revelation", "Awakening", "Realization", "Discovery", "Insight", "Understanding",

  // Intensity Levels
  "Whisper", "Murmur", "Echo", "Rumble", "Roar", "Thunder", "Explosion", "Supernova",
  "Spark", "Ember", "Flame", "Blaze", "Inferno", "Wildfire", "Apocalypse", "Armageddon",
  "Ripple", "Wave", "Surge", "Tsunami", "Flood", "Deluge", "Torrent", "Avalanche",
  "Breeze", "Wind", "Gale", "Storm", "Hurricane", "Typhoon", "Cyclone", "Maelstrom",

  // Abstract States
  "Solitude", "Isolation", "Loneliness", "Abandonment", "Rejection", "Exile", "Outcast", "Pariah",
  "Freedom", "Liberation", "Independence", "Autonomy", "Self-Determination", "Emancipation", "Release", "Escape",
  "Peace", "Tranquility", "Serenity", "Calm", "Stillness", "Quiet", "Silence", "Hush",
  "Chaos", "Turmoil", "Upheaval", "Discord", "Strife", "Conflict", "War", "Pandemonium",

  // Philosophical
  "Existence", "Being", "Nothingness", "Void", "Nihilism", "Absurdity", "Meaning", "Purpose",
  "Reality", "Illusion", "Truth", "Lie", "Authenticity", "Pretense", "Genuine", "Fake",
  "Wisdom", "Ignorance", "Knowledge", "Mystery", "Enigma", "Puzzle", "Riddle", "Secret",
  "Karma", "Destiny", "Fate", "Fortune", "Luck", "Chance", "Serendipity", "Coincidence",

  // Temporal
  "Memory", "Remembrance", "Recollection", "Recall", "Reminiscence", "Flashback", "Déjà vu", "Jamais vu",
  "Anticipation", "Expectation", "Prediction", "Premonition", "Foreboding", "Omen", "Sign", "Portent",
  "Regret", "Remorse", "Guilt", "Shame", "Embarrassment", "Humiliation", "Mortification", "Chagrin",
  "Relief", "Respite", "Reprieve", "Deliverance", "Salvation", "Redemption", "Absolution", "Forgiveness",

  // Social
  "Pride", "Vanity", "Hubris", "Arrogance", "Conceit", "Ego", "Narcissism", "Self-Love",
  "Humility", "Modesty", "Meekness", "Submission", "Deference", "Respect", "Reverence", "Awe",
  "Admiration", "Appreciation", "Gratitude", "Thankfulness", "Acknowledgment", "Recognition", "Validation", "Approval",
  "Criticism", "Judgment", "Condemnation", "Censure", "Disapproval", "Scorn", "Mockery", "Ridicule",

  // Existential
  "Wonder", "Awe", "Amazement", "Astonishment", "Surprise", "Shock", "Bewilderment", "Perplexity",
  "Boredom", "Ennui", "Tedium", "Monotony", "Routine", "Stagnation", "Inertia", "Apathy",
  "Obsession", "Fixation", "Compulsion", "Addiction", "Dependency", "Attachment", "Bondage", "Enslavement",
  "Transcendence", "Enlightenment", "Nirvana", "Satori", "Samadhi", "Moksha", "Ascension", "Elevation",

  // Physical Sensations
  "Pain", "Suffering", "Agony", "Torture", "Torment", "Misery", "Distress", "Affliction",
  "Pleasure", "Satisfaction", "Gratification", "Fulfillment", "Completion", "Wholeness", "Unity", "Harmony",
  "Numbness", "Emptiness", "Hollowness", "Vacancy", "Absence", "Lack", "Void", "Nothingness",
  "Intoxication", "Euphoria", "High", "Trip", "Rush", "Buzz", "Trance", "Delirium",
];

export const COLORS = [
  // Basic Colors
  "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown",
  "Black", "White", "Gray", "Silver", "Gold", "Bronze", "Copper", "Platinum",

  // Shades of Red
  "Crimson", "Scarlet", "Ruby", "Cherry", "Rose", "Wine", "Burgundy", "Maroon",
  "Coral", "Salmon", "Rust", "Brick", "Blood", "Fire", "Flame", "Ember",

  // Shades of Blue
  "Navy", "Azure", "Cobalt", "Sapphire", "Indigo", "Cyan", "Turquoise", "Teal",
  "Sky", "Ocean", "Ice", "Frost", "Electric", "Royal", "Midnight", "Steel",

  // Shades of Green
  "Emerald", "Jade", "Lime", "Mint", "Olive", "Forest", "Hunter", "Sage",
  "Moss", "Fern", "Pine", "Grass", "Leaf", "Sea", "Neon", "Chartreuse",

  // Shades of Yellow/Orange
  "Lemon", "Canary", "Sunshine", "Butter", "Cream", "Ivory", "Vanilla", "Champagne",
  "Amber", "Honey", "Caramel", "Toffee", "Peach", "Apricot", "Tangerine", "Mango",

  // Shades of Purple/Pink
  "Violet", "Lavender", "Lilac", "Plum", "Mauve", "Magenta", "Fuchsia", "Orchid",
  "Blush", "Bubblegum", "Carnation", "Raspberry", "Flamingo", "Hot Pink", "Neon Pink", "Rose",

  // Shades of Brown
  "Tan", "Beige", "Khaki", "Sand", "Desert", "Caramel", "Coffee", "Cocoa",
  "Chocolate", "Mocha", "Espresso", "Walnut", "Chestnut", "Mahogany", "Sienna", "Umber",

  // Shades of Gray/Black/White
  "Charcoal", "Slate", "Ash", "Smoke", "Pearl", "Ivory", "Cream", "Eggshell",
  "Obsidian", "Onyx", "Jet", "Raven", "Ebony", "Coal", "Ink", "Shadow",

  // Metallic
  "Chrome", "Titanium", "Aluminum", "Pewter", "Gunmetal", "Lead", "Zinc", "Brass",

  // Descriptive
  "Pastel", "Neon", "Fluorescent", "Metallic", "Iridescent", "Pearlescent", "Opalescent", "Prismatic",
  "Dark", "Deep", "Rich", "Intense", "Saturated", "Vivid", "Bold", "Bright",
  "Neon Pink", "Neon Blue", "Neon Yellow", "Neon Green", "Neon Orange", "Neon Purple", "Hot Pink", "Electric Blue",

  // Specialized & Unique
  "Cosmic", "Galactic", "Nebula", "Stardust", "Aurora", "Celestial", "Astral", "Ethereal",
  "Shadow", "Twilight", "Dawn", "Dusk", "Sunset", "Sunrise", "Midnight", "Moonlight",
  "Phantom", "Ghost", "Spirit", "Vapor", "Mist", "Fog", "Haze", "Smoke",
  "Digital", "Cyber", "Virtual", "Matrix", "Code", "Binary", "Pixel", "Glitch",
];

// Additional exports for artist and album names
export const ARTIST_PREFIXES = ["DJ", "MC", "Lil", "Young", "Big", "The"];

export const ARTIST_NOUNS = [
  "Wolf", "Tiger", "Dragon", "Phoenix", "Eagle", "Hawk", "Raven", "Crow",
  "Lion", "Bear", "Shark", "Snake", "Spider", "Scorpion", "Viper", "Panther",
  "King", "Queen", "Prince", "Princess", "Lord", "Lady", "Duke", "Duchess",
  "Prophet", "Priest", "Monk", "Sage", "Wizard", "Witch", "Sorcerer", "Mage",
  "Rebel", "Outlaw", "Rogue", "Bandit", "Pirate", "Thief", "Assassin", "Ninja",
  "Warrior", "Fighter", "Knight", "Champion", "Gladiator", "Hero", "Legend", "Icon",
];

export const ARTIST_ADJECTIVES = [
  "Electric", "Golden", "Silver", "Diamond", "Platinum", "Crystal", "Neon", "Cosmic",
  "Dark", "Shadow", "Midnight", "Dawn", "Sunset", "Thunder", "Lightning", "Storm",
  "Wild", "Savage", "Fierce", "Ruthless", "Brutal", "Vicious", "Deadly", "Fatal",
  "Divine", "Holy", "Sacred", "Blessed", "Cursed", "Damned", "Fallen", "Lost",
];

export const ALBUM_ADJECTIVES = [
  "Last", "First", "Final", "Ultimate", "Supreme", "Greatest", "Best", "Worst",
  "New", "Old", "Ancient", "Modern", "Future", "Past", "Present", "Eternal",
  "Secret", "Hidden", "Forbidden", "Sacred", "Cursed", "Blessed", "Chosen", "Damned",
  "Lost", "Found", "Broken", "Whole", "Perfect", "Flawed", "Pure", "Corrupt",
];

export const ALBUM_NOUNS = [
  "Chapter", "Volume", "Book", "Story", "Tale", "Saga", "Epic", "Legend",
  "Dream", "Nightmare", "Vision", "Prophecy", "Revelation", "Manifesto", "Testament", "Gospel",
  "Journey", "Quest", "Odyssey", "Adventure", "Voyage", "Expedition", "Mission", "Crusade",
  "Symphony", "Concerto", "Sonata", "Requiem", "Anthem", "Hymn", "Ballad", "Opera",
];

export const TOUR_ADJECTIVES = [
  "World", "Stadium", "Arena", "Festival", "Global", "International", "Ultimate", "Legendary",
  "Epic", "Massive", "Grand", "Supreme", "Infinite", "Eternal", "Virtual", "Digital",
  "Holographic", "AI-Generated", "Synthetic", "Algorithmic"
];

export const TOUR_NOUNS = [
  "Tour", "Experience", "Concert Series", "Live Show", "Performance", "Spectacle", "Event", "Roadshow",
  "Music Festival", "Concert Experience", "Live Experience", "Tour de Force", "Extravaganza", "Showcase",
  "Domination", "Takeover", "Revolution", "Invasion", "Conquest", "Empire Tour"
];

export const GENRE_WORDS: Record<Genre, { adjectives: string[]; nouns: string[]; verbs: string[] }> = {
  pop: {
    adjectives: ["Sparkle", "Bright", "Happy", "Sweet", "Fresh", "Clean", "Pure", "Innocent"],
    nouns: ["Star", "Heart", "Dream", "Love", "Joy", "Fun", "Party", "Dance"],
    verbs: ["Dancing", "Singing", "Celebrating", "Shining", "Glowing", "Jumping", "Playing", "Loving"]
  },
  rock: {
    adjectives: ["Wild", "Raw", "Hard", "Heavy", "Loud", "Fierce", "Rough", "Tough"],
    nouns: ["Thunder", "Lightning", "Storm", "Fire", "Steel", "Stone", "Metal", "Power"],
    verbs: ["Rocking", "Rolling", "Crushing", "Smashing", "Pounding", "Screaming", "Burning", "Exploding"]
  },
  'hip-hop': {
    adjectives: ["Street", "Urban", "Real", "Raw", "Fresh", "Fly", "Dope", "Sick"],
    nouns: ["Hustle", "Flow", "Rhyme", "Beat", "Block", "Hood", "City", "Crown"],
    verbs: ["Spitting", "Flowing", "Hustling", "Grinding", "Rhyming", "Flexing", "Bossing", "Winning"]
  },
  electronic: {
    adjectives: ["Digital", "Cyber", "Neon", "Electric", "Synthetic", "Virtual", "Binary", "Matrix"],
    nouns: ["Circuit", "Signal", "Pulse", "Wave", "Code", "Data", "System", "Grid"],
    verbs: ["Pulsing", "Transmitting", "Computing", "Processing", "Streaming", "Syncing", "Encoding", "Morphing"]
  },
  country: {
    adjectives: ["Country", "Southern", "Rustic", "Heartland", "Homegrown", "Down-home", "Backroad", "Outlaw"],
    nouns: ["Highway", "Prairie", "Sunset", "Whiskey", "Truck", "Honky-tonk", "Ranch", "River"],
    verbs: ["Riding", "Driving", "Wandering", "Rambling", "Singing", "Picking", "Strumming", "Roaming"]
  },
  indie: {
    adjectives: ["Indie", "Alternative", "Underground", "Authentic", "Real", "True", "Pure", "Honest"],
    nouns: ["Scene", "Vibe", "Sound", "Voice", "Soul", "Spirit", "Heart", "Truth"],
    verbs: ["Feeling", "Vibing", "Creating", "Expressing", "Searching", "Finding", "Discovering", "Being"]
  },
  jazz: {
    adjectives: ["Smooth", "Cool", "Mellow", "Sultry", "Silky", "Velvet", "Sophisticated", "Classic"],
    nouns: ["Blues", "Soul", "Groove", "Swing", "Rhythm", "Melody", "Harmony", "Improvisation"],
    verbs: ["Swinging", "Grooving", "Improvising", "Flowing", "Gliding", "Cruising", "Vibing", "Jamming"]
  },
  classical: {
    adjectives: ["Classical", "Orchestral", "Symphonic", "Grand", "Majestic", "Elegant", "Refined", "Timeless"],
    nouns: ["Symphony", "Concerto", "Sonata", "Movement", "Opus", "Masterpiece", "Composition", "Overture"],
    verbs: ["Conducting", "Composing", "Performing", "Harmonizing", "Orchestrating", "Arranging", "Interpreting", "Mastering"]
  }
};
