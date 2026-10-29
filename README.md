# Portfolio



Personal site of Artur Safonov: selected work, a scroll-driven Routine Controller study, and a contribution chart.



The controller study follows the measured v0.8 build: an integrated Guition touchscreen/ESP32, LiPo 505573 cell with HXYP-1S-30T8 BMS, a printed magnetic rear lid and wall dock. Shapes and layout are illustrative, based on the enclosure CAD and reference photos. The displayâ€™s IP5306 provides charging and boost conversion; no separate UPS is shown. Reduced motion and the site's pause control switch the study to a static view with chapter buttons.



Spatial Home is an explicitly labeled early exploration of VR home control. Scrolling drives 60 Blender Cycles frames of a Meta Quest 3 model ("Oculus Quest 3" by AVILOV, CC BY 4.0, https://sketchfab.com/3d-models/oculus-quest-3-f4b794fc21784cd2a78392af05e0b597): it turns its lenses towards the viewer, the camera moves into the left lens, and the room layer underneath shows through the transparent lens windows before the control panel appears. The panel follows Horizon OS visual conventions; it is not a native Meta feature. The temperature slider changes only the visual concept; no home services or devices are connected. Chapter buttons also work with motion paused.



Live: https://portfolio.artursafonov.me



The GitHub profile repository (`artur-safonov/artur-safonov`) is the single statistics collector. Its `Update GitHub stats` workflow publishes `data/stats.json`; the portfolio reads that exact snapshot for its chart and all four counters. Commits cover the account's accessible owned, collaborator, organization and contributed-to repositories, deduplicated by repository, using author-filtered default-branch histories. Private activity depends on the profile collector's token permissions.

The portfolio's `Sync profile statistics` workflow copies the public profile snapshot into `data/contributions.json` daily at 04:43 UTC (20 minutes after the profile's scheduled start) and on manual dispatch. It does not query GraphQL or need `STATS_TOKEN`. The browser tries the profile source first, then the published portfolio cache, then the bundled cache. Cache dates remain the original collection date; invalid or legacy owner-only caches are rejected. If every source fails, the page shows an unavailable state instead of fabricated counters. Run `node scripts/update-contributions.mjs` to sync locally and `node --test tests/update-contributions.test.mjs` to verify synchronization.



The hardware study uses 48 Blender Cycles renders of the measured enclosure CAD, with physical thickness, studio lights and material shading. The fixed camera keeps the display at the bottom, followed by the battery/BMS, printed lid and magnetic mounting assembly. The active part is labeled and outlined using projected CAD bounds. Frames load near the section and follow scroll progress. The original CSS solids are superseded. ImageGen prompts and asset provenance are recorded in `assets/photoreal-sources.md`.

