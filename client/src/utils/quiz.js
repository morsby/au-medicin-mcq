import { store } from 'index';

export const smoothScroll = (h, dir = 'up') => {
  let top = window.pageYOffset || document.documentElement.scrollTop;
  let bottom = document.body.scrollHeight;
  let px = 20;
  let i = h || top;
  if (dir === 'up') {
    if (i > px) {
      setTimeout(() => {
        window.scrollTo(0, i);
        smoothScroll(i - px);
      }, 10);
    } else {
      window.scrollTo(0, 0);
    }
  } else if (dir === 'down') {
    if (i < bottom - px) {
      setTimeout(() => {
        window.scrollTo(0, i);
        smoothScroll(i + px, dir);
      }, 10);
    } else {
      window.scrollTo(0, bottom);
    }
  }
};

export const evalAnswer = (question, userAnswer, answerNo) => {
  if (!userAnswer) return null; // hvis ikke svaret

  if (question.correctAnswers.includes(answerNo)) {
    return 'green';
  } else if (answerNo === userAnswer) {
    return 'red'; // hvis forkert svar
  } else {
    return 'grey'; // ikke valgt mulighed
  }
};

export const calculateResults = (questions, answers) => {
  let res = {
    status: true,
    n: 0,
    correct: 0
  };
  for (var questionId in answers) {
    res.n++;
    if (questions.entities.questions[questionId].correctAnswers.includes(answers[questionId]))
      res.correct++;
  }

  if (res.n === 0) {
    return { status: false };
  }
  res.percentage = `${Math.round((res.correct / res.n) * 10000) / 100}%`;

  return res;
};

export const subSupScript = (text) => {
  return text.replace(/\^(.+?)\^/g, '<sup>$1</sup>').replace(/~(.+?)~/g, '<sub>$1</sub>');
};

export const isAnswered = (question) => {
  const state = store.getState();
  return Object.prototype.hasOwnProperty.call(state.quiz.answers, question.id);
};
