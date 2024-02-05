const skills = require('../resources/cv/skills.json');

function handleRequest(request, res) {
  res.render('cv/index', {
    skills,
  });
}

module.exports = handleRequest;
