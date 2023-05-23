import { InterestRate } from '@deps/types';
import { load } from 'cheerio';

export async function fetchNavyFederal(): Promise<InterestRate[]> {
    try {
        const response = await fetch(
            'https://www.navyfederal.org/loans-cards/mortgage/mortgage-rates/conventional-fixed-rate-mortgages.html'
        );
        const body = await response.text();

        const $ = load(body);
        const loanTerms: InterestRate[] = [];

        $('.table-resp tbody tr').each((_, row) => {
            const columns = $(row).find('td');
            const term = $(row).find('th').text().trim();
            const rate = parseFloat(columns.eq(0).text().replace('%', ''));
            const discountPoints = parseFloat(columns.eq(1).text());

            loanTerms.push({
                term: term,
                rate: rate,
                discountPoints: discountPoints,
                rateWithoutDiscount: rate + discountPoints * 0.25, // Assuming each discount point reduces the rate by 0.25%
            });
        });

        return loanTerms;
    } catch (err) {
        console.error(err);
        return [];
    }
}
