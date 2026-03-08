export interface Contact {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  firma: string;
  position: string;
  strasse: string;
  plz: string;
  ort: string;
  bundesland: string;
  mitgliedsnummer: string;
  status: 'aktiv' | 'inaktiv' | 'ausstehend';
  erstelltAm: string;
}

export interface ImageRecord {
  id: string;
  titel: string;
  beschreibung: string;
  dateiname: string;
  url: string;
  kategorie: string;
  tags: string[];
  kontaktId?: string;
  erstelltAm: string;
  groesse: string;
}
