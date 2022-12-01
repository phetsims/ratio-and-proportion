// Copyright 2022, University of Colorado Boulder

/**
 * Data type that holds how the ratio can be interacted with
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import RatioTerm from '../../model/RatioTerm.js';

class RatioInputModality extends RatioTerm {
  public static readonly BOTH_HANDS = new RatioInputModality();

  public static override readonly enumeration = new Enumeration( RatioInputModality, {
    instanceType: RatioTerm
  } );
}

export default RatioInputModality;