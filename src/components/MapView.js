import React, {Component} from 'react';
import { loadModules } from 'esri-loader';
import {getProjectName} from '../utils';
import {loader} from '../config';
import ChartView from './ChartView';

const dotRenderer = {
  type: "simple",
  symbol: {
    type: "simple-marker",
    size: 12,
    style: "square",
    color: [76,129,205,191],
    outline: {
      width: 1,
      color: [0,0,0,255]
    }
  }
};

const polygonRenderer = {
  type: "simple",
  symbol: {
    type: "simple-fill",
    color: [76,129,205,191],
    outline: {
      width: 1,
      color: [0,0,0,255]
    }
  }
}

const zoomSwitch = 17;

class MapView extends Component {

  constructor(props, context){
    super(props, context);
    this.loadedModules = {};
    this._onEditSync = this._onEditSync.bind(this);
    this._onZoomChange = this._onZoomChange.bind(this);
  }

  _onEditSync(newValue, oldValue){
    if(!newValue && oldValue){
      this.props.onProjectEdited(this.props.project);
    }
  }

  _onZoomChange(newValue, oldValue){
    if(!this.lyr) return;
    if(newValue > zoomSwitch && oldValue < zoomSwitch){
      this.lyr.renderer = polygonRenderer;
    } else if(newValue < zoomSwitch && oldValue > zoomSwitch){
      this.lyr.renderer = dotRenderer;
    }
  }

  componentDidMount(){
    loadModules([
      'esri/views/MapView',
      'esri/Map',
      'esri/widgets/LayerList',
      'esri/widgets/Editor',
      'esri/layers/ImageryLayer',
      'esri/layers/FeatureLayer',
      'esri/core/watchUtils'
    ], loader)
    .then(([MapView, Map, LayerList, Editor, ImageryLayer, FeatureLayer, wU]) => {

      this.loadedModules = {
        FeatureLayer,
        Editor
      }

      const rgbLyr = new ImageryLayer({
        url: "https://naip.arcgis.com/arcgis/rest/services/NAIP/ImageServer",
        title: "NAIP Imagery - Natural Color",
        popupEnabled: false
      })
      const infrLyr = new ImageryLayer({
        portalItem: {
          id: "e4da3b6720f545aeaaf3fe8141da1e21"
        },
        title: "NAIP Imagery - Color Infrared",
        visible: false,
        popupEnabled: false
      })
      const ndviLyr = new ImageryLayer({
        portalItem: {
          id: "aa9c87d6f17b452296252bd75005f6a4"
        },
        title: "NAIP Imagery - NDVI",
        visible: false,
        popupEnabled: false
      })

      this.map = new Map({
        basemap: "gray-vector",
        layers: [ndviLyr, infrLyr, rgbLyr]
      })
      this.view = new MapView({
        container: "mapview",
        map: this.map,
        center: [-117.18296, 34.05738],
        zoom: 11,
        constraints: {
          snapToZoom: false
        }
      });

      this.view.when(_ => {
        const layerList = new LayerList({
          view: this.view
        });
        this.view.ui.add(layerList, "bottom-right");

        this.scaleHandler = this.view.watch('zoom', this._onZoomChange);
        
        if(!this.props.isEditor) {
          return;
        };
        const editor = new Editor({
          view: this.view,
          label: 'Create and edit labels'
        });
        this.view.ui.add(editor, "top-right");
        this.watchHandler = wU.watch(editor.viewModel, 'syncing', this._onEditSync);

      }).catch(er => console.log(er));

    })
  }

  _addLayerFromProps(){
    const lM = this.loadedModules;
    if(!lM.FeatureLayer) return;

    const renderer = this.view.zoom > zoomSwitch
      ? polygonRenderer
      : dotRenderer;

    this.lyr = new lM.FeatureLayer({
      portalItem: {id: this.props.project.id},
      title: getProjectName(this.props.project),
      renderer
    })
    this.map.add(this.lyr);
    this.lyr.queryExtent({where: "1=1"}).then(res => {
      if(res.count > 0){
        this.view.goTo(res.extent);
      } else {
        this.view.goTo(this.lyr.fullExtent);
      }
    })
  }

  componentDidUpdate(prevProps){
    if(!this.props.project) return;
    if(!prevProps.project){
      this._addLayerFromProps()
    } else if(prevProps.project.id !== this.props.project.id){
      this.map.remove(this.lyr);
      this._addLayerFromProps();
    }
  }

  componentWillUnmount(){
    if(this.watchHandler) this.watchHandler.remove();
    if(this.scaleHandler) this.scaleHandler.remove();
  }
  
  render() {

    const chartVisible = this.props.project && !this.props.isEditor ? '' : 'none';
    let chart = <div
      style={{
        display: chartVisible,
        position: "absolute",
        top: "80px",
        right: "15px",
        width: "280px",
        height: "380px",
        padding: "10px",
        background: "white",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)"
      }}>
      <ChartView project={this.props.project} token={this.props.token}/>
    </div>


    return (
      <>
        <div id="mapview" style={{width: "100%", maxHeight: "100%", "flexGrow": 1}}/>
        {chart}
      </>
    )
  }
  
}

export default MapView;

