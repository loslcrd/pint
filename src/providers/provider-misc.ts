export interface ProviderResponse {
  [filename: string]: { downloadLink: string };
}

export interface ProviderResults {
  [providerName: string]: Error | ProviderResponse;
}
