import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, RouterOutlet, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  data: Map<string, any> = new Map([
    ['username', undefined],
    ['password', undefined],
  ]);
  constructor(private _http: HttpClient, private router: Router) {}

  saveState(): Observable<string> {
    return this._http.post(
      'http://localhost:8000/api/login',
      JSON.stringify(Object.fromEntries(this.data)),
      {
        responseType: 'text',
      }
    );
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
      complete: () => {
        console.info('Login completed');
        this.router.navigate(['/']);
      },
    });
  }

  change(key: string, value: any) {
    this.data.set(key, value);
  }

  asIsOrder(a: any, b: any) {
    return 1;
  }
}
