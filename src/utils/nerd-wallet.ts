import puppeteer from 'puppeteer';

interface CreditRange {
  value: string;
  min: string;
  max: string;
  rate?: string;
}

// This function is not actually called but I spent a lot of time making it work so I'm not removing it.
export async function scrapeNerdWallet(): Promise<CreditRange[]> {
  try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setViewport({ width: 1000, height: 800 }); // Set viewport
      await page.goto('https://www.nerdwallet.com/mortgages/how-much-house-can-i-afford/calculate-affordability');

      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds for any modals

      // Attempt to close modal if it exists
      if ((await page.$('[aria-label="Close dialog"]')) !== null) {
          await page.click('[aria-label="Close dialog"]');
      }

      // Press Escape key to close any possible pop-ups
      await page.keyboard.press('Escape');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait another 3 seconds for any changes

      const options: string[] = await page.$$eval('.interest-rate-control-credit-score-select-option', options =>
          options.map(option => option.querySelector('.interest-rate-control-credit-score-select-option-value')?.textContent || '')
      );

      const categories: CreditRange[] = [];
      for (let i = 0; i < options.length; i++) {
          await page.click(`.interest-rate-control-credit-score-select-option:nth-child(${i + 1})`);
          await new Promise(r => setTimeout(r, 2000)); // Wait for the page to update

          // Check the specific elements of the page after each click
          const min = await page.$eval('.interest-rate-control-credit-score-select-option-min', el => el.textContent || '');
          const max = await page.$eval('.interest-rate-control-credit-score-select-option-max', el => el.textContent || '');
          const rate = await page.$eval('.interest-rate-control-method h3 span', span => span.textContent);
          categories.push({
              value: options[i],
              min: min,
              max: max,
              rate: parseFloat(rate?.replace('%', '') || '0').toFixed(3),
          });
      }

      await browser.close();
      return categories;
  } catch (err) {
      console.error(err);
      return [];
  }
}
