export class CorsProxy {
  private readonly corsProxyPrefix: string;
  constructor(corsProxyPrefix: string) {
    this.corsProxyPrefix = corsProxyPrefix;
  }

  public getCorsUrl(url: string) {
    return this.corsProxyPrefix + url;
  }
}
