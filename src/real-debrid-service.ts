import { ProviderService } from "./provider-service";
import {
  AddMagnetResponse,
  TorrentAvailabilityResponse,
  TorrentInfo,
  UnRestrictLinkResponse,
} from "./types/real-debrid-types";

export class RealDebridService extends ProviderService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async getDownloadLinks(
    torrentHash: string,
  ): Promise<{ [filename: string]: string }> {
    const torrentId = await this.addMagnet(torrentHash);
    const files = await this.checkTorrentAvailability(torrentHash);
    const fileIds = this.getFileIds(files);

    await this.selectFiles(torrentId, fileIds);

    const rdLinks = await this.getRdLinks(torrentId);
    const downloadLinks: { [filename: string]: string } = {};

    for (const rdLink of rdLinks) {
      const [filename, downloadLink] =
        await this.getUnrestrictedDownloadLink(rdLink);
      downloadLinks[filename] = downloadLink;
    }

    return downloadLinks;
  }

  private async addMagnet(torrentHash: string): Promise<string> {
    const url = "https://api.real-debrid.com/rest/1.0/torrents/addMagnet";
    const magnetLink = this.getMagnetLink(torrentHash);

    const response = await this.fetchWithCors(url, this.apiKey, {
      method: "POST",
      body: new URLSearchParams({ magnet: magnetLink }),
    });

    if (!response.ok) {
      throw new Error(`Error adding magnet: ${response.statusText}`);
    }

    const data = (await response.json()) as AddMagnetResponse;
    return data.id;
  }

  private getMagnetLink(infoHash: string): string {
    return `magnet:?xt=urn:btih:${infoHash}`;
  }

  private async checkTorrentAvailability(
    infoHash: string,
  ): Promise<TorrentAvailabilityResponse> {
    const url = `https://api.real-debrid.com/rest/1.0/torrents/instantAvailability/${infoHash}`;
    const response = await this.fetchWithCors(url, this.apiKey, {
      method: "GET",
    });
    return (await response.json()) as TorrentAvailabilityResponse;
  }

  private async selectFiles(
    torrentId: string,
    fileIds: string[],
  ): Promise<void> {
    const url = `https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${torrentId}`;
    const response = await this.fetchWithCors(url, this.apiKey, {
      method: "POST",
      body: new URLSearchParams({ files: fileIds.join(",") }),
    });

    if (!response.ok) {
      throw new Error(`Error selecting files: ${response.statusText}`);
    }
  }

  private async getRdLinks(torrentId: string): Promise<string[]> {
    const url = `https://api.real-debrid.com/rest/1.0/torrents/info/${torrentId}`;
    const response = await this.fetchWithCors(url, this.apiKey, {
      method: "GET",
    });
    const data = (await response.json()) as TorrentInfo;
    return data.links;
  }

  private async getUnrestrictedDownloadLink(
    originalLink: string,
  ): Promise<[string, string]> {
    const url = "https://api.real-debrid.com/rest/1.0/unrestrict/link";
    const response = await this.fetchWithCors(url, this.apiKey, {
      method: "POST",
      body: new URLSearchParams({ link: originalLink }),
    });

    if (!response.ok) {
      throw new Error(`Error unrestricting link: ${response.statusText}`);
    }

    const data = (await response.json()) as UnRestrictLinkResponse;
    return [data.filename, data.download];
  }

  private getFileIds(files: TorrentAvailabilityResponse): string[] {
    const fileIds: string[] = [];

    for (const hash in files) {
      if (files[hash]?.rd) {
        files[hash].rd.forEach((variant) => {
          for (const fileId in variant) {
            fileIds.push(fileId);
          }
        });
      }
    }

    return fileIds;
  }
}
