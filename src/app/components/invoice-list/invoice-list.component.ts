import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { CommonModule } from '@angular/common';
import { UpdatedInvoice } from '../../models/common.models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

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
    'model',
    'city',
    'startingKms',
    'endingKms',
    'pickupDate',
    'dropDate',
    'pickupTime',
    'dropTime',
    'totalCost',
  ];

  constructor(
    private vehicleFacadeService: VehicleFacadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    // Set up the paginator after the view has been initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInvoices() {
    this.vehicleFacadeService.getAllInvoicesFromDb().subscribe(
      (data) => {
        this.dataSource.data = data;
        // Ensure the paginator is set after data is loaded
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      (error) => {
        console.error('Error fetching invoices:', error);
      }
    );
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
