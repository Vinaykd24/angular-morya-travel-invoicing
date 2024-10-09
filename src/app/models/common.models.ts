export interface SelectType {
  value: string;
  viewValue: string;
}

export interface VehicleRate {
  vehicle?: string;
  baseRate: number;
  maxKm: number;
  extraKmRate: number;
  extraHrRate: number;
}

export interface Invoice {
  id?: string;
  vehicle: string;
  city: string;
  startKms: number;
  endKms: number;
  parkingCharges: number;
  tollCharges: number;
  totalCost: number;
  invoiceNumber: number;
  startTime: string;
  endTime: string;
  driverName?: string;
  driverNightAllowance?: number;
  vehicleNumber: string;
  totalExtraKm?: number;
  pickUpDate: Date;
  pickUpTime: string;
  dropDate: Date;
  dropTime: string;
}

export interface UpdatedInvoice {
  id?: string;
  totalCost: number;
  invoiceNumber: number;
  custName?: string;
  companyName?: string;
  vehicleNo: string;
  model: string;
  pickupDate: Date;
  pickupTime: string;
  dropDate: Date;
  dropTime: string;
  driverName?: string;
  startingKms: number;
  endingKms: number;
  totalKms: number;
  totalExtraKms: number;
  totalExtraKmsCost: number;
  defaultCost: number;
  driverAllowance?: number;
  perExtraKmsRate: number;
  perExtraHrsRate: number;
  totalExtraHrs: number;
  totalExtraHrsCost: number;
  city: string;
  totalExtraCharges: number;
}
