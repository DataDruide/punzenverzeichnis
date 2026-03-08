import { Contact, ImageRecord } from '@/types';

export const mockContacts: Contact[] = [
  {
    id: '1', vorname: 'Thomas', nachname: 'Müller', email: 'thomas.mueller@example.de',
    telefon: '+49 89 12345678', firma: 'Müller & Partner GmbH', position: 'Geschäftsführer',
    strasse: 'Maximilianstr. 12', plz: '80539', ort: 'München', bundesland: 'Bayern',
    mitgliedsnummer: 'BV-2024-001', status: 'aktiv', erstelltAm: '2024-01-15',
  },
  {
    id: '2', vorname: 'Anna', nachname: 'Schmidt', email: 'a.schmidt@example.de',
    telefon: '+49 30 98765432', firma: 'Schmidt Consulting', position: 'Beraterin',
    strasse: 'Unter den Linden 5', plz: '10117', ort: 'Berlin', bundesland: 'Berlin',
    mitgliedsnummer: 'BV-2024-002', status: 'aktiv', erstelltAm: '2024-02-20',
  },
  {
    id: '3', vorname: 'Klaus', nachname: 'Weber', email: 'k.weber@example.de',
    telefon: '+49 40 55443322', firma: 'Weber Technik AG', position: 'Vorstand',
    strasse: 'Jungfernstieg 30', plz: '20354', ort: 'Hamburg', bundesland: 'Hamburg',
    mitgliedsnummer: 'BV-2024-003', status: 'inaktiv', erstelltAm: '2024-03-10',
  },
  {
    id: '4', vorname: 'Maria', nachname: 'Fischer', email: 'm.fischer@example.de',
    telefon: '+49 221 11223344', firma: 'Fischer Design Studio', position: 'Kreativdirektorin',
    strasse: 'Hohe Str. 88', plz: '50667', ort: 'Köln', bundesland: 'Nordrhein-Westfalen',
    mitgliedsnummer: 'BV-2024-004', status: 'aktiv', erstelltAm: '2024-04-05',
  },
  {
    id: '5', vorname: 'Stefan', nachname: 'Becker', email: 's.becker@example.de',
    telefon: '+49 711 99887766', firma: 'Becker Ingenieure', position: 'Projektleiter',
    strasse: 'Königstr. 42', plz: '70173', ort: 'Stuttgart', bundesland: 'Baden-Württemberg',
    mitgliedsnummer: 'BV-2024-005', status: 'ausstehend', erstelltAm: '2024-05-12',
  },
];

export const mockImages: ImageRecord[] = [
  {
    id: '1', titel: 'Jahresversammlung 2024', beschreibung: 'Gruppenfoto der Jahresversammlung',
    dateiname: 'jahresversammlung_2024.jpg', url: '/placeholder.svg', kategorie: 'Veranstaltungen',
    tags: ['Versammlung', '2024', 'Gruppe'], kontaktId: '1', erstelltAm: '2024-06-15', groesse: '2.4 MB',
  },
  {
    id: '2', titel: 'Vorstandssitzung Q1', beschreibung: 'Protokollfoto der Vorstandssitzung',
    dateiname: 'vorstand_q1.jpg', url: '/placeholder.svg', kategorie: 'Sitzungen',
    tags: ['Vorstand', 'Q1'], erstelltAm: '2024-03-20', groesse: '1.8 MB',
  },
  {
    id: '3', titel: 'Messestand IFA', beschreibung: 'Unser Stand auf der IFA Berlin',
    dateiname: 'messestand_ifa.jpg', url: '/placeholder.svg', kategorie: 'Messen',
    tags: ['Messe', 'IFA', 'Berlin'], kontaktId: '2', erstelltAm: '2024-09-10', groesse: '3.1 MB',
  },
  {
    id: '4', titel: 'Schulung Digitalisierung', beschreibung: 'Workshop-Fotos zur Digitalisierung',
    dateiname: 'schulung_digital.jpg', url: '/placeholder.svg', kategorie: 'Schulungen',
    tags: ['Schulung', 'Digital'], erstelltAm: '2024-07-22', groesse: '1.5 MB',
  },
];
