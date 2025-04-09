export enum PackId {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
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
        id: PackId.SMALL,
        name: "Small Pack",
        label: "1,000 credits",
        credits: 1000,
        price: 299,
    },
    {
        id: PackId.MEDIUM,
        name: "Medium Pack",
        label: "2,500 credits",
        credits: 2500,
        price: 399,
    },
    {
        id: PackId.LARGE,
        name: "Large Pack",
        label: "5,000 credits",
        credits: 5000,
        price: 499,
    },
]

export const getCreditspack = (id: PackId) => {
    return creditsPack.find((p) => p.id === id);
}