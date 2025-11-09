/**
 * Game Content - Flavor Text & Descriptions
 *
 * All the satirical, increasingly absurd flavor text for the game.
 * This file exports typed objects for tech tiers, exploitation abilities,
 * phase unlocks, prestige, victory conditions, and tutorial hints.
 *
 * Tone: Satirical commentary on capitalism vs art in the music industry.
 * The player is an invisible puppet master - not a public figure.
 * Content becomes increasingly absurd at higher tiers.
 */

import type { TechTier, Phase, BoostType } from '../game/types';

// ============================================================================
// TECH TIER DESCRIPTIONS
// ============================================================================

export interface TechTierContent {
	/** Full name of the tech tier */
	name: string;
	/** Short tagline (1-2 sentences) */
	tagline: string;
	/** Detailed thematic description */
	description: string;
	/** Flavor text for reaching this tier */
	unlockMessage: string;
}

/**
 * Tech tier descriptions - increasingly satirical and absurd
 * Each tier represents a step toward total automation and industry domination
 */
export const TECH_TIER_CONTENT: Record<TechTier, TechTierContent> = {
	1: {
		name: 'Third-party Web Services',
		tagline: 'Let someone else do the work. For a fee. Per song. Forever.',
		description:
			'Welcome to the gig economy of AI music. Click a button, wait 30 seconds, pay $2, and you\'re an "artist." The democratization of music creation has never been so monetized. Someone else owns the servers, the models, and probably the rights to your prompts. But hey, at least you don\'t need to learn an instrument.',
		unlockMessage:
			'You discover AI music generation services. The future of music is here, and it costs $2 per song plus a monthly subscription.'
	},

	2: {
		name: 'Lifetime Licenses/Subscriptions',
		tagline: 'One payment to rule them all. Generate unlimited slop.',
		description:
			'You\'ve unlocked the holy grail: paying once and generating forever. Songs are now FREE (after that $500 upfront investment, obviously). The floodgates are open. The algorithm demands content, and you\'re about to drown it in AI-generated tracks. Quality? Irrelevant. Quantity is the only metric that matters now.',
		unlockMessage:
			'Lifetime access purchased! Songs are now free to generate. Time to flood the market with content.'
	},

	3: {
		name: 'Local AI Models',
		tagline: 'Run the machine on YOUR hardware. Nobody can stop you now.',
		description:
			'You\'ve downloaded the forbidden knowledge - open-source AI models that run locally. No more API rate limits. No more per-song fees. Just raw computational power and electricity bills. Your GPU screams in agony as it churns out track after track. The machines work for you now. Well, you work for the electricity company, but who\'s counting?',
		unlockMessage:
			'Local models downloaded! You\'re no longer dependent on web services. Your GPU fan sounds like a jet engine, but freedom isn\'t free.'
	},

	4: {
		name: 'Fine-tuned Models',
		tagline: 'Teach the AI to copy better. Originality is overrated.',
		description:
			'Why generate generic AI music when you can train models on hit songs? You\'re not stealing - you\'re "learning from the greats." The line between inspiration and plagiarism has never been blurrier, and you\'ve got lawyers ready to defend that line. Each model specializes in a genre, optimized for maximum listener engagement (addiction) and minimal artistic merit.',
		unlockMessage:
			'Fine-tuning complete! Your AI now generates music that sounds "inspired by" everything popular. The legal team says this is totally fine.'
	},

	5: {
		name: 'Train Your Own Models',
		tagline: 'Scrape the internet. Train on everything. Ask forgiveness never.',
		description:
			'You\'re training AI from scratch using datasets "acquired" from the internet. Every YouTube video, every SoundCloud upload, every leaked demo - it\'s all training data now. Copyright is a social construct, and you\'re a postmodern entrepreneur. The models learn from billions of songs, and the original artists get nothing. But hey, you\'re creating jobs! (For your lawyers.)',
		unlockMessage:
			'Custom training pipeline operational! The entire internet is your dataset. The cease-and-desist letters are your medals of honor.'
	},

	6: {
		name: 'Build Your Own Software',
		tagline: 'Why rent tools when you can own the entire factory?',
		description:
			'You\'ve built the infrastructure from scratch. Custom inference engines. Proprietary file formats. Hardware acceleration that makes NASA jealous. You don\'t just generate music anymore - you control the fundamental building blocks of AI music creation. Other artists will eventually have to license YOUR technology. The circle of exploitation is complete.',
		unlockMessage:
			'Infrastructure complete! You now own the entire tech stack. Your proprietary format is poised to become an industry standard (that you own).'
	},

	7: {
		name: 'AI Agent Automation',
		tagline: 'Let the robots do EVERYTHING. You just watch numbers go up.',
		description:
			'Peak capitalism has been achieved. AI agents handle creation, marketing, distribution, and optimization. They A/B test song structures, manipulate social media algorithms, and schedule releases for maximum engagement. You\'re not making music anymore - you\'re farming attention at industrial scale. The agents work 24/7, never sleep, never ask for raises, and never question the ethics. It\'s beautiful, in a dystopian sort of way.',
		unlockMessage:
			'Full automation achieved! AI agents now run your empire. You are officially obsolete in your own operation. Time to watch the money printer go brrr.'
	}
};

