const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer  = require('./inquirer.js');
const { Worker } = require('worker_threads');


let addressesChecked = 0;
let addressesFound = [];

function updateStatus(report) {
  if(report?.count) {
    addressesChecked = addressesChecked + report.count
    return;
  }

  if(report?.address) {
    addressesFound.push(report);
  }
}

let prevSddressesChecked = addressesChecked;
const start = Date.now();
const formatter = new Intl.NumberFormat();
let searchTerm = '';
function reportStatus() {
  clear();

  const elapsedTime = Math.floor((Date.now() - start) / 1000);
  const aps = Math.floor((addressesChecked - prevSddressesChecked) / 2)
  prevSddressesChecked = addressesChecked;

  const status =
    `Searching for: ${searchTerm}
Banano addresses checked: ${formatter.format(addressesChecked)}
APS: ${formatter.format(aps)}
Elapsed time: ${elapsedTime}s
ctrl-c to quit

Banano addresses found: ${addressesFound.length}

${addressesFound.length ? addressesFound.reduce((message, item) => message + `  Address: ${item.address.replace('xrb_', 'ban_')}\n  Seed: ${item.seed}\n\n`, '') : ''}`;

  console.log(chalk.yellow(status));

  setTimeout(reportStatus, 2000)
}

const run = async () => {
  clear();
  console.log(
    chalk.yellow(
      figlet.textSync('BANITY', { horizontalLayout: 'full' })
    )
  );
  console.log(
    chalk.yellow(" ...A banano vanity address finder...\n"
    )
  );

  const answers = await inquirer.askSearchTerm();
  searchTerm = answers.term;
  const searchParams = { workerData: { searchParam: searchTerm}};

  for (i = 0; i < answers.threads; i++) {
    const worker = new Worker("./lib/worker.js", searchParams);
    worker.on('message', message => updateStatus(message));   
  }

  reportStatus();
};

run();
