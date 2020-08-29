// Copyright 2020, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Ratio and Proportion.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';

class CreateScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @param {Property.<TickMarkView>} tickMarkViewProperty
   * @param {RatioDescriber} ratioDescriber
   * @param {HandPositionsDescriber} handPositionsDescriber
   * @param {Property.<number>} tickMarkRangeProperty
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
   */
  constructor( ratioFitnessProperty, leftValueProperty, rightValueProperty, tickMarkViewProperty,
               ratioDescriber, handPositionsDescriber, tickMarkRangeProperty,
               numeratorProperty, denominatorProperty ) {

    const stateOfSimNode = new Node( { tagName: 'p' } );
    const leftHandBullet = new Node( { tagName: 'li' } );
    const rightHandBullet = new Node( { tagName: 'li' } );
    const distanceBullet = new Node( { tagName: 'li' } );
    const descriptionBullets = new Node( {
      tagName: 'ul',
      children: [ leftHandBullet, rightHandBullet, distanceBullet ]
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.introParagraph
        } ),
        stateOfSimNode,
        descriptionBullets,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.create.screenSummary.interactionHint
        } )
      ]
    } );

    Property.multilink( [
      tickMarkViewProperty,
      tickMarkRangeProperty,
      numeratorProperty,
      denominatorProperty,
      ratioFitnessProperty,
      leftValueProperty,
      rightValueProperty
    ], ( tickMarkView, gridRange ) => {
      stateOfSimNode.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.create.screenSummary.qualitativeStateOfSim, {
        ratioFitness: ratioDescriber.getRatioFitness( false ) // lowercase
      } );

      leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: handPositionsDescriber.getHandPosition( leftValueProperty, tickMarkView )
      } );
      rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: handPositionsDescriber.getHandPosition( rightValueProperty, tickMarkView )
      } );
      distanceBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.distanceBullet, {
        distance: handPositionsDescriber.getDistanceRegion( true )
      } );
    } );
  }
}

ratioAndProportion.register( 'CreateScreenSummaryNode', CreateScreenSummaryNode );
export default CreateScreenSummaryNode;