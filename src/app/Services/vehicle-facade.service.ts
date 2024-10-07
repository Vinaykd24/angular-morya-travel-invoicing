import { Injectable } from '@angular/core';
import { VehicleService } from './vehicle.service';
import { Invoice } from '../models/common.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VehicleFacadeService {
  constructor(private vehicleService: VehicleService) {}

  // Get vehicle rates for a given city
  getVehiclesForCity(city: string) {
    return this.vehicleService.getVehicleRatesForCity(city);
  }

  // Calculate total cost based on the inputs
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
  ) {
    return this.vehicleService.calculateTotalCost(
      vehicle,
      city,
      startKms,
      endKms,
      parkingCharges,
      tollCharges,
      startTime,
      endTime,
      driverName,
      vechicleNumber
    );
  }

  // Add an invoice
  addInvoice(invoice: Invoice) {
    this.vehicleService.addInvoice(invoice);
  }

  addInvoiceToDb(invoice: Invoice) {
    this.vehicleService.addInvoiceToDb(invoice);
  }

  getAllInvoicesFromDb(): Observable<Invoice[]> {
    return this.vehicleService.getAllInvoicesFromDb();
  }

  updateInvoiceFromDb(invoice: Invoice) {
    return this.vehicleService.updateInvoiceFromDb(invoice);
  }

  getInvoice(id: string) {
    return this.vehicleService.getInvoice(id);
  }

  // Update an invoice
  updateInvoice(index: number, invoice: Invoice) {
    this.vehicleService.updateInvoice(index, invoice);
  }

  // Delete an invoice
  deleteInvoice(index: number) {
    this.vehicleService.deleteInvoice(index);
  }

  // Get all invoices
  getInvoices(): Invoice[] {
    return this.vehicleService.getInvoices();
  }

  setInvoiceList(invoiceList: Invoice[]) {
    this.vehicleService.setInvoices(invoiceList);
  }

  setInvoiceListSubject(invoiceList: Invoice[]): void {
    this.vehicleService.setInvoicesList(invoiceList);
  }

  getInvoicesListSignal() {
    return this.vehicleService.getInvoicesSignal();
  }

  getInvoiceList(): Observable<Invoice[]> {
    return this.vehicleService.getInvoiceList();
  }
}
