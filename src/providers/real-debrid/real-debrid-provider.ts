import { Provider } from "../provider";
import { ProviderService } from "../provider-service";
import { ProviderResponse } from "../provider-misc";
import {
  AddMagnetResponse,
  TorrentAvailabilityResponse,
  TorrentInfo,
  UnRestrictLinkResponse,
} from "./real-debrid-types";
import {
  CannotAddMagnetError,
  DownloadLinkError,
  ProviderError,
  TorrentNotAvailableError,
} from "../provider-errors";

export class RealDebridProvider implements Provider {
  private readonly apiKey: string;
  private providerService: ProviderService;

  constructor(providerService: ProviderService, apiKey: string) {
    this.providerService = providerService;
    this.apiKey = apiKey;
  }
  getProviderName(): string {
    return "realDebrid";
  }

  async getLinks(torrentHash: string): Promise<ProviderResponse> {
    console.log(
      `getDownloadLinks: Starting to process torrent hash: ${torrentHash}`,
    );

    const files = await this.checkTorrentAvailability(torrentHash);
    console.log(files);
    if (Object.keys(files).length == 0) {
      throw new TorrentNotAvailableError();
    }

    const fileIds = this.getFileIds(files);
    console.log(`getDownloadLinks: Extracted file IDs:`, fileIds);

    const torrentId = await this.addMagnet(torrentHash);
    console.log(
      `getDownloadLinks: Magnet added, received torrentId: ${torrentId}`,
    );

    await this.selectFiles(torrentId, fileIds);
    console.log(`getDownloadLinks: Files selected for torrentId: ${torrentId}`);

    const rdLinks = await this.getRdLinks(torrentId);
    console.log(`getDownloadLinks: Real-Debrid links retrieved:`, rdLinks);

    const links: ProviderResponse = {};

    for (const rdLink of rdLinks) {
      console.log(`getDownloadLinks: Processing RD link: ${rdLink}`);
      const [filename, downloadLink] =
        await this.getUnrestrictedDownloadLink(rdLink);

      links[filename] = { downloadLink: downloadLink };
    }

    console.log(`getDownloadLinks: Final download links object:`, links);
    return links;
  }

  private async addMagnet(torrentHash: string): Promise<string> {
    const url = "https://api.real-debrid.com/rest/1.0/torrents/addMagnet";
    const magnetLink = this.getMagnetLink(torrentHash);

    const response = await this.providerService.fetchWithCors(
      url,
      this.apiKey,
      {
        method: "POST",
        body: new URLSearchParams({ magnet: magnetLink }),
      },
    );

    if (!response.ok) {
      throw new CannotAddMagnetError((await response.json()).error);
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
    const response = await this.providerService.fetchWithCors(
      url,
      this.apiKey,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new ProviderError(
        `Cannot check torrent availability: ${(await response.json()).error}`,
      );
    }
    return (await response.json()) as TorrentAvailabilityResponse;
  }

  private async selectFiles(
    torrentId: string,
    fileIds: string[],
  ): Promise<void> {
    const url = `https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${torrentId}`;
    const response = await this.providerService.fetchWithCors(
      url,
      this.apiKey,
      {
        method: "POST",
        body: new URLSearchParams({ files: fileIds.join(",") }),
      },
    );

    if (!response.ok) {
      throw new ProviderError(
        `Cannot select files: ${(await response.json()).error}`,
      );
    }
  }

  private async getRdLinks(torrentId: string): Promise<string[]> {
    const url = `https://api.real-debrid.com/rest/1.0/torrents/info/${torrentId}`;
    const response = await this.providerService.fetchWithCors(
      url,
      this.apiKey,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new DownloadLinkError((await response.json()).error);
    }
    const data = (await response.json()) as TorrentInfo;
    return data.links;
  }

  private async getUnrestrictedDownloadLink(
    originalLink: string,
  ): Promise<[string, string]> {
    const url = "https://api.real-debrid.com/rest/1.0/unrestrict/link";
    const response = await this.providerService.fetchWithCors(
      url,
      this.apiKey,
      {
        method: "POST",
        body: new URLSearchParams({ link: originalLink }),
      },
    );

    if (!response.ok) {
      throw new DownloadLinkError((await response.json()).error);
    }

    const data = (await response.json()) as UnRestrictLinkResponse;
    return [data.filename, data.download];
  }

  private getFileIds(files: TorrentAvailabilityResponse): string[] {
    /**
     * For now, this function returns all the file ids that can be downloaded instantly in one time.
     * This needs to be modified in the future for the user to be able to download only the files that he wants
     * in the torrent.
     */
    let fileIds: string[] = [];
    let maxFileCount = 0;

    for (const hash in files) {
      if (files[hash]?.rd) {
        files[hash].rd.forEach((variant) => {
          const currentFileIds: string[] = Object.keys(variant);
          const fileCount = currentFileIds.length;

          if (fileCount > maxFileCount) {
            maxFileCount = fileCount;
            fileIds = currentFileIds;
          }
        });
      }
    }

    return fileIds;
  }
}
