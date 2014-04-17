(function () {
    var State = function () {
        var state = {};

        function createElement(elementPath) {
            if (!state[elementPath]) {
                state[elementPath] = {
                    attrs: {},
                    handlers: {}
                };
            }
        }

        function setElementValue(elementPath, value) {
            state[elementPath].value = value;
            callHandlerFunction(elementPath, 'change', true);
        }

        function getElementValue (elementPath) {
            var result;

            if (state[elementPath] && state[elementPath].value) {
                result = state[elementPath].value;
            }

            return result;
        }

        function setElementAttribute(elementPath, attributeName, attributeValue) {
            state[elementPath].attrs[attributeName] = attributeValue;
            callHandlerFunction(elementPath, 'change', false, attributeName);
        }

        function getElementAttribute(elementPath, attributeName) {
            var result;

            if (attributeName === '*') {
                result = state[elementPath].attrs;
            } else {
                result = state[elementPath].attrs[attributeName];
            }

            return result;
        }

        function emptyState () {
            state = {};
        }

        function addHandlerFunction(elementPath, eventName, handlerFunction) {
            state[elementPath].handlers[eventName] = handlerFunction;
        }

        function callHandlerFunction(elementPath, eventName, valueChanged, changeAttributeName) {
            if (state[elementPath].handlers[eventName]) {
                state[elementPath].handlers[eventName].call(
                    this,
                    eventName,
                    elementPath,
                    getElementValue(elementPath),
                    getElementAttribute(elementPath, '*'),
                    valueChanged,
                    changeAttributeName
                );
            }
        }

        return {
            set: function (elementPath, value, attributeName) {
                createElement(elementPath);

                if (attributeName) {
                    setElementAttribute(elementPath, attributeName, value);
                } else {
                    setElementValue(elementPath, value);
                }
            },
            get: function (elementPath, attributeName) {
                var result;

                if (attributeName) {
                    result = getElementAttribute(elementPath, attributeName);
                } else {
                    result = getElementValue(elementPath);
                }

                return result;
            },
            getDOM: function () {
            },
            subscribe: function (elementPath, eventName, handlerFunction) {
                createElement(elementPath);
                addHandlerFunction(elementPath, eventName, handlerFunction);
            },
            reset: function () {
                emptyState();
            },
            bind: function () {
            }
        };
    };
    di.register('State', State);
}());