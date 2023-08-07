// database.ts
import { Sequelize } from 'sequelize';
import { config } from './config';
// import { User } from './models/User';

const sequelize = new Sequelize({
    database: config.DATABASE,
    username: config.USERNAME,
    password: config.PASSWORD,
    host: config.HOST,
    dialect: config.DIALECT as 'mysql'
  });

  async function databaseConnection() {
    try {
      await sequelize.sync({ force: true }); // Set force to true only for development
      console.log('Database synced successfully.');
      // Your application logic goes here
    } catch (error) {
      console.error('Error syncing database:', error);
    }
  }

export default databaseConnection;
