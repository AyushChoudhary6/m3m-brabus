// Decision guide, 4 BHK vs 5 BHK. Sizes are pulled from the facts layer
// rather than typed in, so if the official listing ever revises them this
// article moves with it. Carpet areas are deliberately left unstated —
// they are not published, and a guess here would outlive the correction.

import { CONFIGURATIONS } from "../../lib/facts.js";

const four = CONFIGURATIONS.find((c) => c.id === "4bhk");
const five = CONFIGURATIONS.find((c) => c.id === "5bhk");

export default {
  slug: "4-bhk-vs-5-bhk-which-to-buy",
  title: "4 BHK vs 5 BHK: Which Should You Buy?",
  description:
    "4 BHK or 5 BHK? A practical guide to who the fifth bedroom really serves, the running costs of extra area, resale liquidity and what to check on site.",
  date: "2026-07-10",
  category: "Buyer Guide",
  readMins: 7,
  hero: "/renders/tower.jpg",
  excerpt:
    "Choose on how your household actually lives, not on headline square footage — who uses the fifth room, what it costs to run, and how each size resells.",
  body: [
    {
      p: "Buy the 5 BHK only if you can name, today, the person who will sleep or work in the fifth room every week. If the answer is \"guests, sometimes\" or \"we might need it later\", the 4 BHK is almost always the better purchase, and the difference is better spent on floor, aspect and finish.",
    },
    {
      p: "That is meant to sound blunt. At this scale a bedroom is not a bedroom: it is a suite with its own bath, its own climate zone, its own share of the maintenance bill and its own furnishing budget. The question is never whether you can afford the bigger home. It is whether it will be used.",
    },
    { h2: "Start with rooms that have a job, not with area" },
    {
      p: "Most buyers compare the two on square footage because that is the number on the brochure. It is the least useful number available. Two residences of identical area can live entirely differently depending on how many of their rooms do real work and how many do decorative work.",
    },
    {
      p: "The exercise that settles it takes ten minutes. List everyone who will be in the home on an ordinary Tuesday — not a festival, not a wedding week — and give each of them a room. Then add the rooms that are not bedrooms but still need four walls and a door: where you take calls, where a parent rests, where staff sleep. Count what is left over. If nothing is left over on the 4 BHK plan, you have your answer; if two rooms are left over on the 5 BHK, you have that answer too.",
    },
    { h2: "Who the fifth room actually serves" },
    {
      p: "In practice the fifth bedroom is bought for a small number of reasons, and they are not equally durable. Ranked by how reliably the room stays occupied:",
    },
    {
      ul: [
        "Live-in staff. The most common genuine reason, and the one buyers are least likely to say aloud on a site visit. A servant's room with its own entry and bath is not the same thing as a fifth bedroom off the family corridor — establish which the plan is actually offering.",
        "Ageing parents. A room that will be permanently occupied within a few years is the strongest case for the larger home, and it changes what to look for: proximity to a bath, distance from the entertaining spaces, and whether it could take a hospital bed and a wheelchair turning circle if it had to.",
        "A real home office. Not a desk in the corner of a guest room. If either adult works from home most days, or takes calls at odd hours for other time zones, a door that closes on a proper room is worth more than extra living area.",
        "A guest suite that is genuinely used. Children studying abroad and relatives who visit for weeks rather than nights fill the fifth room. Guests who stay two nights twice a year do not — that is heating and cleaning an empty room for fifty weeks to be gracious for two.",
        "A teenager approaching independence. Defensible, with a defined shelf life — the room may empty within a decade.",
      ],
    },
    { h2: "The costs that follow the extra room" },
    {
      p: "Notice what is absent from that list: resale value, status, and the feeling that more is safer. Those argue for buying area, not for buying a fifth bedroom — and a larger residence is never a one-time decision. It commits you to a recurring cost structure most buyers only model properly after moving in.",
    },
    {
      ul: [
        "Maintenance is charged on area, not on use — levied per square foot of super area, month after month, whether the fifth room is occupied or locked. Ask the current rate and its basis before you decide, not after.",
        "Cooling load. An additional suite is an additional climate zone across a long Gurugram summer. Ask how the system is zoned and whether unused rooms can genuinely be isolated.",
        "Staffing. More floor area is more area to clean — a monthly cost that scales with the plan you choose.",
        "Furnishing it properly, the most consistently underestimated cost. In a residence of this calibre a half-furnished spare room reads as failure rather than restraint; the fifth suite must be finished to the standard of the rest.",
        "The interest-free maintenance deposit and club charges, commonly pegged to area or to unit. Read the official charge schedule against both configurations side by side.",
      ],
    },
    {
      note: "The published sizes for this project are total area, not carpet area. Carpet area is what you can actually furnish, and the ratio between the two varies considerably between developments — so the home with the larger headline figure can offer less usable space. Carpet areas for M3M Brabus are shared on request rather than published: ask for both in writing, and compare those numbers rather than the brochure ones.",
    },
    { h2: "Layout efficiency can beat headline area" },
    {
      p: "Two plans of the same declared size can differ sharply in how much of it you can live in. The variables are unglamorous and matter more than almost anything else on the drawing:",
    },
    {
      ul: [
        "Corridor length. Circulation is area you pay for and cannot furnish. A plan that reaches five bedrooms down a long internal passage has spent a room's worth of space on getting there.",
        "Whether every bedroom is a true en suite, or the fifth shares.",
        "Wall lengths. A room can be nominally generous and still have nowhere to put a bed, a wardrobe run and a chair without blocking a door or a window.",
        "How many external walls each room has — a residence open on three sides can put light and cross-ventilation into rooms that would otherwise be internal.",
        "Where utility and staff areas sit relative to the kitchen and entry, and whether service movement crosses the family's.",
      ],
    },
    {
      p: "A well-planned 4 BHK with short circulation and four properly proportioned suites will out-live a sprawling 5 BHK where the fifth room is an afterthought at the end of a corridor. Judge the drawing, not the total.",
    },
    { h2: "Resale and rental liquidity are not symmetrical" },
    {
      p: "The two behave differently when you come to sell or let. The pool of buyers narrows as size rises: every increment of area removes households who would otherwise have considered your home, so the largest units in any development tend to take longer to transact and depend on finding the one buyer who wants exactly that. The smaller configuration sits in the deeper end of the market and usually moves more readily.",
    },
    {
      p: "Letting works the same way, more sharply, because corporate and expatriate tenancies are budgeted rather than aspirational. A tenant paying from a housing allowance chooses within a band, and the largest homes often sit above it — though when one does let, it tends to let to a long-staying tenant. None of this argues against the 5 BHK. It argues for buying one because you intend to live in it, not as a liquidity play.",
    },
    { h2: "How the two sit at M3M Brabus" },
    {
      p: `The published configurations are two and no more — a ${four.config} of ${four.size} and a ${five.config} of ${five.size}, within an overall range of roughly 5,000 to 7,000 sq.ft. There is no penthouse tier. Neither aspect nor carpet area is published for either home, so the honest comparison rests on the thing you can reason about without a brochure: whether you need the extra rooms.`,
    },
    {
      p: "The gap between them is on the order of another apartment's worth of total area, not a rounding difference. What that becomes in carpet terms, and how it is distributed between bedrooms, living space and service areas, is set out on the unit plans — ask for both, and see our floor plans page for what can currently be shared.",
    },
    { h2: "A checklist for the site visit" },
    {
      p: "Answer these on site, not afterwards from memory.",
    },
    {
      ol: [
        "Ask for the carpet area of both configurations in writing, alongside the total area, and work out the ratio yourself.",
        "Stand in the fifth bedroom and name its occupant aloud. If you cannot, note that.",
        "Pace the longest internal corridor, and ask what proportion of the plan is circulation.",
        "Check that every bedroom has its own bath, that no bath opens onto a shared passage, and that each room has a wall long enough to take a bed with clearance either side.",
        "Ask where staff accommodation sits, whether it has independent access, and whether it counts within the bedroom tally.",
        "Ask the maintenance rate per square foot and its basis, then multiply it out for both configurations over ten years.",
        "Ask how climate control is zoned and whether unoccupied rooms can be shut off entirely.",
        "Check what each configuration faces on the site plan, and what may be built on the open sides.",
        "Request the charge schedule, the payment plan and the current RERA position in writing before committing to either plan.",
      ],
    },
    { h2: "So which one" },
    {
      p: "If your household has four people who need bedrooms, no live-in staff, no parent likely to move in, and guests who come for nights rather than weeks, the 4 BHK is the disciplined choice — and what is not spent on a fifth suite is better deployed on a higher floor, a better aspect or a corner placement. Those hold their appeal indefinitely. A room you do not use does not.",
    },
    {
      p: "If you have staff who live in, a parent who will move in, or work that genuinely requires a closed room, the 5 BHK is not an indulgence but a specification. Buy it without hesitation, and buy it on the layout rather than on the total.",
    },
    {
      quote:
        "The correct size of a home is the size you use. Everything beyond that is a room you heat, clean, insure and apologise for.",
    },
    {
      p: "Either way, settle it with documents rather than impressions. Ask for the unit plans, the carpet areas and the charge schedule for both, set them side by side, and let the arithmetic argue with your instinct — before a booking form, not after one.",
    },
  ],
};
