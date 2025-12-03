# Documentation Technique - Landing Page Vera

## Vue d'ensemble
La landing page est l'interface principale de Vera, permettant aux utilisateurs d'interagir avec l'IA de fact-checking via un chat conversationnel. Elle gère la communication avec le bot, l'historique des conversations, et l'affichage des résultats.

---

## Architecture Frontend

### Fichiers principaux
- **`src/app/pages/landing/landing.ts`** - Composant principal
- **`src/app/pages/landing/landing.html`** - Template HTML
- **`src/app/pages/landing/landing.css`** - Styles
- **`src/app/services/vera-chat.service.ts`** - Service de communication API
- **`src/app/services/auth.service.ts`** - Authentification (optionnel)
- **`src/app/services/history.service.ts`** - Gestion historique BD (optionnel)

---

## Composant Landing (`landing.ts`)

### Classe `LandingPage`

#### Propriétés principales

```typescript
searchQuery: string = '';              // Contenu de l'input
displayedQuery: string = '';            // Question affichée séparément
isSearching: boolean = false;           // État de chargement
showResults: boolean = false;           // Afficher zone de résultats
veraResponse: string = '';              // Réponse textuelle de Vera
veraResult: any = null;                 // Objet résultat complet
sidebarCollapsed: boolean = false;      // État de la sidebar
conversationHistory: any[] = [];        // Historique conversations
messages: Array<{...}> = [];           // Messages du chat actuel
selectedImage: File | null = null;      // Fichier image uploadé
selectedVideo: File | null = null;      // Fichier vidéo uploadé
mediaUrls: string[] = [];              // URLs détectées dans message
currentConversationId: string | null;   // ID conversation Vera
```

---

### Cycle de vie

#### `ngOnInit()`
```typescript
ngOnInit() {
  this.replaceFeatherIcons();
  // Charger historique depuis localStorage
  const saved = localStorage.getItem('conversationHistory');
  if (saved) {
    this.conversationHistory = JSON.parse(saved);
  }
}
```

**Actions :**
1. Initialise les icônes Feather
2. Charge l'historique sauvegardé localement
3. Prépare l'interface utilisateur

---

### Méthodes principales

#### 1. `handleSearchQuery()`

**Déclencheur :** Clic sur bouton recherche ou Enter dans input

**Workflow :**
```typescript
handleSearchQuery() {
  // Détection automatique des URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = this.searchQuery.match(urlRegex);
  
  if (urls && urls.length > 0) {
    this.mediaUrls = urls;  // Stocker URLs pour analyse
  }
  
  this.sendSearchQuery();
}
```

**Fonctionnalité :**
- Détecte automatiquement les URLs HTTP/HTTPS dans le message
- Stocke les URLs dans `mediaUrls[]` pour envoi au backend
- Envoie la requête immédiatement

---

#### 2. `sendSearchQuery()`

**Fonction centrale** qui gère toute la communication avec l'API.

**Étapes détaillées :**

1. **Validation**
   ```typescript
   if (!this.searchQuery.trim() || this.isSearching) return;
   ```

2. **Détection URLs** (double vérification)
   ```typescript
   const detectedUrls = query.match(urlRegex);
   if (detectedUrls) {
     this.mediaUrls = detectedUrls;
   }
   ```

3. **Ajout message utilisateur**
   ```typescript
   this.messages.push({
     sender: 'user',
     content: query,
     timestamp: new Date()
   });
   ```

4. **Activation spinner**
   ```typescript
   this.isSearching = true;
   this.showResults = true;
   this.cdr.detectChanges();  // Force update UI
   ```

5. **Appel API via service**
   ```typescript
   this.veraChatService.sendMessage(
     query,                    // Message texte
     this.messages,            // Historique complet
     this.mediaUrls,           // URLs détectées
     this.selectedImage,       // Fichier image (optionnel)
     this.selectedVideo        // Fichier vidéo (optionnel)
   ).subscribe({...});
   ```

6. **Traitement réponse**
   ```typescript
   next: (response) => {
     // Désactiver spinner
     this.isSearching = false;
     
     // Ajouter message Vera
     this.messages.push({
       sender: 'vera',
       content: response.response,
       timestamp: new Date()
     });
     
     // Stocker résultat
     this.veraResponse = response.response;
     this.veraResult = response.result;
     
     // Sauvegarder ID conversation
     if (response.conversationId) {
       this.currentConversationId = response.conversationId;
     }
     
     // Ajouter à l'historique
     this.addToHistory(query, response);
     
     // Reset fichiers/URLs
     this.selectedImage = null;
     this.selectedVideo = null;
     this.mediaUrls = [];
     
     // Recharger icônes
     setTimeout(() => this.replaceFeatherIcons(), 50);
   }
   ```

