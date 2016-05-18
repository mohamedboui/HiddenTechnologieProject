
## bootstrap-bower-accordion

This is the bower repository for the accordion component of of the [angular-ui/bootstrap project](https://github.com/angular-ui/bootstrap) project.

### Usage

Include the js file into your HTML with a `<script>` tag or your preferred tool.

Use `ui-accordion-tpls.js` to use the default html templates (recommended). Alternatively, Use `ui-accordion.js` if you wish to create your own html templates.

Then, be sure to include the module as a dependency for your app:
```js
angular.module('myApp', ['ui.bootstrap.accordion']
```



And if you are using `ui-accordion-tpls.js`, be sure to additionally include the bundled html templates as dependencies:
```js
angular.module('myApp', [
  'ui.bootstrap.accordion',
  'template/accordion/accordion-group.html',
  'template/accordion/accordion.html'
])
```

