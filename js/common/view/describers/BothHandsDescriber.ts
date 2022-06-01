// Copyright 2020-2022, University of Colorado Boulder

/**
 * Class responsible for formulating description strings specific to the both-hands interaction and associated
 * description (like in the screen summary and PDOMNode).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import ratioAndProportion from '../../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../../ratioAndProportionStrings.js';
import Property from '../../../../../axon/js/Property.js';
import RAPRatioTuple from '../../model/RAPRatioTuple.js';
import Range from '../../../../../dot/js/Range.js';
import RatioDescriber from './RatioDescriber.js';
import HandPositionsDescriber, { HandContextResponseOptions } from './HandPositionsDescriber.js';
import TickMarkView from '../TickMarkView.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import IReadOnlyProperty from '../../../../../axon/js/IReadOnlyProperty.js';
import TickMarkDescriber from './TickMarkDescriber.js';
import DistanceResponseType from './DistanceResponseType.js';
import RatioInputModality from './RatioInputModality.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../../phet-core/js/types/StrictOmit.js';

const ratioDistancePositionContextResponsePatternString = ratioAndProportionStrings.a11y.ratio.distancePositionContextResponse;

class BothHandsDescriber {

  private ratioTupleProperty: Property<RAPRatioTuple>;
  private enabledRatioTermsRangeProperty: IReadOnlyProperty<Range>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioLockedProperty: Property<boolean>;

  constructor( ratioTupleProperty: Property<RAPRatioTuple>, enabledRatioTermsRangeProperty: IReadOnlyProperty<Range>,
               ratioLockedProperty: Property<boolean>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
               inProportionProperty: IReadOnlyProperty<boolean>,
               ratioDescriber: RatioDescriber, tickMarkDescriber: TickMarkDescriber ) {

    this.ratioTupleProperty = ratioTupleProperty;
    this.enabledRatioTermsRangeProperty = enabledRatioTermsRangeProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioDescriber = ratioDescriber;
    this.ratioLockedProperty = ratioLockedProperty;
    this.handPositionsDescriber = new HandPositionsDescriber( ratioTupleProperty, tickMarkDescriber,
      inProportionProperty, enabledRatioTermsRangeProperty, this.ratioLockedProperty );
  }

  getBothHandsContextResponse( recentlyMovedRatioTerm: RatioInputModality, providedOptions?: HandContextResponseOptions ): string {

    const options = optionize<HandContextResponseOptions, StrictOmit<HandContextResponseOptions, 'distanceResponseType'>>()( {
      supportGoBeyondEdgeResponses: true
    }, providedOptions );

    if ( options.supportGoBeyondEdgeResponses ) {
      const ratioLockedEdgeResponse = this.handPositionsDescriber.getGoBeyondContextResponse(
        this.ratioTupleProperty.value, recentlyMovedRatioTerm );

      if ( ratioLockedEdgeResponse ) {
        return ratioLockedEdgeResponse;
      }
    }

    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternString, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, options ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * Similar to getBothHandsContextResponse, but without extra logic for edges and distance-progress.
   */
  getBothHandsDynamicDescription(): string {
    return StringUtils.fillIn( ratioDistancePositionContextResponsePatternString, {
      distance: this.handPositionsDescriber.getBothHandsDistance( true, {
        distanceResponseType: DistanceResponseType.DISTANCE_REGION
      } ),
      position: this.getBothHandsPosition()
    } );
  }

  /**
   * When each hand in different region, "left hand . . . , right hand . . ." otherwise "both hands . . ."
   * Used for both hands interaction, and with individual hands when the ratio is locked
   */
  getBothHandsPosition(): string {
    const tickMarkView = this.tickMarkViewProperty.value;

    const currentTuple = this.ratioTupleProperty.value;
    const leftPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.antecedent, tickMarkView );
    const rightPosition = this.handPositionsDescriber.getHandPositionDescription( currentTuple.consequent, tickMarkView );

    if ( leftPosition === rightPosition ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.equalObjectResponseAlert, {
        inPosition: leftPosition
      } );
    }
    else {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.bothHands.eachObjectResponseAlert, {
        leftPosition: leftPosition,
        rightPosition: rightPosition
      } );
    }
  }

  getBothHandsObjectResponse(): string {
    return this.ratioDescriber.getProximityToChallengeRatio();
  }

  reset(): void {
    this.handPositionsDescriber.reset();
  }
}

ratioAndProportion.register( 'BothHandsDescriber', BothHandsDescriber );
export default BothHandsDescriber;