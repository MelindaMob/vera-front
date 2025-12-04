import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Migration: Convertir l'ancien historique partagé en historique guest
const migrateOldHistory = () => {
  const oldKey = 'conversationHistory';
  const newKey = 'guest_conversations';
  
  // Si l'ancien format existe et que le nouveau n'existe pas
  if (localStorage.getItem(oldKey) && !localStorage.getItem(newKey)) {
    const oldHistory = localStorage.getItem(oldKey);
    localStorage.setItem(newKey, oldHistory!);
    localStorage.removeItem(oldKey);
    console.log('✅ Historique migré vers le nouveau format');
  }
};

// Exécuter la migration
migrateOldHistory();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
