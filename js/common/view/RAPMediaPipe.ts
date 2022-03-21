// Copyright 2022, University of Colorado Boulder

/**
 * This file adds media pipe "hands" input to RAP, see MediaPipe
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import MediaPipe, { HandPoint } from '../../../../tangible/js/mediaPipe/MediaPipe.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RAPRatioTuple from '../model/RAPRatioTuple.js';
import Property from '../../../../axon/js/Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import RAPQueryParameters from '../RAPQueryParameters.js';
import rapConstants from '../rapConstants.js';

if ( RAPQueryParameters.mediaPipe ) {
  MediaPipe.initialize();
}

const NUMBER_TO_SMOOTH = 10;

// Hand-tracking points that we use to calculate the position of the ratio in the sim,  See https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_POINTS = [ 5, 9, 13 ];

class RAPMediaPipe extends MediaPipe {

  readonly isBeingInteractedWithProperty: BooleanProperty;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  leftHandPositions: Vector3[];
  rightHandPositions: Vector3[];

  constructor( ratioTupleProperty: Property<RAPRatioTuple> ) {
    super();
    this.isBeingInteractedWithProperty = new BooleanProperty( false );
    this.ratioTupleProperty = ratioTupleProperty;
    this.leftHandPositions = [];
    this.rightHandPositions = [];
  }

  tupleFromSmoothing( leftHandPosition: Vector3, rightHandPosition: Vector3 ): RAPRatioTuple {
    return new RAPRatioTuple(
      this.getSmoothedPosition( leftHandPosition, this.leftHandPositions ).y,
      this.getSmoothedPosition( rightHandPosition, this.rightHandPositions ).y
    ).constrainFields( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE );
  }

  getSmoothedPosition( position: Vector3, historicalPositions: Vector3[] ) {
    historicalPositions.push( position );
    while ( historicalPositions.length > NUMBER_TO_SMOOTH ) {
      historicalPositions.shift();
    }
    return Vector3.average( historicalPositions );
  }


  reset(): void {
    this.isBeingInteractedWithProperty.reset();
  }

  step(): void {

    const results = MediaPipe.results;

    if ( results && results.multiHandLandmarks.length === 2 ) {
      this.isBeingInteractedWithProperty.value = true;
      const handPositions: Vector3[] = results.multiHandLandmarks.map( ( thing: HandPoint[] ) => {
        const finalPosition = new Vector3( 0, 0, 0 );

        // These are along the center of a hand, about where we have calibrated the hand icon in RAP, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
        HAND_POINTS.forEach( index => {
          const point = thing[ index ];
          assert && assert( typeof point.x === 'number' );
          assert && assert( typeof point.y === 'number' );
          assert && assert( typeof point.z === 'number' );
          const position = new Vector3( 1 - point.x, 1 - point.y, 1 - point.z );
          finalPosition.add( position );
        } );

        return finalPosition.divideScalar( HAND_POINTS.length );
      } );

      handPositions.sort();
      this.ratioTupleProperty.value = this.tupleFromSmoothing( handPositions[ 0 ], handPositions[ 1 ] );
    }
    else {
      this.isBeingInteractedWithProperty.value = false;
    }
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;