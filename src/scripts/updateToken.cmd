@echo off
echo //registry.npmjs.org/:_authToken=%npm_token%
npm config set //registry.npmjs.org/:_authToken=%npm_token%
