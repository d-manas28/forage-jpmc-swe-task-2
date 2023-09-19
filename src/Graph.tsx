import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
// If we want to use the perspectiveElement as an HTMLElement we need to extend the HTMLElement class 
interface PerspectiveViewerElement extends HTMLElement{
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // Let's add more attributes to plot the perfect graph for real time data feed
      // since we need to view continous line for the stocks, we are using y_line
      elem.setAttribute('view', 'y_line');
      // we need stocks in columns it will help us distinguish between stocks here, hence column-pivot uses stock attribute 
      elem.setAttribute('column-pivots', '["stock"]');
      // We need the stocks in different timelines since their initial timestamps hence in row-pivots uses timestamp
      elem.setAttribute('row-pivots', '["timestamp"]');
      // For now, we need to compare only the stocks' top ask prices
      elem.setAttribute('columns', '["top_ask_price"]');
      // aggregates helps us in handling the duplicates here
      elem.setAttribute('aggregates', `
      {"stock":"distinct count",
      "top_ask_price":"avg",
      "top_bid_price":"avg",
      "timestamp":"distinct count"}`);

    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
