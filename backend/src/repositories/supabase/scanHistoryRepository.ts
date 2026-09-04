import { supabase } from "./client.js";
import type {
  NewScanHistoryEntry,
  ScanHistoryEntry,
  ScanHistoryRepository,
} from "../types.js";

interface Row {
  id: string;
  user_id: string;
  scan_type: "meal" | "fridge";
  photo_path: string;
  raw_ai_result: unknown;
  ai_provider: string;
  created_at: string;
}

function toDomain(row: Row): ScanHistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    scanType: row.scan_type,
    photoPath: row.photo_path,
    rawAiResult: row.raw_ai_result,
    aiProvider: row.ai_provider,
    createdAt: row.created_at,
  };
}

class SupabaseScanHistoryRepository implements ScanHistoryRepository {
  async create(
    userId: string,
    scan: NewScanHistoryEntry,
  ): Promise<ScanHistoryEntry> {
    const { data, error } = await supabase
      .from("scan_history")
      .insert({
        user_id: userId,
        scan_type: scan.scanType,
        photo_path: scan.photoPath,
        raw_ai_result: scan.rawAiResult,
        ai_provider: scan.aiProvider,
      })
      .select()
      .single<Row>();

    if (error || !data) {
      throw new Error(`Failed to create scan history entry: ${error?.message}`);
    }
    return toDomain(data);
  }

  async getById(userId: string, id: string): Promise<ScanHistoryEntry | null> {
    const { data, error } = await supabase
      .from("scan_history")
      .select()
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle<Row>();

    if (error) throw new Error(`Failed to get scan history entry: ${error.message}`);
    return data ? toDomain(data) : null;
  }

  async listByUser(
    userId: string,
    opts: { type?: "meal" | "fridge"; limit?: number } = {},
  ): Promise<ScanHistoryEntry[]> {
    let query = supabase
      .from("scan_history")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(opts.limit ?? 50);

    if (opts.type) query = query.eq("scan_type", opts.type);

    const { data, error } = await query.returns<Row[]>();
    if (error) throw new Error(`Failed to list scan history: ${error.message}`);
    return (data ?? []).map(toDomain);
  }
}

export const scanHistoryRepository: ScanHistoryRepository =
  new SupabaseScanHistoryRepository();
