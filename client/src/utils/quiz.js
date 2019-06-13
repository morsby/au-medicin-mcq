import _ from 'lodash';

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

export const evalAnswer = (question, answer) => {
  if (!question.answer) return null; // hvis ikke svaret

  if (question.correctAnswers.includes(answer)) {
    return 'green';
  } else if (answer === question.answer) {
    return 'red'; // hvis forkert svar
  } else {
    return 'grey'; // ikke valgt mulighed
  }
};

export const calculateResults = (questions) => {
  let answered = _.filter(questions, (o) => typeof o.answer === 'number');

  let res;

  if (answered.length === 0) {
    res = { status: false };
  } else {
    let correct = 0;
    answered.map((question) => {
      if (question.correctAnswers.includes(question.answer)) correct++;
      return correct;
    });

    res = {
      status: true,
      n: answered.length,
      correct,
      percentage: `${Math.round((correct / answered.length) * 10000) / 100}%`
    };
  }

  return res;
};

export const subSupScript = (text) => {
  return text.replace(/\^(.+?)\^/g, '<sup>$1</sup>').replace(/~(.+?)~/g, '<sub>$1</sub>');
};
