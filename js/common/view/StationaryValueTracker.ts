// Copyright 2022, University of Colorado Boulder

/**
 * A small class that manages a list of values, updating it to maintain a max size, and determining if the values are
 * close enough together to be considered "stationary". This calculation is reflected in this.isStationaryProperty.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import Stats from '../../../../dot/js/Stats.js';
import handleSmoothValue from './handleSmoothValue.js';

// Number of previous positions to keep to determine if the position is "stationary" (adjusting for jitter)
const STATIONARY_HANDS_DETECTED_HISTORY_LENGTH = 20;

// the position range is between 0 and 1, this value is the absolut value of the difference between first and third 
// quartiles of the history. If less than this value, then the hands are considered stationary.
const HANDS_STATIONARY_THRESHOLD = 0.01;

// A single array to prevent garbage each time we calculate the box plot
const boxPlotTempArray: number[] = [];

class StationaryValueTracker {
  public readonly isStationaryProperty = new BooleanProperty( false );
  private readonly historyValues = [];

  constructor( private readonly handsStationaryThreshold = HANDS_STATIONARY_THRESHOLD ) { }

  public update( newPosition: number ): void {
    this.isStationaryProperty.value = this.isStationary( newPosition );
  }

  private isStationary( newPosition: number ): boolean {

    // Keep the array in sync without using the smoothing function
    handleSmoothValue( newPosition, this.historyValues, STATIONARY_HANDS_DETECTED_HISTORY_LENGTH, _.identity );

    // A box plot needs >=4 values to calculate
    if ( this.historyValues.length < 4 ) {
      return false;
    }
    boxPlotTempArray.length = 0;
    for ( let i = 0; i < this.historyValues.length; i++ ) {
      boxPlotTempArray.push( this.historyValues[ i ] );
    }
    const boxPlotValues = Stats.getBoxPlotValues( boxPlotTempArray );
    return Math.abs( boxPlotValues.q3 - boxPlotValues.q1 ) < HANDS_STATIONARY_THRESHOLD;
  }
}


ratioAndProportion.register( 'StationaryValueTracker', StationaryValueTracker );
export default StationaryValueTracker;