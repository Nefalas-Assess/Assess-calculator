# Système de Migration de Versions

Ce système permet de migrer automatiquement les fichiers JSON de l'application vers la structure de données la plus récente.

## Comment ça fonctionne

1. **Versioning** : Chaque fichier JSON sauvegardé contient une propriété `version` correspondant à la version de l'application qui l'a créé.

2. **Migration automatique** : Lors de l'import d'un fichier, le système compare la version du fichier avec la version actuelle de l'application et applique les migrations nécessaires.

3. **Migrations séquentielles** : Les migrations sont appliquées en séquence, permettant de passer d'une version très ancienne à la version actuelle.

## Ajouter une nouvelle migration

Quand vous modifiez la structure de données de l'application, ajoutez une migration dans `src/renderer/src/utils/migrations.ts` :

```typescript
{
  version: '1.2.0', // Nouvelle version
  migrate: (data: any) => {
    // Votre logique de migration ici
    
    // Exemple : Ajouter un nouveau champ obligatoire
    if (!data.nouveauChamp) {
      data.nouveauChamp = 'valeur_par_defaut'
    }
    
    // Exemple : Renommer un champ
    if (data.ancienNom) {
      data.nouveauNom = data.ancienNom
      delete data.ancienNom
    }
    
    // Exemple : Restructurer des données
    if (data.liste && Array.isArray(data.liste)) {
      data.liste = data.liste.map(item => ({
        ...item,
        nouveauChamp: item.ancienChamp || 'default'
      }))
    }
    
    return data
  }
}
```

## Bonnes pratiques

1. **Toujours ajouter les migrations à la fin du tableau** pour maintenir l'ordre chronologique
2. **Tester les migrations** avec des fichiers d'anciennes versions
3. **Documenter les changements** dans les commentaires
4. **Gérer les cas d'erreur** : vérifier l'existence des propriétés avant de les modifier
5. **Migrations non destructives** : éviter de supprimer des données sans avoir une stratégie de récupération

## Exemples de migrations courantes

### Ajouter un champ obligatoire
```typescript
if (!data.general_info) {
  data.general_info = {}
}
if (!data.general_info.nouveau_champ) {
  data.general_info.nouveau_champ = 'valeur_par_defaut'
}
```

### Migrer une structure d'objet
```typescript
if (data.ancien_objet) {
  data.nouveau_objet = {
    id: data.ancien_objet.identifiant,
    nom: data.ancien_objet.titre,
    actif: true
  }
  delete data.ancien_objet
}
```

### Migrer un tableau
```typescript
if (data.elements && Array.isArray(data.elements)) {
  data.elements = data.elements.map(element => ({
    ...element,
    id: element.id || generateId(),
    statut: element.statut || 'actif'
  }))
}
```

## Debugging

Les migrations affichent des logs dans la console pour vous aider à débugger :
- Version source et cible
- Chaque migration appliquée
- Confirmation de fin de migration

Activez la console de développement pour voir ces informations lors de l'import de fichiers. 