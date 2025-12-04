import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VeraChatService, Message } from '../../services/vera-chat.service';
import { AuthService } from '../../services/auth.service';

interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

interface Expert {
  name: string;
  title: string;
  photo: string;
}

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: 'landing.html',
  styleUrls: ['./landing.css']
})
export class LandingPage implements OnInit {
  searchQuery: string = '';
  displayedQuery: string = ''; // Question affichée (séparée de l'input)
  isSearching: boolean = false;
  showResults: boolean = false;
  veraResponse: string = '';
  veraResult: any = null;
  sidebarCollapsed: boolean = true; // Cachée par défaut sur mobile
  conversationHistory: any[] = [];
  conversationContext: string = ''; // Contexte pour la mémoire
  currentConversationId: string | null = null; // ID de conversation Vera
  messages: Array<{sender: 'user' | 'vera', content: string, timestamp: Date}> = []; // Tous les messages
  selectedImage: File | null = null;
  selectedVideo: File | null = null;
  mediaUrls: string[] = []; // URLs détectées dans le message
  showAttachMenu: boolean = false; // Menu d'attachement
  
  // Authentification
  isAuthenticated: any;
  currentUser: any;

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  constructor(
    private veraChatService: VeraChatService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialiser les signaux d'authentification
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUser;
    
    // Vérifier l'authentification au chargement de la page
    // Si on a un token, considérer comme authentifié
    const token = this.authService.getToken();
    if (token && !this.authService.isAuthenticated()) {
      this.authService.isAuthenticated.set(true);
      // Vérifier le profil en arrière-plan pour mettre à jour les infos
      this.authService.getProfile().subscribe({
        next: (response) => {
          if (response.success && response.user) {
            this.authService.currentUser.set(response.user);
            // Charger l'historique de l'utilisateur connecté
            this.loadUserHistory();
          }
        },
        error: () => {
          // En cas d'erreur, ne pas déconnecter si on a un token (peut être erreur réseau)
        }
      });
    } else {
      // Charger l'historique depuis localStorage (guest ou user)
      this.loadUserHistory();
    }
  }

  teamMembers: TeamMember[] = [
    {
      name: 'Sophie Martin',
      role: 'Directrice Générale',
      photo: '/team/sophie.jpg'
    },
    {
      name: 'Thomas Dubois',
      role: 'Lead Developer',
      photo: '/team/thomas.jpg'
    },
    {
      name: 'Marie Chen',
      role: 'UX Designer',
      photo: '/team/marie.jpg'
    },
    {
      name: 'Lucas Bernard',
      role: 'AI Specialist',
      photo: '/team/lucas.jpg'
    },
    {
      name: 'Emma Rousseau',
      role: 'Content Manager',
      photo: '/team/emma.jpg'
    },
    {
      name: 'Alexandre Petit',
      role: 'Data Scientist',
      photo: '/team/alexandre.jpg'
    }
  ];

  experts: Expert[] = [
    {
      name: 'Dr. Laurent Moreau',
      title: 'Chercheur en désinformation, Sciences Po',
      photo: '/experts/laurent.jpg'
    },
    {
      name: 'Prof. Claire Dubois',
      title: 'Journalisme & Fact-checking, Sorbonne',
      photo: '/experts/claire.jpg'
    },
    {
      name: 'Jean-François Petit',
      title: 'Expert IA éthique, INRIA',
      photo: '/experts/jean.jpg'
    },
    {
      name: 'Dr. Sarah Cohen',
      title: 'Psychologie cognitive & média',
      photo: '/experts/sarah.jpg'
    },
    {
      name: 'Michel Leroy',
      title: 'Directeur AFP Factuel',
      photo: '/experts/michel.jpg'
    }
  ];

