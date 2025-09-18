export interface Organizer {
  id: string;
  name: string;
  responsibleName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  organizerCode: string; // e.g., 'TCN'
}

export interface Event {
  id: string;
  name: string;
  date: string; // ISO string format
  details: string;
  bannerUrl?: string;
  organizerId: string;
}

export interface Raffle {
  id:string;
  name: string;
  quantity: number;
  code: string; // This should be unique, e.g., TCNPROMO4K
  eventId: string;
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  email: string;
  raffleId: string;
  isWinner: boolean;
  drawnAt?: string; // ISO string format
}

export interface Company {
  id: string;
  name: string;
  responsibleName: string;
  phone: string;
  email: string;
  logoUrl?: string;
  eventId: string;
  code: string;
  hasSorteio: boolean;
  hasRoleta: boolean;
  roletaColors?: string[];
}

export interface Collaborator {
    id: string;
    name: string;
    phone: string;
    email: string;
    companyId: string;
    code: string;
    photoUrl?: string;
}

export interface Prize {
  id: string;
  name: string;
  companyId: string;
}