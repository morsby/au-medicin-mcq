import React, { useState, useEffect, useCallback } from 'react';
import { Segment, Dropdown, Divider } from 'semantic-ui-react';
import { useMutation, useQuery } from 'react-apollo-hooks';
import { createShareLink as query_createShareLink } from 'queries/shareLink';
import * as queries from 'queries/questions';
import { Table, Icon, Button } from 'antd';
import Highlighter from 'react-highlight-words';
import ExtendedRow from 'components/Sharebuilder/extendedRow';
import { useSelector, useDispatch } from 'react-redux';
import { IReduxState } from 'reducers';
import _ from 'lodash';
import SearchDropdown from 'components/Sharebuilder/searchDropdown';
import { RouteComponentProps } from 'react-router';
import * as actions from 'actions/index';
import 'antd/lib/table/style/css';
import 'antd/lib/button/style/css';

export interface SharebuilderProps extends RouteComponentProps {}

interface IFilter {
  semester: number;
  text: string;
  tags: [string?];
  specialties: [string?];
  id: string;
}

const Sharebuilder: React.SFC<SharebuilderProps> = ({ history }) => {
  const [filter, setFilter]: [IFilter, Function] = useState({
    semester: 4,
    text: '',
    tags: [],
    specialties: [],
    id: ''
  });
  const [queryFilter, setQueryFilter]: [IFilter, Function] = useState({
    semester: 999,
    text: '',
    tags: [],
    specialties: [],
    id: ''
  });
  // Redux
  const dispatch = useDispatch();
  const picked = useSelector((state: IReduxState) => state.shareBuilder.picked);
  const semesters = useSelector((state: IReduxState) => state.metadata.entities.semesters);
  const specialties = useSelector((state: IReduxState) => state.metadata.entities.specialties);
  const tags = useSelector((state: IReduxState) => state.metadata.entities.tags);
  // GraphQL
  const [createShareLink, { loading: createLinkLoading, data: createLinkData }] = useMutation(
    query_createShareLink
  );
  const { data: pickedQuestions, loading: idsLoading } = useQuery(queries.getQuestionsFromIds, {
    variables: { ids: picked }
  });
  const { loading, data } = useQuery(queries.fetchFilteredQuestions, { variables: queryFilter });
  // Debounce filter, for ikke at query på hvert keystroke (delay er 1 sekund, som angivet herunder)
  const debounceQueryFilter = useCallback(
    _.debounce((filter: IFilter) => setQueryFilter(filter), 1000),
    []
  );

  // UseEffect til at skifte query filteret, men kun hvis man faktisk har valgt filtre
  // Er en lidt "omstændig" måde at undgå at useQuery bliver kaldt uden parameters,
  // da det henter alle spørgsmål. Bedre implementering søges.. ;)
  useEffect(() => {
    const { text, tags, specialties, id } = filter;
    if (text || tags.length > 0 || specialties.length > 0 || id) {
      debounceQueryFilter(filter);
    }
  }, [debounceQueryFilter, filter]);

  const handleChange = (value: string, type: keyof IFilter) => {
    setFilter((prevFilter) => ({ ...prevFilter, [type]: value }));
  };

  // Kalder redux når man har valgt et spørgsmål, og lægger det her (under shareBuilder reducer -> picked)
  const handlePick = (value) => {
    const index = _.indexOf(picked, value);

    if (index !== -1)
      return dispatch(
        actions.changePicked([...picked.slice(0, index), ...picked.slice(index + 1)])
      );

    const newPick = picked.concat(value);

    dispatch(actions.changePicked(newPick));
  };

  // Function til at skabe linket, når man har bygget færdigt - kalder useMutation
  const handleCreateLink = () => {
    createShareLink({ variables: { questionIds: picked } });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      filterIcon: <Icon type="search" style={{ color: filter.id ? '#1890ff' : undefined }} />,
      filterDropdown: (
        <SearchDropdown
          onChange={(value) => handleChange(value, 'id')}
          value={String(filter.id)}
          type="search"
        />
      )
    },
    {
      title: 'Spørgsmål',
      dataIndex: 'text',
      key: 'text',
      filterDropdown: (
        <SearchDropdown
          onChange={(value) => handleChange(value, 'text')}
          value={filter.text}
          type="search"
        />
      ),
      filterIcon: <Icon type="search" style={{ color: filter.text ? '#1890ff' : undefined }} />,
      render: (text) => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={filter.text.split(' ')}
          autoEscape
          textToHighlight={text}
        />
      )
    },
    {
      title: 'Specialer',
      dataIndex: 'specialties',
      key: 'specialties',
      filterDropdown: (
        <SearchDropdown
          onChange={(value) => handleChange(value, 'specialties')}
          options={_(specialties)
            .filter((s) => s.semesterId === filter.semester)
            .map((s) => ({
              key: s.id,
              value: s.id,
              text: s.name
            }))
            .value()}
          value={filter.specialties}
          type="dropdown"
        />
      ),
      filterIcon: (
        <Icon
          type="search"
          style={{ color: filter.specialties.length > 0 ? '#1890ff' : undefined }}
        />
      ),
      render: (record) => <p>{_.map(record, (s) => specialties[s.specialtyId].name).join(', ')}</p>
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      filterDropdown: (
        <SearchDropdown
          options={_(tags)
            .filter((t) => t.semesterId === filter.semester && t.name !== 'Tags')
            .map((t) => ({
              key: t.id,
              text: t.name,
              value: t.id
            }))
            .value()}
          onChange={(value) => handleChange(value, 'tags')}
          value={filter.tags}
          type="dropdown"
        />
      ),
      filterIcon: (
        <Icon type="search" style={{ color: filter.tags.length > 0 ? '#1890ff' : undefined }} />
      ),
      render: (record) => (
        <p>
          {_(record)
            .map((t) => tags[t.tagId].name)
            .filter((t) => t !== 'Tags')
            .value()
            .join(', ')}
        </p>
      )
    },
    {
      title: '',
      key: 'actions',
      render: (record) => (
        <>
          <Button
            type={_.indexOf(picked, record.id) !== -1 ? 'danger' : 'primary'}
            onClick={() => handlePick(record.id)}
          >
            {_.indexOf(picked, record.id) !== -1 ? <Icon type="cross" /> : 'Tilføj'}
          </Button>
          <Button onClick={() => history.push('/quiz/' + record.id)}>Gå til spørgsmål</Button>
        </>
      )
    }
  ];

  return (
    <div className="flex-container">
      <Segment
        className="content"
        style={{ margin: '5rem auto', maxWidth: '1300px' }}
        textAlign="center"
      >
        <h1>Opret Quiz</h1>
        <label>Valg</label>
        <Table
          columns={columns}
          loading={idsLoading}
          dataSource={!idsLoading ? pickedQuestions.questions : null}
        />
        <Divider hidden />
        <Button type="primary" disabled={createLinkLoading} onClick={handleCreateLink}>
          Opret link
        </Button>
        {createLinkData && (
          <div style={{ border: '2px solid grey', padding: '1rem', margin: '1rem' }}>
            <h3>
              Dette er dit link:{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={window.location.href + '/' + createLinkData.createShareLink}
              >
                {window.location.href + '/' + createLinkData.createShareLink}
              </a>
            </h3>
            <p>Linket åbner i et nyt vindue. Husk at gemme det hvis du skal bruge det igen.</p>
          </div>
        )}
        <Divider />
        <label>Semester</label>
        <Dropdown
          options={_.map(semesters, (semester) => ({
            value: semester.id,
            text: `${semester.value}. semester (${semester.name})`,
            key: semester.id
          }))}
          value={filter.semester}
          onChange={(e, { value }: { value: number }) =>
            setFilter((prevFilter) => ({ ...prevFilter, semester: value }))
          }
          fluid
          selection
        ></Dropdown>
        <Divider />
        <Table
          rowKey={(record: any) => record.id}
          dataSource={!loading ? data.questions : null}
          loading={loading}
          columns={columns}
          expandedRowRender={(record) => <ExtendedRow record={record} />}
        ></Table>
      </Segment>
    </div>
  );
};

export default Sharebuilder;