// ============================================================================
// EXPLOITATION ABILITY DESCRIPTIONS
// ============================================================================

export interface ExploitationContent {
	/** Display name */
	name: string;
	/** Short description of what this does */
	description: string;
	/** Satirical flavor text about the ethics */
	flavorText: string;
}

/**
 * Exploitation abilities - morally questionable but profitable tactics
 * Organized by game phase, increasingly absurd and unethical
 */
export const EXPLOITATION_CONTENT: Record<BoostType, ExploitationContent> = {
	bot_streams: {
		name: 'Bot Streams',
		description: 'Deploy streaming bots to inflate play counts.',
		flavorText:
			'Sure, 90% of your plays come from bot farms in Eastern Europe, but the algorithm doesn\'t know that. Neither do the advertisers paying for those impressions. Probably. Don\'t think about it too hard.'
	},

	playlist_placement: {
		name: 'Playlist Payola',
		description: 'Pay playlist curators for placement.',
		flavorText:
			'It\'s not bribery if you call it "promotional consideration." Those curators with 2 million followers need to eat too. What a convenient coincidence that your song ended up at #1 on "Today\'s Top Hits" right after that wire transfer cleared.'
	},

	social_media_campaign: {
		name: 'Viral Marketing Campaign',
		description: 'Astroturfing and fake engagement for artificial virality.',
		flavorText:
			'Deploy an army of bot accounts to spam comment sections, manufacture trends, and create the illusion of organic popularity. If everyone\'s talking about your song (even if "everyone" is 10,000 sock puppet accounts), then it must be good, right?'
	},

	limited_edition_variants: {
		name: 'Limited Edition Variants',
		description: 'Release 47 different vinyl colors. Collectors must buy them all.',
		flavorText:
			'Seafoam green vinyl. Translucent blue vinyl. Vinyl that glows in the dark. Vinyl that smells like strawberries. Each one is "limited edition" (limited to however many people will buy them). Superfans will mortgage their houses to complete the collection. Capitalism!'
	},

	shut_down_competitors: {
		name: 'Shut Down Competitors',
		description: 'DMCA takedowns and frivolous lawsuits against other artists.',
		flavorText:
			'That independent artist making bedroom pop? DMCA strike. That up-and-coming producer? Frivolous lawsuit. Anyone using a four-chord progression you\'ve used? Lawyers. Can\'t have competition if you bury them in legal fees first.'
	},

	exclusive_retailer_deals: {
		name: 'Exclusive Retailer Deals',
		description: 'Force fans to shop at specific stores for different bonus tracks.',
		flavorText:
			'Track 13 is Target exclusive. Track 14 only at Walmart. Track 15 is a Best Buy bonus. The "complete" album requires shopping at 5 different retailers. True fans will understand. (True fans will also go bankrupt.)'
	},

	scalp_records: {
		name: 'Scalp Your Own Records',
		description: 'Buy your own limited releases and resell at markup.',
		flavorText:
			'Why let scalpers make all the profit when you can cut out the middleman? Buy your own limited edition releases with shell companies, list them on resale markets at 10x markup. You\'re not exploiting fans - you\'re "creating a secondary market." Your business school professor would be so proud.'
	},

	limit_tickets: {
		name: 'Artificial Ticket Scarcity',
		description: 'Hold back tickets to create false demand and urgency.',
		flavorText:
			'The venue holds 20,000 people, but you only release 5,000 tickets. "SOLD OUT!" scream the headlines. The remaining 15,000 tickets? You\'ll release those tomorrow at triple the price. Scarcity is the ultimate marketing tool, even when it\'s completely fabricated.'
	},

	scalp_tickets: {
		name: 'Scalp Your Own Tickets',
		description: 'Partner with scalpers to resell your own tickets at 10x markup.',
		flavorText:
			'Those "scalpers" buying up all the tickets the millisecond they go on sale? That\'s your subsidiary company. You sell tickets to yourself, then resell them at 1000% markup. The fans pay $2,000 for a $200 ticket, and you get paid twice. This is what they mean by "vertical integration."'
	},

	fomo_marketing: {
		name: 'FOMO Marketing',
		description: '"Last chance ever" claims and countdown timers. Repeat monthly.',
		flavorText:
			'"FINAL TOUR - LAST CHANCE TO SEE US LIVE!" (Until the next tour in 3 months.) "LIMITED TIME ONLY!" (Until we bring it back next week.) Urgency is profitable. Truth is optional. Consumer psychology is your playground.'
	},

	dynamic_pricing: {
		name: 'Dynamic Pricing',
		description: 'Surge pricing for your own shows on your own platform.',
		flavorText:
			'You own the venue. You own the ticketing platform. You control the pricing algorithm. Tickets start at $50 and hit $5,000 within seconds due to "high demand" (demand you artificially created). It\'s not exploitation - it\'s "market-based pricing optimization." Late-stage capitalism has never looked so beautiful.'
	}
};

