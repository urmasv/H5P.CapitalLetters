var H5P = H5P || {};

(function (H5P, $) {
  'use strict';

  var defaults = {
    taskDescription: 'Click the letters that should be uppercase.',
    correctText: 'Hello, world! My name is Mary. Estonia\'s capital is Tallinn.',
    behaviour: {
      showRetry: true,
      penalizeWrongAnswers: true
    },
    l10n: {
      checkButton: 'Check',
      retryButton: 'Try again',
      solutionPrefix: 'Correct answer:',
      correctFeedback: 'Everything is correct!',
      noAnswerFeedback: 'Click at least one letter.',
      scoreText: 'Score: @score / @max',
      correctText: 'Correct: @count',
      wrongText: 'Wrong: @count',
      missingText: 'Missing: @count',
      letterAriaLabel: 'Letter @letter at position @position',
      selectedAriaLabel: 'Selected letter @letter at position @position'
    }
  };

  var merge = function (target, source) {
    target = target || {};
    source = source || {};

    Object.keys(source).forEach(function (key) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        target[key] = merge(target[key] || {}, source[key]);
      }
      else if (source[key] !== undefined && source[key] !== null) {
        target[key] = source[key];
      }
    });

    return target;
  };

  var escapeHtml = function (text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  var replacePlaceholders = function (template, values) {
    var result = template || '';
    Object.keys(values || {}).forEach(function (key) {
      result = result.split('@' + key).join(values[key]);
    });
    return result;
  };

  var splitTemplateAroundCount = function (template) {
    var source = template || '';
    var index = source.indexOf('@count');

    if (index === -1) {
      return {
        before: source,
        after: ''
      };
    }

    return {
      before: source.slice(0, index),
      after: source.slice(index + 6)
    };
  };

  var createFeedbackDetailHtml = function (template, count, stateClass) {
    var parts = splitTemplateAroundCount(template);
    var label = ((parts.before || '') + (parts.after || '')).trim();

    return '<span class="h5p-capital-letters-result-detail-item">' +
      (label ? '<span>' + escapeHtml(label) + '</span>' : '') +
      '<span class="h5p-capital-letters-feedback-count ' + escapeHtml(stateClass || '') + '">' +
      escapeHtml(String(count)) +
      '</span>' +
      '</span>';
  };


  var normalizeAnswer = function (text) {
    return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  };

  var extendObject = function (target, source) {
    var key;

    target = target || {};
    source = source || {};

    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }

    return target;
  };

  var stripTags = function (text) {
    return String(text || '').replace(/<[^>]+>/g, '');
  };

  var isLetter = function (character) {
    return character.toLocaleLowerCase() !== character.toLocaleUpperCase();
  };

  var isUppercaseLetter = function (character) {
    return isLetter(character) && character === character.toLocaleUpperCase() && character !== character.toLocaleLowerCase();
  };

  var getLowercase = function (character) {
    return character.toLocaleLowerCase();
  };

  var getUppercase = function (character) {
    return character.toLocaleUpperCase();
  };

  H5P.CapitalLetters = function (params, contentId, extras) {
    H5P.EventDispatcher.call(this);

    this.params = merge(merge({}, defaults), params || {});
    this.contentId = contentId;
    this.extras = extras || {};

    this.originalText = String(this.params.correctText || defaults.correctText);
    this.characters = Array.from(this.originalText);
    this.solutionIndexes = [];
    this.selectedIndexes = [];
    this.answerGiven = false;
    this.checked = false;
    this.showingSolution = false;
    this.score = 0;
    this.maxScore = 0;
    this.lastStats = null;
    this.lastResult = null;
    this.$container = null;
    this.$letters = null;
    this.$feedback = null;
    this.$solutionArea = null;
    this.$checkButton = null;
    this.$retryButton = null;

    this.prepareSolution();
  };

  H5P.CapitalLetters.prototype = Object.create(H5P.EventDispatcher.prototype);
  H5P.CapitalLetters.prototype.constructor = H5P.CapitalLetters;

  H5P.CapitalLetters.prototype.prepareSolution = function () {
    var self = this;

    self.solutionIndexes = [];
    self.characters.forEach(function (character, index) {
      if (isUppercaseLetter(character)) {
        self.solutionIndexes.push(index);
      }
    });

    self.maxScore = self.solutionIndexes.length;
  };

  H5P.CapitalLetters.prototype.attach = function ($container) {
    var self = this;
    self.$container = $container;
    self.$container.addClass('h5p-capital-letters').html('');

    var $task = $('<div>', {
      'class': 'h5p-capital-letters-task'
    }).text(self.params.taskDescription || defaults.taskDescription);

    self.$letters = $('<div>', {
      'class': 'h5p-capital-letters-text',
      'role': 'group',
      'aria-label': self.params.taskDescription || defaults.taskDescription
    });

    self.$solutionArea = $('<div>', {
      'class': 'h5p-capital-letters-solution',
      'aria-live': 'polite'
    }).attr('hidden', true);

    if (self.$letters[0]) {
      self.$letters[0].addEventListener('click', function (event) {
        if (!self.checked) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }, true);

      self.$letters[0].addEventListener('keydown', function (event) {
        if (!self.checked) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }, true);

      self.$letters[0].addEventListener('selectstart', function (event) {
        if (!self.checked) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }, true);

      self.$letters[0].addEventListener('dragstart', function (event) {
        if (!self.checked) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }, true);

      self.$letters[0].addEventListener('mousedown', function (event) {
        if (!self.checked) {
          return;
        }
        event.preventDefault();
      }, true);
    }

    self.renderCharacters();

    self.$checkButton = $('<button>', {
      'class': 'h5p-capital-letters-control h5p-capital-letters-check',
      'type': 'button'
    }).text(self.params.l10n.checkButton || defaults.l10n.checkButton)
      .on('click', function () {
        self.checkAnswer();
      });

    self.$retryButton = $('<button>', {
      'class': 'h5p-capital-letters-control h5p-capital-letters-retry',
      'type': 'button'
    }).text(self.params.l10n.retryButton || defaults.l10n.retryButton)
      .on('click', function () {
        self.resetTask();
      })
      .hide();

    var $buttonBar = $('<div>', {
      'class': 'h5p-capital-letters-controls'
    }).append(self.$checkButton, self.$retryButton);

    self.$feedback = $('<div>', {
      'class': 'h5p-capital-letters-feedback',
      'aria-live': 'polite'
    });

    self.$container.append($task, self.$letters, $buttonBar, self.$feedback);
    self.updateControls();
    self.trigger('resize');
  };

  H5P.CapitalLetters.prototype.renderCharacters = function () {
    var self = this;
    self.$letters.html('');

    self.characters.forEach(function (character, index) {
      var displayCharacter = getLowercase(character);

      if (character === '\n') {
        self.$letters.append(document.createElement('br'));
        return;
      }

      if (!isLetter(character)) {
        self.$letters.append($('<span>', {
          'class': 'h5p-capital-letters-char h5p-capital-letters-static'
        }).html(escapeHtml(displayCharacter)));
        return;
      }

      var $letter = $('<button>', {
        'class': 'h5p-capital-letters-char h5p-capital-letters-letter',
        'type': 'button',
        'data-index': index,
        'aria-pressed': 'false',
        'aria-label': replacePlaceholders(self.params.l10n.letterAriaLabel || defaults.l10n.letterAriaLabel, {
          letter: displayCharacter,
          position: index + 1
        })
      }).html(escapeHtml(displayCharacter));

      $letter.on('click', function (event) {
        if (self.checked) {
          event.preventDefault();
          return;
        }
        self.toggleLetter($(this));
      });

      self.$letters.append($letter);
    });

    if (self.$solutionArea) {
      self.$letters.append(self.$solutionArea);
      self.renderSolutionArea();
    }
  };

  H5P.CapitalLetters.prototype.renderSolutionArea = function () {
    if (!this.$solutionArea) {
      return;
    }

    this.$solutionArea.empty();

    var $prefix = $('<strong>').text((this.params.l10n.solutionPrefix || defaults.l10n.solutionPrefix) + ' ');
    this.$solutionArea.append($prefix, document.createTextNode(this.originalText));
    this.$solutionArea.attr('hidden', !(this.checked && this.showingSolution));
  };

  H5P.CapitalLetters.prototype.toggleLetter = function ($letter) {
    if (this.checked || this.showingSolution || $letter.prop('disabled')) {
      return;
    }

    var index = parseInt($letter.attr('data-index'), 10);
    var selectedIndex = this.selectedIndexes.indexOf(index);
    var lowercaseCharacter = getLowercase(this.characters[index]);
    var uppercaseCharacter = getUppercase(this.characters[index]);

    if (selectedIndex === -1) {
      this.selectedIndexes.push(index);
      $letter.addClass('h5p-capital-letters-selected')
        .html(escapeHtml(uppercaseCharacter))
        .attr('aria-pressed', 'true')
        .attr('aria-label', replacePlaceholders(this.params.l10n.selectedAriaLabel || defaults.l10n.selectedAriaLabel, {
          letter: uppercaseCharacter,
          position: index + 1
        }));
    }
    else {
      this.selectedIndexes.splice(selectedIndex, 1);
      $letter.removeClass('h5p-capital-letters-selected')
        .html(escapeHtml(lowercaseCharacter))
        .attr('aria-pressed', 'false')
        .attr('aria-label', replacePlaceholders(this.params.l10n.letterAriaLabel || defaults.l10n.letterAriaLabel, {
          letter: lowercaseCharacter,
          position: index + 1
        }));
    }

    if (this.$feedback && !this.checked) {
      this.$feedback
        .removeClass('h5p-capital-letters-feedback-success h5p-capital-letters-feedback-failure')
        .html('');
    }

    this.updateControls();
  };

  H5P.CapitalLetters.prototype.getStats = function () {
    var solutionSet = new Set(this.solutionIndexes);
    var selectedSet = new Set(this.selectedIndexes);
    var correct = 0;
    var wrong = 0;
    var missing = 0;

    this.selectedIndexes.forEach(function (index) {
      if (solutionSet.has(index)) {
        correct++;
      }
      else {
        wrong++;
      }
    });

    this.solutionIndexes.forEach(function (index) {
      if (!selectedSet.has(index)) {
        missing++;
      }
    });

    return {
      correct: correct,
      wrong: wrong,
      missing: missing
    };
  };

  H5P.CapitalLetters.prototype.calculateScore = function () {
    var stats = this.getStats();
    var score = stats.correct;

    if (this.params.behaviour.penalizeWrongAnswers) {
      score -= stats.wrong;
    }

    return Math.max(0, Math.min(score, this.getMaxScore()));
  };

  H5P.CapitalLetters.prototype.setResponseAreaLocked = function (locked) {
    if (!this.$letters) {
      return;
    }

    locked = !!locked;

    this.$letters
      .toggleClass('is-locked', locked)
      .attr('aria-disabled', locked ? 'true' : 'false')
      .attr('unselectable', locked ? 'on' : null);

    this.$letters.find('.h5p-capital-letters-letter').each(function () {
      var $letter = $(this);

      $letter
        .prop('disabled', locked)
        .attr('aria-disabled', locked ? 'true' : 'false');

      if (locked) {
        $letter.attr('tabindex', '-1');
      }
      else {
        $letter.removeAttr('tabindex');
      }
    });
  };

  H5P.CapitalLetters.prototype.applyResultClasses = function () {
    var self = this;

    self.$letters.find('.h5p-capital-letters-letter').each(function () {
      var $letter = $(this);
      var index = parseInt($letter.attr('data-index'), 10);
      var isSolution = self.solutionIndexes.indexOf(index) !== -1;
      var isSelected = self.selectedIndexes.indexOf(index) !== -1;
      var displayCharacter = isSelected ? getUppercase(self.characters[index]) : getLowercase(self.characters[index]);

      $letter
        .removeClass('h5p-capital-letters-selected h5p-capital-letters-correct-letter h5p-capital-letters-wrong-letter h5p-capital-letters-missing-letter h5p-capital-letters-solution-letter')
        .html(escapeHtml(displayCharacter));

      if (!isSolution && isSelected) {
        $letter.addClass('h5p-capital-letters-wrong-letter');
      }
      else if (isSolution && !isSelected) {
        $letter.addClass('h5p-capital-letters-missing-letter');
      }
    });
  };

  H5P.CapitalLetters.prototype.applySolutionClasses = function () {
    var self = this;

    self.$letters.find('.h5p-capital-letters-letter').each(function () {
      var $letter = $(this);
      var index = parseInt($letter.attr('data-index'), 10);
      var isSolution = self.solutionIndexes.indexOf(index) !== -1;
      var displayCharacter = isSolution ? self.characters[index] : getLowercase(self.characters[index]);

      $letter
        .removeClass('h5p-capital-letters-correct-letter h5p-capital-letters-wrong-letter h5p-capital-letters-missing-letter h5p-capital-letters-solution-letter')
        .html(escapeHtml(displayCharacter));

      if (isSolution) {
        $letter.addClass('h5p-capital-letters-solution-letter');
      }
    });
  };

  H5P.CapitalLetters.prototype.updateControls = function () {
    var canCheck = !this.checked && this.selectedIndexes.length > 0;

    if (this.$checkButton) {
      this.$checkButton
        .toggle(!this.checked)
        .prop('disabled', !canCheck)
        .attr('aria-disabled', canCheck ? 'false' : 'true');
    }
    if (this.$retryButton) {
      this.$retryButton.toggle(!!this.checked && !!this.params.behaviour.showRetry);
    }
  };

  H5P.CapitalLetters.prototype.checkAnswer = function () {
    var self = this;
    var stats;

    if (self.checked) {
      return;
    }

    if (self.selectedIndexes.length === 0) {
      self.showNoAnswerFeedback();
      self.updateControls();
      self.trigger('resize');
      return;
    }

    self.checked = true;
    self.answerGiven = true;
    self.showingSolution = true;
    self.score = self.calculateScore();
    self.renderSolutionArea();
    stats = self.getStats();
    self.lastStats = stats;
    self.lastResult = {
      score: self.score,
      maxScore: self.maxScore,
      correct: stats.correct,
      wrong: stats.wrong,
      missing: stats.missing,
      success: self.score === self.maxScore && stats.wrong === 0 && stats.missing === 0
    };

    self.applyResultClasses();
    self.setResponseAreaLocked(true);
    self.showFeedback(stats);
    self.updateControls();

    self.emitXAPIResult(self.lastResult);
    self.trigger('resize');
  };

  H5P.CapitalLetters.prototype.showNoAnswerFeedback = function () {
    this.$feedback
      .removeClass('h5p-capital-letters-feedback-success h5p-capital-letters-feedback-failure')
      .addClass('h5p-capital-letters-feedback-failure')
      .html(
        '<div class="h5p-capital-letters-result-score">' +
        escapeHtml(this.params.l10n.noAnswerFeedback || defaults.l10n.noAnswerFeedback) +
        '</div>'
      );
  };

  H5P.CapitalLetters.prototype.showFeedback = function (stats) {
    var isPerfect = this.getScore() === this.getMaxScore() && stats.wrong === 0 && stats.missing === 0;
    var html = '';

    var scoreLine = replacePlaceholders(this.params.l10n.scoreText || defaults.l10n.scoreText, {
      score: this.getScore(),
      max: this.getMaxScore()
    });

    if (isPerfect) {
      html += '<div class="h5p-capital-letters-result-score">' +
        escapeHtml(this.params.l10n.correctFeedback || defaults.l10n.correctFeedback) +
        '</div>';
    }

    html +=
      '<div class="h5p-capital-letters-result-score">' + escapeHtml(scoreLine) + '</div>' +
      '<div class="h5p-capital-letters-result-details">' +
      createFeedbackDetailHtml(this.params.l10n.correctText || defaults.l10n.correctText, stats.correct, 'h5p-capital-letters-select-correct') +
      createFeedbackDetailHtml(this.params.l10n.wrongText || defaults.l10n.wrongText, stats.wrong, 'h5p-capital-letters-select-wrong') +
      createFeedbackDetailHtml(this.params.l10n.missingText || defaults.l10n.missingText, stats.missing, 'h5p-capital-letters-select-missing') +
      '</div>';

    this.$feedback
      .removeClass('h5p-capital-letters-feedback-success h5p-capital-letters-feedback-failure')
      .addClass(isPerfect ? 'h5p-capital-letters-feedback-success' : 'h5p-capital-letters-feedback-failure')
      .html(html);
  };

  H5P.CapitalLetters.prototype.toggleSolution = function () {
    if (!this.checked) {
      return;
    }

    this.showingSolution = !this.showingSolution;
    this.renderSolutionArea();

    this.setResponseAreaLocked(true);
    this.trigger('resize');
  };

  H5P.CapitalLetters.prototype.showSolutions = function () {
    if (!this.checked && this.getAnswerGiven()) {
      this.checkAnswer();
    }
    if (!this.checked) {
      return;
    }
    if (!this.showingSolution) {
      this.toggleSolution();
    }
  };

  H5P.CapitalLetters.prototype.resetTask = function () {
    this.selectedIndexes = [];
    this.answerGiven = false;
    this.checked = false;
    this.showingSolution = false;
    this.score = 0;
    this.lastStats = null;
    this.lastResult = null;

    if (this.$letters) {
      this.renderCharacters();
      this.setResponseAreaLocked(false);
    }
    if (this.$feedback) {
      this.$feedback
        .removeClass('h5p-capital-letters-feedback-success h5p-capital-letters-feedback-failure')
        .html('');
    }
    this.renderSolutionArea();
    this.updateControls();
    this.trigger('resize');
  };

  H5P.CapitalLetters.prototype.getAnswerGiven = function () {
    return !!this.answerGiven || this.selectedIndexes.length > 0;
  };

  H5P.CapitalLetters.prototype.getScore = function () {
    return this.checked ? this.score : this.calculateScore();
  };

  H5P.CapitalLetters.prototype.getMaxScore = function () {
    return this.maxScore;
  };

  H5P.CapitalLetters.prototype.getTitle = function () {
    var metadata = this.extras && this.extras.metadata;
    var title = metadata && metadata.title ? metadata.title : 'Suur algustäht';

    return H5P.createTitle ? H5P.createTitle(title) : title;
  };

  H5P.CapitalLetters.prototype.getDescription = function () {
    var description = stripTags(this.params.taskDescription || '').replace(/\s+/g, ' ').trim();

    return description || this.getTitle();
  };

  H5P.CapitalLetters.prototype.getLanguageTag = function () {
    var metadata = this.extras && this.extras.metadata;
    var language = (metadata && (metadata.defaultLanguage || metadata.language)) || 'et';
    var parts = String(language).replace('_', '-').split('-');

    if (!parts[0]) {
      return 'et';
    }

    parts[0] = parts[0].toLowerCase();
    if (parts[1]) {
      parts[1] = parts[1].toUpperCase();
    }

    return parts.length === 1 ? parts[0] : parts.join('-');
  };

  H5P.CapitalLetters.prototype.getXAPIData = function () {
    var event = this.getXAPIAnswerEvent();

    return event ? {
      statement: event.data.statement
    } : null;
  };

  H5P.CapitalLetters.prototype.getXAPIAnswerEvent = function (result) {
    var event;
    var statementResult;

    result = result || this.lastResult || this.evaluateResult();
    event = this.createXAPIEvent('answered');

    if (!event || !event.data || !event.data.statement) {
      return null;
    }

    if (typeof event.setScoredResult === 'function') {
      event.setScoredResult(result.score, result.maxScore, this, true, result.success);
    }

    statementResult = event.data.statement.result = event.data.statement.result || {};
    statementResult.response = this.getXAPIResponse();
    statementResult.completion = true;
    statementResult.success = !!result.success;
    statementResult.score = statementResult.score || {};
    statementResult.score.raw = result.score;
    statementResult.score.max = result.maxScore;
    statementResult.score.min = 0;
    statementResult.score.scaled = result.maxScore > 0 ? result.score / result.maxScore : 0;

    return event;
  };

  H5P.CapitalLetters.prototype.createXAPIEvent = function (verb) {
    var event;
    var definition;

    if (typeof this.createXAPIEventTemplate === 'function') {
      event = this.createXAPIEventTemplate(verb);
    }
    else if (H5P.XAPIEvent) {
      event = new H5P.XAPIEvent(verb);
    }

    if (!event || !event.data || !event.data.statement) {
      return null;
    }

    if (typeof event.getVerifiedStatementValue === 'function') {
      definition = event.getVerifiedStatementValue(['object', 'definition']);
    }
    else {
      event.data.statement.object = event.data.statement.object || {};
      definition = event.data.statement.object.definition = event.data.statement.object.definition || {};
    }

    extendObject(definition, this.getxAPIDefinition());

    return event;
  };

  H5P.CapitalLetters.prototype.getxAPIDefinition = function () {
    var languageTag = this.getLanguageTag();
    var definition = {
      name: {},
      description: {},
      type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
      interactionType: 'fill-in',
      correctResponsesPattern: this.getXAPICorrectResponsesPattern()
    };

    definition.name[languageTag] = this.getTitle();
    definition.name['en-US'] = definition.name[languageTag];
    definition.description[languageTag] = this.getDescription();
    definition.description['en-US'] = definition.description[languageTag];

    return definition;
  };

  H5P.CapitalLetters.prototype.getXAPIResponse = function () {
    var self = this;

    return normalizeAnswer(this.characters.map(function (character, index) {
      if (!isLetter(character)) {
        return character;
      }
      return self.selectedIndexes.indexOf(index) !== -1 ? getUppercase(character) : getLowercase(character);
    }).join(''));
  };

  H5P.CapitalLetters.prototype.getXAPICorrectResponsesPattern = function () {
    return [normalizeAnswer(this.originalText)];
  };

  H5P.CapitalLetters.prototype.evaluateResult = function () {
    var stats = this.lastStats || this.getStats();
    var score = this.checked ? this.score : this.calculateScore();
    var maxScore = this.getMaxScore();

    return {
      score: score,
      maxScore: maxScore,
      correct: stats.correct || 0,
      wrong: stats.wrong || 0,
      missing: stats.missing || 0,
      success: score === maxScore && (stats.wrong || 0) === 0 && (stats.missing || 0) === 0
    };
  };

  H5P.CapitalLetters.prototype.emitXAPIResult = function (result) {
    var event;

    try {
      event = this.getXAPIAnswerEvent(result);
      if (event) {
        this.trigger(event);
      }
    }
    catch (e) {
      // Older H5P integrations may not expose all xAPI helpers for custom libraries.
    }
  };

  H5P.CapitalLetters.prototype.triggerAnswered = function (score, maxScore) {
    this.emitXAPIResult({
      score: score,
      maxScore: maxScore,
      wrong: Math.max(0, maxScore - score),
      success: score === maxScore
    });
  };


})(H5P, H5P.jQuery);
