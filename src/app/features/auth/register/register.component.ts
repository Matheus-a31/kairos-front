import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: [email, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.authService.login({ email: this.registerForm.value.email, password: this.registerForm.value.password }).subscribe({
          next: () => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: () => {
            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            const queryParams: any = { registered: true };
            if (returnUrl) queryParams.returnUrl = returnUrl;
            
            this.router.navigate(['/login'], { queryParams });
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
      }
    });
  }
}