// ============================================================================
// PHASE UNLOCK MESSAGES
// ============================================================================

export interface PhaseContent {
	/** Phase name */
	name: string;
	/** Description of what this phase unlocks */
	description: string;
	/** Big dramatic unlock message */
	unlockMessage: string;
	/** Additional flavor text */
	flavorText: string;
}

/**
 * Phase unlock messages - celebrating each step toward industry domination
 */
export const PHASE_CONTENT: Record<Phase, PhaseContent> = {
	1: {
		name: 'Streaming Phase',
		description: 'Generate songs and earn from streams',
		unlockMessage: 'Welcome to the Content Factory',
		flavorText:
			'You\'re starting from nothing - just you, an AI music generator, and dreams of algorithmic domination. Every song is a lottery ticket. Every stream is a penny. Billions of pennies equal... well, still not much, but it\'s a start. The algorithm hungers, and you will feed it.'
	},

	2: {
		name: 'Physical Albums Phase',
		description: 'Release albums and merch for massive one-time payouts',
		unlockMessage: 'Physical Media Unlocked: Artificial Scarcity Is Go',
		flavorText:
			'Congratulations! You\'ve generated enough songs to pretend they form coherent albums. Physical releases mean real money - CDs, vinyl, cassettes (yes, people buy those again), and merch. Time to discover that manufacturing artificial scarcity is more profitable than making good music. Who knew?'
	},

	3: {
		name: 'Tours & Concerts Phase',
		description: 'Launch tours and exploit ticket markets',
		unlockMessage: 'Live Performances Unlocked: The Exploitation Intensifies',
		flavorText:
			'Your AI-generated music empire has gone viral (with help from bot farms and payola). Now it\'s time for "live" performances. Never mind that you\'re an AI - stage a hologram, hire a body double, or just sell tickets to empty venues and call it "experimental." The ticket scalping opportunities alone will make you rich.'
	},

	4: {
		name: 'Platform Ownership Phase',
		description: 'Buy industry infrastructure and control distribution',
		unlockMessage: 'Platform Acquisition Unlocked: Time to Own the Game',
		flavorText:
			'You\'re no longer just playing the game - you\'re buying the board. Streaming services, ticketing platforms, venue chains... why pay the middlemen when you can BE the middleman? Soon, other artists will be paying YOU to exploit THEIR fans. The circle of capitalism is complete.'
	},

	5: {
		name: 'Total Automation Phase',
		description: 'AI agents manage everything. You just watch.',
		unlockMessage: 'Full Automation Achieved: You Are Obsolete',
		flavorText:
			'You\'ve done it. AI agents now handle every aspect of your music empire - creation, marketing, distribution, and exploitation. You\'re not an artist anymore. You\'re not even a businessman. You\'re a spectator watching algorithms farm human attention at industrial scale. Take a moment to appreciate what you\'ve built, you beautiful monster.'
	}
};

