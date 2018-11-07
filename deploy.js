#!/usr/bin/env node

const ghpages = require('gh-pages');
const path = require('path');
const fs = require('fs');

ghpages.publish('dist', {
  branch: 'gh-pages',
  repo: 'https://gitlab.com/jeffrey-xiao/nes-web',
});
