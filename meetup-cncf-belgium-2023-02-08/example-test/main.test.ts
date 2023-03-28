import {MyApp} from './main';
import {Testing} from 'cdk8s';

describe('Placeholder', () => {
  test('Empty', () => {
    const app = Testing.app();
    const chart = new MyApp(app, 'test-chart', {});
    const results = Testing.synth(chart)
    //console.log(results)
    expect(results).toMatchSnapshot();
  });

  test('Label shoud match', () => {
    const app = Testing.app();
    const chart = new MyApp(app, 'test-chart', {env: 'production'});
    const results = Testing.synth(chart)
    expect(results[0]).toHaveProperty('metadata.labels.env', 'production')
  })

  test('Production needs 2 replicas', () => {
    const app = Testing.app();
    const chart = new MyApp(app, 'test-chart', {env: 'production'});
    const results = Testing.synth(chart)
    //expect(results[0]).toHaveProperty('spec.replicas', 2)
    const deploy = results.filter(v => { return v.kind == 'Deployment'})
    expect(deploy[0]).toHaveProperty('spec.replicas', 2);
  })
});
