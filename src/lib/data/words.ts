/**
 * Word lists for procedurally generating song and artist names
 * Each category contains hundreds of words for maximum variety
 */

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

  // Intensity & Energy
  "Explosive", "Volcanic", "Seismic", "Tectonic", "Kinetic", "Potential", "Dynamic", "Static",
  "Charged", "Powered", "Energized", "Activated", "Ignited", "Blazing", "Burning", "Scorching",
  "Frozen", "Chilled", "Cool", "Warm", "Hot", "Boiling", "Steaming", "Sizzling",
  "Quiet", "Silent", "Loud", "Deafening", "Roaring", "Screaming", "Whispering", "Mumbling",

  // Darkness & Light
  "Dark", "Shadow", "Noir", "Black", "Obsidian", "Onyx", "Ebony", "Midnight",
  "Bright", "Radiant", "Luminous", "Brilliant", "Shimmering", "Glowing", "Glittering", "Sparkling",
  "Neon", "Fluorescent", "Phosphorescent", "Bioluminescent", "Ultraviolet", "Infrared", "X-Ray", "Gamma",
  "Pale", "Faded", "Muted", "Vivid", "Saturated", "Desaturated", "Monochrome", "Technicolor",

  // Texture & Feel
  "Smooth", "Rough", "Silky", "Velvet", "Satin", "Cotton", "Wool", "Leather",
  "Plastic", "Rubber", "Glass", "Ceramic", "Porcelain", "Marble", "Granite", "Sandstone",
  "Liquid", "Solid", "Gaseous", "Molten", "Crystalline", "Amorphous", "Viscous", "Fluid",
  "Soft", "Hard", "Tender", "Tough", "Gentle", "Harsh", "Delicate", "Rugged",

  // Size & Scale
  "Tiny", "Small", "Mini", "Micro", "Nano", "Pico", "Large", "Big",
  "Huge", "Massive", "Giant", "Colossal", "Enormous", "Gigantic", "Titanic", "Mammoth",
  "Vast", "Infinite", "Endless", "Limitless", "Boundless", "Cosmic", "Microscopic",
  "Miniature", "Compact", "Dense", "Sparse", "Thick", "Thin", "Wide", "Narrow",

  // Speed & Motion
  "Fast", "Quick", "Rapid", "Swift", "Speedy", "Lightning", "Bullet", "Rocket",
  "Slow", "Sluggish", "Lazy", "Languid", "Lethargic", "Drowsy", "Sleepy", "Hypnotic",
  "Moving", "Static", "Flowing", "Rushing", "Drifting", "Floating", "Sinking", "Rising",
  "Spinning", "Rotating", "Revolving", "Orbiting", "Circling", "Spiraling", "Twisting", "Turning",

  // Shape & Form
  "Round", "Square", "Triangle", "Circle", "Oval", "Ellipse", "Sphere", "Cube",
  "Pyramid", "Prism", "Cylinder", "Cone", "Torus", "Helix", "Spiral", "Fractal",
  "Angular", "Curved", "Straight", "Bent", "Twisted", "Warped", "Distorted", "Symmetrical",
  "Asymmetrical", "Balanced", "Unbalanced", "Centered", "Offset", "Aligned", "Misaligned", "Perfect",

  // Emotion & Mood
  "Happy", "Sad", "Angry", "Calm", "Peaceful", "Violent", "Gentle", "Fierce",
  "Loving", "Hateful", "Joyful", "Sorrowful", "Hopeful", "Desperate", "Optimistic", "Pessimistic",
  "Manic", "Depressed", "Anxious", "Relaxed", "Tense", "Loose", "Tight", "Free",
  "Trapped", "Liberated", "Imprisoned", "Released", "Bound", "Unbound", "Chained", "Unchained",

  // Abstract Concepts
  "Infinite", "Finite", "Eternal", "Temporary", "Permanent", "Fleeting", "Lasting", "Momentary",
  "Real", "Fake", "True", "False", "Honest", "Deceptive", "Genuine", "Artificial",
  "Pure", "Corrupt", "Clean", "Dirty", "Holy", "Profane", "Sacred", "Blasphemous",
  "Divine", "Demonic", "Angelic", "Devilish", "Heavenly", "Hellish", "Blessed", "Cursed",

  // Urban & Street
  "Urban", "Rural", "Suburban", "Metropolitan", "Ghetto", "Hood", "Street", "Alley",
  "Boulevard", "Avenue", "Highway", "Freeway", "Parkway", "Expressway", "Turnpike", "Interstate",
  "Downtown", "Uptown", "Midtown", "Crosstown", "Underground", "Overground", "Subway", "Elevated",
  "Concrete", "Asphalt", "Pavement", "Sidewalk", "Gravel", "Dirt", "Mud", "Clay",

  // Cultural & Social
  "Rebel", "Outlaw", "Renegade", "Maverick", "Rogue", "Vagabond", "Nomad", "Wanderer",
  "Royal", "Noble", "Peasant", "Common", "Elite", "Proletariat", "Bourgeois", "Aristocratic",
  "Punk", "Grunge", "Glam", "Gothic", "Emo", "Indie", "Alternative", "Mainstream",
  "Underground", "Overground", "Commercial", "Artistic", "Experimental", "Traditional", "Conventional", "Radical",

  // Mystical & Magical
  "Mystic", "Magic", "Enchanted", "Bewitched", "Cursed", "Blessed", "Charmed", "Hexed",
  "Psychic", "Telepathic", "Telekinetic", "Clairvoyant", "Prophetic", "Oracular", "Visionary", "Enlightened",
  "Spiritual", "Transcendent", "Immanent", "Ethereal", "Ghostly", "Spectral", "Phantom", "Wraith",
  "Zombie", "Vampire", "Werewolf", "Demon", "Angel", "Fairy", "Pixie", "Sprite",

  // Technology & Science
  "Robotic", "Mechanical", "Automated", "Programmed", "Coded", "Encrypted", "Decrypted", "Hacked",
  "Binary", "Digital", "Analog", "Hybrid", "Synthetic", "Organic", "Bionic", "Cyborg",
  "Neural", "Cerebral", "Cognitive", "Conscious", "Unconscious", "Subconscious", "Aware", "Sentient",
  "Intelligent", "Artificial", "Natural", "Evolved", "Engineered", "Designed", "Created", "Generated",

  // Colors as Adjectives
  "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown",
  "Gray", "White", "Black", "Crimson", "Scarlet", "Ruby", "Azure", "Cobalt",
  "Emerald", "Jade", "Golden", "Amber", "Violet", "Indigo", "Magenta", "Cyan",

  // Military & Combat
  "Tactical", "Strategic", "Combat", "Battle", "War", "Peace", "Militant", "Pacifist",
  "Armored", "Armed", "Weaponized", "Defensive", "Offensive", "Aggressive", "Passive", "Neutral",
  "Soldier", "Warrior", "Fighter", "Champion", "Gladiator", "Samurai", "Ninja",
  "Commando", "Ranger", "Sniper", "Scout", "Recon", "Infantry", "Cavalry", "Artillery",

  // Ocean & Water
  "Oceanic", "Marine", "Aquatic", "Naval", "Maritime", "Nautical", "Seafaring", "Coastal",
  "Deep", "Shallow", "Tidal", "Wave", "Surf", "Foam", "Spray", "Splash",
  "Wet", "Dry", "Damp", "Moist", "Humid", "Arid", "Parched", "Soaked",
  "Flooded", "Drought", "Deluge", "Torrent", "Stream", "River", "Lake", "Pond",

  // Space & Astronomy
  "Stellar", "Planetary", "Lunar", "Solar", "Cosmic", "Galactic", "Intergalactic", "Universal",
  "Nebula", "Supernova", "Quasar", "Pulsar", "Comet", "Asteroid", "Meteor", "Meteorite",
  "Satellite", "Orbital", "Spacefaring", "Interstellar", "Interplanetary", "Extraterrestrial", "Alien", "Martian",
  "Venusian", "Jovian", "Saturnian", "Neptunian", "Uranian", "Plutonian", "Mercurial", "Terran",

  // Food & Taste
  "Sweet", "Sour", "Bitter", "Salty", "Umami", "Spicy", "Mild", "Bland",
  "Tasty", "Delicious", "Savory", "Tangy", "Zesty", "Pungent", "Aromatic", "Fragrant",
  "Fresh", "Stale", "Rotten", "Ripe", "Unripe", "Raw", "Cooked", "Baked",
  "Fried", "Grilled", "Roasted", "Boiled", "Steamed", "Smoked", "Cured", "Pickled",

  // Animals & Creatures
  "Feline", "Canine", "Bovine", "Equine", "Avian", "Reptilian", "Amphibian", "Aquatic",
  "Mammalian", "Insect", "Arachnid", "Crustacean", "Mollusk", "Predatory", "Prey", "Herbivore",
  "Carnivore", "Omnivore", "Scavenger", "Hunter", "Hunted", "Wild", "Domestic", "Tame",
  "Feral", "Savage", "Fierce", "Gentle", "Docile", "Aggressive", "Territorial", "Migratory",

  // Supernatural & Horror
  "Haunted", "Possessed", "Exorcised", "Paranormal", "Supernatural", "Occult", "Esoteric", "Arcane",
  "Forbidden", "Taboo", "Profane", "Unholy", "Damned", "Doomed", "Fated", "Destined",
  "Ominous", "Sinister", "Menacing", "Threatening", "Harmless", "Benign", "Malignant", "Benevolent",
  "Malevolent", "Evil", "Good", "Neutral", "Chaotic", "Lawful", "Orderly", "Random",

  // Economics & Business
  "Rich", "Poor", "Wealthy", "Broke", "Loaded", "Bankrupt", "Profitable", "Deficit",
  "Premium", "Budget", "Luxury", "Economy", "First-Class", "Coach", "Business", "Executive",
  "Corporate", "Independent", "Franchise", "Startup", "Established", "Legacy", "Heritage", "Modern",
  "Innovative", "Conservative", "Progressive", "Regressive", "Forward", "Backward", "Lateral", "Vertical",
];

