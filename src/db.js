import _ from 'lodash';
import Promise from 'bluebird';
import { native as pg } from 'pg';
import config from './config';

Promise.promisifyAll(pg, {multiArgs: true});

const _query = (q, args, resultTransform) => {
  console.log(q, args)
  return pg.connectAsync(config.connectionString).spread((connection, release) => {
    const queryResult = connection.queryAsync(q, args);

    const transformedResult = queryResult.then(result => {
      if (resultTransform) {
        return resultTransform(result);
      } else {
        return result;
      }
    });

    return transformedResult.finally(() => release());
  });
};

export const rawQuery = (q, args) => _query(q, args, res => res[0])
export const query = (q, args) => _query(q, args, res => res[0].rows)
export const insert = (q, args) => _query(q, args, res => res[0].rowCount)

const DB = {
  projects: {
    get: () => query('select id, name from projects')
  },
  users: {
    get: ({id}) => query('select * from users where id = $1', [id]),
    put: ({id, name}) => query('insert into users values ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2', [id, name])
  },
  reactions: {
    get: ({project_id}) => query('select * from reactions where project_id = $1', [project_id]),
    getUser: ({project_id, user_id}) => query('select emoji, created_at from reactions where project_id = $1 and user_id = $2', [project_id, user_id]),
    put: ({project_id, user_id, emoji}) => query('insert into reactions (project_id, user_id, emoji) values ($1, $2, $3)', [project_id, user_id, emoji])
  }
};

export default DB;
