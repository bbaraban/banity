const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const inquirer = require("./inquirer.js");
const { Worker } = require("worker_threads");

let addressesChecked = 0;
let addressesFound = [];
let stop = false;

function updateStatus(report) {
  if (report?.count) {
    addressesChecked = addressesChecked + report.count;
    return;
  }

  if (report?.address) {
    addressesFound.push(report);
  }

  if (report?.stop) {
    stop = true;
  }
}

let prevSddressesChecked = addressesChecked;
const start = Date.now();
const formatter = new Intl.NumberFormat();
let searchTerm = "";
const workers = [];

function reportStatus() {
  clear();

  const elapsedTime = Math.floor((Date.now() - start) / 1000);
  const aps = Math.floor((addressesChecked - prevSddressesChecked) / 2);
  prevSddressesChecked = addressesChecked;

  const status = `Searching for: ${searchTerm}
Banano addresses checked: ${formatter.format(addressesChecked)}
APS: ${formatter.format(aps)}
Elapsed time: ${elapsedTime}s
ctrl-c to quit

Banano addresses found: ${addressesFound.length}

${
  addressesFound.length
    ? addressesFound.reduce(
        (message, item) =>
          message +
          `  Address: ${item.address.replace("xrb_", "ban_")}\n  Seed: ${
            item.seed
          }\n\n`,
        ""
      )
    : ""
}`;

  console.log(chalk.yellow(status));

  if (stop) {
    workers.forEach((worker) => worker.terminate());
    return;
  }

  setTimeout(reportStatus, 2000);
}

const run = async () => {
  clear();
  console.log(
    chalk.yellow(figlet.textSync("BANITY", { horizontalLayout: "full" }))
  );
  console.log(chalk.yellow(" ...A banano vanity address finder...\n"));

  const answers = await inquirer.askSearchTerm();
  searchTerm = answers.term;
  stopOnFound = answers.stopOnFound;
  const searchParams = { workerData: { searchParam: searchTerm, stopOnFound } };

  for (i = 0; i < answers.threads; i++) {
    const worker = new Worker("./lib/worker.js", searchParams);
    worker.on("message", (message) => updateStatus(message));
    workers.push(worker);
  }

  reportStatus();
};

run();
