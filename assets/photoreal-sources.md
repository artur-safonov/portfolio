# Photographic concept assets — 19 October 2026



These are concept visuals, not photographs of a finished product or proof of a working VR integration. VR assets were made with the built-in ImageGen tool. WebP exports preserve their composition and transparency. Original PNGs are retained in the local working directory and the tool's generated-images directory.



- `vr-headset-photo.webp`: exterior product view, 1536 × 1024.

- `vr-headset-inside.webp`: interior view of the same concept, 1536 × 1024.

- `vr-room-photo.webp`: first-person room and controller view, 1086 × 1448.

- `rc-frames/000.webp` through `047.webp`: 48 Blender Cycles renders of the measured v0.8 enclosure CAD. The display graphic and material finishes are illustrative. They are not photographs. The frontend loads these on approach to the section, with three concurrent requests and a nearest-loaded-frame fallback.



The VR transition blends two photographic viewpoints, then moves into the room. It is not a continuous rendered 360-degree headset rotation.



## ImageGen prompts



### Exterior — transparent background



Create a premium photorealistic studio product render of a modern white VR headset, cut out on transparent background. Single object, no text, no logos, no ground plane. Entire headset visible including rear fabric head strap loop and top strap, rounded white polymer front face with three small black vertical camera capsules, graphite face gasket, sophisticated realistic industrial design. Front three-quarter view from slightly above, facing viewer and slightly left. Large hero composition centered with modest breathing room, 3:2 landscape canvas. Exquisite softbox lighting, physically correct reflections, subtle microtexture on matte plastic, woven grey fabric strap, optical glass lenses in camera openings, gentle dark contact shadows inside assembly. Looks like a high-end consumer electronics launch photograph, NOT drawing NOT icon NOT low polygon NOT videogame illustration. The full product must remain within the frame. Actual transparent background.



### Interior — exterior image as reference, transparent background



Show this EXACT SAME white VR headset from the reverse INSIDE viewing direction: the two large optical pancake viewing lenses directly face the viewer, nearly straight on with slight elevated view, clearly visible within a black soft fabric facial gasket and thin white shell rim. Same product design, same materials, same soft studio photographic lighting quality. Entire product centered on TRANSPARENT background with comfortable margin, 3:2 landscape canvas. Woven gray overhead strap arches naturally behind and above it. Photoreal consumer electronics product photograph, sharp optical reflections of tiny blue highlights inside the two dark glass lenses. No text, no logos, no background, no floor, no fake checkerboard. The main two viewing lenses should be large and about the middle of the canvas, easy to zoom into. Keep full object in frame.



### Room — opaque background



Photorealistic architectural interior photograph for an immersive VR smart home concept, portrait 3:4 composition. A refined quiet modern living room, pale warm grey plaster wall, oak sideboard at bottom left, a little linen sofa lower left edge, elegant minimal apartment in soft morning daylight from the left. Main hero is a realistic white wall mounted split AIR CONDITIONER high on the wall, centered at 65 percent of image width and 30 percent of image height, its entire body fully visible with open horizontal vent and no writing, no logos, no temperature digits. In lower right foreground a person's right hand holding a realistic white compact VR motion controller, its head aimed UP TOWARDS that air conditioner. Controller has black thumbstick, two buttons, subtle seams, wrist strap, convincing proportions and real materials. Hand and controller at lower right 78percent x, 78percent y. First-person perspective, viewer wearing VR, but no helmet visible, no overlays, NO ray or graphics, no floating UI, no text. Architectural magazine photographic quality, natural restrained colors, crisp realistic air conditioner, optical depth, soft global illumination, realistic skin, real product plastics. No 3D illustration, no line drawing, no neon outlines, no vector art. Plenty of clean wall center left for overlay controls. No visible people other than the single hand.





## Quest interface reference and second controller render



- (Removed) `meta-quest-navigator.webp` is Meta's official Navigator screenshot from https://communityforums.atmeta.com/announcements-11/navigator-now-rolling-out-to-all-quest-users-176159 (image https://uploads-us-west-2.insided.com/atmeta-en/attachment/8a8cb7e8e8388849.png). It is shown as an attributed real interface reference in chapter 2. The source image is unchanged apart from WebP encoding; CSS cover-crops it responsively.

- The air-conditioner panel is a custom concept, not a native Meta home-control feature. Neutral panels, pill controls and the blue interaction accent follow the Meta Horizon OS visual language. Additional reference: https://github.com/meta-quest/2d-web-v0-template .

- `rc-frames-v2/` supersedes the first sequence. The camera is fixed. Projected order is display (bottom), battery/BMS, printed lid, magnetic mounting assembly (top). The power assembly uses a fixed presentation orientation; no rotation crosses the display during separation. Nickel magnets are shown lifted out of their lid pockets to explain the magnetic attachment; printed dock rails and steel washers remain distinct materials.

- The printed finish is graphite with procedural layer lines; this is a visual material study, not a claim about the final print color. Highlight boxes follow per-frame projected CAD bounds in `rc-frames-v2/bounds.json`.



## 3D headset transition

`vr-hmd-frames/000.webp` to `059.webp` are Blender Cycles renders (1400 x 1000) of a procedural concept headset made for this page (`.work/photoreal/render_headset.py`); it is not a model of a specific commercial device. Frames 0-27 rotate the headset from a front three-quarter view until the lenses face the viewer; frames 28-59 move the camera into the left lens. Lens windows use a holdout shader, so they are transparent and reveal the room photo layer below. A dark emissive dome fills every other pixel. The Navigator screenshot chapter was removed, and the earlier ImageGen headset photos are no longer used.


## Quest 3 model (replaces the procedural headset)

This work is based on "Oculus Quest 3" (https://sketchfab.com/3d-models/oculus-quest-3-f4b794fc21784cd2a78392af05e0b597) by AVILOV (https://sketchfab.com/avilov), licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/).

Changes: the Touch Plus controllers are hidden; materials were adjusted for Cycles (roughness, clear coat); both lens surfaces use a holdout shader so the room photo shows through them; the model was rendered as 60 frames (`vr-hmd-frames/`) in which the headset turns and the camera moves into the left lens. The page shows the credit in the VR section caption. Render script: `.work/photoreal/render_quest.py`.
