## Ratio and Proportion - Model description

@author Michael Kauzmann (PhET Interactive Simulations)

This document is a high-level description of the model used in PhET's Ratio and Proportion simulation.


----------


The basic model for this simulation is as simple as the formula for a two-term ratio:

    antecedent:consequent

or

    current ratio = antecedent/consequent

In this simulation, both the antecedent and consequent values are mutable.

### Ratio Fitness feedback

The current ratio is compared to a target ratio; the simulation gives feedback depending on how close the two are. When
the target ratio and the current ratio close enough (within a small tolerance), the ratio is "in proportion".

The algorithm for fitness is not exclusive to mathematically comparing the two ratios, but also takes into consideration
the "physical distance" that each ratio hand is from where it would be if the ratio was at its target.

#### Zero case

To simplify the simulation model and to match with learning goals of the simulation, setting either term to 0 does not
produce feedback to match the mathematical expression, for example 1:0 is undefined, yet this simulation still provides
feedback based on that current ratio's proximity to the target. The same is true for 0:0.

#### Locked ratio

The ratio can be "locked" such that changing either term of the ratio with update the other term to maintain the same
ratio as when the ratio became locked.

### In Proportion state

Success feedback is provided in the sim for making the ratio the same as the target ratio.

Further success feedback is provided when the current ratio can be moved in the play area while staying in proportion.
