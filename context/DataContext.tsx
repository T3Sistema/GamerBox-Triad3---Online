import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Organizer, Event, Raffle, Participant, Company, Collaborator, Prize } from '../types';
import { supabase } from '../src/lib/supabaseClient';

// Helper to use localStorage for authentication state
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// --- DATA TRANSFORMATION HELPERS ---
// Supabase uses snake_case, our app uses camelCase. These helpers bridge the gap.

const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));

const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => ({
      ...result,
      [snakeToCamel(key)]: toCamel(obj[key]),
    }), {});
  }
  return obj;
};

const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const toSnake = (obj: any): any => {
   if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      // Exclude special keys that shouldn't be transformed
      if (key === 'password' || key === 'confirmPassword') {
        result[key] = obj[key];
        return result;
      }
      result[camelToSnake(key)] = toSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// --- DATA CONTEXT ---
interface DataContextType {
  // Data
  organizers: Organizer[];
  events: Event[];
  companies: Company[];
  participants: Participant[];
  winners: Participant[];
  eventCompanies: Company[];

  // State
  loggedInOrganizer: Organizer | null;
  loggedInCollaborator: Collaborator | null;
  loggedInCollaboratorCompany: Company | null;
  selectedEvent: Event | null;
  selectedRaffle: Raffle | null;
  organizerEvents: Event[];
  selectedEventRaffles: Raffle[];
  isSuperAdmin: boolean;

  // Setters
  setSelectedEventId: (id: string | null) => void;
  setSelectedRaffleId: (id: string | null) => void;
  
  // Auth
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loginSuperAdmin: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logoutSuperAdmin: () => void;
  viewAsOrganizer: (organizerId: string, eventId: string) => void;
  stopImpersonating: () => void;
  logoutCollaborator: () => void;
  
  // Data mutations
  addParticipant: (participant: Omit<Participant, 'id' | 'isWinner'>) => Promise<{ success: boolean; message: string }>;
  drawWinner: () => Promise<Participant | null>;
  getEligibleParticipantCount: () => number;
  findRaffleByCode: (code: string) => Promise<(Raffle & { event: Event }) | null>;
  createEventWithRaffle: (data: { eventName: string; raffleName: string; raffleQuantity: number; raffleCode: string; }) => Promise<{ success: boolean; message: string }>;
  
  // Admin mutations
  saveOrganizer: (organizerData: Omit<Organizer, 'id'>, id?: string) => Promise<{ success: boolean; message: string }>;
  deleteOrganizer: (id: string) => Promise<{ success: boolean; message: string }>;
  saveEvent: (eventData: any, id?: string) => Promise<{ success: boolean; message: string }>;
  deleteEvent: (id: string) => Promise<{ success: boolean; message: string }>;

  // Company/Collaborator mutations
  saveCompany: (companyData: Omit<Company, 'id' | 'eventId'>, id?: string) => Promise<void>;
  updateCompanySettings: (companyId: string, settings: Partial<Pick<Company, 'roletaColors'>>) => void;
  deleteCompany: (id: string) => void;
  companyCollaborators: (companyId: string) => Collaborator[];
  addCollaborator: (companyId: string, collaboratorData: Omit<Collaborator, 'id' | 'companyId'>) => Promise<void>;
  updateCollaborator: (id: string, collaboratorData: Omit<Collaborator, 'id' | 'companyId'>) => Promise<void>;
  deleteCollaborator: (id: string) => void;
  validateCollaborator: (companyCode: string, personalCode: string) => Promise<{ success: boolean; message: string; collaborator?: Collaborator }>;
  
  // Prize mutations
  companyPrizes: (companyId: string) => Prize[];
  savePrize: (companyId: string, prizeData: Omit<Prize, 'id' | 'companyId'>, id?: string) => void;
  deletePrize: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const BUCKET_NAME = 'gamerboxtriade';
const DEFAULT_IMAGE_URL = 'https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/prospectaifeedback/WhatsApp%20Image%202025-09-12%20at%2000.14.26.jpeg';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- LOCAL STATE (Data from Supabase) ---
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // --- AUTH & SELECTION STATE (Persisted in localStorage) ---
  const [loggedInOrganizer, setLoggedInOrganizer] = useStickyState<Organizer | null>(null, 'sorteio-organizer');
  const [loggedInCollaborator, setLoggedInCollaborator] = useStickyState<Collaborator | null>(null, 'sorteio-collaborator');
  const [selectedEventId, setSelectedEventId] = useStickyState<string | null>(null, 'sorteio-selectedEventId');
  const [selectedRaffleId, setSelectedRaffleId] = useStickyState<string | null>(null, 'sorteio-selectedRaffleId');
  const [isSuperAdmin, setIsSuperAdmin] = useStickyState<boolean>(false, 'sorteio-isSuperAdmin');
  const [impersonatingFromAdmin, setImpersonatingFromAdmin] = useStickyState<boolean>(false, 'sorteio-impersonating');
  
  // --- IMAGE UPLOAD HELPER ---
  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!file) return null;
    try {
      const filePath = `public/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }, []);

  // --- DATA FETCHING LOGIC ---
  const fetchAdminData = useCallback(async () => {
    const { data: orgData, error: orgError } = await supabase.from('organizers').select('*');
    const { data: eventData, error: eventError } = await supabase.from('events').select('*');
    if (orgData) setOrganizers(toCamel(orgData));
    if (eventData) setEvents(toCamel(eventData));
  }, []);
  
  const fetchOrganizerData = useCallback(async (organizerId: string) => {
    const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('organizer_id', organizerId);
    if (!eventData) return;
    
    setEvents(toCamel(eventData));
    const eventIds = eventData.map(e => e.id);

    if (eventIds.length > 0) {
        const { data: raffleData } = await supabase.from('raffles').select('*').in('event_id', eventIds);
        const { data: companyData } = await supabase.from('companies').select('*').in('event_id', eventIds);
        
        if(raffleData) {
            setRaffles(toCamel(raffleData));
            const raffleIds = raffleData.map(r => r.id);
            if (raffleIds.length > 0) {
                 const { data: participantData } = await supabase.from('participants').select('*').in('raffle_id', raffleIds);
                 if(participantData) setParticipants(toCamel(participantData));
            } else {
                setParticipants([]);
            }
        }
        
        if(companyData) {
            setCompanies(toCamel(companyData));
            const companyIds = companyData.map(c => c.id);
            if(companyIds.length > 0) {
                const { data: collaboratorData } = await supabase.from('collaborators').select('*').in('company_id', companyIds);
                const { data: prizeData } = await supabase.from('prizes').select('*').in('company_id', companyIds);
                if(collaboratorData) setCollaborators(toCamel(collaboratorData));
                if(prizeData) setPrizes(toCamel(prizeData));
            } else {
                setCollaborators([]);
                setPrizes([]);
            }
        }
    } else {
      setRaffles([]);
      setCompanies([]);
      setParticipants([]);
      setCollaborators([]);
      setPrizes([]);
    }
  }, []);
  
  const fetchCollaboratorData = useCallback(async (companyId: string) => {
      const { data: companyData, error } = await supabase.from('companies').select('*, events(*)').eq('id', companyId).single();
      if (!companyData) return;

      const event = companyData.events;
      setCompanies(toCamel([companyData]));
      if(event) {
        setEvents(toCamel([event]));
        setSelectedEventId(event.id);

        const { data: raffleData } = await supabase.from('raffles').select('*').eq('event_id', event.id);
        const { data: prizeData } = await supabase.from('prizes').select('*').eq('company_id', companyData.id);
        
        if (raffleData) {
            setRaffles(toCamel(raffleData));
             const raffleIds = raffleData.map(r => r.id);
            if (raffleIds.length > 0) {
                 const { data: participantData } = await supabase.from('participants').select('*').in('raffle_id', raffleIds);
                 if(participantData) setParticipants(toCamel(participantData));
            }
        }
        if(prizeData) setPrizes(toCamel(prizeData));
      }
  }, [setSelectedEventId]);

  useEffect(() => {
    if (isSuperAdmin && !impersonatingFromAdmin) {
      fetchAdminData();
    } else if (loggedInOrganizer) {
      fetchOrganizerData(loggedInOrganizer.id);
    } else if (loggedInCollaborator) {
        fetchCollaboratorData(loggedInCollaborator.companyId);
    }
  }, [isSuperAdmin, loggedInOrganizer, loggedInCollaborator, impersonatingFromAdmin, fetchAdminData, fetchOrganizerData, fetchCollaboratorData]);

  // --- COMPUTED STATE ---
  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId) ?? null, [events, selectedEventId]);
  const organizerEvents = useMemo(() => events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [events]);
  const selectedEventRaffles = useMemo(() => {
    if (!selectedEvent) return [];
    return raffles.filter(r => r.eventId === selectedEvent.id);
  }, [raffles, selectedEvent]);
  const selectedRaffle = useMemo(() => raffles.find(r => r.id === selectedRaffleId) ?? null, [raffles, selectedRaffleId]);
  const eventParticipants = useMemo(() => participants, [participants]); // Simplified, as we fetch participants per organizer
  const winners = useMemo(() => eventParticipants.filter(p => p.isWinner), [eventParticipants]);
  const eventCompanies = useMemo(() => {
    if (!selectedEvent) return [];
    return companies.filter(c => c.eventId === selectedEvent.id);
  }, [companies, selectedEvent]);
  const loggedInCollaboratorCompany = useMemo(() => {
    if (!loggedInCollaborator) return null;
    return companies.find(c => c.id === loggedInCollaborator.companyId) ?? null;
  }, [loggedInCollaborator, companies]);

  // --- AUTH FUNCTIONS ---
  const login = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase.from('organizers').select('*').eq('email', email.toLowerCase()).single();
    if (error || !data) return { success: false, message: 'E-mail ou senha inválidos.' };
    if (data.password_hash === pass) { // Plain text check as per DB setup
      setLoggedInOrganizer(toCamel(data));
      return { success: true, message: 'Login bem-sucedido!' };
    }
    return { success: false, message: 'E-mail ou senha inválidos.' };
  }, [setLoggedInOrganizer]);

  const loginSuperAdmin = useCallback(async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase.from('admins').select('*').eq('email', email.toLowerCase()).single();
    if (error || !data) return { success: false, message: 'Credenciais de admin inválidas.' };
    if (data.password_hash === pass) {
      setIsSuperAdmin(true);
      return { success: true, message: 'Login de admin bem-sucedido!' };
    }
    return { success: false, message: 'Credenciais de admin inválidas.' };
  }, [setIsSuperAdmin]);

  const logout = useCallback(() => {
    setLoggedInOrganizer(null);
    setSelectedEventId(null);
    setSelectedRaffleId(null);
  }, [setLoggedInOrganizer, setSelectedEventId, setSelectedRaffleId]);
  
  const logoutSuperAdmin = useCallback(() => setIsSuperAdmin(false), [setIsSuperAdmin]);
  const logoutCollaborator = useCallback(() => setLoggedInCollaborator(null), [setLoggedInCollaborator]);

  const viewAsOrganizer = useCallback(async (organizerId: string, eventId: string) => {
    const { data, error } = await supabase.from('organizers').select('*').eq('id', organizerId).single();
    if(data) {
        setImpersonatingFromAdmin(true);
        setLoggedInOrganizer(toCamel(data));
        setSelectedEventId(eventId);
    }
  }, [setImpersonatingFromAdmin, setLoggedInOrganizer, setSelectedEventId]);

  const stopImpersonating = useCallback(() => {
    setImpersonatingFromAdmin(false);
    logout();
  }, [logout, setImpersonatingFromAdmin]);

  // --- MUTATION FUNCTIONS ---
  
  const addParticipant = useCallback(async (participantData: Omit<Participant, 'id' | 'isWinner'>): Promise<{ success: boolean; message: string }> => {
      const { data: raffle } = await supabase.from('raffles').select('quantity, name').eq('id', participantData.raffleId).single();
      if (!raffle) return { success: false, message: 'Sorteio não encontrado.' };

      const { data: existing, error: findError } = await supabase.from('participants').select('id').eq('email', participantData.email.toLowerCase()).eq('raffle_id', participantData.raffleId).maybeSingle();
      if(existing) return { success: false, message: 'Este e-mail já está cadastrado neste sorteio.' };

      const { count: winnerCount } = await supabase.from('participants').select('*', { count: 'exact', head: true }).eq('raffle_id', participantData.raffleId).eq('is_winner', true);
      if (winnerCount !== null && winnerCount >= raffle.quantity) {
          return { success: false, message: `O sorteio para "${raffle.name}" já atingiu o limite de ganhadores.` };
      }
      
      const { error } = await supabase.from('participants').insert(toSnake({ ...participantData, isWinner: false }));
      if(error) return { success: false, message: `Erro ao cadastrar: ${error.message}` };
      
      if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
      return { success: true, message: 'Cadastro realizado com sucesso!' };
  }, [loggedInOrganizer, fetchOrganizerData]);

  const drawWinner = useCallback(async (): Promise<Participant | null> => {
    if (!selectedRaffle) return null;
    const { data: eligible, error } = await supabase.from('participants').select('*').eq('raffle_id', selectedRaffle.id).eq('is_winner', false);
    if (!eligible || eligible.length === 0) return null;

    const winnerData = eligible[Math.floor(Math.random() * eligible.length)];
    
    const { data: updatedWinner, error: updateError } = await supabase.from('participants')
        .update({ is_winner: true, drawn_at: new Date().toISOString() })
        .eq('id', winnerData.id)
        .select()
        .single();
    
    if (updateError || !updatedWinner) return null;

    if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
    if(loggedInCollaborator) fetchCollaboratorData(loggedInCollaborator.companyId);
    return toCamel(updatedWinner);
  }, [selectedRaffle, loggedInOrganizer, loggedInCollaborator, fetchOrganizerData, fetchCollaboratorData]);
  
  const findRaffleByCode = useCallback(async (code: string) => {
    const { data, error } = await supabase.from('raffles').select('*, events(*)').eq('code', code.toUpperCase()).single();
    if (!data || !data.events) return null;
    const { events: event, ...raffle } = data;
    return toCamel({ ...raffle, event });
  }, []);
  
  const createEventWithRaffle = useCallback(async (data: { eventName: string; raffleName: string; raffleQuantity: number; raffleCode: string; }) => {
    if (!loggedInOrganizer) return { success: false, message: 'Organizador não está logado.' };
    let eventId = selectedEvent?.id;

    if (!eventId) {
        const { data: newEventData, error } = await supabase.from('events').insert({ name: data.eventName, date: new Date().toISOString(), organizer_id: loggedInOrganizer.id }).select().single();
        if (error || !newEventData) return { success: false, message: `Erro ao criar evento: ${error?.message}` };
        eventId = newEventData.id;
    }
    
    const fullRaffleCode = `${loggedInOrganizer.organizerCode}${data.raffleCode}`;
    const { data: existingRaffle } = await supabase.from('raffles').select('id').eq('code', fullRaffleCode).maybeSingle();
    if(existingRaffle) return { success: false, message: 'Este código de sorteio já está em uso.' };

    const { error: raffleError } = await supabase.from('raffles').insert({
        name: data.raffleName,
        quantity: data.raffleQuantity,
        code: fullRaffleCode,
        event_id: eventId,
    });

    if (raffleError) return { success: false, message: `Erro ao criar sorteio: ${raffleError.message}` };
    
    fetchOrganizerData(loggedInOrganizer.id);
    return { success: true, message: `Sorteio "${data.raffleName}" adicionado!` };
  }, [selectedEvent, loggedInOrganizer, fetchOrganizerData]);

  const saveOrganizer = async (organizerData: any, id?: string): Promise<{ success: boolean; message: string }> => {
      const dataToSave = { ...organizerData };

      if (dataToSave.photoUrl && dataToSave.photoUrl instanceof File) {
          const newUrl = await uploadImage(dataToSave.photoUrl);
          if (newUrl) {
              dataToSave.photoUrl = newUrl;
          } else {
              return { success: false, message: 'Falha no upload da foto.' };
          }
      } else if (!id && !dataToSave.photoUrl) {
          dataToSave.photoUrl = DEFAULT_IMAGE_URL;
      }
      
      // FIX: Map the `password` field from the form to `password_hash` for the database.
      if (dataToSave.password) {
        dataToSave.password_hash = dataToSave.password;
      }
      delete dataToSave.password; // Remove the original key to avoid sending it.

      let result;
      const snakeData = toSnake(dataToSave);
      
      // When updating, if password was not provided, don't update the hash in the DB.
      if (id && !snakeData.password_hash) {
          delete snakeData.password_hash;
      }
      
      if (id) {
          result = await supabase.from('organizers').update(snakeData).eq('id', id);
      } else {
          result = await supabase.from('organizers').insert(snakeData);
      }
      
      if(result.error) return { success: false, message: result.error.message };
      
      fetchAdminData();
      return { success: true, message: `Organizador ${id ? 'atualizado' : 'criado'} com sucesso!` };
  };

  const deleteOrganizer = async (id: string): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('organizers').delete().eq('id', id);
      if(error) return { success: false, message: error.message };
      fetchAdminData();
      return { success: true, message: 'Organizador e seus eventos foram excluídos.' };
  };

  const saveEvent = async (formData: any, id?: string): Promise<{ success: boolean; message: string }> => {
      const finalFormData = { ...formData };
      let organizerId = finalFormData.existingOrganizerId;
      
      if (!id && finalFormData.organizerType === 'new') {
        if (finalFormData.newOrganizerPhotoUrl && finalFormData.newOrganizerPhotoUrl instanceof File) {
            const publicUrl = await uploadImage(finalFormData.newOrganizerPhotoUrl);
            if (publicUrl) {
                finalFormData.newOrganizerPhotoUrl = publicUrl;
            } else {
                return { success: false, message: "Falha no upload da foto do organizador." };
            }
        } else if (!finalFormData.newOrganizerPhotoUrl) {
            finalFormData.newOrganizerPhotoUrl = DEFAULT_IMAGE_URL;
        }

        const {data: orgData, error: orgError} = await supabase.from('organizers').insert(toSnake({
            name: finalFormData.newOrganizerName,
            responsibleName: finalFormData.newOrganizerResponsible,
            email: finalFormData.newOrganizerEmail,
            phone: finalFormData.newOrganizerPhone,
            photoUrl: finalFormData.newOrganizerPhotoUrl,
            organizerCode: '', // This should be in the form
            password_hash: finalFormData.newOrganizerPassword
        })).select().single();

        if (orgError || !orgData) return { success: false, message: orgError?.message || 'Falha ao criar organizador.'};
        organizerId = orgData.id;
      }

      if (finalFormData.eventBannerUrl && finalFormData.eventBannerUrl instanceof File) {
          const publicUrl = await uploadImage(finalFormData.eventBannerUrl);
          if (publicUrl) {
            finalFormData.eventBannerUrl = publicUrl;
          } else {
            return { success: false, message: "Falha no upload do banner." };
          }
      } else if (!finalFormData.eventBannerUrl) {
          finalFormData.eventBannerUrl = DEFAULT_IMAGE_URL;
      }

      const eventPayload = {
          name: finalFormData.eventName,
          date: finalFormData.eventDate,
          details: finalFormData.eventDetails,
          banner_url: finalFormData.eventBannerUrl,
          organizer_id: organizerId
      };

      const result = id 
        ? await supabase.from('events').update(eventPayload).eq('id', id)
        : await supabase.from('events').insert(eventPayload);

      if(result.error) return { success: false, message: result.error.message };

      fetchAdminData();
      return { success: true, message: `Evento ${id ? 'atualizado' : 'criado'} com sucesso!` };
  };

  const deleteEvent = async (id: string): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if(error) return { success: false, message: error.message };
      fetchAdminData();
      return { success: true, message: 'Evento excluído.' };
  };

  const saveCompany = async (companyData: any, id?: string) => {
    if(!selectedEvent) return;
    const dataToSave = { ...companyData };

    if (dataToSave.logoUrl && dataToSave.logoUrl instanceof File) {
        const newUrl = await uploadImage(dataToSave.logoUrl);
        dataToSave.logoUrl = newUrl;
    }

    if (!dataToSave.logoUrl) {
      dataToSave.logoUrl = DEFAULT_IMAGE_URL;
    }

    const payload = { ...toSnake(dataToSave), event_id: selectedEvent.id };
    id 
      ? await supabase.from('companies').update(payload).eq('id', id)
      : await supabase.from('companies').insert(payload);
    if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
  };
  
  const updateCompanySettings = async (companyId: string, settings: Partial<Pick<Company, 'roletaColors'>>) => {
      await supabase.from('companies').update(toSnake(settings)).eq('id', companyId);
      if(loggedInCollaborator) fetchCollaboratorData(loggedInCollaborator.companyId);
  };

  const deleteCompany = async (id: string) => {
      await supabase.from('companies').delete().eq('id', id);
      if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
  };

  const addCollaborator = async (companyId: string, collaboratorData: any) => {
    const dataToSave = { ...collaboratorData };
    if (dataToSave.photoUrl && dataToSave.photoUrl instanceof File) {
      const newUrl = await uploadImage(dataToSave.photoUrl);
      dataToSave.photoUrl = newUrl;
    }

    if (!dataToSave.photoUrl) {
      dataToSave.photoUrl = DEFAULT_IMAGE_URL;
    }

    await supabase.from('collaborators').insert({ ...toSnake(dataToSave), company_id: companyId });
    if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
  };

  const updateCollaborator = async (id: string, collaboratorData: any) => {
    const dataToSave = { ...collaboratorData };
    if (dataToSave.photoUrl && dataToSave.photoUrl instanceof File) {
      const newUrl = await uploadImage(dataToSave.photoUrl);
      dataToSave.photoUrl = newUrl;
    }
    
    if (!dataToSave.photoUrl) {
      dataToSave.photoUrl = DEFAULT_IMAGE_URL;
    }

    await supabase.from('collaborators').update(toSnake(dataToSave)).eq('id', id);
    if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
  };

  const deleteCollaborator = async (id: string) => {
      await supabase.from('collaborators').delete().eq('id', id);
      if(loggedInOrganizer) fetchOrganizerData(loggedInOrganizer.id);
  };

  const validateCollaborator = async (companyCode: string, personalCode: string): Promise<{ success: boolean; message: string; collaborator?: Collaborator }> => {
    const { data: company, error: companyError } = await supabase.from('companies').select('id, event_id').eq('code', companyCode.toUpperCase()).single();
    if (!company) return { success: false, message: 'Código da Empresa / Estande inválido.' };
    
    const { data: collaborator, error: collabError } = await supabase.from('collaborators').select('*').eq('company_id', company.id).eq('code', personalCode.toUpperCase()).single();
    if (!collaborator) return { success: false, message: 'Seu Código Pessoal é inválido para esta empresa.' };

    setLoggedInCollaborator(toCamel(collaborator));
    return { success: true, message: `Check-in realizado com sucesso, ${collaborator.name}!`, collaborator: toCamel(collaborator) };
  };
  
  const savePrize = async (companyId: string, prizeData: Omit<Prize, 'id' | 'companyId'>, id?: string) => {
    const payload = { ...toSnake(prizeData), company_id: companyId };
    id 
      ? await supabase.from('prizes').update(payload).eq('id', id)
      : await supabase.from('prizes').insert(payload);
    if(loggedInCollaborator) fetchCollaboratorData(loggedInCollaborator.companyId);
  };
  
  const deletePrize = async (id: string) => {
      await supabase.from('prizes').delete().eq('id', id);
      if(loggedInCollaborator) fetchCollaboratorData(loggedInCollaborator.companyId);
  };

  const value: DataContextType = {
    organizers, events, companies, participants: eventParticipants, winners, eventCompanies,
    loggedInOrganizer: impersonatingFromAdmin ? loggedInOrganizer : (isSuperAdmin ? null : loggedInOrganizer),
    loggedInCollaborator, loggedInCollaboratorCompany,
    selectedEvent, selectedRaffle, organizerEvents, selectedEventRaffles, isSuperAdmin,
    setSelectedEventId, setSelectedRaffleId,
    login, logout, loginSuperAdmin, logoutSuperAdmin, logoutCollaborator, viewAsOrganizer, stopImpersonating,
    addParticipant,
    drawWinner,
    getEligibleParticipantCount: useCallback(() => {
        if (!selectedRaffle) return 0;
        return participants.filter(p => p.raffleId === selectedRaffle.id && !p.isWinner).length;
    }, [participants, selectedRaffle]),
    findRaffleByCode, createEventWithRaffle, saveOrganizer, deleteOrganizer, saveEvent, deleteEvent, saveCompany, updateCompanySettings,
    deleteCompany,
    companyCollaborators: useCallback((companyId: string) => collaborators.filter(c => c.companyId === companyId), [collaborators]),
    addCollaborator, updateCollaborator, deleteCollaborator, validateCollaborator,
    companyPrizes: useCallback((companyId: string) => prizes.filter(p => p.companyId === companyId), [prizes]),
    savePrize, deletePrize
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};