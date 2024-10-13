import { CorsProxy } from "../cors-proxy";
import { ProviderFactory } from "./provider-factory";
import { ProviderError } from "./provider-errors";
import { Provider } from "./provider";
import { ProviderResponse } from "./provider-misc";

export class ProviderService {
  private readonly corsProxy: CorsProxy;
  private readonly providerFactory: ProviderFactory;
  private providers: Provider[];

  constructor() {
    this.corsProxy = new CorsProxy("https://corsproxy.io/?");
    this.providerFactory = new ProviderFactory();
    this.providers = [];
  }

  public initialize(apiKeys: { [provider: string]: string }): void {
    this.providers = this.providerFactory.createProviders(this, apiKeys);
    console.log(this.providers);
  }

  public async getLinks(torrentHash: string) {
    const links: {
      [providerName: string]: Error | ProviderResponse;
    } = {};
    for (const provider of this.providers) {
      try {
        links[provider.getProviderName()] =
          await provider.getLinks(torrentHash);
      } catch (error) {
        links[provider.getProviderName()] = error as ProviderError;
      }
    }

    return links;
  }

  public async fetchWithCors(
    url: string,
    token: string,
    init: RequestInit,
  ): Promise<Response> {
    const formattedUrl = this.corsProxy.getCorsUrl(
      encodeURIComponent(url + `?auth_token=${token}`),
    );

    return await fetch(formattedUrl, init);
  }
}
