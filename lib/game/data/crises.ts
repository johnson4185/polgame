import { CrisisEvent } from '../types';

export const CRISIS_EVENT_DECK: CrisisEvent[] = [
  {
    id: 'CRISIS-144-POLICE',
    title: 'Midnight Section 144 Imposition at Jantar Mantar',
    urgency: 'HIGH',
    speakerName: 'ACP Vikramaditya Singh',
    speakerRole: 'Delhi Police Joint Commissioner',
    speakerFaction: 'State Law Enforcement',
    contextNarrative:
      'At 1:45 AM, three busloads of Rapid Action Force personnel and two water cannon trucks ("Varun") pull up outside the barricades. The ACP steps through with a signed magistracy order declaring unlawful assembly due to "VIP traffic route sensitivity".',
    quote: '"You have twenty minutes to dismantle the sound stage and clear the roadway. Do not force us to use tear gas on students and elderly volunteers."',
    options: [
      {
        id: 'HUMAN_CHAIN',
        label: 'Form Non-Violent Human Chain with National Flags',
        description: 'Stand ground peacefully with national flags singing the anthem. Highest moral power, but risks police batons and detentions.',
        consequences: {
          trustChange: 18,
          volunteersChange: 450,
          crackdownChange: 20,
          stressChange: 15,
          energyChange: -20,
        },
      },
      {
        id: 'MIDNIGHT_HC_BENCH',
        label: 'Emergency Midnight Hearing before High Court',
        description: 'Wake up senior human rights advocates to petition the Chief Justice bench against arbitrary midnight eviction.',
        consequences: {
          trustChange: 12,
          fundsChange: -35000,
          crackdownChange: -15,
          stressChange: 5,
        },
      },
      {
        id: 'TACTICAL_RELOCATE',
        label: 'Tactically March to Ramlila Maidan',
        description: 'De-escalate confrontation, lead the crowd in an orderly flashlight procession to the larger designated protest grounds.',
        consequences: {
          trustChange: -4,
          volunteersChange: 150,
          crackdownChange: -10,
          energyChange: -10,
        },
      },
    ],
  },
  {
    id: 'CRISIS-BLACK-MONEY-BRIBE',
    title: 'The ₹5 Crore Unmarked Suitcase in the Antechamber',
    urgency: 'HIGH',
    speakerName: 'Harishankar Somani',
    speakerRole: 'Managing Director, Horizon Infra-Minerals',
    speakerFaction: 'Corporate Lobbyists',
    contextNarrative:
      'A quiet envoy representing the shipping and mining conglomerate under RTI investigation arrives at your Karol Bagh field office in an armored SUV. Inside a Samsonite briefcase sits ₹5 Crore in bundled ₹500 notes.',
    quote: '"Look, Abhijeet. Movements come and go. Elections require immense capital. Take this as a good-will donation for your volunteers. All we ask is that you withdraw prayer #3 from your port corruption PIL."',
    options: [
      {
        id: 'HIDDEN_CAMERA_STING',
        label: 'Release Hidden Button-Cam Recording to the Press',
        description: 'You had a volunteer secretly filming. Expose the corporate bribe on national television at a 4 PM press briefing.',
        consequences: {
          trustChange: 25,
          volunteersChange: 600,
          crackdownChange: 25,
          stressChange: 20,
        },
      },
      {
        id: 'THROW_OUT_FIR',
        label: 'Eject the Envoy and File Formal Police Bribery Complaint',
        description: 'Throw the briefcase out the door and immediately file an FIR under the Prevention of Corruption Act.',
        consequences: {
          trustChange: 15,
          volunteersChange: 250,
          crackdownChange: 10,
          stressChange: 10,
        },
      },
      {
        id: 'COLD_REFUSAL',
        label: 'Calmly Refuse Without Antagonizing the Oligarch',
        description: 'Politely inform them the movement is non-negotiable. Avoid sudden violent corporate retaliation.',
        consequences: {
          trustChange: 5,
          stressChange: -5,
        },
      },
    ],
  },
  {
    id: 'CRISIS-HUNGER-STRIKE-VITAL',
    title: 'Critical Ketone Spikes on Day 8 of Hunger Strike',
    urgency: 'EXTREME',
    speakerName: 'Dr. Ayesha Sen',
    speakerRole: 'Chief of Medical Volunteer Brigade (AIIMS)',
    speakerFaction: 'Movement Doctors',
    contextNarrative:
      'The morning blood test reveals ketone levels exceeding 6.2 mmol/L with sudden blood pressure collapse (85/55 mmHg). Government ambulances are waiting with flashing lights, with doctors threatening judicial force-feeding.',
    quote: '"Abhijeet, your kidneys are going into acute distress. If you don’t accept oral rehydration and saline within six hours, you will suffer irreversible organ damage."',
    options: [
      {
        id: 'DEFIANT_FAST',
        label: 'Refuse Saline: Fast Unto Death Until Lokpal Bill Tabled',
        description: 'Reiterate the pledge from the mattress. The country erupts in sympathy strikes across 18 states, but your health enters critical danger.',
        consequences: {
          trustChange: 30,
          volunteersChange: 1200,
          stressChange: 35,
          energyChange: -40,
        },
      },
      {
        id: 'RELAY_HUNGER_STRIKE',
        label: 'Transition to 100-Person Decentralized Relay Fast',
        description: 'Take medically supervised fluids while five student leaders and four farmers from Punjab take over the primary fast on stage.',
        consequences: {
          trustChange: 14,
          volunteersChange: 400,
          stressChange: -15,
          energyChange: 25,
        },
      },
      {
        id: 'HOSPITAL_PARLIAMENT_APPEAL',
        label: 'Accept Saline Only If Home Minister Issues Written Response',
        description: 'Condition medical admission upon an official written invitation for tripartite talks at North Block.',
        consequences: {
          trustChange: 10,
          fundsChange: 15000,
          crackdownChange: -10,
          energyChange: 15,
        },
      },
    ],
  },
  {
    id: 'CRISIS-AUDIO-LEAK-DEFAMATION',
    title: 'Fabricated Audio Leak Circulating on WhatsApp',
    urgency: 'HIGH',
    speakerName: 'Rohan Deshmukh',
    speakerRole: 'Social Media Cell In-Charge',
    speakerFaction: 'Rival Ruling Coalition',
    contextNarrative:
      'A distorted 45-second audio clip is trending across 50,000 WhatsApp groups, deceptively spliced to make it sound like your core committee accepted foreign funding from an overseas advocacy NGO to stall highway construction.',
    quote: '"Trending #AbhijeetForeignAgent at #1 nationally with 340,000 posts. Anchor Vikram Goswami is opening prime-time on it."',
    options: [
      {
        id: 'FORENSIC_RAW_AUDIO',
        label: 'Upload Full Uncut 2-Hour Audio with Lab Spectrum Analysis',
        description: 'Disprove the splicing within 90 minutes and file a criminal defamation notice against the ruling party IT cell head.',
        consequences: {
          trustChange: 20,
          fundsChange: -15000,
          volunteersChange: 350,
          stressChange: 15,
        },
      },
      {
        id: 'CHALLENGE_OPEN_DEBATE',
        label: 'Demand Live Studio Debate with Party Spokesperson',
        description: 'Walk directly into the prime-time TV studio and challenge the ruling party spokesperson face-to-face.',
        consequences: {
          trustChange: 16,
          volunteersChange: 500,
          stressChange: 20,
        },
      },
      {
        id: 'COMMUNITY_FACTCHECK_BLITZ',
        label: 'Mobilize 10,000 Volunteer WhatsApp Fact-Checking Cells',
        description: 'Distribute simple infographics in Hindi, Tamil, Bengali, and Marathi debunking the doctored audio directly to citizen groups.',
        consequences: {
          trustChange: 12,
          volunteersChange: 300,
          fundsChange: -8000,
          stressChange: 5,
        },
      },
    ],
  },
  {
    id: 'CRISIS-ED-OFFICE-RAID',
    title: 'Surprise Enforcement Directorate (ED) Search Notice',
    urgency: 'CRITICAL',
    speakerName: 'Officer Sanjay Bhasin',
    speakerRole: 'Assistant Director, Directorate of Enforcement',
    speakerFaction: 'Central Investigative Agencies',
    contextNarrative:
      'Seven plainclothes officers arrive with Delhi Police escort at 8:00 AM, presenting a summons under the Prevention of Money Laundering Act (PMLA). They demand hard drives, bank books, and server access.',
    quote: '"We have instructions to impound all digital ledgers and examine unaccounted UPI crowd donations exceeding ₹50,000."',
    options: [
      {
        id: 'LIVESTREAM_SEARCH',
        label: 'Open Every Door and Livestream the Entire Search to YouTube',
        description: 'Complete radical transparency. Show millions of viewers that our ledgers have zero illicit transactions, exposing the political vendetta.',
        consequences: {
          trustChange: 26,
          volunteersChange: 800,
          crackdownChange: 15,
          stressChange: 25,
        },
      },
      {
        id: 'LEGAL_REPRESENTATION_ONLY',
        label: 'Demand Counsel Presence Before Handing Over Servers',
        description: 'Invoke Supreme Court search guidelines. Allow inspection only under the physical supervision of high-court bar advocates.',
        consequences: {
          trustChange: 10,
          fundsChange: -20000,
          crackdownChange: -5,
          stressChange: 10,
        },
      },
    ],
  },
];
