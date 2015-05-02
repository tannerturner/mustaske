function Question (data) {
  this.id           = data.id;
  this.asker        = data.asker;
  this.qestionTitle = data.qestionTitle;
  this.question     = data.question;
  this.comments     = [];
  this.voters       = [this.asker];
  this.score        = 0;
  this.time         = new Date().getTime();
};

Question.prototype.upvote = function(data) {
  if (data.voter in this.voters)
    return false

  ++this.score;
  return true;
}

module.exports = Question;
