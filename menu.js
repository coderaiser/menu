var MenuProto, Util;

(function(scope) {
    'use strict';
    
    var Scope = scope.window ? window : global;
    
    if (typeof module === 'object' && module.exports)
        module.exports = new UtilProto();
    else if (!Scope.Util)
        Scope.Util = new UtilProto();
    
    function UtilProto() {
        var Util = this;
        
        /**
         * function do save exec of function
         * @param pCallBack
         * @param pArg1
         * ...
         * @param pArgN
         */
        this.exec                       = function(callback) {
            var ret,
                args    = Util.slice(arguments, 1);
           
            if (Util.isFunction(callback))
                ret     = callback.apply(null, args);
            
            return ret;
        };
        
        /**
         * functions check is pVarible is pType
         * @param pVarible
         * @param pType
         */    
        this.isType                 = function(pVarible, pType) {
            return typeof pVarible === pType;
        };
        
        /**
         * functions check is pVarible is function
         * @param pVarible
         */
        this.isFunction             = function(pVarible) {
            return Util.isType(pVarible, 'function');
        };
        
         /**
         * functions check is pVarible is object
         * @param pVarible
         */
        this.isObject               = function(pVarible) {
            return Util.isType(pVarible, 'object');
        };
        
        /**
         * function makes new array based on first
         * 
         * @param array
         */
        this.slice                  = function(array, count) {
            var ret;
            
            if (array)
                ret = [].slice.call(array, count);
            
            return ret;
        };
        
        /**
         * function render template with view
         * @templ
         * @view
         */
        this.render                  = function(templ, view) {
            var ret,
                NOT_ESCAPE  = true,
                SPACES      = '\\s*',
                symbols     = ['{{' + SPACES, SPACES + '}}'];
            
            ret = Util.ownRender(templ, view, symbols, NOT_ESCAPE);
                    
            return ret;
        };
        
        /**
         * function render template with view and own symbols
         * @templ
         * @view
         * @symbols
         */
        this.ownRender                  = function(templ, view, symbols, notEscape) {
            var str, param, expr,
                ret         = templ,
                firstChar,
                secondChar;
                
            firstChar   = symbols[0];
            secondChar  = symbols[1]  || firstChar;
            
            for (param in view) {
                str     = view[param];
                str     = Util.exec(str) || str;
                expr    = firstChar + param + secondChar;
                ret     = Util.replaceStr(ret, expr, str, notEscape);
            }
            
            expr        = firstChar + '.*' + secondChar;
            ret         = Util.replaceStr(ret, expr, '', notEscape);
            
            return ret;
        };
        
        /**
         * function replase pFrom to pTo in pStr
         * @pStr
         * @pFrom
         * @pTo
         * @pNotEscape
         */
        this.replaceStr             = function(pStr, pFrom, pTo, pNotEscape) {
            var lRet = pStr;
            
            if (pStr && pFrom) {
                if (!pNotEscape)
                    pFrom = Util.escapeRegExp(pFrom);
                
                lRet = pStr.replace(new RegExp(pFrom, 'g'), pTo);
            }
           
           return lRet;
        };
        
        this.escapeRegExp = function(pStr) {
            var lRet    = pStr,
                isStr   = Util.isString(pStr);
            
            if (isStr)
                lRet = pStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            
            return lRet;
        };
    }
})(this);


