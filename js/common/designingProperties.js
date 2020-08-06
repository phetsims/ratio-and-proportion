// Copyright 2020, University of Colorado Boulder

/**
 * Global Properties meant to be temporary for adjusting different design options before implementing a single one.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import ratioAndProportion from '../ratioAndProportion.js';

class DesigningProperties {

  constructor() {

    // border and click sounds for the vertical ratio pointer movement, this is temporary, see https://github.com/phetsims/ratio-and-proportion/issues/45
    this.ratioUISoundsEnabledProperty = new BooleanProperty( true );
  }
}

const designingProperties = new DesigningProperties();
ratioAndProportion.register( 'designingProperties', designingProperties );
export default designingProperties;
