// Copyright 2020-2022, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion. It also creates content for the voicing
 * overview buttons as appropriate.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import RAPRatioTuple from '../../common/model/RAPRatioTuple.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';

type RatioToChallengeNameMap = Map<number, { lowercase: string; capitalized: string }>;

class DiscoverScreenSummaryNode extends Node {
  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioFitnessProperty: IReadOnlyProperty<number>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private targetRatioProperty: Property<number>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private inProportionProperty: IReadOnlyProperty<boolean>;
  private ratioToChallengeNameMap: RatioToChallengeNameMap;

  public constructor( ratioFitnessProperty: IReadOnlyProperty<number>, ratioTupleProperty: Property<RAPRatioTuple>,
               targetRatioProperty: Property<number>, tickMarkViewProperty: EnumerationProperty<TickMarkView>,
               ratioDescriber: RatioDescriber, inProportionProperty: IReadOnlyProperty<boolean>, handPositionsDescriber: HandPositionsDescriber,
               ratioToChallengeNameMap: RatioToChallengeNameMap ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph1
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph2
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.paragraph3
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.discover.screenSummary.interactionHint
        } )
      ]
    } );

    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioDescriber = ratioDescriber;
    this.targetRatioProperty = targetRatioProperty;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioFitnessProperty = ratioFitnessProperty;
    this.inProportionProperty = inProportionProperty;
    this.ratioToChallengeNameMap = ratioToChallengeNameMap;

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Multilink.multilink( [
      targetRatioProperty,
      tickMarkViewProperty,
      ratioTupleProperty,
      ratioFitnessProperty,
      inProportionProperty
    ], ( targetRatio, tickMarkView ) => {

      stateOfSimNode.innerContent = this.getStateOfSim();
      leftHandBullet.innerContent = this.getLeftHandState();
      rightHandBullet.innerContent = this.getRightHandState();
    } );
  }

  private getStateOfSim(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSim, {
      color: BackgroundColorHandler.getCurrentColorRegion( this.ratioFitnessProperty.value, this.inProportionProperty.value ),
      ratioFitness: this.ratioDescriber.getRatioFitness( false ),
      currentChallenge: this.ratioToChallengeNameMap.get( this.targetRatioProperty.value )!.lowercase,
      distance: this.handPositionsDescriber.getDistanceRegion( true )
    } );
  }

  private getLeftHandState(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
      position: this.handPositionsDescriber.getHandPositionDescription( this.ratioTupleProperty.value.antecedent, this.tickMarkViewProperty.value )
    } );
  }

  private getRightHandState(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
      position: this.handPositionsDescriber.getHandPositionDescription( this.ratioTupleProperty.value.consequent, this.tickMarkViewProperty.value )
    } );
  }

  public getDetailsButtonState(): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.detailsButtonPattern, {
      stateOfSim: this.getStateOfSim(),
      leftHand: this.getLeftHandState(),
      rightHand: this.getRightHandState()
    } );
  }
}

ratioAndProportion.register( 'DiscoverScreenSummaryNode', DiscoverScreenSummaryNode );
export default DiscoverScreenSummaryNode;