(function (window) {
    'use strict';
    
    MenuProto = function(element, menuData) {
        var ElementMenu,
            Element,
            ElementFuncs    = new ElementFuncsProto(),
            ElementEvent,
            MenuFuncs       = {},
            TEMPLATE        = {
                MAIN:   '<ul data-name="js-menu" class="menu menu-hidden">'                             +
                            '{{ items }}'                                                               +
                        '</ul>',
                ITEM:   '<li data-name="js-menu-item" class="menu-item{{ className }}"{{ attribute }}>'  +
                            '<label data-menu-path={{ path }}>{{ name }}</label>'                       +
                            '{{ subitems }}'                                                            +
                        '</li>'
            };
        
        if (menuData) {
            Element         =
            ElementEvent    = element;
        } else {
            Element         = document.body;
            ElementEvent    = window;
            menuData        = element;
        }
        
        function init() {
            var name, isObj = Util.isObject(menuData);
            
            if (!isObj) {
                name            = menuData;
                menuData        = {};
                menuData[name]  = null;
            }
            
            ElementMenu         = createMenu(menuData);
            
            ElementEvent.addEventListener('click', onClick);
            ElementEvent.addEventListener('contextmenu', onContextMenu);
        }
        
        function createMenu(menuData) {
            var elementMenu,
                menu        = '',
                items       = '',
                buildItems  = function(menuData, path) {
                    var name, isObj, data, subitems, className, attribute, pathName,
                        DATA_MENU   = 'data-menu="js-submenu"',
                        items       = '';
                    
                    if (path)
                        path        += '.';
                    else
                        path        = '';
                    
                    for (name in menuData) {
                        subitems    = '';
                        className   = '';
                        attribute   = '';
                        pathName    = path + name;
                        
                        data        = menuData[name];
                        isObj       = Util.isObject(data);
                        
                        if (!isObj) {
                            MenuFuncs[pathName] = data;
                        } else {
                            subitems    = Util.render(TEMPLATE.MAIN, {
                                items: buildItems(data, pathName)
                            });
                            
                            className   = ' menu-submenu';
                            attribute   = ' ' + DATA_MENU;
                        }
                        
                        items           += Util.render(TEMPLATE.ITEM, {
                            name        : name,
                            subitems    : subitems,
                            className   : className,
                            attribute   : attribute,
                            path        : pathName
                        });
                    }
                    
                    return items;
                };
            
            items = buildItems(menuData);
            
            menu = Util.render(TEMPLATE.MAIN, {
                items: items
            });
            
            Element.innerHTML   += menu;
            elementMenu         = Element.querySelector('[data-name="js-menu"]');
            
            return elementMenu;
        }
        
        this.show   = showMenuElement;
        this.hide   = hideMenuElement;
        
        function checkElement(target) {
            var is,
                element = ElementFuncs.getItem(target),
                isName  = ElementFuncs.isName(element),
                isItem  = ElementFuncs.isItem(element),
                isSub   = ElementFuncs.isSubMenu(element);
            
            if (!isName || !isItem) {
                element = document.elementFromPoint(event.x, event.y);
                isSub   = ElementFuncs.isSubMenu(element);
                isName  = ElementFuncs.isName(element);
                isItem  = ElementFuncs.isItem(element);
            }
            
            is = {
                name    : isName,
                item    : isItem,
                sub     : isSub,
            };
            
            return is;
        }
        
        function onClick(event, checkResult) {
            var itemData,
                element     = event.target,
                is          = checkResult || checkElement(element);
                
            if (is.sub) {
                event.preventDefault();
            } else if (is.name || is.item) {
                hideMenuElement();
                itemData = getMenuItemData(element);
                Util.exec(itemData);
            }
        }
        
        function onContextMenu(event) {
            var element = event.target,
                is      = checkElement(element),
                x       = event.x,
                y       = event.y;
            
            if (is.name || is.item || is.sub) {
                onClick(event, is);
            } else {
                ElementMenu.style.left     = x - 5 +'.px';
                ElementMenu.style.top      = y - 5 + '.px';
                
                showMenuElement();
            }
            
            event.preventDefault();
        }
        
        function showMenuElement() {
            ElementMenu.classList.remove('menu-hidden');
        }
        
        function hideMenuElement() {
            ElementMenu.classList.add('menu-hidden');
        }
        
        function getMenuItemData(element) {
            var path, data;
            
            element     = ElementFuncs.getName(element);
            
            if (element) {
                path    = element.getAttribute('data-menu-path');
            }
            
            data        = MenuFuncs[path];
            
            return data;
        }
        
        init();
    };
    
    function ElementFuncsProto() {
        this.getItem    = getItem;
        this.getName    = getName;
        this.isName     = isName;
        this.isItem     = isItem;
        this.isMenu     = isMenu;
        this.isSubMenu  = isSubMenu;
         
         function getItem(element) {
            var isNameElement;
            
            if (element) {
                isNameElement = isName(element);
                
                if (isNameElement)
                    element = element.parentElement;
            }
            
            return element;
        }
        
        function getName(element) {
            var is;
            
            if (element) {
                is = isName(element);
                
                if (!is)
                    element = element.querySelector('[data-menu-path]');
            }
            
            return element;
        }
        
        function isName(element) {
            var itIs;
            
            if (element)
                itIs = element.hasAttribute('data-menu-path');
            
            return itIs;
        }
        
        function isItem(element) {
            var itIs = checkElementsName(element, 'js-menu-item');
            
            return itIs;
        }
        
        function isMenu(element) {
            var itIs = checkElementsName(element, 'js-menu');
            
            return itIs;
        }
        
        function checkElementsName(element, nameElement, attribute) {
            var itIs, name;
            
            if (!attribute)
                attribute = 'data-name';
            
            if (element) {
                name = element.getAttribute(attribute);
                
                if (name === nameElement)
                    itIs = true;
            }
            
            return itIs;
        }
        
        function isSubMenu(element) {
            var itIs, item,
                attribute   = 'data-menu',
                value       = 'js-submenu';
            
            item    = getItem(element);
            itIs    = checkElementsName(item, value, attribute);
            
            return itIs;
        }
    }
    
    
})(window);
