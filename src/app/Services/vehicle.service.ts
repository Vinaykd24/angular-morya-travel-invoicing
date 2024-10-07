import { inject, Injectable, signal } from '@angular/core';
import { Invoice, VehicleRate } from '../models/common.models';
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
  constructor() {}

  // Define the vehicle rates for each city
  private vehicleRates: { [city: string]: VehicleRate[] } = {
    'city-0': [
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
    'city-1': [
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
    'city-2': [
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
    vechicleNumber: string
  ): number {
    const totalKms = endKms - startKms;
    const rateConfig = this.vehicleRates[city].find(
      (v) => v.vehicle === vehicle
    );
    let cost = 0;

    if (rateConfig) {
      // Calculate the cost for kilometers
      if (totalKms <= rateConfig.maxKm) {
        cost = rateConfig.baseRate;
      } else {
        cost =
          rateConfig.baseRate +
          (totalKms - rateConfig.maxKm) * rateConfig.extraKmRate;
      }
    }

    // Add parking and toll charges
    cost += parkingCharges + tollCharges;

    // Calculate time difference
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    let hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 0) {
      hoursDiff += 24; // Handle overnight case
    }

    const totalHours = Math.ceil(hoursDiff);
    const defaultHours = 8;
    const extraHourRate = 250;

    // Add extra hour charges after 8 hours
    if (totalHours > defaultHours) {
      cost += (totalHours - defaultHours) * extraHourRate;
    }

    return cost;
  }

  // Firestore operations

  addInvoiceToDb(invoice: Invoice): Observable<string> {
    return from(addDoc(this.invoiceCollection, invoice)).pipe(
      tap((data) => console.log(data)),
      map((docRef) => docRef.id)
    );
  }

  getAllInvoicesFromDb(): Observable<Invoice[]> {
    return from(getDocs(this.invoiceCollection)).pipe(
      map((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Invoice)
        );
      })
    );
  }

  updateInvoiceFromDb(item: Invoice): Observable<void> {
    const { id, ...updateData } = item;
    const itemDoc = doc(this.firestore, `invoices/${id}`);
    return from(updateDoc(itemDoc, updateData));
  }

  getInvoice(id: string): Observable<Invoice | undefined> {
    const itemDoc = doc(this.firestore, `items/${id}`);
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