  faqs: FAQ[] = [
    {
      question: 'Comment Vera vérifie-t-elle les informations ?',
      answer: 'Vera utilise une intelligence artificielle avancée connectée à plus de 400 sources fiables incluant 150+ sites de fact-checking certifiés (IFCN, EFCSN) et 250+ médias reconnus. Elle croise les informations, analyse le contexte et fournit des sources vérifiables pour chaque réponse.',
      isOpen: false
    },
    {
      question: 'Est-ce que Vera est gratuite ?',
      answer: 'Oui, Vera est entièrement gratuite. Notre mission est de rendre la vérification des faits accessible à tous pour lutter contre la désinformation.',
      isOpen: false
    },
    {
      question: 'Mes données sont-elles protégées ?',
      answer: 'Absolument. Nous ne conservons pas vos conversations et ne partageons aucune donnée personnelle avec des tiers. La confidentialité est notre priorité.',
      isOpen: false
    },
    {
      question: 'Puis-je utiliser Vera sans application ?',
      answer: 'Oui ! C\'est justement notre force. Vera fonctionne par téléphone et WhatsApp, sans avoir besoin de télécharger une application ou de créer un compte.',
      isOpen: false
    },
    {
      question: 'Quels types de questions puis-je poser ?',
      answer: 'Vous pouvez poser n\'importe quelle question sur l\'actualité, des affirmations douteuses sur les réseaux sociaux, des théories du complot, des informations santé, politique, science, etc. Vera analyse et vérifie tous types de contenu.',
      isOpen: false
    },
    {
      question: 'Combien de temps prend une vérification ?',
      answer: 'La plupart des vérifications sont instantanées ou prennent quelques secondes. Pour des questions complexes nécessitant une analyse approfondie, cela peut prendre jusqu\'à une minute.',
      isOpen: false
    }
  ];

  platforms = [
    {
      name: 'TikTok',
      icon: '📱',
      status: 'Intégré',
      description: 'Extraction automatique de vidéos avec métadonnées complètes'
    },
    {
      name: 'Instagram',
      icon: '📸',
      status: 'Intégré',
      description: 'Vérification des posts, stories et reels'
    },
    {
      name: 'YouTube',
      icon: '▶️',
      status: 'Intégré',
      description: 'Analyse des vidéos et vérification des descriptions'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      status: 'En cours',
      description: 'Vérification des messages et médias partagés dans les groupes'
    }
  ];

  ngOnInit() {
    // Initialize Feather icons
    this.replaceFeatherIcons();
  }

  replaceFeatherIcons() {
    setTimeout(() => {
      if (typeof (window as any).feather !== 'undefined') {
        (window as any).feather.replace();
      }
    }, 50);
  }

  toggleFaq(faq: FAQ) {
    faq.isOpen = !faq.isOpen;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    setTimeout(() => this.replaceFeatherIcons(), 0);
  }

