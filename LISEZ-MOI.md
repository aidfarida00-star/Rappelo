# Rappello — application Android

Rappels de médicaments, rendez-vous et tâches, avec sons, voix (français, anglais, arabe), la voix d'un proche, la préparation des rendez-vous et le suivi des stocks.

Dans l'application installée, les rappels deviennent de **vraies notifications du téléphone** : elles sonnent et vibrent même écran verrouillé, avec deux boutons directement sur la notification : **« C'est fait »** et **« Me rappeler dans 10 min »**. En touchant la notification, l'application s'ouvre, affiche l'écran coloré et fait entendre la voix (ou le message du proche).

---

## Méthode 1 (conseillée) : construction automatique et gratuite avec GitHub

Pas besoin d'installer de logiciel. Comptez 15 minutes la première fois.

1. **Créez un compte gratuit** sur https://github.com (bouton « Sign up »).
2. Cliquez sur **« + »** en haut à droite, puis **« New repository »**.
   Nom : `rappello`. Choisissez **Private**. Cliquez **« Create repository »**.
3. Sur la page qui s'affiche, cliquez le lien **« uploading an existing file »**.
4. Décompressez le fichier `rappello.zip` sur votre ordinateur, ouvrez le dossier `rappello`, **sélectionnez tout son contenu** et glissez-le dans la page GitHub. Cliquez **« Commit changes »**.
   ⚠️ Le dossier caché `.github` doit aussi être envoyé. Sur Mac, appuyez sur Cmd + Maj + . pour voir les fichiers cachés. Sur Windows : menu Affichage › Éléments masqués.
   Si l'onglet « Actions » propose seulement des modèles (le dossier caché n'est pas passé), cliquez **« set up a workflow yourself »**, effacez le texte proposé, collez le contenu du fichier `construire-application.yml` (fourni en double à la racine du dossier) et cliquez **« Commit changes »**.
5. Ouvrez l'onglet **« Actions »**. La construction démarre toute seule (environ 5 à 8 minutes). Si rien ne se lance, cliquez « Construire l'application Android » puis **« Run workflow »**.
6. Quand le rond devient vert ✅, cliquez dessus. En bas, section « Artifacts », téléchargez **Rappello-application-android**. C'est un .zip qui contient **Rappello.apk**.
7. Envoyez `Rappello.apk` sur votre téléphone Android (e-mail à vous-même, WhatsApp, câble USB…), ouvrez-le et acceptez **« Installer des applications inconnues »** quand le téléphone le demande.

## Méthode 2 : avec Android Studio (pour une personne à l'aise avec l'informatique)

1. Installez Node.js (https://nodejs.org) et Android Studio (https://developer.android.com/studio).
2. Dans le dossier du projet :
   ```
   npm install
   npm run android:init
   npx cap open android
   ```
3. Dans Android Studio : menu **Build › Build App Bundle(s) / APK(s) › Build APK(s)**, ou branchez le téléphone et cliquez ▶︎.

Après une modification de `www/index.html` : `npm run sync`.

---

## Au premier lancement

- Acceptez **les notifications**.
- Si le téléphone ouvre l'écran **« Alarmes et rappels »**, activez-le : c'est ce qui permet de sonner à l'heure pile.
- Touchez une fois **« Activer les sons et la voix »**.
- Pour la voix arabe ou anglaise : Réglages du téléphone › Accessibilité (ou Langue) › **Synthèse vocale**, puis installez la langue voulue.
- Sur certains téléphones (Xiaomi, Huawei, Samsung…), autorisez l'application à **fonctionner en arrière-plan** (Réglages › Batterie) pour éviter que les rappels soient retardés.

## Bon à savoir

- Cette version est une **version de test** (« debug »). Elle s'installe sur tous les téléphones Android, mais pour la publier sur le **Google Play Store**, il faudra une version signée et un compte développeur Google (25 $ une fois).
- Écran verrouillé, la notification utilise la **sonnerie du téléphone**. La voix du proche se fait entendre quand on touche la notification ou quand l'application est ouverte.
- Les rappels et les messages vocaux restent **uniquement sur le téléphone**. Ils ne sont envoyés nulle part.
- Les rappels sont programmés 7 jours à l'avance. Ouvrir l'application au moins une fois par semaine suffit à garder les rappels quotidiens à jour.

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `www/index.html` | L'application elle-même (écrans, sons, voix, langues) |
| `capacitor.config.json` | Nom et identifiant de l'application |
| `scripts/native.js` | Programmation des notifications du téléphone (déjà inclus dans `www/index.html`) |
| `scripts/patch-android.js` | Ajoute les autorisations Android nécessaires |
| `.github/workflows/` | Construction automatique sur GitHub |
