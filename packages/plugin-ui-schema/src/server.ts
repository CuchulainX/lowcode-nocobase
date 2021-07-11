import path from 'path';
import { Application } from '@nocobase/server';
import { registerModels, Table } from '@nocobase/database';
import * as models from './models';

export default async function (this: Application, options = {}) {
  const database = this.database;
  registerModels(models);

  database.import({
    directory: path.resolve(__dirname, 'collections'),
  });

  database.getModel('ui_schemas').beforeCreate((model) => {
    if (!model.get('name')) {
      model.set('name', model.get('key'));
    }
  });
}