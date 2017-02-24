#!/bin/bash

set -ex
npm run build-fe
npm run build-server
git stage --all && git commit -m 'build' || echo 'nothing to commit'
git push heroku master
