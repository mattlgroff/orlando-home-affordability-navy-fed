// Based off data from Clovered in 2022 provide our best guess for homeowners insurance being very conservative. https://clovered.com/homeowners-insurance/florida/orlando/
export function estimateHomeInsurance(homePrice: number): number {
    const inflationRate = 1.15; // 15% inflation

    // Constants from the 2022 table
    const baseHousePrice1 = 150000;
    const baseInsuranceCost1 = 2328;

    const baseHousePrice2 = 300000;
    const baseInsuranceCost2 = 4038;

    const baseHousePrice3 = 450000;
    const baseInsuranceCost3 = 5396;

    // Calculate the insurance cost per house price dollar for 2022
    const insuranceRate1 = baseInsuranceCost1 / baseHousePrice1;
    const insuranceRate2 = baseInsuranceCost2 / baseHousePrice2;
    const insuranceRate3 = baseInsuranceCost3 / baseHousePrice3;

    // Average the insurance cost rates
    const averageInsuranceRate = (insuranceRate1 + insuranceRate2 + insuranceRate3) / 3;

    // Adjust for inflation and apply to the home price
    const insuranceCost = homePrice * averageInsuranceRate * inflationRate;

    // Round up to the next dollar
    return Math.ceil(insuranceCost);
}
