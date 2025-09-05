export interface DataBuddyQueryBody {
  website_id?: string;
  websiteId?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  id?: string;
  parameters?: unknown;
  limit?: number;
  page?: number;
  filters?: unknown;
}

export interface DataBuddyUpstreamBody {
  id: string;
  parameters: unknown;
  limit?: number;
  page?: number;
  filters?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RequestHeaders {
  'content-type': string;
  'x-api-key'?: string;
  cookie?: string;
}

export interface HttpResponseHeaders {
  'content-type': string;
}

export interface NextApiRequest extends Request {
  json(): Promise<DataBuddyQueryBody>;
  url: string;
}

export interface NextApiResponse extends Response {
  status: number;
  headers: Headers;
}
