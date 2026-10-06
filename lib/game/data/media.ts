// Media content: hashtags and social posts. Posts are written by FICTIONAL citizens (invented
// handles) so no words are put in real people's mouths (docs/story-brief.md). Real hashtags from the
// record are marked `real` and enter play through story events.

export type HashtagTheme = 'EDUCATION' | 'JOBS' | 'DEMOCRACY' | 'GOVERNANCE' | 'HOSTILE';

export interface Hashtag {
  tag: string;
  theme: HashtagTheme;
  /** Appears in docs/cjp-timeline.md */
  real?: boolean;
}

export const HASHTAGS: Hashtag[] = [
  { tag: '#MainBhiCockroach', theme: 'DEMOCRACY', real: true },
  { tag: '#SchoolThikKaro', theme: 'EDUCATION', real: true },
  { tag: '#GyaneshItsDoneBro', theme: 'DEMOCRACY', real: true },
  { tag: '#PradhanGoBack', theme: 'EDUCATION', real: true },
  { tag: '#JobsKab', theme: 'JOBS' },
  { tag: '#ExamNahiScam', theme: 'EDUCATION' },
  { tag: '#DegreeHaiNaukriNahi', theme: 'JOBS' },
  { tag: '#StudentsNotCockroaches', theme: 'EDUCATION' },
  { tag: '#RightToProtest', theme: 'DEMOCRACY' },
  { tag: '#RTIZindabad', theme: 'GOVERNANCE' },
  { tag: '#PaperLeakSarkar', theme: 'EDUCATION' },
  { tag: '#HumBhiHain', theme: 'DEMOCRACY' },
  { tag: '#FixOurSchools', theme: 'EDUCATION' },
  { tag: '#VoteKiChori', theme: 'DEMOCRACY' },
  { tag: '#ChaiPeCharcha2', theme: 'JOBS' },
  { tag: '#CleanIndiaIndex', theme: 'GOVERNANCE' },
  // What the other side pushes
  { tag: '#CockroachForeignAgent', theme: 'HOSTILE' },
  { tag: '#AntiNationalAgenda', theme: 'HOSTILE' },
  { tag: '#ToolkitGang', theme: 'HOSTILE' },
  { tag: '#KeyboardKranti', theme: 'HOSTILE' },
];

export interface PostTemplate {
  author: string;
  handle: string;
  text: string;
  /** When to use it: a theme, a media action, or 'any' */
  trigger: HashtagTheme | 'MEME' | 'LIVE' | 'DEBUNK' | 'BLOCKED' | 'any';
}

// Fictional citizens. {tag} is replaced with a currently trending hashtag.
export const POST_TEMPLATES: PostTemplate[] = [
  { author: 'Priya (MBA, unemployed)', handle: '@priya_waits', text: 'Three degrees, zero interview calls. Apparently that makes me a cockroach. Fine. {tag}', trigger: 'JOBS' },
  { author: 'Rahul from Kota', handle: '@kota_ka_rahul', text: 'Studied 14 hours a day for two years. Paper leaked in 14 minutes. {tag}', trigger: 'EDUCATION' },
  { author: 'Ammi ki Beti', handle: '@ammikibeti', text: 'My mother asked why I am on the news. I said because I asked a question. {tag}', trigger: 'DEMOCRACY' },
  { author: 'Sid the Engineer', handle: '@sid_codes_nothing', text: 'Placed in a company that doesn\'t exist anymore. Living the dream. {tag}', trigger: 'JOBS' },
  { author: 'Teacher Kavita', handle: '@kavita_ma_am', text: 'Our school has one toilet for 400 girls. It has been locked since March. {tag}', trigger: 'EDUCATION' },
  { author: 'Village Sarpanch Bhai', handle: '@sarpanch_bol', text: 'The audit volunteers came. Next week the roof gets fixed. Shame works. {tag}', trigger: 'GOVERNANCE' },
  { author: 'Law Student Zoya', handle: '@zoya_reads_constitution', text: 'Article 19(1)(b): the right to assemble peaceably. Read it, then come to the protest. {tag}', trigger: 'DEMOCRACY' },
  { author: 'Meme Ka Keeda', handle: '@memekakeeda', text: 'Govt: "they are just cockroaches". Cockroaches: *survive nuclear war*. {tag}', trigger: 'MEME' },
  { author: 'Chai Wala Ganesh', handle: '@ganesh_chai', text: 'Sold 600 cups at the protest today. The cockroaches tip better than ministers. {tag}', trigger: 'MEME' },
  { author: 'Night Shift Neha', handle: '@neha_on_nights', text: 'Watching the livestream from the hospital break room. Stay safe out there. {tag}', trigger: 'LIVE' },
  { author: 'Uncle WhatsApp', handle: '@forwarded_many_times', text: 'Forwarded as received: these students are paid ₹500 each. (Source: trust me)', trigger: 'HOSTILE' },
  { author: 'Patriot Pankaj', handle: '@desh_pehle_420', text: 'Real patriots don\'t protest, they adjust. {tag}', trigger: 'HOSTILE' },
  { author: 'Fact Check Farah', handle: '@farah_checks', text: 'That viral "paid protester" screenshot is from a 2019 film shoot. Reverse image search, people. {tag}', trigger: 'DEBUNK' },
  { author: 'Diaspora Dev', handle: '@dev_in_dublin', text: 'X shows "withheld in India" for the account. Here\'s what it posted, for everyone at home. {tag}', trigger: 'BLOCKED' },
  { author: 'Grandma Online', handle: '@nani_has_wifi', text: 'In my day we protested with posters. Now with memes. Same anger, better jokes. {tag}', trigger: 'any' },
  { author: 'Hostel Room 214', handle: '@room214', text: 'Six of us, one fan, zero jobs, infinite memes. {tag}', trigger: 'any' },
  { author: 'Auto Driver Salim', handle: '@salim_auto', text: 'Gave three students a free ride to the protest. They gave me a sticker. Fair deal. {tag}', trigger: 'any' },
  { author: 'Aspirant Anjali', handle: '@anjali_attempt3', text: 'Third attempt. Still believing. Still angry. {tag}', trigger: 'EDUCATION' },
];
