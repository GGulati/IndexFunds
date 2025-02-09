declare module 'country-data' {
  export const countries: {
    all: Array<{
      alpha2: string;
      alpha3: string;
      currencies: string[];
      name: string;
    }>;
  };

  export const currencies: {
    [code: string]: {
      name: string;
      symbol: string;
      decimals: number;
    };
  };
} 