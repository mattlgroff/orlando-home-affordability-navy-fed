// function to take a yearly amount and convert it to monthly (round up to the nearest dollar for better estimation
export const yearlyToMonthly = (yearly: number) => Math.ceil(yearly / 12);
