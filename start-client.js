process.chdir(__dirname + '/client');
import('file:///' + __dirname.replace(/\\/g, '/') + '/client/node_modules/vite/bin/vite.js');
