import _ from 'lodash';

import DB from './db';
import {isUUID} from './utils';

export const request_logger = (req, res, next) => {console.log(req.method, req.url); next()};

export const auth = (req, res, next) => {
  const client_id = _.get(req.headers, 'x-client-id');

  if (!isUUID(client_id)) {
    res.status(400).json({'bad_header': 'x-client-id'});
    return;
  }

  DB.users.get({id: client_id})
    .then(users => {
      if (_.isEmpty(users)) {
        res.status(403).send();
        return;
      }

      req.user = users[0];
      next();
    })
};

export const action = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res))
    .then(() => {if (next) next()})
    .catch(e => res.status(500).end());
};
