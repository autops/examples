package microservice

import (
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/cdk8s-team/cdk8s-core-go/cdk8s/v2"
	kplus "github.com/cdk8s-team/cdk8s-plus-go/cdk8splus26/v2"
)

type Microservice struct {
	Name       *string
	Deployment kplus.Deployment
}

type ContextProps struct {
	Name *string
}

func New(scope constructs.Construct, id *string, props ContextProps) Microservice {

	deployment := kplus.NewDeployment(scope, jsii.Sprintf("%s-deployment", *id), &kplus.DeploymentProps{
		Metadata: &cdk8s.ApiObjectMetadata{
			Name: jsii.String(*props.Name),
		},
		Containers: &[]*kplus.ContainerProps{
			{
				Image: jsii.String("nginx"),
			},
		},
	})

	c := &Microservice{
		Deployment: deployment,
		Name:       jsii.String(*props.Name),
	}

	return *c
}

func (c *Microservice) AddVaultRole(name string) {
	//c.Deployment.AddContainer(&kplus.ContainerProps{Image: jsii.String("initcontainer")})
	c.Deployment.ApiObject().AddJsonPatch(cdk8s.JsonPatch_Add(jsii.String("/metadata/annotations"), map[string]interface{}{
		"vault.hashicorp.com/agent-init-first":        jsii.String("true"),
		"vault.hashicorp.com/agent-inject":            jsii.String("true"),
		"vault.hashicorp.com/agent-inject-secret-aws": jsii.Sprintf("aws/creds/%s", *c.Name),
		"vault.hashicorp.com/agent-inject-template-aws": jsii.Sprintf(`{{- with secret "aws/creds/%s" }}
[default]
aws_access_key_id={{ .Data.access_key }}
aws_secret_access_key={{ .Data.secret_key }}
aws_session_token={{ .Data.security_token }}
{{- end }}`, name),
		"vault.hashicorp.com/secret-volume-path-aws": jsii.Sprintf("/home/%s/.aws/", *c.Name),
	}))
}
