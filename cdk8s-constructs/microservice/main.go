package main

import (
	"github.com/autops/examples/microservice/lib/microservice"

	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/cdk8s-team/cdk8s-core-go/cdk8s/v2"
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

	// Create new Microservice
	ms := microservice.New(chart, jsii.String("ms"), microservice.ContextProps{
		Name: jsii.String("potato"),
	})

	// Add Vault config (annotations) to the Microservice passing the name of the Role in Vault
	ms.AddVaultRole("potato-role")

	return chart
}

func main() {
	app := cdk8s.NewApp(nil)
	NewMyChart(app, "potato-ms", nil)
	app.Synth()
}
