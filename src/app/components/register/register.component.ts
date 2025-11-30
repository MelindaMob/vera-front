import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const userData = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        username: this.registerForm.value.username
      };

      console.log('📝 Tentative d\'inscription pour:', userData.email);

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Réponse d\'inscription:', response);
          
          if (response.success) {
            this.successMessage = `Inscription réussie ! Bienvenue ${response.user?.username || userData.email}`;
            console.log('✅ Inscription réussie pour:', response.user);
            
            // Rediriger vers la page de connexion après 2 secondes
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Erreur lors de l\'inscription';
            console.error('❌ Inscription échouée:', response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.successMessage = '';
          
          // Gestion des différents types d'erreurs
          if (error.status === 409) {
            this.errorMessage = error.error?.message || 'Cet email est déjà utilisé';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Données invalides. Vérifiez vos informations.';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else {
            this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
          }
          
          console.error('❌ Erreur d\'inscription:', error);
          console.error('❌ Détails:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
    }
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get username() {
    return this.registerForm.get('username');
  }
}

