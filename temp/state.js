(function () {
    var State = function () {

        var state = {};

        function setupProperty(property, elements) {
            if (!state[property]) {
                state[property] = {};
                state[property].bindings = [];
                state[property].changeHandlers = [];
            }

            if (elements instanceof Array && elements.length > 0) {
                set(property, elements[0].val());
            }
        }

        function callChangeHandlers(property, value, event) {
            state[property].changeHandlers.forEach(function (changeHandler) {
                changeHandler.handler({
                    value: value,
                    event: event
                });
            });
        }

        function addBinding(property, element, event) {
            var $element = $(element);
            state[property].bindings.push({
                event: event,
                element: $element
            });
            $element.on(event, function () {
                set(property, this.value, event);
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

        function set (property, value, event) {
            if (!state[property]) {
                return false;
            }
            state[property].value = value;
            state[property].bindings.forEach(function (binding) {
                binding.element.val(value);
            });
            callChangeHandlers(property, value, event);
        }

        function reset() {
            state = {};
        }

        function subscribe(property, eventHandler, value, events) {
            if (!state[property] || !(eventHandler instanceof Function)) {
                return;
            }

            state[property].changeHandlers.push({
                value: value,
                events: events,
                handler: eventHandler
            });
        }

        return {
            bind: bind,
            get: get,
            set: set,
            reset: reset,
            subscribe: subscribe
        };
    };
    dio.di.register("State", State);
}());
