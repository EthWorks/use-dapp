import { expect } from 'chai';
import { BrowserContext, chromium, Page } from 'playwright';
import waitForExpect from 'wait-for-expect';
import { MetaMask, metamaskChromeArgs as args } from './metamask';
import { baseUrl, headless, slowMo } from './utils';
import { addPageDiagnostics } from './utils/pageDiagnostics';

[chromium].forEach((browserType) => {
  describe(`Browser: ${browserType.name()} with Metamask`, () => {
    let page: Page
    let context: BrowserContext
    let metamask: MetaMask

    const resetBrowserContext = async () => {
      if (page) await page.close()
      if (context) await context.close()

      context = await browserType.launchPersistentContext('', { headless, slowMo, args })

      await waitForExpect(() => {
        expect(context.pages().length).to.be.equal(2)
      })
      const metamaskPage = context.pages()[1] // Metamask opens a new page automatically after installation.
      metamask = new MetaMask(metamaskPage)
      await metamask.activate()
      page = await context.newPage()
      addPageDiagnostics(page)
    }

    before(resetBrowserContext)
    // after(() => context?.close())

    before(async () => { // Connect Metamask to the app.
      await page.goto(`${baseUrl}balance`)
      await page.click('xpath=//button[contains(text(), "Connect")]')
      await waitForExpect(() => {
        expect(context.pages().length).to.be.equal(4)
      })
      const popupPage = context.pages()[3]
      await popupPage.click('xpath=//button[contains(text(), "Next")]')
      await popupPage.click('xpath=//button[contains(text(), "Connect")]')

    })

    describe('Balance', () => {
      it('Reads the ETH2 staking contract and account balance', async () => {
        await page.goto(`${baseUrl}balance`)
  
        await waitForExpect(async () => {
          expect(await page.isVisible('xpath=//span[contains(text(), "ETH2 staking contract holds:")]')).to.be.true
        })

        await waitForExpect(async () => {
          expect(await page.isVisible('xpath=//span[contains(text(), "Account:")]')).to.be.true
          expect(await page.isVisible('xpath=//span[contains(text(), "Ether balance:")]')).to.be.true
        })
      })
    })
  })
})
