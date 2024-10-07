import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Invoice, SelectType, VehicleRate } from '../../models/common.models';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-invoice',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatTableModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
})
export class InvoiceComponent implements OnInit {
  vehicleForm!: FormGroup;
  totalCost: number | null = null;
  invoices: Invoice[] = [];
  editIndex: number | null = null;
  availableVehicles: VehicleRate[] = [];
  invoiceList$!: Observable<Invoice[]>;
  invoiceListFromDb$!: Observable<Invoice[]>;
  dateFilter = (date: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date ? date <= today : false;
  };
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
    'actions',
  ];
  dataSource: Invoice[] = [];
  vehicles: SelectType[] = [
    { value: 'car-0', viewValue: 'Innova' },
    { value: 'car-01', viewValue: 'Swift Desizer' },
    { value: 'car-02', viewValue: 'Tata Indigo' },
  ];

  cities: SelectType[] = [
    { value: 'city-0', viewValue: 'Pune' },
    { value: 'city-1', viewValue: 'Delhi' },
    { value: 'city-2', viewValue: 'Nashik' },
  ];

  // Vehicle rates configuration
  vehicleRates: { [key: string]: VehicleRate } = {
    'car-0': { baseRate: 2500, maxKm: 100, extraKmRate: 80, extraHrRate: 200 }, // Base rate Rs 2500 for first 100 km, Rs 80 for each extra km
    'car-01': {
      baseRate: 3000,
      maxKm: 100,
      extraKmRate: 100,
      extraHrRate: 250,
    }, // Base rate Rs 3000 for first 100 km, Rs 100 for each extra km
    'car-02': { baseRate: 2000, maxKm: 100, extraKmRate: 70, extraHrRate: 300 }, // Base rate Rs 2000 for first 100 km, Rs 70 for each extra km
  };

  constructor(private vehicleFacade: VehicleFacadeService) {
    this.vehicleForm = new FormGroup({
      vehicle: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      startKms: new FormControl(200, [Validators.required, Validators.min(0)]),
      endKms: new FormControl(320, [Validators.required, Validators.min(0)]),
      startTime: new FormControl(null, Validators.required),
      endTime: new FormControl(null, Validators.required),
      parkingCharges: new FormControl(100, [
        Validators.required,
        Validators.min(0),
      ]),
      tollCharges: new FormControl(300, [
        Validators.required,
        Validators.min(0),
      ]),
      driverName: new FormControl(null),
      vehicleNumber: new FormControl('MH123333', [
        Validators.required,
        Validators.min(8),
      ]),
    });

    // Load initial invoices
    // this.invoices = this.vehicleFacade.getInvoices();
    // this.dataSource = this.invoices;
  }

  ngOnInit(): void {
    this.invoiceListFromDb$ = this.vehicleFacade.getAllInvoicesFromDb();
  }

  onCityChange() {
    const city = this.vehicleForm.value.city;
    if (city) {
      this.availableVehicles = this.vehicleFacade.getVehiclesForCity(city);
      this.vehicleForm.get('vehicle')?.setValue(null); // Reset vehicle when city changes
    }
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const {
        vehicle,
        city,
        startKms,
        endKms,
        parkingCharges,
        tollCharges,
        startTime,
        endTime,
        driverName,
        vehicleNumber,
      } = this.vehicleForm.value;

      const totalCost = this.vehicleFacade.calculateTotalCost(
        vehicle,
        city,
        startKms,
        endKms,
        parkingCharges,
        tollCharges,
        startTime,
        endTime,
        driverName,
        vehicleNumber
      );

      const invoice: Invoice = {
        vehicle,
        city,
        startKms,
        endKms,
        parkingCharges,
        tollCharges,
        totalCost,
        startTime,
        endTime,
        driverName,
        vehicleNumber,
      };

      if (this.editIndex !== null) {
        this.vehicleFacade.updateInvoice(this.editIndex, invoice);
        this.editIndex = null;
      } else {
        this.vehicleFacade.addInvoice(invoice);
        this.vehicleFacade.addInvoiceToDb(invoice);
      }

      // Reset form after submission
      this.vehicleForm.reset();
      this.totalCost = null;
      this.availableVehicles = [];

      // Update the invoices list
      this.invoices = this.vehicleFacade.getInvoices();
      this.invoiceListFromDb$ = this.vehicleFacade.getAllInvoicesFromDb();
      // this.dataSource = this.invoices;
    }
  }

  onInvoiceEdit(invoice: Invoice) {
    // const invoice = this.vehicleFacade.getInvoices()[index];
    // this.editIndex = index;
    // Populate the city first so the vehicle dropdown is updated
    this.vehicleForm.get('city')?.setValue(invoice.city);

    this.vehicleForm.setValue({
      vehicle: invoice.vehicle,
      city: invoice.city,
      startKms: invoice.startKms,
      endKms: invoice.endKms,
      startTime: invoice.startTime,
      endTime: invoice.endTime,
      parkingCharges: invoice.parkingCharges,
      tollCharges: invoice.tollCharges,
      driverName: invoice.driverName,
      vehicleNumber: invoice.vehicleNumber,
    });

    this.vehicleFacade.updateInvoiceFromDb(invoice);
    // this.onCityChange();
  }

  onEdit(index: number) {
    const invoice = this.vehicleFacade.getInvoices()[index];
    this.editIndex = index;
    // Populate the city first so the vehicle dropdown is updated
    this.vehicleForm.get('city')?.setValue(invoice.city);

    this.vehicleForm.setValue({
      vehicle: invoice.vehicle,
      city: invoice.city,
      startKms: invoice.startKms,
      endKms: invoice.endKms,
      startTime: invoice.startTime,
      endTime: invoice.endTime,
      parkingCharges: invoice.parkingCharges,
      tollCharges: invoice.tollCharges,
    });
    this.onCityChange();
  }

  onDelete(index: number) {
    this.vehicleFacade.deleteInvoice(index);
  }

  getInvoices() {
    return this.vehicleFacade.getInvoices();
  }

  // onEdit(index: number) {
  //   const invoice = this.invoices[index];
  //   this.editIndex = index;
  //   this.vehicleForm.setValue({
  //     vehicle: invoice.vehicle,
  //     city: invoice.city,
  //     startKms: invoice.startKms,
  //     endKms: invoice.endKms,
  //     startTime: invoice.startTime,
  //     endTime: invoice.endTime,
  //     parkingCharges: invoice.parkingCharges,
  //     tollCharges: invoice.tollCharges,
  //   });
  // }

  // onDelete(index: number) {
  //   this.invoices.splice(index, 1);
  // }
}
