"use strict";
/**
 * Functions to interface with the DOM
 */
/**
 * This global, "static" object contains all functions for interacting with
 * the DOM. Additionally, all globals for DOM functions
 * are encapsulated here.
 */
var ViewActions = function () {

  var topQuestionsContainer, recentQuestionsContainer, MAX_TOP_QUESTIONS,
      BASE_SCORE, roomData, graph, owner;

  /**
   * Sets up the initial state of the page. When this function returns, the page
   * should be ready for the user
   */
  var setupUIImpl = function () {

    topQuestionsContainer    = $('#top-questions-container');
    recentQuestionsContainer = $('#recent-questions-container');
    MAX_TOP_QUESTIONS        = 5;
    BASE_SCORE               = 0;
    roomData                 = $('.room-name');
    owner                    = false;

    /**
     * Set up sorted container for top questions.
     * @see https://mixitup.kunkalabs.com/docs/#method-instantiate
     */
    topQuestionsContainer.mixItUp({
      layout: {
        display: 'block'
      },
      callbacks: {
        onMixEnd: checkMaxQuestions
      }
    });
  };

  /**
   * Actions for building graph in modal.
   * @see http://getbootstrap.com/javascript/#modals
   */
  var initializeGraphImpl = function () {
    var modal  = $(this);
    var canvas = modal.find('#pull-graph').get(0).getContext("2d");
    graph.createGraph(canvas);
  }

  /**
   * Enter the room as an owner
   * @param roomInfo = {room_id : string, room_name : string,
   * owner_id : string}
   */
  var enterRoomOwnerImpl = function (roomInfo) {
    if (!roomInfo) {
      $('#login-info .room-name-field').addClass('has-error');
    }
    else {
      $('#room-name-field').removeClass('has-error');
      roomData.html(roomInfo.room_name);
      roomData.data('room-id', roomInfo.room_id);
      roomData.data('owner', true);
      $('.drop-down-room-id').text(roomInfo.room_id);
      $('.login-overlay').addClass('animated slideOutUp');
      $('body').find('.owner-view').each(function () {
        $(this).removeClass('hidden').addClass('show');
      });

      owner = true;
      graph = new Graph();
      //$('#show-graph-btn').removeClass('hidden').addClass('show');
      console.log('Room Id: ' + roomInfo.room_id);
    }
  }

  /**
   * Enter the room as an audience member
   * @param roomInfo = {room_name : string, room_id : string,
   * questions : array, top_questions : array}
   */
  var enterRoomImpl = function (roomInfo) {

    if (!roomInfo) {
      $('#room-name-field').addClass('has-error');
    }
    else {
      var overlay = $('.login-overlay');
      $('#room-name-field').removeClass('has-error');
      roomData.text(roomInfo.room_name);
      roomData.data('room-id', roomInfo.room_id);
      $('.drop-down-room-id').text(roomInfo.room_id);
      overlay.addClass('animated slideOutUp');
      console.log('Room Id: ' + roomInfo.room_id);
      addAllQuestions(roomInfo)
    }
  }

  /**
   * Add all question to user screen. For when room is first joined.
   *
   * @param roomInfo = {room_name : string, room_id : string,
   * questions : array, top_questions : array}
   */
  var addAllQuestions = function(roomInfo) {

    var topQuestions = roomInfo.top_questions;
    var questions    = roomInfo.questions;

    if (questions.length !== 0) {
      $.each(questions, function(index, question) {
        question.class = 'recent-question';
        question.opt   = 'append';
        questionDiv(question);
      });
    }

    if (topQuestions.length !== 0) {
      $.each(topQuestions, function(index, question) {
        question.class = 'top-question';
        question.opt   = 'append';
        questionDiv(question);
      });
    }
    topQuestionsContainer.mixItUp('sort', 'score:desc');
  }

  /**
   * Return to the home screen
   */
  var showHomeScreenImpl = function () {
    // TODO
    $(".login-overlay")
      .removeClass('animated slideOutUp')
      .addClass('animated slideInDown');
  }

  /**
   * update UI reflecting top questions threshold updated
   * @param questions = [Question], New array of top questions
   */
  var updateTopQuestionThresholdImpl = function (questions) {
    // TODO: Implementation
  }

  /**
   * update UI reflecting a dismissed question
   * @param questionId = string, The ID of the dismissed question
   */
  var questionDismissedImpl = function (questionID) {
    var question = $('div[question_id="'+questionID+'"]');
    question.remove();

  }

  /**
   * Update UI reflecting a warning being issued
   * @param userId = string, the ID of the offending user
   */
  var userWarnedImpl = function (userID) {
    bootbox.alert('<h3><strong>Warning!!!!</strong> Must you really ask such a question?</h3>');
  }

  /**
   * Update UI reflecting a question being added
   * @param questionInfo = {question_id : string, question_text : string},
   * The ID of the question and the text content of the question
   */
  var questionAddedImpl = function (questionInfo) {
    questionInfo.class = 'recent-question';
    questionInfo.opt   = 'prepend';
    questionDiv(questionInfo);
  }

  /**
   * Update UI reflecting the score of a question changing
   * @param questionInfo = {question_id : string, question_text : string,
   * score : int}
   */
  var updateScoreImpl = function(questionInfo) {

    var question = $('[question_id="'+questionInfo.question_id+'"]');
    var score    = questionInfo.question_score;
    question.data('score', score);

    $('.num-votes', question).text(score);
    // Check if question is up voted
    if (score > BASE_SCORE) {
      if (!inTopQuestions(question))
        topQuestionAdded(questionInfo);
      else
      $("[question_id='"+questionInfo.question_id+"']",topQuestionsContainer)
        .removeClass('category-2')
        .addClass('category-1');
    }
    // Hide question from top question has score less than BASE_SCORE
    else if (inTopQuestions(question)) {
      $("[question_id='"+questionInfo.question_id+"']",topQuestionsContainer)
        .removeClass('category-1')
        .addClass('category-2');
    }
    //invoke mixItUp to sort the div
    topQuestionsContainer.mixItUp('filter', '.category-1');
    topQuestionsContainer.mixItUp('sort', 'score:desc');
  }

  /**
   * Returns true if question is in top questions.
   * @param question jQuery Object
   */
  var inTopQuestions = function (question) {
    return question.parent('#top-questions-container').length > 0;
  }

  var topQuestionAdded = function (topQuestionInfo) {
    var topQuestion =  $('[question_id='+ topQuestionInfo.question_id+']').clone();
    topQuestion.removeClass('recent-question animated pulse');
    topQuestion.addClass('top-question mix');
    topQuestion.addClass('category-1');
    //invoke mixItUp to sort the div
    topQuestionsContainer.mixItUp('append', topQuestion, {sort:'score:desc'});
    topQuestionsContainer.mixItUp('sort', 'score:desc');
  }

  /**
   * Call back for MixItUp top questions container. Removes excess question.
   *
   * @param state State Object from MixItUp
   * @see https://mixitup.kunkalabs.com/docs/#state-object
   */
  var checkMaxQuestions = function(state) {
    //var count = state.totalShow;
    //
    //for (; count > MAX_TOP_QUESTIONS; --count)
    //  $('.top-question:last').remove();
  }

  /**
   * Search callback
   */
  var searchRecentQuestionsImpl = function (event) {
    var term = $('#search-question-text').val();
    var recentQuestion = $('.recent-question');

    if (term === '') {
      recentQuestion.show();
      event.preventDefault();
      return;
    }

    recentQuestion.hide();
    recentQuestion.each(function(){
      if($(this).text().toUpperCase().indexOf(term.toUpperCase()) != -1){
        $(this).show();
      }
    });
    event.preventDefault();

  }

  /**
   * Callback for add question button
   */
  var addQuestionOnClickImpl = function (event) {
    var textBox = $('#add-question-text');
    var questionText = textBox.val();
    var data = {
      question_text: questionText,
      room_id: $('.room-name').data('room-id')
    };
    socket.emit('new question', data);
    textBox.val('');
    event.preventDefault();
  }

  /**
   * Callback for the home screen join and make buttons
   */
  var joinMakeOnClickImpl = function () {
    var textBox = $('#room-name-field input');
    var roomName = textBox.val();
    if (roomName === '') { // TODO: Validation
      $('#room-name-field').addClass('has-error');
    }
    else {
      var data = {
        option: $(this).text().toLowerCase().trim(),
        room_name: textBox.val()
      };

      switch (data.option) {
        case 'make':
          console.log('Creating new room.');
          socket.emit('create room', data.room_name);
          break;
        case 'join':
          console.log('Joining room.');
          socket.emit('join room', data.room_name);
          break;
      }
    }
  }

  /**
   * Update a field of the graph. Pass it the index of the sum of votes
   * and the new number of votes.
   * @param data = {key: data index number, value: number of votes}
   */
  var updateGraphImpl = function(data) {
    graph.updateValue(data.key, data.value);
  }

  /**
   * Makes calls to either recent questions or top questions div functions.
   * @param questionInfo
   */
  var questionDiv = function(questionInfo) {

    switch (questionInfo.class) {
    case 'recent-question':
      recentQuestionsDiv(questionInfo);
      break;
    case 'top-question':
      topQuestionsDiv(questionInfo);
      break;
    }
  }

  /**
   * Returns a string containing the HTML of a topquestion_section div.
   * See line 193 of /views/index.html for a template
   * @param questionInfo = {question_id : string, question_text : string,
   * question_score : int}
   * @returns result = string, the recentquestion_section div
   */
  var recentQuestionsDiv = function(questionInfo) {
    var container = '#recent-questions-container';
    var html      = recentQuestionTpl(questionInfo);
    attachQuestion(questionInfo, container, html);
  }

  /**
   * Returns a string containing the HTML of a to totalTopQuestion div.
   * See line 94 of /views/index.html for a template
   * @param TODO: params list
   */
  var topQuestionsDiv = function(questionInfo) {
    // Add mix class for sorting
    questionInfo.class += ' mix';
    var container       = $('#top-questions-container');
    var html  = topQuestionTpl(questionInfo);
    attachQuestion(questionInfo, container, html);

  }

  /**
   * Callback for the upvote button
   */
  var thumbsUpOnClickImpl = function () {
    var roomID     = roomData.data('room-id');
    var questionID = $(this).closest('.q').attr('question_id');
    var question   = $("[question_id='"+questionID+"']");
    var thumbsUp   = $('a.thumbs-up-to-active i', question);
    var thumbsDown = $('a.thumbs-down-to-active i', question);
    var upvoteInfo = {
      room_id     : roomID,
      question_id : questionID
    };

    if (thumbsUp.hasClass('fa-thumbs-o-up')) {
      thumbsUp.removeClass('fa-thumbs-o-up').addClass('fa-thumbs-up clicked');
      if (thumbsDown.hasClass('clicked')) {
        thumbsDown.removeClass('fa-thumbs-down clicked').addClass('fa-thumbs-o-down');
      }
    } else {
      thumbsUp.removeClass('fa-thumbs-up clicked').addClass('fa-thumbs-o-up');
    }

    socket.emit('upvote question', upvoteInfo);

  }

  /**
   * Callback for the downvote button
   */
  var thumbsDownOnClickImpl = function () {

    var roomID     = roomData.data('room-id');
    var questionID = $(this).closest('.q').attr('question_id');
    var question   = $("[question_id='"+questionID+"']");
    var thumbsDown = $('a.thumbs-down-to-active i', question);
    var thumbsUp   = $('a.thumbs-up-to-active i', question);

    if (thumbsDown.hasClass('fa-thumbs-o-down')) {
      thumbsDown.removeClass('fa-thumbs-o-down').addClass('fa-thumbs-down clicked');
      if (thumbsUp.hasClass('clicked')) {
        thumbsUp.removeClass('fa-thumbs-up clicked').addClass('fa-thumbs-o-up');
      }
    } else {
      thumbsDown.removeClass('fa-thumbs-down clicked').addClass('fa-thumbs-o-down');
    }

    var downvoteInfo = { // TODO: Implement
      room_id     : roomID,
      question_id : questionID
    };

    socket.emit('downvote question', downvoteInfo);
  }

  /**
   * Either appends or prepend question html to a given container.
   * @param questionInfo
   * @param container
   * @param html
   */
  var attachQuestion = function (questionInfo, container, html) {

    switch(questionInfo.opt) {
    case 'prepend':
      $(container).prepend(html);
      break;
    case 'append':
      $(container).append(html);
      break;
    }

    var question = $(' [question_id='+ questionInfo.question_id +']');

    if (questionInfo.class === 'recent-question')
      $(question, container).addClass('animated pulse');

    if (questionInfo.class.indexOf('top-question') > 0) {
      topQuestionsContainer.mixItUp('append', question, {sort:'score:desc'});
    }
  }
  /**
   * Sends out user vote for the poll.
   * TODO: find out which vote button user clicked
   */
  var votePollImpl = function () {
    var data = {
      room_id: $('.room-name').data('room-id'),
      option: $(this).text()
    };

    console.log(data);
    socket.emit('vote poll', data);
  }
  /**
   * Updates the poll results graph
   * TODO: update the graph
   */
  var updatePollScoreImpl = function (results) {
    console.log('voted');
    console.log(results);

    if (owner) {
      graph.updateData(results);
      graph.update();
    }
  }

  /**
   * Sets poll to active
   */
  var clickStartPollImpl = function () {
    var data = {
      room_id: $('.room-name').data('room-id'),
      active: true
    };
    socket.emit('set active poll', data);
  }

  /**
   * Sets poll to inactive
   */
  var clickStopPollImpl = function () {
    var data = {
      room_id: $('.room-name').data('room-id'),
      active: false
    };
    socket.emit('set active poll', data);
  }

  var startPollImpl = function () {
    console.log('poll active');

    if (!owner) {
      $('#clicker-modal').modal('show');
    }
  }

  /**
   * Sets poll to inactive
   */
  var stopPollImpl = function () {
    console.log('poll inactive');
    if (!owner) {
      $('#clicker-modal').modal('hide');
    }
  }

  var copyRoomIdImpl = function (event) {
    event.stopPropagation();
  }

  // TODO: Need Poll-related functions, when that functionality firms
  // up in the backend.



  return {
    copyRoomId                 : copyRoomIdImpl,
    initializeGraph            : initializeGraphImpl,
    thumbsDownOnClick          : thumbsDownOnClickImpl,
    thumbsUpOnClick            : thumbsUpOnClickImpl,
    joinMakeOnClick            : joinMakeOnClickImpl,
    addQuestionOnClick         : addQuestionOnClickImpl,
    searchRecentQuestions      : searchRecentQuestionsImpl,
    updateGraph                : updateGraphImpl,
    enterRoomOwner             : enterRoomOwnerImpl,
    enterRoom                  : enterRoomImpl,
    showHomeScreen             : showHomeScreenImpl,
    updateTopQuestionThreshold : updateTopQuestionThresholdImpl,
    updateScore                : updateScoreImpl,
    questionDismissed          : questionDismissedImpl,
    userWarned                 : userWarnedImpl,
    questionAdded              : questionAddedImpl,
    setupUI                    : setupUIImpl,
    votePoll                   : votePollImpl,
    updatePollScore            : updatePollScoreImpl,
    clickStartPoll             : clickStartPollImpl,
    clickStopPoll              : clickStopPollImpl,
    startPoll                  : startPollImpl,
    stopPoll                   : stopPollImpl
  }
}();
