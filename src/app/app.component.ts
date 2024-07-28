import { Component } from '@angular/core';
import {
  provideRouter,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCoffee, faEdit } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { routes } from './app.routes';
import { bootstrapApplication } from '@angular/platform-browser';

class Invoice {
  constructor(
    _id: number,
    _customer: string,
    _date: string,
    _amount: number,
    _status: string
  ) {
    this.id = _id;
    this.customer = _customer;
    this.date = _date;
    this.amount = _amount;
    this.status = _status;
  }
  id: number;
  customer: string;
  date: string;
  amount: number;
  status: string;
}

class Customer {
  constructor(
    _id: number,
    _name: string,
    _email: string,
    _phone: string,
    _address: string
  ) {
    this.id = _id;
    this.name = _name;
    this.email = _email;
    this.phone = _phone;
    this.address = _address;
  }
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

enum ResourceType {
  Customer,
  Invoice,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    HttpClientModule,
    MatTableModule,
    FontAwesomeModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {
  constructor(private _http: HttpClient, private router: Router) {
    this.get(this.currentRes);
  }

  resourceType = ResourceType;
  title = 'admin-UI';
  displayedColumns: Map<ResourceType, string[]> = new Map([
    [ResourceType.Customer, ['id', 'name', 'phone', 'email', 'address']],
    [ResourceType.Invoice, ['id', 'customer', 'date', 'amount', 'status']],
  ]);

  tableData: any[] = [];
  currentRes = ResourceType.Customer;
  faEdit = faEdit;
  readonly dialog = inject(MatDialog);

  getData(resourceType: ResourceType) {
    this.get(resourceType);
    return this.tableData;
  }
  add() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    this.displayedColumns.get(this.currentRes)?.forEach((val) => {
      if (val != 'id') {
        dialogRef.componentInstance.data.set(val, undefined);
        dialogRef.componentInstance.mode = Mode.Add;
        dialogRef.componentInstance.type = this.currentRes;
      }
    });

    dialogRef.afterClosed().subscribe((_) => {
      this.get(this.currentRes);
    });
  }

  edit(id: number) {
    console.log(id);
    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    this.displayedColumns.get(this.currentRes)?.forEach((val) => {
      if (val != 'id') {
        let temp_obj = this.tableData.find((in_val) => in_val.id == id);
        let obj =
          this.currentRes == ResourceType.Invoice
            ? (temp_obj as Invoice)
            : (temp_obj as Customer);
        let obj_map = new Map(Object.entries(obj));

        dialogRef.componentInstance.mode = Mode.Edit;
        dialogRef.componentInstance.type = this.currentRes;
        dialogRef.componentInstance.id = id;

        dialogRef.componentInstance.data.set(val, obj_map.get(val));
      }
    });

    dialogRef.afterClosed().subscribe((_) => {
      this.get(this.currentRes);
    });
  }

  get(resourceType: ResourceType) {
    this.getResources(resourceType).subscribe({
      next: (res) => {
        if (res != null) {
          this.tableData = JSON.parse(JSON.stringify(res));
        }
      },
      error: (err) => {
        if (err.status == 401 || err.status == 0) {
          this.router.navigate(['/login']);
        }
      },
      complete: () => console.info('Get resources completed'),
    });
  }

  public getResources(resourceType: ResourceType): Observable<object> {
    if (resourceType == ResourceType.Customer) {
      return this._http.get('http://localhost:8000/api/resources/customers', {
        withCredentials: true,
      });
    } else {
      return this._http.get('http://localhost:8000/api/resources/invoices', {
        withCredentials: true,
      });
    }
  }
}

enum Mode {
  Add,
  Edit,
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content.html',
  standalone: true,
  styleUrl: './app.component.scss',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentExampleDialog {
  constructor(private _http: HttpClient) {}

  data = new Map<string, any>();
  type: ResourceType = ResourceType.Invoice;
  mode: Mode = Mode.Add;
  id: number = -1;

  saveState(): Observable<string> {
    if (this.mode == Mode.Add) {
      return this._http.post(
        'http://localhost:8000/api/resources/' +
          ResourceType[this.type].toString().toLowerCase() +
          's',
        JSON.stringify(Object.fromEntries(this.data)),
        {
          responseType: 'text',
          withCredentials: true,
        }
      );
    } else {
      return this._http.put(
        'http://localhost:8000/api/resources/' +
          ResourceType[this.type].toString().toLowerCase() +
          's/' +
          this.id,
        JSON.stringify(Object.fromEntries(this.data)),
        {
          responseType: 'text',
          withCredentials: true,
        }
      );
    }
  }

  apply() {
    this.saveState().subscribe({
      next: (res) => {
        if (res != null) {
          console.log(res);
        }
      },
      error: (err) => {
        alert(JSON.stringify(err.error));
      },
      complete: () => console.info('GetInvoices completed'),
    });
  }

  asIsOrder(a: any, b: any) {
    return 1;
  }

  change(key: string, value: any) {
    this.data.set(key, value);
  }
}
