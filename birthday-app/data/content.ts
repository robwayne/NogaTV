/**
 * Everything personal lives in this one file.
 * Edit the strings below and the whole site updates — no other file needs touching.
 */

export type Show = {
  id: string;
  title: string;
  years: string;
  /** Shows and movies both live in the library; the TV guide treats them differently. */
  kind?: "show" | "movie";
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
  herName: "Noga",
  herFullName: "Noga Frischoff",
  fromName: "Rob",
  turning: 28,
  friendsSince: 2020,
  where: "Tel Aviv",
  // The big line at the top.
  title: "The Tapes",
  subtitle: "everything we've watched, and the enormous pile we haven't",
  // Shown under the title.
  dedication:
    "Happy 28th. Five years of friendship and I made you a website about television, which I think says something about both of us. Every hour we've spent on that couch is in here. So is every hour we still owe each other.",
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
    note: "Where it all went wrong. Neither of us has had a normal conversation since — everything is a bit now, everything gets narrated.",
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
    id: "reno911",
    title: "Reno 911!",
    years: "2003–",
    initials: "R911",
    color: "#7ec8ff",
    progress: { seasonsWatched: 6, seasonsTotal: 8 },
    // Approximate episode counts — edit if you want the shuffler to be exact.
    seasons: [14, 18, 15, 13, 12, 16, 15, 12],
    note: "TODO: what Reno is to the two of you.",
    favoriteEpisode: "TODO: your favorite episode",
    quote: "TODO: a line you both quote constantly",
    tags: ["sitcom", "quoted daily"],
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
    id: "new-girl",
    title: "New Girl",
    years: "2011–2018",
    initials: "NG",
    color: "#ff9ec4",
    seasons: [24, 25, 23, 22, 22, 22, 8],
    note: "TODO: Noga's pitch, in her words.",
    tags: ["sitcom", "noga's fault"],
  },
  {
    id: "the-big-lebowski",
    title: "The Big Lebowski",
    years: "1998",
    initials: "TBL",
    color: "#e0c68c",
    kind: "movie",
    note: "TODO: why this one is next.",
    tags: ["movie"],
  },
  {
    id: "burn-after-reading",
    title: "Burn After Reading",
    years: "2008",
    initials: "BAR",
    color: "#8ce0d4",
    kind: "movie",
    note: "TODO: why this one is next.",
    tags: ["movie"],
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

/**
 * The recommendation shelves: everything one of us pushed on the other.
 * `by` is a profile id — "me" or "her".
 */
export type Rec = {
  id: string;
  title: string;
  kind: "show" | "film" | "book";
  year?: string;
  by: "me" | "her";
  /** The pitch. Why they should watch/read it. */
  note?: string;
  /** Link it to a library show (by id) and the shuffler can suggest an episode. */
  showId?: string;
  /** Ticked off once the other person has actually got to it. */
  done?: boolean;
};

export const RECOMMENDATIONS: Rec[] = [
  // ── things I pushed on her ──────────────────────────────────────────────
  {
    id: "rec-curb",
    title: "Curb Your Enthusiasm",
    kind: "show",
    year: "2000–2024",
    by: "me",
    showId: "curb",
    note: "The original crime. No apologies.",
    done: true,
  },
  {
    id: "rec-sunny",
    title: "It's Always Sunny in Philadelphia",
    kind: "show",
    year: "2005–",
    by: "me",
    showId: "sunny",
    note: "TODO: your pitch.",
    done: true,
  },
  {
    id: "rec-lebowski",
    title: "The Big Lebowski",
    kind: "film",
    year: "1998",
    by: "me",
    showId: "the-big-lebowski",
    note: "TODO: your pitch.",
  },

  // ── things she pushed on me ─────────────────────────────────────────────
  {
    id: "rec-philosophy",
    title: "TODO: the philosophy book she gave you",
    kind: "book",
    by: "her",
    note: "TODO: what it did to you.",
  },
  {
    id: "rec-her-film",
    title: "TODO: a film Noga made you watch",
    kind: "film",
    by: "her",
    note: "TODO: her pitch, as she made it.",
  },
  {
    id: "rec-new-girl",
    title: "New Girl",
    kind: "show",
    year: "2011–2018",
    by: "her",
    showId: "new-girl",
    note: "TODO: her pitch, as she made it.",
  },
];

/**
 * The lock on the inspiration page.
 *
 * It opens on her birthday and stays open for `openDays` days, then goes back
 * behind the password. Outside that window the page is still reachable with
 * the password, and the menu link is hidden.
 *
 * Worth knowing: this is a lock on a door, not a safe. The page is a static
 * site, so the words below ship inside it — anyone determined enough to read
 * the page source can read them early. It stops a casual peek, nothing more.
 */
export const LOCK = {
  /** Month is 1-based. September 24th. */
  month: 9,
  day: 24,
  /** How many days it stays open, counting the birthday itself. */
  openDays: 3,
  /** TODO: set your password. */
  password: "change-me",
};

/** Things I'm inspired by about her. */
export const INSPIRATIONS: { heading: string; body: string }[] = [
  {
    heading: "She makes things, and they're good",
    body:
      "The abstract work especially. I don't always know what I'm looking at and I've stopped needing to — it does something to me before I've worked out why, which I think is the whole point. She does the visuals and the art for her grandma too, and that tells you as much about her as the work itself does.",
  },
  {
    heading: "She got me into art",
    body:
      "I wasn't really an art person. Being around someone who takes it seriously, who makes it rather than just consumes it, rewired that. I look at things longer now. That's her fault.",
  },
  {
    heading: "She got me reading philosophy",
    body:
      "Books I would never have picked up on my own. Half the time I'm out of my depth and I keep going anyway, because she made it seem like a normal thing to spend your evening on instead of an intimidating one.",
  },
  {
    heading: "She's genuinely giving",
    body:
      "Caring in the practical, unglamorous way — the kind that costs something. She doesn't think of herself as any of this, which is exactly why it lands. Being around it makes me want to be a better person, and I don't think she's ever noticed she's doing it.",
  },
  {
    heading: "She's the person I try to impress",
    body:
      "There's a short list of people whose opinion actually reorganises how I think about something I've made or said. She's at the top of it, and she has no idea.",
  },
];

/** The closing note. Keep it short; it lands harder. */
export const LETTER = `Noga — happy 28th.

Friends since 2020. One of the first people I met in Tel Aviv, and somehow still one of the most influential people in my life: the art, the books, the standard you set for how to treat people without ever making a thing of it.

Most of what's catalogued on this site is us on a couch quoting Larry David at each other, which I realise is a strange way to measure a friendship. But it's hundreds of hours of choosing the same person's company over and over, and that's not nothing. There's a lot on the list we haven't watched yet. That's the part I like most about it.

Here's to being friends until we're old and dead.`
