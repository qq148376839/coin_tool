import { SequelizeModuleOptions } from '@nestjs/sequelize';

const configOptions = () => {
  const config: any = {};

  config.longPort = {
    appKey: process.env.LONGPORT_APP_KEY || '',
    appSecret: process.env.LONGPORT_APP_SECRET || '',
    accessToken: process.env.LONGPORT_ACCESS_TOKEN || '',
    region: process.env.LONGPORT_REGION || 'cn',
    enableOvernight: process.env.LONGPORT_ENABLE_OVERNIGHT === 'true'
  };

  const sequelizeConfig: SequelizeModuleOptions = {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'qwer1234!',
    database: process.env.DB_DATABASE || 'longport',
    autoLoadModels: true,
    synchronize: true,
  };
  config.sequelizeConfig = sequelizeConfig;

  return config;
};

export default configOptions;
