## Lancement du Projet

Pour démarrer le projet, suivez ces étapes pour installer et lancer le projet :

### Prérequis

- XAMPP installé sur votre machine

### Installation et Exécution

**Initialiser package.json** :

   ```bash
   npm init -y
   ```

**Installer les dépendances** :

   ```bash
   npm install express mysql2 sequelize dotenv body-parser cors
   ```
   ```bash
   npm install --save-dev nodemon
   ```

**Lancer le serveur** :

   ```bash
   npm run dev
   ```

**Démarrez XAMPP** :

   - Ouvrez le panneau de contrôle de **XAMPP**
   - Démarrez les services **Apache** et **MySQL**

**Copiez la base de donnée** :

   - Ouvrez http://localhost/phpmyadmin/
   - Créez une nouvelle base de données nommée "**api_cocktail**"


### Auteurs :

   - [@NicolasGouy](https://github.com/gonicolas12)
   - [@JosuéAdami](https://github.com/Joadm973)
   - [@BrennMakouya](https://github.com/Brenn007)
