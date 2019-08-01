/* eslint-disable camelcase */
import axios from 'axios';
import * as types from './types';
import { Dispatch } from 'redux';

const questionApi = '/api/questions';

export const getQuestions = ({ ids = null, quiz = true, profile = !quiz }) => async (
  dispatch,
  getState
) => {
  dispatch({ type: types.FETCH_QUESTIONS_REQUEST });
  let state = getState();
  let {
    type,
    selectedSemester,
    selectedSpecialtyIds,
    selectedTagIds,
    selectedSetId,
    n,
    onlyNew
  } = state.ui.selection;

  let res;
  // Hvilke spøgsmål bedes der om?
  if (ids) {
    type = 'ids';
    if (ids.length < 1) {
      return dispatch({
        type: types.FETCH_QUESTIONS_FAILURE,
        payload: { type: 'NotFound', message: 'No questions found' }
      });
    }
  }

  if (profile) {
    type = 'profile';
  }

  switch (type) {
    /*
      types:
        - ids
        - profile
        - set
        - random
        - specialer/tags
       */

    case 'ids':
    case 'specific':
      res = await axios.get(questionApi, { params: { ids: ids.join(',') } });
      break;
    case 'profile':
      res = await axios.get(questionApi, { params: { profile, semesters: selectedSemester } });
      break;
    case 'set':
      res = await axios.get(`/api/exam_sets/${selectedSetId}/questions`);
      break;
    default:
      res = await axios.get(questionApi, {
        params: {
          semesters: selectedSemester,
          specialties: (selectedSpecialtyIds || []).join(',') || undefined,
          tags: (selectedTagIds || []).join(',') || undefined,
          n: n || undefined,
          onlyNew: onlyNew || undefined
        }
      });
  }

  if (res.data.length > 0) {
    dispatch({
      type: types.FETCH_QUESTIONS_SUCCESS,
      payload: res.data,
      quiz
    });
  } else {
    dispatch({
      type: types.FETCH_QUESTIONS_FAILURE,
      payload: { type: 'NotFound', message: 'No questions found' }
    });
  }
};

export const writeComment = (questionId, text, isPrivate, isAnonymous) => async (dispatch) => {
  const res = await axios.post(`/api/questions/${questionId}/comment`, {
    text,
    isPrivate,
    isAnonymous
  });
  dispatch({
    type: types.QUESTION_UPDATE,
    payload: res.data
  });
};

export const deleteComment = (questionId, comment_id) => async (dispatch) => {
  const res = await axios.delete(`/api/questions/${questionId}/comment/${comment_id}`);

  dispatch({
    type: types.QUESTION_UPDATE,
    payload: res.data
  });
};

export const editComment = (questionId, commentId, comment, isPrivate, isAnonymous) => async (
  dispatch
) => {
  const res = await axios.patch(`/api/questions/${questionId}/comment/${commentId}`, {
    text: comment,
    isPrivate,
    isAnonymous
  });

  dispatch({
    type: types.QUESTION_UPDATE,
    payload: res.data
  });
};

export const questionReport = ({ type, data }) => (dispatch) => {
  axios.post('/api/questions/report', { type, data });
  dispatch({ type: types.QUESTION_REPORT });
};

export const voteAction = (type, questionId, metadataId, vote) => async (dispatch) => {
  if (vote !== 'delete') {
    vote = Number(vote);
  }

  const res = await axios.put(`/api/questions/${questionId}/vote`, {
    type: type,
    id: Number(metadataId),
    value: vote
  });
  dispatch({
    type: types.QUESTION_UPDATE,
    payload: res.data
  });
};

export const searchQuestion = (semester, searchString) => async (dispatch) => {
  dispatch({ type: types.FETCH_QUESTIONS_REQUEST });
  const res = await axios.post('/api/questions/search', { semester, searchString });

  dispatch({
    type: types.FETCH_QUESTIONS_SUCCESS,
    payload: res.data,
    quiz: true
  });
};

export const createBookmark = (questionId: Number) => async (dispatch: Dispatch) => {
  try {
    await axios.post(`/api/questions/${questionId}/bookmark`);
    dispatch(types.CREATE_BOOKMARK(questionId));
  } catch (error) {
    console.log(error);
  }
};

export const removeBookmark = (questionId: number) => async (dispatch: Dispatch) => {
  try {
    await axios.delete(`/api/questions/${questionId}/bookmark`);
    dispatch(types.REMOVE_BOOKMARK(questionId));
  } catch (error) {
    console.log(error);
  }
};
