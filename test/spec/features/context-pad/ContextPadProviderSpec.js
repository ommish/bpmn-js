import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
} from 'min-dom';

import contextPadModule from 'lib/features/context-pad';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceMenuModule from 'lib/features/popup-menu';
import createModule from 'diagram-js/lib/features/create';
import customRulesModule from '../../../util/custom-rules';
import autoPlaceModule from 'lib/features/auto-place';


describe('features - context-pad', function() {

  var testModules = [
    coreModule,
    modelingModule,
    contextPadModule,
    replaceMenuModule,
    customRulesModule,
    createModule
  ];


  describe('remove action rules', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    var deleteAction;

    beforeEach(inject(function(contextPad) {

      deleteAction = function(element) {
        return padEntry(contextPad.getPad(element).html, 'delete');
      };
    }));


    it('should add delete action by default', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should include delete action when rule returns true',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return true;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when rule returns false',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return false;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).not.to.exist;
      })
    );


    it('should call rules with [ element ]', inject(function(elementRegistry, contextPad, customRules) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      customRules.addRule('elements.delete', 1500, function(context) {

        // element array is actually passed
        expect(context.elements).to.eql([ element ]);

        return true;
      });

      // then
      expect(function() {
        contextPad.open(element);
      }).not.to.throw;
    }));


    it('should include delete action when [ element ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function(context) {
          return context.elements;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when [ ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return [];
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).not.to.exist;
      })
    );

  });


  describe('available entries', function() {

    var diagramXML = require('./ContextPad.activation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    function expectContextPadEntries(elementOrId, expectedEntries) {

      getBpmnJS().invoke(function(elementRegistry, contextPad) {

        var element = typeof elementOrId === 'string' ? elementRegistry.get(elementOrId) : elementOrId;

        contextPad.open(element, true);

        var entries = contextPad._current.entries;

        expectedEntries.forEach(function(name) {

          if (name.charAt(0) === '!') {
            name = name.substring(1);

            expect(entries).not.to.have.property(name);
          } else {
            expect(entries).to.have.property(name);
          }
        });
      });
    }


    it('should provide Task entries', inject(function() {

      expectContextPadEntries('Task_1', [
        'connect',
        'replace',
        'append.end-event',
        'append.gateway',
        'append.append-task',
        'append.intermediate-event',
        'append.text-annotation'
      ]);
    }));

    it('should provide Compensation Activity entries', inject(function() {

      expectContextPadEntries('Task_2', [
        'connect',
        'replace',
        '!append.end-event',
        'append.text-annotation'
      ]);
    }));
  });


  describe('create', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

  });


  describe('replace', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should show popup menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1'),
          padding = 5,
          padMenuRect,
          replaceMenuRect;

      contextPad.open(element);

      // when
      contextPad.trigger('click', padEvent('replace'));

      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();
      replaceMenuRect = domQuery('.bpmn-replace', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));

  });


  describe('auto place', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat(autoPlaceModule)
    }));


    it('should trigger', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('Task_1');

      contextPad.open(element);

      // mock event
      var event = padEvent('append.gateway');

      // when
      contextPad.trigger('click', event);

      // then
      expect(element.outgoing).to.have.length(1);
    }));

  });


  describe('disabled auto-place', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat(autoPlaceModule),
      contextPad: {
        autoPlace: false
      }
    }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should default to drag start', inject(function(elementRegistry, contextPad, dragging) {

      // given
      var element = elementRegistry.get('Task_1');

      contextPad.open(element);

      // mock event
      var event = {
        clientX: 100,
        clientY: 100,
        target: padEntry(container, 'append.gateway'),
        preventDefault: function() {}
      };

      // when
      contextPad.trigger('click', event);

      // then
      expect(dragging.context()).to.exist;
    }));

  });

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}


function padEvent(entry) {

  return getBpmnJS().invoke(function(overlays) {

    var target = padEntry(overlays._overlayRoot, entry);

    return {
      target: target,
      preventDefault: function() {},
      clientX: 100,
      clientY: 100
    };
  });
}