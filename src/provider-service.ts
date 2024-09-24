import { CorsProxyService } from "./cors-proxy-service";

export abstract class ProviderService {
  private readonly corsProxyService = new CorsProxyService(
    "https://corsproxy.io/?",
  );
  abstract getDownloadLinks(
    torrentHash: string,
  ): Promise<{ [filename: string]: string }>;

  protected async fetchWithCors(
    url: string,
    token: string,
    init: RequestInit,
  ): Promise<Response> {
    const formattedUrl = this.corsProxyService.getCorsUrl(
      encodeURIComponent(url + `?auth_token=${token}`),
    );

    const response = await fetch(formattedUrl, init);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response;
  }
}
