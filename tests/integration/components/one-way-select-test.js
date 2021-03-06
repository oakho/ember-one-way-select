import Component from '@ember/component';
import { htmlSafe } from '@ember/string';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { find, findAll, fillIn, render, triggerEvent } from '@ember/test-helpers';

module('Integration | Component | one-way-select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
      this.set('value', 'female');
      this.set('options', ['unknown', 'male', 'female']);
  });

  test('It renders a select box with options', async function(assert) {
    await render(hbs`
      {{one-way-select value=value options=options}}
    `);

    assert.dom('option').exists({ count: 3}, 'Select has three options');
  });

  test('A value is selected', async function(assert) {
    await render(hbs` {{one-way-select value=value options=options}} `);
    assert.dom('option:checked').hasValue('female', 'Female is selected');
  });

  test('Value can be the first positional param', async function(assert) {
    await render(hbs`{{one-way-select value options=options}}`);
    assert.dom('option:checked').hasValue('female', 'Female is selected');
  });

  test('Selecting a value updates the selected value', async function(assert) {
    this.set('update', (value) => this.set('value', value));
    await render(hbs`{{one-way-select value=value options=options update=(action update)}}`);
    find('select').value = 'male';
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasValue('male', 'Male is selected');
    assert.equal(this.get('value'), 'male', 'Value is \'male\'');
  });

  test('Selecting a value updates the selected value for pre-grouped options', async function(assert) {
    let groups = [
      {
        groupName: 'group1',
        options: [ 'value1' ]
      }, {
        groupName: 'group2',
        options: [ 'value2' ]
      }
    ];

    this.set('options', groups);
    this.set('update', (value) => this.set('value', value));

    await render(hbs`{{one-way-select value=value options=options update=(action update)}}`);

    await fillIn('select', 'value2');
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasValue('value2', 'value2 is selected');
    assert.equal(this.get('value'), 'value2', 'Value is \'value2\'');
  });

  test('Accepts a space seperated string for options', async function(assert) {
    await render(hbs`{{one-way-select value=value options="male female"}}`);

    assert.dom('option').exists({ count: 2 }, 'There are two options: male, female');
  });

  test('Can include a blank value', async function(assert) {
    await render(hbs`{{one-way-select value=value options=options includeBlank=true}}`);

    assert.dom('option').exists({ count: 4 }, 'There are four options');
  });

  test('Blank value can be given a text', async function(assert) {
    await render(hbs`{{one-way-select value=value options=options includeBlank="Select one"}}`);

    assert.dom('option').containsText('Select one', 'The blank option has "Select one" as label');
    assert.dom('option').isDisabled('The blank option is disabled by default');
  });

  test('Prompt is an alias for includeBlank', async function(assert) {
    await render(hbs`{{one-way-select value=value options=options prompt="Select one"}}`);

    assert.dom('option').containsText('Select one', 'The blank option has "Select one" as label');
  });

  test('Prompt can be given as SafeString', async function(assert) {
    this.set('promptSafeString', htmlSafe('Select one'));
    await render(hbs`{{one-way-select value=value options=options prompt=promptSafeString}}`);

    assert.dom('option').containsText('Select one', 'The blank option has "Select one" as label');
  });

  test('With prompt selection still works properly', async function(assert) {
    this.set('update', (value) => this.set('value', value));
    await render(hbs`{{one-way-select
      value=value
      options=options
      prompt="Select one"
      update=(action update)
    }}`);
    find('select').value = 'male';
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasValue('male', 'Select options is male');
    assert.equal(this.get('value'), 'male', 'Value us \'male\'');
  });

  test('Prompt is selected by default', async function(assert) {
    await render(hbs`{{one-way-select options=options prompt="Select one"}}`);

    assert.dom('option:checked').containsText('Select one', 'Prompt option is selected');
  });

  test('Prompt can be selectable', async function(assert) {
    await render(hbs`{{one-way-select value=value options=options prompt="Select one" promptIsSelectable=true}}`);

    assert.dom('option').isNotDisabled('The blank option is enabled');
  });

  test('optionValuePath', async function(assert) {
    let [male, female] = [{ id: 1, value: 'male' }, { id: 2, value: 'female' }];
    this.set('value', female);
    this.set('options', [male, female]);

    await render(hbs`{{one-way-select
      value=value options=options optionValuePath="id"}}`);

    let options = this.element.querySelectorAll('option');
    assert.dom(options[0]).hasText('1');
    assert.dom(options[1]).hasText('2');
    assert.dom('option:checked').hasValue('2');
  });

  test('optionLabelPath', async function(assert) {
    let [male, female] = [{ id: 1, value: 'male' }, { id: 2, value: 'female' }];
    this.set('value', female);
    this.set('options', [male, female]);

    await render(hbs`{{one-way-select
      value=value options=options optionValuePath="id" optionLabelPath="value"}}`);

    let options = this.element.querySelectorAll('option');
    assert.dom(options[0]).hasText('male');
    assert.dom(options[1]).hasText('female');
  });

  test('selected based on optionValuePath', async function(assert) {
    this.set('options', [{ id: 1, value: 'male' }, { id: 2, value: 'female' }]);
    this.set('value', { id: 2, value: 'female' });

    await render(hbs`{{one-way-select
      value=value options=options optionValuePath="id" optionLabelPath="value"}}`);

    assert.dom('option:checked').hasValue('2', 'Female is selected');
  });

  test('selecting with optionValuePath', async function(assert) {
    let [male, female] = [{ id: 1, value: 'male' }, { id: 2, value: 'female' }];
    this.set('value', female);
    this.set('options', [male, female]);

    await render(hbs`{{one-way-select
      value=value options=options optionValuePath="id" update=(action (mut value))}}`);

    await fillIn('select', '1');
    await triggerEvent('select', 'change');

    assert.equal(this.get('value'), male);
  });

  test('optionTargetPath', async function(assert) {
    let [male, female] = [{ id: 1, value: 'male' }, { id: 2, value: 'female' }];
    this.set('value', female.id);
    this.set('options', [male, female]);

    await render(hbs`{{one-way-select
      value=value options=options optionTargetPath="id" update=(action (mut value))}}`);

    let options = this.element.querySelectorAll('option');
    assert.dom(options[0]).hasText('1');
    assert.dom(options[1]).hasText('2');
    assert.dom('option:checked').hasValue('2', 'Selected option is 2');

    await fillIn('select', '1');
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasValue('1', 'Selected option is 1');
    assert.equal(this.get('value'), male.id);
  });

  test('guards against undefined options using optionValuePath', async function(assert) {
    assert.expect(0);
    this.set('options', [undefined]);
    await render(hbs`{{one-way-select
      value=value options=options optionValuePath="id" optionLabelPath="value"}}`);
  });

  test('groupLabelPath', async function(assert) {
    let [dubbel, tripel, ipa, saison] = [
      { id: 1, label: 'Dubbel', type: 'Trappist' },
      { id: 2, label: 'Tripel', type: 'Trappist' },
      { id: 3, label: 'IPA', type: 'IPA' },
      { id: 4, label: 'Saison', type: 'Saison' }
    ];
    this.set('value', saison);
    this.set('options', [dubbel, tripel, ipa, saison]);

    await render(hbs`{{one-way-select value=value options=options
        optionValuePath="id" optionLabelPath="label" groupLabelPath="type"}}`);

    assert.dom('optgroup').hasAttribute('label', 'Trappist', 'First optgroup label is Trappist');
    assert.dom('optgroup').exists({ count: 3 }, 'There should be three optgroups');
  });

  test('options is pre-grouped', async function(assert) {
    let groups = [
      {
        groupName: 'Trappist',
        options: [
          { id: 1, label: 'Dubbel', type: 'Trappist' },
          { id: 2, label: 'Tripel', type: 'Trappist' }
        ]
      }, {
        groupName: 'IPA',
        options: [{ id: 3, label: 'IPA', type: 'IPA' }]
      }, {
        groupName: 'Saison',
        options: [{ id: 4, label: 'Saison', type: 'Saison' }]
      }
    ];

    this.set('options', groups);

    await render(hbs`{{one-way-select value=value options=options
        optionValuePath="id" optionLabelPath="label"}}`);

    assert.dom('optgroup').hasAttribute('label', 'Trappist', 'First optgroup label is Trappist');
    assert.dom('optgroup').exists({ count: 3 }, 'There should be three optgroups');
  });

  test('multiple select', async function(assert) {
    let [dubbel, tripel, ipa, saison] = [
      { id: 1, label: 'Dubbel', type: 'Trappist' },
      { id: 2, label: 'Tripel', type: 'Trappist' },
      { id: 3, label: 'IPA', type: 'IPA' },
      { id: 4, label: 'Saison', type: 'Saison' }
    ];

    this.set('value', [saison, ipa]);
    this.set('options', [dubbel, tripel, ipa, saison]);

    await render(hbs`{{one-way-select value=value options=options multiple=true
        optionValuePath="id" optionLabelPath="label" groupLabelPath="type"}}`);

    assert.equal([...findAll('option')].filter((o) => o.selected)[0].value, 3, 'IPA should be selected');
    assert.equal([...findAll('option')].filter((o) => o.selected)[1].value, 4, 'Saison should be selected');
  });

  test('multiple select a value', async function(assert) {
    let [dubbel, tripel, ipa, saison] = [
      { id: 1, label: 'Dubbel', type: 'Trappist' },
      { id: 2, label: 'Tripel', type: 'Trappist' },
      { id: 3, label: 'IPA', type: 'IPA' },
      { id: 4, label: 'Saison', type: 'Saison' }
    ];

    this.set('update', (value) => this.set('value', value));
    this.set('value', [saison, ipa]);
    this.set('options', [dubbel, tripel, ipa, saison]);

    await render(hbs`{{one-way-select value=value options=options multiple=true
        update=(action update) optionValuePath="id" optionLabelPath="label"
        groupLabelPath="type"}}`);

    findAll('option')[0].selected = true;
    findAll('option')[2].selected = true;
    findAll('option')[3].selected = true;
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasValue('1', 'Dubbel is selected');
    assert.deepEqual(this.get('value'), [dubbel, ipa, saison], 'Dubbel, IPA and Saison are selected');
  });

  test('de-select all options in multiple select', async function(assert) {
    let [dubbel, tripel, ipa, saison] = [
      { id: 1, label: 'dubbel', type: 'trappist' },
      { id: 2, label: 'tripel', type: 'trappist' },
      { id: 3, label: 'ipa', type: 'ipa' },
      { id: 4, label: 'saison', type: 'saison' }
    ];

    this.set('update', (value) => this.set('value', value));
    this.set('value', [saison, ipa]);
    this.set('options', [dubbel, tripel, ipa, saison]);

    await render(hbs`{{one-way-select value=value options=options multiple=true
        update=(action update) optionValuePath="id" optionLabelPath="label"
        groupLabelPath="type"}}`);

    findAll('option')[0].selected = true;
    findAll('option')[2].selected = true;
    findAll('option')[3].selected = true;
    await triggerEvent('select', 'change');
    findAll('option')[0].selected = false;
    findAll('option')[2].selected = false;
    findAll('option')[3].selected = false;
    await triggerEvent('select', 'change');

    assert.equal(this.get('value').length, 0, 'selects an empty array');
  });

  test('It handles the old style of actions', async function(assert) {
    assert.expect(1);
    let fired = false;
    this.set('update', () => fired = true);
    await render(hbs`{{one-way-select value=value options=options update=update}}`);

    find('select').value = 'male';
    await triggerEvent('select', 'change');
    assert.equal(fired, true, 'The update action should have fired');
  });

  test('I can add a class attribute', async function(assert) {
    await render(hbs`{{one-way-select class="testing"}}`);

    assert.dom('select').hasClass('testing');
  });

  test('Handles block expression', async function(assert) {
    await render(hbs`{{#one-way-select options=options as |option index|}}{{option}}-{{index}}{{/one-way-select}}`);

    assert.dom('option').exists({ count: 3 }, 'Select has three options');
    let options = findAll('option');
    assert.dom(options[0]).hasText('unknown-0');
    assert.dom(options[1]).hasText('male-1');
    assert.dom(options[2]).hasText('female-2');
  });

  test('Handles block expression (option groups)', async function(assert) {
    let groups = [
      {
        groupName: 'group1',
        options: [ 'value1' ]
      }, {
        groupName: 'group2',
        options: [ 'value2', 'value3' ]
      }
    ];

    this.set('options', groups);

    await render(hbs`{{#one-way-select options=options as |option index groupIndex|}}{{option}}-{{groupIndex}}-{{index}}{{/one-way-select}}`);

    assert.dom('option').exists({ count: 3 }, 'Select has three options');
    let options = findAll('option');
    assert.dom(options[0]).hasText('value1-0-0');
    assert.dom(options[1]).hasText('value2-1-0');
    assert.dom(options[2]).hasText('value3-1-1');
  });

  test('I can pass a component that is rendered as option', async function(assert) {
    this.owner.register('component:option-component', Component.extend({
      layout: hbs`{{option}}-{{index}}`
    }));

    await render(hbs`{{one-way-select options=options optionComponent="option-component"}}`);

    assert.dom('option').exists({ count: 3 }, 'Select has three options');
    let options = findAll('option');
    assert.dom(options[0]).hasText('unknown-0');
    assert.dom(options[1]).hasText('male-1');
    assert.dom(options[2]).hasText('female-2');
  });

  test('I can pass a component that is rendered as option (option groups)', async function(assert) {
    this.owner.register('component:option-component', Component.extend({
      layout: hbs`{{option}}-{{groupIndex}}-{{index}}`
    }));

    let groups = [
      {
        groupName: 'group1',
        options: [ 'value1' ]
      }, {
        groupName: 'group2',
        options: [ 'value2', 'value3' ]
      }
    ];

    this.set('options', groups);

    await render(hbs`{{one-way-select options=options optionComponent="option-component"}}`);

    assert.dom('option').exists({ count: 3 }, 'Select has three options');
    let options = findAll('option');
    assert.dom(options[0]).hasText('value1-0-0');
    assert.dom(options[1]).hasText('value2-1-0');
    assert.dom(options[2]).hasText('value3-1-1');
  });

  test('Setting the selection to null/undefined from outside', async function(assert) {
    await render(hbs` {{one-way-select value options=options}} `);
    this.set('value', undefined);

    assert.dom('option:checked').hasValue('unknown', 'The first value is selected');
  });

  test('classNames is not passed as an html attribute', async function(assert) {
    await render(hbs`{{one-way-select classNames="testing"}}`);

    assert.dom('select').doesNotHaveAttribute('classnames');
  });

  test('allows to select blank without throwing', async function(assert) {
    let updates = [];

    this.set('update', (newValue) => updates.push(newValue));
    this.set('value', undefined);
    this.set('options', [
      { value: 'one', text: 'One' }
    ]);

    await render(hbs`{{one-way-select
      prompt='myDefaultPrompt' value=value promptIsSelectable=true options=options optionTargetPath='value' optionValuePath='value' optionLabelPath='text'
      update=(action update)}}`);

    find('select').value = 'one';
    await triggerEvent('select', 'change');

    find('select').value = '';
    await triggerEvent('select', 'change');

    assert.dom('option:checked').hasText('myDefaultPrompt');
    assert.deepEqual(updates, ['one', undefined]);
  });
});
