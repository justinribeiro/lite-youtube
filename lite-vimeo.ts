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


/*
 * Vimeo example embed markup:
<iframe src="https://player.vimeo.com/video/364402896"
  width="640" height="360"
  frameborder="0"
  allow="autoplay; fullscreen" allowfullscreen>
</iframe>
<p><a href="https://vimeo.com/364402896">
  Alex Russell - The Mobile Web: MIA</a> from
    <a href="https://vimeo.com/fronteers">Fronteers</a>
    on <a href="https://vimeo.com">Vimeo</a>.
</p>
 */
export class LiteVimeoEmbed extends HTMLElement {
  shadowRoot!: ShadowRoot;
  private iframeLoaded = false;
  private domRefFrame!: HTMLDivElement;
  private domRefImg!: {
    fallback: HTMLImageElement;
    webp: HTMLSourceElement;
    jpeg: HTMLSourceElement;
  };
  private domRefPlayButton!: HTMLButtonElement;

  constructor() {
    super();
    this.setupDom();
  }

  static get observedAttributes(): string[] {
    return ['videoid'];
  }

  connectedCallback(): void {
    this.addEventListener('pointerover', LiteVimeoEmbed.warmConnections, {
      once: true,
    });

    this.addEventListener('click', () => this.addIframe());
  }

  get videoId(): string {
    return encodeURIComponent(this.getAttribute('videoid') || '');
  }

