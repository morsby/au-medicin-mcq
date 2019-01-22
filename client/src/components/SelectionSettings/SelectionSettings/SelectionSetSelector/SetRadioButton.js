import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { groupQuestions, getIds } from '../../../../utils/questions';
import { Form, Radio, Divider, Header, Icon } from 'semantic-ui-react';

const SetRadioButton = ({
    set,
    answeredQuestions,
    groupedQuestions,
    activeSet,
    onChange,
}) => {
    let completed = '';

    // Tjekker hvilke spg. i sættet der ikke er besvaret allerede
    if (answeredQuestions) {
        let missingQuestions = _.difference(
            getIds(groupedQuestions),
            getIds(answeredQuestions)
        );

        if (missingQuestions.length === 0)
            completed = <Icon name="check" color="green" />;
    }

    return (
        <Form.Group key={set.api}>
            <Form.Field>
                <Radio
                    label={set.text}
                    value={set.api}
                    checked={set.api === activeSet}
                    name="set"
                    onChange={onChange}
                />{' '}
                {completed}
                <Divider vertical hidden />
            </Form.Field>
        </Form.Group>
    );
};

export default SetRadioButton;