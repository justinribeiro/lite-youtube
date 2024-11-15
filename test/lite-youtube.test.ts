/* eslint-disable import/no-duplicates */
import { html, fixture, expect } from '@open-wc/testing';
import { elementUpdated, fixtureCleanup } from '@open-wc/testing-helpers';
import { setViewport } from '@web/test-runner-commands';

import { LiteYTEmbed } from '../lite-youtube.js';
import '../lite-youtube.js';

const baseTemplate = html`<lite-youtube
  videoTitle="Test Me"
  videoid="guJLfqTFfIw"
></lite-youtube>`;

const aspectRatioTemplate = html`<lite-youtube
  style="--lite-youtube-aspect-ratio: 2 / 3;"
  videoTitle="Test Me"
  videoid="guJLfqTFfIw"
></lite-youtube>`;

const frameShadowTemplate = html`<lite-youtube
  style="--lite-youtube-frame-shadow-visible: no;"
  videoTitle="Test Me"
  videoid="guJLfqTFfIw"
></lite-youtube>`;

describe('<lite-youtube>', () => {
  afterEach(() => {
    fixtureCleanup();
  });

  it('attr sets the videoid', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoId).to.equal('guJLfqTFfIw');
  });

  it('dynamic setter for videoid', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    el.videoId = 'tests';
    expect(el.videoId).to.equal('tests');
  });

  it('videoTitle set/get', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoTitle).to.equal('Test Me');
    el.videoTitle = 'Test Me Again';
    expect(el.videoTitle).to.equal('Test Me Again');
    expect(el.title).to.equal('Play: Test Me Again');
  });

  it('videoPlay set/get', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoPlay).to.equal('Play');
    el.videoPlay = 'Run';
    expect(el.videoPlay).to.equal('Run');
    expect(el.title).to.equal('Run: Test Me');
  });

  it('videoTitle set/get attr', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoTitle).to.equal('Test Me');
    el.setAttribute('videotitle', 'Test Me Again');
    expect(el.videoTitle).to.equal('Test Me Again');
    expect(el.title).to.equal('Play: Test Me Again');
  });

  it('videoPlay set/get attr', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoPlay).to.equal('Play');
    el.setAttribute('videoplay', 'Run');
    expect(el.videoPlay).to.equal('Run');
    expect(el.title).to.equal('Run: Test Me');
  });

  it('clicking button should load iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null" title="Test Me"></iframe>',
    );
  });

  it('switching videoid should reset iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null" title="Test Me"></iframe>',
    );
    el.videoId = 'VZ9VSypxhEQ';
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/VZ9VSypxhEQ?autoplay=1&amp;start=0&amp;null" title="Test Me"></iframe>',
    );
  });

  it('switching playlistid should reset iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null" title="Test Me"></iframe>',
    );
    el.playlistId = 'PL-G5r6j4GptH5JTveoLTVqpp7w2oc27Q9';
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/?listType=playlist&amp;list=PL-G5r6j4GptH5JTveoLTVqpp7w2oc27Q9&amp;autoplay=1&amp;start=0&amp;null" title="Test Me"></iframe>',
    );
  });

  it('autoload should inject iframe and warm', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" autoLoad></lite-youtube>`,
    );
    // this is a cheeky test by counting the test runner + the warm injector
    // TODO write a better observer
    expect(document.head.querySelectorAll('link').length).to.be.equal(1);
  });

  it('autoPause should inject iframe and warm', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" autoPause></lite-youtube>`,
    );
    // this is a cheeky test by counting the test runner + the warm injector
    // TODO write a better observer
    expect(document.head.querySelectorAll('link').length).to.be.equal(7);
  });

  it('nocookie attr should change iframe url target', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" nocookie></lite-youtube>`,
    );
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe credentialless frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube-nocookie.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null" title="Video"></iframe>',
    );
  });

  it('posterQuality prop should update on set', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube
        videoid="guJLfqTFfIw"
        posterQuality="mqdefault"
      ></lite-youtube>`,
    );
    expect(el.posterQuality).to.be.equal('mqdefault');

    const fallback = el.shadowRoot?.querySelector<HTMLImageElement>(
      '#fallbackPlaceholder',
    );
    const webp = el.shadowRoot?.querySelector('#webpPlaceholder');
    const jpeg = el.shadowRoot?.querySelector('#jpegPlaceholder');

    const checkStringOne = 'https://i.ytimg.com/vi/guJLfqTFfIw/mqdefault.jpg';

    expect(fallback?.src).to.be.equal(checkStringOne);
  });

  it('posterLoading attr default', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube
        videoid="guJLfqTFfIw"
        posterQuality="mqdefault"
      ></lite-youtube>`,
    );
    expect(el.posterLoading).to.be.equal('lazy');

    const fallback = el.shadowRoot?.querySelector<HTMLImageElement>(
      '#fallbackPlaceholder',
    );

    expect(fallback?.loading).to.be.equal('lazy');
  });

  it('posterLoading attr set should stick to img', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube
        videoid="guJLfqTFfIw"
        posterQuality="mqdefault"
        posterloading="eager"
      ></lite-youtube>`,
    );
    expect(el.posterLoading).to.be.equal('eager');

    const fallback = el.shadowRoot?.querySelector<HTMLImageElement>(
      '#fallbackPlaceholder',
    );

    expect(fallback?.loading).to.be.equal('eager');
  });

  it('YouTube Short desktop check', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" short></lite-youtube>`,
    );
    expect(el['isYouTubeShort']()).to.be.equal(false);
  });

  it('YouTube Short mobile check', async () => {
    setViewport({ width: 360, height: 640 });
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" short></lite-youtube>`,
    );
    el.click();
    expect(el['isYouTubeShort']()).to.be.equal(true);
  });

  it('check for nonce injector', async () => {
    window.liteYouTubeNonce = 'test-abcd1234';
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>`,
    );
    expect(
      el.shadowRoot.querySelector('style')?.getAttribute('nonce'),
    ).to.equal(window.liteYouTubeNonce);
  });

  it('check global preconnect state', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
        <lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
        <lite-youtube videoid="guJLfqTFfIw"></lite-youtube>`,
    );
    expect(window.liteYouTubeIsPreconnected).to.be.true;
    expect(
      document.querySelectorAll('head > link[rel=preconnect]').length,
    ).to.equal(6);
  });

  it('is correct aspect-ratio override', async () => {
    const el = await fixture<LiteYTEmbed>(aspectRatioTemplate);
    await elementUpdated(el);
    const aspectRatio = getComputedStyle(el.shadowRoot.host)
      .getPropertyValue('--aspect-ratio')
      .trim();
    await expect(aspectRatio).to.equal('2 / 3');
  });

  it('is correct frame shadow override', async () => {
    const el = await fixture<LiteYTEmbed>(frameShadowTemplate);
    await elementUpdated(el);
    const frameShadowVisible = getComputedStyle(el.shadowRoot.host)
      .getPropertyValue('--frame-shadow-visible')
      .trim();
    await expect(frameShadowVisible).to.equal('no');
  });

  it('is valid A11y via aXe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    await expect(el).shadowDom.to.be.accessible();
  });
});
