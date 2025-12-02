import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeraChatService, Message } from '../../services/vera-chat.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingPage implements OnInit {
  searchQuery: string = '';
  displayedQuery: string = ''; // Question affichée (séparée de l'input)
  isSearching: boolean = false;
  showResults: boolean = false;
  veraResponse: string = '';
  veraResult: any = null;
  sidebarCollapsed: boolean = false;
  conversationHistory: any[] = [];
  conversationContext: string = ''; // Contexte pour la mémoire
  currentConversationId: string | null = null; // ID de conversation Vera
  messages: Array<{sender: 'user' | 'vera', content: string, timestamp: Date}> = []; // Tous les messages

  constructor(
    private veraChatService: VeraChatService,
    private cdr: ChangeDetectorRef
  ) {
    // Charger l'historique depuis localStorage
    const saved = localStorage.getItem('conversationHistory');
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
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

  sendSearchQuery() {
    if (!this.searchQuery.trim() || this.isSearching) return;

    const query = this.searchQuery.trim();
    this.searchQuery = ''; // Vider l'input immédiatement
    
    // Ajouter le message utilisateur au chat
    this.messages.push({
      sender: 'user',
      content: query,
      timestamp: new Date()
    });
    
    this.isSearching = true;
    this.showResults = true;
    this.cdr.detectChanges();

    this.veraChatService.sendMessage(query, this.messages).subscribe({
      next: (response) => {
        console.log('Réponse reçue:', response);
        this.isSearching = false;
        
        // Ajouter la réponse de Vera au chat
        this.messages.push({
          sender: 'vera',
          content: response.response,
          timestamp: new Date()
        });
        
        this.veraResponse = response.response;
        this.veraResult = response.result;
        
        // Forcer Angular à détecter les changements
        this.cdr.detectChanges();
        
        // Appeler replaceFeatherIcons après le rendu
        setTimeout(() => this.replaceFeatherIcons(), 100);
        
        // Sauvegarder l'ID de conversation pour garder la mémoire
        if (response.conversationId) {
          this.currentConversationId = response.conversationId;
        }
        
        // Forcer Angular à détecter les changements
        this.cdr.detectChanges();
        
        // Sauvegarder dans l'historique
        this.addToHistory(query, response);
        
        // Réinitialiser feather icons après mise à jour du DOM
        this.replaceFeatherIcons();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isSearching = false;
        this.veraResponse = "Désolé, une erreur s'est produite. Veuillez réessayer.";
        this.veraResult = { status: 'error' };
        this.cdr.detectChanges();
      }
    });
  }

  addToHistory(query: string, response: any) {
    const historyItem = {
      query,
      response: response.response,
      result: response.result,
      timestamp: new Date().toISOString()
    };
    
    // Ajouter au début, limiter à 10
    this.conversationHistory = [historyItem, ...this.conversationHistory].slice(0, 10);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('conversationHistory', JSON.stringify(this.conversationHistory));
  }

  loadConversation(item: any) {
    this.searchQuery = item.query;
    this.veraResponse = item.response;
    this.veraResult = item.result;
    this.showResults = true;
    
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

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    
    // Réinitialiser feather icons après toggle
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
}
