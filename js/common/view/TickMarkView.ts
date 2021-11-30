// Copyright 2020-2021, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';

class TickMarkView {
  static NONE = new TickMarkView( 'NONE' );
  static VISIBLE = new TickMarkView( 'VISIBLE' );
  static VISIBLE_WITH_UNITS = new TickMarkView( 'VISIBLE_WITH_UNITS' );

  static VALUES = [ TickMarkView.NONE, TickMarkView.VISIBLE, TickMarkView.VISIBLE_WITH_UNITS ];
  static KEYS = [ 'NONE', 'VISIBLE', 'VISIBLE_WITH_UNITS' ];

  public name: string;

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

  // Emulate a sealed class
  private constructor( name: string ) {
    this.name = name;
  }
}

ratioAndProportion.register( 'TickMarkView', TickMarkView );
export default TickMarkView;