import { Construct } from 'constructs';
import { App, Chart, ChartProps, Size, JsonPatch, ApiObject } from 'cdk8s';
import {Cpu, Deployment, DeploymentStrategy, EnvValue, Ingress, IngressBackend, PercentOrAbsolute} from 'cdk8s-plus-22';

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    const deployment = new Deployment(this, 'deployment', {
      metadata:{
        annotations: {
          'prometheus.io/scrape': "true",
          'prometheus.io/port': "9797",
        },
        labels: {
          app: 'podinfo',
          team: 'cest',
        }
      },
      strategy: DeploymentStrategy.rollingUpdate({maxUnavailable: PercentOrAbsolute.absolute(0)}),
      containers:[{
        image: 'ghcr.io/stefanprodan/podinfo:6.2.2',
        args: [
          './podinfo',
          '--port=9898',
          '--port-metrics=9797',
          '--grpc-port=9999',
          '--grpc-service-name=podinfo',
          '--level=debug',
          '--random-delay=false',
          '--random-error=false',
        ],
        envVariables: {
          PODINFO_UI_COLOR: EnvValue.fromValue('#34577c')
        },
        resources: {
          cpu: {
            limit: Cpu.millis(800),
            request: Cpu.millis(100),
          },
          memory: {
            limit: Size.mebibytes(500),
            request: Size.mebibytes(100),
          }
        },
        ports: [
          {
            number: 9898,
            name: 'http',
          },
          {
            number: 9797,
            name: 'http-metrics',
          },
          {
            number: 9999,
            name: 'grpc',
          }
        ]
      }]
    })
    
    const backend = IngressBackend.fromService(deployment.exposeViaService({ports: [{port: 9898}]}));
    
    const ingress = new Ingress(this, 'ingress', {
      metadata: {
        annotations: {
          'alb.ingress.kubernetes.io/scheme': 'internet-facing',
          'alb.ingress.kubernetes.io/target-type': 'ip',
          'alb.ingress.kubernetes.io/subnets': 'subnet-004678903456785,subnet-0b1321321321e212,subnet-06489d92e5839353',
          'alb.ingress.kubernetes.io/tags': 'Application=podinfo, Automation=kubernetes',
          'alb.ingress.kubernetes.io/certificate-arn': 'arn:aws:acm:eu-west-1:09876543211:certificate/56fff548-218d-4f0e-9965-54548697784',
        },
      }
    });
    ingress.addHostRule('k8s-podinfo.mydomain.tld', '/', backend)
    ingress.addTls([{hosts: ['k8s-podinfo.mydomain.tld']}])
   
    // Add ingressClassName (not supported by CDK atm)
    const ing = ApiObject.of(ingress)
    ing?.addJsonPatch(JsonPatch.add('/spec/ingressClassName', 'alb'))

  }
}

const app = new App();
new MyChart(app, 'cdk');
app.synth();
