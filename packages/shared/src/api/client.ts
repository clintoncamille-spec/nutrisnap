import {
  ApiError,
  type ApiErrorCode,
  type DailySummary,
  type FavoriteRecipe,
  type FridgeAnalysisResult,
  type MealAnalysisResult,
  type MealLog,
  type MealLogInput,
  type Paginated,
  type Profile,
  type Recipe,
  type ScanHistoryEntry,
} from "./types";

export interface UploadResult {
  photoPath: string;
  signedUrl: string;
}

export interface NutriSnapApiConfig {
  baseUrl: string;
  getAuthToken: () => Promise<string | null>;
}

/**
 * A local file/blob to upload, expressed platform-agnostically. Web builds
 * this from a File/Blob; mobile builds it from an expo-image-manipulator
 * output URI. The concrete apps are responsible for producing this shape.
 */
export interface UploadFile {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

async function parseErrorResponse(res: Response): Promise<never> {
  let code: ApiErrorCode | "unknown" = "unknown";
  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (body?.error) code = body.error;
    if (body?.message) message = body.message;
  } catch {
    // response wasn't JSON — fall back to defaults above
  }
  throw new ApiError(code, message, res.status);
}

export class NutriSnapApiClient {
  private config: NutriSnapApiConfig;

  constructor(config: NutriSnapApiConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const token = await this.config.getAuthToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!res.ok) return parseErrorResponse(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  async uploadPhoto(file: UploadFile): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", file.blob, file.fileName);
    return this.request<UploadResult>("/api/uploads", {
      method: "POST",
      body: form,
    });
  }

  async analyzeMeal(photoPath: string): Promise<MealAnalysisResult> {
    return this.request<MealAnalysisResult>("/api/meals/analyze", {
      method: "POST",
      body: JSON.stringify({ photoPath }),
    });
  }

  async analyzeFridge(photoPath: string): Promise<FridgeAnalysisResult> {
    return this.request<FridgeAnalysisResult>("/api/fridge/analyze", {
      method: "POST",
      body: JSON.stringify({ photoPath }),
    });
  }

  async createMealLog(entry: MealLogInput): Promise<MealLog> {
    return this.request<MealLog>("/api/meals", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async listMealLogs(params: {
    from?: string;
    to?: string;
    cursor?: string;
    limit?: number;
  } = {}): Promise<Paginated<MealLog>> {
    const query = new URLSearchParams();
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return this.request<Paginated<MealLog>>(`/api/meals${qs ? `?${qs}` : ""}`);
  }

  async getMealLog(id: string): Promise<MealLog> {
    return this.request<MealLog>(`/api/meals/${id}`);
  }

  async listScans(params: { type?: "meal" | "fridge" } = {}): Promise<
    ScanHistoryEntry[]
  > {
    const qs = params.type ? `?type=${params.type}` : "";
    return this.request<ScanHistoryEntry[]>(`/api/scans${qs}`);
  }

  async saveFavoriteRecipe(
    recipe: Recipe,
    sourceScanId?: string,
  ): Promise<FavoriteRecipe> {
    return this.request<FavoriteRecipe>("/api/recipes/favorite", {
      method: "POST",
      body: JSON.stringify({ recipe, sourceScanId }),
    });
  }

  async listFavoriteRecipes(): Promise<FavoriteRecipe[]> {
    return this.request<FavoriteRecipe[]>("/api/recipes/favorites");
  }

  async deleteFavoriteRecipe(id: string): Promise<void> {
    await this.request<void>(`/api/recipes/favorites/${id}`, {
      method: "DELETE",
    });
  }

  async getDailySummary(date?: string): Promise<DailySummary> {
    const qs = date ? `?date=${date}` : "";
    return this.request<DailySummary>(`/api/summary${qs}`);
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>("/api/profile");
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  }
}
