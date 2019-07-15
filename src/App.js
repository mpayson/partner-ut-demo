import React from 'react';
import TopNav, {
  TopNavBrand,
  TopNavTitle,
  TopNavList,
  TopNavActionsList
} from 'calcite-react/TopNav';
import Button from 'calcite-react/Button';
import SignOutIcon from 'calcite-ui-icons-react/SignOutIcon';
import Logo from './logo.svg';
import {LoginWindow, LoaderWindow} from './CommonComponents';
import MapView from './components/MapView';
import ProjectPanel from './components/ProjectPanel';
import { loadModules } from 'esri-loader';
import {portalUrl, appId, loader} from './config';

class App extends React.PureComponent{

  constructor(props, context){
    super(props, context);
    this.esriId = null;

    this._onSignInClick = this._onSignInClick.bind(this);
    this._onSignOutClick = this._onSignOutClick.bind(this);
    this._onProjectSelected = this._onProjectSelected.bind(this);
    this._fetchLabelCountForProject = this._fetchLabelCountForProject.bind(this);
    this.onProjectsLoaded = this.onProjectsLoaded.bind(this);
    this.onProjectEdited = this.onProjectEdited.bind(this);

    this.state = {
      esriLoaded: false,
      user: null,
      project: null,
      labelCounts: {}
    }
  }

  componentDidMount(){
    loadModules([
      'esri/identity/OAuthInfo',
      'esri/identity/IdentityManager',
      'esri/portal/Portal',
      'esri/layers/FeatureLayer'
    ], loader)
    .then(([OAuthInfo, esriId, Portal, FeatureLayer]) => {

      this.loadedModules = {
        FeatureLayer
      }

      const info = new OAuthInfo({appId});
    
      this.esriId = esriId;
      this.esriId.registerOAuthInfos([info]);
      this.portal = new Portal();

      this.esriId.checkSignInStatus(portalUrl)
        .then(_ => {
          return this.portal.load()
        })
        .then(_ => {

          const isEditor = this.portal.user.privileges.find(p => p === 'features:user:edit')
          ? true
          : false;

          this.setState({
            esriLoaded: true,
            user: this.portal.user.fullName,
            token: this.portal.credential.token,
            isEditor
          });
        })
        .catch(er => {
          if(er.name === 'identity-manager:not-authenticated'){
            this.setState({esriLoaded: true, user: null, token: null, isEditor: null});
          } else {
            console.log(er);
          }
        });
    });
  }

  _fetchLabelCountForProject(p){
    const FL = this.loadedModules.FeatureLayer;
    const lyr = new FL({url: p.url});
    lyr.queryFeatureCount({where: "1=1"}).then(count => {
      const nextCounts = {
        ...this.state.labelCounts,
        [p.id]: {count}
      }
      this.setState({
        labelCounts: nextCounts
      });
    });
  }

  onProjectsLoaded(projects){
    projects.forEach(this._fetchLabelCountForProject);
  }

  onProjectEdited(project){
    this._fetchLabelCountForProject(project);
    
  }

  _onSignInClick(){
    this.esriId.getCredential(portalUrl);
  }
  _onSignOutClick(){
    this.esriId.destroyCredentials();
    this.setState({esriLoaded: true, user: null, token: null, isEditor: null});
  }

  _onProjectSelected(project){
    this.setState({
      project
    });
  }

  render(){

    let window;
    if(!this.state.esriLoaded){
      window = <LoaderWindow/>
    } else if (!this.state.user){
      window = <LoginWindow onClick={this._onSignInClick}/>
    } else {
      window = (
        <>
          <ProjectPanel
            portal={this.portal}
            onProjectSelected={this._onProjectSelected}
            labelCounts={this.state.labelCounts}
            onProjectsLoaded={this.onProjectsLoaded}
            isEditor={this.state.isEditor}/>
          <MapView
            project={this.state.project}
            onProjectEdited={this.onProjectEdited}
            isEditor={this.state.isEditor}
            token={this.state.token}/>
        </>
      )
    }

    let signOutButton = this.state.user
    ? <Button
        white
        icon={<SignOutIcon size={25}/>}
        iconPosition="after"
        onClick={this._onSignOutClick}>
        {this.state.user}
      </Button>
    : null;

    return (
      <div>
        <TopNav>
          <TopNavBrand src={Logo}/>
          <TopNavTitle>Label App</TopNavTitle>
          <TopNavList/>
          <TopNavActionsList>
            {signOutButton}
          </TopNavActionsList>
        </TopNav>
        <div style={{width: "100vw", height: "calc(100vh - 4rem)", display: "flex", justifyContent: "center"}}>
          {window}
        </div>
      </div>
    );
  }
}

export default App;
