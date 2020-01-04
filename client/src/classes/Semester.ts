import { gql } from 'apollo-boost';
import Apollo from './Apollo';
import { store } from 'IndexApp';
import metadataReducer from 'redux/reducers/metadata';
import ExamSet from './ExamSet';
import Specialty from './Specialty';
import Tag from './Tag';

interface Semester {
  id: number;
  value: number;
  name: string;
  shortName: string;
  questionCount: number;
  examSets: ExamSet[];
  specialties: Specialty[];
  tags: Tag[];
}

class Semester {
  static fetchAll = async () => {
    const query = gql`
      query {
        semesters {
          id
          value
          name
          shortName
          questionCount
          examSets {
            ...ExamSet
          }
          tags {
            ...Tag
          }
          specialties {
            ...Specialty
          }
        }
      }
      ${ExamSet.fragmentFull}
      ${Tag.fragmentFull}
      ${Specialty.fragmentFull}
    `;

    const semesters = await Apollo.query<Semester[]>('semesters', query);

    await store.dispatch(metadataReducer.actions.setSemesters(semesters));
  };
}

export default Semester;