7. **Gestion erreurs**
   ```typescript
   error: (error) => {
     this.isSearching = false;
     this.veraResponse = "Désolé, une erreur s'est produite...";
     this.veraResult = { status: 'error' };
   }
   ```

---

#### 3. `addToHistory(query, response)`

Sauvegarde une conversation dans l'historique local.

```typescript
addToHistory(query: string, response: any) {
  const historyItem = {
    query,                                // Question utilisateur
    response: response.response,          // Réponse Vera
    result: response.result,              // Métadonnées (status, sources, confidence)
    timestamp: new Date().toISOString(),  // Date ISO
    conversationId: this.currentConversationId,
    messages: [...this.messages]          // Tous les messages du chat
  };
  
  // Ajouter au début, limiter à 10
  this.conversationHistory = [historyItem, ...this.conversationHistory].slice(0, 10);
  
  // Sauvegarder localStorage
  localStorage.setItem('conversationHistory', JSON.stringify(this.conversationHistory));
}
```

**Stratégie stockage :**
- Les 10 dernières conversations
- Ordre chronologique inversé (plus récent en premier)
- Persistance locale via `localStorage`

---

#### 4. `loadConversation(item)`

Restaure une conversation depuis l'historique.

```typescript
loadConversation(item: any) {
  // Charger TOUS les messages
  this.messages = item.messages || [];
  
  // Afficher dernier échange
  this.searchQuery = item.query;
  this.displayedQuery = item.query;
  this.veraResponse = item.response;
  this.veraResult = item.result;
  this.showResults = true;
  
  // Restaurer ID conversation
  this.currentConversationId = item.conversationId || null;
  
  // Fermer sidebar sur mobile
  if (window.innerWidth < 768) {
    this.sidebarCollapsed = false;
  }
  
  // Scroll en haut
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Recharger icônes
  setTimeout(() => this.replaceFeatherIcons(), 100);
}
```

**Comportement :**
- Restaure le contexte complet (tous les messages)
- Affiche les résultats du dernier échange
- Conserve la mémoire conversationnelle
- Adapte l'UI mobile/desktop

---

#### 5. `onImageSelected(event)` & `onVideoSelected(event)`

Gère l'upload de fichiers médias.

```typescript
onImageSelected(event: any) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    this.selectedImage = file;
  }
}

onVideoSelected(event: any) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('video/')) {
    this.selectedVideo = file;
  }
}
```

**Validation :**
- Vérification du type MIME
- Stockage temporaire jusqu'à envoi
- Reset après envoi réussi

---

#### 6. `replaceFeatherIcons()`

Remplace les icônes SVG inline par Feather Icons.

```typescript
replaceFeatherIcons() {
  if (typeof window !== 'undefined' && (window as any).feather) {
    (window as any).feather.replace();
  }
}
```

**Quand appelé :**
- `ngOnInit()` - Chargement initial
- Après chaque mise à jour DOM
- Après chargement conversation

**Pourquoi :**
Angular détruit/recrée le DOM, nécessite re-initialisation des icônes.

---

#### 7. `toggleSidebar()`

Gère l'affichage de la sidebar historique.

```typescript
toggleSidebar() {
  this.sidebarCollapsed = !this.sidebarCollapsed;
}
```

**Responsive :**
- Mobile : Overlay plein écran
- Desktop : Sidebar fixe gauche

---

#### 8. `clearHistory()`

Efface tout l'historique local.

```typescript
clearHistory() {
  if (confirm('Voulez-vous vraiment effacer tout l\'historique ?')) {
    this.conversationHistory = [];
    localStorage.removeItem('conversationHistory');
  }
}
```

---

## Service VeraChatService

### Méthode `sendMessage()`

**Signature :**
```typescript
sendMessage(
  content: string,
  conversationHistory: any[] = [],
  mediaUrls: string[] = [],
  imageFile?: File,
  videoFile?: File
): Observable<any>
```

**Workflow :**

1. **Ajout message utilisateur**
   ```typescript
   const userMessage: Message = {
     id: this.generateId(),
     content,
     sender: 'user',
     timestamp: new Date()
   };
   this.messagesSubject.next([...currentMessages, userMessage]);
   ```

