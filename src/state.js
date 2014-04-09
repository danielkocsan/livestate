/*global $*/
var state = (function () {
    'use strict';

    var set,
        state = {};

    function setupProperty(property, elements) {
        if (!state[property]) {
            state[property] = {};
            state[property].bindings = [];
            state[property].changeHandlers = {};
        }

        if (elements instanceof Array && elements.length > 0) {
            set(property, elements[0].val());
        }
    }

    function callChangeHandlers(property, value) {
        if (state[property].changeHandlers[null] instanceof Array) {
            state[property].changeHandlers[null].forEach(function (changeHandler) {
                changeHandler(value);
            });
        }
        if (state[property].changeHandlers[value] instanceof Array) {
            state[property].changeHandlers[value].forEach(function (changeHandler) {
                changeHandler(value);
            });
        }
    }

    function addBinding(property, element, event) {
        var $element = $(element);
        state[property].bindings.push({
            event: event,
            element: $element
        });
        $element.on(event, function () {
            set(property, this.value);
        });
    }

    function bind(property, elements, domEvents) {
        var events = domEvents || ['change'],
            i,
            j,
            ilength,
            jlength;

        if (events.indexOf(['keyup']) === -1) {
            events.push('keyup');
        }

        setupProperty(property, elements);
        if (events instanceof Array && elements.length) {
            for (i = 0, ilength = elements.length; i < ilength; i += 1) {
                for (j = 0, jlength = events.length; j < jlength; j += 1) {
                    addBinding(property, elements[i], events[j]);
                }
            }
        }
    }

    function get(property) {
        if (!state[property]) {
            return undefined;
        }

        return state[property].value;
    }

    set = function (property, value) {
        if (!state[property]) {
            return false;
        }
        state[property].value = value;
        state[property].bindings.forEach(function (binding) {
            binding.element.val(value);
        });
        callChangeHandlers(property, value);
    };

    function reset() {
        state = {};
    }

    function subscribe(property, eventHandler, val) {
        var value = val;
        if (!state[property] || !(eventHandler instanceof Function)) {
            return;
        }
        if (!value) {
            value = null;
        }

        if (!(state[property].changeHandlers[value] instanceof Array)) {
            state[property].changeHandlers[value] = [];
        }

        state[property].changeHandlers[value].push(eventHandler);
    }

    return {
        bind: bind,
        get: get,
        set: set,
        reset: reset,
        subscribe: subscribe
    };
}());