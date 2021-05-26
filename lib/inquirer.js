const inquirer = require('inquirer');
const os = require('os');

const logicalCores = os.cpus()?.length ?? 4;

module.exports = {
  askSearchTerm: () => {
    const questions = [
      {
        name: 'term',
        type: 'input',
        message: 'Enter your vanity term to search for:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a support vanity term';
          }
        }
      },
      {
        name: 'threads',
        type: 'number',
        message: 'Enter the number of threads to use:',
        default: logicalCores,
        validate: function( value ) {
          if (value > 0) {
            return true;
          } else {
            return 'Please enter a number greater than 0';
          }
        }
      },
    ];
    return inquirer.prompt(questions);
  },
};