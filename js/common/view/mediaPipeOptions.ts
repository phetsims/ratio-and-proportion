// Copyright 2022, University of Colorado Boulder

/**
 * Options to control how MediaPipe can be used in the sim.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class MediaPipeOptions {
  xAxisFlippedProperty: Property<boolean>;
  yAxisFlippedProperty: Property<boolean>;

  constructor() {
    this.xAxisFlippedProperty = new BooleanProperty( false );
    this.yAxisFlippedProperty = new BooleanProperty( false );
  }
}

const mediaPipeOptions = new MediaPipeOptions();
ratioAndProportion.register( 'mediaPipeOptions', mediaPipeOptions );
export default mediaPipeOptions;