export const NOUNS = [
  // Natural Phenomena
  "Thunder", "Lightning", "Storm", "Rain", "Snow", "Hail", "Wind", "Breeze",
  "Hurricane", "Tornado", "Cyclone", "Typhoon", "Tsunami", "Earthquake", "Avalanche", "Landslide",
  "Volcano", "Eruption", "Lava", "Magma", "Ash", "Smoke", "Fire", "Flame",
  "Inferno", "Blaze", "Spark", "Ember", "Coal", "Cinder", "Soot", "Char",

  // Celestial Bodies
  "Sun", "Moon", "Star", "Planet", "Comet", "Asteroid", "Meteor", "Meteorite",
  "Galaxy", "Nebula", "Supernova", "Black Hole", "Quasar", "Pulsar", "Constellation", "Aurora",
  "Eclipse", "Solstice", "Equinox", "Orbit", "Satellite", "Rocket", "Spaceship", "Station",
  "Cosmos", "Universe", "Void", "Infinity", "Eternity", "Time", "Space", "Dimension",

  // Abstract Concepts
  "Dreams", "Nightmares", "Visions", "Hallucinations", "Illusions", "Reality", "Fantasy", "Fiction",
  "Truth", "Lies", "Deception", "Honesty", "Betrayal", "Loyalty", "Trust", "Faith",
  "Hope", "Despair", "Joy", "Sorrow", "Love", "Hate", "Passion", "Apathy",
  "Desire", "Need", "Want", "Lust", "Greed", "Envy", "Pride", "Sloth",

  // Emotions & States
  "Ecstasy", "Agony", "Bliss", "Misery", "Euphoria", "Depression", "Mania", "Melancholy",
  "Rage", "Serenity", "Chaos", "Order", "Harmony", "Discord", "Peace", "War",
  "Freedom", "Slavery", "Liberty", "Bondage", "Independence", "Dependence", "Autonomy", "Control",
  "Power", "Weakness", "Strength", "Frailty", "Courage", "Fear", "Bravery", "Cowardice",

  // Time & Seasons
  "Dawn", "Dusk", "Twilight", "Midnight", "Noon", "Morning", "Evening", "Night",
  "Day", "Week", "Month", "Year", "Decade", "Century", "Millennium", "Era",
  "Spring", "Summer", "Autumn", "Winter", "Solstice", "Equinox", "Season", "Cycle",
  "Yesterday", "Today", "Tomorrow", "Past", "Present", "Future", "Forever", "Never",

  // Urban Elements
  "City", "Town", "Village", "Metropolis", "Borough", "District", "Quarter", "Neighborhood",
  "Street", "Avenue", "Boulevard", "Alley", "Road", "Highway", "Freeway", "Parkway",
  "Building", "Skyscraper", "Tower", "Apartment", "House", "Mansion", "Castle", "Palace",
  "Bridge", "Tunnel", "Subway", "Station", "Terminal", "Airport", "Seaport", "Harbor",

  // Nature & Landscape
  "Mountain", "Valley", "Canyon", "Gorge", "Cliff", "Peak", "Summit", "Ridge",
  "Hill", "Plateau", "Plain", "Prairie", "Meadow", "Field", "Garden", "Park",
  "Forest", "Woods", "Jungle", "Rainforest", "Grove", "Thicket", "Bush", "Shrub",
  "Desert", "Oasis", "Dune", "Wasteland", "Tundra", "Steppe", "Savanna", "Grassland",

  // Water Bodies
  "Ocean", "Sea", "Bay", "Gulf", "Strait", "Channel", "Sound", "Fjord",
  "Lake", "Pond", "Pool", "Lagoon", "Reservoir", "Basin", "Wetland", "Marsh",
  "River", "Stream", "Creek", "Brook", "Rapids", "Waterfall", "Cascade", "Cataract",
  "Wave", "Tide", "Current", "Undertow", "Ripple", "Splash", "Spray", "Foam",

  // Animals
  "Wolf", "Tiger", "Lion", "Bear", "Eagle", "Hawk", "Raven", "Crow",
  "Dragon", "Phoenix", "Unicorn", "Griffin", "Pegasus", "Sphinx", "Hydra", "Chimera",
  "Serpent", "Snake", "Viper", "Cobra", "Python", "Anaconda", "Rattler", "Adder",
  "Shark", "Whale", "Dolphin", "Octopus", "Squid", "Jellyfish", "Manta", "Barracuda",

  // Mythical & Fantasy
  "Angel", "Demon", "Devil", "God", "Goddess", "Deity", "Immortal", "Spirit",
  "Ghost", "Phantom", "Specter", "Wraith", "Shade", "Shadow", "Soul", "Essence",
  "Magic", "Spell", "Curse", "Charm", "Hex", "Jinx", "Enchantment", "Incantation",
  "Wizard", "Witch", "Sorcerer", "Warlock", "Mage", "Shaman", "Druid", "Priest",

  // Music & Sound
  "Melody", "Harmony", "Rhythm", "Beat", "Pulse", "Tempo", "Groove", "Swing",
  "Note", "Chord", "Scale", "Key", "Mode", "Interval", "Octave", "Pitch",
  "Song", "Tune", "Anthem", "Ballad", "Symphony", "Concerto", "Sonata", "Opera",
  "Voice", "Choir", "Chorus", "Verse", "Hook", "Refrain", "Bridge", "Solo",

  // Technology
  "Machine", "Robot", "Android", "Cyborg", "AI", "Algorithm", "Code", "Program",
  "Computer", "Server", "Network", "Internet", "Web", "Cloud", "Database", "System",
  "Circuit", "Chip", "Processor", "Memory", "Drive", "Disk", "Screen", "Monitor",
  "Signal", "Frequency", "Wavelength", "Bandwidth", "Data", "Information", "Byte", "Bit",

  // Light & Dark
  "Light", "Dark", "Shadow", "Shade", "Glow", "Shine", "Gleam", "Glimmer",
  "Shimmer", "Sparkle", "Glitter", "Flash", "Flare", "Beam", "Ray", "Laser",
  "Neon", "LED", "Bulb", "Lamp", "Torch", "Candle", "Lantern", "Beacon",
  "Eclipse", "Twilight", "Dusk", "Dawn", "Sunrise", "Sunset", "Noon", "Midnight",

  // Weapons & Combat
  "Sword", "Blade", "Knife", "Dagger", "Axe", "Hammer", "Mace", "Spear",
  "Arrow", "Bow", "Gun", "Pistol", "Rifle", "Cannon", "Missile", "Rocket",
  "Bomb", "Grenade", "Mine", "Torpedo", "Warhead", "Nuke", "Laser", "Plasma",
  "Shield", "Armor", "Helmet", "Gauntlet", "Breastplate", "Chainmail", "Plate", "Guard",

  // Precious Materials
  "Gold", "Silver", "Platinum", "Diamond", "Ruby", "Emerald", "Sapphire", "Topaz",
  "Pearl", "Jade", "Onyx", "Opal", "Amethyst", "Garnet", "Turquoise", "Coral",
  "Crystal", "Gem", "Jewel", "Treasure", "Riches", "Wealth", "Fortune", "Prize",
  "Crown", "Throne", "Scepter", "Ring", "Amulet", "Talisman", "Artifact", "Relic",

  // Elements & Materials
  "Fire", "Water", "Earth", "Air", "Metal", "Wood", "Ice", "Stone",
  "Steel", "Iron", "Copper", "Bronze", "Brass", "Titanium", "Aluminum", "Chromium",
  "Glass", "Crystal", "Plastic", "Rubber", "Leather", "Fabric", "Silk", "Cotton",
  "Concrete", "Cement", "Mortar", "Brick", "Marble", "Granite", "Limestone", "Sandstone",

  // Body & Anatomy
  "Heart", "Soul", "Mind", "Brain", "Blood", "Bone", "Flesh", "Skin",
  "Eye", "Vision", "Sight", "Gaze", "Stare", "Glance", "Look", "View",
  "Hand", "Fist", "Finger", "Palm", "Grip", "Touch", "Feel", "Sense",
  "Voice", "Scream", "Whisper", "Shout", "Cry", "Laugh", "Sigh", "Breath",

  // Vehicles & Transport
  "Car", "Truck", "Bus", "Train", "Plane", "Ship", "Boat", "Yacht",
  "Motorcycle", "Bike", "Scooter", "Skateboard", "Roller", "Wheels", "Engine", "Motor",
  "Rocket", "Shuttle", "Capsule", "Module", "Lander", "Rover", "Probe", "Satellite",
  "Helicopter", "Jet", "Bomber", "Fighter", "Carrier", "Destroyer", "Cruiser", "Submarine",

  // Buildings & Structures
  "Tower", "Spire", "Steeple", "Dome", "Arch", "Column", "Pillar", "Beam",
  "Wall", "Gate", "Door", "Window", "Roof", "Floor", "Foundation", "Cornerstone",
  "Temple", "Church", "Cathedral", "Mosque", "Shrine", "Altar", "Chapel", "Abbey",
  "Factory", "Mill", "Plant", "Workshop", "Studio", "Lab", "Office", "Warehouse",

  // Food & Drink
  "Sugar", "Spice", "Salt", "Pepper", "Honey", "Syrup", "Sauce", "Gravy",
  "Wine", "Beer", "Whiskey", "Vodka", "Rum", "Gin", "Tequila", "Sake",
  "Coffee", "Tea", "Milk", "Cream", "Butter", "Cheese", "Bread", "Cake",
  "Chocolate", "Vanilla", "Strawberry", "Cherry", "Lemon", "Lime", "Orange", "Apple",

  // Games & Entertainment
  "Dice", "Card", "Chip", "Token", "Piece", "Board", "Game", "Play",
  "Theater", "Stage", "Screen", "Cinema", "Film", "Movie", "Show", "Performance",
  "Dance", "Ballet", "Waltz", "Tango", "Salsa", "Swing", "Hip-Hop", "Breakdance",
  "Sport", "Race", "Match", "Game", "Contest", "Tournament", "Championship", "League",

  // Crime & Mystery
  "Crime", "Mystery", "Secret", "Clue", "Evidence", "Proof", "Alibi", "Motive",
  "Suspect", "Witness", "Detective", "Inspector", "Agent", "Spy", "Thief", "Robber",
  "Heist", "Caper", "Scheme", "Plot", "Plan", "Conspiracy", "Cover-Up", "Scandal",
  "Murder", "Theft", "Burglary", "Robbery", "Fraud", "Scam", "Con", "Hustle",

  // Communication
  "Message", "Signal", "Sign", "Symbol", "Code", "Cipher", "Script", "Text",
  "Letter", "Word", "Phrase", "Sentence", "Paragraph", "Chapter", "Book", "Novel",
  "Story", "Tale", "Legend", "Myth", "Fable", "Parable", "Epic", "Saga",
  "News", "Report", "Article", "Feature", "Column", "Editorial", "Opinion", "Review",

  // Money & Commerce
  "Dollar", "Euro", "Pound", "Yen", "Franc", "Mark", "Ruble", "Peso",
  "Cash", "Coin", "Bill", "Note", "Check", "Credit", "Debit", "Charge",
  "Price", "Cost", "Value", "Worth", "Fee", "Rate", "Tax",
  "Market", "Exchange", "Trade", "Deal", "Bargain", "Sale", "Auction", "Bid",

  // War & Conflict
  "Battle", "War", "Conflict", "Fight", "Struggle", "Combat", "Duel", "Clash",
  "Siege", "Assault", "Attack", "Raid", "Strike", "Offensive", "Defense", "Counter",
  "Victory", "Defeat", "Triumph", "Loss", "Win", "Fail", "Conquest", "Surrender",
  "Peace", "Treaty", "Truce", "Armistice", "Ceasefire", "Agreement", "Pact", "Alliance",

  // Science & Research
  "Experiment", "Test", "Trial", "Study", "Research", "Investigation", "Analysis", "Examination",
  "Theory", "Hypothesis", "Thesis", "Axiom", "Theorem", "Law", "Principle", "Rule",
  "Discovery", "Invention", "Innovation", "Breakthrough", "Advance", "Progress", "Development", "Evolution",
  "Atom", "Molecule", "Cell", "Gene", "DNA", "RNA", "Protein", "Enzyme",

  // Fashion & Style
  "Style", "Fashion", "Trend", "Vogue", "Chic", "Glam", "Punk", "Grunge",
  "Leather", "Denim", "Silk", "Velvet", "Lace", "Satin", "Sequin", "Rhinestone",
  "Jacket", "Coat", "Dress", "Suit", "Tux", "Gown", "Robe", "Cloak",
  "Hat", "Cap", "Beret", "Crown", "Tiara", "Mask", "Veil", "Scarf",
];

