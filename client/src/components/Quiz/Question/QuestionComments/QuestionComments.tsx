import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Form, TextArea, Button, Message, Checkbox } from 'semantic-ui-react';

import { Translate } from 'react-localize-redux';

import QuestionCommentSingle from './QuestionCommentSingle';
import makeToast from 'redux/actions/makeToast';
import { ReduxState } from 'redux/reducers';
import Comment from 'classes/Comment';
import _ from 'lodash';

/**
 * Viser kommentarer til et spørgsmål
 * Modtager alle props fra ../Question.js
 * @param {array} comments          Array af kommentarer til spørgsmålet
 * @param {string} newComment       Den nye kommentar
 * @param {func}  onCommentType     Funktion til at ændre kommentar-tekst
 * @param {object} user             Brugeren
 */
export interface QuestionCommentsProps {
  type: 'private' | 'public';
}

const QuestionComments: React.SFC<QuestionCommentsProps> = ({ type }) => {
  const dispatch = useDispatch();
  const currentQuestionNumber = useSelector(
    (state: ReduxState) => state.quiz.currentQuestionNumber
  );
  const question = useSelector(
    (state: ReduxState) => state.questions.questions[currentQuestionNumber]
  );
  const [editCommentId, setEditCommentId] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const mostLiked = _.maxBy(question.publicComments, (comment) => comment.likes.length);
  const user = useSelector((state: ReduxState) => state.auth.user);
  let form;

  useEffect(() => {
    setIsAnonymous(false);
    setComment('');
  }, [question]);

  // Hvis brugeren skifter fra public til privat (eller omvendt), mens der skrives
  useEffect(() => {
    setIsAnonymous(false);
  }, [type]);

  const onCommentPost = async () => {
    let isPrivate = type === 'private';
    setLoading(true);

    try {
      if (editCommentId) {
        await Comment.edit({
          questionId: question.id,
          commentId: editCommentId,
          isAnonymous,
          isPrivate
        });
        setEditCommentId(null);
      } else {
        await Comment.add({
          questionId: question.id,
          commentId: editCommentId,
          isPrivate,
          isAnonymous
        });
      }

      // TODO: Vent med at slette kommentar til den ER postet
      setComment('');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      dispatch(makeToast('toast.genericError', 'error'));
    }
  };

  const onEditComment = (comment) => {
    setEditCommentId(comment.id);
    setComment(comment.text);
    setIsAnonymous(!!comment.anonymous);
  };

  const undoEdit = () => {
    setComment('');
    setEditCommentId(null);
    setIsAnonymous(false);
  };

  if (user) {
    let skrivRet = editCommentId ? (
      <Translate id="questionComments.edit_a_comment" />
    ) : (
      <Translate id="questionComments.write_a_comment" />
    );
    form = (
      <div style={{ marginTop: '1em' }}>
        <h5>{skrivRet}</h5>

        <Form>
          <Translate>
            {({ translate }) => (
              <TextArea
                name="comment"
                placeholder={translate('questionComments.write_a_comment')}
                onChange={(e, { value }) => setComment(value as string)}
                value={comment}
              />
            )}
          </Translate>
          {type === 'public' && (
            <Message info>
              <Translate id="questionComments.public_comment_info" />
            </Message>
          )}
          {type === 'private' && (
            <Message info>
              <Translate id="questionComments.private_comment_info" />
            </Message>
          )}
          <Button
            onClick={onCommentPost}
            disabled={comment.length < 3 || loading}
            loading={loading}
          >
            <Translate id="questionComments.comment" />
          </Button>
          {editCommentId && (
            <Button negative onClick={undoEdit} disabled={loading} loading={loading}>
              <Translate id="questionComments.undo_edit" />
            </Button>
          )}
          {type === 'public' && (
            <Translate>
              {({ translate }) => (
                <Checkbox
                  style={{ marginLeft: '5px' }}
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  label={translate('questionComments.anonymous')}
                />
              )}
            </Translate>
          )}
        </Form>
      </div>
    );
  } else {
    form = (
      <Message warning>
        <Translate id="questionComments.login_to_write" />
      </Message>
    );
  }

  return (
    <div>
      {type === 'private' &&
        question.privateComments.map((c) => (
          <QuestionCommentSingle
            key={c.id}
            commentId={c.id}
            questionId={question.id}
            type={type}
            onEditComment={onEditComment}
            mostLiked={!c.isPrivate && c.likes.length === mostLiked.likes.length}
          />
        ))}
      {type === 'public' &&
        question.publicComments.map((c) => (
          <QuestionCommentSingle
            key={c.id}
            commentId={c.id}
            questionId={question.id}
            type={type}
            onEditComment={onEditComment}
            mostLiked={!c.isPrivate && c.likes.length === mostLiked.likes.length}
          />
        ))}
      {form}
    </div>
  );
};

export default QuestionComments;