2. **Indicateur typing**
   ```typescript
   const typingMessage: Message = {
     id: this.generateId(),
     content: 'Vera vérifie votre information...',
     sender: 'vera',
     isTyping: true,
     timestamp: new Date()
   };
   this.messagesSubject.next([...this.messagesSubject.value, typingMessage]);
   ```

3. **Construction payload**
   
   **Avec fichiers (FormData) :**
   ```typescript
   const formData = new FormData();
   formData.append('message', content);
   formData.append('conversationHistory', JSON.stringify(conversationHistory));
   formData.append('mediaUrls', JSON.stringify(mediaUrls));
   if (imageFile) formData.append('image', imageFile);
   if (videoFile) formData.append('video', videoFile);
   ```
   
   **Sans fichiers (JSON) :**
   ```typescript
   const payload = {
     message: content,
     conversationHistory,
     mediaUrls
   };
   ```

4. **Appel API**
   ```typescript
   this.http.post<{response: string, result: any}>(
     `${this.apiUrl}/chat`,
     requestBody,
     httpOptions
   )
   ```

5. **Traitement réponse**
   ```typescript
   next: (response: any) => {
     // Retirer typing indicator
     const messagesWithoutTyping = this.messagesSubject.value.filter(m => !m.isTyping);
     
     // Ajouter message Vera
     const veraMessage: Message = {
       id: this.generateId(),
       content: response.response,
       sender: 'vera',
       timestamp: new Date(),
       result: response.result
     };
     
     this.messagesSubject.next([...messagesWithoutTyping, veraMessage]);
     observer.next(response);
     observer.complete();
   }
   ```

6. **Gestion erreur**
   ```typescript
   error: (error) => {
     const messagesWithoutTyping = this.messagesSubject.value.filter(m => !m.isTyping);
     
     const errorMessage: Message = {
       id: this.generateId(),
       content: "Désolé, j'ai rencontré une erreur...",
       sender: 'vera',
       timestamp: new Date(),
       result: { status: 'error', summary: error.message }
     };
     
     this.messagesSubject.next([...messagesWithoutTyping, errorMessage]);
     observer.error(error);
   }
   ```

---

## Template HTML (`landing.html`)

### Structure principale

```html
<div class="landing-container">
  <!-- Section 1: Hero -->
  <section id="hero">...</section>
  
  <!-- Section 2: Chat Interface -->
  <section id="search-section">
    <div class="chat-wrapper">
      <!-- Sidebar historique -->
      <aside class="history-sidebar">...</aside>
      
      <!-- Zone conversation -->
      <div class="conversation-zone">
        <!-- Messages -->
        <div class="chat-messages">...</div>
        
        <!-- Barre de chat -->
        <div class="chat-input-container">
          <input [(ngModel)]="searchQuery" />
          <button (click)="sendSearchQuery()">
            <i data-feather="arrow-up"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Sections 3-6: About, Team, Partners, FAQ -->
  <section id="about">...</section>
  <section id="team">...</section>
  <section id="partners">...</section>
  <section id="faq">...</section>
</div>
```

---

### Éléments clés

#### Barre de chat
```html
<div class="chat-input-container">

  <button class="attach-btn" title="Joindre fichier">
    <i data-feather="paperclip"></i>
  </button>
  <input 
    type="text" 
    [(ngModel)]="searchQuery"
    (keyup.enter)="handleSearchQuery()"
    placeholder="Posez votre question à Vera..."
  />
  <button 
    (click)="sendSearchQuery()" 
    [disabled]="isSearching || !searchQuery.trim()"
  >
    <svg *ngIf="!isSearching">...</svg>
    <div *ngIf="isSearching" class="spinner"></div>
  </button>
</div>
```

#### Message chat
```html
<div class="message" [class.user]="msg.sender === 'user'">
  <div class="message-content">
    <p>{{ msg.content }}</p>
    <span class="timestamp">
      {{ msg.timestamp | date:'HH:mm' }}
    </span>
  </div>
</div>
```