export const PLACES = [
  // Major World Cities
  "Tokyo", "Paris", "London", "New York", "Los Angeles", "Chicago", "Miami", "Vegas",
  "Berlin", "Moscow", "Madrid", "Rome", "Athens", "Vienna", "Prague", "Budapest",
  "Amsterdam", "Brussels", "Copenhagen", "Stockholm", "Oslo", "Helsinki", "Reykjavik", "Dublin",
  "Sydney", "Melbourne", "Auckland", "Wellington", "Brisbane", "Perth", "Adelaide", "Canberra",
  "Toronto", "Montreal", "Vancouver", "Ottawa", "Calgary", "Edmonton", "Winnipeg", "Quebec",
  "Mexico City", "Rio", "Buenos Aires", "Lima", "Santiago", "Bogota", "Caracas", "Havana",
  "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad",
  "Beijing", "Shanghai", "Hong Kong", "Seoul", "Singapore", "Bangkok", "Manila", "Jakarta",
  "Istanbul", "Dubai", "Abu Dhabi", "Riyadh", "Tehran", "Baghdad", "Damascus", "Beirut",
  "Cairo", "Casablanca", "Lagos", "Nairobi", "Cape Town", "Johannesburg", "Addis Ababa", "Kinshasa",

  // US Cities & Regions
  "Hollywood", "Nashville", "Memphis", "New Orleans", "Detroit", "Philadelphia", "Boston", "Seattle",
  "Portland", "Austin", "Dallas", "Houston", "Phoenix", "Denver", "Atlanta", "Orlando",
  "San Francisco", "San Diego", "San Antonio", "San Jose", "Sacramento", "Oakland", "Fresno", "Bakersfield",
  "Brooklyn", "Manhattan", "Bronx", "Queens", "Harlem", "SoHo", "Tribeca", "Chelsea",
  "Malibu", "Beverly Hills", "Santa Monica", "Pasadena", "Anaheim", "Burbank", "Glendale", "Compton",

  // Imaginary & Metaphorical Places
  "Paradise", "Heaven", "Hell", "Limbo", "Purgatory", "Nirvana", "Valhalla", "Elysium",
  "Atlantis", "Avalon", "Camelot", "Shangri-La", "El Dorado", "Utopia", "Dystopia", "Nowhere",
  "Wonderland", "Neverland", "Oz", "Narnia", "Hogwarts", "Middle-Earth", "Gotham", "Metropolis",
  "Underground", "Underworld", "Netherworld", "Abyss", "Void", "Liminal Space", "Twilight Zone", "Phantom Zone",

  // Geographic Features
  "Mountains", "Valley", "Canyon", "Desert", "Forest", "Jungle", "Ocean", "Sea",
  "River", "Lake", "Island", "Peninsula", "Coast", "Shore", "Beach", "Harbor",
  "Plains", "Prairie", "Tundra", "Taiga", "Savanna", "Steppe", "Marsh", "Swamp",
  "Volcano", "Crater", "Cavern", "Cave", "Grotto", "Gorge", "Ravine", "Cliff",

  // Neighborhoods & Districts
  "Downtown", "Uptown", "Midtown", "Chinatown", "Little Italy", "Koreatown", "French Quarter", "Latin Quarter",
  "Red Light District", "Financial District", "Arts District", "Theater District", "Warehouse District", "Garden District",
  "Old Town", "New Town", "Historic District", "Industrial Zone", "Commercial Zone", "Residential Area",
  "Suburbs", "Outskirts", "Borderlands", "Frontier", "Heartland", "Wasteland", "Badlands", "Hinterland",

  // Famous Locations
  "Times Square", "Sunset Strip", "Bourbon Street", "Abbey Road", "Carnaby Street", "Wall Street", "Main Street",
  "Broadway", "Madison Avenue", "Fifth Avenue", "Rodeo Drive", "Mulholland Drive", "Ventura Highway",
  "Route 66", "Highway 61", "Interstate 95", "Pacific Coast Highway", "Thunder Road", "Lonely Street",
  "Easy Street", "Mean Streets", "Electric Avenue", "Penny Lane", "Baker Street", "Tobacco Road",

  // Venues & Establishments
  "Arena", "Stadium", "Colosseum", "Amphitheater", "Theater", "Opera House", "Concert Hall", "Auditorium",
  "Club", "Lounge", "Bar", "Pub", "Tavern", "Saloon", "Speakeasy", "Dive",
  "Casino", "Palace", "Mansion", "Manor", "Estate", "Villa", "Chateau", "Palazzo",
  "Factory", "Warehouse", "Loft", "Studio", "Workshop", "Garage", "Basement", "Attic",

  // Transportation Hubs
  "Station", "Terminal", "Depot", "Junction", "Crossroads", "Intersection", "Platform", "Gate",
  "Airport", "Heliport", "Spaceport", "Seaport", "Harbor", "Dock", "Pier", "Wharf",
  "Highway", "Freeway", "Expressway", "Turnpike", "Parkway", "Boulevard", "Avenue", "Street",

  // Natural Wonders
  "Aurora", "Eclipse", "Equinox", "Solstice", "Horizon", "Skyline", "Sunset", "Sunrise",
  "Glacier", "Iceberg", "Fjord", "Geyser", "Hot Springs", "Waterfall", "Rapids", "Delta",
  "Reef", "Atoll", "Lagoon", "Oasis", "Dune", "Mesa", "Butte", "Plateau",

  // Historical & Cultural
  "Colosseum", "Parthenon", "Acropolis", "Forum", "Agora", "Ziggurat", "Pyramid", "Sphinx",
  "Temple", "Shrine", "Cathedral", "Basilica", "Monastery", "Abbey", "Chapel", "Sanctuary",
  "Castle", "Fortress", "Citadel", "Keep", "Tower", "Rampart", "Battlement", "Dungeon",

  // Cosmic Locations
  "Galaxy", "Nebula", "Constellation", "Star System", "Planet", "Moon", "Asteroid Belt", "Comet Trail",
  "Black Hole", "Wormhole", "Singularity", "Event Horizon", "Cosmic Web", "Dark Matter", "Void", "Expanse",
  "Orbit", "Trajectory", "Eclipse", "Transit", "Conjunction", "Opposition", "Zenith", "Nadir",

  // Underground & Hidden
  "Catacombs", "Tunnels", "Sewers", "Subway", "Metro", "Underground", "Basement", "Cellar",
  "Vault", "Bunker", "Shelter", "Hideout", "Lair", "Den", "Cave", "Cavern",
  "Mine", "Quarry", "Pit", "Shaft", "Well", "Cistern", "Reservoir", "Aquifer",

  // Borderlands & Edges
  "Frontier", "Border", "Edge", "Fringe", "Margin", "Periphery", "Outskirts", "Hinterland",
  "Wilderness", "Backcountry", "Outback", "Bush", "Sticks", "Boondocks", "Middle of Nowhere", "Beyond",
  "Threshold", "Gateway", "Portal", "Passage", "Crossing", "Bridge", "Causeway", "Isthmus",

  // Weather & Atmospheric
  "Eye of the Storm", "Hurricane Alley", "Tornado Valley", "Lightning Ridge", "Thunder Basin",
  "Rain Shadow", "Snow Belt", "Frost Line", "Tropics", "Arctic Circle", "Antarctic",
  "Stratosphere", "Troposphere", "Ionosphere", "Thermosphere", "Exosphere", "Atmosphere",

  // Bodies of Water (Specific)
  "Pacific", "Atlantic", "Indian Ocean", "Arctic Ocean", "Mediterranean", "Caribbean", "Baltic", "Adriatic",
  "Amazon", "Nile", "Mississippi", "Thames", "Seine", "Rhine", "Danube", "Ganges",
  "Great Lakes", "Dead Sea", "Red Sea", "Black Sea", "Caspian Sea", "Persian Gulf", "Gulf of Mexico",

  // Fictional Noir Locations
  "Shadows", "Midnight City", "Dark Corner", "Lost Highway", "Dead End", "No Exit", "Point of No Return",
  "Crossfire", "Double Cross", "Triple Cross", "Dead Drop", "Blind Alley", "Dead Letter Office",

  // Music Industry Locations
  "Tin Pan Alley", "Music Row", "Motown", "Stax", "Sun Studio", "Abbey Road Studios", "Electric Ladyland",
  "Hitsville", "Fame Studios", "Muscle Shoals", "Sunset Sound", "Capitol Studios", "Power Station",

  // Atmospheric Descriptors as Places
  "Nowhere", "Anywhere", "Everywhere", "Somewhere", "Here", "There", "Yonder", "Beyond",
  "Twilight", "Midnight", "Dawn", "Dusk", "Limbo", "Crossroads", "Junction", "Terminal",

  // More International Cities
  "Barcelona", "Lisbon", "Porto", "Seville", "Valencia", "Marseille", "Lyon", "Nice",
  "Zurich", "Geneva", "Basel", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart",
  "Warsaw", "Krakow", "Bucharest", "Sofia", "Belgrade", "Zagreb", "Ljubljana", "Bratislava",
  "Tallinn", "Riga", "Vilnius", "Minsk", "Kiev", "Odessa", "Tbilisi", "Yerevan",

  // Asian Cities
  "Kyoto", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Hiroshima",
  "Busan", "Incheon", "Daegu", "Taipei", "Kaohsiung", "Hanoi", "Ho Chi Minh City", "Phnom Penh",
  "Kuala Lumpur", "Penang", "Yangon", "Kathmandu", "Dhaka", "Karachi", "Lahore", "Islamabad",

  // African & Middle Eastern Cities
  "Marrakech", "Tangier", "Tunis", "Algiers", "Tripoli", "Alexandria", "Luxor", "Khartoum",
  "Accra", "Abidjan", "Dakar", "Bamako", "Luanda", "Maputo", "Dar es Salaam", "Kampala",
  "Jerusalem", "Tel Aviv", "Amman", "Kuwait City", "Doha", "Muscat", "Sana'a", "Manama",

  // Oceania & Pacific
  "Honolulu", "Anchorage", "Juneau", "Tahiti", "Fiji", "Samoa", "Tonga", "Guam",
  "Port Moresby", "Suva", "Noumea", "Papeete", "Darwin", "Cairns", "Hobart", "Tasmania",
];

