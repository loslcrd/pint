export class ProviderError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class CannotAddMagnetError extends ProviderError {
  constructor(message?: string) {
    super(`Cannot add magnet${message == undefined ? "." : ": " + message}`);
  }
}

export class ApiKeyNotFoundError extends ProviderError {
  constructor(message?: string) {
    super(`API Key not found${message == undefined ? "." : ": " + message}`);
  }
}

export class TorrentNotAvailableError extends ProviderError {
  constructor(message?: string) {
    super(
      `This torrent is not available${message == undefined ? "." : ": " + message}`,
    );
  }
}
export class HashNotFoundError extends ProviderError {
  constructor(message?: string) {
    super(
      `No hash found in website${message == undefined ? "." : ": " + message}`,
    );
  }
}
export class DownloadLinkError extends ProviderError {
  constructor(message?: string) {
    super(
      `Cannot get download link${message == undefined ? "." : ": " + message}`,
    );
  }
}
