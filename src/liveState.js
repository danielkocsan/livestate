(function () {
    var State = function () {
        var state = {};

        function createElement (pathElements) {
            return buildTree(pathElements, state);
        }

        function buildTree (elements, treeBrach) {
            var pathElements = elements.slice(0),
                elementName = pathElements.shift();

            if (!treeBrach[elementName]) {
                treeBrach[elementName] = {
                    attrs: {},
                    handlers: {},
                    children: {},
                    domElements: []
                };
            }

            if (pathElements.length > 0) {
                return buildTree(pathElements, treeBrach[elementName].children);
            }

            return treeBrach[elementName];
        }

        function extendTree (pathElements, extendObject) {
            var element = createElement(pathElements);

            element.value = extendObject.value;
            element.attrs = extendObject.attrs;
            if (extendObject.children) {
                Object.keys(extendObject.children).forEach(function (childrenName) {
                    var nextPathElements = pathElements.slice(0);
                    nextPathElements.push(childrenName);
                    extendTree(nextPathElements, extendObject.children[childrenName]);
                });
            }
        }

        function setElementValue(elementPath, value, domEvent) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.value = value;
            callHandlerFunction(element, elementPath, 'change', true, undefined, domEvent);
        }

        function getTreeElement (elements, treeBrach) {
            var pathElements = elements.slice(0),
                elementName = pathElements.shift();

            if (pathElements.length > 0) {
                return getTreeElement(pathElements, treeBrach[elementName].children);
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
            var element = getTreeElement(elementPath.split('.'), state);

            element.handlers[eventName] = handlerFunction;
        }

        function callHandlerFunction(element, elementPath, eventName, isValueChanged, changedAttributeName, domEvent) {
            var params;

            if (element.handlers[eventName]) {
                params = {
                    eventName: eventName,
                    elementPath: elementPath,
                    value: element.value,
                    attrs: element.attrs,
                    hasValueChange: isValueChanged,
                    hasAttributeChange: !isValueChanged,
                    changedAttributeName: changedAttributeName,
                    domEvent: domEvent
                };

                if (domEvent && domEvent.type) {
                    params.domEventName = domEvent.type;
                }

                element.handlers[eventName].call(this, params);
            }
        }

        function getChildrenArray (elementPath) {
            return Object.keys(state[elementPath].children);
        }

        function handleDomEvent (elementPath, domNode, event) {
            setElementValue(elementPath, domNode.value, event);
        }

        function bindDomEvent (elementPath, domNode, domEventName) {
            var handlerFunction = handleDomEvent.bind(this, elementPath, domNode);

            domNode.addEventListener(domEventName, handlerFunction, false);
        }

        function bindNodeElement (elementPath, domNode, events) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.domElements.push({
                element: domNode,
                events: events
            });

            events.forEach(bindDomEvent.bind(this, elementPath, domNode));
        }

        return {
            set: function (elementPath, value, attributeName) {
                createElement(elementPath.split('.'));

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
                createElement(elementPath.split('.'));
                addHandlerFunction(elementPath, eventName, handlerFunction);
            },
            reset: function () {
                emptyState();
            },
            bind: function (elementPath, nodeElement, domEvents) {
                createElement(elementPath.split('.'));
                bindNodeElement(elementPath, nodeElement, domEvents);
            },
            extend: function (path, extendObject) {
                extendTree(path.split('.'), extendObject);
            }
        };
    };
    di.register('State', State);
}());