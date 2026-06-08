
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
(async () => {
  await mongoose.connect('mongodb+srv://prandhara:ujwalsb@prandhara.czajjlq.mongodb.net/?appName=prandhara');
  const db = mongoose.connection.db;
  const newPasswordHash = await bcrypt.hash('admin123', 12);
  const result = await db.collection('users').updateOne(
      { email: 'ujwal009@gmail.com' },
      { $set: { password: newPasswordHash } }
  );
  console.log('Update result:', result);
  process.exit();
})();
