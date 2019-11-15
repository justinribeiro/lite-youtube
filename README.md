[![npm version](https://badge.fury.io/js/%40justinribeiro%2Flite-youtube.svg)](https://badge.fury.io/js/%40justinribeiro%2Flite-youtube)

# \<lite-youtube\>

> A web component that displays render YouTube embeds faster. The shadowDom web component version of Paul's [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed).

## Features

* No dependencies; it's just a vanilla web component.
* It's fast yo.
* It's Shadow Dom encapsulated!
* It's responsive (just style it like you normally would with height and width and things)

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

Finally, use as required:

```html
<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
```

## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@0.1.1/lite-youtube.js">
```

Finally, use as required:

```html
<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
```

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

 | Name | Description | Default |
 | --- | --- | --- |
 | `videoid` | The YouTube videoid | ` ` |
