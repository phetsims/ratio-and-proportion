
TO talk about:
* TODO: not sure about unclampedFitnessProperty just yet.
* TODO: value ranges always go from 0 to 1, in that sense "normalization" is done for you.

#### Terminology
* current ratio - made by dividing the current values of the hands
* target ratio - goal ratio that indicated success.
* clamped fitness - a value clamped between 0 and 1, where 1 is a perfect ratio, and 0 is a semi-arbitrary state where we 
transition from "out of proportion" to "far from proportion"
* unclamped fitness - a value with a max of 1 (still a perfect ratio), but that can be negative depending on how far away
from the target ration the current ratio is. Given current values as of this writing, the min is ~-49, see 
https://github.com/phetsims/ratio-and-proportion/issues/137#issuecomment-679348375 for examplanation in the form of a table.

### RAPRatio.js

This type manages the numerator and denonminator that control the value of the ratio (in proportion form). It also has
logic to "lock" the values together to maintain the same ratio as one value is mutated.

### RAPModel.js

This type takes the values associated with the RAPRatio and connects them to a "target ratio". The metric of how close the
current ratio is to the target ratio is called "fitness". Below explains multiple states of the sim based on this 
relationship.  

#### Fitness

An algorithm is used to determine how accurate the current ratio is to the target ratio. We call this fitness. see `ratioFitnessProperty`
TODO: talk about the implementation of that algorithm, and link to other investigations in issues.

### Model states:
Note, all model position values go from 0 (the bottom of the visual space) to 1 (the top of the visual space). Tick marks
in the view do not change this underlying value. 

#### In Proportion
  * When the current ratio is close enough to the target ratio to indicate success feedback. In fitness units this is `>=.975`.
  * When either value is less than .05 (one half of a starting tick mark width), the model cannot be in proportion. Instead
  it puts itself just outside of that fitness. This helps with strange behavior that can be gathered for small ratios.
  
#### Out of Proportion
  When the fitness is between 0 and .975, many feedback modalities in the view will only produce in this range.
  
#### Far from Proportion
  When the clamped fitness is 0, there is often less feedback from the sim.
  
#### Moving In Proportion
  When both hands are moving in the same direction, fast enough, at the same time, we call this "moving in direction."
  When moving in direction, the "In Proportion" threshold is increased to allow for easier in-proportion feedback. The model
  is moving in proportion when moving in direction with a fitness `>=.9`.
  