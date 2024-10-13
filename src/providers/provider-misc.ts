export interface ProviderResponse {
  [filename: string]: { downloadLink: string };
}

export interface ProviderResults {
  [providerName: string]: Error | ProviderResponse;
}

export interface ApiKeys {
  realDebrid: string;
  // allDebrid: string;
}
