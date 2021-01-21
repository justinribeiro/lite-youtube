[![npm version](https://badge.fury.io/js/%40slightlyoff%2Flite-vimeo.svg)](https://badge.fury.io/js/%40slightlyoff%2Flite-vimeo)

# \<lite-vimeo\>

> A web component that displays Vimeo embeds faster. Based on Justin Ribeiro's excellent [\<lite-youtube\>](https://github.com/justinribeiro/lite-youtube), which, in turn, is a Shadow DOM version of Paul's [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed).

This is basically a rebadge of Justin's component, but for Vimeo.

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

## Install

This web component is built with ES modules in mind and is
available on NPM:

Install code-block:

```sh
npm i @slightlyoff/lite-vimeo
# or
yarn add @slightlyoff/lite-vimeo
```

After install, import into your project:

```js
import '@slightlyoff/lite-vimeo';
```

## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@slightlyoff/lite-vimeo@0.1.1/lite-vimeo.js">
```

## Basic Usage

```html
<lite-vimeo videoid="364402896"></lite-vimeo>
```

## Add Video Title

```html
<lite-vimeo
  videoid="364402896"
  videotitle="This is a video title"
></lite-vimeo>
```

## Change "Play" for Locale</h3>

```html
<lite-vimeo
  videoid="364402896"
  videoplay="Mirar"
  videotitle="Mis hijos se burlan de mi español"
></lite-vimeo>
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
  <lite-vimeo videoid="364402896"></lite-vimeo>
</div>
```

## Set a video start time

```html
<!-- Start at 5 min, 30 seconds -->
<lite-vimeo videoid="364402896" start="5m30s"></lite-vimeo>
```

## AutoLoad with IntersectionObserver

Uses Intersection Observer if available to automatically load the Vimeo iframe when scrolled into view.

```html
<lite-vimeo videoid="364402896" autoload></lite-vimeo>
```

## Auto Play (requires AutoLoad)

```html
<lite-vimeo videoid="364402896" autoload autoplay></lite-vimeo>
```

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

| Name         | Description                                                      | Default |
| ------------ | ---------------------------------------------------------------- | ------- |
| `videoid`    | The Vimeo videoid                                              | ``      |
| `videotitle` | The title of the video                                           | `Video` |
| `videoplay`  | The title of the play button (for translation)                   | `Play`  |
| `autoload`   | Use Intersection Observer to load iframe when scrolled into view | `false` |
| `autoplay`   | Video attempts to play automatically if auto-load set and browser allows it | `false` |
| `start`      | Set the point at which the video should start, in seconds        | `0`     |
