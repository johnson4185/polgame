// Governance, Legislative Bills, and Reform Policies
import { ReformPolicy, CabinetMinistry } from '../types';

export const INITIAL_REFORMS: ReformPolicy[] = [
  {
    id: 'REFORM-EXAM-ACT',
    name: 'National Examination Integrity & Independent Testing Commission Act',
    sector: 'EXAM_SECURITY',
    description: 'Abolishes discretionary private testing vendors for national competitive tests. Establishes a constitutionally autonomous Examination Commission overseen by a retired Supreme Court Justice with mandatory end-to-end blockchain encrypted audit trails.',
    stateSupportReq: 14,
    bureaucraticResistance: 65,
    costCrores: 4800,
    implementationProgress: 25,
    status: 'DRAFT',
  },
  {
    id: 'REFORM-RTI-FASTTRACK',
    name: 'Real-Time Civic Transparency & RTI Proactive Disclosure Bill',
    sector: 'CIVIC_PROCUREMENT',
    description: 'Mandates all government tenders above ₹50 Lakhs, contractor bills, quality inspection reports, and municipal approvals to be published online within 72 hours under open machine-readable formats.',
    stateSupportReq: 12,
    bureaucraticResistance: 80,
    costCrores: 1200,
    implementationProgress: 10,
    status: 'DRAFT',
  },
  {
    id: 'REFORM-COACHING-STANDARDS',
    name: 'Student Well-being, Safe Study Spaces & Coaching Accountability Code',
    sector: 'EDUCATION_INFRA',
    description: 'Bans hazardous underground study basements, mandates minimum 30 sq ft per student in libraries, caps predatory coaching advance fees, and creates state student ombudsman for mental health and fee refunds.',
    stateSupportReq: 8,
    bureaucraticResistance: 50,
    costCrores: 850,
    implementationProgress: 40,
    status: 'DRAFT',
  },
  {
    id: 'REFORM-CONTRACTOR-LIABILITY',
    name: 'Public Infrastructure 10-Year Contractor Liability & Asset Code',
    sector: 'CIVIC_PROCUREMENT',
    description: 'Imposes strict civil and criminal liability on primary contractors and government certification engineers for structural failures, potholes, and bridge damages within 10 years of commissioning.',
    stateSupportReq: 15,
    bureaucraticResistance: 85,
    costCrores: 600,
    implementationProgress: 5,
    status: 'DRAFT',
  },
  {
    id: 'REFORM-HEALTHCARE-STOCKS',
    name: 'Essential Hospital Drug Stock Transparency & Free Diagnostics Guarantee',
    sector: 'HEALTH_CARE',
    description: 'Live QR-code tracking of medicine availability in every Primary Health Centre (PHC) and District Hospital, with automatic replenishment and compensation for patients forced to purchase outside.',
    stateSupportReq: 10,
    bureaucraticResistance: 55,
    costCrores: 3400,
    implementationProgress: 15,
    status: 'DRAFT',
  },
];

export const INITIAL_CABINET: CabinetMinistry[] = [
  { id: 'MIN-EDU', title: 'Ministry of Education & Youth Affairs', ministerName: 'Abhijeet Dipke', isPlayerParty: true, performanceScore: 78, corruptionScandalRisk: 10 },
  { id: 'MIN-LAW', title: 'Ministry of Law & Justice', ministerName: 'Advocate Meera Tandon', isPlayerParty: true, performanceScore: 82, corruptionScandalRisk: 5 },
  { id: 'MIN-HOME', title: 'Ministry of Home Affairs & Internal Security', ministerName: 'Coalition Partner Representative', isPlayerParty: false, performanceScore: 60, corruptionScandalRisk: 42 },
  { id: 'MIN-FIN', title: 'Ministry of Finance & Corporate Affairs', ministerName: 'Harpreet Kaur', isPlayerParty: true, performanceScore: 74, corruptionScandalRisk: 8 },
  { id: 'MIN-RURAL', title: 'Ministry of Rural Development & Panchayati Raj', ministerName: 'Satbir Dhillon', isPlayerParty: true, performanceScore: 80, corruptionScandalRisk: 12 },
  { id: 'MIN-HEALTH', title: 'Ministry of Health & Family Welfare', ministerName: 'Dr. Nilesh Patil', isPlayerParty: true, performanceScore: 85, corruptionScandalRisk: 6 },
];
