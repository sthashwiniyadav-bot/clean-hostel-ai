export type Severity = "Low" | "Medium" | "High";

export const STATUSES = [
  "Reported",
  "Assigned",
  "Cleaning in Progress",
  "Resolved",
] as const;

export type Status = (typeof STATUSES)[number];

export type Analysis = {
  problem: string;
  wasteType: string;
  severity: Severity;
  recommendation: string;
  confidence: number;
};

export type Report = {
  id: string;
  student: string;
  block: string;
  location: string;
  description: string;
  photo: string;
  analysis: Analysis;
  createdAt: string;
  status: Status;
  assignedTo?: string | undefined;
  afterPhoto?: string | undefined;
  resolvedAt?: string | undefined;
};

export type User = {
  name: string;
  email: string;
  role: "student" | "admin";
};

export const BLOCKS = ["Block A", "Block B", "Block C", "Block D", "Girls Hostel"];

export const LOCATIONS = [
  "Corridor",
  "Washroom",
  "Staircase",
  "Canteen / Mess",
  "Window Ledge",
  "Common Room",
  "Water Cooler Area",
  "Parking / Entrance",
];

export const STAFF = ["Ramesh K.", "Suman Devi", "Arjun P.", "Lakshmi N.", "Vikram S."];