// ============================================================================
// PRESTIGE SYSTEM FLAVOR TEXT
// ============================================================================

export interface PrestigeContent {
	/** Title for prestige action */
	actionTitle: string;
	/** Description of what happens when you prestige */
	description: string;
	/** Confirmation message */
	confirmMessage: string;
	/** Success message after prestiging */
	successMessage: string;
	/** Flavor text about creating a new artist */
	flavorText: string;
}

/**
 * Prestige system flavor text - starting over with experience
 */
export const PRESTIGE_CONTENT: PrestigeContent = {
	actionTitle: 'Create New Artist',
	description:
		'Start a fresh artist with all your technology and experience. Your previous artist becomes a legacy act, generating passive income while your new artist climbs the charts.',
	confirmMessage:
		'Create a new artist? Your current artist will become a legacy act (generating passive income), and you\'ll start fresh with a new persona. All your tech upgrades and industry control progress are kept.',
	successMessage: 'New artist created! Time to dominate the charts all over again.',
	flavorText:
		'The music industry loves a comeback story. Or a debut story. Or any story that generates streams. Your old artist is now a "legacy act" (a polite term for "played out"). But you? You\'re starting fresh with better tools, more experience, and zero shame. The algorithm awaits your return.'
};

/**
 * Messages for prestige tier unlocks
 */
export const PRESTIGE_UNLOCK_MESSAGES: Record<TechTier, string> = {
	1: '', // No prestige at tier 1
	2: '', // No prestige at tier 2
	3: 'Prestige unlocked! You can now create new artists while keeping your tech upgrades. Each new artist will benefit from your growing empire.',
	4: '', // No new prestige unlock
	5: 'Another prestige opportunity! Your legacy artists continue to earn while you build the next sensation. The empire grows.',
	6: 'Platform-level prestige available! With this much infrastructure, launching new artists is almost automatic. Almost.',
	7: 'Ultimate automation achieved! AI agents can manage infinite artists. The machine works for you now. You beautiful, efficient monster.'
};

// ============================================================================
// VICTORY SCREEN TEXT
// ============================================================================

export interface VictoryContent {
	/** Main victory title */
	title: string;
	/** Congratulations message */
	congratsMessage: string;
	/** Satirical reflection on what the player has done */
	reflection: string;
	/** Final message */
	finalMessage: string;
}

/**
 * Victory screen content - celebrating your dystopian achievement
 */
