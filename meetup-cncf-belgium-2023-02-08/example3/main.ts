import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import * as crd from './imports/cert-manager.io'

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // define resources here
    new crd.Certificate(this, 'Cert', {
      spec: {
        secretName: 'mysecret',
        issuerRef: {
          name: 'mysecretissuer'
        }
      }
    })

  }
}

const app = new App();
new MyChart(app, 'example3');
app.synth();
