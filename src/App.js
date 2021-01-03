import React, {Component} from 'react'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import Rank from './components/Rank/Rank'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai'

const app = new Clarifai.App({
  apiKey: '37c979d18a0b4c0faf2a8795ed4eb927'
});

const particlesOptions = {
  
    particles: {
      number:{
        value: 90,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
  };


class App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false
    }
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width_I = Number(image.width);
    const height_I = Number(image.height);
    console.log(width_I,height_I);
    console.log(clarifaiFace.left_col, clarifaiFace.right_col, clarifaiFace.top_row, clarifaiFace.bottom_row)
    return {
      leftCol: clarifaiFace.left_col * width_I,
      topRow: clarifaiFace.top_row * height_I,
      rightCol: width_I - (clarifaiFace.right_col * width_I),
      bottomRow: height_I - (clarifaiFace.bottom_row * height_I)
    }
  }

  displayFaceBox = (box) => {
    console.log(box)
    this.setState({box: box})
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input})
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err))
    
  }

  onRouteChange =(route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    }else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />    
        <Navigation isSignedIn={isSignedIn} onRouteChange = {this.onRouteChange}/>
        { route === 'signin' 
          ? <SignIn onRouteChange={this.onRouteChange}/>
          :(
            route === 'home'
            ?<div> 
              <Logo/>
              <Rank/>
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
                />
              <FaceRecognition box = {box} imageUrl={imageUrl}/>
            </div>
            :<Register onRouteChange={this.onRouteChange}/>
          )
          
        }

      </div>
    );
  }
}

export default App;
