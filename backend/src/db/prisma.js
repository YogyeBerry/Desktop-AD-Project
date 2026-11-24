const path = require('path');
const { PrismaClient } = require('@prisma/client');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db');
  dbUrl = `file:${defaultDbPath}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
