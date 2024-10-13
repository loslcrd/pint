import { RealDebridProvider } from "./real-debrid/real-debrid-provider";
import { ProviderService } from "./provider-service";
import { Provider } from "./provider";
import { ApiKeys } from "./provider-misc";

export class ProviderFactory {
  readonly providerNames: string[] = ["realDebrid"];

  constructor() {}

  createProviders(
    providerService: ProviderService,
    apiKeys: ApiKeys,
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
