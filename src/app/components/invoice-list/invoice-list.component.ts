import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { CommonModule } from '@angular/common';
import { UpdatedInvoice } from '../../models/common.models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit, AfterViewInit {
  invoiceList$!: Observable<UpdatedInvoice[]>;
  dataSource = new MatTableDataSource<UpdatedInvoice>();
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
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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
  }

  loadInvoices() {
    this.vehicleFacadeService.getAllInvoicesFromDb().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // Force a sort by invoiceNumber after data is loaded
          this.sort.sort({
            id: 'invoiceNumber',
            start: 'desc',
            disableClear: false,
          });
          this.dataSource.sort = this.sort;
        });
      },
      error: (error) => {
        console.error('Error fetching invoices:', error);
      },
    });
  }

  viewInvoice(id: string) {
    return this.router.navigate([`/invoice/${id}`]);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
