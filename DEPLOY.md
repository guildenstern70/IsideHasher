# Deployment and Release Guide

This document describes how to package **IsideHasher** for **macOS**, **Windows**, and **Linux**, and how to publish the resulting binaries as **GitHub Releases**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparing a Release](#preparing-a-release)
3. [Building Platform Packages](#building-platform-packages)
   - [1. macOS](#1-macos)
   - [2. Windows](#2-windows)
   - [3. Linux](#3-linux)
4. [Cross-Platform Building Options](#cross-platform-building-options)
5. [Configuring `package.json` for Targets](#configuring-packagejson-for-targets)
6. [Publishing Releases to GitHub](#publishing-releases-to-github)
   - [Method 1: GitHub Actions CI/CD (Recommended)](#method-1-github-actions-cicd-recommended)
   - [Method 2: GitHub CLI (`gh`)](#method-2-github-cli-gh)
   - [Method 3: GitHub Web Interface](#method-3-github-web-interface)
   - [Method 4: Electron Builder Auto-Publish](#method-4-electron-builder-auto-publish)
7. [Release Checklist](#release-checklist)

---

## Prerequisites

Before packaging, ensure the required environment is set up:

- **Node.js**: Version 22 or later (pinned in [`.nvmrc`](.nvmrc)).
- **Yarn**: Yarn 1.x (`yarn.lock` is committed to the repository).
- All dependencies installed:
  ```bash
  yarn install
  ```

Packaged installers and executables are output to the `dist/` directory.

---

## Preparing a Release

1. Update the version number in [`package.json`](package.json):
   ```json
   "version": "0.3.0"
   ```
2. Commit your changes:
   ```bash
   git add package.json
   git commit -m "Bump version to 0.3.0"
   ```
3. Create a Git tag corresponding to the release version:
   ```bash
   git tag v0.3.0
   ```

---

## Building Platform Packages

IsideHasher uses [electron-builder](https://www.electron.build/) (configured in `package.json` under `"build"`).

### 1. macOS

macOS packages must be built on a machine running macOS (due to Apple toolchain requirements).

#### Formats Produced
- `.dmg` (Apple Disk Image installer)
- `.zip` (Packaged `.app` in a ZIP archive)

#### Build Commands

- **Build for the current Mac architecture:**
  ```bash
  yarn dist --mac
  ```

- **Build for specific architectures:**
  ```bash
  # Apple Silicon (M1/M2/M3/M4)
  yarn electron-builder --mac --arm64

  # Intel (x86_64)
  yarn electron-builder --mac --x64

  # Universal binary (runs natively on both Apple Silicon and Intel)
  yarn electron-builder --mac --universal
  ```

#### Artifacts in `dist/`
- `Iside Hasher-<version>.dmg`
- `Iside Hasher-<version>-mac.zip`
- (or architecture-suffixed equivalents, e.g., `Iside Hasher-<version>-arm64.dmg`)

#### Code Signing & Notarization Notes
- **Unsigned builds (default locally):** macOS Gatekeeper will flag unsigned apps on first launch. Users can bypass this by right-clicking the app and selecting **Open**, or by clearing quarantine flags:
  ```bash
  xattr -cr /Applications/Iside\ Hasher.app
  ```
- **Signed & Notarized builds:** Provide Apple Developer credentials via environment variables:
  ```bash
  export CSC_LINK="path/to/certificate.p12"
  export CSC_KEY_PASSWORD="password"
  export APPLE_ID="developer@example.com"
  export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
  export APPLE_TEAM_ID="TEAMID1234"
  yarn dist --mac
  ```

---

### 2. Windows

Windows packages can be built on Windows natively or cross-compiled on macOS/Linux using Wine/Mono (which `electron-builder` handles automatically).

#### Formats Produced
- `.exe` (NSIS Installer)
- Portable executable or `.zip` (optional)

#### Build Commands

- **Build 64-bit Windows installer:**
  ```bash
  yarn dist --win
  ```

- **Build for specific architectures:**
  ```bash
  # 64-bit (x64, standard)
  yarn electron-builder --win --x64

  # 32-bit (ia32)
  yarn electron-builder --win --ia32

  # ARM64
  yarn electron-builder --win --arm64
  ```

#### Artifacts in `dist/`
- `Iside Hasher Setup <version>.exe` (or `IsideHasher.Setup.<version>.exe`)

#### Code Signing Notes
- Unsigned binaries trigger Windows SmartScreen warnings ("Windows protected your PC").
- To sign the Windows executable, configure a code signing certificate via `CSC_LINK` and `CSC_KEY_PASSWORD` or standard hardware token tools.

---

### 3. Linux

Linux packages can be packaged into several distribution formats.

#### Formats Produced
- **Snap** (`.snap`)
- **AppImage** (`.AppImage`)
- **Debian package** (`.deb`)
- **RPM** (`.rpm`, optional)

#### Build Commands

- **Build default Linux target (AppImage):**
  ```bash
  yarn dist --linux
  ```

- **Build specific package types:**
  ```bash
  # Build Snap package
  yarn electron-builder --linux snap

  # Build AppImage package
  yarn electron-builder --linux AppImage

  # Build Debian (.deb) package
  yarn electron-builder --linux deb

  # Build all three formats together
  yarn electron-builder --linux snap AppImage deb
  ```

- **Build for specific architectures:**
  ```bash
  yarn electron-builder --linux --x64
  yarn electron-builder --linux --arm64
  ```

#### Artifacts in `dist/`
- `iside-hasher_<version>_amd64.snap`
- `iside-hasher-<version>.AppImage`
- `iside-hasher_<version>_amd64.deb`

#### Installation & Runtime Notes
- **Snap:**
  ```bash
  sudo snap install --dangerous ./iside-hasher_<version>_amd64.snap
  ```
  *(Note: Building Snap packages locally requires `snapcraft` installed on the host system or via Docker).*
- **AppImage:**
  Make executable and run:
  ```bash
  chmod +x ./iside-hasher-<version>.AppImage
  ./iside-hasher-<version>.AppImage
  ```
  *(On Ubuntu 22.04+, `libfuse2` is required: `sudo apt install libfuse2`).*
- **Debian (`.deb`):**
  ```bash
  sudo apt install ./iside-hasher_<version>_amd64.deb
  # or
  sudo dpkg -i ./iside-hasher_<version>_amd64.deb
  ```

---

## Cross-Platform Building Options

| Target Platform | From macOS | From Windows | From Linux |
|---|---|---|---|
| **macOS** | Native | Not supported by Apple | Not supported by Apple |
| **Windows** | Supported via Wine / electron-builder | Native | Supported via Wine / electron-builder |
| **Linux** | Supported via Docker or electron-builder | Supported via WSL / Docker | Native |

### Building Linux Packages from macOS using Docker

If you are on macOS and need native Linux targets (including Snap or complex toolchains), use the official electron-builder Docker container:

```bash
docker run --rm -ti \
  --env-file <(env | grep -E 'DEBUG|NODE_|ELECTRON_|YARN_') \
  -v ${PWD}:/project \
  -v ${PWD}/##dist:/project/dist \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "yarn install && yarn electron-builder --linux snap AppImage deb"
```

---

## Configuring `package.json` for Targets

You can customize targets and icons inside the `"build"` section of [`package.json`](package.json):

```json
  "build": {
    "appId": "net.littlelite.iside.electron",
    "productName": "Iside Hasher",
    "mac": {
      "category": "public.app-category.utilities",
      "target": ["dmg", "zip"]
    },
    "win": {
      "icon": "icons/isidehasher.ico",
      "target": ["nsis"]
    },
    "linux": {
      "icon": "icons/isidehasher.png",
      "category": "Utility",
      "target": ["AppImage", "snap", "deb"]
    }
  }
```

You can also add shortcut scripts under `"scripts"`:

```json
  "scripts": {
    "start": "electron .",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "dist:mac": "electron-builder --mac",
    "dist:win": "electron-builder --win",
    "dist:linux": "electron-builder --linux",
    "dist:all": "electron-builder -mwl"
  }
```

---

## Publishing Releases to GitHub

### Method 1: GitHub Actions CI/CD (Recommended)

The most reliable way to produce native images for all 3 platforms is to use a GitHub Actions workflow with a build matrix. This builds each OS on native runners and automatically publishes the GitHub Release.

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  build:
    name: Build on ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Install Linux dependencies (Snapcraft / FUSE)
        if: matrix.os == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libfuse2 snapcraft

      - name: Build macOS package
        if: matrix.os == 'macos-latest'
        run: yarn electron-builder --mac

      - name: Build Windows package
        if: matrix.os == 'windows-latest'
        run: yarn electron-builder --win

      - name: Build Linux packages
        if: matrix.os == 'ubuntu-latest'
        run: yarn electron-builder --linux AppImage deb

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.os }}
          path: |
            dist/*.dmg
            dist/*.zip
            dist/*.exe
            dist/*.AppImage
            dist/*.deb
            dist/*.snap

  publish:
    name: Publish GitHub Release
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts
          merge-multiple: true

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            artifacts/*.dmg
            artifacts/*.zip
            artifacts/*.exe
            artifacts/*.AppImage
            artifacts/*.deb
            artifacts/*.snap
          generate_release_notes: true
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Triggering the workflow:**
```bash
git tag v0.3.0
git push origin v0.3.0
```

---

### Method 2: GitHub CLI (`gh`)

If you build binaries locally, you can create and upload releases directly using GitHub CLI:

1. **Install and authenticate GitHub CLI:**
   ```bash
   gh auth login
   ```

2. **Build your artifacts:**
   ```bash
   yarn dist --mac
   yarn dist --win
   yarn electron-builder --linux AppImage deb
   ```

3. **Create the release and upload the binaries:**
   ```bash
   gh release create v0.3.0 \
     dist/*.dmg \
     dist/*.exe \
     dist/*.AppImage \
     dist/*.deb \
     --title "v0.3.0" \
     --notes "Release 0.3.0 notes"
   ```

To publish as a draft release first (allowing review before publishing):
```bash
gh release create v0.3.0 dist/* --draft --title "v0.3.0" --notes "Draft release"
```

---

### Method 3: GitHub Web Interface

1. Build the packages locally:
   - macOS: `dist/Iside Hasher-<version>.dmg`
   - Windows: `dist/Iside Hasher Setup <version>.exe`
   - Linux: `dist/iside-hasher-<version>.AppImage`, `dist/iside-hasher_<version>_amd64.deb`
2. Push your Git tag:
   ```bash
   git push origin v0.3.0
   ```
3. Open your repository on GitHub:
   `https://github.com/guildenstern70/IsideHasher/releases`
4. Click **Draft a new release**.
5. Select the tag `v0.3.0` (or choose target branch).
6. Fill in the **Release title** (e.g. `v0.3.0`) and description / changelog.
7. Drag and drop the files from your `dist/` directory into the **Attach binaries** area.
8. Click **Publish release** (or **Save draft**).

---

### Method 4: Electron Builder Auto-Publish

`electron-builder` has native integration with GitHub Releases via a Personal Access Token (`GH_TOKEN`):

1. Generate a GitHub Personal Access Token (classic: `repo` scope, or fine-grained: `Contents: Read and write`).
2. Export the token:
   ```bash
   export GH_TOKEN="your_personal_access_token"
   ```
3. Run `electron-builder` with the `--publish always` flag:
   ```bash
   yarn electron-builder --publish always
   ```
   `electron-builder` will create a draft release on GitHub (matching the version in `package.json`) and upload all built artifacts directly. Once uploaded, you can visit GitHub to finalize and publish the release.

---

## Release Checklist

- [ ] Version updated in [`package.json`](package.json).
- [ ] Dependencies up to date and clean (`yarn install`).
- [ ] App launches and functions as expected (`yarn start`).
- [ ] Git commit and tag created:
  ```bash
  git commit -am "Prepare release vX.Y.Z"
  git tag vX.Y.Z
  git push origin main --tags
  ```
- [ ] Artifacts built:
  - [ ] macOS: `.dmg`
  - [ ] Windows: `.exe`
  - [ ] Linux: `.AppImage` / `.snap` / `.deb`
- [ ] Artifacts uploaded to GitHub Releases.
- [ ] Release notes verified and published.
