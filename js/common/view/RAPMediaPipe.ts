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
import { RichText, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import mediaPipeOptions from './mediaPipeOptions.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

if ( RAPQueryParameters.mediaPipe ) {
  MediaPipe.initialize();
}

const NUMBER_TO_SMOOTH = 10;

// Hand-tracking points that we use to calculate the position of the ratio in the sim,  See https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_POINTS = [ 5, 9, 13 ];

const THUMB_TIP = 4;
const INDEX_TIP = 8;

const MARKERS_TOUCHING_THRESHOLD = 0.04;

// Scratch vectors to avoid taking too much memory
const firstMarkerTouchingVector = new Vector2( 0, 0 );
const secondMarkerTouchingVector = new Vector2( 0, 0 );

type RAPMediaPipeOptions = {
  onInput?: () => void;
  isBeingInteractedWithProperty?: Property<boolean>;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

class RAPMediaPipe extends MediaPipe {

  readonly isBeingInteractedWithProperty: Property<boolean>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  antecedentHandPositions: Vector3[];
  consequentHandPositions: Vector3[];
  antecedentViewSounds: ViewSounds;
  consequentViewSounds: ViewSounds;

  // Use a gesture to determine if voicing for the hands should be enabled
  voicingEnabledProperty: Property<boolean>;

  onInput: () => void;

  constructor( ratioTupleProperty: Property<RAPRatioTuple>, antecedentViewSounds: ViewSounds, consequentViewSounds: ViewSounds, providedOptions: RAPMediaPipeOptions ) {
    const options = optionize<RAPMediaPipeOptions>()( {
      isBeingInteractedWithProperty: new BooleanProperty( false ),
      onInput: _.noop
    }, providedOptions );
    super();

    this.isBeingInteractedWithProperty = options.isBeingInteractedWithProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.onInput = options.onInput;
    this.antecedentViewSounds = antecedentViewSounds;
    this.consequentViewSounds = consequentViewSounds;
    this.antecedentHandPositions = [];
    this.consequentHandPositions = [];

    this.voicingEnabledProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'voicingEnabledProperty' )
    } );
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

    const results = MediaPipe.resultsProperty.value;

    if ( results && results.multiHandLandmarks.length === 2 ) {

      this.isBeingInteractedWithProperty.value = true;
      const handPositions: Vector3[] = results.multiHandLandmarks.map( ( handMarkerPositions: HandPoint[] ) => {
        const finalPosition = new Vector3( 0, 0, 0 );

        // These are along the center of a hand, about where we have calibrated the hand icon in RAP, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
        HAND_POINTS.forEach( index => {
          const point = handMarkerPositions[ index ];
          assert && assert( typeof point.x === 'number' ); // eslint-disable-line bad-typescript-text
          assert && assert( typeof point.y === 'number' ); // eslint-disable-line bad-typescript-text
          assert && assert( typeof point.z === 'number' ); // eslint-disable-line bad-typescript-text
          const yPosition = mediaPipeOptions.yAxisFlippedProperty.value ? point.y : 1 - point.y;
          const xPosition = mediaPipeOptions.xAxisFlippedProperty.value ? point.x : 1 - point.x;
          const position = new Vector3( xPosition, yPosition, 1 - point.z );
          finalPosition.add( position );
        } );

        return finalPosition.divideScalar( HAND_POINTS.length );
      } );

      handPositions.sort();
      const newValue = this.tupleFromSmoothing( handPositions[ 0 ], handPositions[ 1 ] );
      this.ratioTupleProperty.value = newValue;

      // Voicing is disabled with the gesture of an "OK" hand gesture from both hands.
      this.voicingEnabledProperty.value = !( this.markersTouching( THUMB_TIP, INDEX_TIP, results.multiHandLandmarks[ 0 ] ) &&
                                             this.markersTouching( THUMB_TIP, INDEX_TIP, results.multiHandLandmarks[ 1 ] ) );

      this.onInteract( newValue );
    }
    else {
      this.isBeingInteractedWithProperty.value = false;
    }
  }

  markersTouching( point1: number, point2: number, handMarkerPositions: HandPoint[] ): boolean {
    const position1 = handMarkerPositions[ point1 ];
    const position2 = handMarkerPositions[ point2 ];

    firstMarkerTouchingVector.setXY( position1.x, position1.y );
    secondMarkerTouchingVector.setXY( position2.x, position2.y );

    return firstMarkerTouchingVector.distance( secondMarkerTouchingVector ) < MARKERS_TOUCHING_THRESHOLD;
  }

  onInteract( newValue: RAPRatioTuple ): void {
    this.onInput();
    this.antecedentViewSounds.boundarySoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.boundarySoundClip.onInteract( newValue.consequent );
    this.antecedentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.consequent );
  }

  static getMediaPipeOptionsNode(): VBox {
    return new VBox( {
      spacing: 10,
      align: 'left',
      children: [
        new RichText( 'MediaPipe Options:' ),
        new Checkbox( new RichText( 'x-axis flipped' ), mediaPipeOptions.xAxisFlippedProperty, { tandem: Tandem.OPT_OUT } ),
        new Checkbox( new RichText( 'y-axis flipped' ), mediaPipeOptions.yAxisFlippedProperty, { tandem: Tandem.OPT_OUT } )
      ]
    } );
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;