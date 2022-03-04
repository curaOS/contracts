const nearConfig = require('near-workspaces-ava/ava.config.cjs')

module.exports = {
    ...nearConfig,
    timeout: "5m",
}
