export abstract class ProviderService {
  abstract getDownloadLinks(
    torrentHash: string
  ): Promise<{[filename: string]: string}>;

  protected async fetchWithCors(
    url: string,
    token: string,
    init: RequestInit
  ): Promise<Response> {
    const corsUrl = this.getCorsUrl(url, token);

    const response = await fetch(corsUrl, init);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response;
  }

  private getCorsUrl(url: string, token: string): string {
    console.log('Unformatted URL: ' + url);
    const formattedUrl =
      'https://corsproxy.io/?' +
      encodeURIComponent(url + `?auth_token=${token}`);
    console.log('Formatted URL: ' + formattedUrl);
    return formattedUrl;
  }
}
