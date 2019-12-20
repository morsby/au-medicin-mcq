import React, { useState, useEffect } from 'react';

import { breakpoints, urls } from 'utils/common';

import selectionTranslations from './selectionTranslations.json';
import { withLocalize, Translate, LocalizeContextProps } from 'react-localize-redux';

import { Container, Header, Divider, Button, Message, Input } from 'semantic-ui-react';

import SelectionSemesterSelector from 'components/Selection/SelectionComponents/SelectionSemesterSelector';
import SelectionNSelector from 'components/Selection/SelectionComponents/SelectionNSelector';
import SelectionSetSelector from 'components/Selection/SelectionComponents/SelectionSetSelector';
import SelectionMetadataSelector from 'components/Selection/SelectionComponents/SelectionMetadataSelector';
import SelectionTypeSelector from 'components/Selection/SelectionComponents/SelectionTypeSelector';
import SelectionUniqueSelector from 'components/Selection/SelectionComponents/SelectionUniqueSelector';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducers';
import { useHistory } from 'react-router';
import Question from 'classes/Question';
import Quiz from 'classes/Quiz';
import Semester from 'classes/Semester';
import Metadata from 'classes/Metadata';

export interface SelectionProps extends LocalizeContextProps {}

/**
 * Hovedsiden til at håndtere alle valg af spørgsmål.
 */
const Selection: React.SFC<SelectionProps> = ({ addTranslation, translate }) => {
  const [errors, setErrors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const metadata = useSelector((state: ReduxState) => state.metadata);
  const ui = useSelector((state: ReduxState) => state.ui);
  const user = useSelector((state: ReduxState) => state.auth.user);
  const quizQuestions = useSelector((state: ReduxState) => state.quiz.questions);
  const { type, selectedSemester } = ui.selection;
  const { semesters } = metadata;
  const history = useHistory();

  useEffect(() => {
    addTranslation(selectionTranslations);
    Semester.fetchAll();
  }, [addTranslation]);

  useEffect(() => {
    Metadata.fetchById(selectedSemester);
  }, [selectedSemester]);

  /**
   * Func der (efter validering) henter spørgsmålene
   * @param  {string} quizType Er der tale om en ny quiz eller fortsættelse
   *                           af en gammel?
   */

  const searchHandler = (e, { value }) => {
    setSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit('new');
    }
  };

  const handleSubmit = (quizType) => {
    let err = [];

    if (err.length === 0) {
      // Hvis vi er ved at søge
      if (search !== '') {
        Question.fetch({ semester: ui.selection.selectedSemester, search });
        return history.push(urls.quiz);
      }

      // tjek for fejl, start eller ej
      // Ny quiz? Hent spørgsmål
      if (quizType === 'new') {
        Quiz.start();
      }

      // Uanset om det er en ny quiz eller ej – skift url til quizzen.
      history.push(urls.quiz);
    } else {
      setErrors(err);
    }
  };

  return (
    <div className="flex-container">
      <Container className="content">
        <Header as="h1" style={{ textAlign: 'center' }}>
          MedMcq
        </Header>
        <Divider />
        <SelectionSemesterSelector />
        <Divider hidden />
        <SelectionTypeSelector />
        <Divider hidden />
        {type !== 'set' && (
          <>
            <SelectionNSelector />
            <Divider hidden />
            <Translate
              id="selectionNSelector.total_n"
              data={{ n: (semesters[selectedSemester] || {}).questionCount }}
            />
            <Divider />
          </>
        )}

        {type !== 'specialer' && type !== 'set' && (
          <>
            <h3>
              <Translate id="search.title" />
            </h3>
            <p>
              <Translate id="search.description" />
            </p>
            <Input
              value={search}
              onChange={searchHandler}
              fluid
              icon="search"
              iconPosition="left"
              placeholder={translate('search.placeholder')}
              onKeyPress={(e) => handleKeyPress(e)}
            />
            <Divider />
          </>
        )}

        {type === 'specialer' && (
          <>
            <SelectionMetadataSelector />
            <Divider />
          </>
        )}

        {type === 'set' && <SelectionSetSelector />}

        {errors.length > 0 && (
          <Message negative>
            {errors.map((err) => {
              return <p key={err}>{err}</p>;
            })}
          </Message>
        )}
        {window.innerWidth < breakpoints.mobile && <Divider hidden />}
        {user && type !== 'set' && <SelectionUniqueSelector />}

        <Button
          style={{ cursor: 'pointer' }}
          fluid
          color="green"
          basic
          onClick={() => handleSubmit('new')}
        >
          Start!
        </Button>
        <div style={{ height: '5px' }} />
        {quizQuestions.length > 0 && (
          <Button basic fluid color="orange" onClick={() => handleSubmit('cont')}>
            <Translate id="selection.static.continue_quiz" />
          </Button>
        )}

        <Divider hidden />
      </Container>
    </div>
  );
};

export default withLocalize(Selection);