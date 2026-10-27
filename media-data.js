'use strict';
const MEDIA_CARDS=[
['Clarification','Ask the party to explain something more clearly.',['What exactly do you mean by…?','How would that work?','Can you give us a concrete example?']],
['Fairness','Challenge whether the proposal is fair.',['Why should this group receive special treatment?','Is this fair for people who do not benefit?','Who could be disadvantaged?']],
['Cost / resources','Ask what the party would prioritise if resources are limited.',['How would this be funded?','What would you prioritise?','Would this mean spending less on something else?']],
['Consequences','Ask about a possible negative result.',['What could go wrong?','Could this create another problem?','What unintended consequence might this have?']],
['Reality check','Challenge whether the policy is realistic.',['This sounds good, but is it realistic?','What would actually change?','How would this work in everyday life?']],
['Contradiction','Identify a possible tension between two ideas.',['You want ______, but you also say ______. How do these ideas fit together?']],
['Comparison','Compare this proposal with another party’s actual policy.',['Another party proposes ______. Why is your idea better?','What makes your proposal different?','Why should voters choose your solution?']]
];
const MEDIA_PRESSURE=['Please answer the question directly.','Can you give one concrete example?',"You haven’t answered the second part of the question.",'What is the biggest weakness in your proposal?','Another party says your idea is unrealistic. Your response?','Who could lose from this policy?','What would you change if the policy did not work?','Can you explain that more simply?','What would you say to a voter who strongly disagrees?','You have 20 seconds. Give us your clearest answer.'];
const MEDIA_NEWS=[
['New study raises concerns about teen screen time','A new study reports that teenagers are spending increasingly large amounts of their free time using digital devices.',[0,3,4],'Does this change your position on technology and digital devices in schools?'],
['Local leisure budget will be reduced','The local government announces that less money will be available for sports and leisure programmes next year.',[5,6,0],'Which programme would you protect first, and why?'],
['Cyberattack disrupts online public services','Several important online public services are temporarily unavailable following a cyberattack.',[3,1,5],'Does this change your position on digital public services?'],
['Transport prices fall, but services become less frequent','Public transport becomes cheaper, but buses and trains run less often.',[0,2,6],'What matters more: cheaper transport or better transport?'],
['Parents question later school start times','A school starts lessons later. Students report feeling less tired, but some families say the new schedule creates childcare and work problems.',[0,4],'Would you maintain, modify or reconsider the proposal?'],
['Online scams increase','Reports of online scams rise significantly, especially among less confident technology users.',[3,1],'What should change in your digital policy?']
];
const MEDIA_PAIRINGS=[[1,4],[3,0],[4,6],[1,5],[0,2],[3,6],[2,5]];
const MEDIA_CATEGORIES=['Direct response','Development','Reaction','Clarity','Register','Party coherence','Interaction','Fluency'];
