// Copyright 2020, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

// @ts-ignore
const TickMarkView = Enumeration.byKeys( [ 'NONE', 'VISIBLE', 'VISIBLE_WITH_UNITS' ], {
  beforeFreeze: ( TickMarkView: TickMarkViewType ) => {

    /**
     * @param {TickMarkView} tickMarkView
     * @returns {boolean} - whether or not the provided enum value should result in displayed horizontal tick marks
     */
    TickMarkView.displayHorizontal = ( tickMarkView: TickMarkViewType ) => {
      return tickMarkView === TickMarkView.VISIBLE || tickMarkView === TickMarkView.VISIBLE_WITH_UNITS;
    };

    /**
     * @param tickMarkView
     * @returns {boolean} - whether or not the value indicates PDOM descriptions should be qualitative or quantitative
     */
    TickMarkView.describeQualitative = ( tickMarkView: TickMarkViewType ) => {
      return tickMarkView === TickMarkView.NONE;
    };

    /**
     * @param tickMarkView
     * @returns {boolean} - whether or not the value indicates PDOM descriptions should be semi-quantitative
     */
    TickMarkView.describeSemiQualitative = ( tickMarkView: TickMarkViewType ) => {
      return tickMarkView === TickMarkView.VISIBLE;
    };
  }
} ) as TickMarkViewType;


type TickMarkViewType = {
  NONE: Object;
  VISIBLE: Object;
  VISIBLE_WITH_UNITS: Object;
  displayHorizontal: ( tmv: TickMarkViewType ) => boolean,
  describeQualitative: ( tmv: TickMarkViewType ) => boolean,
  describeSemiQualitative: ( tmv: TickMarkViewType ) => boolean,
}

ratioAndProportion.register( 'TickMarkView', TickMarkView );
export { TickMarkViewType };
export default TickMarkView;