  set videoId(id: string) {
    this.setAttribute('videoid', id);
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

  get videoStartAt(): string {
    return this.getAttribute('videoPlay') || '0s';
  }

  set videoStartAt(time: string) {
    this.setAttribute('videoPlay', time);
  }

  get autoLoad(): boolean {
    return this.hasAttribute('autoload');
  }

  set autoLoad(value: boolean) {
    if (value) {
      this.setAttribute('autoload', '');
    } else {
      this.removeAttribute('autoload');
    }
  }

  get autoPlay(): boolean {
    return this.hasAttribute('autoplay');
  }

  set autoPlay(value: boolean) {
    if (value) {
      this.setAttribute('autoplay', 'autoplay');
    } else {
      this.removeAttribute('autoplay');
    }
  }


  /**
   * Define our shadowDOM for the component
   */
  private setupDom(): void {
    const shadowDom = this.attachShadow({mode: 'open'});
    shadowDom.innerHTML = `
      <style>
        :host {
          contain: content;
          display: block;
          position: relative;
          width: 100%;
          padding-bottom: calc(100% / (16 / 9));
        }

        #frame, #fallbackPlaceholder, iframe {
          position: absolute;
          width: 100%;
          height: 100%;
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
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==);
          background-position: top;
          background-repeat: repeat-x;
          height: 60px;
          padding-bottom: 50px;
          width: 100%;
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          z-index: 1;
        }
        /* play button */
        .lvo-playbtn {
          width: 70px;
          height: 46px;
          background-color: #212121;
          z-index: 1;
          opacity: 0.8;
          border-radius: 10%;
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          border: 0;
        }
        #frame:hover .lvo-playbtn {
          background-color: rgb(98, 175, 237);
          opacity: 1;
        }
        /* play button triangle */
        .lvo-playbtn:before {
          content: '';
          border-style: solid;
          border-width: 11px 0 11px 19px;
          border-color: transparent transparent transparent #fff;
        }
        .lvo-playbtn,
        .lvo-playbtn:before {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
        }

        /* Post-click styles */
        .lvo-activated {
          cursor: unset;
        }

        #frame.lvo-activated::before,
        .lvo-activated .lvo-playbtn {
          display: none;
        }
      </style>
      <div id="frame">
        <picture>
          <source id="webpPlaceholder" type="image/webp">
          <source id="jpegPlaceholder" type="image/jpeg">
          <img id="fallbackPlaceholder"
               referrerpolicy="origin"
               width="1100"
               height="619"
               decoding="async"
               loading="lazy">
        </picture>
        <button class="lvo-playbtn"></button>
      </div>
    `;
    this.domRefFrame = this.shadowRoot.querySelector<HTMLDivElement>('#frame')!;
    this.domRefImg = {
      fallback: this.shadowRoot.querySelector<HTMLImageElement>(
        '#fallbackPlaceholder',
      )!,
      webp: this.shadowRoot.querySelector<HTMLSourceElement>(
        '#webpPlaceholder',
      )!,
      jpeg: this.shadowRoot.querySelector<HTMLSourceElement>(
        '#jpegPlaceholder',
      )!,
    };
    this.domRefPlayButton = this.shadowRoot.querySelector<HTMLButtonElement>(
      '.lvo-playbtn',
    )!;
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
    newVal: unknown,
  ): void {
    switch (name) {
      case 'videoid': {
        if (oldVal !== newVal) {
          this.setupComponent();

          // if we have a previous iframe, remove it and the activated class
          if (this.domRefFrame.classList.contains('lvo-activated')) {
            this.domRefFrame.classList.remove('lvo-activated');
            this.shadowRoot.querySelector('iframe')!.remove();
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
   */
  private addIframe(): void {
    if (!this.iframeLoaded) {
      /**
       * Vimeo example embed markup:
       *
       *  <iframe src="https://player.vimeo.com/video/364402896#t=1m3s"
       *    width="640" height="360"
       *    frameborder="0"
       *    allow="autoplay; fullscreen" allowfullscreen>
       *  </iframe>
       */
      // FIXME: add a setting for autoplay
      const apValue = ((this.autoLoad && this.autoPlay) || (!this.autoLoad)) ?
                        "autoplay=1" : "";
      const srcUrl = new URL(
        `/video/${this.videoId}?${apValue}&#t=${this.videoStartAt}`,
        "https://player.vimeo.com/"
      );

      // TODO: construct src value w/ URL constructor
      const iframeHTML = `
<iframe frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen src="${srcUrl}"></iframe>`;
      this.domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
      this.domRefFrame.classList.add('lvo-activated');
      this.iframeLoaded = true;
    }
  }

  /**
   * Setup the placeholder image for the component
   */
  private async initImagePlaceholder(): Promise<any> {
    // TODO(slightlyoff): TODO: cache API responses

    // we don't know which image type to preload, so warm the connection
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://i.vimeocdn.com/');

    // API is the video-id based
    // http://vimeo.com/api/v2/video/364402896.json
    const apiUrl = `https://vimeo.com/api/v2/video/${this.videoId}.json`;

    // Now fetch the JSON that locates our placeholder from vimeo's JSON API
    const apiResponse = (await (await fetch(apiUrl)).json())[0];

    // Extract the image id, e.g. 819916979, from a URL like:
    // thumbnail_large: "https://i.vimeocdn.com/video/819916979_640.jpg"
    const tnLarge = apiResponse.thumbnail_large;
    const imgId = (tnLarge.substr(tnLarge.lastIndexOf("/") + 1)).split("_")[0];

    // const posterUrlWebp =
    //    `https://i.ytimg.com/vi_webp/${this.videoId}/hqdefault.webp`;
    const posterUrlWebp =
          `https://i.vimeocdn.com/video/${imgId}.webp?mw=1100&mh=619&q=70`;
    const posterUrlJpeg =
          `https://i.vimeocdn.com/video/${imgId}.jpg?mw=1100&mh=619&q=70`;
    this.domRefImg.webp.srcset = posterUrlWebp;
    this.domRefImg.jpeg.srcset = posterUrlJpeg;
    this.domRefImg.fallback.src = posterUrlJpeg;
    this.domRefImg.fallback.setAttribute(
      'aria-label',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
    this.domRefImg.fallback.setAttribute(
      'alt',
      `${this.videoPlay}: ${this.videoTitle}`,
    );
  }

  /**
   * Setup the Intersection Observer to load the iframe when scrolled into view
   */
  private initIntersectionObserver(): void {
    if (
      'IntersectionObserver' in window &&
      'IntersectionObserverEntry' in window
    ) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.iframeLoaded) {
            LiteVimeoEmbed.warmConnections();
            this.addIframe();
            observer.unobserve(this);
          }
        });
      }, options);

      observer.observe(this);
    }
  }

  private static preconnected = false;

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   * @param {*} kind
   * @param {*} url
   * @param {*} as
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
   * Begin preconnecting to warm up the iframe load Since the embed's netwok
   * requests load within its iframe, preload/prefetch'ing them outside the
   * iframe will only cause double-downloads. So, the best we can do is warm up
   * a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported:
   * http://crbug.com/593267 But TBH, I don't think it'll happen soon with Site
   * Isolation and split caches adding serious complexity.
   */
  private static warmConnections(): void {
    if (LiteVimeoEmbed.preconnected) return;
    // Host that Vimeo uses to serve JS needed by player
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://f.vimeocdn.com');

    // The iframe document comes from player.vimeo.com
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://player.vimeo.com');

    // Image for placeholder comes from i.vimeocdn.com
    LiteVimeoEmbed.addPrefetch('preconnect', 'https://i.vimeocdn.com');

    LiteVimeoEmbed.preconnected = true;
  }
}
// Register custom element
customElements.define('lite-vimeo', LiteVimeoEmbed);

declare global {
  interface HTMLElementTagNameMap {
    'lite-vimeo': LiteVimeoEmbed;
  }
}