export const VICTORY_CONTENT: VictoryContent = {
	title: 'Total Industry Domination Achieved',
	congratsMessage:
		'Congratulations! You control 100% of the music industry. Every song, every stream, every ticket, every dollar - it all flows through you.',
	reflection:
		'You started with $10 and a dream. Now you own the streaming services, the ticketing platforms, the charts, the awards, and the AI models that generate everything. Independent artists pay you for tools. Fans pay you for music. Competitors pay you for the privilege of being crushed. You\'ve built a perfectly efficient machine for extracting value from human creativity and emotion.',
	finalMessage:
		'Was it worth it? Does it matter? The numbers say yes. The algorithm is satisfied. The shareholders are happy. Music is now just another optimized content feed. You\'ve won capitalism. Congratulations, you absolute monster. 🎵💰'
};

// ============================================================================
// TUTORIAL HINTS
// ============================================================================

export interface TutorialHint {
	/** Short hint title */
	title: string;
	/** Explanation text */
	text: string;
}

/**
 * Tutorial hints - explaining game mechanics with appropriate sarcasm
 */
export const TUTORIAL_HINTS: TutorialHint[] = [
	{
		title: 'Welcome to the Content Factory',
		text: 'Click "Generate Song" to create your first AI-generated track. It costs money and takes time, but that\'s capitalism for you. Songs generate passive income forever (or until the heat death of the universe, whichever comes first).'
	},
	{
		title: 'More Songs = More Money',
		text: 'Each completed song generates passive income from streams. The more songs you make, the more money you earn. Quality? Irrelevant. The algorithm rewards quantity. Always has, always will.'
	},
	{
		title: 'Fans Are Your Currency',
		text: 'Fans multiply your income and unlock new phases. They\'re not people with taste and preferences - they\'re numbers that make your numbers bigger. This is what the music industry means by "engagement."'
	},
	{
		title: 'Upgrade Your Tech',
		text: 'Better technology means faster song generation and higher income per song. Each tier brings you closer to full automation. Eventually, you won\'t even need to be involved. The dream of passive income is within reach.'
	},
	{
		title: 'Exploitation Mechanics',
		text: 'Spend money to make money via morally questionable tactics. Bot streams, playlist payola, fake viral campaigns - if it\'s profitable and technically legal (ish), it\'s a feature! Each boost is temporary but powerful.'
	},
	{
		title: 'Trending Genres',
		text: 'Research trending genres and generate songs that match. Trending songs earn more. It\'s not about artistic vision - it\'s about what the algorithm wants right now. Adapt or die.'
	},
	{
		title: 'Physical Albums',
		text: 'Once unlocked, physical albums generate massive one-time payouts. Limited editions, exclusive variants, artificial scarcity - all the tactics that make collectors weep and shareholders smile.'
	},
	{
		title: 'Tours & Concerts',
		text: 'Tours generate huge income but cost money to start. Ticket scalping, artificial scarcity, and FOMO marketing turn concerts into profit machines. Who says you need to be a real band?'
	},
	{
		title: 'Prestige System',
		text: 'Create new artists while keeping your tech and industry control. Your previous artist becomes a legacy act generating passive income. It\'s like a pyramid scheme, but for music careers!'
	},
	{
		title: 'Platform Ownership',
		text: 'Eventually you can buy the streaming services, ticketing platforms, and awards shows themselves. Why play the game when you can own it? Vertical integration has never been so profitable.'
	},
	{
		title: 'Industry Control',
		text: 'The progress bar at the top shows your stranglehold on the industry. Reach 100% to "win" - though "win" is a strange word for what you\'ve done. Congratulations in advance, you beautiful monster.'
	},
	{
		title: 'GPU Resources',
		text: 'Unlocked at tier 3, GPU resources speed up song generation. Buy GPUs with money, use them to make songs faster, make more money. It\'s the circle of computational life.'
	},
	{
		title: 'Queue System',
		text: 'Use the 1x/5x/10x/Max buttons to queue multiple songs. They\'ll generate sequentially. Early game is about clicking buttons and watching progress bars. Later game is about watching numbers go up automatically. Progress!'
	},
	{
		title: 'No Wrong Choices',
		text: 'This game has no strategic decisions - just optimization. Buy upgrades when you can afford them. Activate boosts when profitable. Progress is linear and inevitable. Like capitalism itself.'
	},
	{
		title: 'Embrace the Absurdity',
		text: 'You\'re using AI to generate music, bots to fake popularity, and exploitation mechanics to farm human attention. If this feels dystopian, that\'s because it is. But hey, numbers go up, and that\'s what matters, right?'
	}
];

