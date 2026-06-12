const bcrypt = require('bcryptjs');
console.log('HASH_ADMIN:', bcrypt.hashSync('Admin123!', 12));
console.log('HASH_OPERATOR:', bcrypt.hashSync('1234', 12));
