import Head from 'next/head';
import { useState, useMemo } from 'react';
import { calculatePropertyTax } from '../utils/property-tax';
import { County, InterestRate } from '@deps/types';
import { estimateHomeInsurance } from '../utils/homeowners-insurance';
import { yearlyToMonthly } from '../utils/yearly-to-monthly';
import { fetchInterestRates } from '../utils';
import { Redis } from 'ioredis';
import { calculateMonthlyMortgagePayment } from '../utils/monthly-mortgage-payment';

export default function Home({ interestRatesFromNavyFederal }: { interestRatesFromNavyFederal: InterestRate[] }) {
    const [homePrice, setHomePrice] = useState(350000);

    const [loanTerm, setLoanTerm] = useState(
        interestRatesFromNavyFederal?.find(term => term.term.includes('30') && !term.term.includes('Jumbo'))?.term ||
            interestRatesFromNavyFederal[0].term
    );

    const discountPoints = useMemo(() => {
        return interestRatesFromNavyFederal?.find(d => d.term === loanTerm)?.discountPoints;
    }, [interestRatesFromNavyFederal, loanTerm]);

    const discountPointCost = useMemo(() => {
        if (discountPoints) {
            return Math.ceil((homePrice * discountPoints) / 100);
        }

        return 0;
    }, [homePrice, discountPoints]);

    const [county, setCounty] = useState<County>(County.Orange);

    const propertyTax = useMemo(() => calculatePropertyTax(homePrice, county), [homePrice, county]);

    const homeInsurance = useMemo(() => estimateHomeInsurance(homePrice), [homePrice]);

    const [downPaymentPercent, setDownPaymentPercent] = useState(20);

    const downPayment = useMemo(() => Math.ceil((downPaymentPercent / 100) * homePrice), [homePrice, downPaymentPercent]);

    const loanAmount = useMemo(() => homePrice - downPayment, [homePrice, downPayment]);

    const closingCosts = useMemo(() => Math.ceil(homePrice * 0.05), [homePrice]);

    const totalCashNeeded = useMemo(() => downPayment + closingCosts + discountPointCost, [downPayment, closingCosts, discountPointCost]);

    const mortgageRate = useMemo(() => {
        return interestRatesFromNavyFederal?.find(d => d.term === loanTerm)?.rateWithoutDiscount;
    }, [interestRatesFromNavyFederal, loanTerm]);

    const mortgagePayment = useMemo(() => {
        if (!mortgageRate) return null;

        const loanTermMonths = parseInt(loanTerm) * 12; // Convert loan term to months
        return calculateMonthlyMortgagePayment(loanAmount, mortgageRate, loanTermMonths);
    }, [loanAmount, mortgageRate, loanTerm]);

    const totalPITI = useMemo(() => {
        if (!mortgagePayment || !propertyTax || !homeInsurance) return null;

        const monthlyPropertyTax = yearlyToMonthly(propertyTax);
        const monthlyHomeInsurance = yearlyToMonthly(homeInsurance);

        return Math.ceil(mortgagePayment + monthlyPropertyTax + monthlyHomeInsurance);
    }, [mortgagePayment, propertyTax, homeInsurance]);

    return (
        <>
            <Head>
                <title>Orlando Home Loan Calculator for Navy Federal Member</title>
            </Head>
            <div className="h-screen overflow-scroll">
                <h1 className="block text-2xl m-4 text-center">Orlando Home Loan Calculator for Navy Federal Members</h1>

                <div className="flex flex-col md:flex-row md:justify-around p-10">
                    <div className="flex flex-col">
                        <label className="block mb-2 font-bold">
                            Home Price
                            <input
                                name="home-price"
                                className="block mb-4 p-2 border rounded w-64"
                                type="text"
                                value={homePrice.toLocaleString()} // add thousand separators
                                onChange={e => {
                                    if (e.target.value === '' || e.target.value == '0') {
                                        return setHomePrice(0);
                                    }

                                    setHomePrice(parseInt(e.target.value.replace(/,/g, '')));
                                }}
                            />
                        </label>

                        <label className="block mb-2 font-bold">
                            Down Payment Percentage
                            <input
                                name="down-payment"
                                className="block mb-4 p-2 border rounded w-64"
                                type="number" // consider using "number" type instead of "text"
                                min="5"
                                value={downPaymentPercent}
                                onChange={e => {
                                    if (e.target.value === '' || e.target.value == '0') {
                                        return setDownPaymentPercent(0);
                                    }

                                    setDownPaymentPercent(parseInt(e.target.value));
                                }}
                            />
                        </label>

                        <label className="block mb-2 font-bold">Loan Term</label>
                        <select
                            className="block mb-4 p-2 border rounded w-64 bg-white"
                            value={loanTerm}
                            onChange={e => setLoanTerm(e.target.value)}
                        >
                            {interestRatesFromNavyFederal.map(({ term }) => (
                                <option key={term}>{term}</option>
                            ))}
                        </select>

                        <label className="block mb-2 font-bold">County</label>
                        <select
                            className="block mb-4 p-2 border rounded w-64 bg-white"
                            value={county}
                            onChange={e => setCounty(e.target.value as County)}
                        >
                            <option>Polk</option>
                            <option>Orange</option>
                            <option>Seminole</option>
                            <option>Osceola</option>
                            <option>Lake</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-xl mb-2 font-bold">Rates</h2>
                        <div className="mb-2">Mortgage Interested Rate: {mortgageRate}%</div>
                        <h2 className="text-xl mb-2 font-bold">Estimated Costs</h2>
                        <div className="mb-2">Mortgage Payment: ${mortgagePayment?.toLocaleString()} /month</div>
                        <div className="mb-2">Property Tax: ${yearlyToMonthly(propertyTax).toLocaleString()} /month</div>
                        <div className="mb-2">Home Insurance: ${yearlyToMonthly(homeInsurance).toLocaleString()} /month</div>
                        <div className="mb-2 text-green-600 font-bold">Total PITI: ${totalPITI?.toLocaleString()} /month</div>

                        <div>
                            <h2 className="text-xl mb-2 font-bold">Cash Needed</h2>
                            <div className="mb-2">Down Payment: ${downPayment.toLocaleString()}</div>
                            <div className="mb-2">Closing Costs (Estimated 5%): ${closingCosts.toLocaleString()}</div>
                            <div className="mb-2">
                                Discount Points ({discountPoints}): ${discountPointCost.toLocaleString()}
                            </div>
                            <div className="mb-2 text-red-600 font-bold">Total Cash Needed: ${totalCashNeeded.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps() {
    const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

    const interestRatesFromNavyFederal = await fetchInterestRates(redis);

    return { props: { interestRatesFromNavyFederal } };
}
