// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {PanResponder,View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import * as THREE from 'three';
import ImprovedNoise from '../js/ImprovedNoise'
import FirstPersonControls from '../js/FirstPersonControls'
import THREEView from './THREEView'
import Sky from '../js/SkyShader'
import Dpad from './Dpad'

console.ignoredYellowBox = ['THREE.WebGLRenderer'];


var sky, sunSphere;
var container, stats;
var camera, controls, scene, renderer;
var mesh, mat;
var worldWidth = 200, worldDepth = 200,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2,
data = generateHeight( worldWidth, worldDepth );

function generateHeight( width, height ) {
  var data = [], perlin = new ImprovedNoise(),
  size = width * height, quality = 2, z = Math.random() * 100;
  for ( var j = 0; j < 4; j ++ ) {
    if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
    for ( var i = 0; i < size; i ++ ) {
      var x = i % width, y = ( i / width ) | 0;
      data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;
    }
    quality *= 4
  }
  return data;
}

function getY( x, z ) {
  return ( data[ x + z * worldWidth ] * 0.2 ) | 0;
}

export default class App extends React.Component {

  state = {
    ready: false
  }

  touchesBegan = (event, gestureState) => {
    if (controls) {

      controls.onMouseDown(event, gestureState.numberActiveTouches)
    }
  }
  touchesMoved = (event, gestureState) => {
    event.preventDefault();
    const {locationX, locationY} = event.nativeEvent;
    if (controls) {
      controls.onMouseMove(event, gestureState.numberActiveTouches, gestureState)
    }
  }
  touchesEnded = (event, gestureState) => {
    event.preventDefault();
    const {locationX, locationY} = event.nativeEvent;
    if (controls) {
      controls.onMouseUp(event, gestureState.numberActiveTouches)
    }
  }

