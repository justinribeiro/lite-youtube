[![npm version](https://badge.fury.io/js/%40justinribeiro%2Flite-youtube.svg)](https://badge.fury.io/js/%40justinribeiro%2Flite-youtube)

# \<lite-youtube\>

> A web component that displays render YouTube embeds faster. The shadowDom web component version of Paul's [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed).

## Features

* No dependencies; it's just a vanilla web component.
* It's fast yo.
* It's Shadow Dom encapsulated!
* It's responsive (just style it like you normally would with height and width and things)
* It's accessible via keyboard and will set ARIA via the `videotitle` attribute
* It's locale ready; you can set the `videoplay` to have a properly locale based label

## Install

This web component is built with ES modules in mind and is
available on NPM:

Install code-block:

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
<script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@0.2.0/lite-youtube.js">
```

## Basic Usage

```html
  <lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
```

## Add Video Title

```html
<lite-youtube videoid="guJLfqTFfIw" videotitle="This is a video title"></lite-youtube>
```

## Change "Play" for Locale</h3>
```html
<lite-youtube
   videoid="guJLfqTFfIw"
   videoplay="Mirar"
   videotitle="Mis hijos se burlan de mi español">
</lite-youtube>
```

## Style It
Add a class or just style it directly. Height and Width are responsive in the container (there is a min-height requirement of 315px to make the basic embed work easier).
```html
<style>
  .styleIt {
    width: 400px;
    height: 400px;
    margin: auto;
  }
</style>
<lite-youtube class="styleIt" videoid="guJLfqTFfIw"></lite-youtube>
```

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

 | Name | Description | Default |
 | --- | --- | --- |
 | `videoid` | The YouTube videoid | ` ` |
 | `videotitle` | The title of the video | `Video` |
 | `videoplay` | The title of the play button (for translation) | `Play` |
