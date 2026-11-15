/**
 * Public catalog data for the Nova Nesting pricing page.
 * Keep tier copy and Paddle price IDs together so the offer is easy to edit.
 * @typedef {Object} Tier
 * @property {"Starter"|"Pro"|"Advanced"} name
 * @property {string} id
 * @property {string} description
 * @property {string[]} features
 * @property {boolean} featured
 * @property {{month:string,year:string}} priceId
 */

/** @type {Tier[]} */
export const pricingTiers = [
  {
    name: "Starter",
    id: "starter",
    description: "Flexible access for a production run or occasional projects.",
    features: [
      "Nesting and artwork matching",
      "Laser Cut workflow where supported",
      "1 computer activation"
    ],
    featured: false,
    priceId: {
      month: "pri_01m7dhh5w6s5p813d21czxhxsk",
      year: "pri_01m7dhh649rzh6vwg49j3aprkc"
    }
  },
  {
    name: "Pro",
    id: "pro",
    description: "Reliable everyday nesting for one workstation.",
    features: [
      "All current Nesting and Laser Cut features",
      "1 computer activation",
      "Yearly billing available"
    ],
    featured: true,
    priceId: {
      month: "pri_01m7dhh6chhq7byvejq080tr9h",
      year: "pri_01m7dhh6mb1w7becawn2dja6s8"
    }
  },
  {
    name: "Advanced",
    id: "advanced",
    description: "For demanding production and longer, more complex nesting work.",
    features: [
      "Everything in Pro",
      "Up to 2 computer activations",
      "Faster, more precise nesting optimization"
    ],
    featured: false,
    priceId: {
      month: "pri_01m7dhh6vrjrsm1z12y8g3ahe3",
      year: "pri_01m7dhh73b6hva9sv9qv1brrnc"
    }
  }
];
