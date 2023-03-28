import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import {CompanyService} from './lib/company-service'

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // define resources here
    new CompanyService(this, 'NewService', {
      name: 'foo',
      image: 'nginx'
    })

  }
}

const app = new App();
new MyChart(app, 'example2');
app.synth();
