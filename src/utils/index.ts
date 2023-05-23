import Redis from 'ioredis';
import { fetchNavyFederal } from './navy-federal';

export async function fetchInterestRates(redis: Redis | null) {
    try {
        if (redis) {
            let cachedData: any = await redis.get('navyFederalInterestRates');
            if (cachedData) {
                const data = JSON.parse(cachedData);

                if (data.length > 0) {
                    return data;
                }
            }

            const freshData = await fetchNavyFederal();
            await redis.set('navyFederalInterestRates', JSON.stringify(freshData), 'EX', 1 * 60 * 60);

            return freshData;
        }
    } catch (err) {
        console.error(err);
        return {
            source: 'error',
            data: [],
        };
    }
}
