const Sequelize = require('sequelize');
const config = require('./config');

const db = new Sequelize(config.mysql.db, config.mysql.user, config.mysql.pass, {
    host: config.mysql.host,
    dialect: 'mysql'
});

const fileModel = db.define('file', {
    name: { type: Sequelize.STRING },
    path: { type: Sequelize.STRING },
    size: { type: Sequelize.FLOAT },
    nbDownloads: { type: Sequelize.INTEGER },
    scanId: { type: Sequelize.STRING }
});

db.sync();

module.exports = {
    Sequelize: Sequelize,
    File: fileModel
};
