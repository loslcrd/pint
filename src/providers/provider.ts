import { ProviderResponse } from "./provider-misc";

export interface Provider {
  getProviderName(): string;
  getLinks(torrentHash: string): Promise<ProviderResponse>;
}
