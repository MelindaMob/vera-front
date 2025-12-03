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
  logoPath = '/logo.png';
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

      console.log('🔐 Tentative de connexion avec:', credentials.email);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Réponse de connexion:', response);
          
          if (response.success) {
            const isAdmin = Boolean(response.user.is_admin);
            const userName = response.user.username || response.user.email;
            
            if (isAdmin) {
              this.successMessage = `🔐 Connexion ADMIN réussie ! Bienvenue ${userName} (Administrateur)`;
              console.log('✅ Connexion ADMIN réussie, token stocké:', !!this.authService.getToken());
            } else {
              this.successMessage = `✅ Connexion réussie ! Bienvenue ${userName} (Utilisateur)`;
              console.log('✅ Connexion UTILISATEUR réussie, token stocké:', !!this.authService.getToken());
            }
            
            // Rediriger vers la page d'accueil après 3 secondes pour voir le message
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de la connexion';
            console.error('❌ Connexion échouée:', response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.successMessage = '';
          
          // Gestion des différents types d'erreurs
          if (error.status === 401) {
            this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else {
            this.errorMessage = error.error?.message || 'Erreur lors de la connexion';
          }
          
          console.error('❌ Erreur de connexion:', error);
          console.error('❌ Détails:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

