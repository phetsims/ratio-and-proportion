## Ratio and Proportion - Model

#### Terminology

* term - a component number in a ratio
* antecedant - the first term
* consequent - the second term
* current ratio - made by dividing the current values of the hands
* target ratio - goal ratio that indicated success.
* clamped fitness - a value clamped between 0 and 1, where 1 is a perfect ratio, and 0 is a semi-arbitrary state where
  we transition from "out of proportion" to "far from proportion"
* unclamped fitness - a value with a max of 1 (still a perfect ratio), but that can be negative depending on how far
  away from the target ration the current ratio is. Given current values as of this writing, the min is ~-49, see
  https://github.com/phetsims/ratio-and-proportion/issues/137#issuecomment-679348375 for explanation in the form of a
  table.

### RAPRatio.js

This type manages the antecedent and consequent that control the value of the ratio (in proportion form). These two
values are stored as a single data type called `RAPRatioTuple`. RAPRatio also has logic to "lock" the values together to
maintain the same ratio as one ratio term is mutated. The range of each term value is from 0 to 1, where 0 is the min,
and 1 is the max for the whole sim. In the view, there are different representations that can make these values look
different (like tick marks), but in the model the values are constant.

### RAPModel.js

This type takes the values associated with the RAPRatio and connects them to a "target ratio". The metric of how close
the current ratio is to the target ratio is called "fitness". Below explains multiple states of the sim based on this
relationship.

#### Fitness

An algorithm is used to determine how accurate the current ratio is to the target ratio. We call this fitness.
see `ratioFitnessProperty`
This algorithm went through a lot of prototyping (see https://github.com/phetsims/ratio-and-proportion/issues/14). The
algorithm that is used predominately takes into consideration the visual/spacial distance that the consequent hand can
travel from the "in proportion" state (see below), before being "far from proportion". When the tick marks are showing
10, the consequent can travel 2 tick marks away from the "in proportion" before the value of fitness is 0. Because of
the relationship ratio terms have, the left value's distance between being in-proportion and far-from proportion varies
based on the target ratio.

### Model states:

Note, all model position values go from 0 (the bottom of the visual space) to 1 (the top of the visual space). Tick
marks in the view do not change this underlying value.

#### In Proportion

* When the current ratio is close enough to the target ratio to indicate success feedback. In fitness units this
  is `>=.975`.
* When either value is less than .05 (one half of a starting tick mark width), the model cannot be in proportion.
  Instead it puts itself just outside of that fitness. This helps with strange behavior that can be gathered for small
  ratios.

#### Out of Proportion

When the fitness is between 0 and .975, many feedback modalities in the view will only produce in this range.

#### Far from Proportion

When the clamped fitness is 0, there is often less feedback from the sim.

#### Moving In Proportion

When both hands are moving in the same direction, fast enough, at the same time, we call this "moving in direction."
When moving in direction, the "In Proportion" threshold is increased to allow for easier in-proportion feedback. The
model is moving in proportion when moving in direction with a fitness `>=.9`.
  