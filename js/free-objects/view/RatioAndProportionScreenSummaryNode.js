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
import GridView from './GridView.js';

class RatioAndProportionScreenSummaryNode extends Node {

  /**
   * @param {Property.<number>} proportionFitnessProperty
   * @param {Property.<number>} leftValueProperty
   * @param {Property.<number>} rightValueProperty
   * @param {Property.<GridView>} gridViewProperty
   * @param {RatioDescriber} ratioDescriber
   */
  constructor( proportionFitnessProperty, leftValueProperty, rightValueProperty, gridViewProperty, ratioDescriber ) {

    const stateOfSimNode = new Node( {
      tagName: 'p'
    } );

    super( {
      children: [
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.playAreaDescription
        } ),
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.controlAreaDescription
        } ),
        stateOfSimNode,
        new Node( {
          tagName: 'p',
          innerContent: ratioAndProportionStrings.a11y.screenSummary.simSpecificInteractionHint
        } )
      ]
    } );

    // @private
    this.ratioDescriber = ratioDescriber;

    // This derivedProperty is already dependent on all other dependencies for getStateOfSimString
    Property.multilink( [ gridViewProperty, proportionFitnessProperty, leftValueProperty, rightValueProperty ], gridView => {
      const isQualitative = gridView === GridView.NONE; // TODO: likely factor this out into a GridView method for general description
      stateOfSimNode.innerContent = this.getStateOfSimString( isQualitative, leftValueProperty, rightValueProperty );
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
    const ratioFitness = this.ratioDescriber.getRatioFitness();

    if ( qualitative ) {
      return StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummary.qualitativeStateOfSim, {
        leftPosition: this.ratioDescriber.getLeftQualitativePointerPosition(),
        rightPosition: this.ratioDescriber.getRightQualitativePointerPosition(),
        ratioFitness: ratioFitness
      } );
    }
    else {
      const leftGridAndPosition = this.ratioDescriber.getLeftQuantitativePositionObject();
      const rightGridAndPosition = this.ratioDescriber.getRightQuantitativePositionObject();

      return StringUtils.fillIn( ratioAndProportionStrings.a11y.screenSummary.quantitativeStateOfSim, {
        leftRelativePosition: leftGridAndPosition.relativePosition,
        leftGridPosition: leftGridAndPosition.gridPosition,
        rightRelativePosition: rightGridAndPosition.relativePosition,
        rightGridPosition: rightGridAndPosition.gridPosition,
        ratioFitness: ratioFitness
      } );
    }
  }
}

ratioAndProportion.register( 'RatioAndProportionScreenSummaryNode', RatioAndProportionScreenSummaryNode );
export default RatioAndProportionScreenSummaryNode;