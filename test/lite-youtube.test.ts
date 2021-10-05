/* eslint-disable import/no-duplicates */
import { html, fixture, expect } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';

import { LiteYTEmbed } from '../lite-youtube.js';
import '../lite-youtube.js';

const baseTemplate = html`<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>`;

describe('<lite-youtube>', () => {
  it('attr sets the videoid', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.videoId).to.equal('guJLfqTFfIw');
  });

  it('dynamic setter for videoid', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    el.videoId = 'tests';
    expect(el.videoId).to.equal('tests');
  });

  it('clicking button should load iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null"></iframe>'
    );
  });

  it('switching videoid should reset iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null"></iframe>'
    );
    el.videoId = 'VZ9VSypxhEQ';
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/VZ9VSypxhEQ?autoplay=1&amp;start=0&amp;null"></iframe>'
    );
  });

  it('switching playlistid should reset iframe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null"></iframe>'
    );
    el.playlistId = 'PL-G5r6j4GptH5JTveoLTVqpp7w2oc27Q9';
    expect(el.shadowRoot.querySelector('iframe')).to.be.null;
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube.com/embed/?listType=playlist&amp;list=PL-G5r6j4GptH5JTveoLTVqpp7w2oc27Q9&amp;autoplay=1&amp;start=0&amp;null"></iframe>'
    );
  });

  it('autoload should inject iframe and warm', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" autoLoad></lite-youtube>`
    );
    // this is a cheeky test by counting the test runner + the warm injector
    // TODO write a better observer
    expect(document.head.querySelectorAll('link').length).to.be.equal(10);
  });

  it('nocookie attr should change iframe url target', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube videoid="guJLfqTFfIw" nocookie></lite-youtube>`
    );
    el.click();
    expect(el.shadowRoot.querySelector('iframe')).dom.to.equal(
      '<iframe frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" src="https://www.youtube-nocookie.com/embed/guJLfqTFfIw?autoplay=1&amp;start=0&amp;null"></iframe>'
    );
  });

  it('posterQuality prop should update on set', async () => {
    const el = await fixture<LiteYTEmbed>(
      html`<lite-youtube
        videoid="guJLfqTFfIw"
        posterQuality="mqdefault"
      ></lite-youtube>`
    );
    expect(el.posterQuality).to.be.equal('mqdefault');

    const fallback = el.shadowRoot?.querySelector<HTMLImageElement>(
      '#fallbackPlaceholder'
    );
    const webp = el.shadowRoot?.querySelector('#webpPlaceholder');
    const jpeg = el.shadowRoot?.querySelector('#jpegPlaceholder');

    const checkStringOne = 'https://i.ytimg.com/vi/guJLfqTFfIw/mqdefault.jpg';

    expect(fallback?.src).to.be.equal(checkStringOne);
  });

  it('is valid A11y via aXe', async () => {
    const el = await fixture<LiteYTEmbed>(baseTemplate);
    await expect(el).shadowDom.to.be.accessible();
  });
});