export const VERBS = [
  // Movement & Motion
  "Running", "Walking", "Dancing", "Jumping", "Flying", "Falling", "Rising", "Sinking",
  "Climbing", "Crawling", "Sliding", "Gliding", "Soaring", "Diving", "Swimming", "Floating",
  "Drifting", "Wandering", "Roaming", "Racing", "Chasing", "Fleeing", "Escaping", "Pursuing",
  "Spinning", "Turning", "Twisting", "Rolling", "Tumbling", "Flipping", "Rotating", "Revolving",

  // Sound & Music
  "Singing", "Screaming", "Shouting", "Whispering", "Talking", "Speaking", "Crying", "Laughing",
  "Humming", "Whistling", "Chanting", "Rapping", "Beatboxing", "Harmonizing", "Echoing", "Resonating",
  "Playing", "Strumming", "Picking", "Plucking", "Bowing", "Blowing", "Drumming", "Banging",
  "Ringing", "Chiming", "Tolling", "Clanging", "Clashing", "Crashing", "Booming", "Thundering",

  // Emotional Expression
  "Loving", "Hating", "Hoping", "Fearing", "Dreaming", "Wishing", "Wanting", "Needing",
  "Feeling", "Thinking", "Wondering", "Believing", "Doubting", "Trusting", "Betraying", "Forgiving",
  "Regretting", "Remembering", "Forgetting", "Missing", "Longing", "Yearning", "Craving", "Desiring",
  "Hurting", "Healing", "Breaking", "Mending", "Crying", "Smiling", "Grinning", "Frowning",

  // Destruction & Creation
  "Breaking", "Smashing", "Crushing", "Destroying", "Demolishing", "Wrecking", "Ruining", "Shattering",
  "Building", "Creating", "Making", "Forming", "Shaping", "Molding", "Crafting", "Constructing",
  "Burning", "Blazing", "Scorching", "Melting", "Freezing", "Cooling", "Heating", "Boiling",
  "Exploding", "Imploding", "Erupting", "Bursting", "Cracking", "Splitting", "Tearing", "Ripping",

  // Light & Visibility
  "Shining", "Glowing", "Gleaming", "Glittering", "Sparkling", "Shimmering", "Flickering", "Flashing",
  "Fading", "Dimming", "Darkening", "Brightening", "Illuminating", "Lighting", "Blinding", "Dazzling",
  "Appearing", "Disappearing", "Vanishing", "Emerging", "Materializing", "Dissolving", "Evaporating",
  "Hiding", "Revealing", "Showing", "Concealing", "Exposing", "Uncovering", "Masking", "Unveiling",

  // Combat & Conflict
  "Fighting", "Battling", "Warring", "Clashing", "Dueling", "Sparring", "Brawling", "Scrapping",
  "Attacking", "Defending", "Striking", "Hitting", "Punching", "Kicking", "Stabbing", "Shooting",
  "Killing", "Dying", "Living", "Surviving", "Conquering", "Surrendering", "Winning", "Losing",
  "Bleeding", "Wounding", "Injuring", "Healing", "Recovering", "Suffering", "Enduring", "Persevering",

  // Nature & Elements
  "Raining", "Snowing", "Storming", "Thundering", "Lightning", "Blowing", "Breezing", "Gusting",
  "Flooding", "Dripping", "Pouring", "Streaming", "Flowing", "Rushing", "Cascading", "Surging",
  "Growing", "Blooming", "Wilting", "Withering", "Sprouting", "Budding", "Blossoming", "Flourishing",
  "Burning", "Smoldering", "Smoking", "Steaming", "Sizzling", "Crackling", "Roaring", "Blazing",

  // Time & Change
  "Changing", "Transforming", "Morphing", "Evolving", "Mutating", "Adapting", "Shifting", "Transitioning",
  "Beginning", "Ending", "Starting", "Finishing", "Continuing", "Stopping", "Pausing", "Resuming",
  "Aging", "Maturing", "Growing", "Developing", "Progressing", "Advancing", "Declining", "Deteriorating",
  "Repeating", "Cycling", "Recurring", "Returning", "Revolving", "Rotating", "Circling", "Looping",

  // Communication
  "Telling", "Saying", "Expressing", "Declaring", "Announcing", "Proclaiming", "Broadcasting", "Publishing",
  "Asking", "Questioning", "Inquiring", "Wondering", "Demanding", "Requesting", "Begging", "Pleading",
  "Listening", "Hearing", "Understanding", "Comprehending", "Grasping", "Interpreting", "Translating", "Decoding",
  "Writing", "Reading", "Spelling", "Typing", "Texting", "Messaging", "Emailing", "Tweeting",

  // Social Interaction
  "Meeting", "Greeting", "Welcoming", "Embracing", "Hugging", "Kissing", "Touching", "Holding",
  "Leaving", "Departing", "Abandoning", "Deserting", "Staying", "Remaining", "Lingering", "Waiting",
  "Helping", "Aiding", "Assisting", "Supporting", "Encouraging", "Motivating", "Inspiring", "Uplifting",
  "Hurting", "Harming", "Damaging", "Wounding", "Injuring", "Insulting", "Offending", "Betraying",

  // Mental Activities
  "Thinking", "Pondering", "Contemplating", "Meditating", "Reflecting", "Considering", "Deliberating", "Reasoning",
  "Imagining", "Visualizing", "Envisioning", "Dreaming", "Fantasizing", "Hallucinating", "Daydreaming", "Spacing",
  "Learning", "Studying", "Analyzing", "Examining", "Investigating", "Researching", "Exploring", "Discovering",
  "Solving", "Resolving", "Figuring", "Calculating", "Computing", "Processing", "Analyzing", "Synthesizing",

  // Physical States
  "Sleeping", "Waking", "Resting", "Relaxing", "Lounging", "Lying", "Sitting", "Standing",
  "Breathing", "Panting", "Gasping", "Choking", "Coughing", "Sneezing", "Yawning", "Sighing",
  "Eating", "Drinking", "Tasting", "Swallowing", "Chewing", "Biting", "Licking", "Sucking",
  "Sweating", "Shivering", "Trembling", "Shaking", "Quaking", "Quivering", "Vibrating", "Pulsing",

  // Possession & Exchange
  "Having", "Owning", "Possessing", "Holding", "Keeping", "Retaining", "Maintaining", "Preserving",
  "Giving", "Taking", "Receiving", "Accepting", "Refusing", "Rejecting", "Denying", "Granting",
  "Buying", "Selling", "Trading", "Exchanging", "Bartering", "Dealing", "Negotiating", "Bargaining",
  "Stealing", "Robbing", "Looting", "Plundering", "Pillaging", "Snatching", "Grabbing", "Seizing",

  // Technology & Media
  "Streaming", "Downloading", "Uploading", "Posting", "Sharing", "Liking", "Following", "Subscribing",
  "Coding", "Programming", "Hacking", "Debugging", "Compiling", "Executing", "Running", "Processing",
  "Recording", "Playing", "Pausing", "Rewinding", "Fast-forwarding", "Skipping", "Shuffling", "Repeating",
  "Broadcasting", "Transmitting", "Receiving", "Tuning", "Scanning", "Searching", "Browsing", "Surfing",

  // Performance & Entertainment
  "Performing", "Acting", "Starring", "Featuring", "Appearing", "Showcasing", "Presenting", "Demonstrating",
  "Entertaining", "Amusing", "Delighting", "Charming", "Captivating", "Mesmerizing", "Enchanting", "Bewitching",
  "Dancing", "Prancing", "Swaying", "Grooving", "Bopping", "Rocking", "Rolling", "Jamming",
  "Improvising", "Freestyling", "Riffing", "Jamming", "Noodling", "Experimenting", "Exploring", "Innovating",

  // Atmospheric & Weather
  "Drizzling", "Pouring", "Sleeting", "Hailing", "Misting", "Fogging", "Clouding", "Clearing",
  "Heating", "Cooling", "Warming", "Chilling", "Freezing", "Thawing", "Melting", "Condensing",
  "Blowing", "Howling", "Whistling", "Roaring", "Whipping", "Swirling", "Churning", "Gusting",

  // Intensity & Power
  "Intensifying", "Amplifying", "Magnifying", "Strengthening", "Powering", "Energizing", "Charging", "Boosting",
  "Weakening", "Fading", "Diminishing", "Dwindling", "Waning", "Declining", "Decreasing", "Reducing",
  "Exploding", "Bursting", "Erupting", "Detonating", "Igniting", "Sparking", "Triggering", "Activating",
  "Controlling", "Commanding", "Directing", "Guiding", "Leading", "Ruling", "Governing", "Dominating",

  // Searching & Finding
  "Searching", "Seeking", "Hunting", "Looking", "Finding", "Discovering", "Locating", "Detecting",
  "Exploring", "Investigating", "Examining", "Inspecting", "Scrutinizing", "Studying", "Observing", "Watching",
  "Tracking", "Tracing", "Following", "Trailing", "Stalking", "Pursuing", "Chasing", "Hunting",
  "Losing", "Misplacing", "Dropping", "Abandoning", "Forgetting", "Neglecting", "Ignoring", "Overlooking",

  // Transformation
  "Becoming", "Turning", "Converting", "Transforming", "Metamorphosing", "Transmuting", "Changing", "Shifting",
  "Rising", "Ascending", "Climbing", "Soaring", "Elevating", "Lifting", "Raising", "Hoisting",
  "Falling", "Descending", "Dropping", "Plummeting", "Plunging", "Diving", "Sinking", "Lowering",
  "Spreading", "Expanding", "Growing", "Swelling", "Inflating", "Bloating", "Enlarging", "Extending",

  // Edge & Extreme
  "Pushing", "Pulling", "Dragging", "Hauling", "Tugging", "Yanking", "Jerking", "Wrenching",
  "Crushing", "Squeezing", "Compressing", "Pressing", "Mashing", "Grinding", "Pulverizing", "Powdering",
  "Stretching", "Extending", "Reaching", "Grasping", "Clutching", "Gripping", "Clenching", "Clasping",
  "Bending", "Flexing", "Twisting", "Warping", "Contorting", "Distorting", "Deforming", "Reshaping",
];

