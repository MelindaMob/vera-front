# Système d'Historique des Conversations

## 📋 Vue d'ensemble

Le système d'historique de Vera utilise le `localStorage` du navigateur pour stocker les conversations, avec une **séparation stricte** entre les utilisateurs connectés et non connectés.

## 🔑 Clés de stockage

### Utilisateur non connecté (Guest)
```typescript
Clé: 'guest_conversations'
Durée: Temporaire (jusqu'à la connexion)
Partage: NON (chaque session = nouveau guest)
```

### Utilisateur connecté
```typescript
Clé: 'user_{userId}_conversations'
Exemple: 'user_1_conversations', 'user_2_conversations'
Durée: Permanente (persiste après déconnexion)
Partage: NON (isolé par utilisateur)
```

## 🔄 Flux de données

### Scénario 1 : Utilisateur non connecté
```
1. Visite landing page → Charge 'guest_conversations' (vide au départ)
2. Fait une recherche → Sauvegarde dans 'guest_conversations'
3. Historique visible dans la sidebar
4. Rafraîchit la page → Historique conservé (même session)
```

### Scénario 2 : Connexion
```
1. Utilisateur guest fait plusieurs recherches
2. Se connecte avec email/password
3. 🗑️ 'guest_conversations' supprimé automatiquement
4. Charge 'user_{id}_conversations' (historique personnel)
5. Historique guest DISPARAÎT, historique utilisateur APPARAÎT
```

### Scénario 3 : Utilisateur connecté
```
1. Se connecte → Charge 'user_{id}_conversations'
2. Fait des recherches → Sauvegarde dans 'user_{id}_conversations'
3. Se déconnecte → Historique CONSERVÉ dans localStorage
4. Se reconnecte plus tard → Historique RESTAURÉ
```

### Scénario 4 : Déconnexion
```
1. Utilisateur connecté clique "Se déconnecter"
2. Historique actuel vidé de la mémoire (conversationHistory = [])
3. Bascule vers 'guest_conversations' (vide au départ)
4. Peut faire de nouvelles recherches en mode guest
```

## 🛡️ Sécurité et isolation

### Problème résolu
**AVANT** (❌ Bug) :
```typescript
// Tous les utilisateurs partageaient 'conversationHistory'
localStorage.setItem('conversationHistory', JSON.stringify(history));

Résultat: User1 voit l'historique de Guest + User2 voit l'historique de User1
```

**APRÈS** (✅ Corrigé) :
```typescript
// Clé dynamique selon l'utilisateur
const key = user ? `user_${user.id}_conversations` : 'guest_conversations';
localStorage.setItem(key, JSON.stringify(history));

Résultat: Chaque utilisateur a son propre historique isolé
```

## 📝 Implémentation

### Méthodes clés

#### `getStorageKey(): string`
```typescript
// Génère la clé de stockage en fonction de l'utilisateur
private getStorageKey(): string {
  const user = this.authService.currentUser();
  if (user && user.id) {
    return `user_${user.id}_conversations`;
  }
  return 'guest_conversations';
}
```

#### `loadUserHistory(): void`
```typescript
// Charge l'historique depuis localStorage
private loadUserHistory(): void {
  const key = this.getStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    this.conversationHistory = JSON.parse(saved);
  } else {
    this.conversationHistory = [];
  }
}
```

#### `saveUserHistory(): void`
```typescript
// Sauvegarde l'historique dans localStorage
private saveUserHistory(): void {
  const key = this.getStorageKey();
  localStorage.setItem(key, JSON.stringify(this.conversationHistory));
}
```

#### `clearGuestHistory(): void`
```typescript
// Nettoie l'historique guest (appelé lors de la connexion)
private clearGuestHistory(): void {
  localStorage.removeItem('guest_conversations');
}
```

## 🔄 Cycle de vie

### Au chargement de la page
```typescript
constructor() {
  // Si token existe → charge historique utilisateur
  // Sinon → charge historique guest
  this.loadUserHistory();
}
```

### Lors d'une nouvelle recherche
```typescript
addToHistory(query, response) {
  // Ajoute à l'historique en mémoire
  this.conversationHistory.unshift(newItem);
  
  // Sauvegarde avec la bonne clé (user ou guest)
  this.saveUserHistory();
}
```

