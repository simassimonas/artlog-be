import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { Injectable } from '@nestjs/common';

export interface EnvConfig {
  [key: string]: string;
}

@Injectable()
export class ConfigService {
  private static readonly envConfig: EnvConfig = ConfigService.setUpEnvConfig();

  private static setUpEnvConfig() {
    dotenv.config();

    const { MAX_DB_RECORDS, DB_PORT } = process.env;

    const config = {
      MAX_DB_RECORDS,
      DB_PORT,
    };

    return ConfigService.validateInput(config);
  }

  static getEnvConfig() {
    return this.envConfig;
  }

  private static validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = ConfigService.getObjectSchema();

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  private static getObjectSchema(): Joi.ObjectSchema {
    return Joi.object({
      MAX_DB_RECORDS: Joi.number(),
      DB_PORT: Joi.number(),
    });
  }

  get(key: string): any {
    if (process.env.hasOwnProperty(key)) {
      return process.env[key] !== null && key in process.env
        ? process.env[key].toString().trimRight()
        : process.env[key];
    } else if (typeof ConfigService.envConfig[key] !== 'undefined') {
      return ConfigService.envConfig[key];
    }
    throw new Error(`Missing config variable: $key`);
  }
}
