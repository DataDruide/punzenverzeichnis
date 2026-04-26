export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          context: Json | null
          created_at: string
          event_type: string
          id: string
          message: string
          severity: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          event_type: string
          id?: string
          message: string
          severity?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          severity?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          bundesland: string | null
          created_at: string
          email: string
          firma: string | null
          id: string
          mitgliedsnummer: string | null
          nachname: string
          ort: string | null
          plz: string | null
          position: string | null
          status: string
          strasse: string | null
          telefon: string | null
          updated_at: string
          vorname: string
        }
        Insert: {
          bundesland?: string | null
          created_at?: string
          email: string
          firma?: string | null
          id?: string
          mitgliedsnummer?: string | null
          nachname: string
          ort?: string | null
          plz?: string | null
          position?: string | null
          status?: string
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          vorname: string
        }
        Update: {
          bundesland?: string | null
          created_at?: string
          email?: string
          firma?: string | null
          id?: string
          mitgliedsnummer?: string | null
          nachname?: string
          ort?: string | null
          plz?: string | null
          position?: string | null
          status?: string
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          vorname?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          beschreibung: string | null
          created_at: string
          dateiname: string
          groesse: string | null
          id: string
          kategorie: string | null
          kontakt_id: string | null
          mime_type: string | null
          storage_path: string
          tags: string[] | null
          titel: string
          updated_at: string
        }
        Insert: {
          beschreibung?: string | null
          created_at?: string
          dateiname: string
          groesse?: string | null
          id?: string
          kategorie?: string | null
          kontakt_id?: string | null
          mime_type?: string | null
          storage_path: string
          tags?: string[] | null
          titel: string
          updated_at?: string
        }
        Update: {
          beschreibung?: string | null
          created_at?: string
          dateiname?: string
          groesse?: string | null
          id?: string
          kategorie?: string | null
          kontakt_id?: string | null
          mime_type?: string | null
          storage_path?: string
          tags?: string[] | null
          titel?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_kontakt_id_fkey"
            columns: ["kontakt_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      kategorien: {
        Row: {
          beschreibung: string | null
          created_at: string
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          beschreibung?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          beschreibung?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ansprechpartner: string | null
          bemerkungen: string | null
          created_at: string
          darf_recherchieren: boolean | null
          datenschutz_akzeptiert_am: string | null
          email_kontakt: string | null
          firma_aktiv: boolean | null
          firmenname: string
          freigeschaltet: boolean | null
          gesperrt: boolean | null
          id: string
          ort: string | null
          plz: string | null
          recherche_gueltig_bis: string | null
          strasse: string | null
          telefon: string | null
          updated_at: string
          user_id: string
          webseite: string | null
        }
        Insert: {
          ansprechpartner?: string | null
          bemerkungen?: string | null
          created_at?: string
          darf_recherchieren?: boolean | null
          datenschutz_akzeptiert_am?: string | null
          email_kontakt?: string | null
          firma_aktiv?: boolean | null
          firmenname?: string
          freigeschaltet?: boolean | null
          gesperrt?: boolean | null
          id?: string
          ort?: string | null
          plz?: string | null
          recherche_gueltig_bis?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          user_id: string
          webseite?: string | null
        }
        Update: {
          ansprechpartner?: string | null
          bemerkungen?: string | null
          created_at?: string
          darf_recherchieren?: boolean | null
          datenschutz_akzeptiert_am?: string | null
          email_kontakt?: string | null
          firma_aktiv?: boolean | null
          firmenname?: string
          freigeschaltet?: boolean | null
          gesperrt?: boolean | null
          id?: string
          ort?: string | null
          plz?: string | null
          recherche_gueltig_bis?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          user_id?: string
          webseite?: string | null
        }
        Relationships: []
      }
      punzen: {
        Row: {
          bearbeitung_beantragt: boolean | null
          bemerkungen_admin: string | null
          beschreibung: string | null
          bild_abdruck_path: string | null
          bild_vorlage_path: string | null
          created_at: string
          einwilligung_akzeptiert_am: string | null
          gesperrt: boolean | null
          id: string
          kategorie_id: string | null
          updated_at: string
          user_id: string
          veroeffentlicht: boolean | null
          verwendung_beginn: string | null
          verwendung_ende: string | null
          zur_publikation_eingereicht: boolean | null
        }
        Insert: {
          bearbeitung_beantragt?: boolean | null
          bemerkungen_admin?: string | null
          beschreibung?: string | null
          bild_abdruck_path?: string | null
          bild_vorlage_path?: string | null
          created_at?: string
          einwilligung_akzeptiert_am?: string | null
          gesperrt?: boolean | null
          id?: string
          kategorie_id?: string | null
          updated_at?: string
          user_id: string
          veroeffentlicht?: boolean | null
          verwendung_beginn?: string | null
          verwendung_ende?: string | null
          zur_publikation_eingereicht?: boolean | null
        }
        Update: {
          bearbeitung_beantragt?: boolean | null
          bemerkungen_admin?: string | null
          beschreibung?: string | null
          bild_abdruck_path?: string | null
          bild_vorlage_path?: string | null
          created_at?: string
          einwilligung_akzeptiert_am?: string | null
          gesperrt?: boolean | null
          id?: string
          kategorie_id?: string | null
          updated_at?: string
          user_id?: string
          veroeffentlicht?: boolean | null
          verwendung_beginn?: string | null
          verwendung_ende?: string | null
          zur_publikation_eingereicht?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "punzen_kategorie_id_fkey"
            columns: ["kategorie_id"]
            isOneToOne: false
            referencedRelation: "kategorien"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punzen_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_above: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "superadmin"],
    },
  },
} as const