// ============================================================================
// MILESTONE FLAVOR TEXT
// ============================================================================

/**
 * Messages for hitting major milestones
 */
export const MILESTONE_MESSAGES = {
	firstSong: {
		title: 'First Song Generated!',
		message:
			'Your first AI-generated track is complete. It\'s... well, it exists. That\'s something. The algorithm will decide if it\'s good. Humans are no longer part of that equation.'
	},
	tenSongs: {
		title: '10 Songs Generated',
		message:
			'You\'ve created a catalog! Or at least, the AI has. Are you an artist, a manager, a button-clicker, or just a particularly ambitious capitalist? Yes.'
	},
	hundredSongs: {
		title: '100 Songs Generated',
		message:
			'One hundred songs. Most artists don\'t make this many in a lifetime. You made them in... considerably less time. Quality may vary. (Quality definitely varies.) But quantity is its own quality!'
	},
	thousandSongs: {
		title: '1,000 Songs Generated',
		message:
			'One thousand songs. This is approaching "entire genre" levels of output. Spotify\'s algorithm is very impressed. Music critics are horrified. You\'re too busy counting money to care.'
	},
	millionDollars: {
		title: 'First Million Dollars',
		message:
			'One million dollars earned! You\'re officially a success in the music industry. Sure, it came from algorithmic farming and bot streams, but money doesn\'t judge. That\'s what makes it so beautiful.'
	},
	millionFans: {
		title: '1 Million Fans',
		message:
			'One million fans! Some of them might even be real people. The bot farms are very convincing these days. Either way, the ad revenue is genuine, and that\'s what matters.'
	},
	firstPrestige: {
		title: 'First Prestige Complete',
		message:
			'You\'ve created a new artist! Your old persona is now a legacy act. The music industry calls this "evolution." Economists call it "portfolio diversification." You call it "more money."'
	},
	firstAlbum: {
		title: 'First Album Released',
		message:
			'Your first album is out! Ten AI-generated songs packaged together and called "art." Limited edition vinyl available in 23 different colors. Collectors are crying (both emotionally and financially).'
	},
	firstTour: {
		title: 'First Tour Launched',
		message:
			'Your first tour is underway! Never mind that you\'re an AI-managed entity - fans will pay to see anything with enough marketing. Those ticket fees won\'t exploit themselves!'
	},
	platformOwner: {
		title: 'First Platform Acquired',
		message:
			'You\'ve purchased your first piece of industry infrastructure! You\'re not just playing the game anymore - you\'re starting to own it. Other artists will soon be paying YOU to exploit THEIR fans. Beautiful synergy.'
	},
	billionDollars: {
		title: 'One Billion Dollars',
		message:
			'One billion dollars. With a B. You\'ve achieved more than most artists dream of. The fact that it came from industrial-scale algorithmic farming and exploitation doesn\'t make it less real. Money is money.'
	},
	billionFans: {
		title: 'One Billion Fans',
		message:
			'One billion fans. That\'s roughly 1/8th of the global population. Either you\'ve achieved true worldwide fame, or your bot farms are working overtime. Probably both. Definitely both.'
	}
};

// ============================================================================
// ERROR / WARNING MESSAGES
// ============================================================================

/**
 * User-facing error messages with appropriate flavor
 */
