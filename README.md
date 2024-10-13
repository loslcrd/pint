# PINT 🍺
*PINT Is Not Torrenting*

PINT will provide you Direct Download links for the torrent file you are about to download, using file providers like Real-Debrid.

## Features
- **Fetch download links**: Extract torrent hashes from the current web page and retrieve download links using supported providers.
- **Multi-provider Support**: Currently supports Real-Debrid, with planned support for other providers like AllDebrid.
- **(Coming soon) Download and Stream**: Provides options to either download or stream videos directly from your browser.
- **(Coming soon) A better graphical interface.**

## Table of Contents
- [Installation](#installation)
- [Build](#build)
- [Usage](#usage)
- [License](#license)
- [Known bugs](#known-bugs)

## Installation

0. Make sure you have [Node.js](https://nodejs.org/en/download/package-manager) installed.
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/loslcrd/pint.git
   cd pint
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
## Build

   ```bash
   # this will build a development version
   npm run build-dev
   # this will build a production version
   npm run build-prod
   ```
The build process uses **Webpack** to bundle the files into a `.dist/` directory, which will be used by the browser extension.

## Usage

### Load release version of PINT 🍺 in your browser
Just extract the .zip [latest release](https://github.com/loslcrd/pint/releases/latest) and follow the instructions below.

You will need to reload the extension every time you close Firefox if you are not using a Developer or Nightly build of Firefox. 

### Load builded PINT 🍺 in your browser
1. After building the project, open your browser (e.g., Chrome or Firefox).
2. Go to the extensions page:
   - **For Chrome**: Open `chrome://extensions/` and enable `Developer mode`.
   - **For Firefox**: Open `about:debugging`, then click on `This Firefox`.
3. Load the extension:
   - **For Chrome**: Click on `Load unpacked` and select the `dist` folder where you compiled the extension.
   - **For Firefox**: Click on `Load Temporary Add-on...` and select the `manifest.json` in the `dist`folder.

### Configure the extension and Download files
You will first need to get your API tokens for the providers you want to use.

For example, you can find your Real-Debrid API token [here](https://real-debrid.com/apitoken).

Then click on the PINT icon, click on `Configure` and add your token into the provider field you want to use.

When you are on a torrent file description page in your browser, click on PINT icon and click on `Fetch file(s)`. This will query your providers for the files and display the download links into the PINT popup.

## Known bugs
- Sometimes the extension does not select all the files linked to a torrent hash.
- ...

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
