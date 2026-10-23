/** Righe del database come arrivano da PostgREST. */

export type Profile = {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  mc_uuid: string | null;
  mc_name: string | null;
  mc_verified_at: string | null;
  mc_verified_by: "plugin" | "staff" | null;
  created_at: string;
  last_login_at: string;
};

export type Ticket = {
  id: string;
  number: number;
  subcategory: string;
  title: string;
  author_id: string;
  author_mc_uuid: string | null;
  author_mc_name: string | null;
  author_mc_verified: boolean;
  status: string;
  fields: Record<string, string>;
  priority: "bassa" | "normale" | "alta" | "urgente";
  assigned_to: string | null;
  awaiting: "staff" | "giocatore" | "nessuno";
  reopen_requested_at: string | null;
  created_at: string;
  updated_at: string;
  author_seen_at: string;
  closed_at: string | null;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  author_id: string | null;
  is_staff: boolean;
  body: string;
  created_at: string;
};

export type InternalNote = {
  id: string;
  ticket_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
};

export type Attachment = {
  id: string;
  ticket_id: string;
  message_id: string | null;
  note_id: string | null;
  uploader_id: string | null;
  storage_path: string;
  filename: string;
  mime: string;
  size_bytes: number;
  internal: boolean;
  created_at: string;
};

export type StatusChange = {
  id: string;
  ticket_id: string;
  from_status: string | null;
  to_status: string;
  actor_id: string | null;
  actor_role: "giocatore" | "staff" | "sistema";
  reason: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  profile_id: string;
  ticket_id: string | null;
  kind: string;
  title: string;
  created_at: string;
  read_at: string | null;
  tickets?: { number: number } | null;
};