export const EMOTIONS = [
  // Positive Emotions
  "Euphoric", "Ecstatic", "Elated", "Jubilant", "Thrilled", "Exhilarated", "Delighted", "Overjoyed",
  "Happy", "Joyful", "Cheerful", "Gleeful", "Merry", "Jolly", "Jovial", "Buoyant",
  "Content", "Satisfied", "Pleased", "Gratified", "Fulfilled", "Serene", "Peaceful", "Tranquil",
  "Excited", "Eager", "Enthusiastic", "Passionate", "Zealous", "Fervent", "Ardent", "Animated",

  // Love & Affection
  "Loving", "Adoring", "Devoted", "Affectionate", "Tender", "Caring", "Compassionate", "Warm",
  "Romantic", "Passionate", "Amorous", "Enamored", "Smitten", "Infatuated", "Besotted", "Enchanted",
  "Attached", "Connected", "Bonded", "United", "Intimate", "Close", "Familiar", "Fond",
  "Nostalgic", "Sentimental", "Wistful", "Yearning", "Longing", "Pining", "Aching", "Craving",

  // Sadness & Grief
  "Sad", "Unhappy", "Sorrowful", "Mournful", "Grieving", "Lamenting", "Melancholy", "Gloomy",
  "Depressed", "Down", "Blue", "Low", "Dejected", "Despondent", "Disheartened", "Dispirited",
  "Heartbroken", "Devastated", "Crushed", "Shattered", "Broken", "Wounded", "Hurt", "Pained",
  "Lonely", "Isolated", "Abandoned", "Forsaken", "Alone", "Solitary", "Desolate", "Empty",

  // Anger & Frustration
  "Angry", "Furious", "Enraged", "Livid", "Irate", "Incensed", "Fuming", "Seething",
  "Irritated", "Annoyed", "Aggravated", "Vexed", "Irked", "Peeved", "Miffed", "Exasperated",
  "Frustrated", "Thwarted", "Stymied", "Blocked", "Hindered", "Impeded", "Obstructed", "Hampered",
  "Resentful", "Bitter", "Spiteful", "Vengeful", "Vindictive", "Hostile", "Antagonistic", "Belligerent",

  // Fear & Anxiety
  "Afraid", "Scared", "Frightened", "Terrified", "Petrified", "Horrified", "Panicked", "Alarmed",
  "Anxious", "Worried", "Nervous", "Jittery", "Uneasy", "Apprehensive", "Tense", "Stressed",
  "Paranoid", "Suspicious", "Distrustful", "Wary", "Cautious", "Guarded", "Defensive", "Vigilant",
  "Insecure", "Uncertain", "Doubtful", "Hesitant", "Tentative", "Unsure", "Wavering", "Faltering",

  // Confusion & Bewilderment
  "Confused", "Bewildered", "Perplexed", "Puzzled", "Baffled", "Mystified", "Stumped", "Flummoxed",
  "Disoriented", "Lost", "Adrift", "Unmoored", "Unanchored", "Floating", "Drifting", "Wandering",
  "Dazed", "Stunned", "Shocked", "Startled", "Surprised", "Astonished", "Amazed", "Astounded",
  "Overwhelmed", "Swamped", "Inundated", "Flooded", "Buried", "Drowned", "Submerged", "Engulfed",

  // Shame & Guilt
  "Ashamed", "Embarrassed", "Humiliated", "Mortified", "Chagrined", "Abashed", "Sheepish", "Shamefaced",
  "Guilty", "Remorseful", "Regretful", "Penitent", "Contrite", "Sorry", "Apologetic", "Repentant",
  "Dirty", "Tainted", "Sullied", "Soiled", "Stained", "Corrupted", "Defiled", "Contaminated",
  "Unworthy", "Inadequate", "Insufficient", "Deficient", "Lacking", "Wanting", "Imperfect", "Flawed",

  // Pride & Confidence
  "Proud", "Confident", "Self-assured", "Certain", "Secure", "Strong", "Powerful", "Mighty",
  "Bold", "Brave", "Courageous", "Fearless", "Daring", "Audacious", "Intrepid", "Valiant",
  "Triumphant", "Victorious", "Successful", "Accomplished", "Achieved", "Fulfilled", "Realized", "Completed",
  "Superior", "Dominant", "Commanding", "Authoritative", "Masterful", "Expert", "Skilled", "Proficient",

  // Disgust & Contempt
  "Disgusted", "Repulsed", "Revolted", "Nauseated", "Sickened", "Queasy", "Grossed Out", "Turned Off",
  "Contemptuous", "Scornful", "Disdainful", "Derisive", "Sneering", "Mocking", "Ridiculing", "Scorning",
  "Offended", "Insulted", "Affronted", "Slighted", "Snubbed", "Disrespected", "Dishonored", "Degraded",
  "Appalled", "Outraged", "Scandalized", "Shocked", "Horrified", "Aghast", "Dismayed", "Distressed",

  // Surprise & Wonder
  "Surprised", "Startled", "Shocked", "Astonished", "Amazed", "Astounded", "Stunned", "Flabbergasted",
  "Awed", "Wonderstruck", "Spellbound", "Mesmerized", "Captivated", "Enthralled", "Fascinated", "Intrigued",
  "Curious", "Inquisitive", "Interested", "Engaged", "Absorbed", "Engrossed", "Immersed", "Rapt",
  "Impressed", "Admiring", "Appreciative", "Grateful", "Thankful", "Blessed", "Fortunate", "Lucky",

  // Envy & Jealousy
  "Envious", "Jealous", "Covetous", "Desirous", "Greedy", "Acquisitive", "Possessive", "Territorial",
  "Competitive", "Rivalrous", "Combative", "Adversarial", "Challenging", "Defiant", "Rebellious", "Resistant",
  "Resentful", "Begrudging", "Bitter", "Acrimonious", "Caustic", "Harsh", "Severe", "Cutting",

  // Boredom & Apathy
  "Bored", "Uninterested", "Indifferent", "Apathetic", "Detached", "Disconnected", "Disengaged", "Uninvolved",
  "Tired", "Weary", "Exhausted", "Drained", "Depleted", "Spent", "Worn Out", "Burned Out",
  "Numb", "Deadened", "Anesthetized", "Unfeeling", "Emotionless", "Flat", "Hollow", "Vacant",
  "Listless", "Lethargic", "Sluggish", "Languid", "Torpid", "Lazy", "Idle", "Inactive",

  // Hope & Optimism
  "Hopeful", "Optimistic", "Positive", "Upbeat", "Cheerful", "Bright", "Sunny", "Radiant",
  "Inspired", "Motivated", "Driven", "Determined", "Resolved", "Committed", "Dedicated", "Devoted",
  "Ambitious", "Aspiring", "Striving", "Reaching", "Climbing", "Rising", "Ascending", "Soaring",
  "Believing", "Faithful", "Trusting", "Confident", "Assured", "Certain", "Convinced", "Persuaded",

  // Despair & Hopelessness
  "Hopeless", "Despairing", "Desperate", "Despondent", "Dejected", "Defeated", "Beaten", "Crushed",
  "Lost", "Adrift", "Stranded", "Marooned", "Abandoned", "Forsaken", "Rejected", "Unwanted",
  "Powerless", "Helpless", "Weak", "Feeble", "Impotent", "Ineffective", "Useless", "Worthless",
  "Doomed", "Cursed", "Damned", "Condemned", "Fated", "Destined", "Predetermined", "Inevitable",

  // Calm & Peace
  "Calm", "Peaceful", "Tranquil", "Serene", "Placid", "Still", "Quiet", "Silent",
  "Relaxed", "Laid-back", "Easy-going", "Carefree", "Untroubled", "Unbothered", "Unworried", "Unperturbed",
  "Balanced", "Centered", "Grounded", "Stable", "Steady", "Even", "Level", "Measured",
  "Harmonious", "Concordant", "Synchronized", "Aligned", "Unified", "Integrated", "Whole", "Complete",

  // Excitement & Energy
  "Energetic", "Vigorous", "Dynamic", "Lively", "Animated", "Spirited", "Vivacious", "Vibrant",
  "Hyper", "Manic", "Frantic", "Frenzied", "Feverish", "Hectic", "Chaotic", "Wild",
  "Pumped", "Psyched", "Stoked", "Amped", "Fired Up", "Charged", "Wired", "Buzzed",
  "Ecstatic", "Delirious", "Rapturous", "Blissful", "Transported", "Elevated", "High", "Flying",

  // Melancholy & Blues
  "Melancholic", "Pensive", "Thoughtful", "Reflective", "Contemplative", "Introspective", "Brooding", "Moody",
  "Wistful", "Nostalgic", "Reminiscent", "Sentimental", "Tender", "Bittersweet", "Poignant", "Touching",
  "Blue", "Down", "Low", "Heavy", "Weighed Down", "Burdened", "Laden", "Oppressed",
  "Forlorn", "Woeful", "Plaintive", "Mournful", "Doleful", "Lugubrious", "Somber", "Grave",

  // Tension & Stress
  "Tense", "Tight", "Wound Up", "Stressed", "Pressured", "Strained", "Stretched", "Taxed",
  "Frazzled", "Frayed", "Rattled", "Shaken", "Unsettled", "Disturbed", "Agitated", "Perturbed",
  "Edgy", "Jumpy", "Skittish", "Twitchy", "High-strung", "Uptight", "Rigid", "Stiff",
  "Volatile", "Explosive", "Combustible", "Flammable", "Unstable", "Precarious", "Dangerous", "Risky",

  // Liberation & Freedom
  "Free", "Liberated", "Released", "Unleashed", "Unbound", "Unchained", "Unshackled", "Unfettered",
  "Wild", "Untamed", "Unrestrained", "Uninhibited", "Uncontrolled", "Unchecked", "Unbridled", "Rampant",
  "Independent", "Autonomous", "Self-sufficient", "Self-reliant", "Self-governing", "Sovereign", "Emancipated", "Enfranchised",
  "Rebellious", "Defiant", "Resistant", "Insurgent", "Revolutionary", "Radical", "Subversive", "Dissident",
];

