(function () {
    var State = function () {
        var state = {};

        function createElement (elementPath) {
            buildTree(elementPath.split('.'), state);
        }

        function buildTree (elements, treeBrach) {
            var elementName = elements.shift();

            if (!treeBrach[elementName]) {
                treeBrach[elementName] = {
                    attrs: {},
                    handlers: {},
                    children: {}
                };
            }

            if (elements.length > 0) {
                buildTree(elements, treeBrach[elementName].children);
            }
        }

        function setElementValue(elementPath, value) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.value = value;
            callHandlerFunction(element, elementPath, 'change', true);
        }

        function getTreeElement (elements, treeBrach) {
            var elementName = elements.shift();

            if (elements.length > 0) {
                return getTreeElement(elements, treeBrach[elementName].children);
            }

            return treeBrach[elementName];
        }

        function getElementValue (elementPath) {
            var element = getTreeElement(elementPath.split('.'), state),
                result;

            if (element && element.value) {
                result = element.value;
            }

            return result;
        }

        function setElementAttribute(elementPath, attributeName, attributeValue) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.attrs[attributeName] = attributeValue;
            callHandlerFunction(element, elementPath, 'change', false, attributeName);
        }

        function getElementAttribute(elementPath, attributeName) {
            var result,
                element = getTreeElement(elementPath.split('.'), state);

            if (attributeName === '*') {
                result = element.attrs;
            } else {
                result = element.attrs[attributeName];
            }

            return result;
        }

        function emptyState () {
            state = {};
        }

        function addHandlerFunction(elementPath, eventName, handlerFunction) {
            state[elementPath].handlers[eventName] = handlerFunction;
        }

        function callHandlerFunction(element, elementPath, eventName, valueChanged, changeAttributeName) {
            if (element.handlers[eventName]) {
                element.handlers[eventName].call(
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

        function getChildrenArray (elementPath) {
            return Object.keys(state[elementPath].children);
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
            getChildren: function (elementPath) {
                return getChildrenArray(elementPath);
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