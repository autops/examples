import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';
import { Deployment, Ingress, IngressBackend, } from 'cdk8s-plus-25';

export interface MyAppProps {
  readonly env?: string;
}

export class MyApp extends Chart {
  constructor(scope: Construct, id: string, props: MyAppProps) {
    super(scope, id);

    // define resources here
    const depl = new Deployment(this, "AppDeploy", {
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
          env: props.env || 'dev'
        }
      }
    })

    //depl.exposeViaService({ports: [{port: 9000}]})
    //
    const ingress = new Ingress(this, 'AppIngres', {})
    const backend = IngressBackend.fromService(depl.exposeViaService({ports: [{port: 9000}]}));
    ingress.addHostRule('myapp.autops.cloud', '/', backend )

  }


}

const app = new App();
new MyApp(app, 'production', {env: 'production'});
new MyApp(app, 'development', {env: 'development'});
app.synth();
