import React from 'react';
import { Checkbox, Divider } from 'semantic-ui-react';
import { Translate } from 'react-localize-redux';
import { Tag, Table } from 'antd';
import { useSelector } from 'react-redux';
import { IReduxState } from 'reducers';
import _ from 'lodash';
import { useHistory } from 'react-router';
import AnswerDetailsTableExtendedRow from './AnswerDetailsTableExtendedRow';

export interface AnswersDetailsTableProps {
  answers: any[];
  toggleCheckbox: Function;
  selected: any[];
  questions: any[];
}

const AnswersDetailsTable: React.SFC<AnswersDetailsTableProps> = ({
  answers,
  toggleCheckbox,
  selected,
  questions
}) => {
  const history = useHistory();
  const { specialties, examSets, tags } = useSelector(
    (state: IReduxState) => state.metadata.entities
  );

  const getColor = (answer) => {
    if (answer.correct === answer.tries) return 'green';
    if (answer.correct < answer.tries && answer.correct > 0) return 'orange';
    if (answer.correct === 0) return 'red';
  };

  const columns = [
    {
      title: '',
      key: 'questionId',
      render: (record) => (
        <Checkbox
          onChange={() => toggleCheckbox(record.questionId)}
          checked={selected.includes(record.questionId)}
        />
      )
    },
    {
      title: <Translate id="profileAnswerDetails.table_headers.performance" />,
      render: (record) => (
        <Tag color={getColor(record)}>
          {record.correct} / {record.tries} ({Math.round((record.correct / record.tries) * 100)}
          %)
        </Tag>
      ),
      sorter: (a, b) =>
        Math.round((a.correct / a.tries) * 100) - Math.round((b.correct / b.tries) * 100)
    },
    {
      title: <Translate id="profileAnswerDetails.table_headers.question" />,
      key: 'text',
      render: (record) => (
        <p
          style={{ color: '#1890ff', cursor: 'pointer' }}
          onClick={() => history.push(`quiz/${record.questionId}`)}
        >
          {questions[record.questionId].text.substr(0, 100)}...
        </p>
      )
    },
    {
      title: <Translate id="profileAnswerDetails.table_headers.specialty" />,
      render: (record) =>
        _.map(questions[record.questionId].specialties, ({ specialtyId }) => (
          <Tag color="blue">{specialties[specialtyId].name}</Tag>
        ))
    },
    {
      title: 'Tags',
      render: (record) =>
        _.map(questions[record.questionId].tags, ({ tagId }) => (
          <Tag color="geekblue">{tags[tagId].name}</Tag>
        ))
    },
    {
      title: <Translate id="profileAnswerDetails.table_headers.performance" />,
      render: (record) => (
        <>
          <Translate
            id={`profileAnswerDetails.${examSets[questions[record.questionId].examSetId].season}`}
          />
          {examSets[questions[record.questionId].examSetId].year}
        </>
      )
    }
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        bordered
        columns={columns}
        dataSource={_.map(answers, (a, questionId) => ({ ...a, questionId }))}
        expandedRowRender={(record) => {
          const question = questions[record.questionId];

          return (
            <>
              <p>{question.text}</p>
              <Divider />
              <AnswerDetailsTableExtendedRow question={question} />
            </>
          );
        }}
      />
    </div>
  );
};

export default AnswersDetailsTable;
