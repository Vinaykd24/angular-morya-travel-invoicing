import { Routes } from '@angular/router';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { ViewInvoiceComponent } from './components/view-invoice/view-invoice.component';

export const routes: Routes = [
  { path: 'invoice', component: InvoiceComponent },
  { path: 'invoicelist', component: InvoiceListComponent },
  { path: 'invoice/:id', component: ViewInvoiceComponent },
];
