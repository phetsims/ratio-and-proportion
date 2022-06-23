// Copyright 2022, University of Colorado Boulder

/**
 * This file adds media pipe "hands" input to RAP, see MediaPipe
 *
 * In general there are a couple of actions here:
 *
 * Hand Position changes:
 * Each hand position in the sim is controlled by a few marker points from MediaPipe right around the knuckles of the hand.
 * These points are averaged to get the position of that hand. Note that axis can be flipped in options to change which
 * real-world hand corresponds to which hand in the sim.
 *
 * Voicing enabled:
 * A gestured called the "OK_GESTURE", in which thumb and pointer touch in to make a cirle, leaving the other fingers
 * straight, is used to turn off voicing. Turning off voicing actually allows a single voicing response to be spoken
 * fully, so in a sense, though the code thinks that the "OK_GESTURE" turns off voicing, it actually allows a single
 * voicing response to be heard.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import MediaPipe, { HandLandmarks, HandPoint } from '../../../../tangible/js/mediaPipe/MediaPipe.js';
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
import Stats from '../../../../dot/js/Stats.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

if ( RAPQueryParameters.mediaPipe ) {
  MediaPipe.initialize();
}

// Number of positions to keep to average out to smooth the hand positions
const POSITION_HISTORY_LENGTH = 10;

// Number of previous OK_GESTURE enabled states to keep to average out to determine if voicing is enabled. All must store
// false for the gesture to no longer be enabled.
const OK_GESTURE_DETECTED_HISTORY_LENGTH = 15;

// Number of previous states to keep to average out to determine if two (and only two) hands are detected by mediaPipe.
const TWO_HANDS_DETECTED_HISTORY_LENGTH = 10;

// Number of previous positions to keep to determine if the position is "stationary" (adjusting for jitter)
const STATIONARY_HANDS_DETECTED_HISTORY_LENGTH = 20;

// the position range is between 0 and 1, this value is the absolut value of the difference between first and third 
// quartiles of the history. If less than this value, then the hands are considered stationary.
const HANDS_STATIONARY_THRESHOLD = 0.01;

// A single array to prevent garbage each time we calculate the box plot
const boxPlotTempArray: number[] = [];

// The max value of each hand position vector component that we get from MediaPipe.
const HAND_POSITION_MAX_VALUE = 1;

// Hand-tracking points that we use to calculate the position of the ratio in the sim,  See https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
const HAND_POINTS = [ 5, 9, 13 ];

const THUMB_TIP = 4;
const INDEX_TIP = 8;

// TODO: is this really the best number for controlling voicing? https://github.com/phetsims/ratio-and-proportion/issues/454
const MARKERS_TOUCHING_THRESHOLD = 0.04;

// Scratch vectors to avoid taking too much memory
const firstMarkerTouchingVector = new Vector2( 0, 0 );
const secondMarkerTouchingVector = new Vector2( 0, 0 );

type RAPMediaPipeOptions = {
  onInput?: () => void;
  isBeingInteractedWithProperty?: Property<boolean>;
} & PickRequired<PhetioObjectOptions, 'tandem'>;

class RAPMediaPipe extends MediaPipe {

  public readonly isBeingInteractedWithProperty: Property<boolean>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private antecedentViewSounds: ViewSounds;
  private consequentViewSounds: ViewSounds;

  private twoHandsDetectedHistory: boolean[] = [];
  private antecedentHandPositions: Vector3[] = [];
  private consequentHandPositions: Vector3[] = [];
  private antecedentStationaryHistory: number[] = [];
  private consequentStationaryHistory: number[] = [];
  private okGestureDetectedHistory: boolean[] = [];
  public okGestureProperty = new BooleanProperty( false );
  public handsStationaryProperty = new BooleanProperty( false );

  // Use a gesture to determine if voicing for the hands should be enabled

  private onInput: () => void;

  public constructor( ratioTupleProperty: Property<RAPRatioTuple>, antecedentViewSounds: ViewSounds, consequentViewSounds: ViewSounds, providedOptions: RAPMediaPipeOptions ) {
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

  public step(): void {

    const results = MediaPipe.resultsProperty.value;

    // Be more tolerant about if we are interacting with MediaPipe.
    this.isBeingInteractedWithProperty.value = results ? this.getSmoothedTwoHandsDetected( results.multiHandLandmarks ) : false;

    // Though isBeingInteractedWithProperty is tolerant, we actually need two hands to calculate sim changes.
    if ( results && results.multiHandLandmarks.length === 2 ) {

      // Voicing is disabled with the gesture of an "OK" hand gesture from both hands. Must be set before this.onInteract() is called
      this.okGestureProperty.value = this.okGesturePresent( results.multiHandLandmarks );

      const handPositions = this.getPositionsOfHands( results.multiHandLandmarks );
      const newValue = this.tupleFromSmoothing( handPositions[ 0 ], handPositions[ 1 ] );

      this.handsStationaryProperty.value = this.handsStationary( handPositions[ 0 ].y, handPositions[ 1 ].y ) && !this.okGestureProperty.value;

      if ( !this.okGestureProperty.value ) {
        this.ratioTupleProperty.value = this.tupleFromSmoothing( handPositions[ 0 ], handPositions[ 1 ] );
      }

      this.onInteract( newValue );
    }
  }

  private tupleFromSmoothing( leftHandPosition: Vector3, rightHandPosition: Vector3 ): RAPRatioTuple {
    return new RAPRatioTuple(
      this.getSmoothedPosition( leftHandPosition, this.antecedentHandPositions ).y,
      this.getSmoothedPosition( rightHandPosition, this.consequentHandPositions ).y
    ).constrainFields( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE );
  }

  private getSmoothedTwoHandsDetected( multiHandLandmarks: HandLandmarks[] ): boolean {
    return this.handleSmoothValue( multiHandLandmarks.length === 2, this.twoHandsDetectedHistory, TWO_HANDS_DETECTED_HISTORY_LENGTH,

      // To reduce false positives and false negatives, 50% of the history must have two hands detected.
      () => this.twoHandsDetectedHistory.filter( _.identity ).length > TWO_HANDS_DETECTED_HISTORY_LENGTH / 2
    );
  }

  /**
   * Average the historical positions together to get the current value
   */
  private getSmoothedPosition( position: Vector3, historicalPositions: Vector3[] ): Vector3 {
    return this.handleSmoothValue( position, historicalPositions, POSITION_HISTORY_LENGTH, Vector3.average );
  }

  private getPositionsOfHands( multiHandLandmarks: HandLandmarks[] ): Vector3[] {
    assert && assert( multiHandLandmarks.length === 2, 'must have 2 hands' );

    const handPositions = multiHandLandmarks.map( ( handMarkerPositions: HandPoint[] ) => {
      const finalPosition = new Vector3( 0, 0, 0 );

      // These are along the center of a hand, about where we have calibrated the hand icon in RAP, see https://google.github.io/mediapipe/solutions/hands.html#hand-landmark-model
      HAND_POINTS.forEach( index => {
        const point = handMarkerPositions[ index ];
        assert && assert( typeof point.x === 'number' ); // eslint-disable-line bad-typescript-text
        assert && assert( typeof point.y === 'number' ); // eslint-disable-line bad-typescript-text
        assert && assert( typeof point.z === 'number' ); // eslint-disable-line bad-typescript-text
        const yPosition = mediaPipeOptions.yAxisFlippedProperty.value ? point.y : HAND_POSITION_MAX_VALUE - point.y;
        const xPosition = mediaPipeOptions.xAxisFlippedProperty.value ? point.x : HAND_POSITION_MAX_VALUE - point.x;
        const position = new Vector3( xPosition, yPosition, HAND_POSITION_MAX_VALUE - point.z );
        finalPosition.add( position );
      } );

      return finalPosition.divideScalar( HAND_POINTS.length );
    } );

    return RAPMediaPipe.sortHandPositions( handPositions );
  }

  private static sortHandPositions( handPositions: Vector3[] ): Vector3[] {
    assert && assert( handPositions.length === 2, 'must have 2 hands' );
    return handPositions[ 0 ].x <= handPositions[ 1 ].x ? handPositions : handPositions.reverse();
  }

  private static markersTouching( point1: number, point2: number, handMarkerPositions: HandPoint[] ): boolean {
    const position1 = handMarkerPositions[ point1 ];
    const position2 = handMarkerPositions[ point2 ];

    firstMarkerTouchingVector.setXY( position1.x, position1.y );
    secondMarkerTouchingVector.setXY( position2.x, position2.y );

    return firstMarkerTouchingVector.distance( secondMarkerTouchingVector ) < MARKERS_TOUCHING_THRESHOLD;
  }

  private onInteract( newValue: RAPRatioTuple ): void {
    this.onInput();
    this.antecedentViewSounds.boundarySoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.boundarySoundClip.onInteract( newValue.consequent );
    this.antecedentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.antecedent );
    this.consequentViewSounds.tickMarkBumpSoundClip.onInteract( newValue.consequent );
  }

  private static hasOKGesture( multiHandLandmarks: HandLandmarks[] ): boolean {

    // Cannot have OK_GESTURE without two and only two hands.
    if ( multiHandLandmarks.length !== 2 ) {
      return false;
    }
    return RAPMediaPipe.markersTouching( THUMB_TIP, INDEX_TIP, multiHandLandmarks[ 0 ] ) &&
           RAPMediaPipe.markersTouching( THUMB_TIP, INDEX_TIP, multiHandLandmarks[ 1 ] );
  }

  /**
   * Voicing is eagerly disabled upon first "OK Gesture" detection, but to turn it on, keep track of history to ensure
   * that the user is actually intending to stop the "OK Gesture"
   */
  private okGesturePresent( multiHandLandmarks: HandLandmarks[] ): boolean {

    const newOKGestureDetected = RAPMediaPipe.hasOKGesture( multiHandLandmarks );

    if ( !newOKGestureDetected ) {
      this.okGestureDetectedHistory.push( newOKGestureDetected );
      return false;
    }

    return this.handleSmoothValue( newOKGestureDetected, this.okGestureDetectedHistory, OK_GESTURE_DETECTED_HISTORY_LENGTH,

      // If there is a single OK_GESTURE present, then there is still intent to gesture.
      () => this.okGestureDetectedHistory.filter( _.identity ).length !== 0
    );
  }

  private singleHandStationary( position: number, positionHistory: number[] ): boolean {

    this.handleSmoothValue( position, positionHistory, STATIONARY_HANDS_DETECTED_HISTORY_LENGTH, _.identity );

    // A box plot needs >=4 values to calculate
    if ( positionHistory.length < 4 ) {
      return false;
    }
    boxPlotTempArray.length = 0;
    for ( let i = 0; i < positionHistory.length; i++ ) {
      boxPlotTempArray.push( positionHistory[ i ] );
    }
    const boxPlotValues = Stats.getBoxPlotValues( boxPlotTempArray );
    return Math.abs( boxPlotValues.q3 - boxPlotValues.q1 ) < HANDS_STATIONARY_THRESHOLD;
  }

  private handsStationary( antecedentPosition: number, consequentPosition: number ): boolean {
    return this.singleHandStationary( antecedentPosition, this.antecedentStationaryHistory ) &&
           this.singleHandStationary( consequentPosition, this.consequentStationaryHistory );
  }

  /**
   * Smooth a value given historical data and a new value. Also ensures that the history doesn't get too long.
   */
  handleSmoothValue<T>( newValue: T, historyArray: T[], maxSizeOfArray: number, smoothValues: ( historyArray: T[] ) => T ): T {

    historyArray.push( newValue );
    while ( historyArray.length > maxSizeOfArray ) {
      historyArray.shift();
    }

    return smoothValues( historyArray );
  }

  public static getMediaPipeOptionsNode(): VBox {
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

  public reset(): void {
    this.isBeingInteractedWithProperty.reset();
  }
}

ratioAndProportion.register( 'RAPMediaPipe', RAPMediaPipe );
export default RAPMediaPipe;