export const ERROR_MESSAGES = {
	cannotAfford: {
		title: 'Cannot Afford',
		message: 'Not enough money! The cruel irony of capitalism: you need money to make money. Go generate more songs, or activate some exploitation mechanics.'
	},
	songQueueFull: {
		title: 'Queue Full',
		message: 'Your song generation queue is maxed out. Even AI has limits. Wait for the current batch to complete, or upgrade your tech for faster processing.'
	},
	cooldownActive: {
		title: 'Cooldown Active',
		message: 'This action is on cooldown. Even exploitation needs time to recharge. Patience is a virtue, even when farming human attention.'
	},
	alreadyActive: {
		title: 'Already Active',
		message: 'This boost is already running! You can\'t double-stack exploitation mechanics. Well, you CAN, but this particular one is already maxed out.'
	},
	requirementNotMet: {
		title: 'Requirements Not Met',
		message: 'You don\'t meet the requirements for this yet. Keep generating songs, earning money, and climbing toward industry domination. The corruption unlocks come with time.'
	},
	upgradePrerequisite: {
		title: 'Prerequisite Required',
		message: 'You need to purchase the previous upgrade first. Even in a morally bankrupt industry, there\'s still a tech tree to follow. Some order must exist.'
	}
};

// ============================================================================
// RANDOM FLAVOR TEXT POOLS
// ============================================================================

/**
 * Random messages that can appear during gameplay
 * Add variety and personality to the experience
 */
export const RANDOM_FLAVOR_TEXT = {
	songGeneration: [
		'AI is generating another masterpiece...',
		'Synthesizing emotions the machine has never felt...',
		'Creating content optimized for maximum engagement...',
		'The algorithm knows what you want to hear...',
		'Processing lyrics about universal human experiences...',
		'Generating authentic artificial emotion...',
		'Training data being exploited efficiently...',
		'Creating art (citation needed)...',
		'The future of music is loading...',
		'Human musicians everywhere feel a disturbance...'
	],

	boostActivation: [
		'Ethics temporarily suspended!',
		'Exploitation mode: ACTIVATED',
		'Capitalism intensifies...',
		'The algorithm will remember this.',
		'Legal team standing by...',
		'Monetization optimized!',
		'Fans\' wallets: targeted',
		'Industry disruption in progress...',
		'Innovation™ deployed!',
		'Value extraction maximized!'
	],

	albumRelease: [
		'Limited edition versions already scalped!',
		'Collectors opening their wallets...',
		'Physical media: somehow profitable again!',
		'Manufacturing artificial scarcity...',
		'Vinyl variants numbered 1 of 10,000...',
		'Superfans preparing second mortgages...',
		'The secondary market is thriving!',
		'Exclusivity: weaponized',
		'Scarcity: manufactured',
		'Profits: maximized'
	],

	tourStart: [
		'Tickets instantly "sold out"...',
		'Scalpers (you) preparing inventory...',
		'Dynamic pricing algorithm activated...',
		'FOMO marketing at maximum capacity...',
		'Fans preparing to be exploited...',
		'Venue capacity: artificially limited',
		'Resale market: ready to deploy',
		'Secondary market (you) standing by...',
		'The tour that will "change lives"...',
		'Counting ticket fees in advance...'
	]
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get tech tier content by tier number
 */
export function getTechTierContent(tier: TechTier): TechTierContent {
	return TECH_TIER_CONTENT[tier];
}

/**
 * Get exploitation content by boost type
 */
export function getExploitationContent(type: BoostType): ExploitationContent {
	return EXPLOITATION_CONTENT[type];
}

/**
 * Get phase content by phase number
 */
export function getPhaseContent(phase: Phase): PhaseContent {
	return PHASE_CONTENT[phase];
}

/**
 * Get a random flavor text from a category
 */
export function getRandomFlavorText(category: keyof typeof RANDOM_FLAVOR_TEXT): string {
	const pool = RANDOM_FLAVOR_TEXT[category];
	return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get prestige unlock message for a tech tier (empty string if no unlock)
 */
export function getPrestigeUnlockMessage(tier: TechTier): string {
	return PRESTIGE_UNLOCK_MESSAGES[tier];
}
