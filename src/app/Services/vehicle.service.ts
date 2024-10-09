import { inject, Injectable, signal } from '@angular/core';
import { Invoice, UpdatedInvoice, VehicleRate } from '../models/common.models';
import { BehaviorSubject, from, map, Observable, tap } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  docData,
  DocumentData,
  Firestore,
  getDocs,
  QuerySnapshot,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private invoicesListSignal = signal<Invoice[]>([]);
  private invoiceListSubject$ = new BehaviorSubject<Invoice[]>([]);
  private firestore: Firestore = inject(Firestore);
  private invoiceCollection = collection(this.firestore, 'invoices');
  private extraHourCost = 0;
  constructor() {}

  // Define the vehicle rates for each city
  private vehicleRates: { [city: string]: VehicleRate[] } = {
    Pune: [
      {
        vehicle: 'Cresta',
        baseRate: 2500,
        maxKm: 100,
        extraKmRate: 80,
        extraHrRate: 200,
      },
      {
        vehicle: 'Innova',
        baseRate: 3000,
        maxKm: 100,
        extraKmRate: 100,
        extraHrRate: 200,
      },
      {
        vehicle: 'Swift Desire',
        baseRate: 2000,
        maxKm: 100,
        extraKmRate: 70,
        extraHrRate: 200,
      },
    ],
    Delhi: [
      {
        vehicle: 'Cresta',
        baseRate: 2700,
        maxKm: 100,
        extraKmRate: 90,
        extraHrRate: 200,
      },
      {
        vehicle: 'Innova',
        baseRate: 3200,
        maxKm: 100,
        extraKmRate: 110,
        extraHrRate: 200,
      },
      {
        vehicle: 'Swift Desire',
        baseRate: 2100,
        maxKm: 100,
        extraKmRate: 75,
        extraHrRate: 200,
      },
    ],
    Nashik: [
      {
        vehicle: 'Cresta',
        baseRate: 2400,
        maxKm: 100,
        extraKmRate: 85,
        extraHrRate: 200,
      },
      {
        vehicle: 'Innova',
        baseRate: 3100,
        maxKm: 100,
        extraKmRate: 105,
        extraHrRate: 200,
      },
      {
        vehicle: 'Swift Desire',
        baseRate: 2050,
        maxKm: 100,
        extraKmRate: 72,
        extraHrRate: 200,
      },
    ],
  };

  private invoices: Invoice[] = [];

  getVehicleRatesForCity(city: string): VehicleRate[] {
    return this.vehicleRates[city] || [];
  }

  calculateTotalHours(
    startDate: Date,
    endDate: Date,
    startHour: string,
    endHour: string
  ): number {
    if (startDate && endDate && startHour && endHour) {
      const start = new Date(startDate);
      start.setHours(parseInt(startHour), 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(parseInt(endHour), 0, 0, 0);

      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const roundedHours = Math.ceil(diffHours);
      return roundedHours;
    } else {
      return 0;
    }
  }

  calculateTotalCost(
    vehicle: string,
    city: string,
    startKms: number,
    endKms: number,
    parkingCharges: number,
    tollCharges: number,
    startTime: string,
    endTime: string,
    driverName: string,
    vechicleNumber: string,
    driverNightAllowance: number,
    pickUpDate: Date,
    pickUpTime: string,
    dropDate: Date,
    dropTime: string,
    invoiceNumber: number
  ): number {
    const totalKms = endKms - startKms;
    let totalExtraHrsCost = 0;
    let totalExtraCharges = 0;
    let totalExtraKmCharges = 0;
    const rateConfig = this.vehicleRates[city].find(
      (v) => v.vehicle === vehicle
    );
    let cost = 0;

    if (rateConfig) {
      // Calculate the cost for kilometers
      if (totalKms <= rateConfig.maxKm) {
        cost = rateConfig.baseRate;
      } else {
        totalExtraKmCharges =
          (totalKms - rateConfig.maxKm) * rateConfig.extraKmRate;
        cost = rateConfig.baseRate + totalExtraKmCharges;
      }
    }

    // Add parking, toll and driverNightAllowance charges
    totalExtraCharges = parkingCharges + tollCharges;
    cost += totalExtraCharges + driverNightAllowance;

    // Calculate time difference
    let hoursDiff = this.calculateTotalHours(
      pickUpDate,
      dropDate,
      pickUpTime,
      dropTime
    );

    if (hoursDiff < 0) {
      hoursDiff += 24; // Handle overnight case
    }

    const totalHours = Math.ceil(hoursDiff);
    const defaultHours = 8;
    const extraHourRate = rateConfig?.extraHrRate ? rateConfig.extraHrRate : 0;
    let extraHours = 0;

    // Add extra hour charges after 8 hours
    if (totalHours > defaultHours) {
      extraHours = totalHours - defaultHours;
      totalExtraHrsCost = extraHours * extraHourRate;
      cost += totalExtraHrsCost;
    }
    const updatedInvoice: UpdatedInvoice = {
      defaultCost: rateConfig?.baseRate ? rateConfig?.baseRate : 0,
      invoiceNumber: invoiceNumber,
      vehicleNo: vechicleNumber,
      model: vehicle,
      pickupDate: pickUpDate,
      pickupTime: pickUpTime,
      dropTime,
      dropDate,
      driverName,
      startingKms: startKms,
      endingKms: endKms,
      totalKms,
      totalExtraKmsCost: totalExtraKmCharges,
      driverAllowance: driverNightAllowance,
      totalCost: cost,
      totalExtraKms: rateConfig?.maxKm
        ? totalKms > rateConfig.maxKm
          ? totalKms - rateConfig.maxKm
          : totalKms
        : totalKms,
      perExtraHrsRate: rateConfig?.extraHrRate ? rateConfig.extraHrRate : 0,
      perExtraKmsRate: rateConfig?.extraKmRate ? rateConfig.extraKmRate : 0,
      totalExtraHrs: extraHours,
      totalExtraHrsCost: totalExtraHrsCost,
      city,
      totalExtraCharges,
    };
    this.addInvoiceToDb(updatedInvoice);
    return cost;
  }

  getTotalExtraHours(): number {
    return this.extraHourCost;
  }

  // Firestore operations

  addInvoiceToDb(invoice: UpdatedInvoice): Observable<string> {
    return from(addDoc(this.invoiceCollection, invoice)).pipe(
      tap((data) => console.log(data)),
      map((docRef) => docRef.id)
    );
  }

  getAllInvoicesFromDb(): Observable<UpdatedInvoice[]> {
    return from(getDocs(this.invoiceCollection)).pipe(
      map((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UpdatedInvoice)
        );
      })
    );
  }

  updateInvoiceFromDb(item: Invoice): Observable<void> {
    const { id, ...updateData } = item;
    const itemDoc = doc(this.firestore, `invoices/${id}`);
    return from(updateDoc(itemDoc, updateData));
  }

  getInvoice(id: string): Observable<UpdatedInvoice | undefined> {
    const itemDoc = doc(this.firestore, `invoices/${id}`);
    return docData(itemDoc, { idField: 'id' }).pipe(
      map((data) => (data ? (data as Invoice) : undefined))
    );
  }

  addInvoice(invoice: Invoice) {
    this.invoices.push(invoice);
    this.setInvoicesList(this.invoices);
    this.setInvoices(this.invoices);
  }

  updateInvoice(index: number, invoice: Invoice) {
    this.invoices[index] = invoice;
  }

  deleteInvoice(index: number) {
    this.invoices.splice(index, 1);
  }

  getInvoices(): Invoice[] {
    return this.invoices;
  }

  setInvoices(invoicesList: Invoice[]) {
    this.invoicesListSignal.set(invoicesList);
  }

  setInvoicesList(invoiceList: Invoice[]): void {
    this.invoiceListSubject$.next(invoiceList);
  }

  getInvoicesSignal() {
    return this.invoicesListSignal;
  }

  getInvoiceList(): Observable<Invoice[]> {
    return this.invoiceListSubject$.asObservable();
  }
}
