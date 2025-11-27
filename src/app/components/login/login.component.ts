import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Debug: vérifier la valeur reçue
            console.log('📥 Frontend - Response received:', response);
            console.log('📥 Frontend - is_admin value:', response.user.is_admin, 'Type:', typeof response.user.is_admin);
            
            // Récupérer is_admin depuis la réponse - vérifier tous les cas possibles
            const isAdminValue = response.user.is_admin;
            const isAdmin = isAdminValue === true || (isAdminValue as any) === 1 || (isAdminValue as any) === '1' || Boolean(isAdminValue);
            
            console.log('✅ Frontend - Is admin?', isAdmin);
            
            if (isAdmin) {
              // Rediriger vers le dashboard si admin
              console.log('🚀 Redirecting to dashboard...');
              this.router.navigate(['/dashboard']);
            } else {
              // Afficher un message de succès pour les non-admins (sans redirection)
              console.log('ℹ️ User is not admin, showing success message');
              this.successMessage = 'Connexion réussie ! Votre compte fonctionne correctement.';
              this.errorMessage = '';
              // Réinitialiser le formulaire
              this.loginForm.reset();
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.successMessage = '';
          // Afficher uniquement les erreurs de connexion (utilisateur non trouvé, mauvais mot de passe)
          this.errorMessage = error.error?.message || 'Erreur lors de la connexion';
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