  setupGestures = () => {
    /// Gesture
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: this.touchesBegan,
      onPanResponderMove: this.touchesMoved,
      onPanResponderRelease: this.touchesEnded,
      onPanResponderTerminate: this.touchesEnded, //cancel
      onShouldBlockNativeResponder: () => false,
    });

  }

  buildTerrain = (texture) => {
    let {objects} = this

    // // sides
    var light = new THREE.Color( 0xffffff );
    var shadow = new THREE.Color( 0x505050 );
    var matrix = new THREE.Matrix4();
    var pxGeometry = new THREE.PlaneGeometry( 100, 100 );
    pxGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    pxGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    pxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    pxGeometry.rotateY( Math.PI / 2 );
    pxGeometry.translate( 50, 0, 0 );
    var nxGeometry = new THREE.PlaneGeometry( 100, 100 );
    nxGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    nxGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    nxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    nxGeometry.rotateY( - Math.PI / 2 );
    nxGeometry.translate( - 50, 0, 0 );
    var pyGeometry = new THREE.PlaneGeometry( 100, 100 );
    pyGeometry.faces[ 0 ].vertexColors = [ light, light, light ];
    pyGeometry.faces[ 1 ].vertexColors = [ light, light, light ];
    pyGeometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
    pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
    pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
    pyGeometry.rotateX( - Math.PI / 2 );
    pyGeometry.translate( 0, 50, 0 );
    var py2Geometry = new THREE.PlaneGeometry( 100, 100 );
    py2Geometry.faces[ 0 ].vertexColors = [ light, light, light ];
    py2Geometry.faces[ 1 ].vertexColors = [ light, light, light ];
    py2Geometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
    py2Geometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
    py2Geometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
    py2Geometry.rotateX( - Math.PI / 2 );
    py2Geometry.rotateY( Math.PI / 2 );
    py2Geometry.translate( 0, 50, 0 );
    var pzGeometry = new THREE.PlaneGeometry( 100, 100 );
    pzGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    pzGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    pzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    pzGeometry.translate( 0, 0, 50 );
    var nzGeometry = new THREE.PlaneGeometry( 100, 100 );
    nzGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    nzGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    nzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    nzGeometry.rotateY( Math.PI );
    nzGeometry.translate( 0, 0, - 50 );
    var geometry = new THREE.Geometry();
    var dummy = new THREE.Mesh();
    for ( var z = 0; z < worldDepth; z ++ ) {
      for ( var x = 0; x < worldWidth; x ++ ) {
        var h = getY( x, z );
        matrix.makeTranslation(
          x * 100 - worldHalfWidth * 100,
          h * 100,
          z * 100 - worldHalfDepth * 100
        );
        var px = getY( x + 1, z );
        var nx = getY( x - 1, z );
        var pz = getY( x, z + 1 );
        var nz = getY( x, z - 1 );
        var pxpz = getY( x + 1, z + 1 );
        var nxpz = getY( x - 1, z + 1 );
        var pxnz = getY( x + 1, z - 1 );
        var nxnz = getY( x - 1, z - 1 );
        var a = nx > h || nz > h || nxnz > h ? 0 : 1;
        var b = nx > h || pz > h || nxpz > h ? 0 : 1;
        var c = px > h || pz > h || pxpz > h ? 0 : 1;
        var d = px > h || nz > h || pxnz > h ? 0 : 1;
        if ( a + c > b + d ) {
          var colors = py2Geometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = b === 0 ? shadow : light;
          colors[ 1 ] = c === 0 ? shadow : light;
          colors[ 2 ] = a === 0 ? shadow : light;
          var colors = py2Geometry.faces[ 1 ].vertexColors;
          colors[ 0 ] = c === 0 ? shadow : light;
          colors[ 1 ] = d === 0 ? shadow : light;
          colors[ 2 ] = a === 0 ? shadow : light;
          geometry.merge( py2Geometry, matrix );
        } else {
          var colors = pyGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = a === 0 ? shadow : light;
          colors[ 1 ] = b === 0 ? shadow : light;
          colors[ 2 ] = d === 0 ? shadow : light;
          var colors = pyGeometry.faces[ 1 ].vertexColors;
          colors[ 0 ] = b === 0 ? shadow : light;
          colors[ 1 ] = c === 0 ? shadow : light;
          colors[ 2 ] = d === 0 ? shadow : light;
          geometry.merge( pyGeometry, matrix );
        }
        if ( ( px != h && px != h + 1 ) || x == 0 ) {
          var colors = pxGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = pxpz > px && x > 0 ? shadow : light;
          colors[ 2 ] = pxnz > px && x > 0 ? shadow : light;
          var colors = pxGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = pxnz > px && x > 0 ? shadow : light;
          geometry.merge( pxGeometry, matrix );
        }
        if ( ( nx != h && nx != h + 1 ) || x == worldWidth - 1 ) {
          var colors = nxGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxnz > nx && x < worldWidth - 1 ? shadow : light;
          colors[ 2 ] = nxpz > nx && x < worldWidth - 1 ? shadow : light;
          var colors = nxGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = nxpz > nx && x < worldWidth - 1 ? shadow : light;
          geometry.merge( nxGeometry, matrix );
        }
        if ( ( pz != h && pz != h + 1 ) || z == worldDepth - 1 ) {
          var colors = pzGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxpz > pz && z < worldDepth - 1 ? shadow : light;
          colors[ 2 ] = pxpz > pz && z < worldDepth - 1 ? shadow : light;
          var colors = pzGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = pxpz > pz && z < worldDepth - 1 ? shadow : light;
          geometry.merge( pzGeometry, matrix );
        }
        if ( ( nz != h && nz != h + 1 ) || z == 0 ) {
          var colors = nzGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = pxnz > nz && z > 0 ? shadow : light;
          colors[ 2 ] = nxnz > nz && z > 0 ? shadow : light;
          var colors = nzGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = nxnz > nz && z > 0 ? shadow : light;
          geometry.merge( nzGeometry, matrix );
        }
      }
    }

    var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { map: texture, vertexColors: THREE.VertexColors } ) );
    scene.add( mesh );
  }

  setupControls = () => {
    this.setupGestures()

    controls = new FirstPersonControls( camera );
    controls.movementSpeed = 1000;
    controls.lookSpeed = 0.125;
    controls.lookVertical = true;
    controls.constrainVertical = true;
    controls.verticalMin = 1.1;
    controls.verticalMax = 2.2;
  }

  setupSky = () => {
    // Add Sky Mesh
    let sky = new Sky();
    scene.add( sky.mesh );

    // Add Sun Helper
    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry( 2000, 16, 8 ),
      new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );

    var effectController  = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.49, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: true
    };

    var distance = 400000;
    var uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    var theta = Math.PI * ( effectController.inclination - 0.5 );
    var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy( sunSphere.position );


  }

  async componentWillMount() {
    let {objects, texture} = this

    const textureAsset = Expo.Asset.fromModule(
      require('../assets/images/atlas.png'));
      await textureAsset.downloadAsync();
      texture = THREEView.textureFromAsset(textureAsset);
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearMipMapLinearFilter;


      camera = new THREE.PerspectiveCamera( 50, width / height, 1, 20000 );
      camera.position.y = getY( worldHalfWidth, worldHalfDepth ) * 100 + 100;

      this.setupControls()

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2( 0xffffff, 0.00015 );

      this.buildTerrain(texture)

      var ambientLight = new THREE.AmbientLight( 0xcccccc );
      scene.add( ambientLight );
      var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
      directionalLight.position.set( 1, 1, 0.5 ).normalize();
      scene.add( directionalLight );

      // this.setupSky()

      this.setState({ready: true})
    }

    tick = (dt) => {
      if (controls) {
        controls.update( dt, this.moveID );
      }
    }

    render() {
      if (!this.state.ready) {
        return null
      }

      return (
        <View style={{flex: 1, backgroundColor: 'green'}}>
          <THREEView
            {...this.panResponder.panHandlers}
            style={{ flex: 1 }}
            scene={scene}
            camera={camera}
            tick={this.tick}
          />
          <Dpad style={{position: 'absolute', bottom: 8, left: 8}} onPressOut={_=> {this.moveID = null}} onPress={id => {
              this.moveID = id
            }}
          />
        </View>
      );
    }
  }
