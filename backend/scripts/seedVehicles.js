require('dotenv').config();
const connectDB = require('../config/db');
const Vehicle = require('../models/Vehicle');

const URI = process.env.MONGO_URI || process.argv[2];
const shouldDrop = process.argv.includes('--drop');

if (!URI) {
  console.error('No MONGO_URI provided. Set MONGO_URI in env or pass it as first argument.');
  process.exit(1);
}

(async () => {
  try {
    await connectDB(URI);

    if (shouldDrop) {
      await Vehicle.deleteMany({});
      console.log('Existing vehicles removed');
    }

    const vehicles = [
      {
        matricule: '12345-A-56',
        marque: 'Toyota',
        modele: 'Corolla',
        type: 'Berline',
        carburant: 'Essence',
        annee: 2022,
        kilometrage: 45000,
        couleur: 'Blanc',
        etat: 'disponible',
        affectation: 'individuelle',
        disponibilite: true,
        assurance: { numero: 'AS123456789', dateExpiration: new Date('2025-06-30'), compagnie: 'AXA Assurance' },
        dernierControle: new Date('2024-03-15'),
        prochainControle: new Date('2024-09-15'),
        capacite: 5,
        options: ['GPS', 'Climatisation', 'Camera de recul']
      },
      {
        matricule: '98765-B-12',
        marque: 'Mercedes',
        modele: 'Sprinter',
        type: 'Utilitaire',
        carburant: 'Diesel',
        annee: 2021,
        kilometrage: 85000,
        couleur: 'Gris',
        etat: 'en_mission',
        affectation: 'partagee',
        disponibilite: false,
        assurance: { numero: 'AS987654321', dateExpiration: new Date('2024-12-31'), compagnie: 'Wafa Assurance' },
        dernierControle: new Date('2024-02-28'),
        prochainControle: new Date('2024-08-28'),
        capacite: 9,
        options: ['GPS', 'Climatisation']
      }
    ];

    for (const v of vehicles) {
      const exists = await Vehicle.findOne({ matricule: v.matricule });
      if (exists) {
        console.log(`Vehicle ${v.matricule} already exists — skipping`);
        continue;
      }
      const vehicle = new Vehicle(v);
      await vehicle.save();
      console.log(`Created vehicle ${v.matricule}`);
    }

    console.log('Vehicle seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();