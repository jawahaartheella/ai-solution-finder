export interface Service {
  id: string;
  name: string;
  description: string;
  industries: string[];
  capabilities: string[];
  keywords: string[];
  url: string;
  icon?: string; 
  color?: string;
}