import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';
import { UserFactory } from './user.js';
import { TicketFactory } from './ticket.js';

// Initialize Sequelize with appropriate connection info
let sequelize: Sequelize;

// Check for DATABASE_URL first (Render provides this)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // needed for Render's self-signed cert
      },
      decimalNumbers: true,
    },
  });
} else {
  // Local development connection
  const password = process.env.DB_PASSWORD === '' ? undefined : process.env.DB_PASSWORD;
  
  sequelize = new Sequelize(
    process.env.DB_NAME || 'kanban_db', 
    process.env.DB_USER || 'postgres', 
    password,
    {
      host: 'localhost',
      dialect: 'postgres',
      dialectOptions: {
        decimalNumbers: true,
      },
      logging: console.log, // Enable logging to see connection issues
    }
  );
}

const User = UserFactory(sequelize);
const Ticket = TicketFactory(sequelize);

User.hasMany(Ticket, { foreignKey: 'assignedUserId' });
Ticket.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignedUser'});

export { sequelize, User, Ticket };
