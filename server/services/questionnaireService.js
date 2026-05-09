const questionnaireConfig = require("../../app/data/questionnaireConfig.json");

function getQuestionnaireConfig() {
  return {
    questionnaire_id: questionnaireConfig.questionnaire_id,
    questionnaire_name: questionnaireConfig.questionnaire_name,
    estimated_time: questionnaireConfig.estimated_time,
    opening_page: questionnaireConfig.opening_page,
    questionnaire_page: questionnaireConfig.questionnaire_page,
    result_page: questionnaireConfig.result_page,
    stages: questionnaireConfig.stages,
    questions: questionnaireConfig.questions,
    validation: questionnaireConfig.backend_validation_rules
  };
}

module.exports = { getQuestionnaireConfig };
