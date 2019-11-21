/**
 *
 * The shadowDom version of Paul's concept: https://github.com/paulirish/lite-youtube-embed
 *
 * A lightweight youtube embed. Still should feel the same to the user, just MUCH faster to initialize and paint.
 *
 * Thx to these as the inspiration
 *   https://storage.googleapis.com/amp-vs-non-amp/youtube-lazy.html
 *   https://autoplay-youtube-player.glitch.me/
 *
 * Once built it, I also found these:
 *   https://github.com/ampproject/amphtml/blob/master/extensions/amp-youtube (👍👍)
 *   https://github.com/Daugilas/lazyYT
 *   https://github.com/vb/lazyframe
 */
class LiteYTEmbed extends HTMLElement {
  constructor() {
    super();
    this.setupDom();

    this.__iframeLoaded = false;
  }

  static get observedAttributes() {
    return ['videoid'];
  }

  connectedCallback() {
    // On hover (or tap), warm up the TCP connections we're (likely) about to use.
    this.addEventListener('pointerover', LiteYTEmbed.warmConnections, {
      once: true,
    });
    // Once the user clicks, add the real iframe and drop our play button
    // TODO: In the future we could be like amp-youtube and silently swap in the iframe during idle time
    //   We'd want to only do this for in-viewport or near-viewport ones: https://github.com/ampproject/amphtml/pull/5003
    this.addEventListener('click', e => this.addIframe());
  }

  setupDom() {
    const shadowDom = this.attachShadow({mode: 'open'});
    shadowDom.innerHTML = `
      <style>
        :host {
          contain: content;
          display: block;
          padding-bottom: calc(100% / (16 / 9));
        }

        #frame {
          width: 100%;
          height: 100%;
          background-color: #000;
          background-position: center center;
          background-size: cover;
          cursor: pointer;
          position: fixed;
        }

        iframe {
          position: fixed;
          width: 100%;
          height: 100%;
        }

        /* gradient */
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
        }
        /* play button */
        .lty-playbtn {
          width: 70px;
          height: 46px;
          background-color: #212121;
          z-index: 1;
          opacity: 0.8;
          border-radius: 14%; /* TODO: Consider replacing this with YT's actual svg. Eh. */
          transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
          border: 0;
        }
        #frame:hover .lty-playbtn {
          background-color: #f00;
          opacity: 1;
        }
        /* play button triangle */
        .lty-playbtn:before {
          content: '';
          border-style: solid;
          border-width: 11px 0 11px 19px;
          border-color: transparent transparent transparent #fff;
        }
        .lty-playbtn,
        .lty-playbtn:before {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate3d(-50%, -50%, 0);
        }
        /* Post-click styles */
        .lyt-activated {
          cursor: unset;
        }
        .lyt-activated::before,
        .lyt-activated .lty-playbtn {
          display: none;
        }
      </style>
      <div id="frame">
        <button class="lty-playbtn"></button>
      </div>
    `;
    this.__domRefFrame = this.shadowRoot.querySelector('#frame');
    this.__domRefPlayButton = this.shadowRoot.querySelector('.lty-playbtn');
  }

