import { Deployment, Ingress, IngressBackend, Namespace } from 'cdk8s-plus-25';
import { Construct } from 'constructs';

export interface CompanyServiceProps {
  readonly name: string;
  readonly image: string;
}

export class CompanyService extends Construct {
  constructor(scope: Construct, id: string, props: CompanyServiceProps) {
    super(scope, id);

    const namespace = new Namespace(this, 'namespace', {
      metadata: {
        name: `${props.name}-ns`
      }
    });

    const deployment = new Deployment(this, 'deployment', {
      metadata: {
        name: props.name,
        namespace: namespace.name,
      },
      containers: [
        {
          image: props.image,
          ports: [
            {
              number: 8999,
              name: 'http',
            },
          ]
        }
      ]
    });

    // Ingress resources
    const backend = IngressBackend.fromService(deployment.exposeViaService({ports: [{port: 8999}]}));

    const ingress = new Ingress(this, 'ingress', {
      metadata: {
        namespace: namespace.name,
      },
    });
    ingress.addHostRule(`${props.name}.autops.cloud`, '/', backend)
  }
}
