import { Construct } from 'constructs';
import { App, Chart} from 'cdk8s';
import { Deployment, Ingress, IngressBackend } from 'cdk8s-plus-25';

export interface Myprops {
  readonly env?: string;
}

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: Myprops) {
    super(scope, id);

    // define resources here
    const depl = new Deployment(this, 'Deploy', {
      containers: [
        {
          image: 'nginx',
          ports: [{
            number: 9000
          }]
        }
      ],
      metadata: {
        labels: {
          env: props.env || 'development'
        }
      }
    })

    const ingress = new Ingress(this, 'AppIngres', {})
    const backend = IngressBackend.fromService(depl.exposeViaService({ports: [{port: 9000}]}));
    ingress.addHostRule('myapp.autops.cloud', '/', backend )

  }
}

const app = new App();
new MyChart(app, 'production', {env: 'production'});
new MyChart(app, 'development', {env: 'development'});
app.synth();
