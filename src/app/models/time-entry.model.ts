export interface TimeEntry {
  id: string;
  description: string;
  projectId: string | null;
  tags: string[];
  billable: boolean;
  startTime: string; // ISO datetime
  endTime: string | null; // ISO datetime, null if running
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface DayGroup {
  dateKey: string; // YYYY-MM-DD
  label: string;
  entries: TimeEntry[];
  totalSeconds: number;
}
