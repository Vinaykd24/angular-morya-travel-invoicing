import { Routes } from '@angular/router';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { ViewInvoiceComponent } from './components/view-invoice/view-invoice.component';

export const routes: Routes = [
  { path: '', component: InvoiceComponent },
  { path: 'invoice-list', component: InvoiceListComponent },
  { path: 'invoice/:id', component: ViewInvoiceComponent },
];
