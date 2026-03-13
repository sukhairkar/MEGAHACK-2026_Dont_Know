// JusticeRoute: Law Enforcement Investigation Platform
// FIR Data Types and Mock Data
export type FIRStatus = "Open" | "Under Investigation" | "Closed" | "Pending";

export interface FIRRecord {
  id: string;
  incidentType: string;
  location: string;
  district: string;
  date: string;
  status: FIRStatus;
  assignedOfficer: string;
  branch: string;
  victimName: string;
  victimStatement: string;
  ipcSections: IPCSection[];
  investigationSteps: InvestigationStep[];
  lat: number;
  lng: number;
}

export interface IPCSection {
  section: string;
  title: string;
  explanation: string;
  punishment: string;
}

export interface InvestigationStep {
  step: number;
  action: string;
  details: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface ChatMessage {
  role: "officer" | "assistant";
  content: string;
  timestamp: string;
}

export const FIR_DATA: FIRRecord[] = [
  {
    id: "FIR-2024-001",
    incidentType: "Theft / Robbery",
    location: "MG Road, Pune",
    district: "Pune",
    date: "2024-11-12",
    status: "Under Investigation",
    assignedOfficer: "SI Rajesh Kumar",
    branch: "Pune Central",
    victimName: "Priya Sharma",
    victimStatement:
      "On 12th November 2024 at approximately 8:30 PM, I was walking along MG Road near the Cosmos Mall. Two individuals on a motorcycle approached me from behind. One of them snatched my gold chain and handbag containing my mobile phone (Samsung Galaxy S23), wallet with Rs. 4,500 cash, and important documents. The motorcycle sped away towards the Deccan direction. I could not see their faces clearly as it was dark, but I noticed the motorcycle was a dark-coloured Honda Activa. The incident happened very quickly. I immediately called the police helpline and proceeded to the nearest police station to file this report.",
    ipcSections: [
      {
        section: "IPC 356",
        title: "Assault or Criminal Force to Commit Theft",
        explanation:
          "Applied because the accused used force while committing theft by snatching the chain and bag. The act of pulling the chain constitutes criminal force.",
        punishment: "Imprisonment up to 2 years, or fine, or both.",
      },
      {
        section: "IPC 379",
        title: "Punishment for Theft",
        explanation:
          "Applied as personal property (gold chain, mobile phone, cash, documents) was stolen without the victim's consent.",
        punishment: "Imprisonment up to 3 years, or fine, or both.",
      },
      {
        section: "IPC 34",
        title: "Acts Done by Several Persons in Furtherance of Common Intention",
        explanation:
          "Applied as two accused persons acted in concert — one drove the motorcycle while the other committed the theft, indicating common intention.",
        punishment: "Shared criminal liability with the principal offender.",
      },
    ],
    investigationSteps: [
      {
        step: 1,
        action: "CCTV Footage Review",
        details:
          "Check all CCTV cameras within 200 metres of incident location on MG Road. Focus on cameras near Cosmos Mall entrance and Deccan direction exit points. Obtain footage from 8:00 PM to 9:00 PM.",
        priority: "High",
        completed: true,
      },
      {
        step: 2,
        action: "Vehicle Identification",
        details:
          "Identify the dark-coloured Honda Activa. Check traffic signal cameras on the Deccan route for partial or full registration plate. Cross-reference with RTO records.",
        priority: "High",
        completed: true,
      },
      {
        step: 3,
        action: "Witness Interviews",
        details:
          "Interview shopkeepers and pedestrians near MG Road at the time of the incident. Focus on individuals near the Cosmos Mall who may have witnessed the snatching.",
        priority: "High",
        completed: false,
      },
      {
        step: 4,
        action: "Mobile Phone Tracking",
        details:
          "Contact Samsung/telecom operator with IMEI number of stolen Samsung Galaxy S23 to track last known location. Issue IMEI blocking request with DOT.",
        priority: "Medium",
        completed: false,
      },
      {
        step: 5,
        action: "Informer Network Activation",
        details:
          "Alert local informers about stolen gold chain and mobile phone. Check with known receivers/pawn shops in the area. Share item descriptions with nearby police stations.",
        priority: "Medium",
        completed: false,
      },
      {
        step: 6,
        action: "Bank & ATM Footage",
        details:
          "Check nearby ATM cameras that may have captured the accused or the motorcycle. Obtain footage from State Bank ATM on MG Road and HDFC branch near Deccan.",
        priority: "Low",
        completed: false,
      },
    ],
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: "FIR-2024-002",
    incidentType: "Burglary",
    location: "Baner Road, Pune",
    district: "Pune",
    date: "2024-11-10",
    status: "Open",
    assignedOfficer: "SI Meera Patil",
    branch: "Baner Police Station",
    victimName: "Amit Desai",
    victimStatement:
      "Returned home from work at 7 PM to find the main door lock broken. Valuables including laptop, gold ornaments and Rs. 20,000 cash were stolen. Neighbours reported seeing an unfamiliar car parked outside during afternoon hours.",
    ipcSections: [
      {
        section: "IPC 457",
        title: "Lurking House Trespass at Night",
        explanation: "Applied as the accused committed trespass by breaking into the dwelling house.",
        punishment: "Imprisonment up to 14 years.",
      },
      {
        section: "IPC 380",
        title: "Theft in Dwelling House",
        explanation: "Applied as theft was committed inside the victim's residence.",
        punishment: "Imprisonment up to 7 years, or fine, or both.",
      },
    ],
    investigationSteps: [
      {
        step: 1,
        action: "Crime Scene Forensics",
        details: "Collect fingerprints from entry point and valuables area. Document the break-in method.",
        priority: "High",
        completed: true,
      },
      {
        step: 2,
        action: "Neighbour Statements",
        details: "Record statements from neighbours about the unfamiliar car. Get vehicle description.",
        priority: "High",
        completed: false,
      },
      {
        step: 3,
        action: "CCTV Canvass",
        details: "Check residential society cameras and nearby traffic cameras for suspicious vehicles.",
        priority: "High",
        completed: false,
      },
    ],
    lat: 18.5596,
    lng: 73.7889,
  },
  {
    id: "FIR-2024-003",
    incidentType: "Assault",
    location: "Shivaji Nagar, Pune",
    district: "Pune",
    date: "2024-11-08",
    status: "Closed",
    assignedOfficer: "PI Suresh Nair",
    branch: "Shivaji Nagar PS",
    victimName: "Ramesh Yadav",
    victimStatement:
      "I was physically assaulted by my neighbour Suresh Gaikwad following a property dispute. He struck me with a wooden stick causing injuries to my left arm.",
    ipcSections: [
      {
        section: "IPC 323",
        title: "Punishment for Voluntarily Causing Hurt",
        explanation: "Applied as the accused voluntarily caused hurt to the victim.",
        punishment: "Imprisonment up to 1 year, or fine up to Rs. 1000, or both.",
      },
    ],
    investigationSteps: [
      { step: 1, action: "Medical Examination", details: "Victim medical report obtained from Ruby Hall Clinic.", priority: "High", completed: true },
      { step: 2, action: "Accused Statement", details: "Statement of accused Suresh Gaikwad recorded.", priority: "High", completed: true },
      { step: 3, action: "Witness Examination", details: "Three witnesses examined. Case forwarded to court.", priority: "Medium", completed: true },
    ],
    lat: 18.5308,
    lng: 73.8474,
  },
  {
    id: "FIR-2024-004",
    incidentType: "Cybercrime / Fraud",
    location: "Kothrud, Pune",
    district: "Pune",
    date: "2024-11-15",
    status: "Pending",
    assignedOfficer: "SI Ananya Joshi",
    branch: "Kothrud Police Station",
    victimName: "Sunita Kulkarni",
    victimStatement:
      "I received a call from someone claiming to be from SBI bank. They said my account would be blocked and asked me to share OTP for verification. I shared the OTP and Rs. 85,000 was debited from my account in multiple transactions.",
    ipcSections: [
      {
        section: "IPC 420",
        title: "Cheating and Dishonestly Inducing Delivery of Property",
        explanation: "Applied as the accused fraudulently obtained the OTP by impersonating a bank official.",
        punishment: "Imprisonment up to 7 years, and fine.",
      },
      {
        section: "IT Act 66D",
        title: "Punishment for Cheating by Personation Using Computer Resource",
        explanation: "Applied as the accused used phone/computer to cheat by impersonating a bank representative.",
        punishment: "Imprisonment up to 3 years, and fine up to Rs. 1 lakh.",
      },
    ],
    investigationSteps: [
      { step: 1, action: "Bank Transaction Analysis", details: "Obtain transaction logs from SBI. Identify beneficiary accounts.", priority: "High", completed: false },
      { step: 2, action: "Phone Number Tracing", details: "Trace the calling number through telecom provider. Obtain CDR records.", priority: "High", completed: false },
      { step: 3, action: "Cybercrime Cell Referral", details: "Forward to Pune Cybercrime Cell for technical investigation.", priority: "Medium", completed: false },
    ],
    lat: 18.5074,
    lng: 73.8077,
  },
  {
    id: "FIR-2024-005",
    incidentType: "Missing Person",
    location: "Hadapsar, Pune",
    district: "Pune",
    date: "2024-11-14",
    status: "Under Investigation",
    assignedOfficer: "SI Vikram Singh",
    branch: "Hadapsar Police Station",
    victimName: "Kavita Bhosle (Guardian)",
    victimStatement:
      "My 16-year-old daughter Pooja Bhosle went to school on 14th November and did not return home. School confirmed she left at 3:30 PM. Her mobile phone is switched off.",
    ipcSections: [],
    investigationSteps: [
      { step: 1, action: "School Route Canvass", details: "Cover all routes from school to home. Check auto-rickshaw and bus stands.", priority: "High", completed: true },
      { step: 2, action: "Phone Location Trace", details: "Get last tower location from telecom operator for victim's mobile.", priority: "High", completed: true },
      { step: 3, action: "Social Media Check", details: "Check victim's social media accounts for recent activity or contacts.", priority: "Medium", completed: false },
    ],
    lat: 18.4966,
    lng: 73.9274,
  },
];

export const CHAT_MESSAGES_SAMPLE: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Good day, Officer. I am the AI Investigation Assistant for FIR-2024-001. I have analysed the case details, IPC sections, and available evidence. How can I assist your investigation today?",
    timestamp: "09:00",
  },
  {
    role: "officer",
    content: "Why was IPC Section 356 suggested for this case?",
    timestamp: "09:02",
  },
  {
    role: "assistant",
    content:
      "IPC Section 356 — Assault or Criminal Force in Attempt to Commit Theft — was applied because the accused physically snatched the victim's gold chain and handbag while she was walking. The act of forcibly pulling the chain from her person constitutes criminal force under Section 350 IPC, and since this force was used in the commission of theft, Section 356 becomes squarely applicable. The fact that there were two accused acting in concert on a motorcycle further strengthens this charge as a planned snatching operation.",
    timestamp: "09:02",
  },
  {
    role: "officer",
    content: "Are there additional CCTV cameras near the incident location I should check?",
    timestamp: "09:05",
  },
  {
    role: "assistant",
    content:
      "Based on the incident location at MG Road near Cosmos Mall, I recommend checking the following: (1) Cosmos Mall parking entrance cameras — typically cover 50m radius of road. (2) Pune Municipal Corporation traffic signal cameras at MG Road-Deccan intersection. (3) SBI and HDFC ATM cameras within 150m — these often capture passing vehicles. (4) Private security cameras of the two commercial buildings flanking the incident spot. The accused's escape route toward Deccan would pass through at minimum 2 traffic signal camera points. Request footage from Pune Traffic Control Room for that corridor between 8:15 PM and 9:00 PM.",
    timestamp: "09:05",
  },
];