export const COLORS = [
  // Basic Colors - Extended
  "Red", "Crimson", "Scarlet", "Ruby", "Cherry", "Rose", "Blood", "Wine",
  "Burgundy", "Maroon", "Cardinal", "Vermillion", "Carmine", "Cerise", "Magenta", "Fuchsia",
  "Pink", "Blush", "Coral", "Salmon", "Peach", "Flamingo", "Bubblegum", "Hot Pink",

  "Blue", "Azure", "Cobalt", "Navy", "Royal", "Sapphire", "Cerulean", "Turquoise",
  "Teal", "Aqua", "Cyan", "Electric Blue", "Sky", "Ice", "Powder Blue", "Periwinkle",
  "Indigo", "Midnight", "Steel", "Slate", "Denim", "Ocean", "Marine", "Aegean",

  "Green", "Emerald", "Jade", "Forest", "Pine", "Moss", "Olive", "Lime",
  "Chartreuse", "Mint", "Sage", "Seafoam", "Kelly", "Hunter", "Viridian", "Malachite",
  "Neon Green", "Apple", "Grass", "Leaf", "Spring", "Shamrock", "Clover", "Fern",

  "Yellow", "Gold", "Golden", "Amber", "Honey", "Lemon", "Canary", "Butter",
  "Cream", "Ivory", "Vanilla", "Blonde", "Straw", "Mustard", "Saffron", "Maize",
  "Topaz", "Citrine", "Sunset", "Sunrise", "Daffodil", "Sunflower", "Banana", "Pineapple",

  "Orange", "Tangerine", "Mandarin", "Apricot", "Mango", "Papaya", "Pumpkin", "Carrot",
  "Rust", "Copper", "Bronze", "Tiger", "Flame", "Fire", "Sunset", "Autumn",
  "Terracotta", "Clay", "Sienna", "Burnt Orange", "Marigold", "Persimmon", "Ginger", "Cinnamon",

  "Purple", "Violet", "Lavender", "Lilac", "Plum", "Grape", "Eggplant", "Amethyst",
  "Orchid", "Mauve", "Heather", "Iris", "Pansy", "Royal Purple", "Imperial", "Regal",
  "Magenta", "Fuchsia", "Hot Purple", "Electric Purple", "Neon Purple", "Deep Purple", "Dark Purple", "Wine",

  // Neutral & Earth Tones
  "White", "Snow", "Pearl", "Ivory", "Cream", "Alabaster", "Chalk", "Milk",
  "Black", "Ebony", "Onyx", "Coal", "Jet", "Obsidian", "Midnight", "Raven",
  "Gray", "Grey", "Silver", "Platinum", "Chrome", "Steel", "Ash", "Smoke",
  "Charcoal", "Graphite", "Pewter", "Iron", "Titanium", "Nickel", "Gunmetal", "Storm",

  "Brown", "Chocolate", "Chestnut", "Coffee", "Mocha", "Espresso", "Cocoa", "Mahogany",
  "Tan", "Beige", "Sand", "Desert", "Camel", "Khaki", "Taupe", "Fawn",
  "Umber", "Sepia", "Sienna", "Ochre", "Tawny", "Russet", "Cinnamon", "Hazel",

  // Metallic & Neon
  "Neon", "Electric", "Fluorescent", "Phosphorescent", "Luminous", "Radiant", "Brilliant", "Vivid",
  "Metallic", "Chrome", "Mirror", "Reflective", "Shiny", "Glossy", "Polished", "Lustrous",
  "Gold", "Golden", "Gilt", "Gilded", "Auric", "Aureate", "Dorado", "Or",
  "Silver", "Silvery", "Argent", "Sterling", "Platinum", "Lunar", "Moonlight", "Starlight",

  // Iridescent & Special
  "Rainbow", "Prismatic", "Spectrum", "Iridescent", "Opalescent", "Pearlescent", "Holographic", "Chromatic",
  "Pastel", "Soft", "Pale", "Light", "Faded", "Muted", "Dusty", "Washed",
  "Dark", "Deep", "Rich", "Intense", "Saturated", "Vivid", "Bold", "Bright",
  "Neon Pink", "Neon Blue", "Neon Yellow", "Neon Green", "Neon Orange", "Neon Purple", "Hot Pink", "Electric Blue",

  // Specialized & Unique
  "Cosmic", "Galactic", "Nebula", "Stardust", "Aurora", "Celestial", "Astral", "Ethereal",
  "Shadow", "Twilight", "Dawn", "Dusk", "Sunset", "Sunrise", "Midnight", "Moonlight",
  "Phantom", "Ghost", "Spirit", "Vapor", "Mist", "Fog", "Haze", "Smoke",
  "Digital", "Cyber", "Virtual", "Matrix", "Code", "Binary", "Pixel", "Glitch",
];