#### Sidebar historique
```html
<aside class="history-sidebar" [class.collapsed]="sidebarCollapsed">
  <div class="history-header">
    <h3>Historique</h3>
    <button (click)="clearHistory()">
      <i data-feather="trash-2"></i>
    </button>
  </div>
  
  <div class="history-list">
    <div 
      *ngFor="let item of conversationHistory"
      class="history-item"
      (click)="loadConversation(item)"
    >
      <p class="history-query">{{ item.query }}</p>
      <span class="history-time">
        {{ item.timestamp | date:'dd/MM HH:mm' }}
      </span>
    </div>
  </div>
</aside>
```

---

## Styles CSS (`landing.css`)

### Architecture Flexbox

```css
.chat-wrapper {
  display: flex;
  height: 80vh;
  max-width: 1400px;
  margin: 0 auto;
}

.history-sidebar {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;
  overscroll-behavior: contain;  /* Isolation scroll */
}

.conversation-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.chat-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* Fixé en bas de la zone conversation */
}
```

### Responsive Mobile

```css
@media (max-width: 768px) {
  .history-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s;
    z-index: 1000;
  }
  
  .history-sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
```

---

## Flux de données

### Diagramme simplifié

```
User Input → handleSearchQuery()
    ↓
  Detect URLs
    ↓
  sendSearchQuery()
    ↓
  veraChatService.sendMessage()
    ↓
  HTTP POST /api/chat
    ↓
  Backend → Vera API
    ↓
  Response
    ↓
  Update messages[]
    ↓
  addToHistory()
    ↓
  localStorage
    ↓
  UI Update
```

---

## Gestion d'état

### Messages (Chat actuel)
```typescript
messages: Array<{
  sender: 'user' | 'vera',
  content: string,
  timestamp: Date
}>
```

### Historique (Conversations sauvegardées)
```typescript
conversationHistory: Array<{
  query: string,
  response: string,
  result: {
    status: string,
    summary: string,
    sources: Array<{title, url}>,
    confidence: number
  },
  timestamp: string (ISO),
  conversationId: string,
  messages: Array<Message>
}>
```

---

## Performance

### Optimisations

1. **Change Detection**
   ```typescript
   this.cdr.detectChanges();  // Force update quand nécessaire
   ```

2. **Debounce Input** (à implémenter)
   ```typescript
   // Éviter trop d'appels API pendant la saisie
   ```

3. **Lazy Loading Images**
   ```html
   <img loading="lazy" />
   ```

4. **Virtual Scrolling** (à implémenter)
   Pour historique très long (> 100 items)

---

## Sécurité

1. **Sanitization HTML**
   - Angular échappe automatiquement `{{ }}` bindings
   - Attention avec `[innerHTML]` (non utilisé)

2. **Validation Fichiers**
   ```typescript
   if (file && file.type.startsWith('image/')) {
     // OK
   }
   ```

3. **XSS Protection**
   - Pas d'évaluation dynamique de code
   - Pas de `eval()`, `new Function()`, etc.

4. **CSRF**
   - Angular HttpClient inclut protection XSRF token

---

## Déploiement (Vercel)

### Build
```bash
npm run build  # Génère dist/vera-front
```

### Configuration Vercel

**`vercel.json`** (recommandé) :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Variables d'environnement

**`src/environments/environment.prod.ts`** :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-render-backend.onrender.com',
  socketUrl: 'https://your-render-backend.onrender.com'
};
```

---

## Améliorations futures

1. **Markdown Support** - Formatter réponses Vera (gras, listes, liens)
2. **Image Preview** - Aperçu fichiers avant envoi
3. **Drag & Drop** - Upload fichiers par glisser-déposer
4. **Voice Input** - Reconnaissance vocale pour messages
5. **Export History** - Télécharger conversations en PDF/JSON
6. **Theme Toggle** - Mode clair/sombre
7. **Notifications** - Alertes pour nouvelles réponses
8. **PWA** - Mode offline avec Service Workers
9. **Internationalization** - Multi-langues (i18n)
10. **Analytics** - Tracking comportement utilisateur

---

## Dépendances clés

```json
{
  "@angular/core": "^21.0.0",
  "@angular/common": "^21.0.0",
  "@angular/forms": "^21.0.0",
  "feather-icons": "^4.29.0"
}
```

### CDN utilisés
- Feather Icons: `https://unpkg.com/feather-icons`

---

## Tests (à implémenter)

```typescript
describe('LandingPage', () => {
  it('should send message on Enter key', () => {
    // Test keyboard event
  });
  
  it('should detect URLs in message', () => {
    // Test URL regex
  });
  
  it('should save to history after response', () => {
    // Test localStorage
  });
});
```
