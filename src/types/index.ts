export enum County {
  Polk = 'Polk',
  Orange = 'Orange',
  Seminole = 'Seminole',
  Osceola = 'Osceola',
  Lake = 'Lake'
}

export interface CountyTaxRate {
  [County.Polk]: string,
  [County.Orange]: string,
  [County.Seminole]: string,
  [County.Osceola]: string,
  [County.Lake]: string
}

export interface InterestRate {
  term: string;
  rate: number;
  discountPoints: number;
  rateWithoutDiscount: number;
}