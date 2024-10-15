import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { CommonModule } from '@angular/common';
import { UpdatedInvoice } from '../../models/common.models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit, AfterViewInit {
  private invoicesSubject = new BehaviorSubject<UpdatedInvoice[]>([]);
  invoices$ = this.invoicesSubject.asObservable();

  dataSource: MatTableDataSource<UpdatedInvoice>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'invoiceNumber',
    'model',
    'city',
    'startingKms',
    'endingKms',
    'pickupDate',
    'dropDate',
    'pickupTime',
    'dropTime',
    'totalCost',
    'actions',
  ];

  constructor(
    private vehicleFacadeService: VehicleFacadeService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<UpdatedInvoice>([]);
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    this.invoices$.subscribe((invoices) => {
      this.dataSource.data = invoices;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    this.dataSource.sortingDataAccessor = (
      item: UpdatedInvoice,
      property: string
    ) => {
      switch (property) {
        case 'invoiceNumber':
          const invoiceNum = item.invoiceNumber;
          return invoiceNum !== undefined ? Number(invoiceNum) : -1;
        default:
          return (item as any)[property];
      }
    };

    // Initialize sort
    this.sort.sort({ id: 'invoiceNumber', start: 'desc', disableClear: false });
  }

  loadInvoices() {
    this.vehicleFacadeService
      .getAllInvoicesFromDb()
      .pipe(
        tap((invoices) => {
          this.invoicesSubject.next(invoices);
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error fetching invoices:', error);
        },
      });
  }

  viewInvoice(id: string) {
    return this.router.navigate([`/invoice/${id}`]);
  }

  deleteInvoice(id: string) {
    this.vehicleFacadeService
      .deleteInvoiceFromDb(id)
      .pipe(switchMap(() => this.vehicleFacadeService.getAllInvoicesFromDb()))
      .subscribe({
        next: (updatedInvoices) => {
          this.invoicesSubject.next(updatedInvoices);
          this.vehicleFacadeService.showSnackBar(
            'Invoice deleted successfully'
          );
        },
        error: (error) => {
          console.error('Error deleting invoice:', error);
          this.vehicleFacadeService.showSnackBar('Error deleting invoice');
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
