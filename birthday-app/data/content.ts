/**
 * Everything personal lives in this one file.
 * Edit the strings below and the whole site updates — no other file needs touching.
 */

export type Show = {
  id: string;
  title: string;
  years: string;
  /** Two or three letters shown on the "tape label" when there's no artwork. */
  initials: string;
  /** Any CSS color — used for the tape spine and glow. */
  color: string;
  /** Roughly how far through it we are. Only used in the "watched" section. */
  progress?: { seasonsWatched: number; seasonsTotal: number };
  /** Episodes per season, in order. Used by the shuffler to pick a real episode. */
  seasons?: number[];
  /** One line about what this show is to us. */
  note: string;
  /** The episode that broke us. */
  favoriteEpisode?: string;
  /** A line one of us actually says out loud now. */
  quote?: string;
  tags?: string[];
};

export const SITE = {
  herName: "Sam", // TODO: her name
  fromName: "Me", // TODO: your name
  // The big line at the top.
  title: "The Tapes",
  subtitle: "everything we've watched, everything we still have to",
  // Shown under the title.
  dedication:
    "Happy birthday. This is every hour we spent on the couch, catalogued, plus all the ones we haven't spent yet.",
};

/** Shows we've watched together. */
export const WATCHED: Show[] = [
  {
    id: "curb",
    title: "Curb Your Enthusiasm",
    years: "2000–2024",
    initials: "CYE",
    color: "#f7d046",
    progress: { seasonsWatched: 12, seasonsTotal: 12 },
    seasons: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    note: "The one that started it. Now neither of us can do a normal social interaction without narrating it.",
    favoriteEpisode: "TODO: your favorite episode",
    quote: "Pretty, pretty, pretty good.",
    tags: ["sitcom", "the origin story"],
  },
  {
    id: "sunny",
    title: "It's Always Sunny in Philadelphia",
    years: "2005–",
    initials: "IAS",
    color: "#4ce0b3",
    progress: { seasonsWatched: 16, seasonsTotal: 17 },
    seasons: [7, 10, 15, 15, 12, 10, 13, 10, 10, 10, 8, 10, 8, 10, 10, 8, 8],
    note: "TODO: what Sunny is to the two of you.",
    favoriteEpisode: "TODO: your favorite episode",
    quote: "TODO: a line you both quote constantly",
    tags: ["sitcom", "quoted daily"],
  },
  {
    id: "office",
    title: "The Office",
    years: "2005–2013",
    initials: "OFF",
    color: "#7ec8ff",
    progress: { seasonsWatched: 9, seasonsTotal: 9 },
    note: "TODO: replace or delete this one.",
    tags: ["sitcom", "comfort rewatch"],
  },
  {
    id: "30rock",
    title: "30 Rock",
    years: "2006–2013",
    initials: "30R",
    color: "#ff8fb1",
    progress: { seasonsWatched: 7, seasonsTotal: 7 },
    note: "TODO: replace or delete this one.",
    tags: ["sitcom"],
  },
];

/** Shows we still have to watch. She can tick these off. */
export const WATCHLIST: Show[] = [
  {
    id: "wilfred",
    title: "Party Down",
    years: "2009–2023",
    initials: "PD",
    color: "#c58cff",
    note: "TODO: why this one is next.",
    tags: ["sitcom"],
  },
  {
    id: "detroiters",
    title: "Detroiters",
    years: "2017–2018",
    initials: "DET",
    color: "#ffb45e",
    note: "TODO: why this one is next.",
    tags: ["sitcom"],
  },
  {
    id: "review",
    title: "Review",
    years: "2014–2017",
    initials: "REV",
    color: "#68e08a",
    note: "TODO: why this one is next.",
    tags: ["sitcom"],
  },
  {
    id: "taskmaster",
    title: "Taskmaster",
    years: "2015–",
    initials: "TM",
    color: "#ff6b6b",
    note: "TODO: why this one is next.",
    tags: ["panel show"],
  },
];

/** The hall of fame — ids can come from either list above. */
export const TOP_PICKS: { showId: string; blurb: string }[] = [
  {
    showId: "curb",
    blurb: "TODO: why this one wins.",
  },
  {
    showId: "sunny",
    blurb: "TODO: why this one wins.",
  },
];

/** Things I'm inspired by about her. */
export const INSPIRATIONS: { heading: string; body: string }[] = [
  {
    heading: "TODO: the first thing",
    body: "TODO: a few sentences. Be specific — the specific thing is the whole gift.",
  },
  {
    heading: "TODO: the second thing",
    body: "TODO.",
  },
  {
    heading: "TODO: the third thing",
    body: "TODO.",
  },
];

/** The closing note. Keep it short; it lands harder. */
export const LETTER = `TODO: the letter.

A couple of paragraphs is plenty. Blank lines become paragraph breaks.`;
