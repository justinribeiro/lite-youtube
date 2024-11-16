/**
 *
 * The shadowDom / Intersection Observer version of Paul's concept:
 * https://github.com/paulirish/lite-youtube-embed
 *
 * A lightweight YouTube embed. Still should feel the same to the user, just
 * MUCH faster to initialize and paint.
 *
 * Thx to these as the inspiration
 *   https://storage.googleapis.com/amp-vs-non-amp/youtube-lazy.html
 *   https://autoplay-youtube-player.glitch.me/
 *
 * Once built it, I also found these (👍👍):
 *   https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube
 *   https://github.com/Daugilas/lazyYT https://github.com/vb/lazyframe
 */
export class LiteYTEmbed extends HTMLElement {
  shadowRoot!: ShadowRoot;
  private domRefFrame!: HTMLDivElement;
  private domRefImg!: {
    fallback: HTMLImageElement;
    webp: HTMLSourceElement;
    jpeg: HTMLSourceElement;
  };
  private domRefPlayButton!: HTMLButtonElement;
  private static isPreconnected = false;
  private isIframeLoaded = false;

  constructor() {
    super();
    this.setupDom();
  }

  static get observedAttributes(): string[] {
    return ['videoid', 'playlistid', 'videoplay', 'videotitle'];
  }

  connectedCallback(): void {
    this.addEventListener(
      'pointerover',
      () => LiteYTEmbed.warmConnections(this),
      {
        once: true,
      },
    );

    this.addEventListener('click', () => this.addIframe());
  }

  get videoId(): string {
    return encodeURIComponent(this.getAttribute('videoid') || '');
  }

  set videoId(id: string) {
    this.setAttribute('videoid', id);
  }

  get playlistId(): string {
    return encodeURIComponent(this.getAttribute('playlistid') || '');
  }

  set playlistId(id: string) {
    this.setAttribute('playlistid', id);
  }

  get videoTitle(): string {
    return this.getAttribute('videotitle') || 'Video';
  }

  set videoTitle(title: string) {
    this.setAttribute('videotitle', title);
  }

  get videoPlay(): string {
    return this.getAttribute('videoplay') || 'Play';
  }

  set videoPlay(name: string) {
    this.setAttribute('videoplay', name);
  }

  get videoStartAt(): string {
    return this.getAttribute('videoStartAt') || '0';
  }

  get autoLoad(): boolean {
    return this.hasAttribute('autoload');
  }

  get autoPause(): boolean {
    return this.hasAttribute('autopause');
  }

  get noCookie(): boolean {
    return this.hasAttribute('nocookie');
  }

  get posterQuality(): string {
    return this.getAttribute('posterquality') || 'hqdefault';
  }

  get posterLoading(): HTMLImageElement['loading'] {
    return (
      (this.getAttribute('posterloading') as HTMLImageElement['loading']) ||
      'lazy'
    );
  }

  get params(): string {
    return `start=${this.videoStartAt}&${this.getAttribute('params')}`;
  }

  set params(opts: string) {
    this.setAttribute('params', opts);
  }

