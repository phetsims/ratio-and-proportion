// Copyright 2020, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import GridView from '../../common/view/GridView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class CreateScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {Property.<boolean>} accordionBoxExpandedProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {Property.<number>} gridRangeProperty
   * @param {Map.<number, string>} gridRangeToRangeLabelMap - map from grid range to the label for that specified range
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
   */
  constructor( ratioFitnessProperty, leftValueProperty, rightValueProperty, gridViewProperty,
               accordionBoxExpandedProperty, ratioDescriber, gridRangeProperty, gridRangeToRangeLabelMap,
               numeratorProperty, denominatorProperty ) {

    const stateOfSimNode = new Node( { tagName: 'p' } );

    const myChallengeSubBullet = new Node( { tagName: 'li' } );
    const myChallengeSubList = new Node( { tagName: 'ul', children: [ myChallengeSubBullet ] } );
    const myChallengeSpan = new Node( { tagName: 'span' } );
    const myChallengeBullet = new Node( { tagName: 'li', children: [ myChallengeSpan, myChallengeSubList ] } );

    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const gridRangeBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ myChallengeBullet, leftHandBullet, rightHandBullet, gridRangeBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.introParagraph
        } ),
        stateOfSimNode,
        descriptionBullets
      ]
    } );

    // @private
    this.ratioDescriber = ratioDescriber;

    Property.multilink( [
      accordionBoxExpandedProperty,
      gridViewProperty,
      gridRangeProperty,
      numeratorProperty,
      denominatorProperty,
      ratioFitnessProperty,
      leftValueProperty,
      rightValueProperty
    ], ( expanded, gridView, gridRange, numerator, denominator ) => {
      stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.qualitativeStateOfSim, {
        ratioFitness: this.ratioDescriber.getRatioFitness( false ) // lowercase
      } );

      myChallengeSpan.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.myChallengeBullet, {
        expanded: expanded ? ratioAndProportionStrings.a11y.create.screenSummary.expanded : ratioAndProportionStrings.a11y.create.screenSummary.collapsed
      } );

      myChallengeSubBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.myChallengeLeftRightValues, {
        leftValue: numerator,
        rightValue: denominator
      } );

      leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: ratioDescriber.getHandPosition( leftValueProperty, gridView )
      } );
      rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: ratioDescriber.getHandPosition( rightValueProperty, gridView )
      } );

      gridRangeBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.gridRangeBullet, {
        range: gridRangeToRangeLabelMap.get( gridRange )
      } );

      gridRangeBullet.visible = gridView !== GridView.NONE;
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;