import React, {PureComponent} from 'react';
import Card, {
  CardTitle,
  CardContent
} from 'calcite-react/Card'
import Button from 'calcite-react/Button';
import ProgressBar from './ProgressBar';
import PencilIcon from 'calcite-ui-icons-react/PencilIcon';
import GraphTimeSeriesIcon from 'calcite-ui-icons-react/GraphTimeSeriesIcon';
import styled from 'styled-components';
import {getProjectName} from '../utils';

const CornerButton = styled(Button)`
  position: absolute;
  top: 12px;
  right: 16px;
  padding: 4px;
`
const AdjustedTitle = styled(CardTitle)`
  width: calc(100% - 2.5rem)
`

const ThinPencil = styled(PencilIcon)`
  margin: 0 !important;
`
const ThinGraph = styled(GraphTimeSeriesIcon)`
  margin: 0 !important;
`

const RightLabel = styled.div`
  margin: 0;
  float: right;
`

const ProjectCard = styled(Card)`
  border: ${props => props.selected ? '1px solid #0079c1' : ''}
`

class ActionButton extends PureComponent{

  constructor(props, context){
    super(props,context);
    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    this.props.onClick(this.props.project);
  }

  render(){
    const icon = this.props.isEditor
      ? <ThinPencil/>
      : <ThinGraph size={20}/>;
    return (
      <CornerButton
        onClick={this._onClick}
        small
        clear
        icon={icon}>
      </CornerButton>
    )
  }
}

class ProjectPanel extends PureComponent {

  constructor(props, context){
    super(props, context);
    this.portal = props.portal;

    this._getProjectCard = this._getProjectCard.bind(this);
    this._onProjectSelected = this._onProjectSelected.bind(this);

    this.state = {
      projects: [],
      selectedId: null
    }
  }

  componentDidMount(){
    const queryParams = {
      query: "access:shared",
      sortField: "created",
      sortOrder: "asc",
      num: 20
    }
    this.portal.queryItems(queryParams)
      .then(res => {
        let nextState = res.results.reduce((acc, p) => {
          const tag = p.tags.find(t => t.includes('__nfeatures:'));
          if(!tag) return acc;
          const nFeatures = parseInt(tag.replace('__nfeatures:',''));
          acc[p.id] = {max: nFeatures};
          return acc;
        }, {});

        nextState.projects = res.results;
        this.setState(nextState);
        this.props.onProjectsLoaded(res.results);
      })
  }


  _onProjectSelected(project){
    this.setState({
      selectedId: project.id
    });
    this.props.onProjectSelected(project);
  }

  _getProjectCard(project, i){
    const title = getProjectName(project);

    const max = this.state[project.id]
      ? this.state[project.id].max
      : undefined;
    
    const current = this.props.labelCounts[project.id]
    ? this.props.labelCounts[project.id].count
    : undefined;

    const progress = max !== undefined && current !== undefined
      ? Math.ceil(100* (current / max))
      : 0;

    const maxString = max ? max.toString() : '--';
    const currentString = current ? current.toString() : '--';

    return (
      <ProjectCard selected={project.id === this.state.selectedId} key={project.id} style={{ maxWidth: '20rem', marginBottom: "1rem" }}>
        <CardContent>
          <AdjustedTitle>{title}</AdjustedTitle>
          <ActionButton
            project={project}
            onClick={this._onProjectSelected}
            isEditor={this.props.isEditor}/>
          <ProgressBar percentage={progress}/>
          <div style={{textAlign:"right"}}>
            <RightLabel>{currentString}/{maxString} features</RightLabel>
          </div>
        </CardContent>
      </ProjectCard>
    )
  }

  render(){
    const projects = this.state.projects.map(this._getProjectCard);
    return (
      <div style={{width: "25rem", padding: "1rem", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"}}>
        <h3 style={{marginTop: 0}}>Projects</h3>
        {projects}
      </div>
    )
  }
}

export default ProjectPanel;