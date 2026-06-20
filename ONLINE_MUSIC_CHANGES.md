# Online Music Integration & Contribution Overview

This document describes the new features introduced to support online music streaming in the Nora Player, provides a summary of the project's contribution guidelines, and lists upcoming roadmap items for future development.

---

## 🎵 Features Added in this Version

The Nora Player has been upgraded from a purely offline music player to support **online streaming and recommendations**. Below are the key additions:

1. **Online Music Streaming Support**:
   - Integrated with YouTube Music using `youtubei.js` and `yt-dlp` to search, resolve, stream, and play online tracks dynamically.
   - Bypassed CORS limitations for google video streams in Electron main process to enable standard Web Audio API playback.

2. **Recommendations via Shuffle**:
   - Clicking the shuffle button now triggers recommendations. Similar tracks are dynamically fetched using the YouTube Music "Up Next" API based on the currently playing track.

3. **Home Screen Integration**:
   - The home screen now features an **Online Music History** section displaying recently played online songs, allowing users to quickly jump back into their favorite online tracks.

4. **Dedicated Online Songs Screen**:
   - Added a new separate route and UI screen for searching and playing online songs, making it easy to search for any track online and queue/play it alongside offline libraries.

---

## 🤝 Contribution Guidelines for Nora

According to the project's `README.md` and `.github/contributing.md`, contributions must adhere to the following rules:

1. **Cross-Platform Compatibility**:
   - Any accepted changes must maintain compatibility across both **Windows** and **Linux**.
2. **Feature Scoping**:
   - Feature changes should be kept as small and focused as possible—preferably one feature or enhancement per release/version.
3. **Workflow**:
   - For changes larger than a few lines, contributors should:
     1. Fork the official repository.
     2. Develop changes in their fork.
     3. Ensure the project's code style and lint formatting (`oxfmt` and `oxlint`) are followed and run successfully.
     4. Create a Pull Request (PR) from their fork.
4. **Transparency**:
   - Create GitHub issues for major architectural changes or enhancements to discuss them with the community first before building.

---

## 🚀 Upcoming Features & Roadmap

The following features are planned for future releases to fully merge the online and offline listening experiences:

1. **Google Authentication Integration**:
   - Implement authentication with Google so that online playlists and library configurations can be merged seamlessly with your previous YouTube Music accounts without manual import issues.
2. **Online Playlists**:
   - Currently, Nora only supports creating playlists for local offline songs. In future updates, users will be able to create, edit, and organize custom playlists consisting entirely of online songs.
3. **Extended Metadata Support**:
   - In subsequent iterations, details like artist profiles, detailed album information, specific track title metadata, and advanced playlist details will be fully implemented and rendered. The current focus is heavily centered on robust streaming and audio playback.
