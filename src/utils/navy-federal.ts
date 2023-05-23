import { InterestRate } from '@deps/types';
import puppeteer from 'puppeteer-core';

export async function fetchNavyFederal(): Promise<InterestRate[]> {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.navyfederal.org/loans-cards/mortgage/mortgage-rates/conventional-fixed-rate-mortgages.html');

        const loanTerms: InterestRate[] = await page.$$eval('.table-resp tbody tr', rows => {
            return rows.map(row => {
                const columns = Array.from(row.querySelectorAll('td'));
                const term = row.querySelector('th')?.textContent?.trim() || '';
                const rate = parseFloat(columns[0]?.textContent?.replace('%', '') || '0');
                const discountPoints = parseFloat(columns[1]?.textContent || '0');

                return {
                    term: term,
                    rate: rate,
                    discountPoints: discountPoints,
                    rateWithoutDiscount: rate + discountPoints * 0.25, // Assuming each discount point reduces the rate by 0.25%
                };
            });
        });

        await browser.close();
        return loanTerms;
    } catch (err) {
        console.error(err);
        return [];
    }
}
