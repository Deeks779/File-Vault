export interface PublicFileInfo {
  id: string;
  username: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  upload_date: string; // The date will come in as an ISO string
}