require('../../lib/feature-flags')
const { getDOM, getJSON } = require('../helpers/supertest')
const enterpriseServerReleases = require('../../lib/enterprise-server-releases')
const japaneseCharacters = require('japanese-characters')

describe('featuredLinks', () => {
  jest.setTimeout(3 * 60 * 1000)

  describe('rendering', () => {
    test('non-TOC pages do not have intro links', async () => {
      const $ = await getDOM('/en/github/getting-started-with-github/set-up-git')
      expect($('.featured-links')).toHaveLength(0)
    })

    test('landing page intro links have expected properties', async () => {
      const $ = await getDOM('/en')
      const $featuredLinks = $('[data-testid=article-list] a')
      expect($featuredLinks).toHaveLength(9)
      expect($featuredLinks.eq(0).attr('href')).toBe('/en/github/getting-started-with-github/set-up-git')
      expect($featuredLinks.eq(0).children('h4').text().startsWith('Set up Git')).toBe(true)
      expect($featuredLinks.eq(0).children('p').text().startsWith('At the heart of GitHub')).toBe(true)

      expect($featuredLinks.eq(8).attr('href')).toBe('/en/github/working-with-github-pages')
      expect($featuredLinks.eq(8).children('h4').text().startsWith('GitHub Pages')).toBe(true)
      expect($featuredLinks.eq(8).children('p').text().startsWith('You can create a website')).toBe(true)
    })

    test('localized intro links link to localized pages', async () => {
      const $ = await getDOM('/ja')
      const $featuredLinks = $('.featured-links a')
      expect($featuredLinks).toHaveLength(9)
      expect($featuredLinks.eq(0).attr('href').startsWith('/ja')).toBe(true)
      expect(japaneseCharacters.presentIn($featuredLinks.eq(0).children('h4').text())).toBe(true)
      expect(japaneseCharacters.presentIn($featuredLinks.eq(0).children('p').text())).toBe(true)
    })

    test('Enterprise user intro links have expected values', async () => {
      const $ = await getDOM(`/en/enterprise/${enterpriseServerReleases.latest}/user/insights`)
      const $featuredLinks = $('[data-testid=article-list] a')
      expect($featuredLinks).toHaveLength(6)
      expect($featuredLinks.eq(0).attr('href')).toBe(`/en/enterprise-server@${enterpriseServerReleases.latest}/insights/installing-and-configuring-github-insights/about-github-insights`)
      expect($featuredLinks.eq(0).children('h4').text().startsWith('About GitHub Insights')).toBe(true)
      expect($featuredLinks.eq(0).children('p').text().startsWith('GitHub Insights provides metrics')).toBe(true)
    })

    // If any of these tests fail, check to see if the content has changed and update text if needed.
    test('product articles links respect versioning', async () => {
      const enterpriseVersionedLandingPage = `/en/enterprise-server@${enterpriseServerReleases.latest}/packages`
      const $ = await getDOM(enterpriseVersionedLandingPage)
      const $productArticlesLinks = $('[data-testid=product-articles-list] a')
      let msg = `Product article links are not rendered as expected on ${enterpriseVersionedLandingPage}`
      expect($productArticlesLinks.length, msg).toBeGreaterThan(2)

      // Confirm that the following Enterprise link IS included on this Enterprise page.
      msg = `Enterprise article link is not rendered as expected on ${enterpriseVersionedLandingPage}`
      expect($productArticlesLinks.text().includes('Working with a GitHub Packages registry'), msg).toBe(true)

      // Confirm that the following Dotcom-only links are NOT included on this Enterprise page.
      msg = `Dotcom-only article link is rendered, but should not be, on ${enterpriseVersionedLandingPage}`
      expect($productArticlesLinks.text().includes('Enabling improved container support with the Container registry')).toBe(false)
      expect($productArticlesLinks.text().includes('Migrating to the Container registry from the Docker registry'), msg).toBe(false)
    })
  })

  describe('context.page object', () => {
    test('returns modified array of links', async () => {
      const gettingStartedLinks = await getJSON('/en?json=featuredLinks.gettingStarted')
      const expectedFirstLink = {
        href: '/en/github/getting-started-with-github/set-up-git',
        title: 'Set up Git'
      }
      expect(gettingStartedLinks[0].href).toEqual(expectedFirstLink.href)
      expect(gettingStartedLinks[0].title).toEqual(expectedFirstLink.title)
      expect(gettingStartedLinks[0].intro.startsWith('At the heart of GitHub')).toBe(true)
    })

    test('returns raw array of links on the page object', async () => {
      const rawGettingStartedLinks = await getJSON('/en?json=page.featuredLinks.gettingStarted')
      expect(rawGettingStartedLinks[0]).toEqual('/github/getting-started-with-github/set-up-git')
    })
  })
})
