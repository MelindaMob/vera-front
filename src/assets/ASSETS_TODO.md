# Assets à ajouter pour la Landing Page

## Logos
- **Logo Vera** : Typographie "vera" en Playfair Display (actuellement en texte, pas besoin d'image)

## Icônes
✅ **Feather Icons** : Intégré via CDN (https://feathericons.com)
- `phone` : Téléphone
- `message-circle` : WhatsApp/Messages
- `play` : Bouton vidéo
- Autres icônes disponibles selon besoin

## Images de fond / Mockups
### Hero Section
- 2 mockups iPhone avec gradients (actuellement des placeholders avec var(--gradient-2))
  - Gradient 1 : Bleu → Beige → Rose
  - Gradient 2 : Vert → Beige → Rose

### Section "Numéro de confiance"
- 1 mockup iPhone avec gradient (var(--gradient-1))

### Section "Comment ça marche"
- Petits mockups téléphone (pour le diagramme)

## Photos
### Équipe (6 personnes)
À placer dans `src/assets/team/`:
- sophie.jpg
- thomas.jpg
- marie.jpg
- lucas.jpg
- emma.jpg
- alexandre.jpg

**Placeholder actuel** : Icône 👤 grise sur fond beige

### Experts (5 personnes)
À placer dans `src/assets/experts/`:
- laurent.jpg
- claire.jpg
- jean.jpg
- sarah.jpg
- michel.jpg

**Placeholder actuel** : Icône 👤 grise sur fond noir avec bordure verte

## Logos partenaires
À placer dans `src/assets/partners/`:
- AFP
- Le Monde
- Libération
- Autres médias (selon liste finale)

## Couleurs (déjà configurées)
- Beige : `#F5F1E8`
- Green-50 : `#D4EDD3`
- Red-50 : `#F5D4D4`
- Blue-50 : `#D4E4F5`
- Noir : `#1A1A1A`

## Distribution des couleurs (selon Figma)
- 50% Beige
- 30% Green-50
- 10% Red-50
- 10% Blue-50

## Typographie
- **Titres** : Playfair Display (remplace Lastik)
- **Corps** : Inter
- **Logo** : Playfair Display

## Notes
- Les gradients sont déjà définis en CSS (--gradient-1, --gradient-2, --gradient-3)
- Structure HTML complète et responsive
- Feather Icons chargés depuis CDN, pas besoin de télécharger
- Tous les chemins d'images utilisent des placeholders, faciles à remplacer
