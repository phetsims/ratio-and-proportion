// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import RichEnumeration from '../../../../phet-core/js/RichEnumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

class TickMarkView extends EnumerationValue {
  static NONE = new TickMarkView();
  static VISIBLE = new TickMarkView();
  static VISIBLE_WITH_UNITS = new TickMarkView();

  static enumeration = new RichEnumeration( TickMarkView );

  /**
   * @param {TickMarkView} tickMarkView
   * @returns {boolean} - whether or not the provided enum value should result in displayed horizontal tick marks
   */
  static displayHorizontal( tickMarkView: TickMarkView ): boolean {
    return tickMarkView === TickMarkView.VISIBLE || tickMarkView === TickMarkView.VISIBLE_WITH_UNITS;
  }

  /**
   * @param tickMarkView
   * @returns {boolean} - whether or not the value indicates PDOM descriptions should be qualitative or quantitative
   */
  static describeQualitative( tickMarkView: TickMarkView ): boolean {
    return tickMarkView === TickMarkView.NONE;
  }

  /**
   * @param tickMarkView
   * @returns {boolean} - whether or not the value indicates PDOM descriptions should be semi-quantitative
   */
  static describeSemiQualitative( tickMarkView: TickMarkView ): boolean {
    return tickMarkView === TickMarkView.VISIBLE;
  }
}

ratioAndProportion.register( 'TickMarkView', TickMarkView );
export default TickMarkView;