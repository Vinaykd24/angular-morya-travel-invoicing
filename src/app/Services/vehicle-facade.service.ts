import { Injectable } from '@angular/core';
import { VehicleService } from './vehicle.service';
import { Invoice, UpdatedInvoice } from '../models/common.models';
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
    driverName: string,
    vechicleNumber: string,
    driverNightAllowance: number,
    pickUpDate: string,
    pickUpTime: string,
    dropDate: string,
    dropTime: string,
    invoiceNumber: number,
    custName: string,
    companyName: string,
    particulars: string
  ) {
    return this.vehicleService.calculateTotalCost(
      vehicle,
      city,
      startKms,
      endKms,
      parkingCharges,
      tollCharges,
      driverName,
      vechicleNumber,
      driverNightAllowance,
      pickUpDate,
      pickUpTime,
      dropDate,
      dropTime,
      invoiceNumber,
      custName,
      companyName,
      particulars
    );
  }

  getTotalExtraHours() {
    return this.vehicleService.getTotalExtraHours();
  }

  // Add an invoice
  addInvoice(invoice: Invoice) {
    this.vehicleService.addInvoice(invoice);
  }

  addInvoiceToDb(invoice: UpdatedInvoice) {
    this.vehicleService.addInvoiceToDb(invoice);
  }

  getAllInvoicesFromDb(): Observable<UpdatedInvoice[]> {
    return this.vehicleService.getAllInvoicesFromDb();
  }

  updateInvoiceFromDb(invoice: Invoice) {
    return this.vehicleService.updateInvoiceFromDb(invoice);
  }

  deleteInvoiceFromDb(id: string) {
    return this.vehicleService.deleteInvoiceFromDb(id);
  }

  showSnackBar(message: string) {
    this.vehicleService.showSnackBar(message);
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
