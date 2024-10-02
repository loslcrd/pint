interface Provider {
  getProviderName(): string;
  getDownloadLinks(
    torrentHash: string,
  ): Promise<{ [filename: string]: string }>;
}
