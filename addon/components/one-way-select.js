import Component from '@ember/component';
import { A as emberArray, isArray } from '@ember/array';
import EmberObject, { computed, get, set } from '@ember/object';
import { alias, empty, not, or } from '@ember/object/computed'
import { isBlank, isNone, isPresent } from '@ember/utils';
import { w } from '@ember/string';

import layout from '../templates/components/one-way-select';

const OneWaySelectComponent = Component.extend({
  layout,
  tagName: 'select',

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  NON_ATTRIBUTE_BOUND_PROPS: [
    'value',
    'update',
    'options',
    'paramValue',
    'prompt',
    'promptIsSelectable',
    'includeBlank',
    'optionValuePath',
    'optionLabelPath',
    'optionComponent',
    'groupLabelPath',
    'class',
    'classNames'
  ],

  attributeBindings: [
    'multiple'
  ],

  didReceiveAttrs() {
    this._super(...arguments);

    let newAttributeBindings = [];
    // eslint-disable-next-line ember/no-attrs-in-components
    for (let key in this.attrs) {
      if (this.NON_ATTRIBUTE_BOUND_PROPS.indexOf(key) === -1 && this.attributeBindings.indexOf(key) === -1) {
        newAttributeBindings.push(key);
      }
    }

    set(this, 'attributeBindings', this.attributeBindings.concat(newAttributeBindings));

    let value = get(this, 'paramValue');
    if (value === undefined) {
      value = get(this, 'value');
    }

    set(this, 'selectedValue', value);

    let options = get(this, 'options');
    if (typeof options === 'string') {
      options = w(options);
    }

    let firstOption = get(emberArray(options), 'firstObject');
    if (firstOption &&
        isPresent(get(firstOption, 'groupName')) &&
        isArray(get(firstOption, 'options'))) {
      set(this, 'optionsArePreGrouped', true);
    }

    if (isBlank(get(this, 'promptIsSelectable'))) {
      set(this, 'promptIsSelectable', false);
    }

    set(this, 'options', emberArray(options));
  },

  nothingSelected: empty('selectedValue'),
  promptIsDisabled: not('promptIsSelectable'),
  hasGrouping: or('optionsArePreGrouped', 'groupLabelPath'),
  computedOptionValuePath: or('optionValuePath', 'optionTargetPath'),

  optionGroups: computed('options.[]', function() {
    let groupLabelPath = get(this, 'groupLabelPath');
    let options = get(this, 'options');
    let groups = emberArray();

    if (!groupLabelPath) {
      return options;
    }

    options.forEach((item) => {
      let label = get(item, groupLabelPath);

      if (label) {
        let group = groups.findBy('groupName', label);

        if (group == null) {
          group = EmberObject.create({
            groupName: label,
            options:   emberArray()
          });

          groups.pushObject(group);
        }

        get(group, 'options').pushObject(item);
      } else {
        groups.pushObject(item);
      }
    });

    return groups;
  }),

  change() {
    let value;

    if (get(this, 'multiple') === true) {
      value = this._selectedMultiple();
    } else {
      value = this._selectedSingle();
    }

    this.update(value);
  },

  prompt: alias('includeBlank'),

  _selectedMultiple() {
    let options = this.element.options;
    let selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    return selectedValues.map((selectedValue) => {
      return this._findOption(selectedValue);
    });
  },

  _selectedSingle() {
    let selectedValue = this.element.value;
    return this._findOption(selectedValue);
  },

  _findOption(value) {
    let options = get(this, 'options');
    let optionValuePath = get(this, 'computedOptionValuePath');
    let optionTargetPath = get(this, 'optionTargetPath');
    let optionsArePreGrouped = get(this, 'optionsArePreGrouped');

    let findOption = (item) => {
      if (optionValuePath) {
        return `${get(item, optionValuePath)}` === value;
      } else {
        return `${item}` === value;
      }
    };

    let foundOption;
    if (optionsArePreGrouped) {
      foundOption = options.reduce((found, group) => {
        return found || get(group, 'options').find(findOption);
      }, undefined);
    } else {
      foundOption = options.find(findOption);
    }

    if (optionTargetPath && !isNone(foundOption)) {
      return get(foundOption, optionTargetPath);
    } else {
      return foundOption;
    }
  }
});

OneWaySelectComponent.reopenClass({
  positionalParams: ['paramValue']
});

export default OneWaySelectComponent;
