// Copyright 2020, University of Colorado Boulder

/**
 * Radio button group for choosing what Tick Marks are visible in the ratio view.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import FontAwesomeNode from '../../../../sun/js/FontAwesomeNode.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import ratioAndProportionStrings from '../../ratioAndProportionStrings.js';
import NumberedTickMarkIconPath from './NumberedTickMarkIconPath.js';
import TickMarksIconPath from './TickMarksIconPath.js';
import TickMarkView from './TickMarkView.js';

class TickMarkViewRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * @param {Property}tickMarkViewProperty
   * @param options
   */
  constructor( tickMarkViewProperty, options ) {

    options = merge( {
      orientation: 'horizontal',
      baseColor: 'white',
      buttonContentYMargin: 14,
      buttonContentXMargin: 8,

      // pdom
      labelContent: ratioAndProportionStrings.a11y.tickMark.heading,
      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT
    }, options );

    super( tickMarkViewProperty, [ {
        node: new FontAwesomeNode( 'eye_close', { scale: 0.8 } ),
        value: TickMarkView.NONE,
        labelContent: ratioAndProportionStrings.a11y.tickMark.showNo
      }, {
        node: new TickMarksIconPath(),
        value: TickMarkView.HORIZONTAL,
        labelContent: ratioAndProportionStrings.a11y.tickMark.show
      }, {
        node: new NumberedTickMarkIconPath(),
        value: TickMarkView.HORIZONTAL_UNITS,
        labelContent: ratioAndProportionStrings.a11y.tickMark.showNumbered
      } ],
      options );

    const tickMarkContextResponseUtterance = new ActivationUtterance();
    tickMarkViewProperty.lazyLink( tickMarkView => {

      switch( tickMarkView ) {
        case TickMarkView.NONE:
          tickMarkContextResponseUtterance.alert = ratioAndProportionStrings.a11y.tickMark.tickMarksHidden;
          break;
        case TickMarkView.HORIZONTAL:
          tickMarkContextResponseUtterance.alert = ratioAndProportionStrings.a11y.tickMark.tickMarksShown;
          break;

        case TickMarkView.HORIZONTAL_UNITS:
          tickMarkContextResponseUtterance.alert = ratioAndProportionStrings.a11y.tickMark.numberedTickMarksShown;
          break;
        default:
          assert && assert( false, 'unsupported tickMarkView' );
      }

      phet.joist.sim.utteranceQueue.addToBack( tickMarkContextResponseUtterance );
    } );
  }
}

ratioAndProportion.register( 'TickMarkViewRadioButtonGroup', TickMarkViewRadioButtonGroup );
export default TickMarkViewRadioButtonGroup;