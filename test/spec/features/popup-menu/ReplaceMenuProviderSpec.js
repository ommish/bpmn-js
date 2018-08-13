import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceMenuProviderModule from 'lib/features/popup-menu';
import customRulesModule from '../../../util/custom-rules';

import {
  query as domQuery,
} from 'min-dom';

import {
  find,
  matchPattern
} from 'min-dash';

import { is } from 'lib/util/ModelUtil';

function queryEntry(popupMenu, id) {
  return queryPopup(popupMenu, '[data-id="' + id + '"]');
}

function queryPopup(popupMenu, selector) {
  return domQuery(selector, popupMenu._current.container);
}

/**
 * Gets all menu entries from the current open popup menu
 *
 * @param  {PopupMenu} popupMenu
 *
 * @return {<Array>}
 */
function getEntries(popupMenu) {
  var element = popupMenu._current.element;

  return popupMenu._current.provider.getEntries(element);
}

function triggerAction(entries, id) {
  var entry = find(entries, matchPattern({ id: id }));

  if (!entry) {
    throw new Error('entry "'+ id +'" not found in replace menu');
  }

  entry.action();
}


describe('features/popup-menu - replace menu provider', function() {

  var diagramXMLMarkers = require('../../../fixtures/bpmn/draw/activity-markers-simple.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    replaceMenuProviderModule,
    customRulesModule
  ];

  var openPopup = function(element, offset) {
    offset = offset || 100;

    getBpmnJS().invoke(function(popupMenu) {

      popupMenu.open(element, 'bpmn-replace', {
        x: element.x + offset, y: element.y + offset
      });

    });
  };


  describe('toggle', function() {

    beforeEach(bootstrapModeler(diagramXMLMarkers, { modules: testModules }));

    describe('active attribute', function() {

      it('should be true for parallel marker', inject(function(popupMenu, bpmnReplace, elementRegistry) {

        // given
        var task = elementRegistry.get('ParallelTask'),
            loopCharacteristics = task.businessObject.loopCharacteristics;

        // assume
        expect(loopCharacteristics.isSequential).to.be.false;
        expect(loopCharacteristics.isSequential).to.exist;

        // when
        openPopup(task);

        // then
        expect(is(loopCharacteristics, 'bpmn:MultiInstanceLoopCharacteristics')).to.be.true;

      }));

    });

  });


  describe('replace menu', function() {

    describe('default flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option [gateway]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        // then
        expect(getEntries(popupMenu)).to.have.length(1);
      }));


      it('should show Default replace option [task]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

        // when
        openPopup(sequenceFlow);

        // then
        expect(getEntries(popupMenu)).to.have.length(2);
      }));


      it('should NOT show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_4');

        // when
        openPopup(sequenceFlow);

        // then
        expect(getEntries(popupMenu)).to.have.length(0);
      }));

    });


    describe('default flows from inclusive gateways', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlowsFromInclusiveGateways.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).not.to.exist;
        expect(defaultFlowEntry).to.exist;
      }));


      it('should NOT show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.exist;
        expect(defaultFlowEntry).not.to.exist;
      }));

    });


    describe('default flows from complex gateways', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlowsFromComplexGateways.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).not.to.exist;
        expect(defaultFlowEntry).to.exist;
      }));


      it('should NOT show default replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        var sequenceFlowEntry = queryEntry(popupMenu, 'replace-with-sequence-flow'),
            defaultFlowEntry = queryEntry(popupMenu, 'replace-with-default-flow');

        // then
        expect(sequenceFlowEntry).to.exist;
        expect(defaultFlowEntry).not.to.exist;
      }));

    });


    describe('conditional flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should show ConditionalFlow replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var conditionalFlowEntry = queryEntry(popupMenu, 'replace-with-conditional-flow');

        // then
        expect(conditionalFlowEntry).to.exist;

        expect(getEntries(popupMenu)).to.have.length(2);
      }));


      it('should NOT show ConditionalFlow replace option', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1');

        // when
        openPopup(sequenceFlow);

        // then
        expect(getEntries(popupMenu)).to.have.length(0);
      }));

    });

  });


  describe('integration', function() {


    describe('default flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.defaultFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


      it('should replace SequenceFlow with DefaultFlow [gateway]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace SequenceFlow with DefaultFlow [task]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        var task = elementRegistry.get('Task_1ei94kl');

        // then
        expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should morph DefaultFlow into a SequenceFlow [task]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
            entries;

        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        // when
        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-sequence-flow');

        var task = elementRegistry.get('Task_1ei94kl');

        // then
        expect(task.businessObject.default).not.to.exist;
      }));


      it('should morph DefaultFlow into a SequenceFlow [task] -> undo',
        inject(function(elementRegistry, popupMenu, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
              entries;

          openPopup(sequenceFlow);

          entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          // when
          openPopup(sequenceFlow);

          entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-sequence-flow');

          commandStack.undo();

          var task = elementRegistry.get('Task_1ei94kl');

          // then
          expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should morph DefaultFlow into a ConditionalFlow [task]', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
            task = elementRegistry.get('Task_1ei94kl'),
            entries;

        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        // when
        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-conditional-flow');

        // then
        expect(task.businessObject.default).not.to.exist;
      }));


      it('should morph DefaultFlow into a ConditionalFlow [task] -> undo',
        inject(function(elementRegistry, popupMenu, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
              task = elementRegistry.get('Task_1ei94kl'),
              entries;

          openPopup(sequenceFlow);

          entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          // when
          openPopup(sequenceFlow);

          entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-conditional-flow');

          commandStack.undo();

          // then
          expect(task.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should replace SequenceFlow with DefaultFlow [gateway] -> undo',
        inject(function(elementRegistry, popupMenu, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              gateway = elementRegistry.get('ExclusiveGateway_1');

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          commandStack.undo();

          // then
          expect(gateway.businessObject.default).not.to.exist;
        })
      );


      it('should replace SequenceFlow with DefaultFlow [task] -> undo',
        inject(function(elementRegistry, popupMenu, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn');

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          commandStack.undo();

          var task = elementRegistry.get('Task_1ei94kl');

          // then
          expect(task.businessObject.default).not.to.exist;
        })
      );


      it('should only have one DefaultFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
            sequenceFlow3 = elementRegistry.get('SequenceFlow_3');

        var entries;

        // when
        // trigger morphing sequenceFlow3 to default flow
        openPopup(sequenceFlow3);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        // trigger morphing sequenceFlow to default flow
        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        var gateway = elementRegistry.get('ExclusiveGateway_1');

        // then
        expect(gateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should replace DefaultFlow with SequenceFlow when changing source',
        inject(function(elementRegistry, popupMenu, modeling) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_2');

          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          // when
          modeling.reconnectStart(sequenceFlow, task, [
            { x: 686, y: 267, original: { x: 686, y: 307 } },
            { x: 686, y: 207, original: { x: 686, y: 187 } }
          ]);

          var gateway = elementRegistry.get('ExclusiveGateway_1');

          // then
          expect(gateway.businessObject.default).not.to.exist;
        })
      );


      it('should replace DefaultFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, popupMenu, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_1'),
              task = elementRegistry.get('Task_2');

          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          // when
          modeling.reconnectStart(sequenceFlow, task, [
            { x: 686, y: 267, original: { x: 686, y: 307 } },
            { x: 686, y: 207, original: { x: 686, y: 187 } }
          ]);

          commandStack.undo();

          var gateway = elementRegistry.get('ExclusiveGateway_1');

          // then
          expect(gateway.businessObject.default).equal(sequenceFlow.businessObject);
        })
      );

      it('should keep DefaultFlow when morphing Gateway', inject(function(elementRegistry, popupMenu, bpmnReplace) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
            exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-default-flow');

        var inclusiveGateway = bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway' });

        // then
        expect(inclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should keep DefaultFlow when morphing Task', inject(function(elementRegistry, bpmnReplace, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_15f5knn'),
            task = elementRegistry.get('Task_1ei94kl');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger DefaultFlow replacement
        var replaceDefaultFlow = find(entries, matchPattern({ id: 'replace-with-default-flow' }));

        replaceDefaultFlow.action();

        var sendTask = bpmnReplace.replaceElement(task, { type: 'bpmn:SendTask' });

        // then
        expect(sendTask.businessObject.default).to.equal(sequenceFlow.businessObject);
      }));


      it('should keep DefaultFlow when morphing Gateway -> undo',
        inject(function(elementRegistry, bpmnReplace, popupMenu, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-default-flow');

          bpmnReplace.replaceElement(exclusiveGateway, { type: 'bpmn:InclusiveGateway' });

          commandStack.undo();

          // then
          expect(exclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
        })
      );


      it('should remove any conditionExpression when morphing to DefaultFlow',
        inject(function(elementRegistry, modeling, popupMenu, moddle) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          var conditionExpression = moddle.create('bpmn:FormalExpression', {
            body: ''
          });

          modeling.updateProperties(sequenceFlow, {
            conditionExpression: conditionExpression
          });

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          // trigger DefaultFlow replacement
          triggerAction(entries, 'replace-with-default-flow');

          // then
          expect(exclusiveGateway.businessObject.default).to.equal(sequenceFlow.businessObject);
          expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
        })
      );


      it('should remove any conditionExpression when morphing to DefaultFlow -> undo',
        inject(function(elementRegistry, modeling, popupMenu, moddle, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              exclusiveGateway = elementRegistry.get('ExclusiveGateway_1');

          var conditionExpression = moddle.create('bpmn:FormalExpression', { body: '' });

          modeling.updateProperties(sequenceFlow, { conditionExpression: conditionExpression });

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          // trigger DefaultFlow replacement
          entries[0].action();

          commandStack.undo();

          // then
          expect(exclusiveGateway.businessObject.default).not.to.exist;
          expect(sequenceFlow.businessObject.conditionExpression).to.equal(conditionExpression);
        })
      );

    });


    describe('conditional flows', function() {

      var diagramXML = require('./ReplaceMenuProvider.conditionalFlows.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules
      }));


      it('should morph into a ConditionalFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        triggerAction(entries, 'replace-with-conditional-flow');

        // then
        expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
      }));


      it('should morph into a ConditionalFlow -> undo', inject(
        function(elementRegistry, popupMenu, commandStack) {
          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_2');

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-conditional-flow');

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
        }
      ));


      it('should morph back into a SequenceFlow', inject(function(elementRegistry, popupMenu) {
        // given
        var sequenceFlow = elementRegistry.get('SequenceFlow_2');

        // when
        openPopup(sequenceFlow);

        var entries = getEntries(popupMenu);

        // trigger ConditionalFlow replacement
        triggerAction(entries, 'replace-with-conditional-flow');

        openPopup(sequenceFlow);

        entries = getEntries(popupMenu);

        // replace with SequenceFlow
        triggerAction(entries, 'replace-with-sequence-flow');

        // then
        expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
      }));

      it('should replace ConditionalFlow with SequenceFlow when changing source -> undo',
        inject(function(elementRegistry, popupMenu, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              startEvent = elementRegistry.get('StartEvent_1');

          // when
          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          triggerAction(entries, 'replace-with-conditional-flow');

          // when
          modeling.reconnectStart(sequenceFlow, startEvent, [
            { x: 196, y: 197, original: { x: 178, y: 197 } },
            { x: 497, y: 278, original: { x: 547, y: 278 } }
          ]);

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
        })
      );


      [
        'bpmn:StartEvent'
      ].forEach(function(type) {

        it('should replace ConditionalFlow with SequenceFlow when changing target to ' + type,
          inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling) {

            // given
            var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
                root = canvas.getRootElement(),
                intermediateEvent = elementFactory.createShape({ type: type });

            modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

            openPopup(sequenceFlow);

            var entries = getEntries(popupMenu);

            triggerAction(entries, 'replace-with-conditional-flow');

            // when
            modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
              { x: 389, y: 197, original: { x: 389, y: 197 } },
              { x: 497, y: 197, original: { x: 497, y: 197 } }
            ]);

            // then
            expect(sequenceFlow.businessObject.conditionExpression).not.to.exist;
          })
        );

      });


      [
        'bpmn:Activity',
        'bpmn:EndEvent',
        'bpmn:IntermediateThrowEvent'
      ].forEach(function(type) {

        it('should keep ConditionalFlow when changing target to ' + type,
          inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling) {

            // given
            var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
                root = canvas.getRootElement(),
                intermediateEvent = elementFactory.createShape({ type: type });

            modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

            openPopup(sequenceFlow);

            var entries = getEntries(popupMenu);

            triggerAction(entries, 'replace-with-conditional-flow');

            // when
            modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
              { x: 389, y: 197, original: { x: 389, y: 197 } },
              { x: 497, y: 197, original: { x: 497, y: 197 } }
            ]);

            // then
            expect(sequenceFlow.businessObject.conditionExpression).to.exist;
          })
        );

      });


      it('should replace ConditionalFlow with SequenceFlow when changing target -> undo',
        inject(function(elementRegistry, elementFactory, canvas, popupMenu, modeling, commandStack) {

          // given
          var sequenceFlow = elementRegistry.get('SequenceFlow_3'),
              root = canvas.getRootElement(),
              intermediateEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' });

          modeling.createShape(intermediateEvent, { x: 497, y: 197 }, root);

          openPopup(sequenceFlow);

          var entries = getEntries(popupMenu);

          // trigger ConditionalFlow replacement
          triggerAction(entries, 'replace-with-conditional-flow');

          // when
          modeling.reconnectEnd(sequenceFlow, intermediateEvent, [
            { x: 389, y: 197, original: { x: 389, y: 197 } },
            { x: 497, y: 197, original: { x: 497, y: 197 } }
          ]);

          commandStack.undo();

          // then
          expect(sequenceFlow.businessObject.conditionExpression.$type).to.equal('bpmn:FormalExpression');
        })
      );

    });

  });
});
