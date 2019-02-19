const {
  defaults
} = require('jest-config');

module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: "^.+\\.spec\\.ts$",
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
}
