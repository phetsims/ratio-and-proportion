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
import Utils from '../../../../dot/js/Utils.js';
import RAPQueryParameters from '../RAPQueryParameters.js';

if ( RAPQueryParameters.mediaPipe ) {
  MediaPipe.initialize();
}

class RAPMediaPipe extends MediaPipe {

  readonly isBeingInteractedWithProperty: BooleanProperty;
  private ratioTupleProperty: Property<RAPRatioTuple>;

  constructor( ratioTupleProperty: Property<RAPRatioTuple> ) {
    super();
    this.isBeingInteractedWithProperty = new BooleanProperty( false );
    this.ratioTupleProperty = ratioTupleProperty;
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
        const handPoints = [ 3, 5, 9, 13, 17 ];
        handPoints.forEach( index => {
          const point = thing[ index ];
          assert && assert( typeof point.x === 'number' );
          assert && assert( typeof point.y === 'number' );
          assert && assert( typeof point.z === 'number' );
          const position = new Vector3( 1 - point.x, 1 - point.y, 1 - point.z );
          finalPosition.add( position );
        } );

        return finalPosition.divideScalar( handPoints.length );
      } );

      handPositions.sort();
      this.ratioTupleProperty.value = new RAPRatioTuple( Utils.clamp( handPositions[ 0 ].y, 0, 1 ), Utils.clamp( handPositions[ 1 ].y, 0, 1 ) );
      console.log( handPositions.toString() );
    }
    else {
      this.isBeingInteractedWithProperty.value = false;
    }
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;