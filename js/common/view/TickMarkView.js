// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// TODO: clean this up, there are unused keys like "both", and so "horizontal" doesn't make sense. https://github.com/phetsims/ratio-and-proportion/issues/210
const TickMarkView = Enumeration.byKeys( [ 'HORIZONTAL', 'BOTH', 'NONE', 'HORIZONTAL_UNITS' ], {
  beforeFreeze: TickMarkView => {

    /**
     * @param {TickMarkView} tickMarkView
     * @returns {boolean} - whether or not the provided enum value should result in displayed vertical tick marks
     */
    TickMarkView.displayVertical = tickMarkView => {
      return tickMarkView === TickMarkView.BOTH;
    };

    /**
     * @param {TickMarkView} tickMarkView
     * @returns {boolean} - whether or not the provided enum value should result in displayed horizontal tick marks
     */
    TickMarkView.displayHorizontal = tickMarkView => {
      return tickMarkView === TickMarkView.BOTH || tickMarkView === TickMarkView.HORIZONTAL || tickMarkView === TickMarkView.HORIZONTAL_UNITS;
    };

    /**
     * @param {TickMarkView} tickMarkView
     * @returns {boolean} - whether or not the provided enum value should result in displayed tick mark units
     */
    TickMarkView.displayUnits = tickMarkView => {
      return tickMarkView === TickMarkView.HORIZONTAL_UNITS;
    };

    /**
     * @param tickMarkView
     * @returns {boolean} - whether or not the value indicates PDOM descriptions should be qualitative or quantitative
     */
    TickMarkView.describeQualitative = tickMarkView => {
      return tickMarkView === TickMarkView.NONE;
    };

    /**
     * @param tickMarkView
     * @returns {boolean} - whether or not the value indicates PDOM descriptions should be semi-quantitative
     */
    TickMarkView.describeSemiQualitative = tickMarkView => {
      return tickMarkView === TickMarkView.HORIZONTAL;
    };
  }
} );
ratioAndProportion.register( 'TickMarkView', TickMarkView );
export default TickMarkView;