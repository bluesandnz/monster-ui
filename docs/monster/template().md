# [monster][monster].template()

* [Syntax](#syntax)
* [Parameters](#parameters)
* [Description](#description)
* [Examples](#examples)

### Syntax
```javascript
monster.template(context, name[, data, raw, ignoreCache, ignoreSpaces]);
```

### Parameters
* `context` (mandatory)

 Type: [Object][object_literal]

 _description_

* `name` (mandatory)

 Type: [String][string_literal]

 _description_

* `data` (optional)

 Type: [Object][object_literal]

 Default: ``

 _description_

* `raw` (optional)

 Type: [Boolean][boolean_literal]

 Default: `false`

 _description_

* `ignoreCache` (optional)

 Type: [Boolean][boolean_literal]

 Default: `false`

 _description_

* `ignoreSpaces` (optional)

 Type: [Boolean][boolean_literal]

 Default: `false`

 carriage return, linefeed, tab, whitespace

### Description


### Examples
* Load template with no data into the DOM
```javascript
var app = {
    render: function(parent) {
        var self = this,
            template = $(monster.template(self, 'app'));

        parent
            .empty()
            .append(template);
    }
};
```
* Load template with data into the DOM
```javascript
var app = {
    render: function(parent) {
        var self = this;

        self.getUserData(self.userId, function(userData) {
            var dataTemplate = {
                    userId: self.userId,
                    userData: userData
                },
                template = $(monster.template(self, 'app', dataTemplate));

            parent
                .empty()
                .append(template);
        });
    }
};
```

[monster]: ../../monster.md

[object_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Object_literals
[string_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#String_literals
[boolean_literal]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Values,_variables,_and_literals#Boolean_literals