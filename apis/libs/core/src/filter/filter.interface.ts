export interface PostgresError extends Error {
  code: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  schema?: string;
  dataType?: string;
  severity?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  routine?: string;
  cause?: unknown;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
}