  toggleAttachMenu() {
    this.showAttachMenu = !this.showAttachMenu;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.searchQuery = `[Image sélectionnée: ${file.name}] Analyse cette image et vérifie son authenticité.`;
      this.cdr.detectChanges();
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedVideo = file;
      this.searchQuery = `[Vidéo sélectionnée: ${file.name}] Analyse cette vidéo et vérifie son authenticité.`;
      this.cdr.detectChanges();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (file.type.startsWith('image/')) {
        this.selectedImage = file;
        this.searchQuery = `[Image sélectionnée: ${file.name}] Analyse cette image et vérifie son authenticité.`;
      } else if (file.type.startsWith('video/')) {
        this.selectedVideo = file;
        this.searchQuery = `[Vidéo sélectionnée: ${file.name}] Analyse cette vidéo et vérifie son authenticité.`;
      } else {
        // Pour les autres types de fichiers
        this.searchQuery = `[Fichier sélectionné: ${file.name}] Analyse ce fichier et vérifie son contenu.`;
      }
      this.cdr.detectChanges();
    }
  }

  detectUrl() {
    // Détecter les URLs dans le message
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = this.searchQuery.match(urlRegex);
    
    if (urls && urls.length > 0) {
      this.mediaUrls = urls;
      // Envoyer directement la recherche avec les URLs détectées
      this.sendSearchQuery();
    } else {
      // Si pas d'URL, juste faire une recherche normale
      this.sendSearchQuery();
    }
  }

  sendSearchQuery() {
    if (!this.searchQuery.trim() || this.isSearching) return;

    const query = this.searchQuery.trim();
    
    // Détecter automatiquement les URLs dans le message
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const detectedUrls = query.match(urlRegex);
    if (detectedUrls && detectedUrls.length > 0) {
      this.mediaUrls = detectedUrls;
    }
    
    this.searchQuery = ''; // Vider l'input immédiatement
    
    // Ajouter le message utilisateur au chat
    this.messages.push({
      sender: 'user',
      content: query,
      timestamp: new Date()
    });
    
    this.isSearching = true;
    this.showResults = true;
    
    // Forcer la détection des changements pour afficher le spinner
    this.cdr.detectChanges();
    
    // Scroll automatique après ajout du message utilisateur
    this.scrollToBottom();

    this.veraChatService.sendMessage(
      query, 
      this.messages, 
      this.mediaUrls,
      this.selectedImage || undefined,
      this.selectedVideo || undefined
    ).subscribe({
      next: (response) => {
        this.isSearching = false;
        
        // Forcer la détection des changements pour réafficher la flèche
        this.cdr.detectChanges();
        
        // Vérifier si le backend retourne une erreur même dans le succès
        let displayMessage = response.response;
        if (response.result?.status === 'error') {
          displayMessage = response.result.summary || response.response || "Désolé, impossible de vérifier cette information pour le moment. Réessayez plus tard.";
        }
        
        // Ajouter la réponse de Vera au chat
        this.messages.push({
          sender: 'vera',
          content: displayMessage,
          timestamp: new Date()
        });
        
        this.veraResponse = displayMessage;
        this.veraResult = response.result;
        
        // Réinitialiser les fichiers et URLs après envoi
        this.selectedImage = null;
        this.selectedVideo = null;
        this.mediaUrls = [];
        
        // Forcer Angular à détecter les changements
        this.cdr.detectChanges();
        
        // Scroll automatique après la réponse de Vera
        this.scrollToBottom();
        
        // Sauvegarder l'ID de conversation pour garder la mémoire
        if (response.conversationId) {
          this.currentConversationId = response.conversationId;
        }
        
        // Sauvegarder dans l'historique
        this.addToHistory(query, response);
        
        // Forcer Angular à détecter les changements
        this.cdr.detectChanges();
        
        // Remplacer les icônes Feather après tous les changements DOM
        setTimeout(() => this.replaceFeatherIcons(), 50);
      },
      error: (error) => {
        this.isSearching = false;
        
        // Forcer la détection des changements pour réafficher la flèche
        this.cdr.detectChanges();
        
        // Ajouter un message d'erreur au chat
        const errorMessage = error.error?.message || error.message || "Désolé, une erreur s'est produite lors de la connexion. Veuillez réessayer.";
        this.messages.push({
          sender: 'vera',
          content: errorMessage,
          timestamp: new Date()
        });
        
        this.veraResponse = errorMessage;
        this.veraResult = { status: 'error', summary: errorMessage };
        
        // Scroll automatique après le message d'erreur
        this.scrollToBottom();
        
        // Remplacer les icônes Feather après tous les changements DOM
        setTimeout(() => this.replaceFeatherIcons(), 50);
      }
    });
  }

  /**
   * Scroll automatique vers le bas de la conversation (comme ChatGPT)
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const conversationContainer = document.querySelector('.conversation-results');
      if (conversationContainer) {
        conversationContainer.scrollTo({
          top: conversationContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  addToHistory(query: string, response: any) {
    // Chercher si une conversation avec le même conversationId existe déjà
    const existingIndex = this.conversationHistory.findIndex(
      item => item.conversationId === this.currentConversationId && this.currentConversationId !== null
    );
    
    if (existingIndex !== -1) {
      // Mettre à jour la conversation existante
      this.conversationHistory[existingIndex] = {
        ...this.conversationHistory[existingIndex],
        timestamp: new Date().toISOString(),
        messages: [...this.messages]
      };
      
      // Remonter la conversation mise à jour en haut de la liste
      const updatedItem = this.conversationHistory.splice(existingIndex, 1)[0];
      this.conversationHistory = [updatedItem, ...this.conversationHistory];
    } else {
      // Créer une nouvelle conversation (premier message uniquement)
      const historyItem = {
        title: this.generateConversationTitle(query),
        query,
        response: response.response,
        result: response.result,
        timestamp: new Date().toISOString(),
        conversationId: this.currentConversationId,
        messages: [...this.messages]
      };
      
      this.conversationHistory = [historyItem, ...this.conversationHistory].slice(0, 10);
    }
    
    this.saveUserHistory();
  }

  /**
   * Génère la clé de stockage en fonction de l'utilisateur
   * - Utilisateur connecté : 'user_{id}_conversations'
   * - Utilisateur non connecté : 'guest_conversations' (temporaire)
   */
  private getStorageKey(): string {
    const user = this.authService.currentUser();
    if (user && user.id) {
      return `user_${user.id}_conversations`;
    }
    return 'guest_conversations';
  }

  /**
   * Charge l'historique de l'utilisateur depuis localStorage
   */
  private loadUserHistory(): void {
    const key = this.getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        this.conversationHistory = JSON.parse(saved);
      } catch (e) {
        console.error('Erreur lors du chargement de l\'historique:', e);
        this.conversationHistory = [];
      }
    } else {
      this.conversationHistory = [];
    }
  }

  /**
   * Sauvegarde l'historique de l'utilisateur dans localStorage
   */
  private saveUserHistory(): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(this.conversationHistory));
  }

  /**
   * Nettoie l'historique temporaire (guest) lors de la connexion
   */
  private clearGuestHistory(): void {
    localStorage.removeItem('guest_conversations');
  }

  generateConversationTitle(query: string): string {
    // Générer un titre court à partir de la question
    if (query.length <= 40) {
      return query;
    }
    // Prendre les premiers mots jusqu'à 40 caractères
    const words = query.split(' ');
    let title = '';
    for (const word of words) {
      if ((title + word).length > 37) {
        break;
      }
      title += (title ? ' ' : '') + word;
    }
    return title + '...';
  }

  formatVeraResponse(text: string): string {
    if (!text) return '';
    
    // Convertir les URLs en liens cliquables
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formatted = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    
    // Préserver les sauts de ligne
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  loadConversation(item: any) {
    // Charger TOUTE la conversation (tous les messages)
    this.messages = item.messages || [];
    
    // Afficher le dernier échange
    this.searchQuery = item.query;
    this.displayedQuery = item.query;
    this.veraResponse = item.response;
    this.veraResult = item.result;
    this.showResults = true;
    
    // Restaurer l'ID de conversation si présent
    this.currentConversationId = item.conversationId || null;
    
    // Fermer la sidebar sur mobile
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
    
    this.replaceFeatherIcons();
  }

  newSearch() {
    this.searchQuery = '';
    this.displayedQuery = '';
    this.showResults = false;
    this.veraResponse = '';
    this.veraResult = null;
    this.currentConversationId = null; // Nouvelle conversation
    this.messages = []; // Vider tous les messages
    
    // Réinitialiser feather icons
    this.replaceFeatherIcons();
  }

  getStatusClass(status?: string): string {
    switch(status) {
      case 'verified': return 'status-verified';
      case 'false': return 'status-false';
      case 'mixed': return 'status-mixed';
      case 'unverified': return 'status-unverified';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    switch(status) {
      case 'verified': return '✓ Vérifié';
      case 'false': return '✗ Faux';
      case 'mixed': return '~ Mitigé';
      case 'unverified': return '? Non vérifié';
      default: return '';
    }
  }

  // Gestion du Enter (envoyer) vs Shift+Enter (nouvelle ligne)
  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendSearchQuery();
    }
  }

  // Auto-resize du textarea
  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height (max 200px, like ChatGPT)
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = newHeight + 'px';
  }

  // Déconnexion
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Vider l'historique actuel
        this.conversationHistory = [];
        this.messages = [];
        this.currentConversationId = null;
        this.showResults = false;
        
        // Charger l'historique guest (vide au départ)
        this.loadUserHistory();
        
        // Rediriger vers la page de connexion
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, vider l'historique et rediriger
        this.conversationHistory = [];
        this.messages = [];
        this.router.navigate(['/login']);
      }
    });
  }
}
