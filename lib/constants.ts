import { generateDummyPassword } from "./utils";

export const isProductionEnvironment = process.env.NODE_ENV === 'production';

export const INDUSTRIES = [
    "Make up artists",
    "Barbershop",
    "Restaurants",
    "Loyalty cards",
    "Non profit",
    "Personal training",
    "Car rental companies",
    "Shopify",
    "Money Transfer",
    "Maid Services"
];

type CountType = {
    plan: number;
    count: number;
}

const MAX_COUNT: Array<CountType> = [{
    plan: 0,
    count: 500,
}, {
    plan: 1,
    count: 2500,
}, {
    plan: 3,
    count: 1000000,
}];

export const getPlanLimits = async () => {
    return 10000000;
}

export const DUMMY_PASSWORD = generateDummyPassword();

export const guestRegex = /^guest-\d+$/;

export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
