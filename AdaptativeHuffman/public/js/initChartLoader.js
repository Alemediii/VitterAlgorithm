// noop chart loader - charts removed by user request
export default function initChartLoader(){
  console.debug('initChartLoader noop - charts disabled');
  return Promise.resolve();
}

