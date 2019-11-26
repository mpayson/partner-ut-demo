import React, {Component} from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  queryFeatures,
} from "@esri/arcgis-rest-feature-layer";
import { defaults } from 'react-chartjs-2';

defaults.global.legend = false;
defaults.global.tooltips.enabled = false;

const defaultParams = {
  returnGeometry: false,
  returnDistinctValues: false,
  returnIdsOnly: false,
  returnCountOnly: false,
  outFields: '*',
}

class ChartView extends Component{

  constructor(props){
    super(props);
    this.state = {
      labelData: {},
      userData: {}
    }
  }

  _updateTimeSeriesDataset(projectUrl){

    const query = {
      ...defaultParams,
      url: `${projectUrl}/0`,
      where: "1=1",
      groupByFieldsForStatistics: "CAST(CreationDate as DATE)",
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "CreationDate",
          outStatisticFieldName: "total_labels"
        }
      ],
      orderByFields: "CAST(CreationDate as DATE)",
      sqlFormat: "standard",
      params: {
        token: this.props.token,
      }
    }

    queryFeatures(query)
      .then(res => {
        const {labels, data} = res.features.reduce((acc, f) => {
          acc.data.push(f.attributes['total_labels']);
          const date = new Date(f.attributes['EXPR_1']);
          acc.labels.push(`${date.getMonth() + 1}/${date.getDay()+1}`);
          return acc;
        }, {labels: [], data: []})

        const nextState = {
          labels: labels,
          datasets: [{
            label: 'Label Counts',
            fill: false,
            data: data,
            borderColor: "#56a5d8",
            backgroundColor: "#56a5d8"
          }]
        }
        this.setState({labelData: nextState});
        
      });
  }

  _updateUserDataset(projectUrl){
    const query = {
      ...defaultParams,
      url: `${projectUrl}/0`,
      where: "1=1",
      groupByFieldsForStatistics: "Creator",
      outStatistics: [
        {
          statisticType: "count",
          onStatisticField: "Creator",
          outStatisticFieldName: "creator_counts"
        }
      ],
      orderByFields: "creator_counts DESC",
      sqlFormat: "standard",
      params: {
        token: this.props.token,
      }
    }
    queryFeatures(query).then(res => {
      const {labels, data} = res.features.reduce((acc, f) => {
        acc.data.push(f.attributes['creator_counts']);
        acc.labels.push(f.attributes['Creator']);
        return acc;
      }, {labels: [], data: []})

      const nextState = {
        labels: labels,
        datasets: [{
          label: 'Label Counts',
          fill: false,
          data: data,
          borderColor: "#56a5d8",
          backgroundColor: "#56a5d8"
        }]
      }
      this.setState({userData: nextState});
    });
  }

  componentDidUpdate(prevProps){
    if(!this.props.project) return;
    
    if(!prevProps.project || prevProps.project.id !== this.props.project.id){
      this._updateTimeSeriesDataset(this.props.project.url);
      this._updateUserDataset(this.props.project.url);
    }
  }

  componentDidMount(){
    if(!this.props.project) return;
    this._updateTimeSeriesDataset(this.props.project.url);
    this._updateUserDataset(this.props.project.url);
  }

  render(){
    return (
      <div>
        <h3 style={{marginTop: 0}}>Activity</h3>
        <h5 style={{margin: "0px"}}>Over Time</h5>
        <Line 
          data={this.state.labelData}
          height={159}
          options={{
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Label Count'
                },
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }}/>
        <h5 style={{margin: "0px"}}>By User</h5>
        <Bar 
          data={this.state.userData}
          height={159}
          options={{
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Label Count'
                },
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }}/>
      </div>
    )
  }

}

export default ChartView;