  setupComponent() {
    // Gotta encode the untrusted value
    // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-2---attribute-escape-before-inserting-untrusted-data-into-html-common-attributes
    this.videoId = encodeURIComponent(this.getAttribute( 'videoid' ));
    this.videoTitle = this.getAttribute('videotitle') || 'Video';
    this.videoPlay = this.getAttribute( 'videoplay' ) || 'Play';

    // when set, this comes in as an empty string; when not set, undefined
    this.autoLoad = this.getAttribute( 'autoload' ) === '' ? true : false;

    /**
     * Lo, the youtube placeholder image!  (aka the thumbnail, poster image, etc)
     * There is much internet debate on the reliability of thumbnail URLs. Weak consensus is that you
     * cannot rely on anything and have to use the YouTube Data API.
     *
     * amp-youtube also eschews using the API, so they just try sddefault with a hqdefault fallback:
     *   https://github.com/ampproject/amphtml/blob/6039a6317325a8589586e72e4f98c047dbcbf7ba/extensions/amp-youtube/0.1/amp-youtube.js#L498-L537
     * For now I'm gonna go with this confident (lol) assersion: https://stackoverflow.com/a/20542029, though I'll use `i.ytimg` to optimize for origin reuse.
     *
     * Worth noting that sddefault is _higher_ resolution than hqdefault. Naming is hard. ;)
     * From my own testing, it appears that hqdefault is ALWAYS there sddefault is missing for ~10% of videos
     *
     * TODO: Do the sddefault->hqdefault fallback
     *       - When doing this, apply referrerpolicy (https://github.com/ampproject/amphtml/pull/3940)
     * TODO: Consider using webp if supported, falling back to jpg
     */
    this.posterUrl = `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
    // Warm the connection for the poster image
    LiteYTEmbed.addPrefetch('preload', this.posterUrl, 'image');
    // TODO: support dynamically setting the attribute via attributeChangedCallback
    this.__domRefFrame.style.backgroundImage = `url("${this.posterUrl}")`;
    this.__domRefPlayButton.setAttribute('aria-label', `${this.videoPlay}: ${this.videoTitle}`);
    this.setAttribute( 'title', `${this.videoPlay}: ${this.videoTitle}` );

    // fire up the intersection observer
    if (this.autoLoad) {
      this.__initIntersectionObserver();
    }
  }

  /**
   * Lifecycle method that we use to listen for attribute changes to period
   * @param {*} name
   * @param {*} oldVal
   * @param {*} newVal
   */
  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case 'videoid': {
        if (oldVal !== newVal) {
          this.setupComponent();

          // if we have a previous iframe, remove it and the activated class
          if (this.__domRefFrame.classList.contains('lyt-activated')) {
            this.__domRefFrame.classList.remove('lyt-activated');
            this.shadowRoot.querySelector('iframe').remove();
          }
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Setup the Intersection Observer to load the iframe when scrolled into view
   * @private
   */
  __initIntersectionObserver () {
    if (
      ('IntersectionObserver' in window) &&
      ('IntersectionObserverEntry' in window)
    ) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0
      }

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.__iframeLoaded) {
            LiteYTEmbed.warmConnections();
            this.addIframe();
            observer.unobserve(this);
          }
        });
      }, options);

      observer.observe(this);
    }
  }

  /**
   * Add a <link rel={preload | preconnect} ...> to the head
   */
  static addPrefetch(kind, url, as) {
    const linkElem = document.createElement('link');
    linkElem.rel = kind;
    linkElem.href = url;
    if (as) {
      linkElem.as = as;
    }
    linkElem.crossorigin = true;
    document.head.append(linkElem);
  }

  /**
   * Begin preconnecting to warm up the iframe load
   * Since the embed's netwok requests load within its iframe,
   *   preload/prefetch'ing them outside the iframe will only cause double-downloads.
   * So, the best we can do is warm up a few connections to origins that are in the critical path.
   *
   * Maybe `<link rel=preload as=document>` would work, but it's unsupported: http://crbug.com/593267
   * But TBH, I don't think it'll happen soon with Site Isolation and split caches adding serious complexity.
   */
  static warmConnections() {
    if (LiteYTEmbed.preconnected) return;
    // The iframe document and most of its subresources come right off youtube.com
    LiteYTEmbed.addPrefetch('preconnect', 'https://www.youtube.com');
    // The botguard script is fetched off from google.com
    LiteYTEmbed.addPrefetch('preconnect', 'https://www.google.com');
    // Not certain if these ad related domains are in the critical path. Could verify with domain-specific throttling.
    LiteYTEmbed.addPrefetch(
      'preconnect',
      'https://googleads.g.doubleclick.net',
    );
    LiteYTEmbed.addPrefetch('preconnect', 'https://static.doubleclick.net');
    LiteYTEmbed.preconnected = true;
  }

  addIframe() {
    // https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#rule-2---attribute-escape-before-inserting-untrusted-data-into-html-common-attributes
    const escapedVideoId = encodeURIComponent(this.videoId);
    const iframeHTML = `
<iframe frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen
  src="https://www.youtube.com/embed/${escapedVideoId}?autoplay=1"
></iframe>`;
    this.__domRefFrame.insertAdjacentHTML('beforeend', iframeHTML);
    this.__domRefFrame.classList.add( 'lyt-activated' );
    this.__iframeLoaded = true;
  }
}
// Register custom element
customElements.define('lite-youtube', LiteYTEmbed);
