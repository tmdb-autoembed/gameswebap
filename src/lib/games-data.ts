export type Game = {
  slug: string;
  title: string;
  cover: string; // gradient css
  size?: string;
  year?: number;
  developer?: string;
  genres?: string[];
  description?: string;
  rating?: number;
  reviews?: number;
};

const grad = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

export const games: Game[] = [
  { slug: "grand-theft-auto-v", title: "Grand Theft Auto V", cover: grad("#f4a261", "#e76f51"), size: "4 GB RAM", year: 2013, developer: "Rockstar North", genres: ["Action","Open World","Adventure","Multiplayer","Sandbox","Crime"], description: "Experience the vast open world of GTA V, an action-packed game with thrilling missions and multiplayer mayhem.", rating: 5, reviews: 30 },
  { slug: "forza-horizon-6", title: "Forza Horizon 6", cover: grad("#1e3a8a", "#ef4444"), size: "8 GB RAM", year: 2026, developer: "Playground Games", genres: ["Racing","Open World","Simulation"], description: "Forza Horizon 6 is a 2026 racing game developed by Playground Games and published by Xbox Game Studios.", rating: 5, reviews: 45 },
  { slug: "black-myth-wukong", title: "Black Myth: Wukong", cover: grad("#1c1917", "#57534e"), size: "16 GB RAM", year: 2024, developer: "Game Science", genres: ["Action","RPG","Adventure"], description: "An action RPG rooted in Chinese mythology.", rating: 5, reviews: 88 },
  { slug: "red-dead-redemption-2", title: "Red Dead Redemption 2", cover: grad("#7c2d12", "#dc2626"), size: "12 GB RAM", year: 2018, developer: "Rockstar Games", genres: ["Action","Open World","Adventure"], description: "An epic tale of life in America's unforgiving heartland.", rating: 5, reviews: 120 },
  { slug: "the-last-of-us-part-i", title: "The Last of Us Part I", cover: grad("#78350f", "#451a03"), size: "8 GB RAM", year: 2022, developer: "Naughty Dog", genres: ["Action","Adventure","Survival"], description: "A hardened survivor must escort a teenage girl across a post-apocalyptic America after a fungal pandemic collapses society.", rating: 5, reviews: 67 },
  { slug: "the-witcher-3", title: "The Witcher 3: Wild Hunt", cover: grad("#1e293b", "#0f172a"), size: "8 GB RAM", year: 2015, developer: "CD Projekt Red", genres: ["RPG","Open World","Adventure"], description: "A story-driven open world RPG.", rating: 5, reviews: 200 },
  { slug: "cyberpunk-2077", title: "Cyberpunk 2077", cover: grad("#facc15", "#ca8a04"), size: "12 GB RAM", year: 2020, developer: "CD Projekt Red", genres: ["RPG","Action","Open World"], description: "An open-world, action-adventure story set in Night City.", rating: 4, reviews: 156 },
  { slug: "elden-ring", title: "Elden Ring", cover: grad("#a16207", "#451a03"), size: "12 GB RAM", year: 2022, developer: "FromSoftware", genres: ["RPG","Action","Souls-like"], description: "A new fantasy action RPG.", rating: 5, reviews: 312 },
  { slug: "republic-of-pirates", title: "Republic of Pirates", cover: grad("#0e7490", "#155e75"), size: "6 GB RAM", year: 2024, developer: "Crazy Goat Games", genres: ["Strategy","Simulation"], description: "Build your pirate empire.", rating: 4, reviews: 22 },
  { slug: "research-and-destroy", title: "Research and Destroy", cover: grad("#facc15", "#f97316"), size: "4 GB RAM", year: 2022, developer: "Implausible Industries", genres: ["Strategy","Action"], description: "Turn-based strategy with science.", rating: 4, reviews: 18 },
  { slug: "gta-san-andreas", title: "GTA: San Andreas", cover: grad("#84cc16", "#365314"), size: "2 GB RAM", year: 2004, developer: "Rockstar North", genres: ["Action","Open World"], description: "Return to San Andreas.", rating: 5, reviews: 410 },
  { slug: "assetto-corsa", title: "Assetto Corsa", cover: grad("#dc2626", "#7f1d1d"), size: "8 GB RAM", year: 2025, developer: "Kunos Simulazioni", genres: ["Racing","Multiplayer","Simulation","Sports","Driving"], description: "Experience realistic racing with Assetto Corsa, the top choice for racing enthusiasts seeking unparalleled driving simulation.", rating: 5, reviews: 25 },
  { slug: "forza-horizon-5", title: "Forza Horizon 5", cover: grad("#0ea5e9", "#1e40af"), size: "8 GB RAM", year: 2021, developer: "Playground Games", genres: ["Racing","Open World"], description: "Your ultimate Horizon adventure awaits.", rating: 5, reviews: 145 },
  { slug: "resident-evil-4", title: "Resident Evil 4", cover: grad("#1f2937", "#000000"), size: "8 GB RAM", year: 2023, developer: "Capcom", genres: ["Horror","Action","Survival"], description: "Survival horror reborn.", rating: 5, reviews: 89 },
  { slug: "nioh", title: "Nioh", cover: grad("#7c3aed", "#1e1b4b"), size: "6 GB RAM", year: 2017, developer: "Team Ninja", genres: ["Action","RPG","Souls-like"], description: "Dark samurai action RPG.", rating: 4, reviews: 64 },
  { slug: "tomb-raider", title: "Tomb Raider I-III Remastered", cover: grad("#16a34a", "#14532d"), size: "4 GB RAM", year: 2024, developer: "Aspyr", genres: ["Action","Adventure"], description: "Classic Lara Croft remastered.", rating: 5, reviews: 41 },
];

export const trending = games.slice(0, 12);
export const recent = games.slice(2, 16);

export const heroSlides = [
  { game: games[1], image: grad("#0f172a", "#7c1d6f") },
  { game: games[4], image: grad("#78350f", "#1c1917") },
  { game: games[3], image: grad("#7c2d12", "#000") },
  { game: games[2], image: grad("#1c1917", "#374151") },
  { game: games[7], image: grad("#a16207", "#000") },
];
