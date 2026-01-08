require('dotenv').config();
const connectDB = require('../config/db');
const Report = require('../models/Report');

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
      await Report.deleteMany({});
      console.log('Existing reports removed');
    }

    const reports = [
      {
        title: 'Rapport individuel - Heures semaine 01',
        type: 'individual',
        author: null, // will be filled
        targetUser: null,
        period: { from: new Date('2024-01-01'), to: new Date('2024-01-07') },
        tasks: [ { status: 'done', hours: 8 }, { status: 'in_progress', hours: 4 } ],
        tags: ['heures','individuel'],
        status: 'published'
      },
      {
        title: 'Rapport global - Affectations hebdo',
        type: 'global',
        author: null,
        assignments: [],
        tags: ['affectations','global'],
        status: 'published'
      }
    ];

    // Attach current user as author if exists (first user)
    const User = require('../models/User');
    const firstUser = await User.findOne();
    for (const r of reports) {
      r.author = firstUser ? firstUser._id : undefined;
      if (!r.targetUser && firstUser) r.targetUser = firstUser._id;
      const exists = await Report.findOne({ title: r.title });
      if (exists) {
        console.log(`Report ${r.title} already exists — skipping`);
        continue;
      }
      const report = new Report(r);
      await report.save();
      console.log(`Created report ${r.title}`);
    }

    console.log('Report seeding finished');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();