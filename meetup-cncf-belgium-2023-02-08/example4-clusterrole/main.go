package main

import (
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/cdk8s-team/cdk8s-core-go/cdk8s/v2"
	cdk8splus "github.com/cdk8s-team/cdk8s-plus-go/cdk8splus27/v2"
)

type MyChartProps struct {
	cdk8s.ChartProps
}

func NewMyChart(scope constructs.Construct, id string, props *MyChartProps) cdk8s.Chart {
	var cprops cdk8s.ChartProps
	if props != nil {
		cprops = props.ChartProps
	}
	chart := cdk8s.NewChart(scope, jsii.String(id), &cprops)

	eventsAPI := cdk8splus.ApiResource_PODS()

	cdk8splus.NewClusterRole(chart, jsii.String("flux-pubsub-publisher-monitor-kustomizations"), &cdk8splus.ClusterRoleProps{
		Metadata: &cdk8s.ApiObjectMetadata{
			Namespace: jsii.String("flux-system"),
		},
		Rules: &[]*cdk8splus.ClusterRolePolicyRule{
			{
				Endpoints: &[]cdk8splus.IApiEndpoint{eventsAPI},
				Verbs: &[]*string{
					jsii.String("get"),
					jsii.String("list"),
					jsii.String("watch"),
				},
			},
		},
	})

	return chart
}

func main() {
	app := cdk8s.NewApp(nil)
	NewMyChart(app, "example4-clusterrole", nil)
	app.Synth()
}
