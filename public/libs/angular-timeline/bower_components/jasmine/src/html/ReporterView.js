jasmine.HtmlReporter.ReporterView = function(dom) {
  this.startedAt = new Date();
  this.runningSpecCount = 0;
  this.completeSpecCount = 0;
  this.passedCount = 0;
  this.failedCount = 0;
  this.skippedCount = 0;

  this.createResultsMenu = function() {
    this.resultsMenu = this.createDom('span', {className: 'resultsMenu bar'},
      this.summaryMenuItem = this.createDom('a', {className: 'summaryMenuItem', href: "#"}, '0 specs'),
      ' | ',
      this.detailsMenuItem = this.createDom('a', {className: 'detailsMenuItem', href: "#"}, '0 failing'));

    this.summaryMenuItem.onclick = function() {
      dom.reporter.className = dom.reporter.className.replace(/ showDetails/g, '');
    };

    this.detailsMenuItem.onclick = function() {
      showDetails();
    };
  };

  this.addSpecs = function(specs, specFilter) {
    this.totalSpecCount = specs.length;

    this.views = {
      specs: {},
      suites: {}
    };

    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      this.views.specs[spec.id] = new jasmine.HtmlReporter.SpecView(spec, dom, this.views);
      if (specFilter(spec)) {
        this.runningSpecCount++;
      }
    }
  };

  this.specComplete = function(spec) {
    this.completeSpecCount++;

    if (isUndefined(this.views.specs[spec.id])) {
      this.views.specs[spec.id] = new jasmine.HtmlReporter.SpecView(spec, dom);
    }

    var specView = this.views.specs[spec.id];

    switch (specView.status()) {
      case 'passed':
        this.passedCount++;
        break;

      case 'failed':
        this.failedCount++;
        break;

      case 'skipped':
        this.skippedCount++;
        break;
    }

    specView.refresh();
    this.refresh();
  };

  this.suiteComplete = function(suite) {
    var suiteView = this.views.suites[suite.id];
    if (isUndefined(suiteView)) {
      return;
    }
    suiteView.refresh();
  };

  this.refresh = function() {

    if (isUndefined(this.resultsMenu)) {
      this.createResultsMenu();
    }

    // currently running UI
    if (isUndefined(this.runningalert)) {
      this.runningalert = this.createDom('a', { href: jasmine.HtmlReporter.sectionLink(), className: "runningalert bar" });
      dom.alert.appendChild(this.runningalert);
    }
    this.runningalert.innerHTML = "Running " + this.completeSpecCount + " of " + specPluralizedFor(this.totalSpecCount);

    // skipped specs UI
    if (isUndefined(this.skippedalert)) {
      this.skippedalert = this.createDom('a', { href: jasmine.HtmlReporter.sectionLink(), className: "skippedalert bar" });
    }

    this.skippedalert.innerHTML = "Skipping " + this.skippedCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.skippedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.skippedalert);
    }

    // passing specs UI
    if (isUndefined(this.passedalert)) {
      this.passedalert = this.createDom('span', { href: jasmine.HtmlReporter.sectionLink(), className: "passingalert bar" });
    }
    this.passedalert.innerHTML = "Passing " + specPluralizedFor(this.passedCount);

    // failing specs UI
    if (isUndefined(this.failedalert)) {
      this.failedalert = this.createDom('span', {href: "?", className: "failingalert bar"});
    }
    this.failedalert.innerHTML = "Failing " + specPluralizedFor(this.failedCount);

    if (this.failedCount === 1 && isDefined(dom.alert)) {
      dom.alert.appendChild(this.failedalert);
      dom.alert.appendChild(this.resultsMenu);
    }

    // summary info
    this.summaryMenuItem.innerHTML = "" + specPluralizedFor(this.runningSpecCount);
    this.detailsMenuItem.innerHTML = "" + this.failedCount + " failing";
  };

  this.complete = function() {
    dom.alert.removeChild(this.runningalert);

    this.skippedalert.innerHTML = "Ran " + this.runningSpecCount + " of " + specPluralizedFor(this.totalSpecCount) + " - run all";

    if (this.failedCount === 0) {
      dom.alert.appendChild(this.createDom('span', {className: 'passingalert bar'}, "Passing " + specPluralizedFor(this.passedCount)));
    } else {
      showDetails();
    }

    dom.banner.appendChild(this.createDom('span', {className: 'duration'}, "finished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s"));
  };

  return this;

  function showDetails() {
    if (dom.reporter.className.search(/showDetails/) === -1) {
      dom.reporter.className += " showDetails";
    }
  }

  function isUndefined(obj) {
    return typeof obj === 'undefined';
  }

  function isDefined(obj) {
    return !isUndefined(obj);
  }

  function specPluralizedFor(count) {
    var str = count + " spec";
    if (count > 1) {
      str += "s"
    }
    return str;
  }

};

jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.ReporterView);


