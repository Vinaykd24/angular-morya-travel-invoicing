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
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private invoicesListSignal = signal<Invoice[]>([]);
  private invoiceListSubject$ = new BehaviorSubject<Invoice[]>([]);
  private firestore: Firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private invoiceCollection = collection(this.firestore, 'invoices');
  private extraHourCost = 0;
  constructor() {}

  // Define the vehicle rates for each city
  private vehicleRates: { [city: string]: VehicleRate[] } = {
    Pune: [
      {
        vehicle: 'Innova',
        baseRate: 3000,
        maxKm: 80,
        extraKmRate: 250,
        extraHrRate: 20,
      },
      {
        vehicle: 'Crysta',
        baseRate: 3300,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 22,
      },
      {
        vehicle: 'Sedan',
        baseRate: 1900,
        maxKm: 80,
        extraKmRate: 150,
        extraHrRate: 15,
      },
    ],
    Mumbai: [
      {
        vehicle: 'Innova',
        baseRate: 3500,
        maxKm: 80,
        extraKmRate: 250,
        extraHrRate: 20,
      },
      {
        vehicle: 'Crysta',
        baseRate: 4000,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 22,
      },
      {
        vehicle: 'Sedan',
        baseRate: 2400,
        maxKm: 80,
        extraKmRate: 180,
        extraHrRate: 16,
      },
    ],
    Delhi: [
      {
        vehicle: 'Crysta',
        baseRate: 3500,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 23,
      },
      {
        vehicle: 'Sedan',
        baseRate: 2200,
        maxKm: 80,
        extraKmRate: 175,
        extraHrRate: 15,
      },
    ],
    Banglore: [
      {
        vehicle: 'Crysta',
        baseRate: 3500,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 23,
      },
      {
        vehicle: 'Sedan',
        baseRate: 2400,
        maxKm: 80,
        extraKmRate: 180,
        extraHrRate: 15,
      },
    ],
    Baroda: [
      {
        vehicle: 'Crysta',
        baseRate: 4500,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 23,
      },
      {
        vehicle: 'Sedan',
        baseRate: 2400,
        maxKm: 80,
        extraKmRate: 180,
        extraHrRate: 15,
      },
    ],
    Jaipur: [
      {
        vehicle: 'Crysta',
        baseRate: 4500,
        maxKm: 80,
        extraKmRate: 300,
        extraHrRate: 23,
      },
      {
        vehicle: 'Sedan',
        baseRate: 2600,
        maxKm: 80,
        extraKmRate: 180,
        extraHrRate: 16,
      },
    ],
    Hyderabad: [
      {
        vehicle: 'Crysta',
        baseRate: 3000,
        maxKm: 80,
        extraKmRate: 180,
        extraHrRate: 16,
      },
    ],
  };

  private invoices: Invoice[] = [];

  getVehicleRatesForCity(city: string): VehicleRate[] {
    return this.vehicleRates[city] || [];
  }

  calculateTotalHours(
    startDate: string,
    endDate: string,
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
    pickUpDate: string,
    pickUpTime: string,
    dropDate: string,
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
      createdDate: new Date(),
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
      tap((docRef) => {
        this.snackBar.open('Invoice Generated Successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }),
      map((docRef) => docRef.id)
    );
  }

  getAllInvoicesFromDb(): Observable<UpdatedInvoice[]> {
    return from(getDocs(this.invoiceCollection)).pipe(
      map((snapshot: QuerySnapshot<DocumentData>) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data() as UpdatedInvoice;

          // Convert Firestore timestamps to JavaScript Date objects for pickupDate and dropDate
          const pickupDate = data.pickupDate
            ? new Date((data.pickupDate as any).seconds * 1000)
            : null;
          const dropDate = data.dropDate
            ? new Date((data.dropDate as any).seconds * 1000)
            : null;

          // Return the updated invoice with replaced pickupDate and dropDate, and the id
          return {
            id: doc.id, // Ensure id is included
            ...data, // Spread the rest of the data
            pickupDate, // Replace pickupDate with the Date object
            dropDate, // Replace dropDate with the Date object
          };
        });
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
      map((data) => {
        if (!data) {
          return undefined;
        }

        const updatedData = data as UpdatedInvoice;

        // Convert Firestore timestamps to JavaScript Date objects
        const pickupDate = updatedData.pickupDate
          ? new Date((updatedData.pickupDate as any).seconds * 1000)
          : null;
        const dropDate = updatedData.dropDate
          ? new Date((updatedData.dropDate as any).seconds * 1000)
          : null;

        // Return the updated invoice with replaced date values and id
        return {
          id, // Ensure the id is included
          ...updatedData, // Spread existing invoice data
          pickupDate, // Replace pickupDate
          dropDate, // Replace dropDate
        } as UpdatedInvoice;
      })
    );
  }

  formatDate(
    date: { seconds: number; nanoseconds: number } | string | number
  ): Date {
    let dateObject: Date;

    if (typeof date === 'object' && 'seconds' in date) {
      // Convert Firestore timestamp to JavaScript Date
      dateObject = new Date(date.seconds * 1000);
    } else {
      dateObject = new Date(date);
    }

    return dateObject;
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
