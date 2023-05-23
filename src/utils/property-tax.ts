import { County, CountyTaxRate } from '@deps/types';

// Calculate Yearly Property Tax for Orlando Area Counties
export function calculatePropertyTax(price: number, county: County): number {
    const averageCountyTaxRate: CountyTaxRate = {
        [County.Polk]: '0.970',
        [County.Orange]: '1.020',
        [County.Seminole]: '0.870',
        [County.Osceola]: '1.060',
        [County.Lake]: '0.980',
    };

    const taxRate = parseFloat(averageCountyTaxRate[county]);
    
    return price * taxRate / 100;
}
