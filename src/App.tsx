import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  // Adding the showGraph property
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [],
      // Adding the newly added property showGraph in the constructor
      // Initializing the property with false as we by default we do not want to show it
      showGraph: false,
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    // we need to render the graph only if showGraph is true
    if (this.state.showGraph) {
      return (<Graph data={this.state.data} />)
    }
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    // Since we need a continous data stream, we need to use timeInterval for the same with data coming in every 200 milliseconds
    var x = 0;
    const timeInterval = setInterval(() => {
      // put the data stream within this interval lambda function
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        this.setState({
          data: serverResponds,
          showGraph: true,
        });
      });
      x = x+1;
      // we need to clear interval once we hit threshold pf 2 minutes
      if(x > 2000){
        clearInterval(timeInterval);
      }
    }, 200);
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => { this.getDataFromServer() }}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
