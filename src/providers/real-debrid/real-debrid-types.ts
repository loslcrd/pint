export interface AddMagnetResponse {
  id: 'string';
  uri: 'string'; // URL of the created resource
}

export interface TorrentAvailabilityResponse {
  [hash: string]: {
    [host: string]: Array<{
      [fileId: number]: {
        filename: string;
        filesize: number;
      };
    }>;
  };
}

export interface TorrentInfo {
  id: string;
  filename: string;
  original_filename: string; // Original name of the torrent
  hash: string; // SHA1 Hash of the torrent
  bytes: number; // Size of selected files only
  original_bytes: number; // Total size of the torrent
  host: string; // Host main domain
  split: number; // Split size of links
  progress: number; // 0 to 100
  status:
    | 'magnet_error'
    | 'magnet_conversion'
    | 'waiting_files_selection'
    | 'queued'
    | 'downloading'
    | 'downloaded'
    | 'error'
    | 'virus'
    | 'compressing'
    | 'uploading'
    | 'dead'; // Torrent status
  added: string; // jsonDate
  files: TorrentFile[]; // Files inside the torrent
  links: string[]; // Host URLs
  ended?: string; // Present when finished (jsonDate)
  speed?: number; // Present during downloading, compressing, uploading
  seeders?: number; // Present during downloading, magnet_conversion
}

export interface TorrentFile {
  id: number;
  path: string; // Path to the file inside the torrent
  bytes: number;
  selected: number; // 0 or 1
}

export interface UnRestrictLinkResponse {
  id: string;
  filename: string;
  mimeType: string; // Mime Type of the file, guessed by the file extension
  filesize: number; // Filesize in bytes, 0 if unknown
  link: string; // Original link
  host: string; // Host main domain
  chunks: number; // Max Chunks allowed
  crc: number; // Disable / enable CRC check
  download: string; // Generated link
  streamable: number; // Is the file streamable on the website
}
