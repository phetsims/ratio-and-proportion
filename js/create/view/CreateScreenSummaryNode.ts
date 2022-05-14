// Copyright 2020-2022, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in the Create screen. It also creates content for the voicing
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
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import HandPositionsDescriber from '../../common/view/describers/HandPositionsDescriber.js';
import MyChallengeAccordionBox from './MyChallengeAccordionBox.js';
import BackgroundColorHandler from '../../common/view/BackgroundColorHandler.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import IReadOnlyProperty from '../../../../axon/js/IReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';

class CreateScreenSummaryNode extends Node {

  private ratioDescriber: RatioDescriber;
  private handPositionsDescriber: HandPositionsDescriber;
  private ratioFitnessProperty: IReadOnlyProperty<number>;
  private ratioTupleProperty: Property<RAPRatioTuple>;
  private tickMarkViewProperty: EnumerationProperty<TickMarkView>;
  private inProportionProperty: IReadOnlyProperty<boolean>;
  private myChallengeAccordionBox: MyChallengeAccordionBox;

  constructor( ratioFitnessProperty: IReadOnlyProperty<number>,
               ratioTupleProperty: Property<RAPRatioTuple>,
               tickMarkViewProperty: EnumerationProperty<TickMarkView>,
               ratioDescriber: RatioDescriber,
               inProportionProperty: IReadOnlyProperty<boolean>,
               handPositionsDescriber: HandPositionsDescriber,
               tickMarkRangeProperty: Property<number>,
               myChallengeAccordionBox: MyChallengeAccordionBox ) {

    const stateOfSimNode = new Node( { tagName: 'p' } );
    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const currentChallengeBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.paragraph1
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.paragraph2
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummaryControlAreaParagraph
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.interactionHint
        } )
      ]
    } );

    this.handPositionsDescriber = handPositionsDescriber;
    this.ratioDescriber = ratioDescriber;
    this.tickMarkViewProperty = tickMarkViewProperty;
    this.ratioTupleProperty = ratioTupleProperty;
    this.ratioFitnessProperty = ratioFitnessProperty;
    this.inProportionProperty = inProportionProperty;
    this.myChallengeAccordionBox = myChallengeAccordionBox;

    myChallengeAccordionBox.expandedProperty.link( ( expanded: boolean ) => {
      if ( expanded ) {
        descriptionBullets.addChild( currentChallengeBullet );
      }
      else if ( descriptionBullets.hasChild( currentChallengeBullet ) ) {
        descriptionBullets.removeChild( currentChallengeBullet );
      }
    } );

    Property.multilink( [
      tickMarkViewProperty,
      myChallengeAccordionBox.targetAntecedentProperty,
      myChallengeAccordionBox.targetConsequentProperty,
      ratioTupleProperty,
      ratioFitnessProperty,
      inProportionProperty,
      tickMarkRangeProperty
    ], () => {
      stateOfSimNode.innerContent = this.getStateOfSim();
      leftHandBullet.innerContent = this.getLeftHandState();
      rightHandBullet.innerContent = this.getLeftHandState();
      currentChallengeBullet.innerContent = this.getCurrentChallengeState();
    } );
  }

  private getStateOfSim( currentChallenge: string = ratioAndProportionStrings.a11y.create.challenge ): string {
    return StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummaryQualitativeStateOfSim, {
      color: BackgroundColorHandler.getCurrentColorRegion( this.ratioFitnessProperty.value, this.inProportionProperty.value ),
      ratioFitness: this.ratioDescriber.getRatioFitness( false ),
      currentChallenge: currentChallenge,
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

  private getCurrentChallengeState(): string {
    return this.ratioDescriber.getCurrentChallengeSentence( this.myChallengeAccordionBox.targetAntecedentProperty.value,
      this.myChallengeAccordionBox.targetConsequentProperty.value
    );
  }

  getDetailsButtonState(): string {
    const pattern = this.myChallengeAccordionBox.expandedProperty.value ?
                    ratioAndProportionStrings.a11y.detailsButtonWithCurrentChallengePattern :
                    ratioAndProportionStrings.a11y.detailsButtonPattern;
    return StringUtils.fillIn( pattern, {
      stateOfSim: this.getStateOfSim(),
      leftHand: this.getLeftHandState(),
      rightHand: this.getRightHandState(),
      currentChallenge: this.getCurrentChallengeState()
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;