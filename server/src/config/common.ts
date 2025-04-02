import { SequelizeModuleOptions } from '@nestjs/sequelize';
function configOptions() {
  const config: any = {};

  config.longPort = {
    appKey: process.env.LONGPORT_APP_KEY || 'xxx',
    appSecret: process.env.LONGPORT_APP_SECRET || 'xxx',
    accessToken: process.env.LONGPORT_ACCESS_TOKEN || 'xxx',
    region: process.env.LONGPORT_REGION || 'cn',
    enableOvernight: process.env.LONGPORT_ENABLE_OVERNIGHT === 'true'
  };

  const sequelizeConfig: SequelizeModuleOptions = {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'xx',
    database: 'xx',
    autoLoadModels: true,
    synchronize: true,
  };
  config.sequelizeConfig = sequelizeConfig;

  return config;
}

export default configOptions();
