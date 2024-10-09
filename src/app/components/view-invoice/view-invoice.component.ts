import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehicleFacadeService } from '../../Services/vehicle-facade.service';
import { Invoice, UpdatedInvoice } from '../../models/common.models';
import { Observable, of } from 'rxjs';
import { IndianRupeesToWordsPipe } from '../../pipes/indian-rupees-to-words.pipe';

@Component({
  selector: 'app-view-invoice',
  standalone: true,
  imports: [CommonModule, IndianRupeesToWordsPipe],
  templateUrl: './view-invoice.component.html',
  styleUrl: './view-invoice.component.scss',
})
export class ViewInvoiceComponent implements OnInit {
  id!: string | null;
  selectedInvoice$!: Observable<UpdatedInvoice | undefined> | Observable<null>;
  constructor(
    private route: ActivatedRoute,
    private vehicleFacade: VehicleFacadeService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.selectedInvoice$ = this.id
      ? this.vehicleFacade.getInvoice(this.id)
      : of(null);
  }
}
