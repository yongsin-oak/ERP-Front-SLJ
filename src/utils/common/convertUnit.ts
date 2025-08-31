export const convertUnit = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  const conversionRates: { [key: string]: number } = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    oz: 0.0283495,
    l: 1,
    ml: 0.001,
    gal: 3.78541,
    qt: 0.946353,
    pt: 0.473176,
    cup: 0.236588,
    tbsp: 0.0147868,
    tsp: 0.00492892,
  };

  if (!conversionRates[fromUnit] || !conversionRates[toUnit]) {
    throw new Error("Invalid unit provided");
  }

  return value * (conversionRates[fromUnit] / conversionRates[toUnit]);
};
