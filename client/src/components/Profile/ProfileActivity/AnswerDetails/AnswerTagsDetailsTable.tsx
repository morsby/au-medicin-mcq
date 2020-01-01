import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Tag } from 'antd';
import _ from 'lodash';
import { useHistory } from 'react-router';
import { ReduxState } from 'redux/reducers';
import UIReducer from 'redux/reducers/ui';
import Quiz from 'classes/Quiz';

export interface AnswerTagsDetailsTableProps {
  answers: any[];
}

const AnswerTagsDetailsTable: React.SFC<AnswerTagsDetailsTableProps> = ({ answers }) => {
  const [answeredTags, setAnsweredTags] = useState([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const questions = useSelector((state: ReduxState) => state.questions.questions);
  const selectedSemester = useSelector((state: ReduxState) => state.ui.selection.semesterId);
  const tags = useSelector((state: ReduxState) =>
    state.metadata.semesters
      .find((semester) => semester.id === selectedSemester)
      .tags.filter((tag) => tag.semester.id === selectedSemester)
  );

  const getPercentCorrect = (record) => {
    const percent = Math.round((record.correct / record.tries) * 100);
    if (isNaN(percent)) return 0;
    return percent;
  };

  const getColor = (record) => {
    const percent = getPercentCorrect(record);

    if (percent >= 80) return 'green';
    if (percent < 80 && percent >= 50) return 'volcano';
    if (percent < 50 && percent >= 30) return 'purple';
    if (percent < 30) return 'red';
  };

  const handleTagSelect = async (tagId: number) => {
    await dispatch(UIReducer.actions.changeSelection({ type: 'tagIds', value: [tagId] }));
    await dispatch(UIReducer.actions.changeSelection({ type: 'n', value: 80 }));
    await Quiz.start();
    history.push('/quiz');
  };

  useEffect(() => {
    const answeredTags = {};

    // Insert tags into answeredTags
    for (let tag of tags) {
      answeredTags[tag.id] = {
        id: tag.id,
        name: tag.name,
        correct: 0,
        tries: 0
      };
    }

    // For each answer, add the count to answeredTags
    _.map(answers, (answer, questionId) => {
      for (let tag of _.map<any>(questions[questionId].tags)) {
        if (answeredTags[tag.id]) {
          answeredTags[tag.id].correct += answer.correct;
          answeredTags[tag.id].tries += answer.tries;
        }
      }
    });

    // Send the array to state, to refresh table
    setAnsweredTags(_.map(answeredTags));
  }, [tags, answers, questions]);

  const columns = [
    {
      title: 'Tag',
      render: (record) => (
        <p
          style={{ color: '#1890ff', cursor: 'pointer' }}
          onClick={() => handleTagSelect(record.id)}
        >
          {record.name}
        </p>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Korrekt',
      dataIndex: 'correct',
      sorter: (a, b) => a.correct - b.correct
    },
    {
      title: 'Forsøg',
      dataIndex: 'tries',
      sorter: (a, b) => a.tries - b.tries
    },
    {
      title: 'Percent',
      render: (record) => {
        if (isNaN(Math.round(record.correct / record.tries))) {
          return <Tag color="blue">0%</Tag>;
        } else {
          return <Tag color={getColor(record)}>{getPercentCorrect(record)}%</Tag>;
        }
      },
      sorter: (a, b) => getPercentCorrect(a) - getPercentCorrect(b)
    }
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        size="small"
        loading={answeredTags.length < 1}
        bordered
        columns={columns}
        dataSource={answeredTags}
        rowKey={(record) => record.id}
      />
    </div>
  );
};

export default AnswerTagsDetailsTable;
