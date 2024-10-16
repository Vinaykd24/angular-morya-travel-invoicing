import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
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
import {
  Invoice,
  SelectType,
  UpdatedInvoice,
  VehicleRate,
} from '../../models/common.models';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { startKmsLessThanEndKms } from '../../validators/start-end-km.validator';
import {
  dropDateAfterPickUpDate,
  droptimeAfterPickUptime,
} from '../../validators/drop-date.validator';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';

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
    TextFieldModule,
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
  invoiceListFromDb$!: Observable<UpdatedInvoice[]>;
  dateTimeForm!: FormGroup;
  hours: string[] = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  dateFilter = (date: Date | null): boolean => {
    const today = new Date();
    return date ? date <= today : false;
  };

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
    'actions',
  ];
  dataSource: UpdatedInvoice[] = [];
  vehicles: SelectType[] = [
    { value: 'car-0', viewValue: 'Innova' },
    { value: 'car-01', viewValue: 'Swift Desizer' },
    { value: 'car-02', viewValue: 'Tata Indigo' },
  ];

  cities: SelectType[] = [
    { value: 'Pune', viewValue: 'Pune' },
    { value: 'Delhi', viewValue: 'Delhi' },
    { value: 'Mumbai', viewValue: 'Mumbai' },
    { value: 'Banglore', viewValue: 'Banglore' },
    { value: 'Gujrat', viewValue: 'Gujrat' },
    { value: 'Jaipur', viewValue: 'Jaipur' },
    { value: 'Hyderabad', viewValue: 'Hyderabad' },
  ];

  constructor(
    private vehicleFacade: VehicleFacadeService,
    private router: Router
  ) {
    this.vehicleForm = new FormGroup(
      {
        vehicle: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
        startKms: new FormControl(200, [
          Validators.required,
          Validators.min(0),
        ]),
        endKms: new FormControl(320, [Validators.required, Validators.min(0)]),
        pickUpDate: new FormControl(new Date(), Validators.required),
        pickUpTime: new FormControl('00', Validators.required),
        dropDate: new FormControl(new Date(), Validators.required),
        dropTime: new FormControl('00', Validators.required),
        parkingCharges: new FormControl(100, [
          Validators.required,
          Validators.min(0),
        ]),
        tollCharges: new FormControl(300, [
          Validators.required,
          Validators.min(0),
        ]),
        driverName: new FormControl(null),
        driverNightAllowance: new FormControl(null),
        custName: new FormControl(null),
        companyName: new FormControl('Valeo Ind Pvt Ltd.'),
        invoiceNumber: new FormControl(null),
        invoiceDate: new FormControl(new Date(), Validators.required),
        vehicleNumber: new FormControl(null, [
          Validators.required,
          Validators.min(8),
        ]),
        particulars: new FormControl(null),
      },
      {
        validators: [
          startKmsLessThanEndKms(),
          dropDateAfterPickUpDate(),
          droptimeAfterPickUptime(),
        ],
      }
    );
  }

  ngOnInit(): void {
    this.invoiceListFromDb$ = this.vehicleFacade.getAllInvoicesFromDb();
  }

  calculateTotalHours() {
    const startDate = this.vehicleForm.get('pickUpDate')?.value;
    const endDate = this.vehicleForm.get('dropDate')?.value;
    const startHour = this.vehicleForm.get('pickUpTime')?.value;
    const endHour = this.vehicleForm.get('dropTime')?.value;

    if (startDate && endDate && startHour && endHour) {
      const start = new Date(startDate);
      start.setHours(parseInt(startHour), 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(parseInt(endHour), 0, 0, 0);

      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const roundedHours = Math.ceil(diffHours);

      this.dateTimeForm.patchValue(
        {
          totalHours: diffHours.toFixed(2),
          roundedHours: roundedHours,
        },
        { emitEvent: false }
      );
    }
  }

  viewInvoice(id: string) {
    return this.router.navigate([`/invoice/${id}`]);
  }

  goToInvoiceList() {
    return this.router.navigate(['/invoice-list']);
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
        driverName,
        vehicleNumber,
        driverNightAllowance,
        invoiceNumber,
        pickUpDate,
        pickUpTime,
        dropDate,
        dropTime,
        custName,
        companyName,
        particulars,
        invoiceDate,
      } = this.vehicleForm.value;

      const totalCost = this.vehicleFacade.calculateTotalCost(
        vehicle,
        city,
        startKms,
        endKms,
        parkingCharges,
        tollCharges,
        driverName,
        vehicleNumber,
        driverNightAllowance,
        pickUpDate,
        pickUpTime,
        dropDate,
        dropTime,
        invoiceNumber,
        custName,
        companyName,
        particulars,
        invoiceDate
      );

      // Reset form after submission
      this.vehicleForm.reset();
      this.totalCost = null;
      this.availableVehicles = [];

      // Update the invoices list
      this.invoices = this.vehicleFacade.getInvoices();
      this.invoiceListFromDb$ = this.vehicleFacade.getAllInvoicesFromDb();
      this.goToInvoiceList();
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
}
function inject(Injector: any) {
  throw new Error('Function not implemented.');
}

function ViewChild(
  arg0: string
): (target: InvoiceComponent, propertyKey: 'autosize') => void {
  throw new Error('Function not implemented.');
}
