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

class ExploreScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} ratioFitnessProperty
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   */
  constructor( ratioFitnessProperty, leftValueProperty, rightValueProperty, gridViewProperty, ratioDescriber ) {

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
          innerContent: ratioAndProportionStrings.a11y.explore.screenSummary.introParagraph
        } ),
        stateOfSimNode,
        descriptionBullets
      ]
    } );

    // @private
    this.ratioDescriber = ratioDescriber;

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Property.multilink( [ gridViewProperty, ratioFitnessProperty, leftValueProperty, rightValueProperty ], gridView => {
      stateOfSimNode.innerContent = this.getStateOfSimString( GridView.describeQualitative( gridView ), leftValueProperty, rightValueProperty );

      leftHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.leftHandBullet, {
        position: ratioDescriber.getLeftQualitativePointerPosition()
      } );
      rightHandBullet.innerContent = StringUtils.fillIn( ratioAndProportionStrings.a11y.rightHandBullet, {
        position: ratioDescriber.getRightQualitativePointerPosition()
      } );
    } );
  }

  /**
   * @private
   * @param {boolean} qualitative - vs quantitative
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @returns {string}
   */
  getStateOfSimString( qualitative, leftValueProperty, rightValueProperty ) {

    return StringUtils.fillIn( ratioAndProportionStrings.a11y.explore.screenSummary.qualitativeStateOfSim, {
      ratioFitness: this.ratioDescriber.getRatioFitness( false ), // lowercase
      currentChallenge: 'CHALLENGE_1' // TODO: implement https://github.com/phetsims/ratio-and-proportion/issues/87!
    } );
  }
}

ratioAndProportion.register( 'ExploreScreenSummaryNode', ExploreScreenSummaryNode );
export default ExploreScreenSummaryNode;