  /**
   * Define our shadowDOM for the component
   */
  private setupDom(): void {
    const shadowDom = this.attachShadow({ mode: 'open' });
    let nonce = '';
    if (window.liteYouTubeNonce) {
      nonce = `nonce="${window.liteYouTubeNonce}"`;
    }
    shadowDom.innerHTML = `
      <style ${nonce}>
        :host {
          --aspect-ratio: var(--lite-youtube-aspect-ratio, 16 / 9);
          --aspect-ratio-short: var(--lite-youtube-aspect-ratio-short, 9 / 16);
          --frame-shadow-visible: var(--lite-youtube-frame-shadow-visible, yes);
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          aspect-ratio: var(--aspect-ratio);
        }

        @media (max-width: 40em) {
          :host([short]) {
            aspect-ratio: var(--aspect-ratio-short);
          }
        }

        #frame, #fallbackPlaceholder, iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
        }

        #frame {
          cursor: pointer;
        }

        #fallbackPlaceholder, slot[name=image]::slotted(*) {
          object-fit: cover;
          width: 100%;
        }

        @container style(--frame-shadow-visible: yes) {
          #frame::before {
            content: '';
            display: block;
            position: absolute;
            top: 0;
            background-image: linear-gradient(180deg, #111 -20%, transparent 90%);
            height: 60px;
            width: 100%;
            z-index: 1;
          }
        }

        #playButton {
          width: 68px;
          height: 48px;
          background-color: transparent;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24 27 14v20" fill="white"/></svg>');
          z-index: 1;
          border: 0;
          border-radius: inherit;
        }

        #playButton:before {
          content: '';
          border-style: solid;
          border-width: 11px 0 11px 19px;
          border-color: transparent transparent transparent #fff;
        }

        #playButton,
        #playButton:before {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
          cursor: inherit;
        }

        /* Post-click styles */
        .activated {
          cursor: unset;
        }

        #frame.activated::before,
        #frame.activated > #playButton {
          display: none;
        }
      </style>
      <div id="frame">
        <picture>
          <slot name="image">
            <source id="webpPlaceholder" type="image/webp">
            <source id="jpegPlaceholder" type="image/jpeg">
            <img id="fallbackPlaceholder" referrerpolicy="origin" loading="lazy">
          </slot>
        </picture>
        <button id="playButton"></button>
      </div>
    `;
    this.domRefFrame = shadowDom.querySelector<HTMLDivElement>('#frame')!;
    this.domRefImg = {
      fallback: shadowDom.querySelector('#fallbackPlaceholder')!,
      webp: shadowDom.querySelector('#webpPlaceholder')!,
      jpeg: shadowDom.querySelector('#jpegPlaceholder')!,
    };
    this.domRefPlayButton = shadowDom.querySelector('#playButton')!;
  }

  /**
   * Parse our attributes and fire up some placeholders
   */
  private setupComponent(): void {
    this.initImagePlaceholder();

    this.domRefPlayButton.setAttribute(
      'aria-label',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
    this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);

    if (this.autoLoad || this.isYouTubeShort() || this.autoPause) {
      this.initIntersectionObserver();
    }
    this.injectSearchNoScript();
  }

  /**
   * Lifecycle method that we use to listen for attribute changes to period
   * @param {*} name
   * @param {*} oldVal
   * @param {*} newVal
   */
  attributeChangedCallback(
    name: string,
    oldVal: unknown,
    newVal: unknown,
  ): void {
    if (oldVal !== newVal) {
      this.setupComponent();

      // if we have a previous iframe, remove it and the activated class
      if (this.domRefFrame.classList.contains('activated')) {
        this.domRefFrame.classList.remove('activated');
        this.shadowRoot.querySelector('iframe')!.remove();
        this.isIframeLoaded = false;
      }
    }
  }

  // h/t @paulirish et al
  // https://github.com/paulirish/lite-youtube-embed/issues/105
  // differs in that we inject into the lightdom above any other nodes so our
  // slots or fallbacks still work
  private injectSearchNoScript(): void {
    const eleNoScript = document.createElement('noscript');
    this.prepend(eleNoScript);
    eleNoScript.innerHTML = this.generateIframe();
  }

  private generateIframe(isIntersectionObserver = false): string {
    let autoplay = isIntersectionObserver ? 0 : 1;
    const wantsNoCookie = this.noCookie ? '-nocookie' : '';
    let embedTarget;
    if (this.playlistId) {
      embedTarget = `?listType=playlist&list=${this.playlistId}&`;
    } else {
      embedTarget = `${this.videoId}?`;
    }

    // autopause needs the postMessage() in the iframe, so you have to enable
    // the jsapi
    if (this.autoPause) {
      this.params = `enablejsapi=1`;
    }

    // Oh wait, you're a YouTube short, so let's try to make you more workable
    if (this.isYouTubeShort()) {
      this.params = `loop=1&mute=1&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&playlist=${this.videoId}`;
      autoplay = 1;
    }

    return `
<iframe credentialless frameborder="0" title="${this.videoTitle}"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
  src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}autoplay=${autoplay}&${this.params}"
></iframe>`;
  }