### Lors de la connexion (login.component.ts)
```typescript
this.authService.login(credentials).subscribe({
  next: (response) => {
    // Nettoie l'historique guest
    localStorage.removeItem('guest_conversations');
    
    // Redirige vers landing → Charge historique utilisateur
    this.router.navigate(['/']);
  }
});
```

### Lors de l'inscription (register.component.ts)
```typescript
this.authService.register(userData).subscribe({
  next: (response) => {
    // Nettoie l'historique guest
    localStorage.removeItem('guest_conversations');
    
    // Redirige vers login
    this.router.navigate(['/login']);
  }
});
```

### Lors de la déconnexion (landing.ts)
```typescript
onLogout(): void {
  this.authService.logout().subscribe({
    next: () => {
      // Vide l'historique en mémoire
      this.conversationHistory = [];
      this.messages = [];
      
      // Recharge historique guest (vide)
      this.loadUserHistory();
      
      // Redirige vers login
      this.router.navigate(['/login']);
    }
  });
}
```

## 🧹 Migration

### Script de migration (main.ts)
```typescript
// Convertit l'ancien format partagé en format guest
const migrateOldHistory = () => {
  const oldKey = 'conversationHistory';
  const newKey = 'guest_conversations';
  
  if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
    const oldHistory = localStorage.getItem(oldKey);
    localStorage.setItem(newKey, oldHistory!);
    localStorage.removeItem(oldKey);
  }
};
```

## 🎯 Cas d'usage

### Cas 1 : Utilisateur lambda
```
1. Arrive sur le site (non connecté)
2. Fait 3 recherches → Historique guest (3 items)
3. Rafraîchit la page → Historique conservé
4. Ferme le navigateur → Historique conservé (localStorage)
5. Revient le lendemain → Historique toujours là
6. Se connecte → Historique guest supprimé
7. Historique utilisateur vide (première connexion)
```

### Cas 2 : Utilisateur régulier
```
1. Se connecte → Charge historique utilisateur (20 items)
2. Fait 5 nouvelles recherches → Historique = 25 items
3. Se déconnecte → Historique sauvegardé
4. Se reconnecte → Historique restauré (25 items)
```

### Cas 3 : Utilisateurs multiples (même ordinateur)
```
1. User1 se connecte → Historique 'user_1_conversations'
2. User1 fait 10 recherches
3. User1 se déconnecte
4. User2 se connecte → Historique 'user_2_conversations' (différent)
5. User2 NE VOIT PAS l'historique de User1 ✅
```

### Cas 4 : Admin + User sur même machine
```
1. Admin (ID=2) se connecte → 'user_2_conversations'
2. Admin fait 5 recherches
3. Admin se déconnecte
4. User normal (ID=5) se connecte → 'user_5_conversations'
5. User NE VOIT PAS l'historique admin ✅
```

## 🚨 Limitations

### Limite de stockage
- localStorage : ~5-10MB par domaine
- Historique limité à **10 conversations** par utilisateur
- Conversations plus anciennes automatiquement supprimées

### Sécurité
- ⚠️ localStorage = **pas chiffré**
- ⚠️ Accessible via DevTools (F12 → Application → Storage)
- ✅ Mais isolé par domaine (pas accessible par d'autres sites)

### Considérations
- Historique guest = temporaire, perdu à la connexion
- Historique utilisateur = persistant, mais client-side only
- Pas de synchronisation entre appareils (pas de backend sync)

## 🔮 Améliorations futures

### Court terme
1. **Limite de temps** : Supprimer conversations > 30 jours
2. **Export** : Bouton pour exporter l'historique en JSON/PDF
3. **Recherche** : Filtrer l'historique par mots-clés

### Moyen terme
4. **Synchronisation backend** : Sauvegarder en base de données
5. **Multi-device** : Accès historique depuis mobile/desktop
6. **Favoris** : Marquer conversations importantes

### Long terme
7. **Chiffrement** : Chiffrer localStorage avec clé utilisateur
8. **Partage** : Partager une conversation (lien public)
9. **Tags** : Organiser par thématiques (politique, santé, etc.)

## 📚 Références

- **localStorage API** : https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Angular Signals** : https://angular.dev/guide/signals
- **Security Best Practices** : Ne jamais stocker de données sensibles (passwords, tokens) dans localStorage

---

**Version** : 1.0  
**Date** : 4 décembre 2025  
**Auteur** : GitHub Copilot + Développeur Vera
