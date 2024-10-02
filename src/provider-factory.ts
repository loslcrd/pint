import { RealDebridProvider } from "./real-debrid-provider";
import { ProviderService } from "./provider-service";

export class ProviderFactory {
  readonly providerNames: string[] = ["realDebrid"];

  constructor() {}

  createProviders(
    providerService: ProviderService,
    apiKeys: { [provider: string]: string },
  ): Provider[] {
    const providers: Provider[] = [];
    for (const provider of Object.keys(apiKeys)) {
      if (
        provider != "" &&
        this.providerNames.some((p: string) => p === provider)
      ) {
        switch (provider) {
          case "realDebrid":
            providers.push(
              new RealDebridProvider(providerService, apiKeys[provider]),
            );
        }
      }
    }

    return providers;
  }
}
