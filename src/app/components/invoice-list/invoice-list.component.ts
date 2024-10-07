import {
  Component,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/common.models';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
  invoices!: Signal<Invoice[]>;
  invoiceList$!: Observable<Invoice[]>;
  displayedColumns: string[] = [
    'vehicle',
    'city',
    'startKms',
    'endKms',
    'parkingCharges',
    'tollCharges',
    'totalCost',
    'startTime',
    'endTime',
  ];
  dataSource: Invoice[] = [];

  constructor(private vehicleFacadeService: VehicleFacadeService) {
    this.invoiceList$ = this.vehicleFacadeService.getAllInvoicesFromDb();
  }

  ngOnInit(): void {
    this.invoices = this.vehicleFacadeService.getInvoicesListSignal();
  }
}
