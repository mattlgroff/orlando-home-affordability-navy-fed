/*
To calculate the monthly mortgage payment, we need to use a formula. We can create another utility function for this.

The formula to calculate a monthly mortgage payment is:

javascript
Copy code
PMT = P[r(1+r)^n]/[(1+r)^n-1]
Where:

P is the principal loan amount.
r is the monthly interest rate, divided by 100 (the annual rate), divided by 12.
n is the number of months (the loan term in years, times 12).
*/
export function calculateMonthlyMortgagePayment(principal: number, annualRate: number, termMonths: number): number {
    const monthlyRate = annualRate / 100 / 12;

    // This formula is for calculating the monthly payment of a fixed rate mortgage
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    const rawPayment = principal * (numerator / denominator);

    return Math.ceil(rawPayment); // Round up to the nearest dollar
}
