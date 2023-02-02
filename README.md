[![npm version](https://badge.fury.io/js/@justinribeiro%2Flite-youtube.svg)](https://badge.fury.io/js/@justinribeiro%2Flite-youtube) ![min+gzip](https://img.shields.io/badge/min%2Bgzip-2.2kb-blue) ![min+br](https://img.shields.io/badge/min%2Bbr-1.7kb-blue) [![](https://data.jsdelivr.com/v1/package/npm/@justinribeiro/lite-youtube/badge)](https://www.jsdelivr.com/package/npm/@justinribeiro/lite-youtube)

![Statements](https://img.shields.io/badge/statements-98.22%25-brightgreen.svg?style=flat) ![Branches](https://img.shields.io/badge/branches-91.17%25-brightgreen.svg?style=flat) ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) ![Lines](https://img.shields.io/badge/lines-98.22%25-brightgreen.svg?style=flat)

# \<lite-youtube\>

> A web component that renders YouTube embeds faster. The ShadowDom web component version of Paul's [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed).

## Features

- No dependencies; it's just a vanilla web component.
- It's fast yo.
- It's Shadow Dom encapsulated!
- It's responsive 16:9
- It's accessible via keyboard and will set ARIA via the `videotitle` attribute
- It's locale ready; you can set the `videoplay` to have a properly locale based label
- Set the `start` attribute to start at a particular place in a video
- You can set `autoload` to use Intersection Observer to load the iframe when scrolled into view.
- Loads placeholder image as WebP with a Jpeg fallback
- _new in v1.1_: Adds `nocookie` attr for use with use youtube-nocookie.com as iframe embed uri
- _new in v1.2_: Adds `playlistid` for playlist loading interface support
- _new in v1.3_: Adds `loading=lazy` to image placeholder for more perf with `posterloading` attr if you'd like to use eager
- _new in v1.4_: Adds `short` attr for enabling experimental YouTube Shorts mobile interaction support. See (example video)[https://www.youtube.com/watch?v=aw7CRQTuRfo] for details.
- _new in v1.5_: Adds support for nonce attribute via `window.liteYouTubeNonce` for CSP 2/3 support.

## Install via package manager

This web component is built with ES modules in mind and is
available on NPM:

To install, use your package manager of choice:

```sh
npm i @justinribeiro/lite-youtube
# or
yarn add @justinribeiro/lite-youtube
```

After install, import into your project:

```js
import '@justinribeiro/lite-youtube';
```

## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1.5.0/lite-youtube.js"></script>
```

## Basic Usage

```html
<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
```

## Basic Usage with Fallback Link

A fallback appears in any of the following circumstances:

1. Before the compontent is initialized
1. When JS is disabled (like `<noscript>`)
1. When JS fails or the lite-youtube script is not loaded/executed
1. When the browser doesn't support web components

```html
<lite-youtube videoid="guJLfqTFfIw">
  <a class="lite-youtube-fallback" href="https://www.youtube.com/watch?v=guJLfqTFfIw">Watch on YouTube: "Sample output of devtools-to-video cli tool"</a>
</lite-youtube>
```

Example CSS:

```css
.lite-youtube-fallback {
	aspect-ratio: 16 / 9; /* matches YouTube player */
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 1em;
	padding: 1em;
	background-color: #000;
	color: #fff;
	text-decoration: none;
}

/* right-facing triangle "Play" icon */
.lite-youtube-fallback::before {
	display: block;
	content: '';
	border: solid transparent;
	border-width: 2em 0 2em 3em;
	border-left-color: red;
}

.lite-youtube-fallback:hover::before {
	border-left-color: #fff;
}

.lite-youtube-fallback:focus {
	outline: 2px solid red;
}
```

## Playlist Usage

Setting the YouTube playlistid allows the playlist interface to load on interaction. Note, this still requires a videoid for to load a placeholder thumbnail as YouTube does not return a thumbnail for playlists in the API.

```html
<lite-youtube
  videoid="VLrYOji75Vc"
  playlistid="PL-G5r6j4GptH5JTveoLTVqpp7w2oc27Q9"
></lite-youtube>
```

## Add Video Title

```html
<lite-youtube
  videotitle="This is a video title"
  videoid="guJLfqTFfIw"
></lite-youtube>
```

## Update interface for Locale</h3>

```html
<lite-youtube
  videoplay="Mirar"
  videotitle="Mis hijos se burlan de mi español"
  videoid="guJLfqTFfIw"
>
</lite-youtube>
```

## Style It

Height and Width are responsive in the component.

```html
<style>
  .styleIt {
    width: 400px;
    margin: auto;
  }
</style>
<div class="styleIt">
  <lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
</div>
```

## Enable YouTube Shorts interaction on mobile

See [the example video](https://www.youtube.com/watch?v=aw7CRQTuRfo) of how this feature works for additional details.

```html
<lite-youtube videoid="vMImN9gghao" short></lite-youtube>
```

## AutoLoad with IntersectionObserver

Uses Intersection Observer if available to automatically load the YouTube iframe when scrolled into view.

```html
<lite-youtube videoid="guJLfqTFfIw" autoload> </lite-youtube>
```

## Set a video start time

```html
<!-- Start at 5 seconds -->
<lite-youtube videoid="guJLfqTFfIw" videoStartAt="5"></lite-youtube>
```

## Fine tune the poster quality for a video

```html
<lite-youtube
  videoid="guJLfqTFfIw"
  posterquality="maxresdefault"
></lite-youtube>
```

## YouTube QueryParams

Use any [YouTube Embedded Players and Player Parameters](https://developers.google.com/youtube/player_parameters) you like.

> Note: the exception to this rule is the autoplay param; because of the nature of the performance loading and the inconsistency of usage, that parameter generally does not work. See [this comment](https://github.com/justinribeiro/lite-youtube/issues/66#issuecomment-1182110925) for details.

```html
<lite-youtube videoid="guJLfqTFfIw" params="controls=0&enablejsapi=1">
</lite-youtube>
```


## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

| Name           | Description                                                      | Default |
| -------------- | ---------------------------------------------------------------- | ------- |
| `videoid`      | The YouTube videoid                                              | ``      |
| `playlistid`   | The YouTube playlistid; requires a videoid for thumbnail         | ``      |
| `videotitle`   | The title of the video                                           | `Video` |
| `videoplay`    | The title of the play button (for translation)                   | `Play`  |
| `videoStartAt` | Set the point at which the video should start, in seconds        | `0`     |
| `posterquality`| Set thumbnail poster quality (maxresdefault, sddefault, mqdefault, hqdefault) | `hqdefault`  |
| `posterloading`| Set img lazy load attr `loading` for poster image | `lazy`  |
| `nocookie`     | Use youtube-nocookie.com as iframe embed uri | `false` |
| `autoload`     | Use Intersection Observer to load iframe when scrolled into view | `false` |
| `short`     | Show 9:16 YouTube Shorts-style interaction on mobile devices | `false` |
| `params`       | Set YouTube query parameters                                     | ``      |

## Events

The web component fires events to give the ability understand important lifecycle.

| Event Name     | Description                                                      | Returns |
| -------------- | ---------------------------------------------------------------- | ------- |
| `liteYoutubeIframeLoaded` | When the iframe is loaded, allowing us of JS API  | `detail: { videoId: this.videoId }` |
