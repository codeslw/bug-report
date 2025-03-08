export type BugStatus = 'Open' | 'In Progress' | 'Fixed' | 'Won\'t Fix' | 'Duplicate';
export type ResponsibleParty = 'Frontend' | 'Backend' | 'PM' | 'Design' | 'QA';

export interface BugUrl {
  id: string;
  url: string;
}

export interface Bug {
  id: string;
  description: string;
  urls: BugUrl[];
  imageUrl: string;
  status: BugStatus;
  comment: string;
  responsible: ResponsibleParty;
  createdAt: string;
  updatedAt: string;
}

export interface BugFormData {
  description: string;
  urls: BugUrl[];
  image?: File;
  status: BugStatus;
  comment: string;
  responsible: ResponsibleParty;
}