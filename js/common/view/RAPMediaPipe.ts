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
import ViewSounds from './sound/ViewSounds.js';

if ( RAPQueryParameters.mediaPipe ) {
  MediaPipe.initialize();
}

const NUMBER_TO_SMOOTH = 10;

// Hand-tracking points that we use to calculate the position of the ratio in the sim,  See https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_POINTS = [ 5, 9, 13 ];

class RAPMediaPipe extends MediaPipe {

  readonly isBeingInteractedWithProperty: BooleanProperty;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  antecedentHandPositions: Vector3[];
  consequentHandPositions: Vector3[];
  antecedentViewSounds: ViewSounds;
  consequentViewSounds: ViewSounds;

  constructor( ratioTupleProperty: Property<RAPRatioTuple>, antecedentViewSounds: ViewSounds, consequentViewSounds: ViewSounds ) {
    super();

    this.isBeingInteractedWithProperty = new BooleanProperty( false );
    this.ratioTupleProperty = ratioTupleProperty;
    this.antecedentViewSounds = antecedentViewSounds;
    this.consequentViewSounds = consequentViewSounds;
    this.antecedentHandPositions = [];
    this.consequentHandPositions = [];

    this.isBeingInteractedWithProperty.lazyLink( interactedWith => {
      if ( interactedWith ) {
        this.antecedentViewSounds.boundarySoundClip.onStartInteraction();
        this.consequentViewSounds.boundarySoundClip.onStartInteraction();

        // It is arbitrary here whether to use sounds from antecedent or consequent.
        this.antecedentViewSounds.grabSoundClip.play();
      }
      else {
        this.antecedentViewSounds.boundarySoundClip.onEndInteraction( this.ratioTupleProperty.value.antecedent );
        this.consequentViewSounds.boundarySoundClip.onEndInteraction( this.ratioTupleProperty.value.consequent );

        this.antecedentViewSounds.releaseSoundClip.play();
      }
    } );
  }

  tupleFromSmoothing( leftHandPosition: Vector3, rightHandPosition: Vector3 ): RAPRatioTuple {
    return new RAPRatioTuple(
      this.getSmoothedPosition( leftHandPosition, this.antecedentHandPositions ).y,
      this.getSmoothedPosition( rightHandPosition, this.consequentHandPositions ).y
    ).constrainFields( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE );
  }

  getSmoothedPosition( position: Vector3, historicalPositions: Vector3[] ): Vector3 {
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
      const newValue = this.tupleFromSmoothing( handPositions[ 0 ], handPositions[ 1 ] );
      this.ratioTupleProperty.value = newValue;
      this.onInteract( newValue );
    }
    else {
      this.isBeingInteractedWithProperty.value = false;
    }
  }

  onInteract( newValue: RAPRatioTuple ): void {
    this.antecedentViewSounds.boundarySoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.boundarySoundClip.onInteract( newValue.consequent );
    this.antecedentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.consequent );
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;