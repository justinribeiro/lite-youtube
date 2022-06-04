declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Load Youtube API to listen for events
 */
async function loadYoutubeAPI(): Promise<typeof window.YT> {
  return new Promise(resolve => {
    if (window.YT) {
      resolve(window.YT);
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.type = 'text/javascript';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = function () {
      window.onYouTubeIframeAPIReady = undefined;
      resolve(window.YT);
    };
  });
}

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

  private player?: YT.Player;
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
    return ['videoid', 'playlistid'];
  }

  connectedCallback(): void {
    this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
      once: true,
    });

    this.addEventListener('click', () => this.addIframe());
  }

  load(): void {
    this.addIframe(true)
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

  get playbackRate(): number {
    return this.player?.getPlaybackRate() ?? 1;
  }

  set playbackRate(rate: number) {
    this.player?.setPlaybackRate(rate);
  }

  get duration(): number {
    return this.player?.getDuration() ?? NaN;
  }

  get muted(): boolean {
    return this.player?.isMuted() || false;
  }

  set muted(muted: boolean) {
    muted ? this.player?.mute() : this.player?.unMute();
  }

  get ended(): boolean {
    return this.player?.getPlayerState() === YT.PlayerState.ENDED;
  }

  get paused(): boolean {
    return this.player?.getPlayerState() === YT.PlayerState.PAUSED;
  }

  get volume(): number {
    return (this.player?.getVolume() ?? 0) / 100;
  }

  set volume(volume: number) {
    this.player?.setVolume(volume * 100);
  }

  get currentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  set currentTime(time: number) {
    this.player?.seekTo(time, true);
  }

  get videoTitle(): string {
    return this.getAttribute('videotitle') || 'Video';
  }

  set videoTitle(title: string) {
    this.setAttribute('videotitle', title);
  }

  get videoPlay(): string {
    return this.getAttribute('videoPlay') || 'Play';
  }

  set videoPlay(name: string) {
    this.setAttribute('videoPlay', name);
  }

  get videoStartAt(): number {
    return Number(this.getAttribute('videoStartAt') || '0');
  }

  set videoStartAt(time: number) {
    this.setAttribute('videoStartAt', String(time));
  }

  get autoLoad(): boolean {
    return this.hasAttribute('autoload');
  }

  get noCookie(): boolean {
    return this.hasAttribute('nocookie');
  }

  get hasEvents(): boolean {
    return this.hasAttribute('events');
  }

  get posterQuality(): string {
    return this.getAttribute('posterquality') || 'hqdefault';
  }

  get posterLoading(): string {
    return this.getAttribute('posterloading') || 'lazy';
  }

  get params(): string {
    return `start=${this.videoStartAt}&${this.getAttribute('params')}`;
  }

  public play(): void {
    // The player is not already loaded
    if (this.hasEvents && !this.player) {
      this.addIframe()
    }
    this.player?.playVideo();
  }

  public pause(): void {
    this.player?.pauseVideo();
  }

  /**
   * Define our shadowDOM for the component
   */
  private setupDom(): void {
    const shadowDom = this.attachShadow({ mode: 'open' });
    shadowDom.innerHTML = `
      <style>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          padding-bottom: calc(100% / (16 / 9));
          --lyt-animation: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          --lyt-play-btn-default: #212121;
          --lyt-play-btn-hover: #f00;
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

        #fallbackPlaceholder {
          object-fit: cover;
        }

        #frame::before {
          content: '';
          display: block;
          position: absolute;
          top: 0;
          background-image: linear-gradient(180deg, #111 -20%, transparent 90%);
          height: 60px;
          width: 100%;
          transition: var(--lyt-animation);
          z-index: 1;
        }

        #playButton {
          width: 70px;
          height: 46px;
          background-color: var(--lyt-play-btn-hover);
          z-index: 1;
          opacity: 0.8;
          border-radius: 14%;
          transition: var(--lyt-animation);
          border: 0;
        }

        #frame:hover > #playButton {
          background-color: var(--lyt-play-btn-hover);
          opacity: 1;
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
          <source id="webpPlaceholder" type="image/webp">
          <source id="jpegPlaceholder" type="image/jpeg">
          <img id="fallbackPlaceholder" referrerpolicy="origin">
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
      `${this.videoPlay}: ${this.videoTitle}`
    );
    this.setAttribute('title', `${this.videoPlay}: ${this.videoTitle}`);

    if (this.autoLoad) {
      this.initIntersectionObserver();
    }
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
    newVal: unknown
  ): void {
    switch (name) {
      case 'videoid':
      case 'playlistid': {
        if (oldVal !== newVal) {
          this.setupComponent();

          // if we have a previous iframe, remove it and the activated class
          if (this.domRefFrame.classList.contains('activated')) {
            this.domRefFrame.classList.remove('activated');
            this.shadowRoot.querySelector('iframe')!.remove();
            this.isIframeLoaded = false;
          }
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Inject the iframe into the component body
   * @param {boolean} isIntersectionObserver
   */
  private async addIframe(isIntersectionObserver = false): Promise<void> {
    if (!this.isIframeLoaded) {
      // Don't autoplay the intersection observer injection, it's weird
      const autoplay = isIntersectionObserver ? 0 : 1;
      const wantsNoCookie = this.noCookie ? '-nocookie' : '';
      let embedTarget;
      if (this.playlistId) {
        embedTarget = `?listType=playlist&list=${this.playlistId}&`;
      } else {
        embedTarget = `${this.videoId}?`;
      }
      if (!this.hasEvents) {
        const iframeHTML = `
<iframe frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
  src="https://www.youtube${wantsNoCookie}.com/embed/${embedTarget}autoplay=${autoplay}&${this.params}"
></iframe>`;
        this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      } else {
        const YT = await loadYoutubeAPI();
        this.player = new YT.Player(this.domRefFrame, {
          videoId: this.videoId,
          host: `https://www.youtube${wantsNoCookie}.com`,
          playerVars: {
            autoplay,
          },
          events: {
            onStateChange: this.onYoutubeStateChange.bind(this),
            onPlaybackRateChange: () =>
              this.dispatchEvent(new Event('ratechange')),
            onReady: () => this.dispatchEvent(new Event('loadedmetadata')),
          },
        });
      }
      this.domRefFrame.classList.add('activated');
      this.isIframeLoaded = true;
      this.dispatchEvent(
        new CustomEvent('liteYoutubeIframeLoaded', {
          detail: {
            videoId: this.videoId,
          },
          bubbles: true,
          cancelable: true,
        })
      );
    }
  }

  private onYoutubeStateChange(event: YT.OnStateChangeEvent): void {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        this.dispatchEvent(new Event('play'));
        break;
      case YT.PlayerState.PAUSED:
        this.dispatchEvent(new Event('pause'));
        break;
      case YT.PlayerState.ENDED:
        this.dispatchEvent(new Event('ended'));
        break;
    }
  }

  /**
   * Setup the placeholder image for the component
   */
  private initImagePlaceholder(): void {
    // we don't know which image type to preload, so warm the connection
    LiteYTEmbed.addPrefetch('preconnect', 'https://i.ytimg.com/');

    const posterUrlWebp = `https://i.ytimg.com/vi_webp/${this.videoId}/${this.posterQuality}.webp`;
    const posterUrlJpeg = `https://i.ytimg.com/vi/${this.videoId}/${this.posterQuality}.jpg`;
    this.domRefImg.fallback.loading = this.posterLoading;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute(
      'aria-label',
      `${this.videoPlay}: ${this.videoTitle}`
    );
    this.domRefImg?.fallback?.setAttribute(
      'alt',
      `${this.videoPlay}: ${this.videoTitle}`
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
          LiteYTEmbed.warmConnections();
          this.addIframe(true);
          observer.unobserve(this);
        }
      });
    }, options);

    observer.observe(this);
  }

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   * @param {string} kind
   * @param {string} url
   * @param {string} as
   */
  private static addPrefetch(kind: string, url: string, as?: string): void {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;
    if (as) {
      linkElem.as = as;
    }
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
  private static warmConnections(): void {
    if (LiteYTEmbed.isPreconnected) return;
    // Host that YT uses to serve JS needed by player, per amp-youtube
    LiteYTEmbed.addPrefetch('preconnect', 'https://s.ytimg.com');

    // The iframe document and most of its subresources come right off
    // youtube.com
    LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');

    // The botguard script is fetched off from google.com
    LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');

    // TODO: Not certain if these ad related domains are in the critical path.
    // Could verify with domain-specific throttling.
    LiteYTEmbed.addPrefetch(
      'preconnect',
      'https://googleads.g.doubleclick.net'
    );
    LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
    LiteYTEmbed.isPreconnected = true;
  }
}
// Register custom element
customElements.define('lite-youtube', LiteYTEmbed);

declare global {
  interface HTMLElementTagNameMap {
    'lite-youtube': LiteYTEmbed;
  }
}
