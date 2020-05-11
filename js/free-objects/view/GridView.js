// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

const GridView = Enumeration.byKeys( [ 'HORIZONTAL', 'BOTH', 'NONE', 'HORIZONTAL_UNITS' ], {
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
      return gridView === GridView.BOTH || gridView === GridView.HORIZONTAL || gridView === GridView.HORIZONTAL_UNITS;
    };

    /**
     * @param {GridView} gridView
     * @returns {boolean} - whether or not the provided enum value should result in displayed grid units
     */
    GridView.displayUnits = gridView => {
      return gridView === GridView.HORIZONTAL_UNITS;
    };

    /**
     * @param gridView
     * @returns {boolean} - whether or not the value indicates PDOM descriptions should be qualitative or quantitative
     */
    GridView.describeQualitative = gridView => {
      return gridView === GridView.NONE;
    };
  }
} );
ratioAndProportion.register( 'GridView', GridView );
export default GridView;