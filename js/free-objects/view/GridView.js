// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

export default ratioAndProportion.register( 'GridView', Enumeration.byKeys( [ 'HORIZONTAL', 'BOTH', 'NONE' ], {
  beforeFreeze: GridView => {

    /**
     * @param {GridView} gridView
     * @returns {boolean} - whether or not the provided enum value should result in displayed vertical grid lines
     */
    GridView.displayVertical = gridView => {
      return gridView === GridView.BOTH;
    };

    /**
     * @param {GridView} gridView
     * @returns {boolean} - whether or not the provided enum value should result in displayed horizontal grid lines
     */
    GridView.displayHorizontal = gridView => {
      return gridView === GridView.BOTH || gridView === GridView.HORIZONTAL;
    };
  }
} ) );