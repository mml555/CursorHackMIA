export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";
export type ListingType = "offer" | "need";
export type ProposalStatus =
  | "draft"
  | "published"
  | "pending_acceptance"
  | "matched"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "rated"
  | "cancelled"
  | "disputed";
export type SwipeAction = "interested" | "pass" | "save";
export type MemberRole = "owner" | "member";
export type TradeType = "direct" | "multi_party";

export type TradeLineItem = {
  description: string;
  quantity?: number;
  unit?: string;
  fmv?: number;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          legal_name: string;
          dba: string | null;
          slug: string | null;
          metro: string | null;
          vertical: string | null;
          website: string | null;
          description: string | null;
          logo_storage_path: string | null;
          status: BusinessStatus;
          reputation_score: number | null;
          ratings_count: number;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legal_name: string;
          dba?: string | null;
          slug?: string | null;
          metro?: string | null;
          vertical?: string | null;
          website?: string | null;
          description?: string | null;
          logo_storage_path?: string | null;
          status?: BusinessStatus;
          reputation_score?: number | null;
          ratings_count?: number;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legal_name?: string;
          dba?: string | null;
          slug?: string | null;
          metro?: string | null;
          vertical?: string | null;
          website?: string | null;
          description?: string | null;
          logo_storage_path?: string | null;
          status?: BusinessStatus;
          reputation_score?: number | null;
          ratings_count?: number;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_members: {
        Row: {
          id: string;
          profile_id: string;
          business_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          business_id: string;
          role?: MemberRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          business_id?: string;
          role?: MemberRole;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          business_id: string;
          listing_type: ListingType;
          category: string;
          unit: string;
          quantity: number;
          fmv_estimate: number | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          listing_type: ListingType;
          category: string;
          unit: string;
          quantity?: number;
          fmv_estimate?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          listing_type?: ListingType;
          category?: string;
          unit?: string;
          quantity?: number;
          fmv_estimate?: number | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listing_embeddings: {
        Row: {
          listing_id: string;
          embedding: string;
          model: string;
          content_hash: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          embedding: string | number[];
          model?: string;
          content_hash: string;
          updated_at?: string;
        };
        Update: {
          listing_id?: string;
          embedding?: string | number[];
          model?: string;
          content_hash?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trade_proposals: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          trade_type: TradeType;
          status: ProposalStatus;
          version_id: string;
          snapshot: Json | null;
          cash_topup_display: number | null;
          metro: string | null;
          vertical: string | null;
          source: string;
          match_score: number | null;
          match_reason: Json | null;
          created_by_clerk_id: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          trade_type?: TradeType;
          status?: ProposalStatus;
          version_id?: string;
          snapshot?: Json | null;
          cash_topup_display?: number | null;
          metro?: string | null;
          vertical?: string | null;
          source?: string;
          match_score?: number | null;
          match_reason?: Json | null;
          created_by_clerk_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          trade_type?: TradeType;
          status?: ProposalStatus;
          version_id?: string;
          snapshot?: Json | null;
          cash_topup_display?: number | null;
          metro?: string | null;
          vertical?: string | null;
          source?: string;
          match_score?: number | null;
          match_reason?: Json | null;
          created_by_clerk_id?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposal_parties: {
        Row: {
          id: string;
          proposal_id: string;
          business_id: string;
          give_lines: Json;
          receive_lines: Json;
          estimated_fmv: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          business_id: string;
          give_lines?: Json;
          receive_lines?: Json;
          estimated_fmv?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          business_id?: string;
          give_lines?: Json;
          receive_lines?: Json;
          estimated_fmv?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      proposal_swipes: {
        Row: {
          id: string;
          proposal_id: string;
          business_id: string;
          action: SwipeAction;
          reason_tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          business_id: string;
          action: SwipeAction;
          reason_tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          business_id?: string;
          action?: SwipeAction;
          reason_tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposal_acceptances: {
        Row: {
          id: string;
          proposal_id: string;
          business_id: string;
          tax_acknowledged: boolean;
          accepted_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          business_id: string;
          tax_acknowledged?: boolean;
          accepted_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          business_id?: string;
          tax_acknowledged?: boolean;
          accepted_at?: string;
        };
        Relationships: [];
      };
      trade_events: {
        Row: {
          id: string;
          proposal_id: string;
          from_status: ProposalStatus | null;
          to_status: ProposalStatus;
          actor_clerk_id: string | null;
          actor_business_id: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          proposal_id: string;
          from_status?: ProposalStatus | null;
          to_status: ProposalStatus;
          actor_clerk_id?: string | null;
          actor_business_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          proposal_id?: string;
          from_status?: ProposalStatus | null;
          to_status?: ProposalStatus;
          actor_clerk_id?: string | null;
          actor_business_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      vendor_ratings: {
        Row: {
          id: string;
          trade_id: string;
          rater_business_id: string;
          rated_business_id: string;
          score: number;
          tags: string[] | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          rater_business_id: string;
          rated_business_id: string;
          score: number;
          tags?: string[] | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          rater_business_id?: string;
          rated_business_id?: string;
          score?: number;
          tags?: string[] | null;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          trade_id: string;
          business_id: string;
          storage_path: string | null;
          line_items: Json;
          total_fmv: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          business_id: string;
          storage_path?: string | null;
          line_items?: Json;
          total_fmv?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          business_id?: string;
          storage_path?: string | null;
          line_items?: Json;
          total_fmv?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      verification_documents: {
        Row: {
          id: string;
          business_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          reviewed_at: string | null;
          reviewed_by_clerk_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          reviewed_at?: string | null;
          reviewed_by_clerk_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string | null;
          reviewed_at?: string | null;
          reviewed_by_clerk_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      business_photos: {
        Row: {
          id: string;
          business_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      business_status: BusinessStatus;
      listing_type: ListingType;
      proposal_status: ProposalStatus;
      swipe_action: SwipeAction;
      member_role: MemberRole;
      trade_type: TradeType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessPhoto = Database["public"]["Tables"]["business_photos"]["Row"];
export type BusinessMember =
  Database["public"]["Tables"]["business_members"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type TradeProposal =
  Database["public"]["Tables"]["trade_proposals"]["Row"];
