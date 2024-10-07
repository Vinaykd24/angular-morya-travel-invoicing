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
  startTime: string;
  endTime: string;
  driverName?: string;
  vehicleNumber: string;
}