  /**
   * Inject the iframe into the component body
   * @param {boolean} isIntersectionObserver
   */
  private addIframe(isIntersectionObserver = false): void {
    if (!this.isIframeLoaded) {
      // Don't autoplay the intersection observer injection, it's weird

      const iframeHTML = this.generateIframe(isIntersectionObserver);

      this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      this.domRefFrame.classList.add('activated');
      this.isIframeLoaded = true;
      this.attemptShortAutoPlay();
      this.dispatchEvent(
        new CustomEvent('liteYoutubeIframeLoaded', {
          detail: {
            videoId: this.videoId,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  }

  /**
   * Setup the placeholder image for the component
   */
  private initImagePlaceholder(): void {
    const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/${this.posterQuality}.webp`;
    const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/${this.posterQuality}.jpg`;
    this.domRefImg.fallback.loading = this.posterLoading;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute(
      'aria-label',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
    this.domRefImg?.fallback?.setAttribute(
      'alt',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
  }

  /**
   * Setup the Intersection Observer to load the iframe when scrolled into view
   */
  private initIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isIframeLoaded) {
          LiteYTEmbed.warmConnections(this);
          this.addIframe(true);
          observer.unobserve(this);
        }
      });
    }, options);

    observer.observe(this);

    // this needs the iframe loaded, so it has to run post the IO load at the
    // least otherwise things will break
    if (this.autoPause) {
      const windowPause = new IntersectionObserver(
        (e, o) => {
          e.forEach(entry => {
            if (entry.intersectionRatio !== 1) {
              this.shadowRoot
                .querySelector('iframe')
                ?.contentWindow?.postMessage(
                  '{"event":"command","func":"pauseVideo","args":""}',
                  '*',
                );
            }
          });
        },
        { threshold: 1 },
      );
      windowPause.observe(this);
    }
  }

  /**
   * This is a terrible hack to attempt to get YouTube Short-like autoplay on
   * mobile viewports. It's this way because:
   * 1. YouTube's Iframe embed does not offer determinism when loading
   * 2. Attempting to use onYouTubeIframeAPIReady() does not work in 99% of
   *    cases
   * 3. You can _technically_ load the Frame API library and do more advanced
   *    things, but I don't want to burn the thread of the wire with its
   *    shenanigans since this an edge case.
   * @private
   */
  private attemptShortAutoPlay() {
    if (this.isYouTubeShort()) {
      setTimeout(() => {
        this.shadowRoot
          .querySelector('iframe')
          ?.contentWindow?.postMessage(
            '{"event":"command","func":"' + 'playVideo' + '","args":""}',
            '*',
          );
        // for youtube video recording demo
      }, 2000);
    }
  }

  /**
   * A hacky attr check and viewport peek to see if we're going to try to enable
   * a more friendly YouTube Short style loading
   * @returns boolean
   */
  private isYouTubeShort(): boolean {
    return (
      this.getAttribute('short') === '' &&
      window.matchMedia('(max-width: 40em)').matches
    );
  }

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   * @param {string} kind
   * @param {string} url
   * @param {string} as
   */
  private static addPrefetch(kind: string, url: string): void {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;
    linkElem.crossOrigin = 'true';
    document.head.append(linkElem);
  }

  /**
   * Begin preconnecting to warm up the iframe load Since the embed's network
   * requests load within its iframe, preload/prefetch'ing them outside the
   * iframe will only cause double-downloads. So, the best we can do is warm up
   * a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
   * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
   * Isolation and split caches adding serious complexity.
   */
  private static warmConnections(context: LiteYTEmbed): void {
    if (LiteYTEmbed.isPreconnected || window.liteYouTubeIsPreconnected) return;

    // we don't know which image type to preload, so warm the connection
    LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');

    // Host that YT uses to serve JS needed by player, per amp-youtube
    LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com');

    if (!context.noCookie) {
      // The iframe document and most of its subresources come right off
      // youtube.com
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');

      // The botguard script is fetched off from google.com
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');

      // TODO: Not certain if these ad related domains are in the critical path.
      // Could verify with domain-specific throttling.
      LiteYTEmbed.addPrefetch(
        'preconnect',
        'https://googleads.g.doubleclick.net',
      );
      LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
    } else {
      LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube-nocookie.com');
    }

    LiteYTEmbed.isPreconnected = true;

    // multiple embeds in the same page don't check for each other
    window.liteYouTubeIsPreconnected = true;
  }
}
// Register custom element
customElements.define('lite-youtube', LiteYTEmbed);

declare global {
  interface HTMLElementTagNameMap {
    'lite-youtube': LiteYTEmbed;
  }
  interface Window {
    liteYouTubeNonce: string;
    liteYouTubeIsPreconnected: boolean;
  }
}
