export enum PackId {
    BASIC = "basic",
    STANDARD = "standard",
    PREMIUM = "premium",
    PRO = "pro",
    ENTERPRISE = "enterprise",
};

export type creditsPack = {
    id: PackId;
    name: string;
    label: string;
    credits: number;
    price: number;
}

export const creditsPack = [
    {
        id: PackId.BASIC,
        name: "Basic Pack",
        label: "500 credits",
        credits: 500,
        price: 500, // ₹500
    },
    {
        id: PackId.STANDARD,
        name: "Standard Pack",
        label: "1,200 credits",
        credits: 1200,
        price: 1000, // ₹1,000
    },
    {
        id: PackId.PREMIUM,
        name: "Premium Pack",
        label: "2,500 credits",
        credits: 2500,
        price: 2000, // ₹2,000
    },
    {
        id: PackId.PRO,
        name: "Professional Pack",
        label: "7,000 credits",
        credits: 7000,
        price: 5000, // ₹5,000
    },
    {
        id: PackId.ENTERPRISE,
        name: "Enterprise Pack",
        label: "15,000 credits",
        credits: 15000,
        price: 10000, // ₹10,000
    },
]

export const getCreditspack = (id: PackId) => {
    return creditsPack.find((p) => p.id === id);
}