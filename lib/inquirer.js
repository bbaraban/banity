const inquirer = require("inquirer");
const os = require("os");

const logicalCores = os.cpus()?.length ?? 4;
const INVALID_CHARS = ["0", "2", "l", "v"];

module.exports = {
  askSearchTerm: () => {
    const questions = [
      {
        name: "term",
        type: "input",
        message: "Enter your vanity term to search for:",
        validate: function (value) {
          if (
            value.length &&
            !INVALID_CHARS.some((char) => value.includes(char))
          ) {
            return true;
          } else {
            return "Please enter a supported vanity term. Characters: [0,2,1,v] are not supported.";
          }
        },
      },
      {
        name: "threads",
        type: "number",
        message: "Enter the number of threads to use:",
        default: logicalCores,
        validate: function (value) {
          if (value > 0) {
            return true;
          } else {
            return "Please enter a number greater than 0";
          }
        },
      },
      {
        name: "stopOnFound",
        type: "confirm",
        message: "Stop after first address found?",
        default: true,
      },
    ];
    return inquirer.prompt(questions);
  },
};
