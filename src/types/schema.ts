export type Project = {
  id: string;
  name: string;
  logo: string;
  link: string;
  twitterLink?: string;
  isActive: boolean;
  lastActivity: string;
  notes: string;
  joinDate: string;
  chain: string;
  stage: "Waitlist" | "Testnet" | "Early Access" | "Mainnet";
  tags: string[];
  type: "Retroactive" | "Testnet" | "Mini App" | "Node";
  cost: number;
  created_at?: string;
  updated_at?: string;
};

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
