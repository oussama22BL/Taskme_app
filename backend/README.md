# Taskme Backend

Dossier backend minimal créé.

Scripts:
- `npm install`
- `npm run dev` (requires nodemon)

Endpoints:
- `GET /api/health` - status

Prochaine étape: ajouter dépendances, connexion DB, et routes spécifiques.

Seed de la base de données
-------------------------

Un petit script permet d'ajouter des utilisateurs d'exemple dans la collection `users`.

Usage:

- Avec une variable d'environnement (PowerShell):
	```powershell
	$env:MONGO_URI = 'mongodb://localhost:27017/taskme_db'; npm run seed
	```

- En passant l'URI en argument:
	```powershell
	node scripts/seed.js "mongodb://localhost:27017/taskme_db" --drop
	```

L'option `--drop` supprime les utilisateurs existants avant d'insérer les exemples.

Tester l'API (enregistrement d'un utilisateur)
-------------------------------------------

PowerShell (Invoke-RestMethod):

```powershell
Invoke-RestMethod -Uri http://localhost:5000/api/users/register -Method POST -ContentType 'application/json' -Body (@{name='Test';email='test@example.com';password='pass123'} | ConvertTo-Json)
```

Ou avec curl (bash / WSL):

```bash
curl -X POST http://localhost:5000/api/users/register -H 'Content-Type: application/json' -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```


