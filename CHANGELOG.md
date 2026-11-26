# Changelog: Nikhil & Anithamol invitation upgrade

## Correctness
- RSVP: all fields read by explicit selectors (#guestName, #guestCount, #wishes, radio/checkbox groups); no `form.name` style access.
- RSVP: success is shown only when the Apps Script replies `{"ok":true}`. Separate messages for no backend, timeout (20s), network failure, and backend rejection.
- RSVP: double-submit guard, disabled "Sending…" button, aria-busy, focus moves to the first invalid field, honeypot kept, "No" replies skip guest/event validation.
- Apps Script endpoint preserved unchanged.
- Calendar: UTC times derived from the IST start times (11 Jan 17:30, 12 Jan 18:00, 14 Jan 10:30). End times are unconfirmed, so a provisional 2-hour duration (`PROVISIONAL_DURATION_MIN`) is used and the event description says so. Directions link added to each entry. Text escaping fixed.
- Countdown targets 14 Jan 2027 10:30 IST; tested.
- All three Google share links verified present, `target="_blank"`, `rel="noopener noreferrer"`.

## Hero and opening
- Hero text sits in the artwork's open middle band (cross above, Bible below), sized by `min(19vw, 11.4svh)`. Desktop shows the whole artwork with soft blurred sides.
- Letter-by-letter name reveal; the hero begins rising while the doors dissolve, so there is no blank or black frame. Opening has a poster frame and a warm background (no black).
- Opening video watchdogs: error, stall (6s) and overrun all fall through to the hero. Main content is `inert` until the opening ends. Skip and Replay work.
- Hero fades into the next section; parallax is transform-only and small.

## Layout
- Page frames and forced full-height sections removed; natural spacing; paper sections melt into ivory at their edges.
- Three event chapters with large date numerals: arched engagement video, Chanthamcharthal with restrained lamp-glow and slow zoom, 9:16 wedding video shown whole.
- Venue cards replaced with open columns; families section is now an editorial two-column layout.

## Performance and accessibility
- WebP versions of the three images (about 55–85 KB each, down from about 1.9 MB); PNG originals kept in assets/ as fallback.
- Videos: audio stripped and faststart applied (no re-encode), posters for all three, `preload="none"` for below-the-fold videos, pause offscreen and when the tab is hidden, tap to play if autoplay is blocked.
- Reduced motion: no GSAP animation, no CSS animation.

## Still needs real-device or backend verification
- Opening video playback and the dissolve on a real iPhone (Safari) and Android (Chrome); my test browser could not decode the MP4s.
- Autoplay behaviour in iOS Low Power Mode (posters show instead of video).
- RSVP end to end against your live Apps Script: confirm the sheet row appears, and that a browser can read the script's reply (if the row is saved but the form reports "could not confirm", that is a CORS-reply issue to check).
- Music starts after tapping "Open Invitation" on both platforms.
- WhatsApp preview: re-share after deploy (WhatsApp caches previews).
- Fonts and GSAP load from CDNs: check first paint on slow mobile data.
- Confirm end times with the families if you want exact calendar durations.

## Photos added
- Groom and bride portraits (arched frames) in "Two Hearts, One Promise".
- "A Few of Our Favourite Moments": four-photo staggered gallery with a keyboard/swipe lightbox. The lantern photo was a gallery screenshot; its app menu bars were cropped off.
- Optimised WebP copies in assets/ (portraits about 80-110 KB, gallery thumbnails about 35-95 KB, full views about 100-310 KB). Originals are kept in assets/photos/.

## Blush & Lotus theme
- New opening, engagement, Chanthamcharthal and wedding videos: re-encoded, audio stripped, about 28 MB down to about 10 MB.
- New hero plate (`hero-plate.webp/jpg`) built from the opening video, plus new posters and og-image.
- Removed unused old art: `hero-bible.*`, `chanthamcharthal.webp/png`, `common-bg.*`.
- Per-chapter moods (engagement black/gold, Chanthamcharthal cream/magenta, wedding black/crimson) with rounded, stacked sheets; Save the Date and Venues slide over the section above.
- Final section: the couple-on-swing strip was added, then removed again; the section now ends with a "Developed by Sahil" credit linking to https://sahilmuhd.com/.
- Hero names now wait 0.85s after the opening dissolve starts.
- Polish: verse glows now fade out inside the section (no clipped edge); 1% overscan on event videos removes the 1px dark line at the frame edge; on desktop the opening's blurred poster is now visible behind the contained video; family place names use rose instead of teal for AA contrast on blush.

### Still needs real-device verification
- Opening video playback and dissolve on a real iPhone (Safari) and Android (Chrome).
- Autoplay of the three event videos.
- WhatsApp preview: re-share after deploy (WhatsApp caches previews).
- Confirm the venue names that appear inside the videos against the page's map links: St. Mary's Knanaya Syro-Malabar Church, Cherukara Vallichira (engagement); St. Augustine's Knanaya Catholic Church, Karimkunnam (Chanthamcharthal and wedding).
