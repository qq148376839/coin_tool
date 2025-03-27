import { SequelizeModuleOptions } from '@nestjs/sequelize';
function configOptions() {
  const config: any = {};

  config.tencentCloud = {
    SecretId: 'xx',
    SecretKey: 'xx',
  };

  config.binance = {
    apiKey: 'xxx',
    apiSecret: 'xxx',
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
