(function () {
    var State = function () {
        var state = {};

        function createElement(pathElements) {
            return buildTree(pathElements, state);
        }

        function buildTree(elements, treeBrach) {
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

        function extendTree(pathElements, extendObject) {
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
            var element = getTreeElement(elementPath.split('.'), state),
                parents,
                data = {
                    elementPath: elementPath,
                    domEvent: domEvent,
                    eventName: 'change',
                    hasValueChange: true,
                    value: value,
                    hasAttributeChange: false,
                    attrs: element.attrs
                };

            element.value = value;
            callHandlerFunction(element, data);
            parents = getParents(elementPath.split('.'));
            filterChildrenChangeHandlers(parents).forEach(function (parent) {
                var data = {
                    elementPath: elementPath,
                    domEvent: domEvent,
                    eventName: 'childrenChange',
                    hasValueChange: true,
                    value: value,
                    hasAttributeChange: false,
                    attrs: element.attrs
                };
                callHandlerFunction(parent, data);
            });

            element.domElements.forEach(setDomNodeValue.bind(this, value));
        }

        function filterChildrenChangeHandlers(elements) {
            return elements.filter(function (element) {
                if (element.handlers.childrenChange) {
                    return element;
                }
            });
        }

        function getTreeElement(elements, treeBrach) {
            var pathElements = elements.slice(0),
                elementName = pathElements.shift();

            if (pathElements.length > 0) {
                return getTreeElement(pathElements, treeBrach[elementName].children);
            }

            return treeBrach[elementName];
        }

        function getElementValue(elementPath) {
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
            var data = {
                elementPath: elementPath,
                eventName: 'change',
                hasValueChange: false,
                hasAttributeChange: true,
                attrs: element.attrs,
                changedAttributeName: attributeName,
                changedAttributeValue: attributeValue
            };
            callHandlerFunction(element, data);
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

        function emptyState() {
            state = {};
        }

        function addHandlerFunction(elementPath, eventName, handlerFunction) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.handlers[eventName] = handlerFunction;
        }

        function callHandlerFunction(element, data) {
            if (element.handlers[data.eventName]) {

                if (data.domEvent && data.domEvent.type) {
                    data.domEventName = data.domEvent.type;
                }

                element.handlers[data.eventName].call(this, data);
            }
        }

        function getParents(pathElements) {
            var parentPathElements = pathElements.slice(0),
                element,
                parents,
                result = [];

            parentPathElements.pop();
            if (parentPathElements.length > 0) {
                element = getTreeElement(parentPathElements, state);
                parents = getParents(parentPathElements);

                result = [element];
                if (parents.length > 0) {
                    result = result.concat(parents);
                }
            }

            return result;
        }

        function getChildrenArray(elementPath) {
            return Object.keys(state[elementPath].children);
        }

        function syncDomNodeToElement(elementPath, domNode, event) {
            var domNodeValue = getDomNodeValue(domNode);

            setElementValue(elementPath, domNodeValue, event);
        }

        function setDomNodeValue(value, domNode) {
            if (domNode.nodeName === 'INPUT' || domNode.nodeName === 'SELECT' || domNode.nodeName === 'TEXTAREA') {
                domNode.value = value;
            } else {
                domNode.innerHTML = value;
            }
        }

        function getDomNodeValue(domNode) {
            var value;

            if (domNode.nodeName === 'INPUT' || domNode.nodeName === 'SELECT' || domNode.nodeName === 'TEXTAREA') {
                value = domNode.value;
            } else {
                value = domNode.innerHTML;
            }

            return value;
        }

        function bindDomEvent(elementPath, domNode, domEventName) {
            var handlerFunction = syncDomNodeToElement.bind(this, elementPath, domNode);

            domNode.addEventListener(domEventName, handlerFunction, false);
        }

        function bindNodeElement(elementPath, domNode, events) {
            var element = getTreeElement(elementPath.split('.'), state);

            element.domElements.push(domNode);

            syncDomNodeToElement(elementPath, domNode);

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
            getDOM: function (elementPath) {
                var element = getTreeElement(elementPath.split('.'), state);

                return element.domElements;
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