// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

const TickMarkView = Enumeration.byKeys( [ 'VISIBLE', 'NONE', 'VISIBLE_WITH_UNITS' ], {
  beforeFreeze: TickMarkView => {

    /**
     * @param {TickMarkView} tickMarkView
     * @returns {boolean} - whether or not the provided enum value should result in displayed horizontal tick marks
     */
    TickMarkView.displayHorizontal = tickMarkView => {
      return tickMarkView === TickMarkView.VISIBLE || tickMarkView === TickMarkView.VISIBLE_WITH_UNITS;
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
      return tickMarkView === TickMarkView.VISIBLE;
    };
  }
} );
ratioAndProportion.register( 'TickMarkView', TickMarkView );
export default TickMarkView;