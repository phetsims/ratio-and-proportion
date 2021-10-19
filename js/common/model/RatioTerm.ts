// Copyright 2020, University of Colorado Boulder

/**
 * Data type that holds both terms of the ratio
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import ratioAndProportion from '../../ratioAndProportion.js';

type RatioTermType = {
  ANTECEDENT: Object;
  CONSEQUENT: Object;
}

// @ts-ignore
const RatioTerm = <RatioTermType>Enumeration.byKeys( [ 'ANTECEDENT', 'CONSEQUENT' ] );


ratioAndProportion.register( 'RatioTerm', RatioTerm );

export { RatioTermType };
export default RatioTerm;
