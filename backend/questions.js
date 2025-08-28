// backend/questions.js

const questions = [
  // Section I
  { id: 1, text: 'Is it difficult for you to talk to other people?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 2, text: 'When you are trying to explain something, do others tend to put words in your mouth, or finish your sentences for you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 3, text: 'In conversation, do your words usually come out the way you would like?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 4, text: 'Do you find it difficult to express your ideas when they differ from the ideas of people around you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 5, text: 'Do you assume that the other person knows what you are trying to say, and leave it to him/her to ask you questions?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 6, text: 'Do others seem interested and attentive when you are talking to them?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 7, text: 'When speaking, is it easy for you to recognize how others are reacting to what you are saying?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 8, text: 'Do you ask the other person to tell you how she/he feels about the point you are trying to make?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 9, text: 'Are you aware of how your tone of voice may affect others?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 10, text: 'In conversation, do you look to talk about things of interest to both you and the other person?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  // Section II
  { id: 11, text: 'In conversation, do you tend to do more talking than the other person does?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 12, text: 'In conversation, do you ask the other person questions when you don’t understand what they’ve said?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 13, text: 'In conversation, do you often try to figure out what the other person is going to say before they’ve finished talking?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 14, text: 'Do you find yourself not paying attention while in conversation with others?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 15, text: 'In conversation, can you easily tell the difference between what the person is saying and how he/she may be feeling?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 16, text: 'After the other person is done speaking, do you clarify what you heard them say before you offer a response?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 17, text: 'In conversation, do you tend to finish sentences or supply words for the other person?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 18, text: 'In conversation, do you find yourself paying most attention to facts and details, and frequently missing the tone of the speakers’ voice?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 19, text: 'In conversation, do you let the other person finish talking before reacting to what she/he says?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 20, text: 'Is it difficult for you to see things from the other person’s point of view?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  // Section III
  { id: 21, text: 'Is it difficult to hear or accept criticism from the other person?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 22, text: 'Do you refrain from saying something that you think will upset someone or make matters worse?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 23, text: 'When someone hurts your feelings, do you discuss this with him/her?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 24, text: 'In conversation, do you try to put yourself in the other person’s shoes?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 25, text: 'Do you become uneasy when someone pays you a compliment?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 26, text: 'Do you find it difficult to disagree with others because you are afraid they will get angry?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 27, text: 'Do you find it difficult to compliment or praise others?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 28, text: 'Do others remark that you always seem to think you are right?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 29, text: 'Do you find that others seem to get defensive when you disagree with their point of view?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 30, text: 'Do you help others to understand you by saying how you feel?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  // Section IV
  { id: 31, text: 'Do you have a tendency to change the subject when the other person’s feelings enter into the discussion?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 32, text: 'Does it upset you a great deal when someone disagrees with you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 33, text: 'Do you find it difficult to think clearly when you are angry with someone?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 34, text: 'When a problem arises between you and another person, can you discuss it without getting angry?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 35, text: 'Are you satisfied with the way you handle differences with others?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 36, text: 'Do you sulk for a long time when someone upsets you?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 37, text: 'Do you apologize to someone whose feelings you may have hurt?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 38, text: 'Do you admit that you’re wrong when you know that you are/were wrong about something?', scoring: { usually: 3, sometimes: 1, seldom: 0 } },
  { id: 39, text: 'Do you avoid or change the topic if someone is expressing his or her feelings in a conversation?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
  { id: 40, text: 'When someone becomes upset, do you find it difficult to continue the conversation?', scoring: { usually: 0, sometimes: 1, seldom: 3 } },
];

module.exports = { questions };